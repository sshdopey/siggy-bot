"use client";

import { useState, useCallback, useEffect } from "react";
import dynamic from "next/dynamic";
import { Toaster } from "react-hot-toast";
import Header from "@/components/Header";
import ModeToggle from "@/components/ModeToggle";
import ChaosMeter from "@/components/ChaosMeter";
import ChatInterface from "@/components/ChatInterface";
import PortalEffect from "@/components/PortalEffect";
import FloatingEmojis from "@/components/FloatingEmojis";
import { type SiggyMode } from "@/lib/constants";

const StarField = dynamic(() => import("@/components/StarField"), { ssr: false });

export default function Home() {
  const [mode, setMode] = useState<SiggyMode>("mystical");
  const [chaosLevel, setChaosLevel] = useState(0);
  const [, setIsStreaming] = useState(false);
  const [portalActive, setPortalActive] = useState(false);
  const [shaking, setShaking] = useState(false);

  // Chaos decay
  useEffect(() => {
    const t = setInterval(() => setChaosLevel((p) => Math.max(0, p - 0.4)), 1500);
    return () => clearInterval(t);
  }, []);

  const handleChaos = useCallback((delta: number) => {
    setChaosLevel((prev) => {
      const next = Math.min(100, Math.max(0, prev + delta));
      if (next >= 80 && prev < 80) {
        setShaking(true);
        setTimeout(() => setShaking(false), 600);
      }
      return next;
    });
  }, []);

  return (
    <>
      <Toaster position="top-center" toastOptions={{ duration: 3000, style: { borderRadius: 16, fontSize: 13 } }} />

      {/* ═══ Background layers ═══ */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="bg-orb bg-orb-1" />
        <div className="bg-orb bg-orb-2" />
        <div className="bg-orb bg-orb-3" />
        <div className="bg-orb bg-orb-4" />
      </div>
      <div className="bg-grid z-[1]" />
      <StarField chaosLevel={chaosLevel} />
      <FloatingEmojis />
      <div className="scanlines" />

      <PortalEffect active={portalActive} onComplete={() => setPortalActive(false)} />

      {/* ═══ Main App ═══ */}
      <main className={`relative z-10 flex flex-col h-dvh max-h-dvh overflow-hidden ${shaking ? "chaos-shake" : ""}`}>
        <Header />

        {/* Controls row */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 px-4 pb-3">
          <ModeToggle mode={mode} onModeChange={setMode} />
          <ChaosMeter level={chaosLevel} />
        </div>

        {/* Chat — full remaining height */}
        <div className="flex-1 min-h-0 max-w-3xl mx-auto w-full flex flex-col">
          <ChatInterface
            mode={mode}
            chaosLevel={chaosLevel}
            onChaosChange={handleChaos}
            onPortalTrigger={() => setPortalActive(true)}
            onStreamingChange={setIsStreaming}
          />
        </div>

        {/* Bottom glow */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1/2 h-28 bg-[var(--emerald)]/5 rounded-full blur-[80px] pointer-events-none" />
      </main>
    </>
  );
}
