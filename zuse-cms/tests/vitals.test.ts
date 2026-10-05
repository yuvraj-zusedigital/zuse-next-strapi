import { describe, expect, it } from "vitest";
import { formatVital } from "@/lib/vitals";

describe("formatVital", () => {
  it("shows times in ms or seconds and CLS as a plain number", () => {
    expect(formatVital("LCP", 2140)).toBe("2.1 s");
    expect(formatVital("INP", 180.4)).toBe("180 ms");
    expect(formatVital("CLS", 0.034)).toBe("0.03");
    expect(formatVital("CLS", 0.004)).toBe("<0.01");
    expect(formatVital("CLS", 0)).toBe("0.00");
    expect(formatVital("TTFB", null)).toBe("—");
  });
});
