import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Button, buttonVariants } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { activityHref, activityVerb, activityWho, timeAgo } from "@/lib/activity";
import { atLeast } from "@/lib/roles";
import { getMe, getSchema, listActivityPage } from "@/lib/strapi";
import type { ActivityAction } from "@/lib/types";

export const metadata: Metadata = { title: "Activity" };

const ACTIONS: { value: ActivityAction; label: string }[] = [
  { value: "create", label: "Created" },
  { value: "update", label: "Edited" },
  { value: "publish", label: "Published" },
  { value: "unpublish", label: "Unpublished" },
  { value: "discard", label: "Discarded changes" },
  { value: "delete", label: "Deleted" },
  { value: "upload", label: "Uploaded file" },
  { value: "media-update", label: "Edited file details" },
  { value: "media-delete", label: "Deleted file" },
  { value: "user-create", label: "Created account" },
  { value: "user-update", label: "Changed account" },
];

const SELECT =
  "h-9 rounded-md border border-input bg-transparent px-3 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50";
const dateFormat = new Intl.DateTimeFormat("en-AU", { dateStyle: "medium", timeStyle: "short" });
const one = (value: string | string[] | undefined) => (typeof value === "string" ? value : "");

/** The CMS audit log (Admins and up): who changed what, and when. */
export default async function ActivityPage({ searchParams }: PageProps<"/activity">) {
  const me = await getMe();
  if (!atLeast(me.role.type, "admin")) notFound();

  const params = await searchParams;
  const filters = { user: one(params.user), type: one(params.type), action: one(params.action) };
  const [schema, { data, meta }] = await Promise.all([
    getSchema(),
    listActivityPage({ ...filters, page: Number(params.page) || 1, pageSize: 50 }),
  ]);
  const { page, pageCount, total } = meta.pagination;

  const types = [
    ...schema.contentTypes.map((type) => ({ value: type.slug, label: type.displayName })),
    { value: "media", label: "Media files" },
    { value: "user", label: "Accounts" },
  ];
  const typeName = (slug: string) =>
    slug === "media" ? "file" : slug === "user" ? "" : (schema.contentTypes.find((type) => type.slug === slug)?.displayName.toLowerCase() ?? slug);

  const pageHref = (target: number) => {
    const search = new URLSearchParams(Object.entries(filters).filter(([, value]) => value));
    if (target > 1) search.set("page", String(target));
    const qs = search.toString();
    return `/activity${qs ? `?${qs}` : ""}`;
  };
  const filtered = Object.values(filters).some(Boolean);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Activity</h1>
        <p className="text-sm text-muted-foreground">
          Changes made in this CMS, newest first — {total} {total === 1 ? "entry" : "entries"}. Kept for a year.
        </p>
      </div>

      <form className="flex flex-wrap items-center gap-2">
        <select name="user" defaultValue={filters.user} className={SELECT} aria-label="Person">
          <option value="">Everyone</option>
          {(meta.people ?? []).map((email) => (
            <option key={email} value={email}>
              {email}
            </option>
          ))}
        </select>
        <select name="type" defaultValue={filters.type} className={SELECT} aria-label="Content type">
          <option value="">All content</option>
          {types.map((type) => (
            <option key={type.value} value={type.value}>
              {type.label}
            </option>
          ))}
        </select>
        <select name="action" defaultValue={filters.action} className={SELECT} aria-label="Action">
          <option value="">All actions</option>
          {ACTIONS.map((action) => (
            <option key={action.value} value={action.value}>
              {action.label}
            </option>
          ))}
        </select>
        <Button type="submit" variant="outline">
          Filter
        </Button>
        {filtered && (
          <Link href="/activity" className={buttonVariants({ variant: "ghost" })}>
            Clear
          </Link>
        )}
      </form>

      {data.length === 0 ? (
        <p className="rounded-lg border border-dashed p-10 text-center text-sm text-muted-foreground">
          {filtered ? "Nothing matches these filters." : "Nothing yet."}
        </p>
      ) : (
        <div className="rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Change</TableHead>
                <TableHead className="w-48">When</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((item, index) => {
                const href = activityHref(item);
                const label = item.targetType === "user" ? item.title || "an account" : `“${item.title || "Untitled"}”`;
                return (
                  <TableRow key={index}>
                    <TableCell className="whitespace-normal">
                      <span className="font-medium" title={item.userEmail ?? undefined}>
                        {activityWho(item)}
                      </span>{" "}
                      {activityVerb(item)} {typeName(item.targetType)}{" "}
                      {href ? (
                        <Link href={href} className="font-medium underline-offset-4 hover:underline">
                          {label}
                        </Link>
                      ) : (
                        <span className="font-medium">{label}</span>
                      )}
                      {item.count > 1 && <span className="text-muted-foreground"> ({item.count} saves)</span>}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      <time dateTime={item.at} title={dateFormat.format(new Date(item.at))}>
                        {timeAgo(item.at)}
                      </time>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}

      {pageCount > 1 && (
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>
            Page {page} of {pageCount}
          </span>
          <div className="flex gap-2">
            {page > 1 ? (
              <Link href={pageHref(page - 1)} className={buttonVariants({ variant: "outline", size: "sm" })}>
                Previous
              </Link>
            ) : (
              <Button variant="outline" size="sm" disabled>
                Previous
              </Button>
            )}
            {page < pageCount ? (
              <Link href={pageHref(page + 1)} className={buttonVariants({ variant: "outline", size: "sm" })}>
                Next
              </Link>
            ) : (
              <Button variant="outline" size="sm" disabled>
                Next
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
