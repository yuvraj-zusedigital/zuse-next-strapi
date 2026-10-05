import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Download, Plus, X } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LIST_COLUMNS } from "@/lib/list-columns";
import { DEFAULT_SORT, listHref, nextSort, parseListQuery, STATUS_FILTERS, type ListQuery } from "@/lib/list-query";
import { getAiStatus, getContentType, listEntries } from "@/lib/strapi";
import { cn } from "@/lib/utils";
import { AiDraftButton } from "./ai-draft-button";
import { EditorPage } from "./editor-page";
import { EntryTable } from "./entry-table";

function PageLink({ href, children }: { href: string | null; children: React.ReactNode }) {
  if (!href) {
    return (
      <Button variant="outline" size="sm" disabled>
        {children}
      </Button>
    );
  }
  return (
    <Link href={href} className={buttonVariants({ variant: "outline", size: "sm" })}>
      {children}
    </Link>
  );
}

const dateFormat = new Intl.DateTimeFormat("en-AU", { dateStyle: "medium", timeStyle: "short" });

export async function generateMetadata({ params }: PageProps<"/[type]">): Promise<Metadata> {
  const type = await getContentType((await params).type);
  return { title: type?.displayName };
}

export default async function ListPage({ params, searchParams }: PageProps<"/[type]">) {
  const { type: slug } = await params;
  const search = await searchParams;

  const type = await getContentType(slug);
  if (!type) notFound();

  // Single types (Header & Footer, Organization Settings) have one entry: edit it directly.
  if (type.kind === "singleType") return <EditorPage slug={slug} documentId={null} />;

  const query = parseListQuery(search);
  const ai = slug === "page" ? await getAiStatus() : null;
  const display = LIST_COLUMNS[slug];
  const { data, meta } = await listEntries(slug, {
    columns: display?.columns.map((column) => column.field).join(","),
    q: query.q,
    status: type.draftAndPublish ? query.status : "",
    sort: query.sort,
    page: query.page,
    pageSize: 25,
  });
  const { page: current, pageCount, total } = meta.pagination;

  const base = `/${slug}`;
  const href = (change: Partial<ListQuery>) => listHref(base, query, change);
  const [sortField, sortOrder] = query.sort.split(":") as [string, "asc" | "desc"];
  const column = (field: string, firstOrder: "asc" | "desc") => ({
    href: href({ sort: nextSort(query.sort, field, firstOrder) }),
    direction: sortField === field ? sortOrder : null,
  });
  const filtered = Boolean(query.q || query.status);
  const statusLabel = STATUS_FILTERS.find((item) => item.value === query.status)?.label.toLowerCase();
  const exportQuery = listHref("", query, { page: 1 });

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">{type.displayName}</h1>
          {display?.intro && <p className="max-w-2xl text-sm text-muted-foreground">{display.intro}</p>}
          <p className="text-sm text-muted-foreground">
            {total} {total === 1 ? "entry" : "entries"}
            {filtered && " found"}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {type.mainField && (
            <form className="flex gap-2" action={base}>
              {query.status && <input type="hidden" name="status" value={query.status} />}
              {query.sort !== DEFAULT_SORT && <input type="hidden" name="sort" value={query.sort} />}
              <Input name="q" type="search" defaultValue={query.q} placeholder={`Search ${type.displayName.toLowerCase()}…`} className="w-56 sm:w-64" />
              <Button type="submit" variant="outline">
                Search
              </Button>
            </form>
          )}
          {ai && <AiDraftButton available={ai.pageDraft} />}
          <Link href={`/${slug}/new`} className={buttonVariants()}>
            <Plus /> New {type.displayName.toLowerCase()}
          </Link>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        {type.draftAndPublish ? (
          <nav aria-label="Filter by status" className="inline-flex flex-wrap rounded-lg bg-muted p-0.5 text-sm">
            {STATUS_FILTERS.map((item) => {
              const active = query.status === item.value;
              return (
                <Link
                  key={item.value || "all"}
                  href={href({ status: item.value })}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "rounded-md px-3 py-1 transition-colors",
                    active ? "bg-card font-medium text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        ) : (
          <span />
        )}
        <div className="flex items-center gap-2">
          {filtered && (
            <Link href={href({ q: "", status: "" })} className={buttonVariants({ variant: "ghost", size: "sm" })}>
              <X /> Clear filters
            </Link>
          )}
          <a
            href={`${base}/export${exportQuery}`}
            download
            className={buttonVariants({ variant: "outline", size: "sm" })}
            title={filtered ? "Download the entries matching these filters" : "Download every entry"}
          >
            <Download /> Export CSV
          </a>
        </div>
      </div>

      {search.deleted && (
        <Alert>
          <AlertDescription>Entry deleted.</AlertDescription>
        </Alert>
      )}

      <EntryTable
        key={`${query.q}|${query.status}|${query.sort}|${current}`}
        slug={slug}
        draftAndPublish={Boolean(type.draftAndPublish)}
        rows={data.map((entry) => ({ ...entry, updatedLabel: dateFormat.format(new Date(entry.updatedAt)) }))}
        emptyMessage={
          query.q
            ? `Nothing matches “${query.q}”${statusLabel && query.status ? ` in ${statusLabel}` : ""}.`
            : query.status
              ? `No ${statusLabel} entries.`
              : "No entries yet."
        }
        sort={{ title: type.mainField ? column(type.mainField, "asc") : null, updatedAt: column("updatedAt", "desc") }}
        display={display}
      />

      {pageCount > 1 && (
        <div className="flex items-center justify-end gap-2 text-sm">
          <span className="text-muted-foreground">
            Page {current} of {pageCount}
          </span>
          <PageLink href={current > 1 ? href({ page: current - 1 }) : null}>Previous</PageLink>
          <PageLink href={current < pageCount ? href({ page: current + 1 }) : null}>Next</PageLink>
        </div>
      )}
    </div>
  );
}
