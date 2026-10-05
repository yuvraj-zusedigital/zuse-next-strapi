import type { Metadata } from "next";
import { SITE_URL, normalizeCanonical, IS_INDEXABLE } from "@/lib/config/site";
import { getPageBySlug } from "@/lib/strapi";
import {
  resolveSocialMetadata,
  type StrapiMetaSocial,
} from "@/lib/seo/meta-social";
import type { StrapiSeoStructured } from "@/lib/seo/parse-json-string";

export type StrapiPageSeo = StrapiSeoStructured & {
  metaTitle?: string;
  metaDescription?: string;
  keywords?: string;
  canonicalURL?: string;
  metaImage?: { url?: string };
  metaRobots?: string;
  metaSocial?: StrapiMetaSocial[] | null;
};

export type StrapiPageRecord = {
  seo?: StrapiPageSeo;
  Name?: string;
};

export type PageSeoFallbacks = {
  title: string;
  description: string;
  path: string;
  keywords?: string[];
  ogImage?: string;
};

export async function getStrapiPage(
  ...slugs: string[]
): Promise<StrapiPageRecord | null> {
  for (const slug of slugs) {
    const page = (await getPageBySlug(slug)) as StrapiPageRecord | null;
    if (page) return page;
  }
  return null;
}

export function buildWebPageJsonLd(input: {
  name: string;
  description: string;
  path: string;
}): Record<string, unknown> {
  const url = `${SITE_URL}${input.path === "/" ? "" : input.path}`;
  return {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: input.name,
    description: input.description,
    url,
    isPartOf: {
      "@type": "WebSite",
      name: "Zuse Digital",
      url: SITE_URL,
    },
    publisher: {
      "@type": "Organization",
      name: "Zuse Digital",
      url: SITE_URL,
    },
  };
}

export async function buildStrapiPageMetadata(
  slugOrSlugs: string | string[],
  fallbacks: PageSeoFallbacks
): Promise<Metadata> {
  const slugs = Array.isArray(slugOrSlugs) ? slugOrSlugs : [slugOrSlugs];
  const page = await getStrapiPage(...slugs);
  return buildMetadataFromSeo(page?.seo, fallbacks);
}

/**
 * Resolve the canonical URL from a CMS `canonicalURL` override, guarding against
 * stale values. A page should self-canonicalise; a legitimate cross-site canonical
 * points to another origin (syndication). A CMS canonical on THIS origin but at a
 * different path is almost always a mis-entered/stale slug — and if that path does
 * not exist it deindexes the page by canonicalising it to a 404. In that case we
 * ignore the CMS value and use the page's own URL.
 */
function resolveCanonical(
  cmsCanonical: string | undefined,
  selfCanonical: string
): string {
  if (!cmsCanonical) return selfCanonical;
  const cms = normalizeCanonical(cmsCanonical);
  try {
    const cmsUrl = new URL(cms);
    const selfUrl = new URL(selfCanonical);
    // Different origin => legitimate cross-site canonical; honour it.
    if (cmsUrl.origin !== selfUrl.origin) return cms;
    // Same origin + same path => fine. Same origin, different path => stale; use self.
    if (cmsUrl.pathname === selfUrl.pathname) return cms;
    if (process.env.NODE_ENV !== "production") {
      console.warn(
        `[seo] Ignoring same-site canonicalURL "${cms}" that does not match the ` +
          `page URL "${selfCanonical}"; using the page's own URL. Fix the CMS value.`
      );
    }
    return selfCanonical;
  } catch {
    return selfCanonical;
  }
}

/** Build Next metadata from an already-fetched Strapi SEO object (no page lookup). */
export function buildMetadataFromSeo(
  seo: StrapiPageSeo | null | undefined,
  fallbacks: PageSeoFallbacks
): Metadata {
  const title = seo?.metaTitle || fallbacks.title;
  const description = seo?.metaDescription || fallbacks.description;
  const selfCanonical = normalizeCanonical(
    `${SITE_URL}${fallbacks.path === "/" ? "" : fallbacks.path}`
  );
  const canonical = resolveCanonical(seo?.canonicalURL, selfCanonical);
  const keywords = seo?.keywords
    ? seo.keywords.split(",").map((k) => k.trim()).filter(Boolean)
    : fallbacks.keywords || [];
  const ogImage = fallbacks.ogImage || "/images/Socialthumbnail/ZuseDigital-Landing-Page-Social-Thumbnail.jpg";

  const social = resolveSocialMetadata(seo, {
    title: fallbacks.title,
    description: fallbacks.description,
    image: ogImage,
  });

  // Off-production, force noindex/nofollow regardless of CMS values so staging,
  // preview, and local builds can never be indexed.
  const noindex = !IS_INDEXABLE || (seo?.metaRobots?.includes("noindex") ?? false);
  const nofollow = !IS_INDEXABLE || (seo?.metaRobots?.includes("nofollow") ?? false);

  return {
    title,
    description,
    keywords,
    alternates: { canonical },
    robots: {
      index: !noindex,
      follow: !nofollow,
      googleBot: {
        index: !noindex,
        follow: !nofollow,
        "max-video-preview": -1,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
    openGraph: {
      title: social.openGraph.title,
      description: social.openGraph.description,
      url: canonical,
      siteName: "Zuse Digital",
      locale: "en_AU",
      type: "website",
      images: [
        {
          url: social.openGraph.image,
          width: 1200,
          height: 630,
          alt: social.openGraph.title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: social.twitter.title,
      description: social.twitter.description,
      images: [social.twitter.image],
      site: "@zusedigital",
      creator: "@zusedigital",
    },
  };
}
