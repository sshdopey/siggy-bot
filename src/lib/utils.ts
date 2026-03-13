import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { CHAOS_WORDS } from "./constants";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function calculateChaosScore(text: string): number {
  const lower = text.toLowerCase();
  let score = 0;
  for (const word of CHAOS_WORDS) if (lower.includes(word.toLowerCase())) score += 3;
  score += Math.min((text.match(/!/g) || []).length * 2, 10);
  score += (text.match(/\b[A-Z]{3,}\b/g) || []).length * 3;
  return Math.min(score, 30);
}

export function detectPriceQuery(message: string): string[] {
  const lower = message.toLowerCase();
  const keywords = ["price", "cost", "worth", "how much", "market", "trading"];
  if (!keywords.some((k) => lower.includes(k))) return [];
  const map: Record<string, string> = {
    btc: "bitcoin", bitcoin: "bitcoin", eth: "ethereum",
    ethereum: "ethereum", ritual: "ritual", sol: "solana",
  };
  const tokens: string[] = [];
  for (const [key, id] of Object.entries(map)) if (lower.includes(key) && !tokens.includes(id)) tokens.push(id);
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

/** Pick a GIPHY search query based on Siggy's response content */
export function getGifQuery(text: string): string {
  const t = text.toLowerCase();
  if (/lol|haha|joke|funny|laugh|comedy|😂|💀/.test(t)) return "cat laughing funny";
  if (/roast|burn|savage|rekt|destroyed|ouch/.test(t)) return "cat judging you";
  if (/wow|amazing|incredible|awesome|insane|fire|🔥/.test(t)) return "excited cat";
  if (/love|heart|proud|believe in you|❤/.test(t)) return "cat love cute";
  if (/angry|mad|annoyed|hate|terrible/.test(t)) return "angry cat";
  if (/confused|what\?|huh|wut|bruh/.test(t)) return "confused cat";
  if (/sad|sorry|unfortunately|😢/.test(t)) return "sad cat";
  if (/hello|hi |gm|hey|welcome|greet/.test(t)) return "cat waving hello";
  if (/bye|goodbye|later|peace/.test(t)) return "cat bye";
  if (/think|hmm|wonder|consider|ponder/.test(t)) return "cat thinking";
  if (/build|code|dev|ship|deploy|hack/.test(t)) return "cat typing keyboard";
  if (/money|price|eth|btc|crypto|rich|moon/.test(t)) return "cat money rich";
  if (/boring|lame|basic|meh|yawn/.test(t)) return "bored cat unimpressed";
  if (/ritual|infernet|blockchain|onchain|web3/.test(t)) return "cool cat sunglasses";
  if (/chaos|wild|feral|unhinged|crazy/.test(t)) return "crazy cat zoomies";
  if (/sleep|tired|nap|exhausted/.test(t)) return "sleepy cat";
  const defaults = ["cat reaction gif", "funny cat", "sassy cat", "cat vibes"];
  return defaults[Math.floor(Math.random() * defaults.length)];
}
