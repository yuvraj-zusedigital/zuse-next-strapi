"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowDown, ArrowUp, ArrowUpDown, Download, Loader2, Send, Trash2, Undo2, X } from "lucide-react";
import { toast } from "sonner";
import { ConfirmButton } from "@/components/confirm-button";
import { useCan } from "@/components/role-context";
import { StatusBadge } from "@/components/status-badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { LIST_COLUMNS } from "@/lib/list-columns";
import { STATUS_LABEL, toCsv } from "@/lib/list-query";
import type { EntrySummary } from "@/lib/types";
import { cn } from "@/lib/utils";
import { bulkAction, type BulkResult } from "./actions";

type Row = EntrySummary & { updatedLabel: string };
type SortColumn = { href: string; direction: "asc" | "desc" | null };

const entries = (count: number) => `${count} ${count === 1 ? "entry" : "entries"}`;

function SortHeader({ label, sort, className }: { label: string; sort: SortColumn; className?: string }) {
  const Icon = sort.direction === "asc" ? ArrowUp : sort.direction === "desc" ? ArrowDown : ArrowUpDown;
  return (
    <TableHead className={className} aria-sort={sort.direction === "asc" ? "ascending" : sort.direction === "desc" ? "descending" : "none"}>
      <Link href={sort.href} className="-mx-1 inline-flex items-center gap-1 rounded px-1 hover:text-foreground">
        {label}
        <Icon className={cn("size-3.5", !sort.direction && "opacity-40")} />
      </Link>
    </TableHead>
  );
}

const Check = (props: React.ComponentProps<"input">) => (
  <input type="checkbox" className="relative z-10 size-4 cursor-pointer accent-primary align-middle" {...props} />
);

