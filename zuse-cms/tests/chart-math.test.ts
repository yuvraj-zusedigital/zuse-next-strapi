import { describe, expect, it } from "vitest";
import { delta, niceTicks } from "@/lib/chart-math";

describe("niceTicks", () => {
  it("rounds the axis to clean steps that cover the maximum", () => {
    expect(niceTicks(158)).toEqual([0, 50, 100, 150, 200]);
    expect(niceTicks(27)).toEqual([0, 10, 20, 30]);
    expect(niceTicks(3)).toEqual([0, 1, 2, 3]);
    expect(niceTicks(0)).toEqual([0, 1]);
  });
});

describe("delta", () => {
  it("compares with the previous period", () => {
    expect(delta(120, 100)).toEqual({ text: "+20%", direction: "up" });
    expect(delta(50, 100)).toEqual({ text: "-50%", direction: "down" });
    expect(delta(5, 0)).toEqual({ text: "up from 0", direction: "up" });
    expect(delta(0, 0)).toBeNull();
    expect(delta(100, 100)).toEqual({ text: "no change", direction: "flat" });
  });
});
