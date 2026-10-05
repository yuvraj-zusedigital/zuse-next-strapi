"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { newEntry, prune, readEntries, trackingAllowed, withTime, writeEntries } from "@/lib/visit-tracking";

const SAVE_EVERY_MS = 5000;

/**
 * Records the current page and the time it's actually visible (paused while
 * the tab is in the background) into the visitor journey. Renders nothing.
 */
export default function VisitTracker() {
  const pathname = usePathname();

  useEffect(() => {
    if (!pathname || !trackingAllowed()) return;

    const started = new Date();
    const id = started.toISOString();
    const entries = readEntries();
    // Same page entered again within a moment (React re-running effects in development): replace it.
    const last = entries.at(-1);
    if (last?.page === pathname && started.getTime() - new Date(last.timestamp).getTime() < 1500) entries.pop();
    writeEntries(prune([...entries, newEntry(pathname, document.title, started)], started));

    let visibleMs = 0;
    let visibleSince: number | null = document.visibilityState === "visible" ? Date.now() : null;

    const save = () => {
      const now = new Date();
      const seconds = (visibleMs + (visibleSince ? Date.now() - visibleSince : 0)) / 1000;
      const entries = readEntries();
      const index = entries.findIndex((entry) => entry.timestamp === id);
      if (index === -1) return; // cleared after a form was sent
      // The title may only be set after the page renders, so refresh the name too.
      entries[index] = withTime({ ...entries[index], ...newEntry(pathname, document.title, started), timestamp: id }, seconds, now);
      writeEntries(entries);
    };

    const onVisibility = () => {
      if (document.visibilityState === "visible") {
        visibleSince = Date.now();
      } else if (visibleSince) {
        visibleMs += Date.now() - visibleSince;
        visibleSince = null;
        save();
      }
    };

    const timer = window.setInterval(() => {
      if (visibleSince) save();
    }, SAVE_EVERY_MS);
    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("pagehide", save);
    const nameTimer = window.setTimeout(save, 500);

    return () => {
      save();
      window.clearInterval(timer);
      window.clearTimeout(nameTimer);
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("pagehide", save);
    };
  }, [pathname]);

  return null;
}
