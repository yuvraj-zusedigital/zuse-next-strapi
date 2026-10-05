/**
 * WCAG contrast for the CMS colour themes (app/globals.css), used by
 * tests/contrast.test.ts. Understands the formats the palettes use: #hex,
 * oklch(L C H) and color-mix(in oklab, A p%, B).
 */

type Rgb = [number, number, number]; // sRGB, 0–1
type Oklab = [number, number, number];

const clamp = (value: number) => Math.min(1, Math.max(0, value));
const toLinear = (c: number) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
const fromLinear = (c: number) => (c <= 0.0031308 ? c * 12.92 : 1.055 * c ** (1 / 2.4) - 0.055);

function oklabToRgb([L, a, b]: Oklab): Rgb {
  const l = (L + 0.3963377774 * a + 0.2158037573 * b) ** 3;
  const m = (L - 0.1055613458 * a - 0.0638541728 * b) ** 3;
  const s = (L - 0.0894841775 * a - 1.291485548 * b) ** 3;
  return [
    4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
    -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
    -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s,
  ].map((c) => clamp(fromLinear(c))) as Rgb;
}

function rgbToOklab(rgb: Rgb): Oklab {
  const [r, g, b] = rgb.map(toLinear);
  const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b);
  const m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b);
  const s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b);
  return [
    0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s,
    1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s,
    0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s,
  ];
}

/** Parses one colour; var(--x) is looked up in `vars`. */
export function parseColor(value: string, vars: Record<string, string> = {}): Rgb {
  const text = value.trim();
  const variable = /^var\((--[\w-]+)\)$/.exec(text);
  if (variable) {
    if (!(variable[1] in vars)) throw new Error(`Unknown ${variable[1]}`);
    return parseColor(vars[variable[1]], vars);
  }
  const hex = /^#([0-9a-f]{6})$/i.exec(text);
  if (hex) return [0, 2, 4].map((i) => parseInt(hex[1].slice(i, i + 2), 16) / 255) as Rgb;
  const oklch = /^oklch\(\s*([\d.]+)\s+([\d.]+)\s+([\d.]+)\s*\)$/.exec(text);
  if (oklch) {
    const [L, C, H] = oklch.slice(1).map(Number);
    const radians = (H * Math.PI) / 180;
    return oklabToRgb([L, C * Math.cos(radians), C * Math.sin(radians)]);
  }
  const mix = /^color-mix\(in oklab,\s*(.+?)\s+([\d.]+)%,\s*(.+)\)$/.exec(text);
  if (mix) {
    const a = rgbToOklab(parseColor(mix[1], vars));
    const b = rgbToOklab(parseColor(mix[3], vars));
    const p = Number(mix[2]) / 100;
    return oklabToRgb([0, 1, 2].map((i) => a[i] * p + b[i] * (1 - p)) as Oklab);
  }
  throw new Error(`Can't read colour "${text}"`);
}

const luminance = (rgb: Rgb) => {
  const [r, g, b] = rgb.map(toLinear);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};

/** WCAG 2 contrast ratio, 1–21. */
export function contrast(a: Rgb, b: Rgb) {
  const [light, dark] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (light + 0.05) / (dark + 0.05);
}

/** The custom properties declared in every top-level `selector { … }` block, e.g. `:root[data-accent="rose"]`. */
export function cssVariables(css: string, selector: string) {
  const vars: Record<string, string> = {};
  const head = `\n${selector} {`;
  let start = css.indexOf(head);
  if (start < 0) throw new Error(`No ${selector} block`);
  while (start >= 0) {
    const body = css.slice(start + head.length, css.indexOf("}", start));
    for (const match of body.matchAll(/(--[\w-]+)\s*:\s*([^;]+);/g)) vars[match[1]] = match[2].trim();
    start = css.indexOf(head, start + 1);
  }
  return vars;
}

/** `top` at `alpha` opacity over `bottom` (how the browser blends e.g. text-white/60 or bg-primary/80). */
export const over = (top: Rgb, alpha: number, bottom: Rgb): Rgb => top.map((c, i) => c * alpha + bottom[i] * (1 - alpha)) as Rgb;
