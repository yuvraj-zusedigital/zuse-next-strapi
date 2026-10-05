import { z } from "zod";
import { toMediaFile } from "@/lib/media";
import type { Attribute, ComponentSchema, ContentTypeSchema, MediaFile } from "@/lib/types";

/**
 * Schema-driven forms: turns Strapi attributes (from /api/cms/schema) into
 * form fields, converts values between Strapi and the form, and builds the
 * validation schema. Components and dynamic zones recurse through the same
 * functions, so every nesting level behaves the same.
 */

export type FieldKind =
  | "string"
  | "text"
  | "email"
  | "uid"
  | "integer"
  | "decimal"
  | "boolean"
  | "enumeration"
  | "choice"
  | "date"
  | "datetime"
  | "json"
  | "color"
  | "blocks"
  | "html"
  | "relation"
  | "media"
  | "component"
  | "dynamiczone"
  | "readonly";

export type RelationOption = { documentId: string; label: string };
export type Choice = { value: string; label: string };

/** Text fields edited as a short list of named options; the stored values stay the same. */
const CHOICES: Record<string, Choice[]> = {
  "shared.seo.metaRobots": [
    { value: "", label: "Show in search results (default)" },
    { value: "noindex, follow", label: "Hide from search results" },
    { value: "noindex, nofollow", label: "Hide from search results and don't follow its links" },
  ],
};

export type Field = {
  name: string;
  label: string;
  kind: FieldKind;
  attribute: Attribute;
  required: boolean;
  hint?: string;
  /** relation (…ToMany) or media with multiple files. */
  multiple?: boolean;
  /** relation: CMS slug of the target type. */
  targetType?: string;
  /** component: uid of the component. */
  component?: string;
  /** component: a list of items rather than one. */
  repeatable?: boolean;
  /** dynamiczone: allowed component uids. */
  components?: string[];
  /** readonly: why it isn't editable here. */
  readonlyReason?: string;
  /** choice: the allowed values with friendly labels ("" = the default). */
  choices?: Choice[];
  /** Legacy/unused field: kept and saved with the entry, but not shown in the form. */
  hiddenInForm?: boolean;
};

/** Client-only key that keeps list items stable across reorders; never sent to Strapi. */
export const KEY = "__key";
export const newKey = () => Math.random().toString(36).slice(2, 10);

/**
 * Help text. Keys: `<type slug or component uid>.<field>`; `*` matches any
 * owner, `sections.*` any section. Conventions from docs/page-builder.md.
 */
