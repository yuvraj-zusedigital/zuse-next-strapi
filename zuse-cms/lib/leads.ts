import type { JourneyStep, LeadKind } from "@/lib/types";

/** The three lead screens (Admins): /leads/submissions, /leads/subscribers, /leads/tracking. */
export const LEAD_KINDS: Record<LeadKind, { title: string; singular: string; description: string; empty: string }> = {
  submissions: {
    title: "Form submissions",
    singular: "submission",
    description: "Enquiries from the website's contact forms, newest first.",
    empty: "No form submissions yet.",
  },
  subscribers: {
    title: "Subscribers",
    singular: "subscriber",
    description: "People who signed up for updates from the blog.",
    empty: "No subscribers yet.",
  },
  tracking: {
    title: "Visitor tracking",
    singular: "visit record",
    description: "The pages each person viewed before they got in touch.",
    empty: "No visitor tracking yet.",
  },
};

export const isLeadKind = (value: string): value is LeadKind => value in LEAD_KINDS;

/** 0 → "0s", 75 → "1m 15s", 3700 → "1h 1m". */
export function formatDuration(totalSeconds: number) {
  const seconds = Math.max(0, Math.round(totalSeconds || 0));
  if (seconds < 60) return `${seconds}s`;
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  if (hours) return `${hours}h ${minutes}m`;
  const rest = seconds % 60;
  return rest ? `${minutes}m ${rest}s` : `${minutes}m`;
}

export type JourneyDay = { day: string; steps: { name: string; path: string | null; at: Date | null; seconds: number }[] };

/** Pages in visit order, grouped by day (in `timeZone`), skipping empty entries. */
export function journeyByDay(steps: JourneyStep[], timeZone?: string): JourneyDay[] {
  const dayFormat = new Intl.DateTimeFormat("en-AU", { dateStyle: "full", timeZone });
  const clean = steps
    .filter((step) => step && (step.pageName || step.page))
    .map((step) => {
      const at = step.timestamp ? new Date(step.timestamp) : null;
      return {
        name: String(step.pageName || step.page),
        path: step.page ? String(step.page) : null,
        at: at && !Number.isNaN(at.getTime()) ? at : null,
        seconds: Number(step.totalTimeSpendInSec) || 0,
      };
    })
    .sort((a, b) => (a.at?.getTime() ?? 0) - (b.at?.getTime() ?? 0));

  const days: JourneyDay[] = [];
  for (const step of clean) {
    const day = step.at ? dayFormat.format(step.at) : "Unknown date";
    const last = days.at(-1);
    if (last?.day === day) last.steps.push(step);
    else days.push({ day, steps: [step] });
  }
  return days;
}

/** "Mac OS 10.15.7 Chrome" stays; a raw user-agent string becomes "Chrome on macOS". */
export function describeDevice(device: string | null | undefined) {
  if (!device) return null;
  if (!device.startsWith("Mozilla/")) return device;
  const browser = /Edg\//.test(device)
    ? "Edge"
    : /Firefox\//.test(device)
      ? "Firefox"
      : /Chrome\//.test(device)
        ? "Chrome"
        : /Safari\//.test(device)
          ? "Safari"
          : "Browser";
  const os = /iPhone|iPad/.test(device)
    ? "iOS"
    : /Android/.test(device)
      ? "Android"
      : /Mac OS X/.test(device)
        ? "macOS"
        : /Windows/.test(device)
          ? "Windows"
          : /Linux/.test(device)
            ? "Linux"
            : null;
  return os ? `${browser} on ${os}` : browser;
}
