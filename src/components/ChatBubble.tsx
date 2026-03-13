"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Cat, User } from "lucide-react";

interface Props {
  role: "user" | "assistant";
  content: string;
  isStreaming?: boolean;
  sticker?: string;
  gifUrl?: string | null;
}

/** Render *action text* with emerald styling */
function renderContent(text: string, isSiggy: boolean) {
  if (!isSiggy || !text) return text;
  return text.split(/(\*[^*]+\*)/).map((seg, i) =>
    seg.startsWith("*") && seg.endsWith("*") ? (
      <span key={i} className="siggy-action">{seg}</span>
    ) : (
      seg
    )
  );
}

const STICKERS = ["✨", "🔮", "🐾", "⚡", "🌟", "💫", "😼", "🌀", "🪐", "☄️", "🌙", "🐱"];

export default function ChatBubble({ role, content, isStreaming, sticker, gifUrl }: Props) {
  const isSiggy = role === "assistant";
  const [gifLoaded, setGifLoaded] = useState(false);

  const emoji = useMemo(
    () => sticker || STICKERS[Math.floor(Math.random() * STICKERS.length)],
    [sticker]
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, x: isSiggy ? -16 : 16 }}
      animate={{ opacity: 1, y: 0, x: 0 }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      className={`flex gap-3 ${isSiggy ? "justify-start" : "justify-end"}`}
    >
      {/* Siggy avatar */}
      {isSiggy && (
        <motion.div
          className="flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center mt-1 border-2 border-[var(--emerald)]/30 bg-[var(--emerald)]/5 relative"
          style={{ boxShadow: "0 0 15px rgba(0,255,159,0.15)" }}
          whileHover={{ scale: 1.15, rotate: 5 }}
        >
          <Cat className="w-4 h-4 text-[var(--emerald)]" />
          {/* Online indicator */}
          <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-[var(--emerald)] border-2 border-[var(--bg)]" />
        </motion.div>
      )}

      <div className="relative max-w-[80%] md:max-w-[68%]">
        {/* Bubble */}
        <motion.div
          className={`px-4 py-3 rounded-2xl text-[14px] md:text-[15px] leading-relaxed relative overflow-hidden ${
            isSiggy ? "bubble-siggy rounded-tl-sm" : "bubble-user rounded-tr-sm"
          }`}
          whileHover={{ scale: 1.005, transition: { duration: 0.15 } }}
          style={
            isStreaming && isSiggy
              ? { animation: "pulse-border 1.5s ease-in-out infinite" }
              : undefined
          }
        >
          {/* Message text */}
          {content ? (
            <span className="text-white">{renderContent(content, isSiggy)}</span>
          ) : isStreaming ? (
            <span className="inline-flex gap-2 py-1 px-1">
              <span className="typing-dot" />
              <span className="typing-dot" />
              <span className="typing-dot" />
            </span>
          ) : null}

          {/* Streaming cursor */}
          {isStreaming && content && (
            <motion.span
              className="inline-block w-[2px] h-[1.1em] bg-[var(--emerald)] ml-1 align-middle rounded-full"
              animate={{ opacity: [1, 0.2] }}
              transition={{ repeat: Infinity, duration: 0.5 }}
              style={{ boxShadow: "0 0 6px var(--emerald)" }}
            />
          )}

          {/* GIF */}
          {gifUrl && (
            <div className="mt-3 gif-frame max-w-[240px]">
              {!gifLoaded && (
                <div className="w-full h-32 bg-white/5 animate-pulse rounded-xl" />
              )}
              <img
                src={gifUrl}
                alt="Siggy reaction"
                className={`w-full rounded-xl ${gifLoaded ? "block" : "hidden"}`}
                onLoad={() => setGifLoaded(true)}
                loading="lazy"
              />
            </div>
          )}
        </motion.div>

        {/* Floating sticker for completed Siggy messages */}
        {isSiggy && content && !isStreaming && (
          <div className="absolute -top-3.5 -right-3 text-lg sticker-in select-none pointer-events-none drop-shadow-lg">
            {emoji}
          </div>
        )}
      </div>

      {/* User avatar */}
      {!isSiggy && (
        <motion.div
          className="flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center mt-1 border-2 border-[var(--purple)]/30 bg-[var(--purple)]/5"
          whileHover={{ scale: 1.15 }}
        >
          <User className="w-4 h-4 text-[var(--purple)]" />
        </motion.div>
      )}
    </motion.div>
  );
}
