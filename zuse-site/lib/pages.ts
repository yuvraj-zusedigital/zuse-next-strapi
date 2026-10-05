/**
 * Page content from Strapi's page builder, with the site's built-in content
 * (content/pages/*) as the fallback: a page renders its published Strapi
 * sections when it has any, otherwise its defaults — so pages are never
 * empty, and switch to Strapi content as soon as it's published.
 */

import { cache } from "react";
import { normalizeSections, type Section } from "@/lib/sections";
import { getPageRaw, strapiFetch } from "@/lib/strapi";

/** Leaves out sections marked "Hidden" in the CMS. */
export const visible = (sections: Section[]) => sections.filter((section) => (section as { hidden?: boolean | null }).hidden !== true);

export type PageDefaults = {
  /** Strapi page slug (the same slug the page uses for SEO). */
  slug: string;
  /** URL path, stored on the Strapi page so menus can link to it. */
  path: string;
  /** Page name in the CMS. */
  name: string;
  sections: Section[];
};

export async function getPageSections(defaults: PageDefaults): Promise<Section[]> {
  try {
    const page = await getPageRaw(defaults.slug);
    const sections = normalizeSections(page?.sections);
    // Sections switched off in the CMS ("Hidden") aren't shown; a page with
    // sections in Strapi never falls back to its defaults, even if all are hidden.
    return sections.length ? visible(sections) : defaults.sections;
  } catch (error) {
    console.error(`[pages] ${defaults.slug}: using built-in content`, error);
    return defaults.sections;
  }
}

/** Whether the Strapi page has a section of this type at all, hidden or not (false when Strapi is unavailable). */
export async function hasSection(slug: string, uid: string) {
  try {
    return normalizeSections((await getPageRaw(slug))?.sections).some((section) => section.__component === uid);
  } catch {
    return false;
  }
}

/**
 * The first section of a type, for pages with a fixed layout (contact, work…):
 * from the page's sections, else from its defaults — so a section removed in
 * the CMS falls back to the built-in one instead of breaking the page.
 */
export function sectionOf<T extends Section>(sections: Section[], defaults: PageDefaults, uid: T["__component"]): T {
  return (sections.find((section) => section.__component === uid) ?? defaults.sections.find((section) => section.__component === uid)) as T;
}

export type CmsPage = { name: string; path: string; seo: Record<string, unknown> | null; sections: Section[] };

/**
 * A published CMS page by its path ("/careers"), for pages created in the CMS
 * that have no route of their own (app/[...path]). Accepts a trailing slash.
 */
export const getPageByPath = cache(async (path: string): Promise<CmsPage | null> => {
  const clean = `/${path.replace(/^\/+|\/+$/g, "")}`;
  const query = `filters[$or][0][path][$eq]=${encodeURIComponent(clean)}&filters[$or][1][path][$eq]=${encodeURIComponent(`${clean}/`)}&populate=deep`;
  const json = (await strapiFetch(`/api/pages?${query}`)) as { data?: Record<string, unknown>[] } | null;
  const row = json?.data?.[0];
  if (!row) return null;
  return {
    name: (row.Name as string) || clean,
    path: clean,
    seo: (row.seo as Record<string, unknown> | null) ?? null,
    sections: visible(normalizeSections(row.sections)),
  };
});
