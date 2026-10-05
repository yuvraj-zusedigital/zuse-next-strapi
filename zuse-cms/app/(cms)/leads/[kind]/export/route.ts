import type { NextRequest } from "next/server";
import { formatDuration, isLeadKind } from "@/lib/leads";
import { toCsv } from "@/lib/list-query";
import { atLeast } from "@/lib/roles";
import { getMe, listLeads } from "@/lib/strapi";
import type { LeadKind, LeadSummary } from "@/lib/types";

const COLUMNS: Record<LeadKind, [string, (lead: LeadSummary) => string | number | null | undefined][]> = {
  submissions: [
    ["Name", (lead) => lead.name],
    ["Email", (lead) => lead.email],
    ["Phone", (lead) => lead.phone],
    ["Budget", (lead) => lead.budget],
    ["Heard about us", (lead) => lead.hearAboutUs],
    ["Location", (lead) => lead.location],
    ["Pages viewed", (lead) => lead.pages],
    ["Time on site", (lead) => formatDuration(lead.seconds)],
  ],
  subscribers: [
    ["Name", (lead) => lead.name],
    ["Email", (lead) => lead.email],
    ["Location", (lead) => lead.location],
  ],
  tracking: [
    ["Email", (lead) => lead.email],
    ["Pages viewed", (lead) => lead.pages],
    ["Time on site", (lead) => formatDuration(lead.seconds)],
    ["Form submission", (lead) => lead.submission?.name],
  ],
};

/** CSV of every record in a lead list (Admins), matching the current search. Messages are on each submission's page. */
export async function GET(request: NextRequest, ctx: RouteContext<"/leads/[kind]/export">) {
  const { kind } = await ctx.params;
  if (!isLeadKind(kind)) return new Response("Not found", { status: 404 });
  const me = await getMe();
  if (!atLeast(me.role.type, "admin")) return new Response("Not found", { status: 404 });

  const q = request.nextUrl.searchParams.get("q") ?? "";
  const columns = COLUMNS[kind];
  const origin = request.nextUrl.origin;
  const rows: (string | number | null | undefined)[][] = [[...columns.map(([label]) => label), "Received", "Link"]];

  for (let page = 1; page <= 100; page++) {
    const { data, meta } = await listLeads(kind, { q, page, pageSize: 100 });
    for (const lead of data) rows.push([...columns.map(([, value]) => value(lead)), lead.createdAt, `${origin}/leads/${kind}/${lead.id}`]);
    if (page >= meta.pagination.pageCount) break;
  }

  const date = new Date().toISOString().slice(0, 10);
  return new Response(`﻿${toCsv(rows)}`, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${kind}-${date}.csv"`,
      "Cache-Control": "no-store",
    },
  });
}
