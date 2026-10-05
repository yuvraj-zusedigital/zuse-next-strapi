import "server-only";

import { importPKCS8, SignJWT } from "jose";

/**
 * Google Search Console (Search Analytics API) for the SEO panel: a page's
 * clicks, impressions, CTR, average position, daily trend and top queries.
 *
 * Setup (see .env.example): a Google Cloud service account with the Search
 * Console API enabled, added as a user on the Search Console property.
 *   SEARCH_CONSOLE_CREDENTIALS  the service account's JSON key (raw or base64)
 *   SEARCH_CONSOLE_SITE         the property, e.g. "sc-domain:zusedigital.com"
 *   SEARCH_CONSOLE_PAGE_ORIGIN  the live site, default https://zusedigital.com
 *   SEARCH_CONSOLE_DEMO=true    sample data, for trying the panel without access
 */

export type SearchTotals = { clicks: number; impressions: number; ctr: number; position: number };
export type SearchQuery = SearchTotals & { query: string };
export type SearchPerformance = {
  pageUrl: string;
  range: { start: string; end: string };
  totals: SearchTotals;
  /** Clicks per day, oldest first. */
  trend: { date: string; clicks: number; impressions: number }[];
  queries: SearchQuery[];
  demo?: boolean;
};

type Credentials = { client_email: string; private_key: string };

const SCOPE = "https://www.googleapis.com/auth/webmasters.readonly";
const CACHE_MS = 60 * 60 * 1000; // Search Console data updates daily; an hour keeps us well inside quotas.

export function searchConsoleConfig() {
  const demo = process.env.SEARCH_CONSOLE_DEMO === "true";
  const raw = process.env.SEARCH_CONSOLE_CREDENTIALS?.trim();
  const site = process.env.SEARCH_CONSOLE_SITE?.trim();
  const origin = (process.env.SEARCH_CONSOLE_PAGE_ORIGIN || "https://zusedigital.com").replace(/\/$/, "");
  let credentials: Credentials | null = null;
  if (raw) {
    try {
      credentials = JSON.parse(raw.startsWith("{") ? raw : Buffer.from(raw, "base64").toString("utf8"));
    } catch {
      credentials = null;
    }
  }
  return { configured: Boolean(credentials?.client_email && credentials.private_key && site), credentials, site, origin, demo };
}

let token: { value: string; expires: number } | null = null;

/** OAuth access token from the service account (JWT bearer flow), reused until it expires. */
async function accessToken(credentials: Credentials) {
  if (token && token.expires > Date.now() + 60_000) return token.value;
  const key = await importPKCS8(credentials.private_key, "RS256");
  const now = Math.floor(Date.now() / 1000);
  const assertion = await new SignJWT({ scope: SCOPE })
    .setProtectedHeader({ alg: "RS256", typ: "JWT" })
    .setIssuer(credentials.client_email)
    .setAudience("https://oauth2.googleapis.com/token")
    .setIssuedAt(now)
    .setExpirationTime(now + 3600)
    .sign(key);
  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer", assertion }),
    cache: "no-store",
  });
  const body = await response.json().catch(() => null);
  if (!response.ok || !body?.access_token) throw new Error(body?.error_description || `Google sign-in failed (${response.status})`);
  token = { value: body.access_token, expires: Date.now() + (body.expires_in ?? 3600) * 1000 };
  return token.value;
}

const isoDay = (date: Date) => date.toISOString().slice(0, 10);
const escapeRegex = (text: string) => text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/** The 28 days ending two days ago (Search Console data lags by about two days). */
export function dateRange(today = new Date()) {
  const end = new Date(today);
  end.setUTCDate(end.getUTCDate() - 2);
  const start = new Date(end);
  start.setUTCDate(start.getUTCDate() - 27);
  return { start: isoDay(start), end: isoDay(end) };
}

/** Matches the page with or without a trailing slash. */
export const pageRegex = (origin: string, path: string) => {
  const clean = path === "/" ? "" : `/${path.replace(/^\/+|\/+$/g, "")}`;
  return `^${escapeRegex(origin + clean)}/?$`;
};

type Row = { keys?: string[]; clicks: number; impressions: number; ctr: number; position: number };

