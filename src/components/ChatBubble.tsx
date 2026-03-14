"use client";

import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
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
      initial={{ opacity: 0, y: 14, x: isSiggy ? -8 : 8 }}
      animate={{ opacity: 1, y: 0, x: 0 }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      className={`flex gap-3 group ${isSiggy ? "justify-start" : "justify-end"}`}
    >
      {/* Siggy avatar */}
      {isSiggy && (
        <div className="flex-shrink-0 mt-1">
          <div className="relative siggy-chat-avatar">
            <div className="siggy-avatar-inner">
              <span className="text-base">🐱</span>
            </div>
            {isStreaming && <div className="siggy-avatar-pulse" />}
            <span
              className="absolute -bottom-0.5 -right-0.5 online-dot"
              style={{ width: 6, height: 6, borderRadius: "50%", border: "1.5px solid var(--bg)" }}
            />
          </div>
        </div>
      )}

      <div className={`relative ${isSiggy ? "max-w-[85%] md:max-w-[75%]" : "max-w-[80%] md:max-w-[65%]"}`}>
        {/* Label with timestamp feel */}
        <div className={`flex items-center gap-1.5 mb-1.5 ${isSiggy ? "" : "justify-end"}`}>
          {isSiggy && (
            <span className="text-[10px] font-space font-bold tracking-[0.15em] text-[var(--emerald)]" style={{ opacity: 0.6 }}>
              SIGGY
            </span>
          )}
          {!isSiggy && (
            <span className="text-[10px] font-space font-medium tracking-[0.12em] text-[var(--text-muted)]">
              YOU
            </span>
          )}
          {isStreaming && isSiggy && (
            <Sparkles className="w-2.5 h-2.5 text-[var(--emerald)] animate-pulse" style={{ opacity: 0.5 }} />
          )}
        </div>

        {/* Text bubble */}
        <div
          className={`chat-bubble ${
            isSiggy
              ? "chat-bubble-siggy"
              : "chat-bubble-user"
          } ${isStreaming && isSiggy ? "streaming-pulse" : ""}`}
        >
          {/* Thinking state */}
          {isStreaming && !content && thinkingText && (
            <span className="text-[var(--text-muted)] text-[13px] flex items-center gap-2.5">
              <span className="flex gap-1">
                <span className="typing-dot" />
                <span className="typing-dot" />
                <span className="typing-dot" />
              </span>
              <span className="italic">{thinkingText}</span>
            </span>
          )}

          {/* Text content */}
          {content && (
            <span className={isSiggy ? "text-[var(--text)] chat-text-siggy" : "text-[var(--text)] chat-text-user"}>
              {content}
            </span>
          )}

          {/* Streaming cursor */}
          {isStreaming && content && (
            <motion.span
              className="inline-block w-[2px] h-[1em] bg-[var(--emerald)] ml-1 align-middle rounded-full"
              animate={{ opacity: [1, 0.1] }}
              transition={{ repeat: Infinity, duration: 0.5 }}
              style={{ boxShadow: "0 0 8px var(--emerald)" }}
            />
          )}
        </div>

        {/* GIF */}
        {hasGif && (
          <GifReaction gifId={gifId} searchQuery={gifQuery} onLoad={onGifLoad} />
        )}

        {/* Reactions */}
        {isSiggy && content && !isStreaming && <MessageReactions />}
      </div>

      {/* User avatar */}
      {!isSiggy && (
        <div className="flex-shrink-0 mt-1">
          <div className="user-chat-avatar">
            <span className="text-sm">👤</span>
          </div>
        </div>
      )}
    </motion.div>
  );
}
