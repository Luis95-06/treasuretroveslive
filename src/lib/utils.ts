import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(value);
}

export function formatPercent(value: number) {
  return `${value.toFixed(2)}%`;
}

export function formatImpressions(value: number) {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(1)}K`;
  return value.toString();
}

export function normalizeCategory(raw: string | null | undefined): string {
  if (!raw) return "other";
  const lower = raw.toLowerCase();
  if (lower.includes("beauty") || lower.includes("skin") || lower.includes("makeup") || lower.includes("hair") || lower.includes("bath")) return "beauty";
  if (lower.includes("men") || lower.includes("women") || lower.includes("apparel") || lower.includes("dress") || lower.includes("shirt") || lower.includes("trouser") || lower.includes("jean") || lower.includes("short") || lower.includes("blouse")) return "apparel";
  if (lower.includes("phone") || lower.includes("electronic") || lower.includes("accessory") || lower.includes("accessories") || lower.includes("case")) return "accessories";
  if (lower.includes("home") || lower.includes("household") || lower.includes("clean")) return "household";
  if (lower.includes("health") || lower.includes("supplement")) return "health";
  return "other";
}
