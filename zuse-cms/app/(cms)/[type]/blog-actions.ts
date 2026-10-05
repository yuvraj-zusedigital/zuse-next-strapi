"use server";

import { getEntry, strapiFetch, StrapiError } from "@/lib/strapi";
import type { EntryStatus } from "@/lib/types";

export type AudioVariant = { voice?: string; label?: string; url: string; provider?: string };

export type BlogTools = {
  ttsStatus: "idle" | "generating" | "done" | "failed" | string;
  ttsProgress: { message?: string; chunk?: number; totalChunks?: number; currentVoice?: number; totalVoices?: number; done?: boolean } | null;
  audioVariants: AudioVariant[];
  aiSummary: string | null;
};

type Failure = { ok: false; message: string };

const path = (documentId: string) => `/api/cms/blogs/${encodeURIComponent(documentId)}`;

async function attempt<T>(run: () => Promise<T>): Promise<{ ok: true; value: T } | Failure> {
  try {
    return { ok: true, value: await run() };
  } catch (error) {
    if (error instanceof StrapiError) return { ok: false, message: error.message };
    throw error;
  }
}

export async function getBlogTools(documentId: string) {
  return (await strapiFetch<{ data: BlogTools }>(`${path(documentId)}/tools`)).data;
}

/** Generates and stores the AI summary (OpenAI). Returns it with the entry's new status. */
export async function generateBlogSummary(documentId: string): Promise<{ ok: true; aiSummary: string; status: EntryStatus } | Failure> {
  const result = await attempt(() => strapiFetch<{ data: { aiSummary: string } }>(`${path(documentId)}/summary`, { method: "POST" }));
  if (!result.ok) return result;
  const entry = await getEntry("blog", documentId);
  return { ok: true, aiSummary: result.value.data.aiSummary, status: entry?.meta.status ?? "draft" };
}

/** Starts background audio generation; progress comes from getBlogTools. */
export async function generateBlogAudio(documentId: string, provider: "openai" | "elevenlabs"): Promise<{ ok: true } | Failure> {
  const result = await attempt(() => strapiFetch(`${path(documentId)}/audio/${provider}`, { method: "POST" }));
  return result.ok ? { ok: true } : result;
}