const HINTS: Record<string, string> = {
  "*.rank": "Lower numbers show first.",
  "award.reasons": "One reason per line.",
  "testimonial.content": "Separate paragraphs with a blank line.",
  "testimonial.excerpt": "Short version for testimonial cards (home, awards, work). Leave empty to use the first paragraph.",
  "testimonial.logoWidth": "Logo width on the testimonials page, in pixels (default 150).",
  "testimonial.logoWidthMobile": "Logo width on phones, in pixels (default 100).",
  "award.slug": "Used as the award's anchor on the page.",
  "author.sameAs": "One profile URL per line.",
  "sections.*.title": "Wrap words in *asterisks* for gradient text. Line breaks are kept.",
  "sections.page-intro.body": "Tip: an inline image inside a sentence is written ![alt text](image URL).",
  "sections.author-card.author": "Leave empty to show Zanyar Outhman.",
  "sections.contact-form.serviceOptions": "One option per line.",
  "sections.contact-form.budgetOptions": "One option per line.",
  "sections.contact-form.referralOptions": "One option per line.",
  "sections.testimonials.testimonials": "Leave empty to show every published testimonial, ordered by rank.",
  "sections.awards-list.awards": "Leave empty to show every published award, ordered by rank.",
  "sections.awards-list.detailed": "Full “About the award” and “Why we won” text (the Awards page). Off: compact list with a heading (e.g. About).",
  "sections.awards-list.title": "Heading of the compact list (not shown with full details). *Asterisks* = gradient.",
  "sections.blog-feed.limit": "How many posts to show.",
  "sections.blog-feed.featuredOnly": "Only posts marked as featured.",
  "sections.page-intro.label": "Small caption above the title (e.g. “Our Work”).",
  "sections.page-intro.title": "Wrap words in *asterisks* for gradient text (without asterisks the whole title is gradient). Line breaks are kept.",
  "sections.contact-form.description": "Line breaks are kept; **double asterisks** make text bold.",
  "sections.contact-form.successPath": "Page shown after sending (the Thank-you page uses this section's thank-you text).",
  "sections.contact-form.consentText": "Line breaks are kept; **bold** and [link text](/privacy-policy) work.",
  "sections.contact-form.consentChecked": "On: the “stay updated” box starts ticked.",
  "sections.contact-form.errorMessage": "Shown if the form can't be sent.",
  "sections.contact-form.submitLabel": "Leave empty for “Submit”.",
  "elements.optional-form-field.required": "Off: visitors can leave this field empty.",
  "*.placeholder": "Grey hint text shown inside the empty field.",
  "sections.subscribe-form.requireFullName": "On: visitors must enter a first and last name.",
  "sections.subscribe-form.successTitle": "Replaces the form once someone has subscribed.",
  "sections.subscribe-form.errorMessage": "Shown if signing up fails.",
  "shared.seo.metaRobots": "Hidden pages stay on the site but aren't shown in Google and are left out of the sitemap.",
  "global.copyrightText": "Bottom of the footer, before Terms and Privacy. {year} shows the current year; other text snippets work too. Leave empty for “© Zuse Digital {year}, All rights reserved.”",
  "text-snippet.name": "Letters and numbers, starting with a letter (e.g. phone, yearsInBusiness). Write it in content as {phone}.",
  "text-snippet.label": "A friendly name for this list, e.g. “Main phone number”.",
  "text-snippet.value": "What {name} becomes on the site. Changes show on the live site straight away; after adding {name} to a page, publish that page.",
  "text-snippet.note": "Optional: where it's used or anything other editors should know.",
  "sections.contact-form.thankYouTitle": "Write {name} where the visitor's first name goes, e.g. “Thank you{name}. We’ll be in touch.”",
  "sections.hero.label": "A line break here only applies on phones.",
  "sections.hero.title": "Wrap words in *asterisks* for gradient text. Line breaks are kept.",
  "sections.services-grid.cards": "Cards 1–2 form the top row, card 3 the full-width row, the rest the bottom row.",
  "sections.featured-work.cards": "Shown two per row.",
  "sections.manifesto.paragraphs": "Each paragraph: text, an optional small inline image, more text. A wide image shows as a logo group, a square one as a round portrait.",
  "sections.process-stages.title": "Plain words, then the *gradient words* in asterisks.",
  "sections.profile.imageCaption": "Read by screen readers only.",
  "sections.photo-strip.images": "Scrolls continuously; best in portrait format (about 480 × 560).",
  "sections.quote.citeImage": "Small round photo before the name.",
  "elements.service-card.diagram": "Animated illustration and card layout; also sets how line breaks in the description show.",
  "elements.industry.color": "Card colour; its gradient is derived from it.",
  "elements.work-card.tags": "Comma separated, e.g. Web App, UI UX Design.",
  "project.Title": "Short name on the Work grid, e.g. “Komodo”.",
  "project.sub_title": "Label under the name on the Work grid, e.g. “Website, UI UX Design”. Leave empty to show the project's categories.",
  "project-category.rank": "Position in the Work filter and in the “other categories” lists (lower shows first).",
  "project.project_details_path": "Case study page, e.g. /casestudies/web-apps/my-project/ (category, then slug). Leave empty for no page.",
  "project.CaseStudyTitle": "Heading on the case study page. Leave empty to use the name.",
  "project.CaseStudyMeta": "The details beside the intro (client, services…). A value with several lines shows as a list.",
  "project.CaseStudyBlocks": "The case study's story: text (with optional bullet points), full-width images and image pairs.",
  "project.testimonial": "Client quote at the end of the case study. Leave empty to keep the built-in one.",
  "project.Slider": "Work grid tile: the first item's image (and optional video, played on hover).",
  "elements.link.page": "Pick a page: the link follows it if the page's path changes. Leave empty to use the URL below.",
  "elements.process-step.iconSize": "Icon size in pixels (default 100).",
  "elements.process-step.titleImage": "Optional small image shown before the step title (e.g. an emoji).",
  "elements.process-step.iconOverlay": "Optional image layered on top of the icon.",
  "elements.link.href": "For other links: a full URL (https://…), an anchor (#contact) or a path. Ignored when a page is picked.",
  "elements.menu-item.page": "Pick a page: the link follows it if the page's path changes. Leave empty to use the URL below.",
  "elements.menu-item.href": "For other links: a full URL (https://…) or a path. Ignored when a page is picked.",
  "elements.menu-item.description": "One or two short lines under the title. Line breaks are kept.",
  "elements.menu-item.image": "Shown beside the dropdown while this item is hovered.",
  "global.servicesLabel": "The dropdown's button text in the header.",
  "global.footerHeading": "Wrap words in *asterisks* for gradient text. Line breaks are kept.",
  "global.navLinks": "Top-level header links, shown after the services dropdown.",
  "global.footerColumns": "Link columns in the footer (e.g. Company, Services, Projects).",
  "shared.seo.metaTitle": "Shown as the headline in Google (about 30–60 characters). Leave empty to use the page name.",
  "shared.seo.metaDescription": "The text under the headline in Google (about 120–160 characters).",
  "shared.seo.focusKeyword": "The main phrase people search for to find this page, e.g. “mobile app development”. Only used for the checks above.",
  "shared.seo.metaImage": "Shown when the page is shared on social media or in chat apps (1200 × 630 works best).",
  "shared.seo.structuredDataText": "Machine-readable page info for search engines (JSON-LD). Leave empty to use the site's built-in data.",
  "project.GirdStyle": "Full width or half width on the Work grid.",
  "project.select_type": "Whether the tile shows an image or plays the video on hover.",
  "global.hideServicesMenu": "Hides the Services dropdown in the header (desktop and mobile).",
  "global.hideFooterCallToAction": "Hides the “Have a project in mind?” band (heading and button) at the top of the footer.",
  "global.hideFooterDescription": "Hides the short company description under the footer logo.",
  "global.hideOffice": "Hides the office title and address in the footer.",
  "global.hideSocialLinks": "Hides the social icons (footer and mobile menu).",
};

