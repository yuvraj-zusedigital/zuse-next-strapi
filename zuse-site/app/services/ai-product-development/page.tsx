import SectionsPage from "@/components/sections/SectionsPage";
import { aiProductDevelopment } from "@/content/pages/ai";
import { getPageSections } from "@/lib/pages";
import { resolvePageJsonLd } from "@/components/seo/JsonLd";
import {
  buildStrapiPageMetadata,
  buildWebPageJsonLd,
  getStrapiPage,
} from "@/lib/seo/strapi-page-metadata";

const FALLBACKS = {
  title: "AI Product Development | Zuse Digital",
  description:
    "AI product development from Zuse Digital — build intelligent solutions that automate, optimise, and scale your business.",
  path: "/services/ai-product-development",
  keywords: [
    "AI product development",
    "AI solutions",
    "intelligent products",
    "AI software australia",
    "zuse digital AI products",
  ],
  ogImage: "/images/og-ai-product.jpg",
};

export async function generateMetadata() {
  return buildStrapiPageMetadata(
    ["service-ai-product-development", "service-artificial-intelligence"],
    FALLBACKS
  );
}

export default async function AiProductDevelopmentPage() {
  const dedicated = await getStrapiPage("service-ai-product-development");
  // Prefer dedicated CMS JSON-LD; never reuse parent AI-page schema on this URL.
  const jsonLd = dedicated
    ? resolvePageJsonLd(
        dedicated.seo,
        buildWebPageJsonLd({
          name: FALLBACKS.title,
          description: FALLBACKS.description,
          path: FALLBACKS.path,
        })
      )
    : [
        buildWebPageJsonLd({
          name: FALLBACKS.title,
          description: FALLBACKS.description,
          path: FALLBACKS.path,
        }),
      ];

  return <SectionsPage sections={await getPageSections(aiProductDevelopment)} jsonLd={jsonLd} />;
}
