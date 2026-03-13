"use client";

import { motion } from "framer-motion";
import { Sparkles, Flame, Cat } from "lucide-react";
import { type SiggyMode, MODE_CONFIG } from "@/lib/constants";

const MODES: { key: SiggyMode; Icon: typeof Sparkles }[] = [
  { key: "mystical", Icon: Sparkles },
  { key: "chaotic", Icon: Flame },
  { key: "sassy", Icon: Cat },
];

interface Props {
  mode: SiggyMode;
  onModeChange: (m: SiggyMode) => void;
}

export default function ModeToggle({ mode, onModeChange }: Props) {
  return (
    <div className="flex gap-1.5 p-1.5 rounded-2xl glass-card">
      {MODES.map(({ key, Icon }) => {
        const cfg = MODE_CONFIG[key];
        const active = mode === key;
        return (
          <button
            key={key}
            onClick={() => onModeChange(key)}
            className="relative px-4 py-2.5 rounded-xl text-xs font-bold transition-all duration-300 flex items-center gap-2 overflow-hidden"
            style={{ color: active ? cfg.color : "var(--text-muted)" }}
          >
            {active && (
              <motion.div
                layoutId="mode-bg"
                className="absolute inset-0 rounded-xl"
                style={{
                  background: `linear-gradient(135deg, ${cfg.color}18, ${cfg.color}08)`,
                  border: `1.5px solid ${cfg.color}50`,
                  boxShadow: `0 0 25px ${cfg.color}15, inset 0 0 20px ${cfg.color}05`,
                }}
                transition={{ type: "spring", stiffness: 350, damping: 30 }}
              />
            )}
            <span className="relative z-10 flex items-center gap-1.5">
              <Icon className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{cfg.label}</span>
              <span className="sm:hidden">{cfg.emoji}</span>
            </span>
          </button>
        );
      })}
    </div>
  );
}
