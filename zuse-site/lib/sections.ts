/**
 * Page-builder sections (Strapi "sections.*" components), normalised for the
 * site's components: media become { url, alt, … }, relations become
 * { documentId }, links keep their page/href (resolved with resolveLink).
 *
 * The built-in page content in content/pages uses these same shapes, so a
 * page renders identically from Strapi or from its defaults.
 */

import type { Block } from "@/lib/blocks";
import { getStrapiApiUrl } from "@/lib/strapi";

export type Media = { url: string; alt: string; width?: number | null; height?: number | null; mime?: string | null };
export type LinkData = {
  /** Switched off in the CMS. */
  hidden?: boolean | null;
  label: string;
  href?: string | null;
  page?: { path?: string | null } | null;
  openInNewTab?: boolean | null;
  variant?: "primary" | "secondary" | null;
};
export type Ref = { documentId: string };
export type Bullet = { title: string; description?: string | null };

export type PageIntroSection = { __component: "sections.page-intro"; label?: string | null; title: string; lead?: string | null; body?: Block[] | null };
export type RichTextSection = { __component: "sections.rich-text"; body: Block[] };
export type ServiceOfferingsSection = {
  __component: "sections.service-offerings";
  title?: string | null;
  items: { title: string; description?: string | null; points: Bullet[] }[];
};
export type ProcessStepsSection = {
  __component: "sections.process-steps";
  title?: string | null;
  steps: { title: string; description?: string | null; icon?: Media | null; iconSize?: number | null; titleImage?: Media | null; iconOverlay?: Media | null }[];
};
export type BulletGridSection = { __component: "sections.bullet-grid"; title?: string | null; lead?: string | null; items: Bullet[] };
export type BulletGroupsSection = { __component: "sections.bullet-groups"; title?: string | null; groups: { title: string; items: Bullet[] }[] };
export type AwardsListSection = {
  __component: "sections.awards-list";
  title?: string | null;
  lead?: string | null;
  detailed?: boolean | null;
  awards: Ref[];
};
export type CalloutSection = { __component: "sections.callout"; title?: string | null; body?: Block[] | null };
export type AuthorCardSection = {
  __component: "sections.author-card";
  author?: { Name?: string | null; Designation?: string | null; Description?: string | null; Image?: Media | null; profileUrl?: string | null } | null;
};
export type TestimonialsSection = {
  __component: "sections.testimonials";
  title?: string | null;
  description?: string | null;
  layout?: "carousel" | "grid" | null;
  testimonials: Ref[];
};
/** A form field's wording (always shown and required: name, email, message). */
export type FormField = { label?: string | null; placeholder?: string | null };
/** A field the CMS can make optional or hide (phone, service, budget, referral). */
export type OptionalFormField = FormField & { required?: boolean | null; hidden?: boolean | null };

