import { notFound } from "next/navigation";
import { JsonLd, resolvePageJsonLd } from "@/components/seo/JsonLd";
import SectionsPage, { RenderSections } from "@/components/sections/SectionsPage";
import { getPageByPath } from "@/lib/pages";
import { buildMetadataFromSeo, buildWebPageJsonLd } from "@/lib/seo/strapi-page-metadata";

/**
 * Pages created in the CMS: any published page whose path has no route of its
 * own (e.g. /careers) is served here. Built-in routes always win.
 */
type Props = { params: Promise<{ path: string[] }> };

const pathOf = async (params: Props["params"]) => `/${(await params).path.join("/")}`;

export async function generateMetadata({ params }: Props) {
  const page = await getPageByPath(await pathOf(params));
  if (!page) return { title: "Page not found | Zuse Digital" };
  return buildMetadataFromSeo(page.seo, {
    title: `${page.name} | Zuse Digital`,
    description: "",
    path: page.path,
  });
}

export default async function CmsPageRoute({ params }: Props) {
  const page = await getPageByPath(await pathOf(params));
  // Only a missing page is "not found". A page whose sections are all hidden
  // (or that has none yet) still exists: it shows the header and footer.
  if (!page) notFound();

  const jsonLd = resolvePageJsonLd(
    page.seo,
    buildWebPageJsonLd({ name: `${page.name} | Zuse Digital`, description: "", path: page.path }),
  );

  // Pages that open with a heading use the long-form layout (spacing under the
  // header); pages that open with a hero or other full-width block run edge to edge.
  const first = page.sections[0]?.__component;
  if (first === "sections.page-intro" || first === "sections.rich-text") {
    return <SectionsPage sections={page.sections} jsonLd={jsonLd} />;
  }
  return (
    <main className="relative">
      <JsonLd data={jsonLd} />
      <RenderSections sections={page.sections} />
    </main>
  );
}
