/**
 * Case studies from Strapi projects (the "Case study" fields), with the
 * built-in data in lib/casestudies/data as the fallback for anything a project
 * leaves empty — so pages stay complete while content moves into the CMS.
 * A project gets a case-study page when its path is /casestudies/<category>/<slug>/.
 */

import type { Block } from "@/lib/blocks";
import { mediaUrl } from "@/lib/cms-content";
import { strapiFetch } from "@/lib/strapi";
import type { StrapiPageSeo } from "@/lib/seo/strapi-page-metadata";
import { CASE_STUDIES } from "./index";
import type { CaseStudy, CaseStudyBlock, CaseStudyImage, CaseStudyMetaField, CaseStudyTestimonial } from "./types";

type RawMedia = { url?: string | null; alternativeText?: string | null; width?: number | null; height?: number | null } | null | undefined;

type RawProject = {
  Title?: string | null;
  seo?: StrapiPageSeo | null;
  slug?: string | null;
  project_details_path?: string | null;
  is_coming_soon?: boolean | null;
  CaseStudyTitle?: string | null;
  CaseStudyDescription?: string | null;
  CaseStudyAbout?: string | null;
  CaseStudyBanner?: RawMedia;
  CaseStudyMeta?: { label?: string | null; value?: string | null; href?: string | null; hrefLabel?: string | null }[] | null;
  CaseStudyBlocks?: ({ __component: string } & Record<string, unknown>)[] | null;
  testimonial?: {
    name?: string | null;
    company?: string | null;
    role?: string | null;
    excerpt?: string | null;
    content?: string | null;
    rating?: number | null;
    portrait?: RawMedia;
    logo?: RawMedia;
  } | null;
};

const POPULATE = [
  "populate[CaseStudyBanner]=true",
  "populate[CaseStudyMeta]=true",
  "populate[CaseStudyBlocks][populate]=*",
  "populate[testimonial][populate][portrait]=true",
  "populate[testimonial][populate][logo]=true",
  "populate[seo][populate][metaImage]=true",
  "populate[seo][populate][metaSocial][populate][image]=true",
].join("&");

/** "/casestudies/web-apps/lv/" → { category: "web-apps", slug: "lv" } */
function parsePath(path: string | null | undefined) {
  const match = /^\/casestudies\/([^/]+)\/([^/]+)\/?$/.exec(path ?? "");
  return match ? { category: match[1], slug: match[2] } : null;
}

const image = (media: RawMedia, alt?: string | null): CaseStudyImage | null =>
  media?.url ? { src: mediaUrl(media), alt: media.alternativeText || alt || undefined, width: media.width ?? undefined, height: media.height ?? undefined } : null;

/** Rich text → plain paragraphs (the case-study layout shows text paragraphs). */
function paragraphsOf(blocks: Block[] | null | undefined) {
  const text = (nodes: unknown[]): string =>
    nodes
      .map((node) => {
        const item = node as { text?: string; children?: unknown[] };
        return item.text ?? (item.children ? text(item.children) : "");
      })
      .join("");
  return (blocks ?? []).map((block) => text((block as { children?: unknown[] }).children ?? [])).filter((line) => line.trim());
}

function toBlock(raw: { __component: string } & Record<string, unknown>): CaseStudyBlock | null {
  switch (raw.__component) {
    case "case-study.text-block": {
      const bullets = ((raw.bullets as { title?: string | null; description?: string | null }[] | null) ?? []).map((bullet) => ({
        title: bullet.title ?? undefined,
        body: bullet.description ?? "",
      }));
      return {
        type: "text",
        title: (raw.title as string | null) ?? undefined,
        paragraphs: paragraphsOf(raw.body as Block[] | null),
        bullets: bullets.length ? bullets : undefined,
        bulletColumns: raw.bulletColumns === "two" ? 2 : 1,
      };
    }
    case "case-study.image-block": {
      const img = image(raw.image as RawMedia);
      return img ? { type: "image", image: img } : null;
    }
    case "case-study.image-pair": {
      const images = ((raw.images as RawMedia[] | null) ?? []).map((media) => image(media)).filter((img): img is CaseStudyImage => img !== null);
      return images.length >= 2 ? { type: "imageGrid", images: [images[0], images[1]] } : null;
    }
    default:
      return null;
  }
}

