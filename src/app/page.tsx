"use client";

import { useState, useCallback } from "react";
import dynamic from "next/dynamic";
import { Toaster } from "react-hot-toast";
import Header from "@/components/Header";
import ChatInterface from "@/components/ChatInterface";
import PortalEffect from "@/components/PortalEffect";
import FloatingEmojis from "@/components/FloatingEmojis";

const StarField = dynamic(() => import("@/components/StarField"), { ssr: false });

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
      <Toaster position="top-center" toastOptions={{ duration: 3000, style: { borderRadius: 16, fontSize: 13 } }} />

      {/* Background layers */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="bg-orb bg-orb-1" />
        <div className="bg-orb bg-orb-2" />
        <div className="bg-orb bg-orb-3" />
        <div className="bg-orb bg-orb-4" />
      </div>
      <div className="bg-grid z-[1]" />
      <StarField chaosLevel={0} />
      <FloatingEmojis />
      <div className="scanlines" />

      <PortalEffect active={portalActive} onComplete={() => setPortalActive(false)} />

      {/* App */}
      <main className={`relative z-10 flex flex-col h-dvh max-h-dvh overflow-hidden ${shaking ? "chaos-shake" : ""}`}>
        <Header />
        <div className="flex-1 min-h-0 max-w-3xl mx-auto w-full flex flex-col">
          <ChatInterface onPortalTrigger={handlePortal} />
        </div>
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1/2 h-28 bg-[var(--emerald)]/5 rounded-full blur-[80px] pointer-events-none" />
      </main>
    </>
  );
}