export type ContactFormSection = {
  __component: "sections.contact-form";
  title?: string | null;
  description?: string | null;
  nameField?: FormField | null;
  emailField?: FormField | null;
  phoneField?: OptionalFormField | null;
  serviceField?: OptionalFormField | null;
  serviceOptions?: string | null;
  messageField?: FormField | null;
  budgetField?: OptionalFormField | null;
  budgetOptions?: string | null;
  referralField?: OptionalFormField | null;
  referralOptions?: string | null;
  consentText?: string | null;
  consentChecked?: boolean | null;
  submitLabel?: string | null;
  errorMessage?: string | null;
  successPath?: string | null;
  thankYouTitle?: string | null;
  thankYouText?: string | null;
};
/** Newsletter sign-up box (blog page; can be added to any page). */
export type SubscribeFormSection = {
  __component: "sections.subscribe-form";
  title?: string | null;
  description?: string | null;
  namePlaceholder?: string | null;
  emailPlaceholder?: string | null;
  requireFullName?: boolean | null;
  buttonLabel?: string | null;
  successTitle?: string | null;
  successText?: string | null;
  errorMessage?: string | null;
};
export type FaqSection = { __component: "sections.faq"; title?: string | null; items: { question: string; answer?: string | null }[] };
export type TestimonialSliderSection = {
  __component: "sections.testimonial-slider";
  items: { name: string; company?: string | null; role?: string | null; image?: Media | null; quote?: string | null }[];
};
export type CaseStudyCardsSection = {
  __component: "sections.case-study-cards";
  title?: string | null;
  cards: { title: string; tags?: string | null; description?: string | null; image?: Media | null; href?: string | null }[];
};
export type WorkGridSection = { __component: "sections.work-grid"; title?: string | null; showFilter?: boolean | null };
export type ProfileSection = {
  __component: "sections.profile";
  name: string;
  role?: string | null;
  lead?: string | null;
  image?: Media | null;
  imageCaption?: string | null;
  blocks: Bullet[];
  link?: LinkData | null;
};
export type PhotoStripSection = { __component: "sections.photo-strip"; images: Media[] };
export type QuoteSection = { __component: "sections.quote"; quote?: string | null; cite?: string | null; citeImage?: Media | null };
export type HeroSection = {
  __component: "sections.hero";
  label?: string | null;
  labelIcon?: Media | null;
  title: string;
  description?: string | null;
  primaryCta?: LinkData | null;
  secondaryCta?: LinkData | null;
  backgroundImage?: Media | null;
};
export type LogoStripSection = {
  __component: "sections.logo-strip";
  headingBefore?: string | null;
  headingHighlight?: string | null;
  headingAfter?: string | null;
  avatarImage?: Media | null;
  logos: Media[];
};
export type BadgeGridSection = { __component: "sections.badge-grid"; badges: Media[] };
export type ManifestoSection = {
  __component: "sections.manifesto";
  paragraphs: { textBefore?: string | null; inlineImage?: Media | null; textAfter?: string | null }[];
  cta?: LinkData | null;
};
export type ServiceDiagram = "none" | "ai-agents" | "ai-product" | "seo" | "web-application" | "mobile-app" | "web-design";
export type ServicesGridSection = {
  __component: "sections.services-grid";
  title?: string | null;
  description?: string | null;
  cards: { title: string; description?: string | null; href?: string | null; backgroundImage?: Media | null; diagram?: ServiceDiagram | null }[];
};
export type FeaturedWorkSection = {
  __component: "sections.featured-work";
  title?: string | null;
  description?: string | null;
  cards: { title: string; tags?: string | null; description?: string | null; image?: Media | null; video?: Media | null; href?: string | null; size?: "small" | "large" | null }[];
  cta?: LinkData | null;
};
export type ProcessStagesSection = {
  __component: "sections.process-stages";
  title?: string | null;
  stages: { title: string; shortTitle?: string | null; body?: string | null }[];
};
export type IndustriesSection = {
  __component: "sections.industries";
  title?: string | null;
  description?: string | null;
  items: { title: string; copy?: string | null; imageDesktop?: Media | null; imageMobile?: Media | null; color?: string | null }[];
};
export type BlogFeedSection = { __component: "sections.blog-feed"; title?: string | null; limit?: number | null; featuredOnly?: boolean | null };

/** A link's URL: its page's path when it links a page, else its href. */
export const linkHref = (link: LinkData | null | undefined) =>
  link && link.hidden !== true ? link.page?.path || link.href || null : null;

export type Section =
  | PageIntroSection
  | RichTextSection
  | ServiceOfferingsSection
  | ProcessStepsSection
  | BulletGridSection
  | BulletGroupsSection
  | AwardsListSection
  | TestimonialsSection
  | CalloutSection
  | AuthorCardSection
  | ContactFormSection
  | SubscribeFormSection
  | FaqSection
  | TestimonialSliderSection
  | WorkGridSection
  | CaseStudyCardsSection
  | ProfileSection
  | PhotoStripSection
  | QuoteSection
  | ({ __component: string } & Record<string, unknown>);

const isMedia = (value: Record<string, unknown>) => typeof value.url === "string" && ("mime" in value || "ext" in value || "hash" in value);

/** Raw Strapi section data → the shapes above (recursively). */
export function normalize(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(normalize);
  if (!value || typeof value !== "object") return value;
  const raw = value as Record<string, unknown>;
  if (isMedia(raw)) {
    const url = String(raw.url);
    return {
      url: url.startsWith("http") ? url : `${getStrapiApiUrl()}${url}`,
      alt: (raw.alternativeText as string) ?? "",
      width: (raw.width as number) ?? null,
      height: (raw.height as number) ?? null,
      mime: (raw.mime as string) ?? null,
    } satisfies Media;
  }
  const out: Record<string, unknown> = {};
  for (const [key, item] of Object.entries(raw)) {
    if (key === "id") continue;
    out[key] = normalize(item);
  }
  return out;
}

export const normalizeSections = (sections: unknown): Section[] =>
  Array.isArray(sections) ? (sections.map(normalize) as Section[]) : [];

export const refs = (items: Ref[] | null | undefined) => (items ?? []).map((item) => item.documentId).filter(Boolean);

