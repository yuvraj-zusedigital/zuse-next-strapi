"use client";

import { useState, useSyncExternalStore } from "react";
import { useFormContext, useWatch } from "react-hook-form";
import { ChevronRight, Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { inSentence, newComponentValue, summarize, type Field } from "@/lib/fields";
import { cn } from "@/lib/utils";
import { FieldsGrid } from "./fields-grid";
import { useResolver } from "./resolver-context";
import { SeoPanel, SeoSummary } from "./seo-panel";
import { HIDDEN_FIELD, VisibilityButton } from "./visibility-button";

/** Components with more fields than this start closed (e.g. SEO); small ones (a button link) start open. */
const OPEN_BY_DEFAULT_MAX_FIELDS = 5;
const storageKey = (component: string) => `cms-open:${component}`;
const noSubscription = () => () => {};

/** The last open/closed choice for this kind of component, remembered in the browser. */
function rememberedOpen(component: string): boolean | null {
  try {
    const value = localStorage.getItem(storageKey(component));
    return value === null ? null : value === "1";
  } catch {
    return null;
  }
}

/** A single (non-repeatable) component, e.g. a button link or the SEO block: collapsible like a section card. */
export function ComponentField({ field, name }: { field: Field; name: string }) {
  const resolver = useResolver();
  const { control, setValue, getFieldState, formState } = useFormContext();
  const value = useWatch({ control, name });
  const allFields = resolver.fieldsForComponent(field.component!);
  // "hidden" is the eye button, not a form field.
  const canHide = allFields.some((sub) => sub.name === HIDDEN_FIELD);
  const fields = allFields.filter((sub) => sub.name !== HIDDEN_FIELD);
  const isSeo = field.component === "shared.seo";

  // Remembered choice (browser only, so server and first client render agree), else the default by size.
  const remembered = useSyncExternalStore(
    noSubscription,
    () => rememberedOpen(field.component!),
    () => null,
  );
  const [chosen, setChosen] = useState<boolean | null>(null);
  const open = chosen ?? remembered ?? fields.filter((sub) => !sub.hiddenInForm).length <= OPEN_BY_DEFAULT_MAX_FIELDS;
  const toggle = () => {
    const next = !open;
    setChosen(next);
    try {
      localStorage.setItem(storageKey(field.component!), next ? "1" : "0");
    } catch {
      // Private mode etc.: just not remembered.
    }
  };

  if (!value) {
    return (
      <div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => {
            setValue(name, newComponentValue(field.component!, resolver), { shouldDirty: true });
            setChosen(true); // just added: show its fields
          }}
        >
          <Plus /> Add {inSentence(field.label)}
        </Button>
      </div>
    );
  }

  const hidden = value?.[HIDDEN_FIELD] === true;
  // Errors inside always show.
  const invalid = getFieldState(name, formState).invalid;
  const expanded = open || invalid;
  const summary = summarize(fields, value);

  return (
    <div
      className={cn(
        "relative min-w-0 rounded-lg border bg-muted/30",
        hidden && "border-dashed",
        invalid && "border-destructive/60",
      )}
    >
      <div className="flex items-center gap-1 p-1.5 pl-1">
        <button
          type="button"
          onClick={toggle}
          aria-expanded={expanded}
          aria-label={`${expanded ? "Collapse" : "Expand"} ${inSentence(field.label)}`}
          className="flex min-w-0 flex-1 items-center gap-2 rounded px-1 py-1 text-left hover:bg-muted/60"
        >
          <ChevronRight className={cn("size-4 shrink-0 text-muted-foreground transition-transform", expanded && "rotate-90")} />
          {isSeo ? (
            <SeoSummary name={name} />
          ) : summary ? (
            <span className="min-w-0 truncate text-sm text-muted-foreground">{summary}</span>
          ) : (
            <span className="text-sm text-muted-foreground">{expanded ? "Hide details" : "Show details"}</span>
          )}
          {hidden && <span className="shrink-0 rounded bg-muted px-1.5 py-0.5 text-[11px] font-medium text-muted-foreground">Hidden</span>}
          {invalid && <span className="ml-auto shrink-0 text-xs text-destructive">Needs attention</span>}
        </button>
        <div className="flex shrink-0 items-center">
          {canHide && (
            <VisibilityButton hidden={hidden} onToggle={() => setValue(`${name}.${HIDDEN_FIELD}`, !hidden, { shouldDirty: true })} />
          )}
          {!field.required && (
            <Button
              type="button"
              size="icon-sm"
              variant="ghost"
              aria-label={`Remove ${inSentence(field.label)}`}
              onClick={() => setValue(name, null, { shouldDirty: true })}
            >
              <X />
            </Button>
          )}
        </div>
      </div>
      {expanded && (
        <div className="border-t p-4">
          {isSeo && <SeoPanel name={name} />}
          <div className={cn(hidden && "opacity-60")}>
            <FieldsGrid fields={fields} prefix={name} />
          </div>
        </div>
      )}
    </div>
  );
}
