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
  const wrap = lg ? "w-44 h-44 md:w-52 md:h-52" : "w-20 h-20";
  const svg = lg ? "w-28 h-28 md:w-36 md:h-36" : "w-12 h-12";

  return (
    <motion.div
      ref={ref}
      className={`relative flex items-center justify-center ${wrap}`}
      animate={isTyping ? { y: [0, -5, 0] } : {}}
      transition={isTyping ? { repeat: Infinity, duration: 1.5 } : {}}
    >
      {/* Outer glow */}
      <div
        className="absolute inset-0 rounded-full"
        style={{
          background: `radial-gradient(circle, rgba(0,255,159,${0.08 + i * 0.15}) 0%, rgba(191,90,242,${0.03 + i * 0.05}) 40%, transparent 70%)`,
        }}
      />

      {/* Ring 1 - Main emerald ring */}
      <motion.div
        className="absolute inset-0 rounded-full"
        style={{
          border: `1px solid rgba(0,255,159,${0.12 + i * 0.25})`,
          filter: `drop-shadow(0 0 ${8 + i * 20}px rgba(0,255,159,${0.15 + i * 0.25}))`,
        }}
        animate={{ rotate: 360 }}
        transition={{ repeat: Infinity, duration: 24 - i * 16, ease: "linear" }}
      />

      {/* Ring 2 - Purple inner ring */}
      <motion.div
        className="absolute rounded-full"
        style={{
          width: "80%",
          height: "80%",
          border: `1px solid rgba(191,90,242,${0.12 + i * 0.2})`,
          filter: `drop-shadow(0 0 ${6 + i * 14}px rgba(191,90,242,${0.1 + i * 0.2}))`,
        }}
        animate={{ rotate: -360 }}
        transition={{ repeat: Infinity, duration: 18 - i * 10, ease: "linear" }}
      />

      {/* Ring 3 - Dashed outer ring */}
      {lg && (
        <motion.div
          className="absolute rounded-full"
          style={{
            width: "112%",
            height: "112%",
            border: `1px dashed rgba(0,212,255,${0.06 + i * 0.1})`,
          }}
          animate={{ rotate: 360, scale: [1, 1.03, 1] }}
          transition={{
            rotate: { repeat: Infinity, duration: 40, ease: "linear" },
            scale: { repeat: Infinity, duration: 8 },
          }}
        />
      )}

      {/* The Cat SVG */}
      <motion.svg
        viewBox="0 0 200 220"
        className={`${svg} relative z-10`}
        style={{ filter: `drop-shadow(0 0 16px rgba(0,255,159,${0.15 + i * 0.2}))` }}
        animate={{ y: [0, -5, 0] }}
        transition={{ repeat: Infinity, duration: 5, ease: "easeInOut" }}
      >
        <defs>
          <filter id="eye-glow">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <radialGradient id="body-grad" cx="50%" cy="40%">
            <stop offset="0%" stopColor="#1a1a3e" />
            <stop offset="100%" stopColor="#08081a" />
          </radialGradient>
          <radialGradient id="eye-grad-l" cx="40%" cy="35%">
            <stop offset="0%" stopColor="#66ffcc" />
            <stop offset="60%" stopColor="#00ff9f" />
            <stop offset="100%" stopColor="#00cc7f" />
          </radialGradient>
          <radialGradient id="eye-grad-r" cx="40%" cy="35%">
            <stop offset="0%" stopColor="#66ffcc" />
            <stop offset="60%" stopColor="#00ff9f" />
            <stop offset="100%" stopColor="#00cc7f" />
          </radialGradient>
          <linearGradient id="ear-inner-l" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#1a1040" />
            <stop offset="100%" stopColor="#161640" />
          </linearGradient>
        </defs>

        {/* Body */}
        <ellipse cx="100" cy="170" rx="46" ry="42" fill="url(#body-grad)" />
        <ellipse cx="100" cy="108" rx="45" ry="42" fill="url(#body-grad)" />

        {/* Ears - outer */}
        <polygon points="63,80 50,28 90,66" fill="#0b0b24" />
        <polygon points="137,80 150,28 110,66" fill="#0b0b24" />
        {/* Ears - inner */}
        <polygon points="66,76 56,38 87,68" fill="url(#ear-inner-l)" />
        <polygon points="134,76 144,38 113,68" fill="url(#ear-inner-l)" />

        {/* Eyes */}
        <g filter="url(#eye-glow)">
          <ellipse cx="78" cy="100" rx="13" ry="15" fill="url(#eye-grad-l)" />
          <ellipse cx="122" cy="100" rx="13" ry="15" fill="url(#eye-grad-r)" />
        </g>

        {/* Pupils - follow mouse */}
        <ellipse cx={78 + eye.x} cy={100 + eye.y} rx="5" ry="13" fill="#020014" />
        <ellipse cx={122 + eye.x} cy={100 + eye.y} rx="5" ry="13" fill="#020014" />

        {/* Eye highlights */}
        <circle cx={75 + eye.x * 0.2} cy={95 + eye.y * 0.2} r="3.5" fill="white" opacity="0.9" />
        <circle cx={119 + eye.x * 0.2} cy={95 + eye.y * 0.2} r="3.5" fill="white" opacity="0.9" />
        {/* Small secondary highlights */}
        <circle cx={81 + eye.x * 0.15} cy={105 + eye.y * 0.15} r="1.5" fill="white" opacity="0.4" />
        <circle cx={125 + eye.x * 0.15} cy={105 + eye.y * 0.15} r="1.5" fill="white" opacity="0.4" />

        {/* Nose */}
        <polygon points="100,117 96,122 104,122" fill="#ff6b9d" />

        {/* Mouth */}
        <path d="M90,126 Q95,131 100,126 Q105,131 110,126" stroke="#555" fill="none" strokeWidth="1.2" />

        {/* Whiskers */}
        <g stroke="rgba(255,255,255,0.1)" strokeWidth="0.7">
          <line x1="54" y1="112" x2="76" y2="116" />
          <line x1="52" y1="121" x2="75" y2="119" />
          <line x1="56" y1="130" x2="76" y2="124" />
          <line x1="124" y1="116" x2="146" y2="112" />
          <line x1="125" y1="119" x2="148" y2="121" />
          <line x1="124" y1="124" x2="144" y2="130" />
        </g>

        {/* Tail */}
        <motion.path
          d="M146,172 Q170,160 174,136 Q178,112 158,104"
          stroke="#0b0b24"
          fill="none"
          strokeWidth="7"
          strokeLinecap="round"
          animate={{
            d: [
              "M146,172 Q170,160 174,136 Q178,112 158,104",
              "M146,172 Q176,168 182,146 Q186,122 166,116",
              "M146,172 Q162,156 166,138 Q170,118 152,108",
              "M146,172 Q170,160 174,136 Q178,112 158,104",
            ],
          }}
          transition={{ repeat: Infinity, duration: 3.5, ease: "easeInOut" }}
        />

        {/* Cosmic mark on forehead - subtle star/diamond */}
        <motion.g
          animate={{ opacity: [0.3, 0.7, 0.3] }}
          transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
        >
          <polygon
            points="100,72 102,76 106,76 103,79 104,83 100,80 96,83 97,79 94,76 98,76"
            fill="var(--emerald)"
            opacity="0.2"
          />
        </motion.g>
      </motion.svg>

      {/* Purr ripples */}
      {isTyping && (
        <>
          <motion.div
            className="absolute rounded-full border border-[var(--emerald)]"
            style={{ width: "60%", height: "60%", borderColor: "rgba(0,255,159,0.15)" }}
            animate={{ scale: [1, 1.6], opacity: [0.4, 0] }}
            transition={{ repeat: Infinity, duration: 1.4 }}
          />
          <motion.div
            className="absolute rounded-full border"
            style={{ width: "60%", height: "60%", borderColor: "rgba(0,255,159,0.08)" }}
            animate={{ scale: [1, 2], opacity: [0.25, 0] }}
            transition={{ repeat: Infinity, duration: 1.4, delay: 0.5 }}
          />
        </>
      )}
    </motion.div>
  );
}
