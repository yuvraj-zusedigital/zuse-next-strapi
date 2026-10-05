import type { NextRequest } from "next/server";
import { getContentType, listEntries } from "@/lib/strapi";
import { parseListQuery, STATUS_LABEL, toCsv } from "@/lib/list-query";

/** CSV of every entry matching the list's current search, status filter and sort. */
export async function GET(request: NextRequest, ctx: RouteContext<"/[type]/export">) {
  const { type: slug } = await ctx.params;
  const type = await getContentType(slug);
  if (!type || type.kind !== "collectionType") return new Response("Not found", { status: 404 });

  const query = parseListQuery(Object.fromEntries(request.nextUrl.searchParams));
  const rows: (string | null)[][] = [["Title", ...(type.draftAndPublish ? ["Status"] : []), "Last updated", "Edit link", "ID"]];
  const origin = request.nextUrl.origin;

  for (let page = 1; page <= 50; page++) {
    const { data, meta } = await listEntries(slug, { q: query.q, status: query.status, sort: query.sort, page, pageSize: 100 });
    for (const entry of data) {
      rows.push([
        entry.title,
        ...(type.draftAndPublish ? [STATUS_LABEL[entry.status]] : []),
        entry.updatedAt,
        `${origin}/${slug}/${entry.documentId}`,
        entry.documentId,
      ]);
    }
    if (page >= meta.pagination.pageCount) break;
  }

  const date = new Date().toISOString().slice(0, 10);
  // BOM so Excel reads UTF-8 (e.g. en dashes in titles) correctly.
  return new Response(`﻿${toCsv(rows)}`, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${slug}-${date}.csv"`,
      "Cache-Control": "no-store",
    },
  });
}
