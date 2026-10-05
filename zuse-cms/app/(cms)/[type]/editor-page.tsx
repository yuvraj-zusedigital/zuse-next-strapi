import { notFound } from "next/navigation";
import { EntryEditor } from "@/components/editor/entry-editor";
import { activityVerb, activityWho, timeAgo } from "@/lib/activity";
import { SiteChromeProvider } from "@/components/preview/site-chrome";
import { getEntry, getSchema, getSiteChrome, listActivity } from "@/lib/strapi";

/**
 * Server wrapper for the editor. documentId: an id to edit, "new" for a new
 * collection entry, or null for a single type.
 */
export async function EditorPage({
  slug,
  documentId,
}: {
  slug: string;
  documentId: string | null;
}) {
  const schema = await getSchema();
  const type = schema.contentTypes.find(
    (contentType) => contentType.slug === slug,
  );
  if (!type) notFound();

  const mainFields = Object.fromEntries(
    schema.contentTypes.map((contentType) => [
      contentType.slug,
      contentType.mainField,
    ]),
  );

  let entry = null;
  let status: "draft" | "published" | "modified" = "draft";
  if (documentId !== "new") {
    const response = await getEntry(slug, documentId);
    if (!response) notFound();
    entry = response.data;
    status = response.meta.status;
  }

  // "Last edited by editor · 5 minutes ago" from the audit log.
  const [last] = entry
    ? await listActivity({ type: slug, documentId: entry.documentId, limit: 1 })
    : [];
  const lastChange = last
    ? `${last.action === "create" ? "Created" : `Last ${activityVerb(last)}`} by ${activityWho(last)} · ${timeAgo(last.at)}`
    : null;

  // Page previews show the site's live header and footer around the sections.
  const hasPreview = Object.values(type.attributes).some(
    (attribute) => attribute.type === "dynamiczone",
  );
  const chrome = hasPreview ? await getSiteChrome() : null;

  return (
    <SiteChromeProvider value={chrome}>
      <EntryEditor
        // Remount when switching entries so the form starts clean.
        key={entry?.documentId ?? "new"}
        type={type}
        mainFields={mainFields}
        components={schema.components}
        entry={entry}
        status={status}
        lastChange={lastChange}
      />
    </SiteChromeProvider>
  );
}
