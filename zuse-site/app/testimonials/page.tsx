import { RenderSections } from "@/components/sections/SectionsPage";
import { getPageSections } from "@/lib/pages";
import { testimonialsPage } from "@/content/pages/listings";
import { JsonLd, resolvePageJsonLd } from "@/components/seo/JsonLd";
import {
  buildStrapiPageMetadata,
  buildWebPageJsonLd,
  getStrapiPage,
} from "@/lib/seo/strapi-page-metadata";

const FALLBACKS = {
  title: "Testimonials | Zuse Digital",
  description:
    "Hear from clients who partnered with Zuse Digital for website design, software development, and AI-powered digital products.",
  path: "/testimonials",
  keywords: [
    "zuse digital testimonials",
    "client reviews",
    "agency testimonials australia",
    "software development reviews",
    "website design feedback",
  ],
  ogImage: "/images/Socialthumbnail/Testimonial-Social-Thumbnail.jpg",
};

export async function generateMetadata() {
  return buildStrapiPageMetadata("testimonials", FALLBACKS);
}

export default async function TestimonialsPage() {
  const sections = await getPageSections(testimonialsPage);
  const page = await getStrapiPage("testimonials");
  const jsonLd = resolvePageJsonLd(
    page?.seo,
    buildWebPageJsonLd({
      name: FALLBACKS.title,
      description: FALLBACKS.description,
      path: FALLBACKS.path,
    })
  );

  return (
    <main className="overflow-x-clip">
      <JsonLd data={jsonLd} />
      <RenderSections sections={sections} intro="testimonials" />
    </main>
  );
}
