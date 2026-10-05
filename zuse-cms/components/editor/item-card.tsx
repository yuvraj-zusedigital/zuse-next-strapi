"use client";

import { ArrowDown, ArrowUp, ChevronRight, Copy, Trash2, type LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Props = {
  title: string;
  summary?: string;
  icon?: LucideIcon;
  index: number;
  total: number;
  open: boolean;
  onToggle: () => void;
  onMove: (to: number) => void;
  onDuplicate: () => void;
  onRemove: () => void;
  /** Drag handle from <SortableList>. */
  handle: React.ReactNode;
  dragging: boolean;
  invalid?: boolean;
  /** Replaces the default remove button, e.g. with a confirm. */
  removeButton?: React.ReactNode;
  /** Extra buttons before the move/duplicate/remove buttons (e.g. show/hide). */
  actions?: React.ReactNode;
  /** Switched off on the site: the card is dimmed and labelled. */
  hidden?: boolean;
  children: React.ReactNode;
};

/** Collapsible card for one item of a list (a section, or a repeatable component item). */
export function ItemCard(props: Props) {
  const { title, summary, icon: Icon, index, total, open, onToggle, onMove, onDuplicate, onRemove, handle, dragging, invalid, removeButton, actions, hidden, children } = props;

  return (
    <div
      className={cn(
        "rounded-lg border bg-card",
        hidden && "border-dashed bg-muted/40",
        dragging && "shadow-lg ring-2 ring-ring/40",
        invalid && "border-destructive/60",
      )}
    >
      <div className="flex items-center gap-1 p-1.5 pl-1">
        {handle}
        <button
          type="button"
          onClick={onToggle}
          aria-expanded={open}
          data-hint={open ? `Collapse “${title}”` : `Expand “${title}” to edit it`}
          className="flex min-w-0 flex-1 items-center gap-2 rounded px-1 py-1 text-left hover:bg-muted/60"
        >
          <ChevronRight className={cn("size-4 shrink-0 text-muted-foreground transition-transform", open && "rotate-90")} />
          {Icon && <Icon className="size-4 shrink-0 text-muted-foreground" />}
          <span className={cn("shrink-0 text-sm font-medium", hidden && "text-muted-foreground line-through decoration-muted-foreground/50")}>{title}</span>
          {hidden && <span className="shrink-0 rounded bg-muted px-1.5 py-0.5 text-[11px] font-medium text-muted-foreground">Hidden</span>}
          {summary && <span className={cn("min-w-0 truncate text-sm text-muted-foreground", hidden && "opacity-60")}>{summary}</span>}
          {invalid && <span className="ml-auto shrink-0 text-xs text-destructive">Needs attention</span>}
        </button>
        <div className="flex shrink-0 items-center">
          {actions}
          <Button type="button" size="icon-sm" variant="ghost" aria-label={`Move “${title}” up`} disabled={index === 0} onClick={() => onMove(index - 1)}>
            <ArrowUp />
          </Button>
          <Button type="button" size="icon-sm" variant="ghost" aria-label={`Move “${title}” down`} disabled={index === total - 1} onClick={() => onMove(index + 1)}>
            <ArrowDown />
          </Button>
          <Button type="button" size="icon-sm" variant="ghost" aria-label={`Duplicate “${title}”`} onClick={onDuplicate}>
            <Copy />
          </Button>
          {removeButton ?? (
            <Button type="button" size="icon-sm" variant="ghost" aria-label={`Remove “${title}”`} onClick={onRemove}>
              <Trash2 />
            </Button>
          )}
        </div>
      </div>
      {open && <div className="border-t p-4">{children}</div>}
    </div>
  );
}
