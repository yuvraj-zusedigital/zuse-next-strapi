"use client";

import { useEffect, useState, useTransition } from "react";
import Link from "next/link";
import { Gauge, Loader2 } from "lucide-react";
import { loadPageVitals, type PageVitalsResult } from "@/app/(cms)/[type]/vitals-actions";
import type { VitalName, VitalSummary } from "@/lib/types";
import { cn } from "@/lib/utils";
import { formatVital, MIN_VIEWS, RATING_LABEL, RATING_STYLE, VITALS } from "@/lib/vitals";

const DEVICES = [
  ["all", "All visitors"],
  ["mobile", "Phones"],
  ["desktop", "Desktop"],
] as const;

function VitalCard({ name, summary }: { name: VitalName; summary: VitalSummary }) {
  const stat = summary[name];
  return (
    <div className="rounded-lg bg-muted/60 px-3 py-2" data-hint={`${VITALS[name].what} ${VITALS[name].good}.`}>
      <div className="text-[11px] tracking-wide text-muted-foreground uppercase">
        {VITALS[name].label} · {name}
      </div>
      <div className="flex items-baseline gap-2">
        <span className="text-lg font-semibold tabular-nums">{formatVital(name, stat.p75)}</span>
        {stat.rating && <span className={cn("rounded px-1.5 py-0.5 text-[11px] font-medium", RATING_STYLE[stat.rating])}>{RATING_LABEL[stat.rating]}</span>}
      </div>
    </div>
  );
}

/**
 * How fast the page is for real visitors (last 28 days): the 75th percentile
 * of loading, responsiveness and visual stability, as Google measures them.
 */
export function WebVitalsPanel({ path }: { path: string | null }) {
  const [result, setResult] = useState<PageVitalsResult | null>(null);
  const [device, setDevice] = useState<(typeof DEVICES)[number][0]>("all");
  const [loading, startLoading] = useTransition();

  useEffect(() => {
    if (!path) return;
    const timer = window.setTimeout(() => startLoading(async () => setResult(await loadPageVitals(path))), 600);
    return () => window.clearTimeout(timer);
  }, [path]);

  const heading = (
    <div className="flex items-center gap-2 text-sm font-medium">
      <Gauge className="size-4 text-primary" /> Speed for real visitors, last 28 days
      {loading && <Loader2 className="size-3.5 animate-spin text-muted-foreground" />}
      <Link href="/speed" className="ml-auto text-xs font-normal text-primary hover:underline">
        All pages
      </Link>
    </div>
  );

  if (!path) {
    return (
      <div className="space-y-2">
        {heading}
        <p className="text-sm text-muted-foreground">Set the page&apos;s path to see its speed.</p>
      </div>
    );
  }
  if (!result) return <div className="space-y-2">{heading}</div>;
  if (result.status === "error") {
    return (
      <div className="space-y-2">
        {heading}
        <p className="text-sm text-destructive">{result.message}</p>
      </div>
    );
  }

  const summary = result.data[device];
  const views = Math.max(summary.LCP.count, summary.TTFB.count);
  return (
    <div className="space-y-3">
      {heading}
      {result.data.all.TTFB.count === 0 && result.data.all.LCP.count === 0 ? (
        <p className="text-sm text-muted-foreground">
          No visitor data yet. The live site reports how fast each page loads for real visitors; figures appear here once this page has had visits.
        </p>
      ) : (
        <>
          <div className="inline-flex rounded-lg bg-muted p-0.5 text-xs" role="tablist" aria-label="Device">
            {DEVICES.map(([key, label]) => (
              <button
                key={key}
                type="button"
                role="tab"
                aria-selected={device === key}
                onClick={() => setDevice(key)}
                className={cn("rounded-md px-2.5 py-1 transition-colors", device === key ? "bg-card font-medium text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground")}
              >
                {label}
              </button>
            ))}
          </div>
          <div className="grid gap-2 @md:grid-cols-3">
            {(["LCP", "INP", "CLS"] as const).map((name) => (
              <VitalCard key={name} name={name} summary={summary} />
            ))}
          </div>
          <p className="text-xs text-muted-foreground">
            {views} page {views === 1 ? "view" : "views"} · first content {formatVital("FCP", summary.FCP.p75)} · server response {formatVital("TTFB", summary.TTFB.p75)}. Values are the
            75th percentile: 3 in 4 visits were at least this fast.
            {views > 0 && views < MIN_VIEWS && " Few visits so far, so these figures will still move."}
          </p>
        </>
      )}
    </div>
  );
}
