"use client";

import { useEffect, useState, useTransition } from "react";
import { ArrowUpRight, Loader2, Plus, TrendingUp } from "lucide-react";
import { getSearchPerformance, type SearchPerformanceResult } from "@/app/(cms)/[type]/search-actions";
import { cn } from "@/lib/utils";

const number = new Intl.NumberFormat("en", { notation: "compact", maximumFractionDigits: 1 });
const percent = new Intl.NumberFormat("en", { style: "percent", maximumFractionDigits: 1 });
const dayLabel = (iso: string) => new Date(`${iso}T00:00:00Z`).toLocaleDateString(undefined, { day: "numeric", month: "short", timeZone: "UTC" });

function Stat({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="rounded-lg bg-muted/60 px-3 py-2" title={hint}>
      <div className="text-[11px] tracking-wide text-muted-foreground uppercase">{label}</div>
      <div className="text-lg font-semibold tabular-nums">{value}</div>
    </div>
  );
}

/** Clicks per day as a small area chart. */
function Sparkline({ trend }: { trend: { date: string; clicks: number }[] }) {
  if (trend.length < 2) return null;
  const max = Math.max(1, ...trend.map((day) => day.clicks));
  const points = trend.map((day, index) => [(index / (trend.length - 1)) * 100, 28 - (day.clicks / max) * 26] as const);
  const line = points.map(([x, y]) => `${x.toFixed(2)},${y.toFixed(2)}`).join(" ");
  return (
    <svg viewBox="0 0 100 30" preserveAspectRatio="none" className="h-12 w-full text-primary" aria-label="Clicks per day" role="img">
      <polygon points={`0,30 ${line} 100,30`} className="fill-current opacity-15" />
      <polyline points={line} fill="none" className="stroke-current" strokeWidth="1.5" vectorEffect="non-scaling-stroke" />
    </svg>
  );
}

/**
 * Google Search Console figures for the page (last 28 days): totals, a click
 * trend and the top queries, each of which can become the focus keyword.
 */
export function SearchPerformance({ path, focusKeyword, onUseKeyword }: { path: string | null; focusKeyword: string; onUseKeyword: (query: string) => void }) {
  const [result, setResult] = useState<SearchPerformanceResult | null>(null);
  const [loading, startLoading] = useTransition();

  useEffect(() => {
    if (!path) return;
    // Wait until the path stops changing (it's typed into the form).
    const timer = window.setTimeout(() => startLoading(async () => setResult(await getSearchPerformance(path))), 600);
    return () => window.clearTimeout(timer);
  }, [path]);

  const heading = (
    <div className="flex items-center gap-2 text-sm font-medium">
      <TrendingUp className="size-4 text-primary" /> Google search, last 28 days
      {loading && <Loader2 className="size-3.5 animate-spin text-muted-foreground" />}
      {result?.status === "ok" && result.data.demo && (
        <span className="rounded bg-amber-500/15 px-1.5 py-0.5 text-[11px] font-medium text-amber-700 dark:text-amber-400">Demo data</span>
      )}
    </div>
  );

  if (!path) {
    return (
      <div className="space-y-1">
        {heading}
        <p className="text-sm text-muted-foreground">Set the page&apos;s path to see how it performs in Google.</p>
      </div>
    );
  }
  if (!result || result.status === "not-connected") {
    return (
      <div className="space-y-1">
        {heading}
        <p className="text-sm text-muted-foreground">
          {result ? "Connect Google Search Console to see clicks, impressions and the searches that lead here (see docs/cms-deployment.md)." : "Loading…"}
        </p>
      </div>
    );
  }
  if (result.status === "error") {
    return (
      <div className="space-y-1">
        {heading}
        <p className="text-sm text-destructive">{result.message}</p>
      </div>
    );
  }

  const { totals, trend, queries, range, pageUrl } = result.data;
  const keyword = focusKeyword.trim().toLowerCase();

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        {heading}
        <a href={pageUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-0.5 text-xs text-muted-foreground hover:text-foreground">
          {dayLabel(range.start)} – {dayLabel(range.end)} <ArrowUpRight className="size-3" />
        </a>
      </div>
      <div className="grid grid-cols-2 gap-2 @md:grid-cols-4">
        <Stat label="Clicks" value={number.format(totals.clicks)} />
        <Stat label="Impressions" value={number.format(totals.impressions)} hint="Times the page appeared in search results" />
        <Stat label="CTR" value={percent.format(totals.ctr)} hint="Click-through rate: clicks ÷ impressions" />
        <Stat label="Avg. position" value={totals.position ? totals.position.toFixed(1) : "–"} hint="Average rank in results (1 = top)" />
      </div>
      <Sparkline trend={trend} />
      {queries.length > 0 ? (
        <div>
          <div className="mb-1 text-xs text-muted-foreground">Top searches leading to this page</div>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-[11px] tracking-wide text-muted-foreground uppercase">
                <th className="py-1 font-medium">Search</th>
                <th className="py-1 text-right font-medium">Clicks</th>
                <th className="hidden py-1 text-right font-medium @md:table-cell">Impr.</th>
                <th className="py-1 text-right font-medium">Pos.</th>
                <th className="w-8" />
              </tr>
            </thead>
            <tbody>
              {queries.map((row) => {
                const isFocus = row.query.toLowerCase() === keyword;
                return (
                  <tr key={row.query} className="border-t">
                    <td className={cn("py-1.5 pr-2", isFocus && "font-medium text-primary")}>{row.query}</td>
                    <td className="py-1.5 text-right tabular-nums">{number.format(row.clicks)}</td>
                    <td className="hidden py-1.5 text-right tabular-nums @md:table-cell">{number.format(row.impressions)}</td>
                    <td className="py-1.5 text-right tabular-nums">{row.position.toFixed(1)}</td>
                    <td className="py-1.5 text-right">
                      {!isFocus && (
                        <button
                          type="button"
                          onClick={() => onUseKeyword(row.query)}
                          title="Use as focus keyword"
                          aria-label={`Use “${row.query}” as focus keyword`}
                          className="inline-grid size-6 place-items-center rounded text-muted-foreground hover:bg-muted hover:text-foreground"
                        >
                          <Plus className="size-3.5" />
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">No search data for this page in this period yet.</p>
      )}
    </div>
  );
}
