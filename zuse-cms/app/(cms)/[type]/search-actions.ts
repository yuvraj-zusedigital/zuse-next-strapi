"use server";

import { verifySession } from "@/lib/dal";
import { pagePerformance, searchConsoleConfig, type SearchPerformance } from "@/lib/search-console";

export type SearchPerformanceResult =
  | { status: "ok"; data: SearchPerformance }
  | { status: "not-connected" }
  | { status: "error"; message: string };

/** Search Console figures for one page path (e.g. /services/website-design), for the SEO panel. */
export async function getSearchPerformance(path: string): Promise<SearchPerformanceResult> {
  await verifySession();
  if (typeof path !== "string" || !path.startsWith("/") || path.length > 300) return { status: "error", message: "Invalid page path." };
  const config = searchConsoleConfig();
  if (!config.configured && !config.demo) return { status: "not-connected" };
  try {
    return { status: "ok", data: await pagePerformance(path) };
  } catch (error) {
    console.error("[search-console]", error);
    return { status: "error", message: error instanceof Error ? error.message : "Couldn't load Search Console data." };
  }
}
