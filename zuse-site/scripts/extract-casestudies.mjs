#!/usr/bin/env node
/**
 * One-shot extractor: Gatsby case study JSX → nextsetup TS data modules.
 * Run from nextsetup: node scripts/extract-casestudies.mjs
 */
import fs from "fs";
import path from "path";

const SRC_ROOT =
  "/Users/zusedigital/Documents/Gitlab/Zuse Digital/Website/src/pages/casestudies";
const OUT_DIR =
  "/Users/zusedigital/Downloads/nextsetup/lib/casestudies/data";

const FILES = [
  "websites/komodo-websites.js",
  "websites/runway-websites.js",
  "e-commerce/simon-west-ecommerce-website.js",
  "web-apps/louis-vuitton-web-application.js",
  "web-apps/viktrs-web-application.js",
  "web-apps/jabri-web-application.js",
  "web-apps/rww-web-application.js",
  "web-apps/albya-web-application.js",
  "mobile-apps/afl-players-moji-mobile-application.js",
  "mobile-apps/warnie-moji-mobile-application.js",
  "mobile-apps/c19-mobile-application.js",
];

function decodeEntities(s) {
  return s
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, " ")
    .replace(/&bull;/g, "")
    .replace(/\\'/g, "'")
    .replace(/\\"/g, '"')
    .replace(/^\s*[•]\s*/, "")
    .trim();
}

function stripTags(html) {
  return decodeEntities(
    html
      .replace(/<br\s*\/?>/gi, "\n")
      .replace(/<\/p>/gi, "\n")
      .replace(/<[^>]+>/g, "")
      .replace(/\s+/g, " ")
      .trim()
  );
}

function extractAttr(str, attr) {
  const m = str.match(new RegExp(`${attr}=["']([^"']+)["']`));
  return m ? m[1] : undefined;
}

function extractBanner(src) {
  const m = src.match(/backgroundImage["']?\s*:\s*["']url\(([^)]+)\)/);
  return m ? m[1] : "";
}

function extractTitle(src) {
  const m = src.match(
    /case-study-banner-title[^>]*>([\s\S]*?)<\/h1>/
  );
  return m ? stripTags(m[1]) : "";
}

function extractAbout(src) {
  const m = src.match(
    /case-study-textual-desc[^>]*>([\s\S]*?)<\/p>/
  );
  return m ? stripTags(m[1]) : "";
}

function extractMeta(src) {
  const aboutBlock = src.match(
    /case_points[\s\S]*?(?=<section|case-study-full-width|<\/Layout)/
  );
  if (!aboutBlock) return [];
  const block = aboutBlock[0];
  const fields = [];
  const pointRe =
    /case_point[^>]*>[\s\S]*?<h4[^>]*>([\s\S]*?)<\/h4>([\s\S]*?)(?=<div className="case_point|<\/div>\s*<\/div>\s*<\/div>\s*<\/section>|$)/g;
  let match;
  while ((match = pointRe.exec(block))) {
    const label = stripTags(match[1]).replace(/:$/, "");
    const body = match[2];
    const link = body.match(/<a[^>]*href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/);
    const listItems = [...body.matchAll(/<li[^>]*>([\s\S]*?)<\/li>/g)].map((li) =>
      stripTags(li[1]).replace(/^•\s*/, "")
    );
    const p = body.match(/<p[^>]*>([\s\S]*?)<\/p>/);
    if (listItems.length) {
      fields.push({ label, list: listItems });
    } else if (link) {
      fields.push({
        label,
        href: link[1],
        hrefLabel: stripTags(link[2]),
        value: stripTags(link[2]),
      });
    } else if (p) {
      fields.push({ label, value: stripTags(p[1]) });
    }
  }
  return fields;
}

function extractImageFromChunk(chunk) {
  const img = chunk.match(/<img[^>]+>/);
  if (!img) return null;
  const tag = img[0];
  const src = extractAttr(tag, "src");
  if (!src) return null;
  const webp = chunk.match(/srcSet=["']([^"']+\.webp)["']/);
  return {
    src,
    webp: webp ? webp[1] : undefined,
    alt: extractAttr(tag, "alt") || "Case study image",
    width: Number(extractAttr(tag, "width")) || undefined,
    height: Number(extractAttr(tag, "height")) || undefined,
  };
}

function extractBlocks(src) {
  // Cut from after about section to before testimonial
  const startIdx = src.search(
    /<\/section>\s*(?:<section className="py-|<div className="case-study-full-width|<div className="case-study-grid)/
  );
  const endIdx = src.search(/case-study-testimonial/);
  if (startIdx < 0) return [];
  const body = src.slice(startIdx, endIdx > 0 ? endIdx : undefined);
  const blocks = [];

  // Walk by major section/div markers
  const parts = body.split(
    /(?=<section className="py-|<div className="case-study-full-width|<div className="case-study-grid)/
  );

  for (const part of parts) {
    if (!part.trim()) continue;

    if (part.includes("case-study-grid-imgs")) {
      const imgs = [...part.matchAll(/<picture>[\s\S]*?<\/picture>|<img[^>]+>/g)]
        .map((m) => extractImageFromChunk(m[0]))
        .filter(Boolean);
      if (imgs.length >= 2) {
        blocks.push({ type: "imageGrid", images: [imgs[0], imgs[1]] });
      } else if (imgs[0]) {
        blocks.push({ type: "image", image: imgs[0] });
      }
      continue;
    }

    if (part.includes("case-study-full-width-img")) {
      const image = extractImageFromChunk(part);
      if (image) blocks.push({ type: "image", image });
      continue;
    }

    if (part.includes("<section")) {
      const titleM = part.match(/<h3[^>]*>([\s\S]*?)<\/h3>/);
      const title = titleM ? stripTags(titleM[1]) : undefined;
      const paragraphs = [...part.matchAll(/<p[^>]*>([\s\S]*?)<\/p>/g)]
        .map((p) => stripTags(p[1]))
        .filter((t) => t && !t.startsWith("Our approach"));
      // Also keep approach intro paragraphs that aren't in bullets
      const bullets = [];
      const liMatches = [...part.matchAll(/<li[^>]*>([\s\S]*?)<\/li>/g)];
      for (const li of liMatches) {
        const html = li[1];
        const h4 = html.match(/<h4[^>]*>[\s\S]*?<b>([\s\S]*?)<\/b>/);
        const bodyDiv = html.match(
          /<div[^>]*opacity-80[^>]*>([\s\S]*?)<\/div>/
        );
        if (h4) {
          bullets.push({
            title: stripTags(h4[1]),
            body: bodyDiv ? stripTags(bodyDiv[1]) : "",
          });
        } else {
          const text = stripTags(html).replace(/^•\s*/, "");
          if (text) bullets.push({ body: text });
        }
      }
      const hasTwoCol = /lg:w-\[47%\]/.test(part);
      if (title || paragraphs.length || bullets.length) {
        blocks.push({
          type: "text",
          title,
          paragraphs: paragraphs.length ? paragraphs : undefined,
          bullets: bullets.length ? bullets : undefined,
          bulletColumns: hasTwoCol ? 2 : 1,
        });
      }
    }
  }

  return blocks;
}

function extractTestimonial(src) {
  const block = src.match(
    /case-study-testimonial[\s\S]*?(?=home-comm-action-parent|<\/Layout)/
  );
  if (!block) return undefined;
  const b = block[0];
  const name = stripTags(
    (b.match(/case-study-testimonial-avatar-title[^>]*>([\s\S]*?)<\/div>/) ||
      [])[1] || ""
  );
  const role = stripTags(
    (b.match(/case-study-testimonial-avatar-desg[^>]*>([\s\S]*?)<\/div>/) ||
      [])[1] || ""
  );
  const excerpt = stripTags(
    (b.match(
      /case-study-testimonial-text-half[^>]*>([\s\S]*?)<\/p>/
    ) || [])[1] || ""
  );
  const fullSpans = [
    ...b.matchAll(
      /case-study-testimonial-text-full[\s\S]*?>([\s\S]*?)<\/p>/g
    ),
  ];
  let full = [];
  if (fullSpans[0]) {
    full = [...fullSpans[0][1].matchAll(/<span[^>]*>([\s\S]*?)<\/span>/g)].map(
      (s) => stripTags(s[1])
    );
    if (!full.length) {
      const t = stripTags(fullSpans[0][1]);
      if (t) full = [t];
    }
  }
  const avatarChunk =
    b.match(/case-study-testimonial-avatar[\s\S]*?<picture>[\s\S]*?<\/picture>/) ||
    b.match(/case-study-testimonial-avatar[\s\S]*?<img[^>]+>/);
  const logoChunk =
    b.match(
      /case-study-testimonial-brand-logo[\s\S]*?<picture>[\s\S]*?<\/picture>/
    ) ||
    b.match(/case-study-testimonial-brand-logo[\s\S]*?<img[^>]+>/);
  const avatar = avatarChunk ? extractImageFromChunk(avatarChunk[0]) : null;
  const brandLogo = logoChunk ? extractImageFromChunk(logoChunk[0]) : undefined;
  if (!name || !excerpt || !avatar) return undefined;
  return {
    name,
    role,
    avatar,
    brandLogo: brandLogo || undefined,
    excerpt,
    full: full.length ? full : undefined,
    rating: 5,
  };
}

function extractStrapiSlug(src) {
  const m = src.match(/strapiPage\(slug:\s*\{eq:\s*"([^"]+)"\}\)/);
  return m ? m[1] : undefined;
}

function extractDescription(src, about, title) {
  // Prefer metaDescription from somewhere — fall back to about
  return about || title;
}

function toIdent(slug) {
  return slug
    .replace(/-web-application$/, "")
    .replace(/-ecommerce-website$/, "")
    .replace(/-websites$/, "")
    .replace(/-mobile-application$/, "")
    .replace(/-moji/, "-moji")
    .replace(/-/g, "_");
}

function serialize(value, indent = 0) {
  const pad = "  ".repeat(indent);
  const pad2 = "  ".repeat(indent + 1);
  if (value === undefined) return "undefined";
  if (value === null) return "null";
  if (typeof value === "string") return JSON.stringify(value);
  if (typeof value === "number" || typeof value === "boolean") return String(value);
  if (Array.isArray(value)) {
    if (!value.length) return "[]";
    return `[\n${value
      .map((v) => `${pad2}${serialize(v, indent + 1)}`)
      .join(",\n")}\n${pad}]`;
  }
  if (typeof value === "object") {
    const entries = Object.entries(value).filter(([, v]) => v !== undefined);
    if (!entries.length) return "{}";
    return `{\n${entries
      .map(([k, v]) => `${pad2}${k}: ${serialize(v, indent + 1)}`)
      .join(",\n")}\n${pad}}`;
  }
  return String(value);
}

fs.mkdirSync(OUT_DIR, { recursive: true });

const registry = [];

for (const rel of FILES) {
  const full = path.join(SRC_ROOT, rel);
  const src = fs.readFileSync(full, "utf8");
  const category = rel.split("/")[0];
  const slug = path.basename(rel, ".js");
  const title = extractTitle(src);
  const about = extractAbout(src);
  const banner = extractBanner(src);
  const meta = extractMeta(src);
  const blocks = extractBlocks(src);
  const testimonial = extractTestimonial(src);
  const strapiSlug = extractStrapiSlug(src);

  const data = {
    category,
    slug,
    title,
    description: extractDescription(src, about, title),
    banner,
    about,
    meta,
    blocks,
    testimonial,
    strapiSlug,
  };

  const ident = toIdent(slug);
  const fileBase = slug.replace(/-/g, "-");
  const outPath = path.join(OUT_DIR, `${slug}.ts`);
  const content = `import type { CaseStudy } from "../types";

const study: CaseStudy = ${serialize(data)};

export default study;
`;
  fs.writeFileSync(outPath, content);
  registry.push({ category, slug, ident, importPath: `./data/${slug}` });
  console.log(
    `✓ ${category}/${slug} — ${blocks.length} blocks, meta=${meta.length}, testi=${!!testimonial}`
  );
}

const importName = (slug) =>
  slug
    .split("-")
    .map((p, i) => (i === 0 ? p : p[0].toUpperCase() + p.slice(1)))
    .join("")
    .replace(/[^a-zA-Z0-9_]/g, "");

const indexFixed = `import type { CaseStudy } from "./types";
${registry
  .map((r) => `import ${importName(r.slug)} from "${r.importPath}";`)
  .join("\n")}

export const CASE_STUDIES: CaseStudy[] = [
${registry.map((r) => `  ${importName(r.slug)},`).join("\n")}
];

export function getCaseStudy(
  category: string,
  slug: string
): CaseStudy | undefined {
  return CASE_STUDIES.find(
    (s) => s.category === category && s.slug === slug
  );
}

export function getAllCaseStudyParams() {
  return CASE_STUDIES.map((s) => ({
    category: s.category,
    slug: s.slug,
  }));
}
`;

fs.writeFileSync(
  "/Users/zusedigital/Downloads/nextsetup/lib/casestudies/index.ts",
  indexFixed
);
console.log("\nWrote index +", registry.length, "studies");
