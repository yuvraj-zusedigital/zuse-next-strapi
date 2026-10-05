import SectionsPage from "@/components/sections/SectionsPage";
import { webApplicationDevelopment } from "@/content/pages/services";
import { getPageSections } from "@/lib/pages";
import { resolvePageJsonLd } from "@/components/seo/JsonLd";
import {
  buildStrapiPageMetadata,
  buildWebPageJsonLd,
  getStrapiPage,
} from "@/lib/seo/strapi-page-metadata";

const FALLBACKS = {
  title: "Web Application Development | Zuse Digital",
  description:
    "Custom web application development from Zuse Digital — scalable, secure products engineered for startups and enterprise teams.",
  path: "/services/web-application-development",
  keywords: [
    "web application development",
    "custom web apps australia",
    "SaaS development",
    "full stack development",
    "zuse digital web apps",
  ],
  ogImage: "/images/og-web-apps.jpg",
};

export async function generateMetadata() {
  return buildStrapiPageMetadata("service-webapp-development", FALLBACKS);
}

export default async function WebApplicationDevelopmentPage() {
  const page = await getStrapiPage("service-webapp-development");
  const jsonLd = resolvePageJsonLd(
    page?.seo,
    buildWebPageJsonLd({
      name: FALLBACKS.title,
      description: FALLBACKS.description,
      path: FALLBACKS.path,
    })
  );

  return <SectionsPage sections={await getPageSections(webApplicationDevelopment)} jsonLd={jsonLd} />;
}