/** The list view's table: sortable columns, row selection and bulk actions. */
export function EntryTable({
  slug,
  draftAndPublish,
  rows,
  emptyMessage,
  sort,
  display,
}: {
  slug: string;
  draftAndPublish: boolean;
  rows: Row[];
  emptyMessage: string;
  sort: { title: SortColumn | null; updatedAt: SortColumn };
  /** Extra columns and how the title shows (lib/list-columns.ts). */
  display?: (typeof LIST_COLUMNS)[string];
}) {
  const extraColumns = display?.columns ?? [];
  const titleLabel = display?.titleLabel ?? "Title";
  const router = useRouter();
  const canDelete = useCan("admin");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [running, setRunning] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  // Drop selections that left the page (after a refresh, filter or page change).
  const visible = new Set(rows.map((row) => row.documentId));
  const chosen = rows.filter((row) => selected.has(row.documentId));
  const allChosen = rows.length > 0 && chosen.length === rows.length;

  const toggle = (id: string) =>
    setSelected((current) => {
      const next = new Set([...current].filter((item) => visible.has(item)));
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  const toggleAll = () => setSelected(allChosen ? new Set() : new Set(rows.map((row) => row.documentId)));

  const canPublish = chosen.filter((row) => row.status !== "published");
  const canUnpublish = chosen.filter((row) => row.status !== "draft");

  const run = (action: "publish" | "unpublish" | "delete", targets: Row[]) => {
    const verb = { publish: "Published", unpublish: "Unpublished", delete: "Deleted" }[action];
    setRunning(action);
    startTransition(async () => {
      let result: BulkResult;
      try {
        result = await bulkAction(slug, targets.map((row) => row.documentId), action);
      } catch {
        toast.error("Something went wrong. Nothing more was changed.");
        setRunning(null);
        return;
      }
      if (result.done) toast.success(`${verb} ${entries(result.done)}`);
      if (result.failed.length) {
        const names = result.failed
          .map((failure) => rows.find((row) => row.documentId === failure.documentId)?.title || "Untitled")
          .slice(0, 3)
          .join(", ");
        toast.error(`${result.failed.length} couldn't be ${verb.toLowerCase()}: ${names}`, {
          description: result.failed[0].message,
        });
      }
      setSelected(new Set(result.failed.map((failure) => failure.documentId)));
      setRunning(null);
      router.refresh();
    });
  };

  const exportSelected = () => {
    const csv = toCsv([
      [titleLabel, ...extraColumns.map((column) => column.label), ...(draftAndPublish ? ["Status"] : []), "Last updated", "Edit link", "ID"],
      ...chosen.map((row) => [
        row.title,
        ...extraColumns.map((column) => row.columns?.[column.field] ?? ""),
        ...(draftAndPublish ? [STATUS_LABEL[row.status]] : []),
        row.updatedAt,
        `${location.origin}/${slug}/${row.documentId}`,
        row.documentId,
      ]),
    ]);
    const url = URL.createObjectURL(new Blob([`﻿${csv}`], { type: "text/csv;charset=utf-8" }));
    const link = Object.assign(document.createElement("a"), { href: url, download: `${slug}-selected.csv` });
    link.click();
    URL.revokeObjectURL(url);
  };

  const busy = running !== null;
  const spinner = (action: string, Icon: typeof Send) => (running === action ? <Loader2 className="animate-spin" /> : <Icon />);
  const columns = 3 + extraColumns.length + (draftAndPublish ? 1 : 0);

  return (
    <>
      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-10">
                <Check
                  checked={allChosen}
                  ref={(input) => {
                    if (input) input.indeterminate = chosen.length > 0 && !allChosen;
                  }}
                  onChange={toggleAll}
                  disabled={!rows.length}
                  aria-label="Select all on this page"
                />
              </TableHead>
              {sort.title ? <SortHeader label={titleLabel} sort={sort.title} /> : <TableHead>{titleLabel}</TableHead>}
              {extraColumns.map((column) => (
                <TableHead key={column.field}>{column.label}</TableHead>
              ))}
              {draftAndPublish && <TableHead className="w-32">Status</TableHead>}
              <SortHeader label="Last updated" sort={sort.updatedAt} className="w-48" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.length === 0 && (
              <TableRow>
                <TableCell colSpan={columns} className="py-10 text-center text-muted-foreground">
                  {emptyMessage}
                </TableCell>
              </TableRow>
            )}
            {rows.map((entry) => (
              <TableRow key={entry.documentId} className="relative" data-state={selected.has(entry.documentId) ? "selected" : undefined}>
                <TableCell>
                  <Check
                    checked={selected.has(entry.documentId)}
                    onChange={() => toggle(entry.documentId)}
                    aria-label={`Select ${entry.title || "Untitled"}`}
                  />
                </TableCell>
                <TableCell className="font-medium">
                  {/* The link's ::after covers the row, so the whole row is clickable (the checkbox sits above it). */}
                  <Link href={`/${slug}/${entry.documentId}`} className="after:absolute after:inset-0 hover:underline">
                    {!entry.title ? (
                      <span className="text-muted-foreground">Untitled</span>
                    ) : display?.titleAsToken ? (
                      <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-[0.85em]">{`{${entry.title}}`}</code>
                    ) : (
                      entry.title
                    )}
                  </Link>
                </TableCell>
                {extraColumns.map((column) => (
                  <TableCell key={column.field} className="max-w-72 truncate text-muted-foreground" title={entry.columns?.[column.field] ?? undefined}>
                    {entry.columns?.[column.field] || <span className="opacity-50">—</span>}
                  </TableCell>
                ))}
                {draftAndPublish && (
                  <TableCell>
                    <StatusBadge status={entry.status} />
                  </TableCell>
                )}
                <TableCell className="text-muted-foreground">{entry.updatedLabel}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {chosen.length > 0 && (
        <div
          role="toolbar"
          aria-label="Bulk actions"
          className="cms-glass sticky bottom-4 z-20 mx-auto flex w-fit max-w-full animate-in flex-wrap items-center gap-1.5 rounded-xl border p-1.5 pl-3 shadow-lg duration-200 fade-in slide-in-from-bottom-2"
        >
          <span className="mr-1 text-sm font-medium">{chosen.length} selected</span>
          {draftAndPublish && (
            <>
              <Button size="sm" disabled={busy || !canPublish.length} onClick={() => run("publish", canPublish)} title="Publish drafts and unpublished changes">
                {spinner("publish", Send)} Publish{canPublish.length !== chosen.length && canPublish.length ? ` ${canPublish.length}` : ""}
              </Button>
              <ConfirmButton
                variant="outline"
                size="sm"
                disabled={busy || !canUnpublish.length}
                title={`Unpublish ${entries(canUnpublish.length)}?`}
                description="They'll be taken off the live site but kept here as drafts."
                confirmLabel="Unpublish"
                onConfirm={() => run("unpublish", canUnpublish)}
              >
                {spinner("unpublish", Undo2)} Unpublish
              </ConfirmButton>
            </>
          )}
          <Button size="sm" variant="outline" disabled={busy} onClick={exportSelected}>
            <Download /> Export CSV
          </Button>
          {canDelete && (
            <ConfirmButton
              variant="outline"
              size="sm"
              destructive
              disabled={busy}
              title={`Delete ${entries(chosen.length)}?`}
              description="They'll be removed from the CMS and the live site. This can't be undone."
              confirmLabel="Delete"
              onConfirm={() => run("delete", chosen)}
            >
              {spinner("delete", Trash2)} Delete
            </ConfirmButton>
          )}
          <Button size="icon-sm" variant="ghost" disabled={busy} onClick={() => setSelected(new Set())} aria-label="Clear selection">
            <X />
          </Button>
        </div>
      )}
    </>
  );
}
