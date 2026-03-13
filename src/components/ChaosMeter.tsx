"use client";

import { motion } from "framer-motion";
import { Zap } from "lucide-react";

export default function ChaosMeter({ level }: { level: number }) {
  const v = Math.min(Math.max(Math.round(level), 0), 100);
  const high = v > 60;
  const crit = v > 85;

  return (
    <div className="flex items-center gap-2.5 w-[180px]">
      <motion.div
        animate={
          crit
            ? { scale: [1, 1.4, 1], rotate: [0, 15, -15, 0] }
            : high
            ? { scale: [1, 1.2, 1] }
            : {}
        }
        transition={{ repeat: Infinity, duration: crit ? 0.35 : 0.8 }}
      >
        <Zap
          className="w-4 h-4"
          style={{
            color: crit ? "var(--pink)" : high ? "var(--emerald)" : "var(--text-muted)",
            filter: high ? `drop-shadow(0 0 8px ${crit ? "var(--pink)" : "var(--emerald)"})` : "none",
          }}
        />
      </motion.div>

      <div className="flex-1 h-3 rounded-full bg-white/[0.04] overflow-hidden border border-white/[0.06]">
        <motion.div
          className="h-full rounded-full chaos-fill"
          animate={{ width: `${v}%` }}
          transition={{ type: "spring", stiffness: 120, damping: 18 }}
          style={{
            boxShadow: high
              ? `0 0 ${v / 3}px ${crit ? "var(--pink)" : "var(--emerald)"}, 0 0 ${v / 2}px ${crit ? "rgba(255,45,85,0.3)" : "rgba(0,255,159,0.2)"}`
              : "none",
          }}
        />
      </div>

      <span
        className="text-[11px] font-mono font-bold w-10 text-right tabular-nums"
        style={{
          color: crit ? "var(--pink)" : high ? "var(--emerald)" : "var(--text-muted)",
          textShadow: high ? `0 0 10px ${crit ? "var(--pink)" : "var(--emerald)"}` : "none",
        }}
      >
        {v}%
      </span>
    </div>
  );
}
