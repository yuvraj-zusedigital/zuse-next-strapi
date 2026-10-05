/** Colour themes (html[data-accent]); palettes are in app/globals.css. Works with light and dark. */
export const ACCENTS = [
  { value: "zuse", label: "Zuse Blue", swatch: "#1f2996" },
  { value: "emerald", label: "Emerald", swatch: "oklch(0.5 0.16 163)" },
  { value: "violet", label: "Violet", swatch: "oklch(0.5 0.16 293)" },
  { value: "sunset", label: "Sunset", swatch: "oklch(0.6 0.17 45)" },
  { value: "rose", label: "Rose", swatch: "oklch(0.55 0.18 12)" },
  { value: "ocean", label: "Ocean", swatch: "oklch(0.5 0.16 232)" },
  { value: "teal", label: "Teal", swatch: "oklch(0.5 0.12 192)" },
  { value: "amber", label: "Amber", swatch: "oklch(0.62 0.15 68)" },
  { value: "fuchsia", label: "Fuchsia", swatch: "oklch(0.52 0.2 328)" },
  { value: "graphite", label: "Graphite", swatch: "oklch(0.4 0.02 260)" },
] as const;
export type Accent = (typeof ACCENTS)[number]["value"];
/**
 * The theme is saved on the user's account; this cookie mirrors it so the
 * server can render the right colours from the first frame (app/layout.tsx).
 */
export const ACCENT_COOKIE = "cms-accent";
export const ACCENT_COOKIE_MAX_AGE = 60 * 60 * 24 * 365;

export const isAccent = (value: string | null | undefined): value is Accent => ACCENTS.some((item) => item.value === value);
