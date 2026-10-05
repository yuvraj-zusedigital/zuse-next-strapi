/**
 * Header & footer content from Strapi's "Header & Footer" single type
 * (api::global.global), edited in the Zuse CMS.
 *
 * Links point at a Page (preferred: follows the page when its path changes)
 * or at a typed URL. Every field falls back to the site's built-in defaults
 * below when Strapi is unreachable, the type isn't deployed yet, or the field
 * is left empty — so the header and footer are never blank.
 */

import { getStrapiApiUrl, strapiFetch } from "@/lib/strapi";

export type SiteLink = { label: string; href: string; newTab: boolean; variant?: "primary" | "secondary" };
export type MenuItem = SiteLink & { description: string; image: string | null };
export type LinkColumn = { title: string; links: SiteLink[] };
export type SocialLink = { name: string; href: string; icon: string };

export type SiteSettings = {
  logo: string | null;
  navLinks: SiteLink[];
  servicesLabel: string;
  /** Empty = no services menu. */
  serviceLinks: MenuItem[];
  /** null = hidden in the CMS. */
  headerCta: SiteLink | null;
  /** The "Have a project in mind?" band; false = hidden in the CMS. */
  showCallToAction: boolean;
  footerHeading: string;
  footerCta: SiteLink | null;
  showDescription: boolean;
  footerDescription: string;
  showOffice: boolean;
  officeTitle: string;
  officeAddress: string;
  footerColumns: LinkColumn[];
  socialLinks: SocialLink[];
  /** The line before the legal links; null = hidden in the CMS. */
  copyright: string | null;
  legalLinks: SiteLink[];
};

const link = (label: string, href: string): SiteLink => ({ label, href, newTab: false });

/** The site's original, hard-coded header and footer. */
export const DEFAULT_SITE_SETTINGS: SiteSettings = {
  logo: null,
  navLinks: [link("Work", "/work"), link("Blog", "/blog"), link("About us", "/about"), link("Testimonials", "/testimonials"), link("Awards", "/awards-recognition")],
  servicesLabel: "Services",
  serviceLinks: [
    { ...link("AI Agents & Automation", "/services/ai-agents-automation"), description: "Framework-agnostic agents that\nstreamline operations.", image: "/images/nav/ai-agent.webp" },
    { ...link("AI Product Development", "/services/ai-product-development"), description: "AI solutions that automate, optimise\nand scale.", image: "/images/nav/ai-product.webp" },
    { ...link("Web Application Development", "/services/web-application-development"), description: "Secure, scalable, high-performance\nweb apps.", image: "/images/nav/web-application.webp" },
    { ...link("Mobile App Development", "/services/mobile-app-development"), description: "Award-winning apps with stunning\nUI/UX.", image: "/images/nav/mobile-application.webp" },
    { ...link("Webdesign & Development", "/services/website-design"), description: "Connected AI systems for tools and\nworkflows.", image: "/images/nav/web-design.webp" },
    { ...link("SEO & GEO", "/services/seo-ai-search-optimisation"), description: "Award-winning apps with stunning\nUI/UX.", image: "/images/nav/seo.webp" },
  ],
  headerCta: link("Start a Project", "/contact"),
  showCallToAction: true,
  footerHeading: "Have a project in mind?\nLet's work *together*",
  footerCta: link("Book a Strategy Call", "/contact"),
  showDescription: true,
  footerDescription:
    "Zuse Digital is a human-centred technology company committed to delivering superior Website & Mobile Apps that empower people to achieve their goals.",
  showOffice: true,
  officeTitle: "Melbourne Office",
  officeAddress: "Level 3/489 Toorak Rd,\nToorak VIC 3142",
  footerColumns: [
    {
      title: "Company",
      links: [link("About", "/about"), link("Work", "/work"), link("Blog", "/blog"), link("Testimonials", "/testimonials"), link("Awards", "/awards-recognition"), link("Contact", "/contact")],
    },
    {
      title: "Services",
      links: [
        link("AI Agents & Automation", "/services/ai-agents-automation"),
        link("AI Product Development", "/services/ai-product-development"),
        link("Website Design", "/services/website-design"),
        link("Web App Development", "/services/web-application-development"),
        link("Mobile App Development", "/services/mobile-app-development"),
        link("SEO & GEO", "/services/seo-ai-search-optimisation"),
      ],
    },
    {
      title: "Projects",
      links: [
        link("Louis Vuitton", "/casestudies/web-apps/louis-vuitton-web-application"),
        link("Simon West", "/casestudies/e-commerce/simon-west-ecommerce-website"),
        link("RWW", "/casestudies/web-apps/rww-web-application"),
        link("View All", "/work"),
      ],
    },
  ],
  socialLinks: [
    { name: "Instagram", href: "https://www.instagram.com/zusedigital/", icon: "/images/icons/instagram.svg" },
    { name: "Twitter", href: "https://twitter.com/zusedigital", icon: "/images/icons/twitter.svg" },
    { name: "LinkedIn", href: "https://www.linkedin.com/company/zuse-digital/", icon: "/images/icons/linkedin.svg" },
    { name: "Facebook", href: "https://www.facebook.com/zusedigital", icon: "/images/icons/facebook.svg" },
    { name: "Clutch", href: "https://clutch.co/profile/zuse-digital", icon: "/images/icons/clutch.svg" },
  ],
  copyright: `© Zuse Digital ${new Date().getFullYear()}, All rights reserved.`,
  legalLinks: [link("Terms of Use", "/terms-of-use"), link("Privacy Policy", "/privacy-policy")],
};

