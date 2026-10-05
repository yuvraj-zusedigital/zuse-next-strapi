import type { EntryStatus } from "@/lib/types";

/** The list view's filters and sort, kept in the URL (?q=&status=&sort=&page=). */
export type ListQuery = { q: string; status: EntryStatus | ""; sort: string; page: number };

export const STATUS_FILTERS: { value: EntryStatus | ""; label: string }[] = [
  { value: "", label: "All" },
  { value: "draft", label: "Draft" },
  { value: "published", label: "Published" },
  { value: "modified", label: "Modified" },
];

export const DEFAULT_SORT = "updatedAt:desc";

const one = (value: string | string[] | undefined) => (Array.isArray(value) ? value[0] : value) ?? "";

export function parseListQuery(params: Record<string, string | string[] | undefined>): ListQuery {
  const status = one(params.status);
  const sort = one(params.sort);
  return {
    q: one(params.q),
    status: STATUS_FILTERS.some((item) => item.value === status) ? (status as EntryStatus | "") : "",
    sort: /^[A-Za-z_][\w]*:(asc|desc)$/.test(sort) ? sort : DEFAULT_SORT,
    page: Math.max(1, Number(one(params.page)) || 1),
  };
}

/** URL for the list with some of the query changed; changing a filter or sort goes back to page 1. */
export function listHref(base: string, query: ListQuery, change: Partial<ListQuery> = {}) {
  const next = { ...query, page: 1, ...change };
  const search = new URLSearchParams();
  if (next.q) search.set("q", next.q);
  if (next.status) search.set("status", next.status);
  if (next.sort !== DEFAULT_SORT) search.set("sort", next.sort);
  if (next.page > 1) search.set("page", String(next.page));
  const qs = search.toString();
  return `${base}${qs ? `?${qs}` : ""}`;
}

/** Sort for a column header: first click picks the column's natural order, the next flips it. */
export function nextSort(current: string, field: string, firstOrder: "asc" | "desc") {
  const [currentField, order] = current.split(":");
  if (currentField !== field) return `${field}:${firstOrder}`;
  return `${field}:${order === "asc" ? "desc" : "asc"}`;
}

/** RFC 4180 CSV; cells starting with = + - @ are prefixed so spreadsheets don't run them as formulas. */
export function toCsv(rows: (string | number | null | undefined)[][]) {
  const cell = (value: string | number | null | undefined) => {
    let text = value == null ? "" : String(value);
    if (/^[=+\-@\t\r]/.test(text)) text = `'${text}`;
    return /[",\r\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
  };
  return rows.map((row) => row.map(cell).join(",")).join("\r\n");
}

export const STATUS_LABEL: Record<EntryStatus, string> = {
  draft: "Draft",
  published: "Published",
  modified: "Modified (unpublished changes)",
};
