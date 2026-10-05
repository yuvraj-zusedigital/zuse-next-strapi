import { RenderSections } from "@/components/sections/SectionsPage";
import { getPageSections } from "@/lib/pages";
import { contact } from "@/content/pages/contact";
import { JsonLd, resolvePageJsonLd } from "@/components/seo/JsonLd";
import {
  buildStrapiPageMetadata,
  buildWebPageJsonLd,
  getStrapiPage,
} from "@/lib/seo/strapi-page-metadata";

const FALLBACKS = {
  title: "Contact | Zuse Digital",
  description:
    "Get in touch with Zuse Digital. Tell us about your project — websites, web apps, mobile apps, and AI-powered digital products.",
  path: "/contact",
  keywords: [
    "contact zuse digital",
    "hire software agency",
    "website design quote",
    "app development australia",
    "melbourne digital agency",
  ],
  ogImage: "/images/Socialthumbnail/ContactUs-Social-Thumbnail.jpg",
};

export async function generateMetadata() {
  return buildStrapiPageMetadata("contact", FALLBACKS);
}

export default async function ContactPage() {
  const sections = await getPageSections(contact);
  const page = await getStrapiPage("contact");
  const jsonLd = resolvePageJsonLd(
    page?.seo,
    buildWebPageJsonLd({
      name: FALLBACKS.title,
      description: FALLBACKS.description,
      path: FALLBACKS.path,
    })
  );

  return (
    <main>
      <JsonLd data={jsonLd} />
      <RenderSections sections={sections} />
    </main>
  );
}
