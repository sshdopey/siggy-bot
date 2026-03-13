"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, RotateCcw, Sparkles } from "lucide-react";
import confetti from "canvas-confetti";
import toast from "react-hot-toast";
import ChatBubble from "./ChatBubble";
import ShareButton from "./ShareButton";
import SiggyAvatar from "./SiggyAvatar";
import { type SiggyMode, EASTER_EGG_TRIGGERS } from "@/lib/constants";
import { generateId, calculateChaosScore, detectMood, getGifQuery } from "@/lib/utils";

export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  sticker?: string;
  gifUrl?: string | null;
}

interface Props {
  mode: SiggyMode;
  chaosLevel: number;
  onChaosChange: (d: number) => void;
  onPortalTrigger: () => void;
  onStreamingChange: (s: boolean) => void;
}

const STORAGE_KEY = "siggy-chat-v3";
const STICKERS = ["✨", "🔮", "🐾", "⚡", "🌟", "💫", "😼", "🌀", "🪐", "☄️", "🌙", "🐱"];
const TYPING_SPEED = 18; // ms per character — natural typing feel

const SUGGESTIONS = [
  { text: "What is Ritual?", emoji: "🔮" },
  { text: "Tell me a cosmic joke", emoji: "😹" },
  { text: "Roast my code", emoji: "🔥" },
  { text: "Open portal", emoji: "🌀" },
  { text: "What's ETH price?", emoji: "📈" },
  { text: "Unhinge me", emoji: "⚡" },
  { text: "What's the meaning of life?", emoji: "🧠" },
  { text: "gm", emoji: "☀️" },
];

