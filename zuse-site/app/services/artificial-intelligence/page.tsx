import SectionsPage from "@/components/sections/SectionsPage";
import { artificialIntelligence } from "@/content/pages/ai";
import { getPageSections } from "@/lib/pages";
import { resolvePageJsonLd } from "@/components/seo/JsonLd";
import {
  buildStrapiPageMetadata,
  buildWebPageJsonLd,
  getStrapiPage,
} from "@/lib/seo/strapi-page-metadata";

const FALLBACKS = {
  title: "Artificial Intelligence | Zuse Digital",
  description:
    "AI strategy, integration, and product development from Zuse Digital — practical artificial intelligence that drives business outcomes.",
  path: "/services/artificial-intelligence",
  keywords: [
    "AI agency australia",
    "artificial intelligence development",
    "AI integration",
    "machine learning products",
    "zuse digital AI",
  ],
  ogImage: "/images/og-ai.jpg",
};

export async function generateMetadata() {
  return buildStrapiPageMetadata("service-artificial-intelligence", FALLBACKS);
}

export default async function ArtificialIntelligencePage() {
  const page = await getStrapiPage("service-artificial-intelligence");
  const jsonLd = resolvePageJsonLd(
    page?.seo,
    buildWebPageJsonLd({
      name: FALLBACKS.title,
      description: FALLBACKS.description,
      path: FALLBACKS.path,
    })
  );

  return <SectionsPage sections={await getPageSections(artificialIntelligence)} jsonLd={jsonLd} />;
}
