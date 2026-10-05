"use server";

import { strapiFetch, StrapiError } from "@/lib/strapi";
import type { MediaFile, MediaKind, MediaListResponse } from "@/lib/types";

export async function listMedia(params: { q?: string; kind?: MediaKind | ""; page?: number; pageSize?: number }) {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== "") search.set(key, String(value));
  }
  return strapiFetch<MediaListResponse>(`/api/cms/media?${search}`);
}

export async function getMedia(id: number) {
  return (await strapiFetch<{ data: MediaFile }>(`/api/cms/media/${id}`)).data;
}

export async function updateMedia(id: number, data: Pick<MediaFile, "name" | "alternativeText" | "caption">) {
  try {
    const result = await strapiFetch<{ data: MediaFile }>(`/api/cms/media/${id}`, {
      method: "PUT",
      body: JSON.stringify({ data }),
    });
    return { ok: true as const, file: result.data };
  } catch (error) {
    if (error instanceof StrapiError) return { ok: false as const, message: error.message };
    throw error;
  }
}

export async function deleteMedia(id: number) {
  try {
    await strapiFetch(`/api/cms/media/${id}`, { method: "DELETE" });
    return { ok: true as const };
  } catch (error) {
    if (error instanceof StrapiError) return { ok: false as const, message: error.message };
    throw error;
  }
}
