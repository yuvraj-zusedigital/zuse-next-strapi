"use client";

import { useDeferredValue, useMemo, useState } from "react";
import { useFormContext, useWatch } from "react-hook-form";
import { AlertCircle, CheckCircle2, CircleDashed, Globe, Share2 } from "lucide-react";
import { Lightbox, type LightboxFile } from "@/components/media/lightbox";
import { Media } from "@/components/preview/primitives";
import { analyse, collectText, DESCRIPTION_RANGE, lengthStatus, TITLE_RANGE, type CheckStatus } from "@/lib/seo";
import { cn } from "@/lib/utils";
import { useEntryInfo } from "./entry-context";
import { SearchPerformance } from "./search-performance";
import { WebVitalsPanel } from "./web-vitals-panel";

/** Shown in previews; the live site's domain. */
const DOMAIN = "zusedigital.com";

type Values = Record<string, unknown>;
const str = (value: unknown) => (typeof value === "string" ? value : "");
const firstMedia = (value: unknown) => (Array.isArray(value) && value.length ? value : null);

/** The entry's public path, per content type. */
function pathOf(typeSlug: string, values: Values): string | null {
  const clean = (path: string) => `/${path.replace(/^\/+|\/+$/g, "")}`;
  if (typeSlug === "page") return str(values.path) ? clean(str(values.path)) : null;
  if (typeSlug === "blog") return str(values.slug) ? `/blog/${str(values.slug)}` : null;
  if (typeSlug === "project") return str(values.project_details_path) ? clean(str(values.project_details_path)) : null;
  return null;
}

const STATUS_STYLE: Record<CheckStatus, { icon: typeof CheckCircle2; className: string }> = {
  good: { icon: CheckCircle2, className: "text-emerald-600 dark:text-emerald-400" },
  ok: { icon: CircleDashed, className: "text-amber-600 dark:text-amber-400" },
  bad: { icon: AlertCircle, className: "text-destructive" },
};

function Meter({ label, length, range }: { label: string; length: number; range: { min: number; max: number } }) {
  const status = lengthStatus(length, range);
  const percent = Math.min(100, (length / range.max) * 100);
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs">
        <span className="text-muted-foreground">{label}</span>
        <span className={cn("tabular-nums", STATUS_STYLE[status].className)}>
          {length} / {range.min}–{range.max}
        </span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-muted">
        <div
          className={cn(
            "h-full rounded-full transition-[width,background-color] duration-300",
            status === "good" ? "bg-emerald-500" : status === "ok" ? "bg-amber-500" : "bg-destructive",
          )}
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}

function ScoreRing({ score }: { score: number }) {
  const color = score >= 80 ? "text-emerald-500" : score >= 50 ? "text-amber-500" : "text-destructive";
  const circumference = 2 * Math.PI * 16;
  return (
    <div className="relative size-14 shrink-0" role="img" aria-label={`SEO score ${score} out of 100`}>
      <svg viewBox="0 0 40 40" className="size-14 -rotate-90">
        <circle cx="20" cy="20" r="16" fill="none" strokeWidth="4" className="stroke-muted" />
        <circle
          cx="20"
          cy="20"
          r="16"
          fill="none"
          strokeWidth="4"
          strokeLinecap="round"
          className={cn("stroke-current transition-[stroke-dashoffset] duration-500", color)}
          strokeDasharray={circumference}
          strokeDashoffset={circumference * (1 - score / 100)}
        />
      </svg>
      <span className="absolute inset-0 grid place-items-center text-sm font-semibold tabular-nums">{score}</span>
    </div>
  );
}

/** The SEO block's live analysis (score, checks, previews' text) from the form values. */
export function useSeoAnalysis(name: string) {
  const info = useEntryInfo();
  const { control } = useFormContext();
  const seo = (useWatch({ control, name }) ?? {}) as Values;
  const all = useDeferredValue(useWatch({ control }) as Values);

  const seoKey = name.split(".").pop() ?? "seo";
  const path = info ? pathOf(info.typeSlug, all) : null;
  const title = str(seo.metaTitle) || (info?.mainField ? str(all[info.mainField]) : "");
  const description = str(seo.metaDescription);
  const social = (Array.isArray(seo.metaSocial) ? (seo.metaSocial as Values[]) : [])[0] ?? {};
  const image = firstMedia(social.image) ?? firstMedia(seo.metaImage);

  const content = useMemo(() => collectText(all, [seoKey, "slug", "path", "project_details_path"]), [all, seoKey]);
  const { checks, score } = analyse({
    title: str(seo.metaTitle),
    description,
    keyword: str(seo.focusKeyword),
    path,
    content,
    hasImage: Boolean(image),
    robots: str(seo.metaRobots),
  });
  return { seo, path, title, description, social, image, checks, score };
}

