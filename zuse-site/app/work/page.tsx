import { RenderSections } from "@/components/sections/SectionsPage";
import { getPageSections } from "@/lib/pages";
import { getPageBySlug } from "@/lib/strapi";
import { workPage } from "@/content/pages/listings";
import { JsonLd, resolvePageJsonLd } from "@/components/seo/JsonLd";
import {
  buildStrapiPageMetadata,
  buildWebPageJsonLd,
} from "@/lib/seo/strapi-page-metadata";

const FALLBACKS = {
  title: "Our Work | Zuse Digital",
  description:
    "Explore award-winning websites, web apps, and mobile products designed and built by Zuse Digital for Australian and global brands.",
  path: "/work",
  keywords: [
    "zuse digital work",
    "portfolio",
    "case studies",
    "website design portfolio",
    "app development projects",
  ],
  ogImage: "/images/Socialthumbnail/OurWork-Social-Thumbnail.jpg",
};

export async function generateMetadata() {
  return buildStrapiPageMetadata("work", FALLBACKS);
}

export default async function WorkPage() {
  const [sections, page] = await Promise.all([getPageSections(workPage), getPageBySlug("work")]);
  const jsonLd = resolvePageJsonLd(
    (page as { seo?: Parameters<typeof resolvePageJsonLd>[0] } | null)?.seo,
    buildWebPageJsonLd({
      name: FALLBACKS.title,
      description: FALLBACKS.description,
      path: FALLBACKS.path,
    })
  );

  return (
    <main className="overflow-x-hidden">
      <JsonLd data={jsonLd} />
      <RenderSections sections={sections} intro="work" />
    </main>
  );
}
