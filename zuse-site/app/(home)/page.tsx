import type { Metadata } from "next";
import { RenderSections } from "@/components/sections/SectionsPage";
import { getPageBySlug } from "@/lib/strapi";
import { home } from "@/content/pages/home";
import { getPageSections } from "@/lib/pages";
import { SITE_URL, normalizeCanonical, IS_INDEXABLE } from "@/lib/config/site";
import {
  resolveStructuredDataList,
  type StrapiSeoStructured,
} from "@/lib/seo/parse-json-string";
import {
  resolveSocialMetadata,
  type StrapiMetaSocial,
} from "@/lib/seo/meta-social";

type StrapiSeo = StrapiSeoStructured & {
  metaTitle?: string;
  metaDescription?: string;
  keywords?: string;
  canonicalURL?: string;
  metaImage?: { url?: string };
  metaRobots?: string;
  metaSocial?: StrapiMetaSocial[] | null;
};

type StrapiPage = {
  seo?: StrapiSeo;
  Name?: string;
};

const FALLBACK_TITLE =
  "Australian Website Design, Software Development & AI Agency | Zuse Digital";
const FALLBACK_DESC =
  "Award-winning Australian software agency delivering AI-powered websites, web apps, and mobile apps with world-class design.";

export async function generateMetadata(): Promise<Metadata> {
  const page = (await getPageBySlug("home")) as StrapiPage | null;
  const seo = page?.seo;
  const title = seo?.metaTitle || FALLBACK_TITLE;
  const description = seo?.metaDescription || FALLBACK_DESC;
  const canonical = normalizeCanonical(seo?.canonicalURL || SITE_URL);
  const keywords = seo?.keywords
    ? seo.keywords.split(",").map((k) => k.trim()).filter(Boolean)
    : [
      "website design australia",
      "software development agency",
      "AI agency australia",
      "web app development",
      "mobile app development",
      "zuse digital",
    ];

  const social = resolveSocialMetadata(seo, {
    title: FALLBACK_TITLE,
    description: FALLBACK_DESC,
    image: "/images/Socialthumbnail/ZuseDigital-Landing-Page-Social-Thumbnail.jpg",
  });

  return {
    title,
    description,
    keywords,
    alternates: { canonical },
    robots: {
      index: IS_INDEXABLE && !seo?.metaRobots?.includes("noindex"),
      follow: IS_INDEXABLE && !seo?.metaRobots?.includes("nofollow"),
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

export default async function Home() {
  const [page, sections] = await Promise.all([getPageBySlug("home"), getPageSections(home)]);
  const seo = (page as StrapiPage | null)?.seo;
  const structuredDataList = resolveStructuredDataList(seo);
  return (
    <main className="relative">
      {structuredDataList.map((item, index) => (
        <script
          key={`ld-json-${index}`}
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(item).replace(/</g, "\\u003c"),
          }}
        />
      ))}
      <RenderSections sections={sections} />
    </main>
  );
}