/** One-line summary for the collapsed SEO box: score and title. */
export function SeoSummary({ name }: { name: string }) {
  const { score, title } = useSeoAnalysis(name);
  const color = score >= 80 ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400" : score >= 50 ? "bg-amber-500/15 text-amber-700 dark:text-amber-400" : "bg-destructive/15 text-destructive";
  return (
    <>
      <span className={cn("shrink-0 rounded-full px-2 py-0.5 text-xs font-semibold tabular-nums", color)}>SEO {score}</span>
      {title && <span className="min-w-0 truncate text-sm text-muted-foreground">{title}</span>}
    </>
  );
}

/**
 * SEO panel shown above an entry's SEO fields: Google and social previews,
 * length meters and focus-keyword checks, all updating as you type.
 */
export function SeoPanel({ name }: { name: string }) {
  const { seo, path, title, description, social, image, checks, score } = useSeoAnalysis(name);
  const { setValue } = useFormContext();
  const [view, setView] = useState<"google" | "social">("google");
  const [viewing, setViewing] = useState<number | null>(null);

  const breadcrumb = [DOMAIN, ...(path ? path.split("/").filter(Boolean) : [])].join(" › ");

  return (
    <div className="mb-6 space-y-5 rounded-xl border bg-card p-4 shadow-xs">
      <div className="flex items-start gap-4">
        <ScoreRing score={score} />
        <div className="min-w-0 flex-1 space-y-3">
          <div className="text-sm font-medium">Search &amp; sharing</div>
          <Meter label="Title" length={str(seo.metaTitle).length} range={TITLE_RANGE} />
          <Meter label="Description" length={description.length} range={DESCRIPTION_RANGE} />
        </div>
      </div>

      <div>
        <div className="mb-2 inline-flex rounded-lg bg-muted p-0.5 text-xs" role="tablist" aria-label="Preview">
          {(
            [
              ["google", "Google", Globe],
              ["social", "Social share", Share2],
            ] as const
          ).map(([key, label, Icon]) => (
            <button
              key={key}
              type="button"
              role="tab"
              aria-selected={view === key}
              onClick={() => setView(key)}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 transition-colors",
                view === key ? "bg-card font-medium text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground",
              )}
            >
              <Icon className="size-3.5" /> {label}
            </button>
          ))}
        </div>

        {view === "google" ? (
          // Google's own colours, so it reads like a real result in light or dark mode.
          <div className="rounded-lg bg-white p-4 font-[arial,sans-serif] ring-1 ring-black/5" role="tabpanel">
            <div className="flex items-center gap-2.5">
              <span className="grid size-7 place-items-center rounded-full bg-[#f1f3f4] text-[11px] font-bold text-[#1f2996]">Z</span>
              <div className="min-w-0 leading-tight">
                <div className="text-sm text-[#202124]">Zuse Digital</div>
                <div className="truncate text-xs text-[#4d5156]">https://{breadcrumb}</div>
              </div>
            </div>
            <div className="mt-2 line-clamp-1 text-xl text-[#1a0dab] hover:underline">{title || "Page title"}</div>
            <div className="mt-1 line-clamp-2 text-sm leading-snug text-[#4d5156]">
              {description || "Add a meta description — otherwise Google shows text it picks from the page."}
            </div>
          </div>
        ) : (
          <div className="overflow-hidden rounded-lg bg-white ring-1 ring-black/5" role="tabpanel">
            {image ? (
              <button
                type="button"
                onClick={() => setViewing(0)}
                aria-label="View the share image full screen"
                className="block w-full cursor-zoom-in outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
              >
                <Media value={image} className="aspect-[1.91/1] w-full" />
              </button>
            ) : (
              <Media value={[]} className="aspect-[1.91/1] w-full" />
            )}
            <Lightbox files={(image ?? []) as LightboxFile[]} index={viewing} onIndexChange={setViewing} />
            <div className="space-y-0.5 border-t border-black/5 bg-[#f2f3f5] px-3 py-2.5">
              <div className="text-[11px] tracking-wide text-[#606770] uppercase">{DOMAIN}</div>
              <div className="line-clamp-1 font-semibold text-[#1d2129]">{str(social.title) || title || "Page title"}</div>
              <div className="line-clamp-1 text-sm text-[#606770]">{str(social.description) || description || "Description"}</div>
            </div>
          </div>
        )}
      </div>

      <ul className="space-y-1.5 text-sm">
        {checks.map((check) => {
          const { icon: Icon, className } = STATUS_STYLE[check.status];
          return (
            <li key={check.id} className="flex items-start gap-2">
              <Icon className={cn("mt-0.5 size-4 shrink-0", className)} />
              <span>{check.label}</span>
            </li>
          );
        })}
      </ul>

      <div className="@container border-t pt-4">
        <SearchPerformance
          path={path}
          focusKeyword={str(seo.focusKeyword)}
          onUseKeyword={(query) => setValue(`${name}.focusKeyword`, query, { shouldDirty: true })}
        />
      </div>

      <div className="@container border-t pt-4">
        <WebVitalsPanel path={path} />
      </div>
    </div>
  );
}
