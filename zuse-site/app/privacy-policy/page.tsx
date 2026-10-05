import SectionsPage from "@/components/sections/SectionsPage";
import { privacyPolicy } from "@/content/pages/legal";
import { getPageSections } from "@/lib/pages";
import { resolvePageJsonLd } from "@/components/seo/JsonLd";
import {
  buildStrapiPageMetadata,
  buildWebPageJsonLd,
  getStrapiPage,
} from "@/lib/seo/strapi-page-metadata";

const FALLBACKS = {
  title: "Privacy Policy | Zuse Digital",
  description:
    "How Zuse Digital collects, uses, stores, and protects personal information.",
  path: "/privacy-policy",
  keywords: ["Zuse Digital privacy policy", "personal information"],
};

export async function generateMetadata() {
  return buildStrapiPageMetadata("privacy-policy", FALLBACKS);
}

export default async function PrivacyPolicyPage() {
  const page = await getStrapiPage("privacy-policy");
  const jsonLd = resolvePageJsonLd(
    page?.seo,
    buildWebPageJsonLd({
      name: FALLBACKS.title,
      description: FALLBACKS.description,
      path: FALLBACKS.path,
    })
  );

  return <SectionsPage sections={await getPageSections(privacyPolicy)} jsonLd={jsonLd} layout="legal" />;
}
