"use client";

import { motion } from "framer-motion";

export default function Header() {
  return (
    <header className="relative z-20 text-center pt-5 pb-2 px-4">
      {/* Spotlight glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[400px] h-[120px] bg-gradient-to-b from-emerald-500/10 to-transparent rounded-full blur-[80px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      >
        {/* Animated cat icon */}
        <motion.div
          className="text-5xl mb-1 inline-block"
          animate={{
            y: [0, -6, 0],
            rotate: [0, 3, -3, 0],
            scale: [1, 1.05, 1],
          }}
          transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
        >
          🐱
        </motion.div>

        <h1 className="font-space text-4xl md:text-6xl font-black gradient-text tracking-tight leading-none">
          SIGGY SOUL FORGE
        </h1>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5, duration: 0.8 }}
        className="flex items-center justify-center gap-3 mt-2"
      >
        <span className="h-px w-12 bg-gradient-to-r from-transparent to-emerald-400/30" />
        <p className="font-space text-[10px] md:text-xs tracking-[0.35em] uppercase text-[var(--text-muted)]">
          Multi-Dimensional Oracle
        </p>
        <span className="h-px w-12 bg-gradient-to-l from-transparent to-emerald-400/30" />
      </motion.div>
    </header>
  );
}
