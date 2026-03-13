"use client";

import { useEffect, useState, useMemo } from "react";
import Particles, { initParticlesEngine } from "@tsparticles/react";
import { loadSlim } from "@tsparticles/slim";
import type { ISourceOptions } from "@tsparticles/engine";

export default function StarField({ chaosLevel = 0 }: { chaosLevel?: number }) {
  const [init, setInit] = useState(false);

  useEffect(() => {
    initParticlesEngine(async (engine) => {
      await loadSlim(engine);
    }).then(() => setInit(true));
  }, []);

  const options: ISourceOptions = useMemo(
    () => ({
      fullScreen: false,
      fpsLimit: 60,
      particles: {
        number: {
          value: 100 + Math.floor(chaosLevel * 0.8),
          density: { enable: true, width: 1920, height: 1080 },
        },
        color: {
          value: ["#ffffff", "#00ff9f", "#bf5af2", "#00d4ff", "#ffd60a"],
        },
        opacity: {
          value: { min: 0.05, max: 0.6 },
          animation: { enable: true, speed: 0.8, sync: false },
        },
        size: {
          value: { min: 0.3, max: chaosLevel > 50 ? 3 : 2 },
          animation: { enable: true, speed: 0.5, sync: false },
        },
        move: {
          enable: true,
          speed: 0.2 + chaosLevel * 0.03,
          direction: "none" as const,
          random: true,
          straight: false,
          outModes: { default: "out" as const },
        },
        links: {
          enable: chaosLevel > 60,
          distance: 120,
          color: "#00ff9f",
          opacity: 0.08,
          width: 0.5,
        },
        twinkle: {
          particles: { enable: true, frequency: 0.04, opacity: 1 },
        },
      },
      detectRetina: true,
    }),
    [chaosLevel]
  );

  if (!init) return null;

  return (
    <div className="fixed inset-0 z-[1] pointer-events-none">
      <Particles id="starfield" className="w-full h-full" options={options} />
    </div>
  );
}
