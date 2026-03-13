"use client";

import { useEffect, useState, useCallback } from "react";
import { Gif } from "@giphy/react-components";
import { gf } from "@/lib/giphy";
import { motion } from "framer-motion";

interface Props {
  gifId?: string;
  searchQuery?: string;
  onLoad?: () => void;
}

export default function GifReaction({ gifId, searchQuery, onLoad }: Props) {
  const [gifData, setGifData] = useState<any>(null);
  const [error, setError] = useState(false);

  const fetchById = useCallback(async (id: string) => {
    if (!gf) return;
    try {
      const { data } = await gf.gif(id);
      setGifData(data);
    } catch {
      setError(true);
    }
  }, []);

  const fetchBySearch = useCallback(async (query: string) => {
    if (!gf) return;
    try {
      const { data } = await gf.search(query, { limit: 12, rating: "pg" as any, type: "gifs" as any });
      if (data.length) {
        setGifData(data[Math.floor(Math.random() * data.length)]);
      } else {
        const { data: fallback } = await gf.search("funny cat reaction", { limit: 8, rating: "pg" as any });
        if (fallback.length) setGifData(fallback[Math.floor(Math.random() * fallback.length)]);
      }
    } catch {
      setError(true);
    }
  }, []);

  // Scroll when gif loads
  useEffect(() => {
    if (gifData && onLoad) {
      // Small delay to let the image render
      const t = setTimeout(onLoad, 150);
      return () => clearTimeout(t);
    }
  }, [gifData, onLoad]);

  useEffect(() => {
    if (gifId) fetchById(gifId);
    else if (searchQuery) fetchBySearch(searchQuery);
  }, [gifId, searchQuery, fetchById, fetchBySearch]);

  if (error || !gf) return null;

  if (!gifData) {
    return (
      <div className="mt-3 h-36 w-56 rounded-2xl bg-white/[0.03] animate-pulse border border-white/[0.05]" />
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9, y: 8 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="mt-3 gif-wrap inline-block"
    >
      <Gif
        gif={gifData}
        width={240}
        hideAttribution
        noLink
        overlay={({ isHovered }: { gif: any; isHovered: boolean }) =>
          isHovered ? (
            <div className="absolute inset-0 bg-black/30 flex items-end justify-end p-2 rounded-2xl">
              <span className="text-[9px] text-white/60 font-mono tracking-wider">GIPHY</span>
            </div>
          ) : null
        }
      />
    </motion.div>
  );
}
