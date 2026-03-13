"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, RotateCcw, Sparkles } from "lucide-react";
import confetti from "canvas-confetti";
import toast from "react-hot-toast";
import ChatBubble from "./ChatBubble";
import ShareButton from "./ShareButton";
import SiggyAvatar from "./SiggyAvatar";
import { gf } from "@/lib/giphy";
import { EASTER_EGG_TRIGGERS, THINKING_MESSAGES, INPUT_PLACEHOLDERS } from "@/lib/constants";
import { generateId, calculateChaosScore, getGifQuery } from "@/lib/utils";

export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  gifId?: string;
  gifQuery?: string;
}

interface Props {
  onPortalTrigger: () => void;
}

const STORAGE_KEY = "siggy-chat-v5";
const TYPING_SPEED = 12;

const SUGGESTIONS = [
  { text: "What is Ritual?", emoji: "🔮" },
  { text: "Tell me a joke", emoji: "😹" },
  { text: "Roast me", emoji: "🔥" },
  { text: "Open portal", emoji: "🌀" },
  { text: "ETH price?", emoji: "📈" },
  { text: "gm", emoji: "☀️" },
];

export default function ChatInterface({ onPortalTrigger }: Props) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [thinkingText, setThinkingText] = useState("");
  const [placeholder, setPlaceholder] = useState(INPUT_PLACEHOLDERS[0]);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    try { const s = localStorage.getItem(STORAGE_KEY); if (s) setMessages(JSON.parse(s)); } catch {}
  }, []);
  useEffect(() => {
    if (messages.length) localStorage.setItem(STORAGE_KEY, JSON.stringify(messages.slice(-60)));
  }, [messages]);
  // Scroll to bottom whenever messages change (new messages OR content updates during streaming)
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Also scroll during streaming as content grows
  const scrollDuringStream = useCallback(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  // Rotate placeholder
  useEffect(() => {
    const t = setInterval(() => setPlaceholder(INPUT_PLACEHOLDERS[Math.floor(Math.random() * INPUT_PLACEHOLDERS.length)]), 5000);
    return () => clearInterval(t);
  }, []);

  // Rotate thinking text
  useEffect(() => {
    if (!isStreaming) return;
    setThinkingText(THINKING_MESSAGES[Math.floor(Math.random() * THINKING_MESSAGES.length)]);
    const t = setInterval(() => setThinkingText(THINKING_MESSAGES[Math.floor(Math.random() * THINKING_MESSAGES.length)]), 1500);
    return () => clearInterval(t);
  }, [isStreaming]);

  const burst = useCallback(() => {
    confetti({
      particleCount: 50, spread: 80, origin: { y: 0.6 },
      colors: ["#00ff9f", "#bf5af2", "#00d4ff", "#ff2d55", "#ffd60a"],
      shapes: ["star", "circle"], ticks: 60, gravity: 0.6,
    });
  }, []);

  const handleSend = async (overrideText?: string) => {
    const trimmed = (overrideText || input).trim();
    if (!trimmed || isStreaming) return;

    if (EASTER_EGG_TRIGGERS.some((t) => trimmed.toLowerCase().includes(t))) {
      onPortalTrigger();
      burst();
    }

    const userMsg: Message = { id: generateId(), role: "user", content: trimmed };
    const siggyId = generateId();

    setMessages((p) => [...p, userMsg, { id: siggyId, role: "assistant", content: "" }]);
    setInput("");
    setIsStreaming(true);

    let buffer = "";
    let charIdx = 0;
    let streamDone = false;
    let timer: ReturnType<typeof setInterval> | null = null;

    try {
      const history = [...messages, userMsg].map((m) => ({ role: m.role, content: m.content }));
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: history }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      let scrollTick = 0;
      timer = setInterval(() => {
        if (charIdx < buffer.length) {
          const ch = buffer[charIdx];
          const step = ch === " " ? 3 : ch === "\n" ? 4 : 1;
          charIdx = Math.min(charIdx + step, buffer.length);
          setMessages((p) => p.map((m) => (m.id === siggyId ? { ...m, content: buffer.slice(0, charIdx) } : m)));
          // Scroll every few ticks to keep up
          if (++scrollTick % 5 === 0) scrollDuringStream();
        } else if (streamDone && timer) {
          clearInterval(timer);
          timer = null;
          setMessages((p) => p.map((m) => (m.id === siggyId ? { ...m, content: buffer } : m)));
          scrollDuringStream();
        }
      }, TYPING_SPEED);

      const reader = res.body!.getReader();
      const decoder = new TextDecoder();
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        for (const line of decoder.decode(value, { stream: true }).split("\n")) {
          if (!line.startsWith("data: ") || line === "data: [DONE]") continue;
          try { const { content: c } = JSON.parse(line.slice(6)); if (c) buffer += c; } catch {}
        }
      }
      streamDone = true;

      await new Promise<void>((resolve) => {
        const w = setInterval(() => { if (charIdx >= buffer.length) { clearInterval(w); resolve(); } }, 20);
      });

      // Effects
      if (calculateChaosScore(buffer) > 10) burst();

      // GIF — ~50% of the time for variety
      if (gf && Math.random() < 0.5) {
        const query = getGifQuery(buffer);
        try {
          const { data } = await gf.search(query, { limit: 12, rating: "pg" as any, type: "gifs" as any });
          if (data.length) {
            const picked = data[Math.floor(Math.random() * data.length)];
            setMessages((p) => p.map((m) => (m.id === siggyId ? { ...m, gifId: String(picked.id) } : m)));
          } else {
            setMessages((p) => p.map((m) => (m.id === siggyId ? { ...m, gifQuery: query } : m)));
          }
        } catch {
          setMessages((p) => p.map((m) => (m.id === siggyId ? { ...m, gifQuery: query } : m)));
        }
      }
    } catch {
      if (timer) clearInterval(timer);
      toast.error("Siggy got lost between dimensions!", {
        style: { background: "#0c0c30", color: "#ff2d55", border: "1px solid rgba(255,45,85,0.3)" },
        icon: "🌀",
      });
      setMessages((p) => p.filter((m) => m.id !== siggyId));
    } finally {
      if (timer) clearInterval(timer);
      setIsStreaming(false);
      inputRef.current?.focus();
    }
  };

  const clear = () => {
    setMessages([]);
    localStorage.removeItem(STORAGE_KEY);
    toast("✨ New dimension loaded.", {
      style: { background: "#0c0c30", color: "#00d4ff", border: "1px solid rgba(0,212,255,0.2)" },
    });
  };

  const lastSiggy = [...messages].reverse().find((m) => m.role === "assistant")?.content || "";

  return (
    <div className="flex flex-col flex-1 min-h-0 w-full">
      <div className="flex-1 overflow-y-auto px-3 md:px-6 py-4 space-y-5 min-h-0">
        <AnimatePresence mode="popLayout">
          {!messages.length && (
            <motion.div
              key="welcome"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="flex flex-col items-center justify-center gap-6 py-10"
            >
              <SiggyAvatar chaosLevel={0} isTyping={false} size="lg" />
              <div className="text-center">
                <motion.p className="font-space text-lg font-bold text-white" animate={{ opacity: [0.5, 1, 0.5] }} transition={{ repeat: Infinity, duration: 3 }}>
                  The cosmic oracle awaits.
                </motion.p>
                <p className="text-sm text-[var(--text-muted)] mt-1">Ask anything. Prepare for chaos.</p>
              </div>
              <div className="flex flex-wrap gap-2 justify-center max-w-sm">
                {SUGGESTIONS.map(({ text, emoji }) => (
                  <motion.button key={text} whileHover={{ scale: 1.06, y: -2 }} whileTap={{ scale: 0.95 }}
                    onClick={() => handleSend(text)}
                    className="px-3 py-2 rounded-xl glass text-xs text-[var(--text-secondary)] hover:text-[var(--emerald)] transition-all duration-300 flex items-center gap-1.5 hover:glow-emerald"
                  >
                    <span>{emoji}</span><span>{text}</span>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}
          {messages.map((msg) => (
            <ChatBubble
              key={msg.id}
              role={msg.role}
              content={msg.content}
              gifId={msg.gifId}
              gifQuery={msg.gifQuery}
              thinkingText={thinkingText}
              isStreaming={isStreaming && msg.role === "assistant" && msg.id === messages[messages.length - 1]?.id}
              onGifLoad={scrollDuringStream}
            />
          ))}
        </AnimatePresence>
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="px-3 md:px-6 pb-4 pt-2 relative">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-px bg-gradient-to-r from-transparent via-[var(--emerald)]/10 to-transparent" />
        <div className="flex items-center gap-2">
          {messages.length > 0 && (
            <motion.button initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} whileHover={{ scale: 1.1, rotate: -15 }} whileTap={{ scale: 0.9 }}
              onClick={clear} className="flex-shrink-0 p-2.5 rounded-xl glass text-[var(--text-muted)] hover:text-[var(--pink)] transition-all"
            >
              <RotateCcw className="w-4 h-4" />
            </motion.button>
          )}
          <div className="flex-1 flex items-center glass-card rounded-2xl overflow-hidden input-wrap transition-all duration-300">
            <Sparkles className="w-4 h-4 text-[var(--emerald)]/30 ml-4 flex-shrink-0" />
            <input ref={inputRef} type="text" value={input} onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
              placeholder={placeholder}
              className="flex-1 bg-transparent px-3 py-4 text-sm text-white placeholder:text-[var(--text-muted)] focus:outline-none" autoComplete="off"
            />
            <motion.button whileHover={{ scale: 1.2 }} whileTap={{ scale: 0.85 }} onClick={() => handleSend()} disabled={isStreaming || !input.trim()}
              className="p-4 transition-all disabled:opacity-10"
              style={{ color: input.trim() ? "var(--emerald)" : "var(--text-muted)", filter: input.trim() ? "drop-shadow(0 0 8px var(--emerald))" : "none" }}
            >
              <Send className="w-5 h-5" />
            </motion.button>
          </div>
          <ShareButton lastResponse={lastSiggy} />
        </div>
      </div>
    </div>
  );
}
