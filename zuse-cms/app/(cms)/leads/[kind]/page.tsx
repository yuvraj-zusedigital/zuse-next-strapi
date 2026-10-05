import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Download, X } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatDuration, isLeadKind, LEAD_KINDS } from "@/lib/leads";
import { atLeast } from "@/lib/roles";
import { getMe, listLeads } from "@/lib/strapi";
import type { LeadKind, LeadSummary } from "@/lib/types";

export async function generateMetadata({ params }: PageProps<"/leads/[kind]">): Promise<Metadata> {
  const { kind } = await params;
  return { title: isLeadKind(kind) ? LEAD_KINDS[kind].title : "Leads" };
}

const one = (value: string | string[] | undefined) => (typeof value === "string" ? value : "");
const muted = <span className="text-muted-foreground">—</span>;

type Column = { label: string; className?: string; cell: (lead: LeadSummary) => React.ReactNode };

/** Columns per list; the first is the link to the lead. */
const COLUMNS: Record<LeadKind, Column[]> = {
  submissions: [
    { label: "Name", cell: (lead) => lead.name || lead.email || "No name" },
    { label: "Email", cell: (lead) => lead.email || muted },
    { label: "Budget", className: "hidden lg:table-cell", cell: (lead) => lead.budget || muted },
    { label: "Location", className: "hidden xl:table-cell", cell: (lead) => lead.location || muted },
    {
      label: "Visit",
      className: "hidden md:table-cell",
      cell: (lead) => (lead.pages ? `${lead.pages} ${lead.pages === 1 ? "page" : "pages"} · ${formatDuration(lead.seconds)}` : muted),
    },
  ],
  subscribers: [
    { label: "Name", cell: (lead) => lead.name || lead.email || "No name" },
    { label: "Email", cell: (lead) => lead.email || muted },
    { label: "Location", className: "hidden lg:table-cell", cell: (lead) => lead.location || muted },
  ],
  tracking: [
    { label: "Visitor", cell: (lead) => lead.submission?.name || lead.email || `Visitor #${lead.id}` },
    { label: "Pages", className: "w-24", cell: (lead) => lead.pages },
    { label: "Time on site", className: "w-32", cell: (lead) => formatDuration(lead.seconds) },
    {
      label: "Form submission",
      className: "hidden md:table-cell",
      cell: (lead) =>
        lead.submission ? (
          // Above the row link, so it opens the submission rather than this record.
          <Link href={`/leads/submissions/${lead.submission.id}`} className="relative z-10 text-primary hover:underline">
            {lead.submission.name || `#${lead.submission.id}`}
          </Link>
        ) : (
          muted
        ),
    },
  ],
};

/** Form submissions, subscribers or visitor tracking (Admins only: personal data). */
export default async function LeadsPage({ params, searchParams }: PageProps<"/leads/[kind]">) {
  const { kind } = await params;
  if (!isLeadKind(kind)) notFound();
  const me = await getMe();
  if (!atLeast(me.role.type, "admin")) notFound();

  const search = await searchParams;
  const q = one(search.q);
  const { data, meta } = await listLeads(kind, { q, page: Number(one(search.page)) || 1, pageSize: 25 });
  const { page, pageCount, total } = meta.pagination;
  const info = LEAD_KINDS[kind];
  const columns = COLUMNS[kind];
  const dateFormat = new Intl.DateTimeFormat("en-AU", { dateStyle: "medium", timeStyle: "short", timeZone: me.timezone ?? undefined });

  const href = (target: { q?: string; page?: number }) => {
    const next = new URLSearchParams();
    const query = target.q ?? q;
    if (query) next.set("q", query);
    if ((target.page ?? 1) > 1) next.set("page", String(target.page));
    const qs = next.toString();
    return `/leads/${kind}${qs ? `?${qs}` : ""}`;
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">{info.title}</h1>
          <p className="text-sm text-muted-foreground">
            {info.description} {total} {total === 1 ? "record" : "records"}
            {q && " found"}.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <form className="flex gap-2" action={`/leads/${kind}`}>
            <Input
              name="q"
              type="search"
              defaultValue={q}
              placeholder={kind === "submissions" ? "Search name, email, phone, message…" : "Search name or email…"}
              className="w-56 sm:w-72"
            />
            <Button type="submit" variant="outline">
              Search
            </Button>
          </form>
          {q && (
            <Link href={`/leads/${kind}`} className={buttonVariants({ variant: "ghost" })}>
              <X /> Clear
            </Link>
          )}
          <a
            href={`/leads/${kind}/export${q ? `?q=${encodeURIComponent(q)}` : ""}`}
            download
            className={buttonVariants({ variant: "outline" })}
            title={q ? "Download the records matching this search" : "Download every record"}
          >
            <Download /> Export CSV
          </a>
        </div>
      </div>

      {search.deleted && (
        <Alert>
          <AlertDescription>Deleted.</AlertDescription>
        </Alert>
      )}

      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map((column) => (
                <TableHead key={column.label} className={column.className}>
                  {column.label}
                </TableHead>
              ))}
              <TableHead className="w-44">{kind === "subscribers" ? "Signed up" : "Received"}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.length === 0 && (
              <TableRow>
                <TableCell colSpan={columns.length + 1} className="py-10 text-center text-muted-foreground">
                  {q ? `Nothing matches “${q}”.` : info.empty}
                </TableCell>
              </TableRow>
            )}
            {data.map((lead) => (
              <TableRow key={lead.id} className="relative">
                {columns.map((column, index) => (
                  <TableCell key={column.label} className={index === 0 ? "font-medium" : column.className}>
                    {index === 0 ? (
                      // The link's ::after covers the row, so the whole row opens the lead.
                      <Link href={`/leads/${kind}/${lead.id}`} className="after:absolute after:inset-0 hover:underline">
                        {column.cell(lead)}
                      </Link>
                    ) : (
                      column.cell(lead)
                    )}
                  </TableCell>
                ))}
                <TableCell className="text-muted-foreground">{dateFormat.format(new Date(lead.createdAt))}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {pageCount > 1 && (
        <div className="flex items-center justify-end gap-2 text-sm">
          <span className="text-muted-foreground">
            Page {page} of {pageCount}
          </span>
          {page > 1 ? (
            <Link href={href({ page: page - 1 })} className={buttonVariants({ variant: "outline", size: "sm" })}>
              Previous
            </Link>
          ) : (
            <Button variant="outline" size="sm" disabled>
              Previous
            </Button>
          )}
          {page < pageCount ? (
            <Link href={href({ page: page + 1 })} className={buttonVariants({ variant: "outline", size: "sm" })}>
              Next
            </Link>
          ) : (
            <Button variant="outline" size="sm" disabled>
              Next
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