// ── Strapi → site shapes ──

type RawMedia = { url?: string | null } | null | undefined;
type RawLink = {
  hidden?: boolean | null;
  label?: string | null;
  href?: string | null;
  page?: { path?: string | null } | null;
  openInNewTab?: boolean | null;
  variant?: "primary" | "secondary" | null;
  description?: string | null;
  image?: RawMedia;
};
type RawGlobal = {
  logo?: RawMedia;
  navLinks?: RawLink[] | null;
  servicesLabel?: string | null;
  hideServicesMenu?: boolean | null;
  serviceLinks?: RawLink[] | null;
  headerCta?: RawLink | null;
  footerHeading?: string | null;
  footerCta?: RawLink | null;
  hideFooterCallToAction?: boolean | null;
  footerDescription?: string | null;
  hideFooterDescription?: boolean | null;
  officeTitle?: string | null;
  officeAddress?: string | null;
  hideOffice?: boolean | null;
  footerColumns?: { hidden?: boolean | null; title?: string | null; links?: RawLink[] | null }[] | null;
  socialLinks?: { hidden?: boolean | null; name?: string | null; href?: string | null; icon?: RawMedia }[] | null;
  hideSocialLinks?: boolean | null;
  /** {year} and other snippets are already filled in by strapiFetch. */
  copyrightText?: string | null;
  hideCopyright?: boolean | null;
  legalLinks?: RawLink[] | null;
};

const mediaUrl = (media: RawMedia) => {
  const url = media?.url;
  if (!url) return null;
  return url.startsWith("http") ? url : `${getStrapiApiUrl()}${url}`;
};

/**
 * A link's URL: the linked page's path (a published page only — Strapi
 * returns no page for drafts or deleted pages), otherwise the typed URL.
 * Links with neither are dropped.
 */
export function resolveLink(raw: RawLink | null | undefined): SiteLink | null {
  if (raw?.hidden === true) return null; // switched off in the CMS
  const label = raw?.label?.trim();
  const href = raw?.page?.path?.trim() || raw?.href?.trim();
  if (!label || !href) return null;
  return { label, href, newTab: Boolean(raw?.openInNewTab), ...(raw?.variant ? { variant: raw.variant } : {}) };
}

const links = (list: RawLink[] | null | undefined) => (list ?? []).map(resolveLink).filter((item): item is SiteLink => item !== null);
const text = (value: string | null | undefined, fallback: string) => value?.trim() || fallback;
const shown = <T extends { hidden?: boolean | null }>(items: T[] | null | undefined) => (items ?? []).filter((item) => item.hidden !== true);
/**
 * A list from Strapi, else the built-in one. Items hidden in the CMS are left
 * out; a list whose items are all hidden stays empty (it doesn't fall back).
 */