function hintFor(owner: string, name: string) {
  const category = owner.split(".")[0];
  return HINTS[`${owner}.${name}`] ?? HINTS[`${category}.*.${name}`] ?? HINTS[`*.${name}`];
}

const WIDE_KINDS: FieldKind[] = ["text", "json", "blocks", "html", "relation", "media", "component", "dynamiczone", "readonly"];
export const isWide = (field: Field) => WIDE_KINDS.includes(field.kind);

export function humanize(name: string) {
  if (/^href$/i.test(name)) return "URL";
  const words = name
    .replace(/[_-]+/g, " ")
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replace(/\bcta\b/gi, "CTA")
    .replace(/\burl\b/gi, "URL")
    .replace(/\bseo\b/gi, "SEO")
    .trim();
  const lower = words.replace(/\b(?!CTA|URL|SEO)\w+/g, (word) => word.toLowerCase());
  return lower.charAt(0).toUpperCase() + lower.slice(1);
}

/** A component's name for display: humanizes camelCase names ("metaSocial" → "Meta social"), falls back to its uid. */
export function componentLabel(displayName: string | undefined, uid: string) {
  const name = displayName?.trim() || uid.split(".").pop() || uid;
  return /[a-z][A-Z]|[_-]/.test(name) || name === name.toLowerCase() ? humanize(name) : name;
}

