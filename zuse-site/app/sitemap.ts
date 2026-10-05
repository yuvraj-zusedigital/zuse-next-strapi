import type { MetadataRoute } from "next";
import { SITE_URL, IS_INDEXABLE } from "@/lib/config/site";
import { getCaseStudyParams } from "@/lib/casestudies/cms";
import { getProjectCategories, strapiFetch } from "@/lib/strapi";

// Emit a static sitemap.xml (required for `output: export` / S3+CloudFront).
export const dynamic = "force-static";

/**
 * Generates /sitemap.xml at build time.
 *
 * Only list routes that actually exist and return HTTP 200 — a sitemap that
 * references 404 pages is an SEO fault. Add entries here as each route ships.
 *
 * Off-production (staging/preview/local) the sitemap is empty so no non-canonical
 * URLs are ever advertised to search engines.
 */
type RouteEntry = {
  path: string;
  changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"];
  priority: number;
};

const ROUTES: RouteEntry[] = [
  { path: "/", changeFrequency: "weekly", priority: 1 },
  { path: "/about", changeFrequency: "monthly", priority: 0.8 },
  { path: "/work", changeFrequency: "weekly", priority: 0.9 },
  { path: "/blog", changeFrequency: "weekly", priority: 0.9 },
  { path: "/contact", changeFrequency: "monthly", priority: 0.8 },
  { path: "/testimonials", changeFrequency: "monthly", priority: 0.7 },
  { path: "/awards-recognition", changeFrequency: "monthly", priority: 0.7 },
  {
    path: "/services/artificial-intelligence",
    changeFrequency: "monthly",
    priority: 0.8,
  },
  {
    path: "/services/ai-agents-automation",
    changeFrequency: "monthly",
    priority: 0.8,
  },
  {
    path: "/services/ai-product-development",
    changeFrequency: "monthly",
    priority: 0.8,
  },
  {
    path: "/services/seo-ai-search-optimisation",
    changeFrequency: "monthly",
    priority: 0.8,
  },
  {
    path: "/services/website-design",
    changeFrequency: "monthly",
    priority: 0.8,
  },
  {
    path: "/services/web-application-development",
    changeFrequency: "monthly",
    priority: 0.8,
  },
  {
    path: "/services/mobile-app-development",
    changeFrequency: "monthly",
    priority: 0.8,
  },
];

type CmsRow = { path?: string | null; slug?: string | null; project_details_path?: string | null; is_coming_soon?: boolean | null; updatedAt?: string | null; seo?: { metaRobots?: string | null } | null };

/** Every published row of a Strapi collection (100 per request), with just the fields the sitemap needs. */
async function allRows(collection: string, fields: string[]): Promise<CmsRow[]> {
  const rows: CmsRow[] = [];
  for (let page = 1; page <= 20; page++) {
    const query = [
      ...fields.map((field, index) => `fields[${index}]=${field}`),
      "populate[seo][fields][0]=metaRobots",
      `pagination[page]=${page}`,
      "pagination[pageSize]=100",
    ].join("&");
    const json = (await strapiFetch(`/api/${collection}?${query}`)) as { data?: CmsRow[]; meta?: { pagination?: { pageCount?: number } } } | null;
    rows.push(...(json?.data ?? []));
    if (!json || page >= (json.meta?.pagination?.pageCount ?? 1)) break;
  }
  return rows;
}

/** Set to "Hide from search results" in the CMS (SEO → Search engines). */
const hidden = (row: CmsRow) => /noindex/i.test(row.seo?.metaRobots ?? "");
const clean = (path: string) => `/${path.replace(/^\/+|\/+$/g, "")}`;
const modified = (row: CmsRow | undefined) => (row?.updatedAt ? new Date(row.updatedAt) : undefined);

/**
 * Every public page: the fixed routes, case-study categories and case studies,
 * blog posts, and pages created in the CMS. Anything set to "Hide from search
 * results" is left out, and each URL carries its real last-edit date (none
 * when unknown, rather than a misleading "today"). Unpublished pages and AI
 * drafts aren't returned by the API, so they never appear.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  if (!IS_INDEXABLE) return [];

  const [pages, blogs, projects, categories, caseStudies] = await Promise.all([
    allRows("pages", ["path", "updatedAt"]),
    allRows("blogs", ["slug", "updatedAt"]),
    allRows("projects", ["project_details_path", "is_coming_soon", "updatedAt"]),
    getProjectCategories() as Promise<{ slug?: string }[]>,
    getCaseStudyParams(),
  ]);

  // CMS pages by path: fixed routes take their date and "hidden" setting from them too.
  const pageByPath = new Map(pages.filter((page) => page.path).map((page) => [clean(page.path!), page]));
  const projectByPath = new Map(projects.filter((project) => project.project_details_path).map((project) => [clean(project.project_details_path!), project]));

  type Entry = RouteEntry & { lastModified?: Date };
  const entries: Entry[] = [];
  const seen = new Set<string>();
  const add = (entry: Entry, row?: CmsRow) => {
    if (seen.has(entry.path) || (row && hidden(row))) return;
    seen.add(entry.path);
    entries.push({ ...entry, lastModified: entry.lastModified ?? modified(row) });
  };

  for (const route of ROUTES) add(route, pageByPath.get(route.path));
  for (const category of categories) {
    if (category.slug) add({ path: `/casestudies/${category.slug}`, changeFrequency: "weekly", priority: 0.8 });
  }
  for (const { category, slug } of caseStudies) {
    const path = `/casestudies/${category}/${slug}`;
    add({ path, changeFrequency: "monthly", priority: 0.8 }, projectByPath.get(path));
  }
  for (const blog of blogs) {
    if (blog.slug) add({ path: `/blog/${blog.slug}`, changeFrequency: "monthly", priority: 0.7 }, blog);
  }
  // Pages created in the CMS (served by app/[...path]).
  for (const [path, page] of pageByPath) {
    if (path !== "/") add({ path, changeFrequency: "monthly", priority: 0.6 }, page);
  }

  return entries.map(({ path, changeFrequency, priority, lastModified }) => ({
    url: `${SITE_URL}${path === "/" ? "" : path}`,
    ...(lastModified ? { lastModified } : {}),
    changeFrequency,
    priority,
  }));
}
