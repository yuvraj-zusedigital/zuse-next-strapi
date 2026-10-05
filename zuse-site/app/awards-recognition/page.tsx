import SectionsPage from "@/components/sections/SectionsPage";
import { awards } from "@/content/pages/company";
import { getPageSections } from "@/lib/pages";
import { resolvePageJsonLd } from "@/components/seo/JsonLd";
import {
  buildStrapiPageMetadata,
  buildWebPageJsonLd,
  getStrapiPage,
} from "@/lib/seo/strapi-page-metadata";

const FALLBACKS = {
  title: "Awards & Recognition | Zuse Digital",
  description:
    "Industry awards and recognition earned by Zuse Digital for UI/UX design, software development, and outstanding digital products.",
  path: "/awards-recognition",
  keywords: [
    "zuse digital awards",
    "best ui ux agency",
    "design awards australia",
    "software agency recognition",
    "apple design accolades",
  ],
};

export async function generateMetadata() {
  return buildStrapiPageMetadata("awards", FALLBACKS);
}

export default async function AwardsRecognitionPage() {
  const page = await getStrapiPage("awards");
  const jsonLd = resolvePageJsonLd(
    page?.seo,
    buildWebPageJsonLd({
      name: FALLBACKS.title,
      description: FALLBACKS.description,
      path: FALLBACKS.path,
    })
  );

  return <SectionsPage sections={await getPageSections(awards)} jsonLd={jsonLd} />;
}
