import { timingSafeEqual } from "node:crypto";
import { revalidateTag } from "next/cache";
import { STRAPI_CACHE_TAG } from "@/lib/strapi";

/**
 * Called by Strapi after content is published, unpublished or deleted
 * (src/api/cms/services/site-refresh.js), so the site shows it on the next
 * request instead of after the 60 s cache. Needs REVALIDATE_SECRET, shared
 * with Strapi's SITE_REVALIDATE_SECRET.
 */
export async function POST(request: Request) {
  const secret = process.env.REVALIDATE_SECRET;
  const given = request.headers.get("x-revalidate-secret") ?? "";
  const valid =
    Boolean(secret) && given.length === secret!.length && timingSafeEqual(Buffer.from(given), Buffer.from(secret!));
  if (!valid) return Response.json({ ok: false }, { status: 401 });

  // expire: 0 — the next visitor gets fresh content, never the stale copy.
  revalidateTag(STRAPI_CACHE_TAG, { expire: 0 });
  return Response.json({ ok: true, revalidated: STRAPI_CACHE_TAG });
}
