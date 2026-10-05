import { resolveStructuredDataList } from "@/lib/seo/parse-json-string";

type JsonLdObject = Record<string, unknown>;

export function JsonLd({ data }: { data: JsonLdObject | JsonLdObject[] }) {
  const list = Array.isArray(data) ? data : [data];
  const items = list.filter(
    (item) => item && typeof item === "object" && Object.keys(item).length > 0
  );

  return (
    <>
      {items.map((item, index) => (
        <script
          key={`ld-json-${index}`}
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(item).replace(/</g, "\\u003c"),
          }}
        />
      ))}
    </>
  );
}

/** Prefer Strapi structuredDataText; fall back to a unique WebPage schema. */
export function resolvePageJsonLd(
  seo: { structuredDataText?: string | null; structuredData?: unknown } | null | undefined,
  fallback: JsonLdObject
): JsonLdObject[] {
  const fromCms = resolveStructuredDataList(seo);
  return fromCms.length > 0 ? fromCms : [fallback];
}
