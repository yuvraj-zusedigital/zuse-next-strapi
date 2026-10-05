/**
 * Pull JSON out of one or more
 * <script type="application/ld+json">…</script> blocks.
 * Ported from Website/src/hook/convertJson.js
 */
function extractJsonLdFromScripts(str: string): string[] | null {
  const ldJsonRegex =
    /<script\b[^>]*\btype\s*=\s*["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;

  const matches: string[] = [];
  let match: RegExpExecArray | null;

  while ((match = ldJsonRegex.exec(str)) !== null) {
    const content = match?.[1]?.trim();
    if (content) matches.push(content);
  }

  if (matches.length > 0) return matches;

  if (str.startsWith("<script")) {
    const scriptMatch = str.match(/<script\b[^>]*>([\s\S]*?)<\/script>/i);
    if (scriptMatch) {
      const inner = scriptMatch[1].trim();
      if (
        (inner.startsWith("{") && inner.endsWith("}")) ||
        (inner.startsWith("[") && inner.endsWith("]"))
      ) {
        return [inner];
      }
    }
  }

  return null;
}

/** Parse Strapi `structuredDataText` (raw JSON or wrapped script tags). */
export function parseJsonString(jsonString: unknown): unknown {
  if (!jsonString || typeof jsonString !== "string") return {};

  let content = jsonString.trim();
  const extractedScripts = extractJsonLdFromScripts(content);

  if (extractedScripts !== null) {
    if (extractedScripts.length === 1) {
      content = extractedScripts[0];
    } else {
      try {
        return extractedScripts.map((item) =>
          JSON.parse(item.replace(/\\n/g, ""))
        );
      } catch (error) {
        console.error("Error parsing JSON-LD scripts:", error);
        return {};
      }
    }
  }

  if (
    content.startsWith("<") &&
    !content.startsWith("{") &&
    !content.startsWith("[")
  ) {
    return {};
  }

  try {
    return JSON.parse(content.replace(/\\n/g, ""));
  } catch (error) {
    console.error("Error parsing JSON:", error);
    return {};
  }
}

export type StrapiSeoStructured = {
  structuredDataText?: string | null;
  structuredData?: unknown;
};

/**
 * Prefer structuredDataText (Gatsby path); fall back to structuredData object.
 * Returns a list of non-empty objects suitable for JSON-LD script tags.
 */
export function resolveStructuredDataList(
  seo: StrapiSeoStructured | null | undefined
): Record<string, unknown>[] {
  if (!seo) return [];

  let parsed: unknown = {};

  if (seo.structuredDataText) {
    parsed = parseJsonString(seo.structuredDataText);
  } else if (seo.structuredData != null) {
    parsed =
      typeof seo.structuredData === "string"
        ? parseJsonString(seo.structuredData)
        : seo.structuredData;
  }

  const list = Array.isArray(parsed) ? parsed : [parsed];
  return list.filter(
    (item): item is Record<string, unknown> =>
      !!item &&
      typeof item === "object" &&
      !Array.isArray(item) &&
      Object.keys(item).length > 0
  );
}
