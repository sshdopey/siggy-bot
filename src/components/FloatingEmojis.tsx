"use client";

const ITEMS = [
  { emoji: "✨", x: 3, dur: 18, delay: 0, size: 1.1 },
  { emoji: "🐱", x: 12, dur: 22, delay: 3, size: 1.3 },
  { emoji: "🔮", x: 25, dur: 16, delay: 7, size: 1.0 },
  { emoji: "⚡", x: 38, dur: 20, delay: 2, size: 0.9 },
  { emoji: "🌟", x: 50, dur: 24, delay: 10, size: 1.2 },
  { emoji: "💫", x: 62, dur: 19, delay: 5, size: 1.0 },
  { emoji: "🐾", x: 72, dur: 21, delay: 8, size: 1.1 },
  { emoji: "🌀", x: 82, dur: 17, delay: 1, size: 0.9 },
  { emoji: "🪐", x: 90, dur: 25, delay: 12, size: 1.3 },
  { emoji: "☄️", x: 55, dur: 23, delay: 15, size: 1.0 },
  { emoji: "🌙", x: 18, dur: 26, delay: 9, size: 1.1 },
  { emoji: "⭐", x: 78, dur: 20, delay: 4, size: 0.8 },
  { emoji: "😼", x: 45, dur: 28, delay: 14, size: 1.0 },
  { emoji: "🐈‍⬛", x: 33, dur: 22, delay: 11, size: 1.2 },
];

export default function FloatingEmojis() {
  return (
    <div className="fixed inset-0 z-[2] pointer-events-none overflow-hidden" aria-hidden>
      {ITEMS.map((item, i) => (
        <span
          key={i}
          className="float-emoji"
          style={{
            left: `${item.x}%`,
            fontSize: `${item.size}rem`,
            animationDuration: `${item.dur}s`,
            animationDelay: `${item.delay}s`,
          }}
        >
          {item.emoji}
        </span>
      ))}

      {/* Shooting stars */}
      <div className="shooting-star" style={{ top: "8%", left: "15%", transform: "rotate(-35deg)", animationDelay: "0s" }} />
      <div className="shooting-star" style={{ top: "25%", left: "65%", transform: "rotate(-28deg)", animationDelay: "6s" }} />
      <div className="shooting-star" style={{ top: "55%", left: "35%", transform: "rotate(-40deg)", animationDelay: "11s" }} />
      <div className="shooting-star" style={{ top: "75%", left: "80%", transform: "rotate(-32deg)", animationDelay: "16s" }} />
    </div>
  );
}
