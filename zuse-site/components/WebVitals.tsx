"use client";

import { useReportWebVitals } from "next/web-vitals";
import { WEB_VITALS_URL } from "@/lib/config/strapi";

/**
 * Real-visitor speed: Core Web Vitals (LCP, INP, CLS, FCP, TTFB) from this
 * visit, sent once as the visitor leaves or hides the page. Anonymous — the
 * page path, the values and phone/desktop only. The CMS shows them per page
 * (SEO panel, Site speed). Renders nothing.
 *
 * Production builds only, unless NEXT_PUBLIC_WEB_VITALS=on; "off" disables it.
 * NEXT_PUBLIC_WEB_VITALS_SAMPLE (0–1, default 1) reports only that share of visits.
 */

const SETTING = process.env.NEXT_PUBLIC_WEB_VITALS;
const ENABLED = SETTING === "on" || (SETTING !== "off" && process.env.NODE_ENV === "production");
const SAMPLE = Math.min(1, Math.max(0, Number(process.env.NEXT_PUBLIC_WEB_VITALS_SAMPLE ?? 1) || 0));
const NAMES = new Set(["LCP", "INP", "CLS", "FCP", "TTFB"]);

// One report per page load: the latest value of each metric.
const values = new Map<string, number>();
let path = "";
let sent = false;
let listening = false;
let sampled: boolean | null = null;

function send() {
  if (sent || !values.size) return;
  sent = true;
  const body = JSON.stringify({
    path,
    device: window.matchMedia("(max-width: 767px)").matches ? "mobile" : "desktop",
    metrics: [...values].map(([name, value]) => ({ name, value })),
  });
  // Same route as the forms: proxied to Strapi in development, direct in production.
  const url = process.env.NODE_ENV === "development" ? "/api/web-vitals" : WEB_VITALS_URL;
  // text/plain keeps it a "simple" request (no CORS preflight) that survives the page closing.
  const blob = new Blob([body], { type: "text/plain" });
  if (!navigator.sendBeacon?.(url, blob)) {
    fetch(url, { method: "POST", body, keepalive: true, headers: { "Content-Type": "text/plain" } }).catch(() => {});
  }
}

function report(metric: { name: string; value: number }) {
  if (!ENABLED || !NAMES.has(metric.name)) return;
  if (sampled === null) sampled = Math.random() < SAMPLE;
  if (!sampled) return;
  if (!path) path = window.location.pathname;
  values.set(metric.name, metric.value);
  if (!listening) {
    listening = true;
    document.addEventListener("visibilitychange", () => document.visibilityState === "hidden" && send());
    window.addEventListener("pagehide", send);
  }
}

export default function WebVitals() {
  useReportWebVitals(report);
  return null;
}