const list = <T,>(value: T[], fallback: T[], raw?: { hidden?: boolean | null }[] | null) => {
  if (raw?.length && !shown(raw).length) return [];
  return value.length ? value : fallback;
};

export function toSiteSettings(raw: RawGlobal | null): SiteSettings {
  const d = DEFAULT_SITE_SETTINGS;
  if (!raw) return d;

  const serviceLinks = shown(raw.serviceLinks)
    .map((item) => {
      const resolved = resolveLink(item);
      return resolved ? { ...resolved, description: item.description?.trim() ?? "", image: mediaUrl(item.image) } : null;
    })
    .filter((item): item is MenuItem => item !== null);

  const footerColumns = shown(raw.footerColumns)
    .map((column) => ({ title: column.title?.trim() ?? "", links: links(column.links) }))
    .filter((column) => column.title && column.links.length);

  const socialLinks = shown(raw.socialLinks)
    .map((item) => ({ name: item.name?.trim() ?? "", href: item.href?.trim() ?? "", icon: mediaUrl(item.icon) ?? "" }))
    .filter((item) => item.name && item.href && item.icon);

  // A single link hidden in the CMS is null; one left empty uses the built-in link.
  const single = (value: RawLink | null | undefined, fallback: SiteLink) => (value?.hidden === true ? null : (resolveLink(value) ?? fallback));

  return {
    logo: mediaUrl(raw.logo),
    navLinks: list(links(raw.navLinks), d.navLinks, raw.navLinks),
    servicesLabel: text(raw.servicesLabel, d.servicesLabel),
    serviceLinks: raw.hideServicesMenu === true ? [] : list(serviceLinks, d.serviceLinks, raw.serviceLinks),
    headerCta: single(raw.headerCta, d.headerCta!),
    showCallToAction: raw.hideFooterCallToAction !== true,
    footerHeading: text(raw.footerHeading, d.footerHeading),
    footerCta: single(raw.footerCta, d.footerCta!),
    showDescription: raw.hideFooterDescription !== true,
    footerDescription: text(raw.footerDescription, d.footerDescription),
    showOffice: raw.hideOffice !== true,
    officeTitle: text(raw.officeTitle, d.officeTitle),
    officeAddress: text(raw.officeAddress, d.officeAddress),
    footerColumns: list(footerColumns, d.footerColumns, raw.footerColumns),
    socialLinks: raw.hideSocialLinks === true ? [] : list(socialLinks, d.socialLinks, raw.socialLinks),
    copyright: raw.hideCopyright === true ? null : text(raw.copyrightText, d.copyright!),
    legalLinks: list(links(raw.legalLinks), d.legalLinks, raw.legalLinks),
  };
}

/** Only what the header/footer use: the linked page's path, not the whole page. */
const LINK_POPULATE = { populate: { page: { fields: ["path"] } } };
const POPULATE = {
  logo: true,
  navLinks: LINK_POPULATE,
  serviceLinks: { populate: { page: { fields: ["path"] }, image: true } },
  headerCta: LINK_POPULATE,
  footerCta: LINK_POPULATE,
  footerColumns: { populate: { links: LINK_POPULATE } },
  socialLinks: { populate: { icon: true } },
  legalLinks: LINK_POPULATE,
};

/** Nested object → Strapi's bracketed query string (populate[navLinks][populate][page][fields][0]=path). */
function toQuery(value: unknown, prefix: string, out: string[] = []) {
  if (Array.isArray(value)) value.forEach((item, index) => toQuery(item, `${prefix}[${index}]`, out));
  else if (value && typeof value === "object") for (const [key, item] of Object.entries(value)) toQuery(item, `${prefix}[${key}]`, out);
  else out.push(`${encodeURI(prefix)}=${encodeURIComponent(String(value))}`);
  return out;
}

export async function getSiteSettings(): Promise<SiteSettings> {
  try {
    const json = (await strapiFetch(`/api/global?${toQuery(POPULATE, "populate").join("&")}`)) as { data?: RawGlobal } | null;
    return toSiteSettings(json?.data ?? null);
  } catch (error) {
    console.error("[site-settings] falling back to defaults:", error);
    return DEFAULT_SITE_SETTINGS;
  }
}
