"use client";

import { useId, useRef, useState } from "react";
import Link from "next/link";
import { ArrowDownRight, ArrowRight, ArrowUpRight } from "lucide-react";
import { delta, niceTicks } from "@/lib/chart-math";
import { cn } from "@/lib/utils";

/* Dashboard charts. Conventions (dataviz skill): thin marks with a 4px
 * rounded data end, a 2px surface gap between touching segments, hairline
 * recessive grid, text in text colours (never the series colour), a hover +
 * focus tooltip on every mark, and a table view for every chart. */

const number = new Intl.NumberFormat("en-AU");

type Tip = { x: number; y: number; value: string; label: string } | null;

/** One tooltip per chart, positioned inside the chart box. Value first, label second. */
function useTooltip() {
  const box = useRef<HTMLDivElement>(null);
  const [tip, setTip] = useState<Tip>(null);
  const show = (target: Element, value: string, label: string) => {
    const outer = box.current?.getBoundingClientRect();
    const rect = target.getBoundingClientRect();
    if (!outer) return;
    setTip({ x: rect.left + rect.width / 2 - outer.left, y: rect.top - outer.top, value, label });
  };
  const bubble = tip && (
    <div
      role="tooltip"
      className="pointer-events-none absolute z-20 -translate-x-1/2 -translate-y-full rounded-md bg-foreground px-2.5 py-1.5 text-xs whitespace-nowrap text-background shadow-lg"
      style={{ left: tip.x, top: tip.y - 6 }}
    >
      <div className="font-semibold tabular-nums">{tip.value}</div>
      <div className="opacity-75">{tip.label}</div>
    </div>
  );
  return { box, show, hide: () => setTip(null), bubble };
}

