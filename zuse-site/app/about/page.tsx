import SectionsPage from "@/components/sections/SectionsPage";
import { about } from "@/content/pages/company";
import { getPageSections } from "@/lib/pages";
import { resolvePageJsonLd } from "@/components/seo/JsonLd";
import {
  buildStrapiPageMetadata,
  buildWebPageJsonLd,
  getStrapiPage,
} from "@/lib/seo/strapi-page-metadata";

const FALLBACKS = {
  title: "About Us | Zuse Digital",
  description:
    "Learn about Zuse Digital, an award-winning Australian software agency. We build AI-powered websites and world-class digital products.",
  path: "/about",
  keywords: [
    "about zuse digital",
    "software agency australia",
    "website design team",
    "digital agency melbourne",
    "AI developers",
  ],
  ogImage: "/images/og-about.jpg",
};

export async function generateMetadata() {
  return buildStrapiPageMetadata("about", FALLBACKS);
}

export default async function AboutPage() {
  const page = await getStrapiPage("about");
  const jsonLd = resolvePageJsonLd(
    page?.seo,
    buildWebPageJsonLd({
      name: FALLBACKS.title,
      description: FALLBACKS.description,
      path: FALLBACKS.path,
    })
  );

  return <SectionsPage sections={await getPageSections(about)} jsonLd={jsonLd} />;
}
