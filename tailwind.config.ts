import type { Config } from "tailwindcss";
import defaultTheme from "tailwindcss/defaultTheme";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        "cosmic-void": "#030014",
        "cosmic-surface": "#0a0a2e",
        "neon-emerald": "#00ff9f",
        "neon-purple": "#bf5af2",
        "neon-cyan": "#00d4ff",
        "neon-pink": "#ff2d55",
        "neon-gold": "#ffd60a",
      },
      fontFamily: {
        sans: ["var(--font-inter)", ...defaultTheme.fontFamily.sans],
        space: ["var(--font-space)"],
      },
    },
  },
  plugins: [],
};

export default config;
