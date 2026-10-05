/**
 * Server-side Strapi REST client (App Router).
 * Uses STRAPI_API_URL + STRAPI_TOKEN from .env.development / .env.local
 * — same staging CMS as Website/.env.development.
 */

import { cache } from "react";
import { applySnippets, snippetsFrom } from "@/lib/snippets";

const API_URL = (
  process.env.STRAPI_API_URL ||
  process.env.NEXT_PUBLIC_STRAPI_API_URL ||
  "https://stagingadmin.zusedigital.com"
).replace(/\/$/, "");

const TOKEN = process.env.STRAPI_TOKEN || "";

function mediaUrl(file: { url?: string } | null | undefined): string | null {
  if (!file?.url) return null;
  if (file.url.startsWith("http")) return file.url;
  return `${API_URL}${file.url}`;
}

/** Recursively flatten Strapi v4 { id, attributes } into plain objects. */
export function flatten(input: unknown): unknown {
  if (input == null) return input;
  if (Array.isArray(input)) return input.map(flatten);
  if (typeof input !== "object") return input;

  const obj = input as Record<string, unknown>;

  if (Object.prototype.hasOwnProperty.call(obj, "data") && Object.keys(obj).length <= 2) {
    return flatten(obj.data);
  }

  if (obj.attributes && typeof obj.attributes === "object") {
    const attrs = flatten(obj.attributes) as Record<string, unknown>;
    const out: Record<string, unknown> = { id: obj.id, ...attrs };
    for (const key of Object.keys(out)) {
      const val = out[key];
      if (val && typeof val === "object" && "url" in (val as object)) {
        const media = val as { url?: string };
        if (media.url && !media.url.startsWith("http")) {
          out[key] = { ...media, url: mediaUrl(media) };
        }
      }
    }
    return out;
  }

  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(obj)) {
    if (k === "url" && typeof v === "string" && !v.startsWith("http")) {
      out[k] = `${API_URL}${v}`;
    } else {
      out[k] = flatten(v);
    }
  }
  return out;
}

/** Cache tag on every Strapi response; app/api/revalidate clears it. */
export const STRAPI_CACHE_TAG = "strapi";

/** Text snippets ({phone}…) from Site settings → Text snippets, once per request. */
const SNIPPETS_PATH = "/api/text-snippets?fields[0]=name&fields[1]=value&pagination[pageSize]=500";
const getSnippets = cache(async () => snippetsFrom(await rawStrapiFetch(SNIPPETS_PATH)));

/** A Strapi response with text snippets filled in (lib/snippets.ts). */
export async function strapiFetch(path: string): Promise<unknown | null> {
  const [json, snippets] = await Promise.all([rawStrapiFetch(path), getSnippets()]);
  return json === null ? null : applySnippets(json, snippets);
}

async function rawStrapiFetch(path: string): Promise<unknown | null> {
  const url = path.startsWith("http")
    ? path
    : `${API_URL}${path.startsWith("/") ? "" : "/"}${path}`;

  const headers: HeadersInit = { "Content-Type": "application/json" };
  if (TOKEN) headers.Authorization = `Bearer ${TOKEN}`;

  const res = await fetch(url, {
    headers,
    // Local development: always fresh, so CMS changes show on the next reload.
    // Elsewhere: cached, and refreshed as soon as Strapi reports a change
    // (POST /api/revalidate), with 60 s as a safety net.
    ...(process.env.NODE_ENV === "development"
      ? { cache: "no-store" as const }
      : { next: { revalidate: 60, tags: [STRAPI_CACHE_TAG] } }),
  });

  if (!res.ok) {
    console.error(`[strapi] ${res.status} ${url}`);
    return null;
  }
  return res.json();
}

export function getStrapiApiUrl() {
  return API_URL;
}

/** Strapi returns 25 rows unless told otherwise; Gatsby sourced every entry. */
const ALL_ROWS_PAGE_SIZE = "100";

/**
 * One published page with everything (SEO, sections…) via the Strapi page
 * API's `populate=deep` (src/middlewares/deep-populate.js). Cached per
 * request, so metadata and page body share one call.
 */
