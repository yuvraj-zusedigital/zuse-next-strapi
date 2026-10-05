import type { StrapiPageSeo } from "@/lib/seo/strapi-page-metadata";
export type CaseStudyMetaField = {
  label: string;
  value?: string;
  href?: string;
  hrefLabel?: string;
  list?: string[];
};

export type CaseStudyImage = {
  src: string;
  webp?: string;
  alt?: string;
  width?: number;
  height?: number;
};

export type CaseStudyBullet = {
  title?: string;
  body: string;
};

export type CaseStudyTextBlock = {
  type: "text";
  title?: string;
  paragraphs?: string[];
  bullets?: CaseStudyBullet[];
  bulletColumns?: 1 | 2;
};

export type CaseStudyImageBlock = {
  type: "image";
  image: CaseStudyImage;
};

export type CaseStudyImageGridBlock = {
  type: "imageGrid";
  images: [CaseStudyImage, CaseStudyImage];
};

export type CaseStudyBlock =
  | CaseStudyTextBlock
  | CaseStudyImageBlock
  | CaseStudyImageGridBlock;

export type CaseStudyTestimonial = {
  name: string;
  role: string;
  avatar: CaseStudyImage;
  brandLogo?: CaseStudyImage;
  excerpt: string;
  full?: string[];
  rating?: number;
};

export type CaseStudy = {
  category: string;
  slug: string;
  title: string;
  description: string;
  banner: string;
  about: string;
  meta: CaseStudyMetaField[];
  blocks: CaseStudyBlock[];
  testimonial?: CaseStudyTestimonial;
  /** Strapi page slug used for SEO overrides (legacy; the project's own SEO wins) */
  strapiSlug?: string;
  /** The project's SEO block from the CMS, when filled in. */
  seo?: StrapiPageSeo | null;
};
