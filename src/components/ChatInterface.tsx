"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, RotateCcw, Cat, ChevronRight, Zap, Flame, Sun, CircleHelp, Users, Compass } from "lucide-react";
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

const STORAGE_KEY = "siggy-chat-v6";
const TYPING_SPEED = 12;

const SUGGESTIONS = [
  { text: "What is Ritual?", emoji: "\uD83D\uDD2E", icon: CircleHelp },
  { text: "Who founded Ritual?", emoji: "\uD83D\uDC64", icon: Users },
  { text: "Tell me about Infernet", emoji: "\u26A1", icon: Zap },
  { text: "Roast me", emoji: "\uD83D\uDD25", icon: Flame },
  { text: "gm", emoji: "\u2600\uFE0F", icon: Sun },
  { text: "Who is Siggy?", emoji: "\uD83D\uDC31", icon: Cat },
  { text: "Who are the mods?", emoji: "\uD83D\uDEE1\uFE0F", icon: Users },
  { text: "Open portal", emoji: "\uD83C\uDF00", icon: Compass },
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
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const scrollDuringStream = useCallback(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    const t = setInterval(() => setPlaceholder(INPUT_PLACEHOLDERS[Math.floor(Math.random() * INPUT_PLACEHOLDERS.length)]), 5000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    if (!isStreaming) return;
    setThinkingText(THINKING_MESSAGES[Math.floor(Math.random() * THINKING_MESSAGES.length)]);
    const t = setInterval(() => setThinkingText(THINKING_MESSAGES[Math.floor(Math.random() * THINKING_MESSAGES.length)]), 1500);
    return () => clearInterval(t);
  }, [isStreaming]);

  const burst = useCallback(() => {
    confetti({
      particleCount: 40, spread: 70, origin: { y: 0.6 },
      colors: ["#00ff9f", "#bf5af2", "#00d4ff", "#ff2d55", "#ffd60a"],
      shapes: ["star", "circle"], ticks: 50, gravity: 0.7,
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

      if (calculateChaosScore(buffer) > 10) burst();

      // GIF — ~50% of the time
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
        style: { background: "rgba(10,10,31,0.95)", color: "#ff2d55", border: "1px solid rgba(255,45,85,0.2)" },
        icon: "\uD83C\uDF00",
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
    toast("New dimension loaded.", {
      style: { background: "rgba(10,10,31,0.95)", color: "#00d4ff", border: "1px solid rgba(0,212,255,0.15)" },
      icon: "\u2728",
    });
  };

  const lastSiggy = [...messages].reverse().find((m) => m.role === "assistant")?.content || "";

  return (
    <div className="flex flex-col flex-1 min-h-0 w-full">
      {/* Message area */}
      <div className="flex-1 overflow-y-auto px-3 md:px-6 py-5 space-y-5 min-h-0">
        <AnimatePresence mode="popLayout">
          {/* ═══ WELCOME SCREEN ═══ */}
          {!messages.length && (
            <motion.div
              key="welcome"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, scale: 0.97, y: -20 }}
              transition={{ duration: 0.4 }}
              className="flex flex-col items-center justify-center gap-6 pt-[8vh] md:pt-[10vh]"
            >
              {/* Siggy Avatar with cosmic effects */}
              <motion.div
                className="relative flex items-center justify-center"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
              >
                <div className="siggy-welcome-glow" />

                {/* Orbiting particles */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="orbit-particle orbit-particle-1" />
                  <div className="orbit-particle orbit-particle-2" style={{ background: "var(--purple)", boxShadow: "0 0 6px var(--purple)" }} />
                  <div className="orbit-particle orbit-particle-3" style={{ background: "var(--cyan)", boxShadow: "0 0 6px var(--cyan)" }} />
                </div>

                <SiggyAvatar chaosLevel={0} isTyping={false} size="lg" />
              </motion.div>

              {/* Text content */}
              <motion.div
                className="text-center space-y-3 max-w-md"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
              >
                <div className="flex items-center justify-center gap-2 mb-3">
                  <div className="welcome-tag">
                    <span className="online-dot" style={{ width: 4, height: 4 }} />
                    <span>ONLINE</span>
                  </div>
                  <div className="welcome-tag">
                    <span>DIM-7</span>
                  </div>
                  <div className="welcome-tag" style={{ borderColor: "rgba(191,90,242,0.08)", color: "rgba(191,90,242,0.45)", background: "rgba(191,90,242,0.04)" }}>
                    <span>(\u2756,\u2756)</span>
                  </div>
                </div>

                <h2 className="font-space text-2xl md:text-3xl font-bold tracking-tight">
                  <span className="gradient-text">What&apos;s good, mortal?</span>
                </h2>
                <p className="text-sm text-[var(--text-muted)] leading-relaxed max-w-sm mx-auto">
                  I&apos;m Siggy &mdash; cosmic cat oracle of the Ritual multiverse.
                  Ask me anything about Ritual, crypto, or life.
                  Fair warning: I bite.
                </p>

                <div className="welcome-divider max-w-[200px] mx-auto mt-4" />
              </motion.div>

              {/* Suggestion grid */}
              <motion.div
                className="grid grid-cols-2 md:grid-cols-4 gap-2.5 max-w-lg w-full px-2"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.5 }}
              >
                {SUGGESTIONS.map(({ text, emoji, icon: Icon }, idx) => (
                  <motion.button
                    key={text}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.55 + idx * 0.05 }}
                    whileHover={{ scale: 1.03, y: -2 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => handleSend(text)}
                    className="suggestion-chip justify-center text-center flex-col gap-1 py-3"
                  >
                    <div className="flex items-center gap-1.5">
                      <Icon className="w-3 h-3" style={{ opacity: 0.5 }} />
                      <span className="text-xs font-medium">{text}</span>
                    </div>
                  </motion.button>
                ))}
              </motion.div>

              {/* Subtle hint */}
              <motion.p
                className="text-[10px] font-space text-white/15 tracking-[0.15em] uppercase mt-2"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.2, duration: 0.8 }}
              >
                Type a message or choose a prompt
              </motion.p>
            </motion.div>
          )}

          {/* ═══ MESSAGES ═══ */}
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

      {/* ═══ INPUT AREA ═══ */}
      <div className="px-3 md:px-6 pb-3 pt-2 relative">
        {/* Gradient top edge */}
        <div className="absolute top-0 left-0 right-0 h-px" style={{
          background: "linear-gradient(90deg, transparent, rgba(0,255,159,0.06), rgba(191,90,242,0.04), transparent)"
        }} />

        <div className="flex items-center gap-2">
          {/* Clear button */}
          {messages.length > 0 && (
            <motion.button
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              whileHover={{ scale: 1.1, rotate: -15 }}
              whileTap={{ scale: 0.9 }}
              onClick={clear}
              className="flex-shrink-0 p-2.5 rounded-xl glass text-[var(--text-muted)] hover:text-[var(--pink)] transition-all duration-300"
              title="New dimension"
            >
              <RotateCcw className="w-4 h-4" />
            </motion.button>
          )}

          {/* Input field with terminal aesthetic */}
          <div className="flex-1 flex items-center glass-card rounded-2xl overflow-hidden input-wrap relative">
            <div className="input-glow-line" />

            {/* Terminal prefix */}
            <div className="flex items-center gap-1 ml-4 flex-shrink-0">
              <ChevronRight className="w-3.5 h-3.5 text-[var(--emerald)]" style={{ opacity: 0.3 }} />
            </div>

            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
              placeholder={placeholder}
              className="flex-1 bg-transparent px-3 py-3.5 text-sm text-white placeholder:text-[var(--text-muted)] focus:outline-none font-sans"
              autoComplete="off"
            />

            {/* Send button */}
            <motion.button
              whileHover={{ scale: 1.15 }}
              whileTap={{ scale: 0.85 }}
              onClick={() => handleSend()}
              disabled={isStreaming || !input.trim()}
              className="p-3.5 transition-all duration-300 disabled:opacity-10"
              style={{
                color: input.trim() ? "var(--emerald)" : "var(--text-muted)",
                filter: input.trim() ? "drop-shadow(0 0 8px var(--emerald))" : "none",
              }}
            >
              <Send className="w-4 h-4" />
            </motion.button>
          </div>

          {/* Share button */}
          <ShareButton lastResponse={lastSiggy} />
        </div>
      </div>
    </div>
  );
}