async function query(credentials: Credentials, site: string, body: Record<string, unknown>): Promise<Row[]> {
  const response = await fetch(`https://www.googleapis.com/webmasters/v3/sites/${encodeURIComponent(site)}/searchAnalytics/query`, {
    method: "POST",
    headers: { Authorization: `Bearer ${await accessToken(credentials)}`, "Content-Type": "application/json" },
    body: JSON.stringify(body),
    cache: "no-store",
  });
  const json = await response.json().catch(() => null);
  if (!response.ok) {
    const message = json?.error?.message as string | undefined;
    if (response.status === 403) throw new Error(`No access to ${site} — add the service account as a user in Search Console.`);
    throw new Error(message || `Search Console responded ${response.status}`);
  }
  return (json?.rows as Row[]) ?? [];
}

const cache = new Map<string, { at: number; data: SearchPerformance }>();

export async function pagePerformance(path: string): Promise<SearchPerformance> {
  const config = searchConsoleConfig();
  const range = dateRange();
  const pageUrl = `${config.origin}${path === "/" ? "/" : `/${path.replace(/^\/+|\/+$/g, "")}`}`;
  if (!config.configured && config.demo) return demoPerformance(pageUrl, range);
  if (!config.configured || !config.credentials || !config.site) throw new Error("Search Console isn't connected.");

  const key = `${config.site}|${pageUrl}|${range.end}`;
  const cached = cache.get(key);
  if (cached && Date.now() - cached.at < CACHE_MS) return cached.data;

  const filter = { dimensionFilterGroups: [{ filters: [{ dimension: "page", operator: "includingRegex", expression: pageRegex(config.origin, path) }] }] };
  const base = { startDate: range.start, endDate: range.end, dataState: "final", ...filter };
  const [totalRows, dayRows, queryRows] = await Promise.all([
    query(config.credentials, config.site, { ...base }),
    query(config.credentials, config.site, { ...base, dimensions: ["date"], rowLimit: 100 }),
    query(config.credentials, config.site, { ...base, dimensions: ["query"], rowLimit: 10 }),
  ]);
  const total = totalRows[0];
  const data: SearchPerformance = {
    pageUrl,
    range,
    totals: total
      ? { clicks: total.clicks, impressions: total.impressions, ctr: total.ctr, position: total.position }
      : { clicks: 0, impressions: 0, ctr: 0, position: 0 },
    trend: dayRows.map((row) => ({ date: row.keys?.[0] ?? "", clicks: row.clicks, impressions: row.impressions })),
    queries: queryRows.map((row) => ({ query: row.keys?.[0] ?? "", clicks: row.clicks, impressions: row.impressions, ctr: row.ctr, position: row.position })),
  };
  cache.set(key, { at: Date.now(), data });
  return data;
}

/** Deterministic sample data for SEARCH_CONSOLE_DEMO (clearly labelled in the panel). */
function demoPerformance(pageUrl: string, range: { start: string; end: string }): SearchPerformance {
  let seed = [...pageUrl].reduce((sum, char) => (sum * 31 + char.charCodeAt(0)) % 2147483647, 7);
  const random = () => (seed = (seed * 48271) % 2147483647) / 2147483647;
  const words = pageUrl.split("/").filter(Boolean).pop()?.replace(/-/g, " ") || "zuse digital";
  const start = new Date(`${range.start}T00:00:00Z`);
  const trend = Array.from({ length: 28 }, (_, day) => {
    const date = new Date(start);
    date.setUTCDate(date.getUTCDate() + day);
    const impressions = Math.round(80 + random() * 120 + day * 3);
    return { date: isoDay(date), clicks: Math.round(impressions * (0.03 + random() * 0.04)), impressions };
  });
  const clicks = trend.reduce((sum, day) => sum + day.clicks, 0);
  const impressions = trend.reduce((sum, day) => sum + day.impressions, 0);
  const variants = [words, `${words} melbourne`, `best ${words}`, `${words} agency`, `${words} cost`, `${words} company australia`];
  return {
    pageUrl,
    range,
    demo: true,
    totals: { clicks, impressions, ctr: clicks / impressions, position: 8 + random() * 10 },
    trend,
    queries: variants.map((query, index) => {
      const share = 1 / (index + 1.5);
      const queryImpressions = Math.round(impressions * share * 0.4);
      const queryClicks = Math.round(queryImpressions * (0.02 + random() * 0.06));
      return { query, clicks: queryClicks, impressions: queryImpressions, ctr: queryClicks / Math.max(1, queryImpressions), position: 3 + index * 2.5 + random() * 3 };
    }),
  };
}
