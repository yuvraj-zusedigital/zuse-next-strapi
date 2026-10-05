/**
 * Text snippets ({phone}, {email}, {yearsInBusiness}…) in the CMS preview,
 * filled in the same way as on the site (zuse-site lib/snippets.ts): values
 * from Organization settings → Text snippets, plus {year}. Unknown {words}
 * are left as they are.
 */

export type Snippets = Record<string, string>;

const TOKEN = /\{([A-Za-z][A-Za-z0-9]*)\}/g;

/** The saved snippets plus the built-in {year}. */
export function withBuiltIns(saved: Snippets | null | undefined, now = new Date()): Snippets {
  const out: Snippets = {};
  for (const [name, value] of Object.entries(saved ?? {})) if (name.toLowerCase() !== "name") out[name] = value;
  out.year = String(now.getFullYear());
  return out;
}

export function fillSnippets(text: string, snippets: Snippets): string {
  if (!text.includes("{")) return text;
  return text.replace(TOKEN, (match, key: string) => (Object.prototype.hasOwnProperty.call(snippets, key) ? snippets[key] : match));
}

/** Every string in a value, with {tokens} filled in (object keys untouched). */
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

/** Snippet names used in a text that have no value (for warnings). */
export function unknownSnippets(text: string, snippets: Snippets) {
  return [...text.matchAll(TOKEN)].map((match) => match[1]).filter((key) => key !== "name" && !(key in snippets));
}
