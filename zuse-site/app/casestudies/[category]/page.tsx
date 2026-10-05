import { RenderSections } from "@/components/sections/SectionsPage";
import { getPageSections } from "@/lib/pages";
import { workPage } from "@/content/pages/listings";
import { notFound } from "next/navigation";
import { JsonLd, resolvePageJsonLd } from "@/components/seo/JsonLd";
import {
  buildMetadataFromSeo,
  buildWebPageJsonLd,
} from "@/lib/seo/strapi-page-metadata";
import { getProjectCategories } from "@/lib/strapi";
import { categoryLabel, type WorkCategory } from "@/lib/work";

type PageProps = {
  params: Promise<{ category: string }>;
};

async function getCategories() {
  return (await getProjectCategories()) as WorkCategory[];
}

async function findCategory(slug: string) {
  const categories = await getCategories();
  return {
    categories,
    category: categories.find((cat) => cat.slug === slug) || null,
  };
}

function pageCopy(category: WorkCategory) {
  const label = categoryLabel(category);
  return {
    title: `${label} Case Studies | Zuse Digital`,
    description: `Explore Zuse Digital's ${label.toLowerCase()} case studies: award-winning digital products designed and built for Australian and global brands.`,
    path: `/casestudies/${category.slug}`,
  };
}

export async function generateStaticParams() {
  const categories = await getCategories();
  return categories
    .map((cat) => cat.slug)
    .filter((slug): slug is string => Boolean(slug))
    .map((category) => ({ category }));
}

export async function generateMetadata({ params }: PageProps) {
  const { category: slug } = await params;
  const { category } = await findCategory(slug);
  if (!category) return { title: "Case Studies | Zuse Digital" };

  const copy = pageCopy(category);
  return buildMetadataFromSeo(null, {
    ...copy,
    keywords: ["zuse digital case studies", categoryLabel(category), "portfolio"],
    ogImage: "/images/Socialthumbnail/OurWork-Social-Thumbnail.jpg",
  });
}

export default async function CaseStudyCategoryPage({ params }: PageProps) {
  const { category: slug } = await params;
  const { category } = await findCategory(slug);
  if (!category) notFound();

  const copy = pageCopy(category);
  const jsonLd = resolvePageJsonLd(
    null,
    buildWebPageJsonLd({
      name: copy.title,
      description: copy.description,
      path: copy.path,
    })
  );

  // The Work page's sections, with this category selected in its grid.
  return (
    <main className="overflow-x-hidden">
      <JsonLd data={jsonLd} />
      <RenderSections sections={await getPageSections(workPage)} intro="work" activeCategory={slug} />
    </main>
  );
}