export const getPageRaw = cache(async (slug: string): Promise<Record<string, unknown> | null> => {
  const json = (await strapiFetch(`/api/pages?filters[slug][$eq]=${encodeURIComponent(slug)}&populate=deep`)) as {
    data?: Record<string, unknown>[];
  } | null;
  return json?.data?.[0] ?? null;
});

/** Page fields for SEO and listings (sections are read with lib/pages.ts). */
export async function getPageBySlug(slug: string) {
  const row = await getPageRaw(slug);
  if (!row) return null;
  // flatten() rewrites every relative `url`, which would break rich-text links in sections.
  const { sections: _sections, ...rest } = row;
  void _sections;
  return flatten(rest);
}

export async function getBlogs({
  featuredOnly = false,
  limit,
}: { featuredOnly?: boolean; limit?: number } = {}) {
  const params = new URLSearchParams();
  params.append("sort[0]", "rank:desc");
  params.append("sort[1]", "publishedAt:desc");
  if (featuredOnly) params.set("filters[IsFeatured][$eq]", "true");
  if (limit) params.set("pagination[limit]", String(limit));
  else params.set("pagination[pageSize]", ALL_ROWS_PAGE_SIZE);
  params.set("populate", "*");

  const json = (await strapiFetch(`/api/blogs?${params}`)) as {
    data?: unknown[];
  } | null;
  return (json?.data || []).map(flatten);
}

export async function getBlogBySlug(slug: string) {
  const qs = [
    `filters[slug][$eq]=${encodeURIComponent(slug)}`,
    "populate[Image]=true",
    "populate[author][populate][Image]=true",
    "populate[RelatedBlog][populate][Image]=true",
    "populate[RelatedBlog][populate][author][populate][Image]=true",
    "populate[seo][populate][metaSocial][populate][image]=true",
    "populate[seo][populate][metaImage]=true",
  ].join("&");

  const json = (await strapiFetch(`/api/blogs?${qs}`)) as {
    data?: unknown[];
  } | null;
  const row = json?.data?.[0];
  return row ? flatten(row) : null;
}

export async function getProjects({
  featuredOnly = false,
  limit,
}: { featuredOnly?: boolean; limit?: number } = {}) {
  const params = new URLSearchParams();
  params.set("sort", featuredOnly ? "FeaturedRank:asc" : "rank:asc");
  if (featuredOnly) params.set("filters[FeaturedRank][$notNull]", "true");
  if (limit) params.set("pagination[limit]", String(limit));
  else params.set("pagination[pageSize]", ALL_ROWS_PAGE_SIZE);
  params.set("populate[Slider][populate]", "*");
  // "true", not "*": "*" also asks for internal relations Strapi rejects (400).
  params.set("populate[project_categories]", "true");

  const json = (await strapiFetch(`/api/projects?${params}`)) as {
    data?: unknown[];
  } | null;
  return (json?.data || []).map(flatten);
}

export async function getProjectCategories() {
  const params = new URLSearchParams();
  params.set("sort", "rank:asc");
  params.set("pagination[pageSize]", ALL_ROWS_PAGE_SIZE);

  const json = (await strapiFetch(`/api/project-categories?${params}`)) as {
    data?: unknown[];
  } | null;
  return (json?.data || []).map(flatten);
}

/**
 * Page data bags — same shapes Gatsby GraphQL returns as `data` props.
 * Call one of these from each Next.js `page.tsx` (Server Component).
 */

/** Mirrors Website/src/pages/work.js */
export async function buildWorkData() {
  const [nodes, categories, page] = await Promise.all([
    getProjects(),
    getProjectCategories(),
    getPageBySlug("work"),
  ]);
  return {
    allStrapiProject: { nodes },
    allStrapiProjectCategory: { nodes: categories },
    strapiPage: page,
  };
}

/** Mirrors Website/src/pages/blog.js */
export async function buildBlogIndexData() {
  const [nodes, page] = await Promise.all([
    getBlogs({ featuredOnly: true }),
    getPageBySlug("blogs"),
  ]);
  return {
    allStrapiBlog: { nodes },
    strapiPage: page,
  };
}

/** Mirrors Website about / contact / awards — one Page entry by slug */
export async function buildPageData(slug: string) {
  const page = await getPageBySlug(slug);
  return { strapiPage: page };
}
