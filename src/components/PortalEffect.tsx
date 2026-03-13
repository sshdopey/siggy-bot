"use client";

import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface PortalEffectProps {
  active: boolean;
  onComplete?: () => void;
}

const RING_COLORS = ["#00ff9f", "#bf5af2", "#00d4ff", "#ff2d55", "#ffd60a"];

export default function PortalEffect({ active, onComplete }: PortalEffectProps) {
  useEffect(() => {
    if (active) {
      const timer = setTimeout(() => onComplete?.(), 3000);
      return () => clearTimeout(timer);
    }
  }, [active, onComplete]);

  return (
    <AnimatePresence>
      {active && (
        <motion.div
          className="fixed inset-0 z-[60] flex items-center justify-center pointer-events-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4 }}
        >
          {/* Dark vignette */}
          <motion.div
            className="absolute inset-0"
            style={{ background: "radial-gradient(circle, transparent 20%, rgba(0,0,0,0.8) 80%)" }}
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 1, 1, 0] }}
            transition={{ duration: 3, times: [0, 0.15, 0.8, 1] }}
          />

          {/* Portal rings */}
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute rounded-full"
              style={{
                width: 60 + i * 80,
                height: 60 + i * 80,
                border: `2px solid ${RING_COLORS[i % RING_COLORS.length]}`,
                filter: `drop-shadow(0 0 ${15 + i * 8}px ${RING_COLORS[i % RING_COLORS.length]})`,
              }}
              initial={{ scale: 0, opacity: 0, rotate: 0 }}
              animate={{
                scale: [0, 1.3, 1],
                opacity: [0, 0.9, 0],
                rotate: 360 * (i % 2 === 0 ? 1 : -1),
              }}
              transition={{ duration: 2.8, delay: i * 0.12, ease: "easeOut" }}
            />
          ))}

          {/* Center burst */}
          <motion.div
            className="absolute w-3 h-3 rounded-full bg-white"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: [0, 60, 0], opacity: [0, 1, 0] }}
            transition={{ duration: 1.2, delay: 0.3, ease: "easeOut" }}
            style={{ filter: "blur(10px)" }}
          />

          {/* Text */}
          <motion.div
            className="absolute z-10 text-center"
            initial={{ opacity: 0, scale: 0.3 }}
            animate={{ opacity: [0, 1, 1, 0], scale: [0.3, 1.1, 1, 0.8] }}
            transition={{ duration: 3, times: [0, 0.25, 0.7, 1] }}
          >
            <p className="font-space text-2xl md:text-4xl font-black gradient-text">
              ✨ DIMENSION HOP ✨
            </p>
            <p className="text-xs text-neon-cyan/60 mt-2 tracking-widest">
              PORTAL OPENED SUCCESSFULLY
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
