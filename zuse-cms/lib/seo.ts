/**
 * SEO checks for the editor's SEO panel (components/editor/seo-panel.tsx):
 * search-result lengths, focus keyword placement, share image, indexing.
 * Pure functions, so they're unit-tested (tests/seo.test.ts).
 */

export type CheckStatus = "good" | "ok" | "bad";
export type SeoCheck = { id: string; status: CheckStatus; label: string };

/** Google shows about this many characters before cutting off. */
export const TITLE_RANGE = { min: 30, max: 60 } as const;
export const DESCRIPTION_RANGE = { min: 120, max: 160 } as const;

export function lengthStatus(length: number, range: { min: number; max: number }): CheckStatus {
  if (length === 0 || length > range.max) return "bad";
  return length >= range.min ? "good" : "ok";
}

const normalise = (text: string) =>
  text
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();

/** Whole-phrase matches of `keyword` in `text`, ignoring case, accents and punctuation. */
export function countKeyword(text: string, keyword: string) {
  const needle = normalise(keyword);
  if (!needle) return 0;
  const haystack = ` ${normalise(text)} `;
  let count = 0;
  let index = haystack.indexOf(` ${needle} `);
  while (index !== -1) {
    count += 1;
    index = haystack.indexOf(` ${needle} `, index + needle.length + 1);
  }
  return count;
}

/**
 * All readable text in an entry's form values (headings, paragraphs, rich
 * text, list items), skipping internal keys, media and the SEO block itself.
 */
export function collectText(value: unknown, skipKeys: string[] = []): string {
  const out: string[] = [];
  const walk = (node: unknown, key?: string) => {
    if (key && (key.startsWith("__") || skipKeys.includes(key))) return;
    if (typeof node === "string") {
      if (!/^(https?:|\/|#|data:)/.test(node) && !/^[a-z0-9-]+$/.test(node)) out.push(node);
      return;
    }
    if (Array.isArray(node)) return node.forEach((item) => walk(item));
    if (node && typeof node === "object") {
      const record = node as Record<string, unknown>;
      if ("mime" in record && "url" in record) return; // a media file
      for (const [childKey, child] of Object.entries(record)) {
        if (childKey === "url" || childKey === "href" || childKey === "documentId") continue;
        walk(child, childKey);
      }
    }
  };
  walk(value);
  return out.join(" ");
}

export type SeoInput = {
  title: string;
  description: string;
  keyword: string;
  /** Page URL path, e.g. /services/website-design (null when it has none). */
  path: string | null;
  /** All other text on the page. */
  content: string;
  hasImage: boolean;
  robots: string;
};

export function analyse(input: SeoInput): { checks: SeoCheck[]; score: number } {
  const checks: SeoCheck[] = [];
  const add = (id: string, status: CheckStatus, label: string) => checks.push({ id, status, label });
  const { title, description, keyword } = input;

  const titleStatus = lengthStatus(title.length, TITLE_RANGE);
  add(
    "title-length",
    titleStatus,
    !title
      ? "Add a meta title."
      : title.length > TITLE_RANGE.max
        ? `Title is ${title.length} characters; Google cuts it off after about ${TITLE_RANGE.max}.`
        : title.length < TITLE_RANGE.min
          ? `Title is short (${title.length} characters); aim for ${TITLE_RANGE.min}–${TITLE_RANGE.max}.`
          : `Title length is good (${title.length} characters).`,
  );

  const descriptionStatus = lengthStatus(description.length, DESCRIPTION_RANGE);
  add(
    "description-length",
    descriptionStatus,
    !description
      ? "Add a meta description; Google otherwise picks text from the page."
      : description.length > DESCRIPTION_RANGE.max
        ? `Description is ${description.length} characters; it's cut off after about ${DESCRIPTION_RANGE.max}.`
        : description.length < DESCRIPTION_RANGE.min
          ? `Description is short (${description.length} characters); aim for ${DESCRIPTION_RANGE.min}–${DESCRIPTION_RANGE.max}.`
          : `Description length is good (${description.length} characters).`,
  );

  if (!keyword.trim()) {
    add("keyword", "ok", "Add a focus keyword to check how well the page targets it.");
  } else {
    const inTitle = countKeyword(title, keyword) > 0;
    add("keyword-title", inTitle ? "good" : "bad", inTitle ? "Focus keyword is in the title." : "Put the focus keyword in the title.");
    if (inTitle && normalise(title).startsWith(normalise(keyword))) {
      add("keyword-title-start", "good", "Title starts with the focus keyword.");
    }
    const inDescription = countKeyword(description, keyword) > 0;
    add(
      "keyword-description",
      inDescription ? "good" : "ok",
      inDescription ? "Focus keyword is in the description." : "Use the focus keyword in the description.",
    );
    if (input.path) {
      const inUrl = countKeyword(input.path.replace(/[/_-]+/g, " "), keyword) > 0;
      add("keyword-url", inUrl ? "good" : "ok", inUrl ? "Focus keyword is in the URL." : "The URL doesn't contain the focus keyword.");
    }
    const inContent = countKeyword(input.content, keyword);
    add(
      "keyword-content",
      inContent >= 2 ? "good" : inContent === 1 ? "ok" : "bad",
      inContent === 0
        ? "The focus keyword doesn't appear in the page content."
        : `Focus keyword appears ${inContent} time${inContent === 1 ? "" : "s"} in the page content.`,
    );
  }

  add(
    "image",
    input.hasImage ? "good" : "bad",
    input.hasImage ? "Share image is set." : "Add a share image for links shared on social media and chat apps.",
  );

  const noindex = /noindex/i.test(input.robots);
  add(
    "indexing",
    noindex ? "bad" : "good",
    noindex ? "Hidden from search results: Google won't show this page and it's left out of the sitemap." : "Shown in search results.",
  );

  const points = checks.reduce((sum, check) => sum + (check.status === "good" ? 1 : check.status === "ok" ? 0.5 : 0), 0);
  return { checks, score: Math.round((points / checks.length) * 100) };
}
