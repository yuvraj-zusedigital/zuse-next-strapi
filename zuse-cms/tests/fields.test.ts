import { describe, expect, it } from "vitest";
import { componentLabel, createResolver, formSchema, humanize, inSentence, slugify, toFormValues, toPayload, type Field } from "@/lib/fields";
import type { ComponentSchema, ContentTypeSchema } from "@/lib/types";

const components: ComponentSchema[] = [
  {
    uid: "sections.faq",
    category: "sections",
    displayName: "FAQ",
    icon: null,
    attributes: { title: { type: "string" }, items: { type: "component", repeatable: true, component: "elements.faq-item" } },
  },
  {
    uid: "elements.faq-item",
    category: "elements",
    displayName: "FAQ item",
    icon: null,
    attributes: { question: { type: "string", required: true, maxLength: 20 }, answer: { type: "text" } },
  },
  { uid: "elements.link", category: "elements", displayName: "Link", icon: null, attributes: { label: { type: "string" }, href: { type: "string" } } },
];

const page: ContentTypeSchema = {
  slug: "page",
  uid: "api::page.page",
  kind: "collectionType",
  displayName: "Page",
  description: "",
  draftAndPublish: true,
  mainField: "Name",
  attributes: {
    Name: { type: "string", required: true },
    rank: { type: "integer", min: 1, max: 5 },
    cover: { type: "media", multiple: false },
    author: { type: "relation", relation: "oneToOne", target: "api::author.author", targetType: "author" },
    cta: { type: "component", repeatable: false, component: "elements.link" },
    sections: { type: "dynamiczone", components: ["sections.faq"] },
    color: { type: "string", customField: "plugin::color-picker.color", regex: "^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$" },
    body: { type: "richtext", customField: "plugin::tinymce.tinymce" },
    secret: { type: "string", private: true },
  },
};

const resolver = createResolver(components, { author: "Name" });
const fields = resolver.fieldsForType(page);
const byName = (name: string) => fields.find((field) => field.name === name) as Field;

const entry = {
  documentId: "abc",
  Name: "Home",
  rank: 3,
  cover: { id: 7, name: "a.jpg", url: "/uploads/a.jpg", mime: "image/jpeg", formats: { thumbnail: { url: "/uploads/t_a.jpg" } } },
  author: { documentId: "au1", Name: "Zanyar" },
  cta: { id: 1, label: "Go", href: "/contact" },
  sections: [{ __component: "sections.faq", id: 9, title: "FAQ", items: [{ id: 1, question: "Q?", answer: "A" }] }],
  color: "#1a2b3c",
  body: "<p>Hi</p>",
};

describe("field kinds", () => {
  it("maps Strapi attributes (incl. custom fields) to editor kinds and skips private ones", () => {
    expect(byName("color").kind).toBe("color");
    expect(byName("body").kind).toBe("html");
    expect(byName("sections").kind).toBe("dynamiczone");
    expect(byName("author").kind).toBe("relation");
    expect(fields.some((field) => field.name === "secret")).toBe(false);
  });
});

describe("toFormValues → toPayload", () => {
  const values = toFormValues(fields, entry, resolver);

  it("uses deterministic keys for loaded list items (no hydration mismatches)", () => {
    const again = toFormValues(fields, entry, resolver);
    expect(again).toEqual(values);
    expect((values.sections as Record<string, unknown>[])[0].__key).toBe("@.sections.0");
  });

  it("sends what Strapi expects: ids for media, documentIds for relations, no client keys or component ids", () => {
    expect(toPayload(fields, values, resolver)).toEqual({
      Name: "Home",
      rank: 3,
      cover: 7,
      author: ["au1"],
      cta: { label: "Go", href: "/contact" },
      sections: [{ __component: "sections.faq", title: "FAQ", items: [{ question: "Q?", answer: "A" }] }],
      color: "#1a2b3c",
      body: "<p>Hi</p>",
    });
  });

  it("applies defaults for a new entry", () => {
    const fresh = toFormValues(fields, null, resolver);
    expect(fresh.sections).toEqual([]);
    expect(fresh.cta).toBeNull();
  });
});

describe("formSchema", () => {
  const schema = formSchema(fields, resolver);
  const valid = toFormValues(fields, entry, resolver);

  it("accepts valid values and leaves required/min-length to Strapi (drafts may be incomplete)", () => {
    expect(schema.safeParse(valid).success).toBe(true);
    expect(schema.safeParse({ ...valid, Name: "" }).success).toBe(true);
  });

  it("reports nested errors with full paths", () => {
    const sections = [{ ...(valid.sections as Record<string, unknown>[])[0], items: [{ __key: "k", question: "x".repeat(25), answer: "" }] }];
    const result = schema.safeParse({ ...valid, sections });
    expect(result.success).toBe(false);
    expect(result.error!.issues.map((issue) => issue.path.join("."))).toContain("sections.0.items.0.question");
  });

  it("checks numbers and colours", () => {
    expect(schema.safeParse({ ...valid, rank: "9" }).success).toBe(false);
    expect(schema.safeParse({ ...valid, color: "blue" }).success).toBe(false);
  });
});

describe("labels", () => {
  it("humanizes names and keeps acronyms", () => {
    expect(humanize("primaryCta")).toBe("Primary CTA");
    expect(humanize("canonicalURL")).toBe("Canonical URL");
    expect(humanize("href")).toBe("URL");
    expect(inSentence("Secondary CTA")).toBe("secondary CTA");
    expect(inSentence("FAQ item")).toBe("FAQ item");
    expect(componentLabel("RepetableMedia", "x.y")).toBe("Repetable media");
    expect(componentLabel("", "elements.work-card")).toBe("Work card");
    expect(slugify("Café & Co — 2026!")).toBe("cafe-co-2026");
  });
});