function TableToggle({ caption, head, rows }: { caption: string; head: string[]; rows: (string | number)[][] }) {
  return (
    <details className="mt-3 text-xs text-muted-foreground">
      <summary className="cursor-pointer select-none hover:text-foreground">Show as table</summary>
      <table className="mt-2 w-full text-left text-sm text-foreground">
        <caption className="sr-only">{caption}</caption>
        <thead className="text-xs text-muted-foreground">
          <tr>
            {head.map((cell, index) => (
              <th key={cell} className={cn("py-1 font-medium", index > 0 && "text-right")}>
                {cell}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={String(row[0])} className="border-t">
              {row.map((cell, index) => (
                <td key={index} className={cn("py-1", index > 0 && "text-right tabular-nums")}>
                  {typeof cell === "number" ? number.format(cell) : cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </details>
  );
}

// ── Stat tile: label, value, change vs the previous period, optional sparkline ──

export function StatTile({
  label,
  value,
  previous,
  upIsGood,
  trend,
  href,
  note,
}: {
  label: string;
  value: number;
  previous?: number;
  /** Colours the change: true = rising is good (green), false = rising is bad, undefined = neutral. */
  upIsGood?: boolean;
  trend?: number[];
  href?: string;
  note?: string;
}) {
  const change = previous === undefined ? null : delta(value, previous);
  const Arrow = change?.direction === "up" ? ArrowUpRight : change?.direction === "down" ? ArrowDownRight : ArrowRight;
  const good = change && upIsGood !== undefined && change.direction !== "flat" ? (change.direction === "up") === upIsGood : null;
  const body = (
    <div className="cms-glass flex h-full flex-col justify-between gap-3 rounded-2xl p-4 transition-shadow hover:shadow-md">
      <div className="text-sm text-muted-foreground">{label}</div>
      <div className="flex items-end justify-between gap-3">
        <div>
          <div className="text-3xl font-semibold tracking-tight">{number.format(value)}</div>
          {change ? (
            <div
              className={cn(
                "mt-1 inline-flex items-center gap-0.5 text-xs font-medium",
                good === true ? "text-emerald-700 dark:text-emerald-400" : good === false ? "text-destructive" : "text-muted-foreground",
              )}
            >
              <Arrow className="size-3.5" aria-hidden="true" />
              {change.text} <span className="font-normal text-muted-foreground">vs previous 7 days</span>
            </div>
          ) : (
            note && <div className="mt-1 text-xs text-muted-foreground">{note}</div>
          )}
        </div>
        {trend && trend.length > 1 && <Sparkline values={trend} label={label} />}
      </div>
    </div>
  );
  return href ? (
    <Link href={href} className="block rounded-2xl outline-none focus-visible:ring-3 focus-visible:ring-ring/50">
      {body}
    </Link>
  ) : (
    body
  );
}

/** Small trend line: muted history, the latest point in the accent. */
function Sparkline({ values, label }: { values: number[]; label: string }) {
  const max = Math.max(1, ...values);
  const points = values.map((value, index) => [(index / (values.length - 1)) * 96 + 2, 26 - (value / max) * 22] as const);
  const [lastX, lastY] = points[points.length - 1];
  return (
    <svg viewBox="0 0 100 30" className="h-8 w-24 shrink-0 overflow-visible" role="img" aria-label={`${label}: last ${values.length} days`}>
      <polyline points={points.map(([x, y]) => `${x},${y}`).join(" ")} fill="none" className="stroke-muted-foreground/40" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
      <circle cx={lastX} cy={lastY} r="4" className="fill-[var(--chart-series)] stroke-card" strokeWidth="2" />
    </svg>
  );
}

// ── Content by type and status: horizontal stacked bars on one shared scale ──

const STATUSES = [
  { key: "published", label: "Published", color: "var(--chart-published)", filter: "published" },
  { key: "modified", label: "Unpublished changes", color: "var(--chart-modified)", filter: "modified" },
  { key: "draft", label: "Draft", color: "var(--chart-draft)", filter: "draft" },
] as const;

export type ContentRow = { slug: string; label: string; published: number; modified: number; draft: number };

export function ContentChart({ rows }: { rows: ContentRow[] }) {
  const { box, show, hide, bubble } = useTooltip();
  const sorted = [...rows].sort((a, b) => b.published + b.modified + b.draft - (a.published + a.modified + a.draft));
  const max = Math.max(1, ...sorted.map((row) => row.published + row.modified + row.draft));
  const totals = STATUSES.map((status) => sorted.reduce((sum, row) => sum + row[status.key], 0));

  return (
    <div>
      <ul className="mb-4 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground" aria-label="Legend">
        {STATUSES.map((status, index) => (
          <li key={status.key} className="inline-flex items-center gap-1.5">
            <span className="size-2.5 rounded-[3px]" style={{ background: status.color }} aria-hidden="true" />
            {status.label} <span className="text-foreground tabular-nums">{number.format(totals[index])}</span>
          </li>
        ))}
      </ul>
      <div ref={box} className="relative space-y-2.5" onPointerLeave={hide}>
        {sorted.map((row) => {
          const total = row.published + row.modified + row.draft;
          const segments = STATUSES.filter((status) => row[status.key] > 0);
          return (
            <div key={row.slug} className="grid grid-cols-[7.5rem_minmax(0,1fr)] items-center gap-3 sm:grid-cols-[9rem_minmax(0,1fr)]">
              <Link href={`/${row.slug}`} className="truncate text-sm hover:text-primary hover:underline" title={`Open ${row.label}`}>
                {row.label}
              </Link>
              <div className="flex items-center gap-2">
                <div className="flex h-4 gap-[2px]" style={{ width: `${(total / max) * 100}%`, minWidth: total ? 6 : 0 }}>
                  {segments.map((status, index) => (
                    <Link
                      key={status.key}
                      href={`/${row.slug}${row.slug === "text-snippet" ? "" : `?status=${status.filter}`}`}
                      aria-label={`${row.label}: ${row[status.key]} ${status.label.toLowerCase()}`}
                      onPointerEnter={(event) => show(event.currentTarget, number.format(row[status.key]), `${row.label} · ${status.label}`)}
                      onFocus={(event) => show(event.currentTarget, number.format(row[status.key]), `${row.label} · ${status.label}`)}
                      onBlur={hide}
                      className={cn("h-full transition-[filter] outline-none hover:brightness-110 focus-visible:ring-2 focus-visible:ring-ring", index === segments.length - 1 && "rounded-r-[4px]")}
                      style={{ flexGrow: row[status.key], flexBasis: 0, background: status.color, minWidth: 3 }}
                    />
                  ))}
                </div>
                <span className="shrink-0 text-xs text-muted-foreground tabular-nums">{number.format(total)}</span>
              </div>
            </div>
          );
        })}
        {bubble}
      </div>
      <TableToggle
        caption="Entries by content type and status"
        head={["Type", ...STATUSES.map((status) => status.label), "Total"]}
        rows={sorted.map((row) => [row.label, row.published, row.modified, row.draft, row.published + row.modified + row.draft])}
      />
    </div>
  );
}

// ── Column chart: one series over time (edits per day, enquiries per week) ──

export function ColumnChart({
  points,
  valueLabel,
  caption,
  labelEvery = 1,
  empty,
}: {
  points: { key: string; label: string; short: string; value: number }[];
  /** "edits", "enquiries" — used in the tooltip and table. */
  valueLabel: string;
  caption: string;
  /** Show every nth x-axis label, counted back from the latest, so labels never collide. */
  labelEvery?: number;
  /** Shown instead of an empty plot when every value is 0. */
  empty?: string;
}) {
  const { box, show, hide, bubble } = useTooltip();
  const id = useId();
  const ticks = niceTicks(Math.max(...points.map((point) => point.value)));
  const top = ticks[ticks.length - 1];
  const HEIGHT = 160;

  if (empty && points.every((point) => point.value === 0)) {
    return <p className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">{empty}</p>;
  }

  return (
    <div>
      <div ref={box} className="relative" onPointerLeave={hide}>
        <div className="grid grid-cols-[2rem_minmax(0,1fr)] gap-2">
          {/* y-axis */}
          <div className="relative text-right text-[11px] text-muted-foreground tabular-nums" style={{ height: HEIGHT }} aria-hidden="true">
            {ticks.map((tick) => (
              <span key={tick} className="absolute right-0 -translate-y-1/2" style={{ top: HEIGHT - (tick / top) * HEIGHT }}>
                {number.format(tick)}
              </span>
            ))}
          </div>
          <div className="relative" style={{ height: HEIGHT }}>
            {ticks.map((tick) => (
              <div key={tick} className="absolute inset-x-0 border-t border-[var(--chart-grid)]" style={{ top: HEIGHT - (tick / top) * HEIGHT }} aria-hidden="true" />
            ))}
            <div className="absolute inset-0 flex items-end gap-[2px]" role="list" aria-labelledby={`${id}-caption`}>
              {points.map((point) => (
                <div
                  key={point.key}
                  role="listitem"
                  tabIndex={0}
                  aria-label={`${point.label}: ${number.format(point.value)} ${valueLabel}`}
                  onPointerEnter={(event) => show(event.currentTarget.firstElementChild ?? event.currentTarget, number.format(point.value), `${valueLabel} · ${point.label}`)}
                  onFocus={(event) => show(event.currentTarget.firstElementChild ?? event.currentTarget, number.format(point.value), `${valueLabel} · ${point.label}`)}
                  onBlur={hide}
                  className="group flex h-full min-w-0 flex-1 items-end justify-center outline-none"
                >
                  <div
                    className="w-full max-w-6 rounded-t-[4px] bg-[var(--chart-series)] transition-[filter] group-hover:brightness-110 group-focus-visible:ring-2 group-focus-visible:ring-ring"
                    style={{ height: point.value ? Math.max(2, (point.value / top) * HEIGHT) : 0 }}
                  />
                </div>
              ))}
            </div>
          </div>
          {/* x-axis */}
          <div />
          <div className="flex gap-[2px] text-[11px] text-muted-foreground" aria-hidden="true">
            {points.map((point, index) => (
              <span key={point.key} className="min-w-0 flex-1 overflow-visible text-center whitespace-nowrap">
                {(points.length - 1 - index) % labelEvery === 0 ? point.short : ""}
              </span>
            ))}
          </div>
        </div>
        {bubble}
      </div>
      <span id={`${id}-caption`} className="sr-only">
        {caption}
      </span>
      <TableToggle caption={caption} head={["Period", valueLabel[0].toUpperCase() + valueLabel.slice(1)]} rows={points.map((point) => [point.label, point.value])} />
    </div>
  );
}
