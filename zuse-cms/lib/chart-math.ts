/** Round axis maximum and evenly spaced ticks (0, 25, 50…), never fewer than the data needs. */
export function niceTicks(max: number, count = 4): number[] {
  if (!(max > 0)) return [0, 1];
  const raw = max / count;
  const magnitude = 10 ** Math.floor(Math.log10(raw));
  const step = [1, 2, 2.5, 5, 10].map((m) => m * magnitude).find((candidate) => candidate >= raw) ?? 10 * magnitude;
  const ticks: number[] = [];
  for (let value = 0; value < max + step; value += step) {
    ticks.push(Math.round(value * 1000) / 1000);
    if (value >= max) break;
  }
  return ticks.filter((value) => Number.isInteger(value) || step < 1);
}

/** Change against the previous period: { text: "+12%", direction }; null when there's nothing to compare. */
export function delta(current: number, previous: number): { text: string; direction: "up" | "down" | "flat" } | null {
  if (previous === 0 && current === 0) return null;
  if (previous === 0) return { text: "up from 0", direction: "up" };
  const change = Math.round(((current - previous) / previous) * 100);
  if (change === 0) return { text: "no change", direction: "flat" };
  return { text: `${change > 0 ? "+" : ""}${change}%`, direction: change > 0 ? "up" : "down" };
}

export const sum = (values: number[]) => values.reduce((total, value) => total + value, 0);
