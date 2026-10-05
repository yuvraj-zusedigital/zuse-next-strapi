import { notFound } from "next/navigation";
import CaseStudyExperience from "@/components/casestudy/CaseStudyExperience";
import { resolvePageJsonLd } from "@/components/seo/JsonLd";
import {
  buildMetadataFromSeo,
  buildStrapiPageMetadata,
  buildWebPageJsonLd,
} from "@/lib/seo/strapi-page-metadata";
import { getCaseStudy, getCaseStudyParams } from "@/lib/casestudies/cms";

type PageProps = {
  params: Promise<{ category: string; slug: string }>;
};

export async function generateStaticParams() {
  return getCaseStudyParams();
}

export async function generateMetadata({ params }: PageProps) {
  const { category, slug } = await params;
  const study = await getCaseStudy(category, slug);
  if (!study) {
    return { title: "Case Study | Zuse Digital" };
  }

  const path = `/casestudies/${category}/${slug}`;
  const fallbacks = {
    title: `${study.title} | Zuse Digital`,
    description: study.description,
    path,
    keywords: ["zuse digital case study", study.title, category],
    ogImage: study.banner,
  };
  // The project's SEO (edited on the project in the CMS) first; then the legacy SEO page.
  return study.seo ? buildMetadataFromSeo(study.seo, fallbacks) : buildStrapiPageMetadata(study.strapiSlug || `casestudy-${slug}`, fallbacks);
}

export default async function CaseStudyPage({ params }: PageProps) {
  const { category, slug } = await params;
  const study = await getCaseStudy(category, slug);
  if (!study) notFound();

  const path = `/casestudies/${category}/${slug}`;
  // Structured data written on the project in the CMS, else a generated WebPage.
  const jsonLd = resolvePageJsonLd(
    study.seo ?? null,
    buildWebPageJsonLd({
      name: study.title,
      description: study.description,
      path,
    })
  );

  return <CaseStudyExperience study={study} jsonLd={jsonLd} />;
}
