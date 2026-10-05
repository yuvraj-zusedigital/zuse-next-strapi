/**
 * Checks for HTML (blog bodies written in TinyMCE) that the visual editor
 * would change. Regex-based on purpose: it runs identically on the server
 * and in the browser, so the editor opens in the same mode on both.
 */

/** Elements the visual editor (TipTap StarterKit + Image) keeps. */
const SUPPORTED_TAGS = new Set([
  "p", "div", "br", "span", "strong", "b", "em", "i", "u", "s", "strike", "del",
  "h1", "h2", "h3", "h4", "h5", "h6", "blockquote", "a", "img", "ul", "ol", "li", "code", "pre", "hr",
]);

/** What visual editing would drop or change, in plain words (empty = safe). */
export function htmlLosses(html: string | null | undefined): string[] {
  if (!html) return [];
  const losses = new Set<string>();

  for (const [, tag] of html.matchAll(/<([a-zA-Z][a-zA-Z0-9-]*)/g)) {
    const name = tag.toLowerCase();
    if (!SUPPORTED_TAGS.has(name)) losses.add(`<${name}> elements`);
  }
  if (/\sstyle\s*=/i.test(html)) losses.add("inline styles (e.g. text colour)");
  if (/<img\b[^>]*\s(width|height)\s*=/i.test(html)) losses.add("image sizes");
  if (/<(td|th|table)\b/i.test(html)) losses.add("tables");

  return [...losses];
}

/** TipTap's HTML for an empty document. */
export const isEmptyHtml = (html: string) => /^(<p>\s*<\/p>|\s*)$/.test(html);