export default function ChatInterface({ mode, chaosLevel, onChaosChange, onPortalTrigger, onStreamingChange }: Props) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  // Load / save history
  useEffect(() => {
    try {
      const s = localStorage.getItem(STORAGE_KEY);
      if (s) setMessages(JSON.parse(s));
    } catch {}
  }, []);

  useEffect(() => {
    if (messages.length) localStorage.setItem(STORAGE_KEY, JSON.stringify(messages.slice(-80)));
  }, [messages]);

  // Auto-scroll
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const burst = useCallback((size: "sm" | "md" | "lg") => {
    const map = { sm: 30, md: 70, lg: 180 };
    confetti({
      particleCount: map[size],
      spread: size === "lg" ? 160 : 80,
      origin: { y: 0.6 },
      colors: ["#00ff9f", "#bf5af2", "#00d4ff", "#ff2d55", "#ffd60a"],
      shapes: ["star", "circle"],
      ticks: 80,
      gravity: 0.6,
    });
  }, []);

  /** Fetch a GIF for the mood (~50% chance for variety) */
  const fetchGif = useCallback(async (text: string): Promise<string | null> => {
    if (Math.random() > 0.5) return null; // skip sometimes for variety
    try {
      const mood = detectMood(text);
      const q = getGifQuery(mood);
      const res = await fetch(`/api/gif?q=${encodeURIComponent(q)}`);
      const { url } = await res.json();
      return url || null;
    } catch {
      return null;
    }
  }, []);

  const handleSend = async (overrideText?: string) => {
    const trimmed = (overrideText || input).trim();
    if (!trimmed || isStreaming) return;

    // Easter egg
    if (EASTER_EGG_TRIGGERS.some((t) => trimmed.toLowerCase().includes(t))) {
      onPortalTrigger();
      onChaosChange(40);
      burst("lg");
    }

    const userMsg: Message = { id: generateId(), role: "user", content: trimmed };
    const siggyId = generateId();
    const sticker = STICKERS[Math.floor(Math.random() * STICKERS.length)];

    setMessages((prev) => [...prev, userMsg, { id: siggyId, role: "assistant", content: "", sticker }]);
    setInput("");
    setIsStreaming(true);
    onStreamingChange(true);

    let fullBuffer = "";
    let charIndex = 0;
    let streamDone = false;
    let typingTimer: ReturnType<typeof setInterval> | null = null;

    try {
      const history = [...messages, userMsg].map((m) => ({ role: m.role, content: m.content }));
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: history, mode }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      // Start the typing interval — reveals chars from buffer at natural speed
      typingTimer = setInterval(() => {
        if (charIndex < fullBuffer.length) {
          // Speed through spaces, slow on punctuation
          const ch = fullBuffer[charIndex];
          const step = ch === " " ? 2 : ch === "\n" ? 3 : 1;
          charIndex = Math.min(charIndex + step, fullBuffer.length);
          const visible = fullBuffer.slice(0, charIndex);
          setMessages((prev) => prev.map((m) => (m.id === siggyId ? { ...m, content: visible } : m)));
        } else if (streamDone) {
          if (typingTimer) clearInterval(typingTimer);
          typingTimer = null;
          // Ensure final complete content
          setMessages((prev) => prev.map((m) => (m.id === siggyId ? { ...m, content: fullBuffer } : m)));
        }
      }, TYPING_SPEED);

      // Stream chunks into buffer
      const reader = res.body!.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        for (const line of chunk.split("\n")) {
          if (!line.startsWith("data: ") || line === "data: [DONE]") continue;
          try {
            const { content: c, error } = JSON.parse(line.slice(6));
            if (error) throw new Error(error);
            if (c) fullBuffer += c;
          } catch {}
        }
      }

      streamDone = true;

      // Wait for typing to finish revealing all characters
      await new Promise<void>((resolve) => {
        const wait = setInterval(() => {
          if (charIndex >= fullBuffer.length) {
            clearInterval(wait);
            resolve();
          }
        }, 50);
      });

      // Post-response: chaos + effects + GIF
      const chaos = calculateChaosScore(fullBuffer);
      onChaosChange(chaos);
      if (chaos > 15 || chaosLevel > 75) burst("md");
      else if (chaos > 8) burst("sm");

      // Try to fetch a GIF reaction
      const gifUrl = await fetchGif(fullBuffer);
      if (gifUrl) {
        setMessages((prev) => prev.map((m) => (m.id === siggyId ? { ...m, gifUrl } : m)));
      }
    } catch {
      if (typingTimer) clearInterval(typingTimer);
      toast.error("Siggy got lost between dimensions! Try again.", {
        style: { background: "#0c0c30", color: "#ff2d55", border: "1px solid rgba(255,45,85,0.3)" },
        icon: "🌀",
      });
      setMessages((prev) => prev.filter((m) => m.id !== siggyId));
    } finally {
      if (typingTimer) clearInterval(typingTimer);
      setIsStreaming(false);
      onStreamingChange(false);
      inputRef.current?.focus();
    }
  };

  const clearChat = () => {
    setMessages([]);
    localStorage.removeItem(STORAGE_KEY);
    onChaosChange(-100);
    toast("✨ Reality reset. New dimension loaded.", {
      style: { background: "#0c0c30", color: "#00d4ff", border: "1px solid rgba(0,212,255,0.3)" },
    });
  };

  const lastSiggy = [...messages].reverse().find((m) => m.role === "assistant")?.content || "";
  const hasMessages = messages.length > 0;

  return (
    <div className="flex flex-col flex-1 min-h-0 w-full">
      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-3 md:px-6 py-4 space-y-5 min-h-0">
        <AnimatePresence mode="popLayout">
          {!hasMessages && (
            <motion.div
              key="welcome"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="flex flex-col items-center justify-center gap-6 py-8 md:py-12"
            >
              <SiggyAvatar chaosLevel={0} isTyping={false} size="lg" />

              <div className="text-center space-y-1">
                <motion.p
                  className="font-space text-lg md:text-xl font-bold text-white"
                  animate={{ opacity: [0.6, 1, 0.6] }}
                  transition={{ repeat: Infinity, duration: 3 }}
                >
                  The cosmic oracle awaits, mortal.
                </motion.p>
                <p className="text-sm text-[var(--text-muted)]">
                  Ask anything. Prepare for chaos.
                </p>
              </div>

              <div className="flex flex-wrap gap-2 justify-center max-w-md">
                {SUGGESTIONS.map(({ text, emoji }) => (
                  <motion.button
                    key={text}
                    whileHover={{ scale: 1.06, y: -3 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleSend(text)}
                    className="px-3.5 py-2 rounded-xl glass text-[12px] text-[var(--text-secondary)] hover:text-[var(--emerald)] hover:border-[var(--emerald)]/30 transition-all duration-300 flex items-center gap-1.5 hover:glow-emerald"
                  >
                    <span>{emoji}</span>
                    <span>{text}</span>
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
              sticker={msg.sticker}
              gifUrl={msg.gifUrl}
              isStreaming={isStreaming && msg.role === "assistant" && msg.id === messages[messages.length - 1]?.id}
            />
          ))}
        </AnimatePresence>
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="px-3 md:px-6 pb-4 pt-2 relative">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-px bg-gradient-to-r from-transparent via-[var(--emerald)]/15 to-transparent" />

        <div className="flex items-center gap-2">
          {hasMessages && (
            <motion.button
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              whileHover={{ scale: 1.12, rotate: -15 }}
              whileTap={{ scale: 0.9 }}
              onClick={clearChat}
              className="flex-shrink-0 p-2.5 rounded-xl glass text-[var(--text-muted)] hover:text-[var(--pink)] transition-all"
              title="Reset dimension"
            >
              <RotateCcw className="w-4 h-4" />
            </motion.button>
          )}

          <div className="flex-1 flex items-center glass-card rounded-2xl overflow-hidden input-wrap transition-all duration-300">
            <Sparkles className="w-4 h-4 text-[var(--emerald)]/30 ml-4 flex-shrink-0" />
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
              placeholder="Speak to the cosmic oracle..."
              disabled={isStreaming}
              className="flex-1 bg-transparent px-3 py-4 text-sm text-white placeholder:text-[var(--text-muted)] focus:outline-none disabled:opacity-40"
              autoComplete="off"
            />
            <motion.button
              whileHover={{ scale: 1.2 }}
              whileTap={{ scale: 0.85 }}
              onClick={() => handleSend()}
              disabled={isStreaming || !input.trim()}
              className="p-4 transition-all disabled:opacity-10"
              style={{
                color: input.trim() ? "var(--emerald)" : "var(--text-muted)",
                filter: input.trim() ? "drop-shadow(0 0 8px var(--emerald))" : "none",
              }}
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
