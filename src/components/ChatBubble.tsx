"use client";

import { motion } from "framer-motion";
import { Cat, User } from "lucide-react";
import GifReaction from "./GifReaction";
import MessageReactions from "./MessageReactions";

interface Props {
  role: "user" | "assistant";
  content: string;
  isStreaming?: boolean;
  gifId?: string;
  gifQuery?: string;
  thinkingText?: string;
  onGifLoad?: () => void;
}

export default function ChatBubble({ role, content, isStreaming, gifId, gifQuery, thinkingText, onGifLoad }: Props) {
  const isSiggy = role === "assistant";
  const hasGif = !isStreaming && (gifId || gifQuery);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16, x: isSiggy ? -10 : 10 }}
      animate={{ opacity: 1, y: 0, x: 0 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className={`flex gap-3 group ${isSiggy ? "justify-start" : "justify-end"}`}
    >
      {isSiggy && (
        <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center mt-1 siggy-icon relative">
          <Cat className="w-4 h-4 text-[var(--emerald)]" />
          <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full bg-[var(--emerald)] border-[1.5px] border-[var(--bg)]" />
        </div>
      )}

      <div className="relative max-w-[82%] md:max-w-[70%]">
        {/* Text bubble */}
        <div
          className={`px-4 py-3 rounded-2xl text-[14.5px] leading-relaxed ${
            isSiggy ? "bubble-siggy rounded-tl-sm" : "bubble-user rounded-tr-sm"
          } ${isStreaming && isSiggy ? "streaming-pulse" : ""}`}
        >
          {/* Thinking state */}
          {isStreaming && !content && thinkingText && (
            <span className="text-[var(--text-muted)] text-[13px] flex items-center gap-2">
              <span className="typing-dot" />
              <span className="typing-dot" />
              <span className="typing-dot" />
              <span className="ml-1">{thinkingText}</span>
            </span>
          )}

          {/* Text */}
          {content && <span className="text-white">{content}</span>}

          {/* Cursor */}
          {isStreaming && content && (
            <motion.span
              className="inline-block w-[2px] h-[1em] bg-[var(--emerald)] ml-1 align-middle rounded-full"
              animate={{ opacity: [1, 0.15] }}
              transition={{ repeat: Infinity, duration: 0.45 }}
              style={{ boxShadow: "0 0 6px var(--emerald)" }}
            />
          )}
        </div>

        {/* GIF — always BELOW the text bubble, never inline */}
        {hasGif && (
          <GifReaction gifId={gifId} searchQuery={gifQuery} onLoad={onGifLoad} />
        )}

        {/* Reactions */}
        {isSiggy && content && !isStreaming && <MessageReactions />}
      </div>

      {!isSiggy && (
        <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center mt-1 user-icon">
          <User className="w-4 h-4 text-[var(--purple)]" />
        </div>
      )}
    </motion.div>
  );
}
