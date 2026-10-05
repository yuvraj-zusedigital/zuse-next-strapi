import SectionsPage from "@/components/sections/SectionsPage";
import { mobileAppDevelopment } from "@/content/pages/services";
import { getPageSections } from "@/lib/pages";
import { resolvePageJsonLd } from "@/components/seo/JsonLd";
import {
  buildStrapiPageMetadata,
  buildWebPageJsonLd,
  getStrapiPage,
} from "@/lib/seo/strapi-page-metadata";

const FALLBACKS = {
  title: "Mobile App Development | Zuse Digital",
  description:
    "iOS and Android mobile app development from Zuse Digital — beautiful, high-performance apps built for real-world use.",
  path: "/services/mobile-app-development",
  keywords: [
    "mobile app development australia",
    "iOS app development",
    "Android app development",
    "React Native agency",
    "zuse digital mobile apps",
  ],
  ogImage: "/images/og-mobile-apps.jpg",
};

export async function generateMetadata() {
  return buildStrapiPageMetadata("service-mobile-app", FALLBACKS);
}

export default async function MobileAppDevelopmentPage() {
  const page = await getStrapiPage("service-mobile-app");
  const jsonLd = resolvePageJsonLd(
    page?.seo,
    buildWebPageJsonLd({
      name: FALLBACKS.title,
      description: FALLBACKS.description,
      path: FALLBACKS.path,
    })
  );

  return <SectionsPage sections={await getPageSections(mobileAppDevelopment)} jsonLd={jsonLd} />;
}
