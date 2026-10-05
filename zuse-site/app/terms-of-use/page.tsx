import SectionsPage from "@/components/sections/SectionsPage";
import { termsOfUse } from "@/content/pages/legal";
import { getPageSections } from "@/lib/pages";
import { resolvePageJsonLd } from "@/components/seo/JsonLd";
import {
  buildStrapiPageMetadata,
  buildWebPageJsonLd,
  getStrapiPage,
} from "@/lib/seo/strapi-page-metadata";

const FALLBACKS = {
  title: "Terms of Use | Zuse Digital",
  description:
    "Terms governing access to and use of the Zuse Digital website and services.",
  path: "/terms-of-use",
  keywords: ["Zuse Digital terms", "website terms of use"],
};

export async function generateMetadata() {
  return buildStrapiPageMetadata("terms-of-use", FALLBACKS);
}

export default async function TermsOfUsePage() {
  const page = await getStrapiPage("terms-of-use");
  const jsonLd = resolvePageJsonLd(
    page?.seo,
    buildWebPageJsonLd({
      name: FALLBACKS.title,
      description: FALLBACKS.description,
      path: FALLBACKS.path,
    })
  );

  return <SectionsPage sections={await getPageSections(termsOfUse)} jsonLd={jsonLd} layout="legal" />;
}
