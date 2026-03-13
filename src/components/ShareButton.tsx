"use client";

import { motion } from "framer-motion";
import { Twitter } from "lucide-react";

export default function ShareButton({ lastResponse }: { lastResponse: string }) {
  if (!lastResponse) return null;

  const share = () => {
    const t = lastResponse.length > 180 ? lastResponse.slice(0, 180) + "..." : lastResponse;
    const text = `🐱⭐ Siggy says:\n\n"${t}"\n\n#EngineerSiggysSoul @ritualfnd`;
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`, "_blank", "noopener");
  };

  return (
    <motion.button
      initial={{ opacity: 0, scale: 0.7 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.12 }}
      whileTap={{ scale: 0.9 }}
      onClick={share}
      className="flex-shrink-0 p-2.5 rounded-xl glass text-[var(--text-muted)] hover:text-[var(--cyan)] transition-all hover:glow-cyan"
      title="Share to X"
    >
      <Twitter className="w-4 h-4" />
    </motion.button>
  );
}
