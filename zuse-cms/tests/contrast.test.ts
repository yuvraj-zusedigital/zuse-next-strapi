import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { ACCENTS } from "@/lib/accents";
import { contrast, cssVariables, over, parseColor } from "@/lib/contrast";

/**
 * Every colour theme, light and dark, meets WCAG 2 AA: 4.5:1 for text,
 * 3:1 for focus rings. Pairs are the ones the UI actually puts together.
 */
const css = fs.readFileSync(path.join(__dirname, "../app/globals.css"), "utf8");

type Mode = "light" | "dark";
type Color = (name: string) => [number, number, number];
type Pair = { label: string; text: (c: Color) => ReturnType<Color>; on: (c: Color, mode: Mode) => ReturnType<Color>; min?: number };

const TEXT = 4.5;
const pair = (text: string, on: string, label = `${text} on ${on}`): Pair => ({ label, text: (c) => c(text), on: (c) => c(on) });

const PAIRS: Pair[] = [
  pair("--foreground", "--background"),
  pair("--foreground", "--card"),
  pair("--muted-foreground", "--background"),
  pair("--muted-foreground", "--card"),
  pair("--muted-foreground", "--muted"),
  pair("--primary", "--card", "links and icons (text-primary) on cards"),
  pair("--primary", "--background", "text-primary on the page"),
  pair("--primary-foreground", "--primary", "primary button"),
  {
    label: "primary button, hovered (light /80, dark /90)",
    text: (c) => c("--primary-foreground"),
    on: (c, mode) => over(c("--primary"), mode === "light" ? 0.8 : 0.9, c("--card")),
  },
  pair("--secondary-foreground", "--secondary"),
  pair("--accent-foreground", "--accent"),
  {
    label: "destructive button, hovered (red on its 20% / dark 25% tint)",
    text: (c) => c("--destructive"),
    on: (c, mode) => over(c("--destructive"), mode === "light" ? 0.2 : 0.25, c("--card")),
  },
  pair("--sidebar-foreground", "--sidebar"),
  { label: "sidebar links (80%)", text: (c) => over(c("--sidebar-foreground"), 0.8, c("--sidebar")), on: (c) => c("--sidebar") },
  { label: "sidebar group labels (75%)", text: (c) => over(c("--sidebar-foreground"), 0.75, c("--sidebar")), on: (c) => c("--sidebar") },
  pair("--sidebar-primary-foreground", "--sidebar-primary"),
  { ...pair("--ring", "--card", "focus ring"), min: 3 },
];

const base = cssVariables(css, ":root");
const dark = cssVariables(css, ".dark");

describe.each(ACCENTS.map((accent) => accent.value))("%s theme", (accent) => {
  const palette = accent === "zuse" ? {} : cssVariables(css, `:root[data-accent="${accent}"]`);

  it.each(["light", "dark"] as const)("meets WCAG AA in %s mode", (mode) => {
    const vars = { ...base, ...(mode === "dark" ? dark : {}), ...palette };
    const c: Color = (name) => parseColor(`var(${name})`, vars);
    const failures = PAIRS.map(({ label, text, on, min = TEXT }) => ({ label, ratio: contrast(text(c), on(c, mode)), min }))
      .filter(({ ratio, min }) => ratio < min)
      .map(({ label, ratio, min }) => `${label}: ${ratio.toFixed(2)} (needs ${min})`);
    expect(failures).toEqual([]);
  });
});

describe("contrast helpers", () => {
  it("matches known WCAG ratios", () => {
    expect(contrast(parseColor("#000000"), parseColor("#ffffff"))).toBeCloseTo(21, 1);
    expect(contrast(parseColor("#777777"), parseColor("#ffffff"))).toBeCloseTo(4.48, 2);
  });

  it("reads oklch and color-mix like the browser", () => {
    const white = parseColor("oklch(1 0 0)");
    expect(white.map((v) => Math.round(v * 255))).toEqual([255, 255, 255]);
    const mid = parseColor("color-mix(in oklab, #000000 50%, #ffffff)");
    expect(Math.round(mid[0] * 255)).toBe(99); // oklab L 0.5 ≈ #636363
  });
});

/**
 * Glass surfaces are see-through, so text is checked over the worst spot of
 * the backdrop showing through (components/backdrop.tsx): where the colour
 * blobs and the cursor light overlap (darkest in light mode, brightest in
 * dark mode) and the plain page background (the other extreme).
 */
describe.each(ACCENTS.map((accent) => accent.value))("%s theme on glass", (accent) => {
  const palette = accent === "zuse" ? {} : cssVariables(css, `:root[data-accent="${accent}"]`);
  const percent = (value: string) => Number.parseFloat(value) / 100;

  it.each(["light", "dark"] as const)("text stays readable on glass in %s mode", (mode) => {
    const vars = { ...base, ...(mode === "dark" ? dark : {}), ...palette };
    const c: Color = (name) => parseColor(`var(${name})`, vars);
    // The backdrop's blobs (--blob-*), all overlapping, plus the cursor light (.cms-spotlight): the worst case.
    const plain = c(mode === "light" ? "--l-bg" : "--d-bg");
    const blobs = over(
      c(mode === "light" ? "--a-bright" : "--d-primary"),
      mode === "light" ? 0.12 : 0.14,
      ["a", "b", "c", "d"].reduce((behind, blob) => over(c(`--blob-${blob}-color`), percent(vars[`--blob-${blob}-opacity`]), behind), plain),
    );
    // Glass, with the dark-mode sheen (it lightens the panel, so it lowers contrast for light text).
    const glass = (tint: string, opacity: string, behind: ReturnType<Color>) =>
      over(parseColor("#ffffff"), percent(vars["--glass-sheen-opacity"]), over(c(tint), percent(vars[opacity]), behind));
    const sidebar = (behind: ReturnType<Color>) => over(c("--a-ink3"), percent(vars["--sidebar-glass-opacity"]), behind);

    const failures: string[] = [];
    for (const [where, behind] of [["over the colour blobs", blobs], ["over the plain background", plain]] as const) {
      const panel = glass("--glass-tint", "--glass-opacity", behind);
      const menu = glass("--glass-strong-tint", "--glass-strong-opacity", behind);
      const checks: [string, ReturnType<Color>, ReturnType<Color>, number][] = [
        ["text on a panel", c("--foreground"), panel, TEXT],
        ["muted text on a panel", c("--muted-foreground"), panel, TEXT],
        ["links and icons on a panel", c("--primary"), panel, TEXT],
        ["red text on a panel", c("--destructive"), panel, TEXT],
        ["text in a menu or dialog", c("--foreground"), menu, TEXT],
        ["muted text in a menu or dialog", c("--muted-foreground"), menu, TEXT],
        ["sidebar links (80%)", over(c("--sidebar-foreground"), 0.8, sidebar(behind)), sidebar(behind), TEXT],
        ["sidebar group labels (75%)", over(c("--sidebar-foreground"), 0.75, sidebar(behind)), sidebar(behind), TEXT],
      ];
      for (const [label, text, on, min] of checks) {
        const ratio = contrast(text, on);
        if (ratio < min) failures.push(`${label} ${where}: ${ratio.toFixed(2)} (needs ${min})`);
      }
    }
    expect(failures).toEqual([]);
  });
});
