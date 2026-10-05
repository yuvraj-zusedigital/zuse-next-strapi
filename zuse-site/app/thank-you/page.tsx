import { RenderSections } from "@/components/sections/SectionsPage";
import { getPageSections } from "@/lib/pages";
import { contact } from "@/content/pages/contact";
import type { Metadata } from "next";
import { buildMetadataFromSeo } from "@/lib/seo/strapi-page-metadata";

const FALLBACKS = {
  title: "Thank You | Zuse Digital",
  description:
    "Thanks for contacting Zuse Digital. We'll reach out within one business day for a free estimation call.",
  path: "/thank-you",
  ogImage: "/images/Socialthumbnail/ContactUs-Social-Thumbnail.jpg",
};

export const metadata: Metadata = {
  ...buildMetadataFromSeo(null, FALLBACKS),
  robots: { index: false, follow: true },
};

/** Same content as the contact page; its form section holds the thank-you message. */
export default async function ThankYouPage() {
  const sections = await getPageSections(contact);
  return (
    <main>
      <RenderSections sections={sections} thankYou />
    </main>
  );
}
