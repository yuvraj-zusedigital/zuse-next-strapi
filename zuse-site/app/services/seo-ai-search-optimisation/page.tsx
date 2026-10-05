import SectionsPage from "@/components/sections/SectionsPage";
import { seoAiSearchOptimisation } from "@/content/pages/services";
import { getPageSections } from "@/lib/pages";
import { resolvePageJsonLd } from "@/components/seo/JsonLd";
import {
  buildStrapiPageMetadata,
  buildWebPageJsonLd,
  getStrapiPage,
} from "@/lib/seo/strapi-page-metadata";

const FALLBACKS = {
  title: "SEO & AI Search Optimisation | Zuse Digital",
  description:
    "SEO and AI search optimisation services from Zuse Digital — technical SEO, content strategy, and visibility in traditional and AI-powered search.",
  path: "/services/seo-ai-search-optimisation",
  keywords: [
    "SEO australia",
    "AI search optimisation",
    "technical SEO",
    "search visibility",
    "zuse digital SEO",
  ],
  ogImage: "/images/og-seo.jpg",
};

export async function generateMetadata() {
  return buildStrapiPageMetadata("service-seo-ai-search-optimisation", FALLBACKS);
}

export default async function SeoAiSearchOptimisationPage() {
  const page = await getStrapiPage("service-seo-ai-search-optimisation");
  const jsonLd = resolvePageJsonLd(
    page?.seo,
    buildWebPageJsonLd({
      name: FALLBACKS.title,
      description: FALLBACKS.description,
      path: FALLBACKS.path,
    })
  );

  return <SectionsPage sections={await getPageSections(seoAiSearchOptimisation)} jsonLd={jsonLd} />;
}
