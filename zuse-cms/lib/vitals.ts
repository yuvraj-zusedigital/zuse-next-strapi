import type { VitalName, VitalRating } from "@/lib/types";

/** What each metric means, in plain words, and how its value is shown. */
export const VITALS: Record<VitalName, { label: string; what: string; good: string }> = {
  LCP: { label: "Loading", what: "Largest Contentful Paint: how long until the main content (usually the hero image or heading) appears.", good: "Good: 2.5 s or less" },
  INP: { label: "Responsiveness", what: "Interaction to Next Paint: how quickly the page reacts to taps, clicks and typing.", good: "Good: 200 ms or less" },
  CLS: { label: "Visual stability", what: "Cumulative Layout Shift: how much the page jumps around while loading.", good: "Good: 0.1 or less" },
  FCP: { label: "First content", what: "First Contentful Paint: when anything first appears.", good: "Good: 1.8 s or less" },
  TTFB: { label: "Server response", what: "Time to First Byte: how fast the server starts answering.", good: "Good: 0.8 s or less" },
};

/** 2140 → "2.1 s", 180 → "180 ms", CLS 0.034 → "0.03". */
export function formatVital(name: VitalName, value: number | null) {
  if (value === null || value === undefined) return "—";
  if (name === "CLS") return value < 0.01 && value > 0 ? "<0.01" : value.toFixed(2);
  return value >= 1000 ? `${(value / 1000).toFixed(1)} s` : `${Math.round(value)} ms`;
}

export const RATING_LABEL: Record<VitalRating, string> = { good: "Good", "needs-improvement": "Needs improvement", poor: "Poor" };

export const RATING_STYLE: Record<VitalRating, string> = {
  good: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400",
  "needs-improvement": "bg-amber-500/15 text-amber-700 dark:text-amber-400",
  poor: "bg-destructive/15 text-destructive",
};

/** Fewer page views than this and the 75th percentile is too shaky to trust. */
export const MIN_VIEWS = 20;
