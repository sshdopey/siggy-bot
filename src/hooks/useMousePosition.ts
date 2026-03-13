"use client";
import { useState, useEffect, useRef } from "react";

interface MousePosition {
  x: number;
  y: number;
}

export function useMousePosition() {
  const [position, setPosition] = useState<MousePosition>({ x: 0, y: 0 });
  const frame = useRef(0);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      cancelAnimationFrame(frame.current);
      frame.current = requestAnimationFrame(() => {
        setPosition({ x: e.clientX, y: e.clientY });
      });
    };

    window.addEventListener("mousemove", handler);
    return () => {
      window.removeEventListener("mousemove", handler);
      cancelAnimationFrame(frame.current);
    };
  }, []);

  return position;
}
