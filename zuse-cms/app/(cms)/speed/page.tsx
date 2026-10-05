import type { Metadata } from "next";
import Link from "next/link";
import { ExternalLink } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { env } from "@/lib/env";
import { getVitalsOverview } from "@/lib/strapi";
import type { VitalName, VitalStat } from "@/lib/types";
import { cn } from "@/lib/utils";
import { formatVital, MIN_VIEWS, RATING_LABEL, RATING_STYLE, VITALS } from "@/lib/vitals";

export const metadata: Metadata = { title: "Site speed" };

const RANGES = [7, 28, 90];
const DEVICES = [
  ["", "All visitors"],
  ["mobile", "Phones"],
  ["desktop", "Desktop"],
] as const;
const one = (value: string | string[] | undefined) => (typeof value === "string" ? value : "");

function Value({ name, stat }: { name: VitalName; stat: VitalStat }) {
  if (stat.p75 === null) return <span className="text-muted-foreground">—</span>;
  return (
    <span className={cn("inline-flex rounded px-1.5 py-0.5 text-xs font-medium tabular-nums", stat.rating && RATING_STYLE[stat.rating])} title={stat.rating ? RATING_LABEL[stat.rating] : undefined}>
      {formatVital(name, stat.p75)}
    </span>
  );
}

function Pills({ items, active, href }: { items: readonly (readonly [string, string])[]; active: string; href: (value: string) => string }) {
  return (
    <nav className="inline-flex rounded-lg bg-muted p-0.5 text-sm">
      {items.map(([value, label]) => (
        <Link
          key={value || "all"}
          href={href(value)}
          aria-current={active === value ? "page" : undefined}
          className={cn("rounded-md px-3 py-1 transition-colors", active === value ? "bg-card font-medium text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground")}
        >
          {label}
        </Link>
      ))}
    </nav>
  );
}

/** How fast every page is for real visitors (Core Web Vitals), slowest first. */
export default async function SpeedPage({ searchParams }: PageProps<"/speed">) {
  const params = await searchParams;
  const days = RANGES.includes(Number(one(params.days))) ? Number(one(params.days)) : 28;
  const device = ["mobile", "desktop"].includes(one(params.device)) ? one(params.device) : "";
  const data = await getVitalsOverview(days, device);
  const href = (change: { days?: number; device?: string }) => {
    const next = new URLSearchParams();
    const d = change.days ?? days;
    const v = change.device ?? device;
    if (d !== 28) next.set("days", String(d));
    if (v) next.set("device", v);
    const qs = next.toString();
    return `/speed${qs ? `?${qs}` : ""}`;
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Site speed</h1>
        <p className="max-w-3xl text-sm text-muted-foreground">
          How fast each page is for real visitors, measured in their browsers (Core Web Vitals, the figures Google uses for ranking). Each value is the 75th
          percentile: 3 in 4 visits were at least this fast. Hover a heading for what it measures.
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        <Pills items={DEVICES} active={device} href={(value) => href({ device: value })} />
        <Pills items={RANGES.map((range) => [String(range), `${range} days`] as const)} active={String(days)} href={(value) => href({ days: Number(value) })} />
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        {(["LCP", "INP", "CLS"] as const).map((name) => {
          const stat = data.site[name];
          return (
            <div key={name} className="rounded-xl border bg-card p-4 shadow-xs" data-hint={`${VITALS[name].what} ${VITALS[name].good}.`}>
              <div className="text-xs tracking-wide text-muted-foreground uppercase">
                Whole site · {VITALS[name].label}
              </div>
              <div className="mt-1 flex items-baseline gap-2">
                <span className="text-2xl font-semibold tabular-nums">{formatVital(name, stat.p75)}</span>
                {stat.rating && <span className={cn("rounded px-1.5 py-0.5 text-xs font-medium", RATING_STYLE[stat.rating])}>{RATING_LABEL[stat.rating]}</span>}
              </div>
              <div className="text-xs text-muted-foreground">{VITALS[name].good}</div>
            </div>
          );
        })}
      </div>

      {data.pages.length === 0 ? (
        <p className="rounded-lg border border-dashed p-10 text-center text-sm text-muted-foreground">
          No visitor data for this period yet. The live site reports speed from visitors&apos; browsers; pages appear here once they&apos;ve had visits.
        </p>
      ) : (
        <div className="rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Page</TableHead>
                <TableHead className="w-24 text-right">Views</TableHead>
                {(["LCP", "INP", "CLS"] as const).map((name) => (
                  <TableHead key={name} className="w-36" data-hint={`${VITALS[name].what} ${VITALS[name].good}.`}>
                    {VITALS[name].label}
                  </TableHead>
                ))}
                <TableHead className="w-40">Overall</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.pages.map((page) => (
                <TableRow key={page.path}>
                  <TableCell className="font-medium">
                    <a href={`${env.siteUrl}${page.path}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 hover:underline">
                      {page.path} <ExternalLink className="size-3 text-muted-foreground" />
                    </a>
                  </TableCell>
                  <TableCell className="text-right tabular-nums text-muted-foreground">
                    {page.views}
                    {page.views < MIN_VIEWS && <span className="ml-1 text-xs" title="Few visits: figures may still move">*</span>}
                  </TableCell>
                  <TableCell>
                    <Value name="LCP" stat={page.LCP} />
                  </TableCell>
                  <TableCell>
                    <Value name="INP" stat={page.INP} />
                  </TableCell>
                  <TableCell>
                    <Value name="CLS" stat={page.CLS} />
                  </TableCell>
                  <TableCell>{page.worst && <span className={cn("rounded px-1.5 py-0.5 text-xs font-medium", RATING_STYLE[page.worst])}>{RATING_LABEL[page.worst]}</span>}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
      <p className="text-xs text-muted-foreground">* Fewer than {MIN_VIEWS} visits in this period, so the figures may still move. Data is kept for 90 days.</p>
    </div>
  );
}
