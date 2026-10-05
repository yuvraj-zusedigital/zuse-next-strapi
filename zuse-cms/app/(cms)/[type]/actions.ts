"use server";

import { redirect } from "next/navigation";
import { entryPath, getContentType, listEntries, strapiFetch, StrapiError } from "@/lib/strapi";
import type { EntryResponse } from "@/lib/types";

export type ActionResult =
  | { ok: true; entry: EntryResponse }
  | { ok: false; message: string; fieldErrors: Record<string, string> };

async function run(request: () => Promise<EntryResponse>): Promise<ActionResult> {
  try {
    return { ok: true, entry: await request() };
  } catch (error) {
    if (error instanceof StrapiError) {
      const fieldErrors: Record<string, string> = {};
      // Full paths, e.g. sections.2.items.0.question, so nested fields show their own error.
      for (const { path, message } of error.fieldErrors) {
        const key = (path ?? []).join(".");
        if (key && !fieldErrors[key]) fieldErrors[key] = message;
      }
      const message =
        error.status === 400 && Object.keys(fieldErrors).length
          ? "Some fields need attention."
          : error.status === 404
            ? "This entry no longer exists."
            : error.message;
      return { ok: false, message, fieldErrors };
    }
    throw error;
  }
}

/** Saves the draft. documentId null = create (collection) or the single type's entry. */
export async function saveEntry(type: string, documentId: string | null, data: Record<string, unknown>) {
  const contentType = await getContentType(type);
  if (!contentType) return { ok: false, message: "Unknown content type.", fieldErrors: {} } satisfies ActionResult;

  const body = JSON.stringify({ data });
  if (!documentId && contentType.kind === "collectionType") {
    return run(() => strapiFetch<EntryResponse>(`/api/cms/types/${encodeURIComponent(type)}`, { method: "POST", body }));
  }
  return run(() => strapiFetch<EntryResponse>(entryPath(type, documentId), { method: "PUT", body }));
}

export async function transitionEntry(type: string, documentId: string | null, action: "publish" | "unpublish" | "discard") {
  return run(() => strapiFetch<EntryResponse>(`${entryPath(type, documentId)}/${action}`, { method: "POST" }));
}

export async function deleteEntry(type: string, documentId: string) {
  try {
    await strapiFetch(entryPath(type, documentId), { method: "DELETE" });
  } catch (error) {
    if (!(error instanceof StrapiError && error.status === 404)) throw error;
  }
  redirect(`/${type}?deleted=1`);
}

export type BulkResult = { done: number; failed: { documentId: string; message: string }[] };

/**
 * Publish, unpublish or delete several entries (list view). Each goes through
 * the same Strapi endpoint as the editor, so roles and the activity log apply
 * per entry; a few run at a time.
 */
export async function bulkAction(type: string, documentIds: string[], action: "publish" | "unpublish" | "delete"): Promise<BulkResult> {
  const ids = [...new Set(documentIds)].slice(0, 100);
  const result: BulkResult = { done: 0, failed: [] };
  const run = async (documentId: string) => {
    try {
      if (action === "delete") await strapiFetch(entryPath(type, documentId), { method: "DELETE" });
      else await strapiFetch(`${entryPath(type, documentId)}/${action}`, { method: "POST" });
      result.done++;
    } catch (error) {
      if (action === "delete" && error instanceof StrapiError && error.status === 404) result.done++;
      else if (error instanceof StrapiError) result.failed.push({ documentId, message: error.message });
      else throw error;
    }
  };
  for (let i = 0; i < ids.length; i += 4) await Promise.all(ids.slice(i, i + 4).map(run));
  return result;
}

/** Options for relation pickers. */
export async function searchEntries(type: string, q: string) {
  const { data } = await listEntries(type, { q, pageSize: 20 });
  return data.map((entry) => ({ documentId: entry.documentId, label: entry.title || "Untitled" }));
}