/** A label for use mid-sentence ("Add secondary CTA"): lowercase, but acronyms stay. */
export function inSentence(label: string) {
  return label.replace(/\S+/g, (word) => (/^[A-Z0-9]{2,}$/.test(word) ? word : word.toLowerCase())).replace(/\bseo\b/g, "SEO").replace(/\bcta\b/g, "CTA");
}

export function slugify(value: string) {
  return value
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function kindOf(attribute: Attribute): { kind: FieldKind; readonlyReason?: string } {
  if (attribute.customField === "plugin::color-picker.color") return { kind: "color" };
  if (attribute.customField === "plugin::tinymce.tinymce") return { kind: "html" };
  switch (attribute.type) {
    case "string":
    case "password":
      return { kind: "string" };
    case "text":
    case "richtext":
      return { kind: "text" };
    case "email":
      return { kind: "email" };
    case "uid":
      return { kind: "uid" };
    case "integer":
    case "biginteger":
      return { kind: "integer" };
    case "decimal":
    case "float":
      return { kind: "decimal" };
    case "boolean":
      return { kind: "boolean" };
    case "enumeration":
      return { kind: "enumeration" };
    case "date":
      return { kind: "date" };
    case "datetime":
      return { kind: "datetime" };
    case "json":
      return { kind: "json" };
    case "blocks":
      return { kind: "blocks" };
    case "relation":
      return attribute.targetType
        ? { kind: "relation" }
        : { kind: "readonly", readonlyReason: "Links to a type the CMS doesn't manage." };
    case "media":
      return { kind: "media" };
    case "component":
      return { kind: "component" };
    case "dynamiczone":
      return { kind: "dynamiczone" };
    default:
      return { kind: "readonly", readonlyReason: `“${attribute.type}” fields aren't supported yet.` };
  }
}

/** Clearer names than the field's API name (owner.field). */
const LABELS: Record<string, string> = {
  "project.GirdStyle": "Tile width",
  "project.select_type": "Tile media type",
  "project.Slider": "Work tile media",
  "project.sub_title": "Tile label",
  "shared.seo.structuredDataText": "Structured data (JSON-LD)",
  "shared.seo.metaRobots": "Search engines",
  "global.copyrightText": "Copyright line",
  "global.hideCopyright": "Hide copyright line",
  "sections.contact-form.nameField": "Name field",
  "sections.contact-form.emailField": "Email field",
  "sections.contact-form.phoneField": "Phone field",
  "sections.contact-form.serviceField": "Service field",
  "sections.contact-form.messageField": "Message field",
  "sections.contact-form.budgetField": "Budget field",
  "sections.contact-form.referralField": "“How did you hear about us?” field",
  "sections.contact-form.consentText": "“Stay updated” text",
  "sections.contact-form.consentChecked": "“Stay updated” ticked by default",
  "sections.contact-form.submitLabel": "Button text",
  "sections.contact-form.errorMessage": "Error message",
  "elements.optional-form-field.required": "Required",
  "sections.subscribe-form.requireFullName": "Require first and last name",
  "sections.subscribe-form.buttonLabel": "Button text",
  "sections.subscribe-form.successTitle": "Thank-you title",
  "sections.subscribe-form.successText": "Thank-you text",
};

/**
 * Legacy or unused fields (from the old Gatsby site or Strapi's SEO plugin).
 * They stay in Strapi with their data, and are carried through saves
 * unchanged, but editors don't see them.
 */
const HIDDEN_IN_FORM = new Set([
  "project.ProjectContent", // old Gatsby banner block; the site doesn't read it
  "project.FeatureProject", // featured work is now chosen in the home page's section
  "project.FeaturedRank",
  "shared.seo.structuredData", // superseded by "Structured data (JSON-LD)"; values were copied over
  "shared.seo.metaViewport", // the site sets its own viewport
]);

function buildFields(owner: string, attributes: Record<string, Attribute>): Field[] {
  return Object.entries(attributes)
    .filter(([, attribute]) => !attribute.private)
    .map(([name, attribute]) => {
      const choices = CHOICES[`${owner}.${name}`];
      const { kind, readonlyReason } = choices ? { kind: "choice" as const, readonlyReason: undefined } : kindOf(attribute);
      return {
        choices,
        name,
        label: LABELS[`${owner}.${name}`] ?? humanize(name),
        hiddenInForm: HIDDEN_IN_FORM.has(`${owner}.${name}`) || undefined,
        kind,
        attribute,
        required: Boolean(attribute.required),
        hint: hintFor(owner, name),
        multiple:
          kind === "relation" ? /Many$/.test(String(attribute.relation)) : kind === "media" ? Boolean(attribute.multiple) : undefined,
        targetType: kind === "relation" ? (attribute.targetType as string) : undefined,
        component: kind === "component" ? (attribute.component as string) : undefined,
        repeatable: kind === "component" ? Boolean(attribute.repeatable) : undefined,
        components: kind === "dynamiczone" ? (attribute.components as string[]) : undefined,
        readonlyReason,
      };
    });
}

// ── Resolver ──────────────────────────────────────────────────────────────

export type Resolver = {
  fieldsForType: (type: ContentTypeSchema) => Field[];
  fieldsForComponent: (uid: string) => Field[];
  component: (uid: string) => ComponentSchema | undefined;
  /** Title of a related entry, using its type's main field. */
  labelFor: (targetType: string, item: Record<string, unknown>) => string;
};

export function createResolver(components: ComponentSchema[], mainFields: Record<string, string | null>): Resolver {
  const byUid = new Map(components.map((component) => [component.uid, component]));
  const cache = new Map<string, Field[]>();

  return {
    fieldsForType: (type) => buildFields(type.slug, type.attributes),
    fieldsForComponent(uid) {
      if (!cache.has(uid)) cache.set(uid, buildFields(uid, byUid.get(uid)?.attributes ?? {}));
      return cache.get(uid)!;
    },
    component: (uid) => byUid.get(uid),
    labelFor(targetType, item) {
      const field = mainFields[targetType];
      return String((field && item[field]) || "Untitled");
    },
  };
}

// ── Values ────────────────────────────────────────────────────────────────

export type FormValues = Record<string, unknown>;
type Entry = Record<string, unknown> | null;

const pad = (n: number) => String(n).padStart(2, "0");

/** ISO string → value for <input type="datetime-local"> in the editor's timezone. */
function toLocalDateTime(value: string) {
  const d = new Date(value);
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

const asList = (value: unknown) => (Array.isArray(value) ? value : value ? [value] : []) as Record<string, unknown>[];

/**
 * Strapi data → form values. `entry` null means a new entry (defaults apply).
 *
 * `path` makes list-item keys deterministic (from their position), so the
 * server and browser render the same keys when a page loads. Items created in
 * the browser (no path) get random keys.
 */
export function toFormValues(fields: Field[], entry: Entry, resolver: Resolver, path: string | null = ""): FormValues {
  const values: FormValues = {};
  const keyFor = (suffix: string) => (path === null ? newKey() : `@${path}${suffix}`);
  for (const field of fields) {
    const value = entry?.[field.name];
    const at = path === null ? null : path ? `${path}.${field.name}` : field.name;
    const child = (suffix: string) => (at === null ? null : `${at}${suffix}`);
    switch (field.kind) {
      case "boolean":
        values[field.name] = Boolean(value ?? field.attribute.default ?? false);
        break;
      case "integer":
      case "decimal":
        values[field.name] = value == null ? (entry ? "" : String(field.attribute.default ?? "")) : String(value);
        break;
      case "datetime":
        values[field.name] = value ? toLocalDateTime(String(value)) : "";
        break;
      case "json":
        values[field.name] = value == null ? "" : JSON.stringify(value, null, 2);
        break;
      case "blocks":
        values[field.name] = Array.isArray(value) ? value : null;
        break;
      case "relation":
        values[field.name] = asList(value).map((item) => ({
          documentId: String(item.documentId),
          label: resolver.labelFor(field.targetType!, item),
        }));
        break;
      case "enumeration":
        values[field.name] = value ?? (entry ? "" : field.attribute.default ?? "");
        break;
      case "media":
        values[field.name] = asList(value).map(toMediaFile);
        break;
      case "component": {
        const sub = resolver.fieldsForComponent(field.component!);
        values[field.name] = field.repeatable
          ? asList(value).map((item, index) => ({ [KEY]: keyFor(`.${field.name}.${index}`), ...toFormValues(sub, item, resolver, child(`.${index}`)) }))
          : value
            ? { [KEY]: keyFor(`.${field.name}`), ...toFormValues(sub, value as Record<string, unknown>, resolver, child("")) }
            : null;
        break;
      }
      case "dynamiczone":
        values[field.name] = asList(value)
          .filter((item) => field.components!.includes(String(item.__component)))
          .map((item, index) => ({
            [KEY]: keyFor(`.${field.name}.${index}`),
            ...toFormValues(resolver.fieldsForComponent(String(item.__component)), item, resolver, child(`.${index}`)),
            __component: String(item.__component),
          }));
        break;
      case "readonly":
        break;
      default:
        values[field.name] = value ?? "";
    }
  }
  return values;
}

/** Form values for an item added in the editor (random keys). */
export function newComponentValue(uid: string, resolver: Resolver): FormValues {
  return { [KEY]: newKey(), ...toFormValues(resolver.fieldsForComponent(uid), null, resolver, null) };
}

/** Form values for a section added in the editor. */
export function newSection(uid: string, resolver: Resolver): FormValues {
  return { ...newComponentValue(uid, resolver), __component: uid };
}

/** One-line preview of an item for collapsed cards: its first filled text field. */
export function summarize(fields: Field[], values: FormValues | undefined): string {
  for (const field of fields) {
    const value = values?.[field.name];
    if (["string", "text", "email", "uid"].includes(field.kind) && typeof value === "string" && value.trim()) {
      const text = value.replace(/\*/g, "").replace(/\s+/g, " ").trim();
      return text.length > 80 ? `${text.slice(0, 80)}…` : text;
    }
  }
  return "";
}

/** Deep copy of an item with fresh keys, for "Duplicate". */
export function cloneValue<T>(value: T): T {
  if (Array.isArray(value)) return value.map(cloneValue) as T;
  if (value && typeof value === "object") {
    const copy = Object.fromEntries(Object.entries(value).map(([k, v]) => [k, cloneValue(v)]));
    if (KEY in copy) copy[KEY] = newKey();
    return copy as T;
  }
  return value;
}

/** Form values → the `data` body for /api/cms. Read-only fields are never sent; media is sent as file ids. */
export function toPayload(fields: Field[], values: FormValues, resolver: Resolver) {
  const data: Record<string, unknown> = {};
  for (const field of fields) {
    const value = values[field.name];
    switch (field.kind) {
      case "readonly":
        break;
      case "media": {
        const ids = ((value as MediaFile[]) ?? []).map((file) => file.id);
        data[field.name] = field.multiple ? ids : (ids[0] ?? null);
        break;
      }
      case "integer":
        data[field.name] = value === "" || value == null ? null : parseInt(String(value), 10);
        break;
      case "decimal":
        data[field.name] = value === "" || value == null ? null : Number(value);
        break;
      case "datetime":
        data[field.name] = value ? new Date(String(value)).toISOString() : null;
        break;
      case "date":
      case "enumeration":
      case "email":
      case "uid":
      case "color":
        data[field.name] = value === "" ? null : value;
        break;
      case "json":
        data[field.name] = value === "" ? null : JSON.parse(String(value));
        break;
      case "relation":
        data[field.name] = ((value as RelationOption[]) ?? []).map((item) => item.documentId);
        break;
      case "component": {
        const sub = resolver.fieldsForComponent(field.component!);
        data[field.name] = field.repeatable
          ? ((value as FormValues[]) ?? []).map((item) => toPayload(sub, item, resolver))
          : value
            ? toPayload(sub, value as FormValues, resolver)
            : null;
        break;
      }
      case "dynamiczone":
        data[field.name] = ((value as FormValues[]) ?? []).map((item) => ({
          __component: item.__component,
          ...toPayload(resolver.fieldsForComponent(String(item.__component)), item, resolver),
        }));
        break;
      default:
        data[field.name] = value;
    }
  }
  return data;
}

// ── Validation ────────────────────────────────────────────────────────────

/**
 * Checks that give instant feedback while typing. "Required" and minimum
 * lengths are left to Strapi, which enforces them when publishing (drafts
 * may be incomplete).
 */
export function formSchema(fields: Field[], resolver: Resolver): z.ZodType {
  const shape: Record<string, z.ZodType> = {};

  for (const field of fields) {
    const { name, kind, attribute } = field;
    const { min, max, maxLength, regex } = attribute as {
      min?: number;
      max?: number;
      maxLength?: number;
      regex?: string;
    };

    switch (kind) {
      case "string":
      case "text":
      case "uid":
      case "email":
      case "color": {
        const checks: ((v: string) => string | null)[] = [];
        if (maxLength) checks.push((v) => (v.length <= maxLength ? null : `At most ${maxLength} characters`));
        if (regex) checks.push((v) => (new RegExp(regex).test(v) ? null : kind === "color" ? "Use a hex colour like #1a2b3c" : "Doesn't match the expected format"));
        if (kind === "email") checks.push((v) => (z.email().safeParse(v).success ? null : "Enter a valid email"));
        if (kind === "uid") checks.push((v) => (/^[A-Za-z0-9-_.~]*$/.test(v) ? null : "Use letters, numbers and dashes only"));
        shape[name] = z
          .string()
          .nullable()
          .superRefine((value, ctx) => {
            if (!value) return; // empty is allowed; required is checked on publish
            for (const check of checks) {
              const message = check(value);
              if (message) ctx.addIssue({ code: "custom", message });
            }
          });
        break;
      }
      case "integer":
      case "decimal":
        shape[name] = z.string().superRefine((value, ctx) => {
          if (value === "") return;
          const n = Number(value);
          if (!Number.isFinite(n) || (kind === "integer" && !Number.isInteger(n))) {
            ctx.addIssue({ code: "custom", message: kind === "integer" ? "Enter a whole number" : "Enter a number" });
          } else if (min !== undefined && n < min) {
            ctx.addIssue({ code: "custom", message: `Must be ${min} or more` });
          } else if (max !== undefined && n > max) {
            ctx.addIssue({ code: "custom", message: `Must be ${max} or less` });
          }
        });
        break;
      case "json":
        shape[name] = z.string().superRefine((value, ctx) => {
          if (value === "") return;
          try {
            JSON.parse(value);
          } catch {
            ctx.addIssue({ code: "custom", message: "Invalid JSON" });
          }
        });
        break;
      case "component": {
        const item = z.lazy(() => formSchema(resolver.fieldsForComponent(field.component!), resolver));
        shape[name] = field.repeatable ? z.array(item) : item.nullable();
        break;
      }
      case "dynamiczone":
        shape[name] = z.array(
          z.looseObject({ __component: z.string() }).superRefine((item, ctx) => {
            const result = formSchema(resolver.fieldsForComponent(item.__component), resolver).safeParse(item);
            if (!result.success) for (const issue of result.error.issues) ctx.addIssue({ ...issue, code: "custom" } as never);
          }),
        );
        break;
      case "readonly":
        break; // not part of the form values
      default:
        shape[name] = z.any().optional();
    }
  }

  // Loose: keeps __key/__component and anything else the form carries.
  return z.looseObject(shape);
}
