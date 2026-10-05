import { RenderSections } from "@/components/sections/SectionsPage";
import { zanyar } from "@/content/pages/zanyar";
import { getPageSections } from "@/lib/pages";
import { JsonLd, resolvePageJsonLd } from "@/components/seo/JsonLd";
import {
  buildStrapiPageMetadata,
  buildWebPageJsonLd,
  getStrapiPage,
} from "@/lib/seo/strapi-page-metadata";

const FALLBACKS = {
  title: "Zanyar Outhman | Founder & Director | Zuse Digital",
  description:
    "Zanyar Outhman is the founder and director of Zuse Digital — an award-winning Australian software agency specialising in AI-powered websites, web apps, and mobile apps.",
  path: "/zanyar-outhman",
  keywords: [
    "zanyar outhman",
    "zuse digital founder",
    "australian tech entrepreneur",
    "ai product architect",
    "digital agency melbourne",
  ],
};

export async function generateMetadata() {
  return buildStrapiPageMetadata("zanyar-outhman", FALLBACKS);
}

export default async function ZanyarOuthmanPage() {
  const page = await getStrapiPage("zanyar-outhman");
  const jsonLd = resolvePageJsonLd(
    page?.seo,
    buildWebPageJsonLd({
      name: FALLBACKS.title,
      description: FALLBACKS.description,
      path: FALLBACKS.path,
    })
  );

  const sections = await getPageSections(zanyar);

  return (
    <main className="about-zan-page">
      <JsonLd data={jsonLd} />
      <RenderSections sections={sections} />
    </main>
  );
}
