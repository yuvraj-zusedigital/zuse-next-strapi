"use server";

import { createPageDraft, StrapiError } from "@/lib/strapi";

export type AiDraftResult = { ok: true; documentId: string; name: string; demo: boolean; sections: number } | { ok: false; message: string };

/** "Draft with AI" on the Pages list. */
export async function draftPageWithAi(input: { brief: string; audience?: string; tone?: string }): Promise<AiDraftResult> {
  try {
    return { ok: true, ...(await createPageDraft(input)) };
  } catch (error) {
    if (error instanceof StrapiError) {
      return { ok: false, message: error.status === 429 ? "That's a lot of drafts for one hour. Try again later." : error.message };
    }
    throw error;
  }
}
