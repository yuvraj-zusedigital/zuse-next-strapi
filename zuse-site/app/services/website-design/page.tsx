import SectionsPage from "@/components/sections/SectionsPage";
import { websiteDesign } from "@/content/pages/services";
import { getPageSections } from "@/lib/pages";
import { resolvePageJsonLd } from "@/components/seo/JsonLd";
import {
  buildStrapiPageMetadata,
  buildWebPageJsonLd,
  getStrapiPage,
} from "@/lib/seo/strapi-page-metadata";

const FALLBACKS = {
  title: "Website Design | Zuse Digital",
  description:
    "Award-winning website design from Zuse Digital — beautiful, high-performing sites built for brands that want measurable digital results.",
  path: "/services/website-design",
  keywords: [
    "website design australia",
    "UI UX design agency",
    "custom website design",
    "melbourne web design",
    "zuse digital websites",
  ],
  ogImage: "/images/og-website-design.jpg",
};

export async function generateMetadata() {
  return buildStrapiPageMetadata("service-website-design", FALLBACKS);
}

export default async function WebsiteDesignPage() {
  const page = await getStrapiPage("service-website-design");
  const jsonLd = resolvePageJsonLd(
    page?.seo,
    buildWebPageJsonLd({
      name: FALLBACKS.title,
      description: FALLBACKS.description,
      path: FALLBACKS.path,
    })
  );

  return <SectionsPage sections={await getPageSections(websiteDesign)} jsonLd={jsonLd} />;
}
