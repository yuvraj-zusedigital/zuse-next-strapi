/** Shapes returned by the Strapi CMS API (src/api/cms in the repo root). */

export type Attribute = {
  type: string;
  required?: boolean;
  [key: string]: unknown;
};

export type ContentTypeSchema = {
  slug: string;
  uid: string;
  kind: "collectionType" | "singleType";
  /** Sidebar group: "settings" for single types and setting lists (Text snippets). */
  group?: "content" | "settings";
  displayName: string;
  description: string;
  draftAndPublish: boolean;
  mainField: string | null;
  attributes: Record<string, Attribute>;
};

export type ComponentSchema = {
  uid: string;
  category: string;
  displayName: string;
  icon: string | null;
  attributes: Record<string, Attribute>;
};

export type CmsSchema = {
  contentTypes: ContentTypeSchema[];
  components: ComponentSchema[];
};

export type EntryStatus = "draft" | "published" | "modified";

export type EntrySummary = {
  documentId: string;
  title: string | null;
  updatedAt: string;
  status: EntryStatus;
  /** Extra list columns asked for with `columns` (lib/list-columns.ts). */
  columns?: Record<string, string | null>;
};

export type MediaFile = {
  id: number;
  name: string;
  alternativeText: string;
  caption: string;
  url: string;
  previewUrl: string;
  mime: string;
  ext: string;
  size: number; // KB
  width: number | null;
  height: number | null;
  createdAt: string;
  updatedAt: string;
  /** Only on single-file responses: how many entries use it. */
  usedBy?: number;
};

export type MediaKind = "image" | "video" | "audio" | "document";

export type MediaListResponse = {
  data: MediaFile[];
  meta: { pagination: { page: number; pageSize: number; total: number; pageCount: number } };
};

export type Entry =Record<string, unknown> & { documentId: string; updatedAt: string };

export type EntryResponse = { data: Entry | null; meta: { status: EntryStatus } };

export type ListResponse = {
  data: EntrySummary[];
  meta: { pagination: { page: number; pageSize: number; total: number; pageCount: number } };
};

export type ActivityAction =
  | "create"
  | "update"
  | "publish"
  | "unpublish"
  | "discard"
  | "delete"
  | "upload"
  | "media-update"
  | "media-delete"
  | "user-create"
  | "user-update";

/** One line of the audit log (src/api/cms/services/activity.js). */
export type Activity = {
  action: ActivityAction;
  targetType: string;
  targetId: string | null;
  title: string | null;
  userEmail: string | null;
  count: number;
  at: string;
};

export type ActivityPage = {
  data: Activity[];
  meta: { pagination: { page: number; pageSize: number; total: number; pageCount: number }; people?: string[] };
};

/** The signed-in user (GET /api/cms/me). */
export type CmsUser = {
  id: number;
  username: string;
  email: string;
  role: { name: string; type: string };
  /** IANA time zone for the clock; null = the device's. */
  timezone: string | null;
  /** CMS colour theme (lib/accents.ts); null = default. */
  accent: string | null;
};

/** A CMS account on the Users page. */
export type CmsAccount = {
  id: number;
  username: string;
  email: string;
  blocked: boolean;
  role: { type: string; name: string } | null;
  createdAt: string;
};

/** Header & footer shown around page previews (GET /api/cms/site-chrome). */
export type ChromeLink = { label: string; href: string; variant: string | null };
export type ChromeMedia = { url: string; alternativeText: string; mime: string | null };
export type SiteChrome = {
  logo: ChromeMedia | null;
  navLinks: ChromeLink[];
  servicesLabel: string | null;
  hasServices: boolean;
  headerCta: ChromeLink | null;
  footerHeading: string | null;
  footerCta: ChromeLink | null;
  footerDescription: string | null;
  officeTitle: string | null;
  officeAddress: string | null;
  footerColumns: { title: string; links: ChromeLink[] }[];
  socialLinks: { name: string; href: string; icon: ChromeMedia | null }[];
  legalLinks: ChromeLink[];
  /** The footer's copyright line ({year} filled in by the preview); null = hidden. */
  copyright?: string | null;
  /** Text snippets (Site settings → Text snippet), { name: value }. */
  snippets?: Record<string, string>;
};

/** Leads (Admins only): see src/api/cms/services/leads.js. */
export type LeadKind = "submissions" | "subscribers" | "tracking";

/** One page the visitor viewed, as the website records it (localStorage "trackingData"). */
export type JourneyStep = {
  pageName?: string;
  page?: string;
  timestamp?: string;
  totalTimeSpendInSec?: number | string;
};

export type LeadSummary = {
  id: number;
  createdAt: string;
  name: string | null;
  email: string | null;
  pages: number;
  seconds: number;
  formName?: string | null;
  phone?: string | null;
  budget?: string | null;
  location?: string | null;
  hearAboutUs?: string | null;
  submission?: { id: number; name: string | null } | null;
};

export type LeadDetail = LeadSummary & {
  fields: Record<string, unknown>;
  raw: Record<string, unknown> | null;
  journey: JourneyStep[];
  trackingIds: number[];
};

export type LeadListResponse = {
  data: LeadSummary[];
  meta: { pagination: { page: number; pageSize: number; total: number; pageCount: number } };
};

/** Real-visitor speed (src/api/cms/services/vitals.js): 75th percentile per metric. */
export type VitalName = "LCP" | "INP" | "CLS" | "FCP" | "TTFB";
export type VitalRating = "good" | "needs-improvement" | "poor";
export type VitalStat = { p75: number | null; rating: VitalRating | null; count: number };
export type VitalSummary = Record<VitalName, VitalStat>;
export type PageVitals = { path: string; days: number; all: VitalSummary; mobile: VitalSummary; desktop: VitalSummary };
export type VitalsOverview = {
  days: number;
  site: VitalSummary;
  pages: { path: string; views: number; worst: VitalRating | null; LCP: VitalStat; INP: VitalStat; CLS: VitalStat }[];
};

/** Dashboard figures (src/api/cms/services/dashboard.js). */
export type DashboardData = {
  timeZone: string;
  content: { slug: string; label: string; published: number; modified: number; draft: number }[];
  activity: { days: { day: string; count: number }[]; previous: { day: string; count: number }[] };
  leads: {
    weeks: { start: string; end: string; count: number }[];
    enquiries7: number;
    enquiriesPrev7: number;
    subscribers7: number;
    subscribersPrev7: number;
  } | null;
};
