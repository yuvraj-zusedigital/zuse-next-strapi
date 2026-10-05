/**
 * Text snippets: a value written once in the CMS (Site settings → Text
 * snippets) and used in any text as {name} — e.g. {phone}, {email},
 * {yearsInBusiness}. lib/strapi.ts applies them to every Strapi response, so
 * pages, menus, SEO, blog posts and case studies all get the current value.
 *
 * Built in: {year} (the current year). Unknown {words} are left as they are
 * (so {name} in the thank-you title still works).
 */

export type Snippets = Record<string, string>;

const TOKEN = /\{([A-Za-z][A-Za-z0-9]*)\}/g;

/** Snippet values from the /api/text-snippets response, plus the built-ins. */
export function snippetsFrom(response: unknown, now = new Date()): Snippets {
  const out: Snippets = {};
  const list = (response as { data?: { name?: string | null; value?: string | null }[] } | null)?.data;
  for (const snippet of Array.isArray(list) ? list : []) {
    // {name} belongs to the thank-you title; the CMS doesn't allow it, this is a backstop.
    if (snippet?.name && snippet.name.toLowerCase() !== "name") out[snippet.name] = snippet.value ?? "";
  }
  out.year = String(now.getFullYear());
  return out;
}

/** Replaces {tokens} in one string. */
export function fillSnippets(text: string, snippets: Snippets): string {
  if (!text.includes("{")) return text;
  return text.replace(TOKEN, (match, key: string) => (Object.prototype.hasOwnProperty.call(snippets, key) ? snippets[key] : match));
}

/** Replaces {tokens} in every string of a JSON value (object keys are left alone). */
export function applySnippets<T>(value: T, snippets: Snippets): T {
  if (typeof value === "string") return fillSnippets(value, snippets) as T;
  if (Array.isArray(value)) return value.map((item) => applySnippets(item, snippets)) as T;
  if (value && typeof value === "object") {
    const out: Record<string, unknown> = {};
    for (const [key, item] of Object.entries(value)) out[key] = applySnippets(item, snippets);
    return out as T;
  }
  return value;
}