function toMeta(raw: NonNullable<RawProject["CaseStudyMeta"]>): CaseStudyMetaField[] {
  return raw
    .filter((field) => field.label)
    .map((field) => {
      // One item per line = a list (docs/page-builder.md).
      const lines = (field.value ?? "").split("\n").map((line) => line.trim()).filter(Boolean);
      return {
        label: field.label!,
        ...(lines.length > 1 ? { list: lines } : { value: lines[0] }),
        href: field.href ?? undefined,
        hrefLabel: field.hrefLabel ?? undefined,
      };
    });
}

function toTestimonial(raw: NonNullable<RawProject["testimonial"]>): CaseStudyTestimonial | null {
  const avatar = image(raw.portrait, raw.name);
  if (!raw.name || !avatar) return null;
  const full = (raw.content ?? "").split(/\n\s*\n/).map((paragraph) => paragraph.trim()).filter(Boolean);
  return {
    name: raw.name,
    role: raw.role || raw.company || "",
    avatar,
    brandLogo: image(raw.logo) ?? undefined,
    excerpt: raw.excerpt || full[0] || "",
    full: full.length ? full : undefined,
    rating: raw.rating ?? 5,
  };
}

async function fetchProject(slug: string) {
  const json = (await strapiFetch(`/api/projects?filters[slug][$eq]=${encodeURIComponent(slug)}&${POPULATE}`)) as { data?: RawProject[] } | null;
  return json?.data?.[0] ?? null;
}

/** The case study at /casestudies/<category>/<slug>, or undefined (404). */
export async function getCaseStudy(category: string, slug: string): Promise<CaseStudy | undefined> {
  const fallback = CASE_STUDIES.find((study) => study.category === category && study.slug === slug);
  const project = await fetchProject(slug).catch(() => null);
  const path = parsePath(project?.project_details_path);
  const matches = project && !project.is_coming_soon && path?.category === category;
  if (!matches) return fallback;

  const blocks = (project.CaseStudyBlocks ?? [])
    .filter((raw) => raw.hidden !== true) // switched off in the CMS
    .map(toBlock)
    .filter((block): block is CaseStudyBlock => block !== null);
  const meta = toMeta(project.CaseStudyMeta ?? []);
  const banner = image(project.CaseStudyBanner);
  const testimonial = project.testimonial ? toTestimonial(project.testimonial) : null;

  return {
    category,
    slug,
    title: project.CaseStudyTitle || fallback?.title || project.Title || slug,
    description: project.CaseStudyDescription || fallback?.description || "",
    banner: banner?.src || fallback?.banner || "",
    about: project.CaseStudyAbout || fallback?.about || "",
    meta: meta.length ? meta : (fallback?.meta ?? []),
    // Built-in blocks only when the project has none at all (hidden ones count as set).
    blocks: project.CaseStudyBlocks?.length ? blocks : (fallback?.blocks ?? []),
    testimonial: testimonial ?? fallback?.testimonial,
    strapiSlug: fallback?.strapiSlug,
    seo: project.seo ?? null,
  };
}

/** Every case-study page: the built-in ones plus projects with a case-study path. */
export async function getCaseStudyParams() {
  const params = new Map(CASE_STUDIES.map((study) => [`${study.category}/${study.slug}`, { category: study.category, slug: study.slug }]));
  const json = (await strapiFetch("/api/projects?fields[0]=project_details_path&fields[1]=is_coming_soon&pagination[pageSize]=100").catch(() => null)) as {
    data?: RawProject[];
  } | null;
  for (const project of json?.data ?? []) {
    const path = parsePath(project.project_details_path);
    if (path && !project.is_coming_soon) params.set(`${path.category}/${path.slug}`, path);
  }
  return [...params.values()];
}
