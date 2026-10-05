import { describe, expect, it } from "vitest";
import { describeDevice, formatDuration, isLeadKind, journeyByDay } from "@/lib/leads";

describe("formatDuration", () => {
  it("reads naturally", () => {
    expect(formatDuration(0)).toBe("0s");
    expect(formatDuration(45)).toBe("45s");
    expect(formatDuration(120)).toBe("2m");
    expect(formatDuration(887)).toBe("14m 47s");
    expect(formatDuration(3700)).toBe("1h 1m");
  });
});

describe("journeyByDay", () => {
  it("orders pages by time, groups them by day and skips empty entries", () => {
    const days = journeyByDay(
      [
        { pageName: "Contact Page", page: "/contact/", timestamp: "2026-05-11T04:57:30Z", totalTimeSpendInSec: 1 },
        { pageName: "", page: "", timestamp: "2026-05-11T05:00:00Z" },
        { pageName: "Home", page: "/", timestamp: "2026-05-10T01:00:00Z", totalTimeSpendInSec: "30" },
        { pageName: "Thank you Page", page: "/thank-you/", timestamp: "2026-05-11T04:43:18Z", totalTimeSpendInSec: 868 },
      ],
      "UTC",
    );
    expect(days.map((day) => day.steps.map((step) => step.name))).toEqual([["Home"], ["Thank you Page", "Contact Page"]]);
    expect(days[0].steps[0].seconds).toBe(30);
  });
});

describe("describeDevice", () => {
  it("keeps the site's short form and shortens raw user agents", () => {
    expect(describeDevice("Mac OS 10.15.7 Chrome")).toBe("Mac OS 10.15.7 Chrome");
    expect(
      describeDevice("Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1"),
    ).toBe("Safari on iOS");
    expect(describeDevice(null)).toBeNull();
  });
});

it("knows the lead kinds", () => {
  expect(isLeadKind("submissions")).toBe(true);
  expect(isLeadKind("users")).toBe(false);
});
