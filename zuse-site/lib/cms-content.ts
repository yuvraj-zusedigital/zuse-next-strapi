/**
 * Testimonials and awards from Strapi (edited in the Zuse CMS), in the same
 * shapes as the original static data in lib/testimonials.ts and lib/awards.ts.
 * When Strapi has none (or is unreachable) the static data is used, so the
 * pages never render empty.
 */

import { AWARDS, type Award } from "@/lib/awards";
import { getStrapiApiUrl, strapiFetch } from "@/lib/strapi";
import { TESTIMONIALS } from "@/lib/testimonials";

export type Testimonial = {
  name: string;
  company: string;
  paragraphs: string[];
  portrait: string;
  portraitAlt: string;
  logo: string;
  logoAlt: string;
  logoWidth: number;
  logoHeight: number;
  logoWidthMobile: number;
  /** Short version for cards; the first paragraph when not set. */
  excerpt?: string;
  documentId?: string;
};

export type TestimonialCard = { id: string; author: string; company: string; avatar: string; text: string };

type RawMedia = { url?: string | null; alternativeText?: string | null; width?: number | null; height?: number | null } | null | undefined;

export const mediaUrl = (media: RawMedia) => {
  const url = media?.url;
  if (!url) return "";
  return url.startsWith("http") ? url : `${getStrapiApiUrl()}${url}`;
};

/** Blank-line separated text → paragraphs (testimonial convention). */
const paragraphsOf = (text: string | null | undefined) =>
  (text ?? "")
    .split(/\n\s*\n/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);

/** One item per line (award reasons convention). */
export const linesOf = (text: string | null | undefined) =>
  (text ?? "")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

async function fetchAll<T>(path: string): Promise<T[] | null> {
  try {
    const json = (await strapiFetch(path)) as { data?: T[] } | null;
    return json?.data ?? null;
  } catch (error) {
    console.error(`[cms-content] ${path}:`, error);
    return null;
  }
}

// ── Testimonials ──

type RawTestimonial = {
  documentId: string;
  name?: string | null;
  company?: string | null;
  content?: string | null;
  excerpt?: string | null;
  portrait?: RawMedia;
  logo?: RawMedia;
  logoWidth?: number | null;
  logoWidthMobile?: number | null;
};

function toTestimonial(raw: RawTestimonial): Testimonial | null {
  const paragraphs = paragraphsOf(raw.content);
  if (!raw.name || !paragraphs.length) return null;
  const logoWidth = raw.logoWidth || 150;
  const naturalRatio = raw.logo?.width && raw.logo?.height ? raw.logo.height / raw.logo.width : 40 / 150;
  return {
    documentId: raw.documentId,
    name: raw.name,
    company: raw.company ?? "",
    paragraphs,
    excerpt: raw.excerpt?.trim() || undefined,
    portrait: mediaUrl(raw.portrait),
    portraitAlt: raw.portrait?.alternativeText ?? raw.name,
    logo: mediaUrl(raw.logo),
    logoAlt: raw.logo?.alternativeText ?? `${raw.company ?? raw.name} logo`,
    logoWidth,
    logoHeight: Math.round(logoWidth * naturalRatio),
    logoWidthMobile: raw.logoWidthMobile || 100,
  };
}

/** Published testimonials by rank (lowest first), or the static list. */
export async function getTestimonials(): Promise<Testimonial[]> {
  const rows = await fetchAll<RawTestimonial>(
    "/api/testimonials?sort[0]=rank:asc&sort[1]=createdAt:asc&populate[portrait]=true&populate[logo]=true&pagination[pageSize]=100",
  );
  const list = (rows ?? []).map(toTestimonial).filter((item): item is Testimonial => item !== null);
  return list.length ? list : (TESTIMONIALS as unknown as Testimonial[]);
}

/**
 * Testimonials picked in a section ("testimonials" relation), in the order
 * picked; all of them when none are picked (docs/page-builder.md convention).
 */
export async function pickTestimonials(documentIds: string[]): Promise<Testimonial[]> {
  const all = await getTestimonials();
  if (!documentIds.length) return all;
  const byId = new Map(all.map((item) => [item.documentId, item]));
  const picked = documentIds.map((id) => byId.get(id)).filter((item): item is Testimonial => Boolean(item));
  return picked.length ? picked : all;
}

export const toCards = (testimonials: Testimonial[]): TestimonialCard[] =>
  testimonials.map((testimonial, index) => ({
    id: `${index}-${testimonial.name}`,
    author: testimonial.name,
    company: testimonial.company,
    avatar: testimonial.portrait,
    text: testimonial.excerpt ?? testimonial.paragraphs[0],
  }));

export async function getTestimonialCards() {
  return toCards(await getTestimonials());
}

// ── Awards ──

type RawAward = {
  documentId: string;
  slug?: string | null;
  title?: string | null;
  featuredBy?: string | null;
  summary?: string | null;
  about?: string | null;
  reasons?: string | null;
  image?: RawMedia;
  extraImages?: RawMedia[] | null;
};

function toAward(raw: RawAward): Award | null {
  if (!raw.title) return null;
  return {
    id: raw.slug || raw.documentId,
    title: raw.title,
    featuredBy: raw.featuredBy ?? "",
    summary: raw.summary ?? "",
    about: raw.about ?? "",
    reasons: linesOf(raw.reasons),
    image: mediaUrl(raw.image),
    imageAlt: raw.image?.alternativeText ?? raw.title,
    imageWidth: 250,
    imageHeight: 250,
    extraImages: (raw.extraImages ?? [])
      .filter((image) => image?.url)
      .map((image) => ({ src: mediaUrl(image), alt: image?.alternativeText ?? raw.title ?? "", width: 250, height: 250 })),
  };
}

/** Published awards by rank (lowest first), or the static list. */
export async function getAwards(documentIds: string[] = []): Promise<Award[]> {
  const rows = await fetchAll<RawAward & { documentId: string }>(
    "/api/awards?sort[0]=rank:asc&sort[1]=createdAt:asc&populate[image]=true&populate[extraImages]=true&pagination[pageSize]=100",
  );
  const all = (rows ?? [])
    .map((raw) => ({ raw, award: toAward(raw) }))
    .filter((item): item is { raw: RawAward; award: Award } => item.award !== null);
  if (!all.length) return AWARDS;
  if (!documentIds.length) return all.map((item) => item.award);
  const picked = documentIds.map((id) => all.find((item) => item.raw.documentId === id)?.award).filter((award): award is Award => Boolean(award));
  return picked.length ? picked : all.map((item) => item.award);
}
