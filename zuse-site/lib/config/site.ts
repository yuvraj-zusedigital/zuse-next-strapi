/**
 * Public site origin for metadataBase, canonical fallbacks, etc.
 * Set NEXT_PUBLIC_SITE_URL per environment (local / staging / production).
 */
const DEFAULT_SITE_URL = "https://zusedigital.com";

const RAW_SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ||
  process.env.SITE_URL ||
  DEFAULT_SITE_URL
).replace(/\/$/, "");

function isLocalhostUrl(url: string): boolean {
  return /^(https?:\/\/)?(localhost|127\.0\.0\.1|0\.0\.0\.0)(:\d+)?(\/|$)/i.test(url);
}

/**
 * Production guard: a localhost origin must never leak into production output
 * (metadataBase, canonicals, OG/Twitter URLs, sitemap, robots). If the build
 * runs with NODE_ENV=production and NEXT_PUBLIC_SITE_URL resolves to localhost
 * — e.g. `.env.local.example` was copied to `.env.local` — fall back to the
 * production default instead of shipping localhost URLs. Non-localhost origins
 * (real staging/production hosts) always pass through unchanged.
 */
function resolveSiteUrl(): string {
  if (process.env.NODE_ENV === "production" && isLocalhostUrl(RAW_SITE_URL)) {
    console.warn(
      `[site] NEXT_PUBLIC_SITE_URL is a localhost value ("${RAW_SITE_URL}") in a ` +
        `production build; using "${DEFAULT_SITE_URL}" instead. Set the real ` +
        `origin in the deploy/CI environment.`
    );
    return DEFAULT_SITE_URL;
  }
  return RAW_SITE_URL;
}

export const SITE_URL = resolveSiteUrl();

export function getSiteUrl(): URL {
  return new URL(SITE_URL);
}

/**
 * The one origin that search engines are allowed to index. Only the real
 * production site qualifies; every other deployment (staging, preview, local)
 * must be kept out of the index so it never competes with or duplicates
 * https://zusedigital.com. Consumed by robots.ts, sitemap.ts, the metadata
 * helper, and middleware to enforce noindex off-production.
 */
export const PRODUCTION_ORIGIN = DEFAULT_SITE_URL;

export const IS_INDEXABLE = SITE_URL === PRODUCTION_ORIGIN;

/**
 * Normalize a canonical/absolute URL to the site's slash-less policy so that
 * canonical tags, OG/Twitter `url`, the sitemap, and the actually-served route
 * all agree. Strips a trailing slash from the path (except the bare origin) and
 * drops a root "/" so the home canonical is exactly SITE_URL. CMS-supplied
 * canonicalURL values (which historically carried a trailing slash) are
 * normalized here rather than page-by-page.
 */
export function normalizeCanonical(raw: string): string {
  try {
    const u = new URL(raw);
    const path = u.pathname.replace(/\/+$/, ""); // strip trailing slash(es)
    return `${u.origin}${path}${u.search}`;
  } catch {
    // Not an absolute URL — strip a single trailing slash defensively.
    return raw.replace(/\/+$/, "");
  }
}
