"use client";

import { useState, useCallback } from "react";
import dynamic from "next/dynamic";
import { Toaster } from "react-hot-toast";
import ChatInterface from "@/components/ChatInterface";
import PortalEffect from "@/components/PortalEffect";
import { motion } from "framer-motion";
import { Cat, Zap, Shield, Globe, Twitter, Activity, Radio } from "lucide-react";

const StarField = dynamic(() => import("@/components/StarField"), { ssr: false });

const STATUS_ITEMS = [
  "MULTIVERSE_LINK: STABLE",
  "INFERNET_NODES: 8,247 ACTIVE",
  "DIMENSION: 7 OF \u221E",
  "CHAOS_LEVEL: MAXIMUM",
  "DRIP_STATUS: ETERNAL",
  "TIMELINE: PRIME (\u2756,\u2756)",
  "SOUL_FORGE: ONLINE",
  "COSMIC_ENTROPY: NOMINAL",
  "RITUAL_CHAIN: TESTNET LIVE",
  "VERIFICATION: ZKML READY",
];

export default function Home() {
  const [portalActive, setPortalActive] = useState(false);
  const [shaking, setShaking] = useState(false);

  const handlePortal = useCallback(() => {
    setPortalActive(true);
    setShaking(true);
    setTimeout(() => setShaking(false), 600);
  }, []);

  return (
    <>
      <Toaster
        position="top-center"
        toastOptions={{
          duration: 3000,
          style: {
            borderRadius: 14,
            fontSize: 13,
            background: "rgba(10,10,31,0.95)",
            color: "#e8e8f0",
            border: "1px solid rgba(255,255,255,0.08)",
            backdropFilter: "blur(20px)",
            boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
          },
        }}
      />

      {/* Background layers */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="bg-orb bg-orb-1" />
        <div className="bg-orb bg-orb-2" />
        <div className="bg-orb bg-orb-3" />
      </div>
      <div className="bg-grid z-[1]" />
      <StarField chaosLevel={0} />
      <div className="scanlines" />

      <PortalEffect active={portalActive} onComplete={() => setPortalActive(false)} />

      {/* App shell */}
      <main className={`relative z-10 flex flex-col h-dvh max-h-dvh overflow-hidden ${shaking ? "chaos-shake" : ""}`}>
        {/* ═══ HEADER ═══ */}
        <header className="header-bar relative z-20 flex items-center justify-between px-4 md:px-6 py-2.5">
          {/* Left: Logo + Status */}
          <div className="flex items-center gap-3">
            <motion.div
              className="relative"
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 400, damping: 15 }}
            >
              <div className="w-10 h-10 rounded-xl siggy-icon flex items-center justify-center">
                <Cat className="w-5 h-5 text-[var(--emerald)]" />
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 online-dot" style={{ width: 7, height: 7, borderRadius: "50%", border: "2px solid var(--bg)" }} />
            </motion.div>
            <div>
              <h1 className="font-space text-base font-bold tracking-tight flex items-center gap-1.5">
                <span className="text-[var(--emerald)] text-glow-emerald">SIGGY</span>
                <span className="text-white/15 text-sm">/</span>
                <span className="text-white/50 text-[13px] font-medium tracking-wide">SOUL FORGE</span>
              </h1>
              <div className="flex items-center gap-1.5 mt-0.5">
                <Activity className="w-2.5 h-2.5 text-[var(--emerald)]" style={{ opacity: 0.5 }} />
                <span className="text-[9px] text-[var(--emerald)] font-space tracking-[0.12em] uppercase" style={{ opacity: 0.6 }}>
                  Operational
                </span>
                <span className="text-[9px] text-white/15 mx-0.5">\u2022</span>
                <span className="text-[9px] text-white/20 font-space tracking-wider">v3.0</span>
              </div>
            </div>
          </div>

          {/* Right: Status chips */}
          <div className="hidden md:flex items-center gap-2">
            <motion.div
              className="status-chip"
              whileHover={{ scale: 1.03 }}
              transition={{ type: "spring", stiffness: 400 }}
            >
              <Zap className="w-3 h-3" />
              <span>8k+ Nodes</span>
            </motion.div>
            <motion.div
              className="status-chip status-chip-purple"
              whileHover={{ scale: 1.03 }}
              transition={{ type: "spring", stiffness: 400 }}
            >
              <Shield className="w-3 h-3" />
              <span>EVM++</span>
            </motion.div>
            <motion.div
              className="status-chip status-chip-cyan"
              whileHover={{ scale: 1.03 }}
              transition={{ type: "spring", stiffness: 400 }}
            >
              <Globe className="w-3 h-3" />
              <span>Multiverse</span>
            </motion.div>
          </div>
        </header>

        {/* ═══ MAIN CONTENT ═══ */}
        <div className="flex-1 min-h-0 max-w-4xl mx-auto w-full flex flex-col">
          <ChatInterface onPortalTrigger={handlePortal} />
        </div>

        {/* ═══ FOOTER ═══ */}
        <footer className="footer-bar relative z-20 px-4 py-1.5 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 overflow-hidden flex-1">
            <div className="flex items-center gap-1.5 flex-shrink-0">
              <Radio className="w-3 h-3 text-[var(--emerald)]" style={{ opacity: 0.4 }} />
              <span className="text-[9px] font-space text-[var(--emerald)] tracking-[0.08em] uppercase" style={{ opacity: 0.3 }}>
                LIVE
              </span>
            </div>
            <div className="w-px h-3 bg-white/[0.06]" />
            <div className="status-ticker">
              <div className="status-ticker-inner">
                {[...STATUS_ITEMS, ...STATUS_ITEMS].map((item, i) => (
                  <span key={i} className="text-[10px] font-space text-white/20 whitespace-nowrap px-4 tracking-wide">
                    {item}
                  </span>
                ))}
              </div>
            </div>
          </div>
          <a
            href="https://twitter.com/intent/tweet?text=just+talked+to+Siggy+%E2%80%94+the+most+unhinged+cosmic+cat+in+the+Ritual+multiverse+%F0%9F%90%B1%E2%9C%A8+%23EngineerSiggysSoul+%40ritualfnd"
            target="_blank"
            rel="noopener"
            className="flex items-center gap-1.5 text-[10px] font-space text-white/20 hover:text-[var(--cyan)] transition-all duration-300 flex-shrink-0 group/tw"
          >
            <Twitter className="w-3 h-3 transition-transform duration-300 group-hover/tw:scale-110" />
            <span className="hidden sm:inline tracking-wide">#EngineerSiggysSoul</span>
          </a>
        </footer>
      </main>
    </>
  );
}
