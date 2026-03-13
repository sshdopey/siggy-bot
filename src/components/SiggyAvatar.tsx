"use client";

import { useRef, useMemo } from "react";
import { motion } from "framer-motion";
import { useMousePosition } from "@/hooks/useMousePosition";

interface Props {
  chaosLevel: number;
  isTyping: boolean;
  size?: "sm" | "lg";
}

export default function SiggyAvatar({ chaosLevel, isTyping, size = "lg" }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const mouse = useMousePosition();

  const eye = useMemo(() => {
    if (!ref.current) return { x: 0, y: 0 };
    const r = ref.current.getBoundingClientRect();
    const cx = r.left + r.width / 2, cy = r.top + r.height / 2;
    const dx = mouse.x - cx, dy = mouse.y - cy;
    const d = Math.sqrt(dx * dx + dy * dy) || 1;
    const max = size === "sm" ? 2 : 4.5;
    const f = Math.min(d / 250, 1) * max;
    return { x: (dx / d) * f, y: (dy / d) * f };
  }, [mouse.x, mouse.y, size]);

  const i = chaosLevel / 100; // intensity 0-1
  const lg = size === "lg";
  const wrap = lg ? "w-52 h-52 md:w-64 md:h-64" : "w-20 h-20";
  const svg = lg ? "w-32 h-32 md:w-40 md:h-40" : "w-12 h-12";

  return (
    <motion.div
      ref={ref}
      className={`relative flex items-center justify-center ${wrap}`}
      animate={isTyping ? { y: [0, -5, 0] } : {}}
      transition={isTyping ? { repeat: Infinity, duration: 1.5 } : {}}
    >
      {/* Radial glow */}
      <div
        className="absolute inset-0 rounded-full"
        style={{ background: `radial-gradient(circle, rgba(0,255,159,${0.1 + i * 0.2}) 0%, transparent 70%)` }}
      />

      {/* Ring 1 */}
      <motion.div
        className="absolute inset-0 rounded-full border"
        style={{
          borderColor: `rgba(0,255,159,${0.18 + i * 0.35})`,
          filter: `drop-shadow(0 0 ${10 + i * 30}px rgba(0,255,159,${0.25 + i * 0.4}))`,
        }}
        animate={{ rotate: 360 }}
        transition={{ repeat: Infinity, duration: 22 - i * 16, ease: "linear" }}
      />
      {/* Ring 2 */}
      <motion.div
        className="absolute rounded-full border"
        style={{
          width: "78%", height: "78%",
          borderColor: `rgba(191,90,242,${0.2 + i * 0.25})`,
          filter: `drop-shadow(0 0 ${8 + i * 18}px rgba(191,90,242,${0.15 + i * 0.3}))`,
        }}
        animate={{ rotate: -360 }}
        transition={{ repeat: Infinity, duration: 16 - i * 10, ease: "linear" }}
      />
      {/* Ring 3 — dashed outer */}
      {lg && (
        <motion.div
          className="absolute rounded-full"
          style={{
            width: "115%", height: "115%",
            border: `1px dashed rgba(0,212,255,${0.08 + i * 0.12})`,
          }}
          animate={{ rotate: 360, scale: [1, 1.04, 1] }}
          transition={{ rotate: { repeat: Infinity, duration: 35, ease: "linear" }, scale: { repeat: Infinity, duration: 6 } }}
        />
      )}

      {/* Cat */}
      <motion.svg
        viewBox="0 0 200 220"
        className={`${svg} relative z-10`}
        style={{ filter: `drop-shadow(0 0 20px rgba(0,255,159,${0.2 + i * 0.3}))` }}
        animate={{ y: [0, -6, 0] }}
        transition={{ repeat: Infinity, duration: 4.5, ease: "easeInOut" }}
      >
        <defs>
          <filter id="eg"><feGaussianBlur stdDeviation="5" result="b" /><feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
          <radialGradient id="bg" cx="50%" cy="40%"><stop offset="0%" stopColor="#1a1a3e" /><stop offset="100%" stopColor="#08081a" /></radialGradient>
        </defs>
        <ellipse cx="100" cy="170" rx="46" ry="42" fill="url(#bg)" />
        <ellipse cx="100" cy="108" rx="45" ry="42" fill="url(#bg)" />
        <polygon points="63,80 50,28 90,66" fill="#0b0b24" />
        <polygon points="137,80 150,28 110,66" fill="#0b0b24" />
        <polygon points="66,76 56,38 87,68" fill="#161640" />
        <polygon points="134,76 144,38 113,68" fill="#161640" />
        <g filter="url(#eg)">
          <ellipse cx="78" cy="100" rx="13" ry="15" fill="#00ff9f" />
          <ellipse cx="122" cy="100" rx="13" ry="15" fill="#00ff9f" />
        </g>
        <ellipse cx={78 + eye.x} cy={100 + eye.y} rx="5" ry="13" fill="#020014" />
        <ellipse cx={122 + eye.x} cy={100 + eye.y} rx="5" ry="13" fill="#020014" />
        <circle cx={75 + eye.x * 0.2} cy={95 + eye.y * 0.2} r="3.5" fill="white" opacity="0.9" />
        <circle cx={119 + eye.x * 0.2} cy={95 + eye.y * 0.2} r="3.5" fill="white" opacity="0.9" />
        <polygon points="100,117 96,122 104,122" fill="#ff6b9d" />
        <path d="M90,126 Q95,131 100,126 Q105,131 110,126" stroke="#555" fill="none" strokeWidth="1.2" />
        <g stroke="rgba(255,255,255,0.12)" strokeWidth="0.8">
          <line x1="54" y1="112" x2="76" y2="116" />
          <line x1="52" y1="121" x2="75" y2="119" />
          <line x1="124" y1="116" x2="146" y2="112" />
          <line x1="125" y1="119" x2="148" y2="121" />
        </g>
        <motion.path
          d="M146,172 Q170,160 174,136 Q178,112 158,104"
          stroke="#0b0b24" fill="none" strokeWidth="7" strokeLinecap="round"
          animate={{
            d: [
              "M146,172 Q170,160 174,136 Q178,112 158,104",
              "M146,172 Q176,168 182,146 Q186,122 166,116",
              "M146,172 Q162,156 166,138 Q170,118 152,108",
              "M146,172 Q170,160 174,136 Q178,112 158,104",
            ],
          }}
          transition={{ repeat: Infinity, duration: 3.2, ease: "easeInOut" }}
        />
      </motion.svg>

      {/* Purr ripples */}
      {isTyping && (
        <>
          <motion.div className="absolute rounded-full border border-[var(--emerald)]/20" style={{ width: "65%", height: "65%" }}
            animate={{ scale: [1, 1.6], opacity: [0.4, 0] }} transition={{ repeat: Infinity, duration: 1.4 }} />
          <motion.div className="absolute rounded-full border border-[var(--emerald)]/10" style={{ width: "65%", height: "65%" }}
            animate={{ scale: [1, 2], opacity: [0.25, 0] }} transition={{ repeat: Infinity, duration: 1.4, delay: 0.5 }} />
        </>
      )}
    </motion.div>
  );
}
