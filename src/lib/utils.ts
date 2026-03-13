import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { CHAOS_WORDS, GIF_MOODS } from "./constants";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Calculate chaos score from a Siggy response (0-30) */
export function calculateChaosScore(text: string): number {
  const lower = text.toLowerCase();
  let score = 0;
  for (const word of CHAOS_WORDS) {
    if (lower.includes(word.toLowerCase())) score += 3;
  }
  score += Math.min((text.match(/!/g) || []).length * 2, 10);
  score += (text.match(/\*[^*]+\*/g) || []).length * 4;
  score += (text.match(/\b[A-Z]{3,}\b/g) || []).length * 3;
  return Math.min(score, 30);
}

/** Detect crypto price queries */
export function detectPriceQuery(message: string): string[] {
  const lower = message.toLowerCase();
  const priceKeywords = ["price", "cost", "worth", "how much", "market", "trading", "value of"];
  if (!priceKeywords.some((k) => lower.includes(k))) return [];
  const map: Record<string, string> = {
    btc: "bitcoin", bitcoin: "bitcoin", eth: "ethereum",
    ethereum: "ethereum", ritual: "ritual", rite: "ritual",
    sol: "solana", solana: "solana",
  };
  const tokens: string[] = [];
  for (const [key, id] of Object.entries(map)) {
    if (lower.includes(key) && !tokens.includes(id)) tokens.push(id);
  }
  return tokens.length ? tokens : ["bitcoin", "ethereum"];
}

export function formatPrice(price: number): string {
  return price >= 1
    ? `$${price.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
    : `$${price.toPrecision(4)}`;
}

export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

/** Detect the mood of Siggy's response for GIF matching */
export function detectMood(text: string): string {
  const lower = text.toLowerCase();
  if (/yoo|!!|feral|supersonic|go all|let's go|lfg/i.test(lower)) return "excited";
  if (/roast|boring|lame|mortal|basic/i.test(lower)) return "roast";
  if (/joke|therapy|punch ?line|walked right/i.test(lower)) return "joke";
  if (/portal|dimension|wormhole|nebula|cosmos/i.test(lower)) return "mystical";
  if (/chaos|unhinged|feral|zoomie|wild/i.test(lower)) return "chaos";
  if (/love|believe in you|proud|amazing|incredible/i.test(lower)) return "love";
  if (/hisses|side.?eye|really\?|sigh/i.test(lower)) return "sassy";
  if (/meaning|wisdom|truth|knowledge|ancient/i.test(lower)) return "wisdom";
  return "default";
}

/** Get a random GIF search query for a mood */
export function getGifQuery(mood: string): string {
  const options = GIF_MOODS[mood] || GIF_MOODS.default;
  return options[Math.floor(Math.random() * options.length)];
}
