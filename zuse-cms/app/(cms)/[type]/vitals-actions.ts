"use server";

import { getPageVitals, StrapiError } from "@/lib/strapi";
import type { PageVitals } from "@/lib/types";

export type PageVitalsResult = { status: "ok"; data: PageVitals } | { status: "error"; message: string };

/** Real-visitor speed for one page path, for the SEO panel. */
export async function loadPageVitals(path: string): Promise<PageVitalsResult> {
  if (typeof path !== "string" || !path.startsWith("/") || path.length > 300) return { status: "error", message: "Invalid page path." };
  try {
    return { status: "ok", data: await getPageVitals(path) };
  } catch (error) {
    if (error instanceof StrapiError) return { status: "error", message: error.message };
    throw error;
  }
}
