"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const REACTIONS = [
  { emoji: "😂", label: "Haha" },
  { emoji: "🔥", label: "Fire" },
  { emoji: "💀", label: "Dead" },
  { emoji: "🐱", label: "Cat" },
  { emoji: "✨", label: "Vibe" },
  { emoji: "👀", label: "Eyes" },
];

export default function MessageReactions() {
  const [active, setActive] = useState<Map<string, number>>(new Map());

  const toggle = (emoji: string) => {
    setActive((prev) => {
      const next = new Map(prev);
      if (next.has(emoji)) next.delete(emoji);
      else next.set(emoji, 1);
      return next;
    });
  };

  return (
    <div className="flex gap-1.5 mt-2 flex-wrap">
      {REACTIONS.map(({ emoji, label }) => {
        const on = active.has(emoji);
        return (
          <motion.button
            key={emoji}
            whileHover={{ scale: 1.15, y: -2 }}
            whileTap={{ scale: 0.8 }}
            onClick={() => toggle(emoji)}
            className={`reaction-btn text-sm leading-none px-2 py-1.5 rounded-xl transition-all duration-200 flex items-center gap-1 ${
              on ? "reaction-active" : "reaction-idle"
            }`}
          >
            <span className={on ? "text-base" : ""}>{emoji}</span>
            <AnimatePresence>
              {on && (
                <motion.span
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: "auto" }}
                  exit={{ opacity: 0, width: 0 }}
                  className="text-[11px] font-medium text-white/90 overflow-hidden"
                >
                  {label}
                </motion.span>
              )}
            </AnimatePresence>
          </motion.button>
        );
      })}
    </div>
  );
}
