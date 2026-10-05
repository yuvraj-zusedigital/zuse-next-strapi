/**
 * Visitor journey for enquiries: the pages someone views, and for how long,
 * kept only in their own browser (localStorage "trackingData") and sent with
 * a contact or subscribe form (lib/ezforms.ts). Strapi stores it as "User
 * Tracking" and the CMS shows it on the submission. The entry format matches
 * what the previous site recorded, so old and new records read the same.
 */

export const TRACKING_KEY = "trackingData";
const MAX_ENTRIES = 60;
const MAX_AGE_MS = 30 * 24 * 60 * 60 * 1000;

export type TrackingEntry = {
  pageName: string;
  page: string;
  timestamp: string;
  totalTimeSpendInSec: number;
  lastvistTimestamp: string;
  timeformated: string;
  totalTimeSpendInMin: string;
};

/** "Contact Us | Zuse Digital" → "Contact Us"; the home page (or no title) → "Home" / the path. */
export function pageNameFrom(title: string, path: string) {
  if (path === "/") return "Home";
  const name = title.split(/\s+[|–—]\s+/)[0]?.trim();
  return name || path;
}

const melbourne = new Intl.DateTimeFormat("en-AU", {
  timeZone: "Australia/Melbourne",
  day: "numeric",
  month: "long",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  hour12: true,
});

/** The fields derived from the time spent and the last moment on the page. */
export function withTime(entry: TrackingEntry, seconds: number, now: Date): TrackingEntry {
  const total = Math.max(0, Math.round(seconds));
  return {
    ...entry,
    totalTimeSpendInSec: total,
    totalTimeSpendInMin: `${Math.floor(total / 60)}:${String(total % 60).padStart(2, "0")}`,
    lastvistTimestamp: now.toISOString(),
    timeformated: melbourne.format(now).replace(",", " at"),
  };
}

export function newEntry(path: string, title: string, now: Date): TrackingEntry {
  return withTime(
    {
      pageName: pageNameFrom(title, path),
      page: path,
      timestamp: now.toISOString(),
      totalTimeSpendInSec: 0,
      lastvistTimestamp: "",
      timeformated: "",
      totalTimeSpendInMin: "",
    },
    0,
    now,
  );
}

/** Drops entries older than 30 days and keeps the most recent 60. */
export function prune(entries: TrackingEntry[], now: Date) {
  return entries.filter((entry) => now.getTime() - new Date(entry.timestamp).getTime() < MAX_AGE_MS).slice(-MAX_ENTRIES);
}

export function readEntries(): TrackingEntry[] {
  try {
    const value = JSON.parse(window.localStorage.getItem(TRACKING_KEY) || "[]");
    return Array.isArray(value) ? value : [];
  } catch {
    return [];
  }
}

export function writeEntries(entries: TrackingEntry[]) {
  try {
    window.localStorage.setItem(TRACKING_KEY, JSON.stringify(entries));
  } catch {
    // Storage full or blocked (private mode): the journey just isn't recorded.
  }
}

/** Visitors who ask not to be tracked (Global Privacy Control or Do Not Track) aren't. */
export function trackingAllowed() {
  const nav = navigator as Navigator & { globalPrivacyControl?: boolean };
  return !(nav.globalPrivacyControl || navigator.doNotTrack === "1");
}
