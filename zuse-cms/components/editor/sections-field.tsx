"use client";

import { useEffect, useMemo, useState } from "react";
import { useFieldArray, useFormContext, useWatch } from "react-hook-form";
import { Plus, Search, Trash2 } from "lucide-react";
import { ConfirmButton } from "@/components/confirm-button";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { cloneValue, componentLabel, inSentence, newSection, summarize, type Field, type FormValues } from "@/lib/fields";
import { sectionInfo } from "@/lib/sections";
import { FOCUS_SECTION_EVENT, type FocusSectionDetail } from "@/components/preview/page-preview";
import { FieldsGrid } from "./fields-grid";
import { ItemCard } from "./item-card";
import { useResolver } from "./resolver-context";
import { SortableList } from "./sortable-list";
import { HIDDEN_FIELD, VisibilityButton } from "./visibility-button";
import { SectionHelpButton } from "@/components/help/help-drawer";

/** The page builder: an ordered list of sections (a Strapi dynamic zone). */
export function SectionsField({ field, name }: { field: Field; name: string }) {
  const resolver = useResolver();
  const { control, getFieldState, formState, setValue } = useFormContext();
  const { fields: items, insert, remove, move } = useFieldArray({ control, name, keyName: "_id" });
  const values = useWatch({ control, name }) as FormValues[] | undefined;
  const [open, setOpen] = useState<Set<string>>(new Set());
  const [pickerAt, setPickerAt] = useState<number | null>(null);

  // Page-builder wording for page sections; neutral wording for other zones (e.g. a project's slider).
  const isPage = (field.components ?? []).every((uid) => uid.startsWith("sections."));
  const addLabel = isPage ? "Add section" : `Add to ${inSentence(field.label)}`;

  const displayName = (uid: string) => componentLabel(resolver.component(uid)?.displayName, uid);

  const toggle = (key: string) =>
    setOpen((current) => {
      const next = new Set(current);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });

  const add = (uid: string, at: number) => {
    const section = newSection(uid, resolver);
    insert(at, section);
    setOpen((current) => new Set(current).add(String(section.__key)));
    setPickerAt(null);
  };

  // "Edit section" clicked in the preview: open that card and bring it into view.
  useEffect(() => {
    const onFocus = (event: Event) => {
      const { name: target, index } = (event as CustomEvent<FocusSectionDetail>).detail;
      const key = values?.[index]?.__key;
      if (target !== name || !key) return;
      setOpen((current) => new Set(current).add(String(key)));
      // Wait for the card to expand before scrolling.
      requestAnimationFrame(() =>
        requestAnimationFrame(() =>
          document.querySelector(`[data-section-key="${String(key)}"]`)?.scrollIntoView({ behavior: "smooth", block: "start" }),
        ),
      );
    };
    window.addEventListener(FOCUS_SECTION_EVENT, onFocus);
    return () => window.removeEventListener(FOCUS_SECTION_EVENT, onFocus);
  }, [name, values]);

  const allOpen = items.length > 0 && items.every((_, index) => open.has(String(values?.[index]?.__key)));

  return (
    <div className="grid grid-cols-[minmax(0,1fr)] gap-2">
      {items.length > 0 && (
        <div className="flex justify-end">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setOpen(allOpen ? new Set() : new Set((values ?? []).map((value) => String(value.__key))))}
          >
            {allOpen ? "Collapse all" : "Expand all"}
          </Button>
        </div>
      )}

      {items.length === 0 && (
        <div className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
          Nothing added yet.
        </div>
      )}

      <SortableList ids={items.map((item) => item._id)} onMove={move}>
        {(id, index, handle, dragging) => {
          const value = values?.[index];
          const uid = String(value?.__component ?? "");
          const key = String(value?.__key ?? id);
          const info = sectionInfo(uid);
          const invalid = getFieldState(`${name}.${index}`, formState).invalid;
          const fields = resolver.fieldsForComponent(uid);
          // "hidden" (Show on site) is the eye button, not a form field.
          const canHide = fields.some((sub) => sub.name === HIDDEN_FIELD);
          const hidden = value?.hidden === true;
          return (
            <div className="group/section scroll-mt-40" data-section-key={key}>
              <InsertButton onClick={() => setPickerAt(index)} />
              <ItemCard
                title={displayName(uid)}
                summary={summarize(fields, value)}
                hidden={hidden}
                actions={
                  <>
                    {isPage && <SectionHelpButton uid={uid} label={displayName(uid)} />}
                    {canHide && (
                      <VisibilityButton hidden={hidden} onToggle={() => setValue(`${name}.${index}.${HIDDEN_FIELD}`, !hidden, { shouldDirty: true })} />
                    )}
                  </>
                }
                icon={info.icon}
                index={index}
                total={items.length}
                open={open.has(key) || invalid}
                onToggle={() => toggle(key)}
                onMove={(to) => move(index, to)}
                onDuplicate={() => insert(index + 1, cloneValue(value ?? {}))}
                onRemove={() => remove(index)}
                handle={handle}
                dragging={dragging}
                invalid={invalid}
                removeButton={
                  <ConfirmButton
                    title={`Remove the ${inSentence(displayName(uid))} section?`}
                    description="Its content is removed from this page when you save."
                    confirmLabel="Remove section"
                    destructive
                    size="icon-sm"
                    onConfirm={() => remove(index)}
                  >
                    <Trash2 />
                    <span className="sr-only">Remove section</span>
                  </ConfirmButton>
                }
              >
                <FieldsGrid fields={fields.filter((sub) => sub.name !== HIDDEN_FIELD)} prefix={`${name}.${index}`} />
              </ItemCard>
            </div>
          );
        }}
      </SortableList>

      <div>
        <Button type="button" variant="outline" onClick={() => setPickerAt(items.length)}>
          <Plus /> {addLabel}
        </Button>
      </div>

      <SectionPicker
        open={pickerAt !== null}
        components={field.components ?? []}
        displayName={displayName}
        title={isPage ? "Add a section" : addLabel}
        description={isPage ? "Sections appear on the page in the order listed." : "Items appear in the order listed."}
        onClose={() => setPickerAt(null)}
        onPick={(uid) => add(uid, pickerAt ?? items.length)}
      />
    </div>
  );
}

/** Thin "+" between sections to insert one at that position. */
function InsertButton({ onClick }: { onClick: () => void }) {
  return (
    <div className="relative -my-1 flex h-3 items-center justify-center">
      <button
        type="button"
        onClick={onClick}
        aria-label="Insert a section here"
        className="z-10 flex size-5 items-center justify-center rounded-full border bg-background text-muted-foreground opacity-0 shadow-sm transition-opacity group-hover/section:opacity-100 hover:text-foreground focus-visible:opacity-100"
      >
        <Plus className="size-3" />
      </button>
    </div>
  );
}

function SectionPicker({
  open,
  components,
  displayName,
  title,
  description,
  onClose,
  onPick,
}: {
  open: boolean;
  components: string[];
  displayName: (uid: string) => string;
  title: string;
  description: string;
  onClose: () => void;
  onPick: (uid: string) => void;
}) {
  const [query, setQuery] = useState("");
  const matches = useMemo(() => {
    const q = query.trim().toLowerCase();
    return components.filter(
      (uid) => !q || displayName(uid).toLowerCase().includes(q) || sectionInfo(uid).description.toLowerCase().includes(q),
    );
  }, [components, displayName, query]);

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) {
          onClose();
          setQuery("");
        }
      }}
    >
      <DialogContent className="sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <div className="relative">
          <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search…" className="pl-8" autoFocus aria-label="Search" />
        </div>
        <ul className="grid max-h-[60vh] gap-2 overflow-y-auto sm:grid-cols-2">
          {matches.map((uid) => {
            const { icon: Icon, description } = sectionInfo(uid);
            return (
              <li key={uid}>
                <button
                  type="button"
                  onClick={() => {
                    onPick(uid);
                    setQuery("");
                  }}
                  className="flex h-full w-full items-start gap-3 rounded-lg border p-3 text-left outline-none hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/50"
                >
                  <Icon className="mt-0.5 size-5 shrink-0 text-muted-foreground" />
                  <span>
                    <span className="block text-sm font-medium">{displayName(uid)}</span>
                    <span className="block text-xs text-muted-foreground">{description}</span>
                  </span>
                </button>
              </li>
            );
          })}
          {matches.length === 0 && <li className="p-4 text-sm text-muted-foreground">No sections match “{query}”.</li>}
        </ul>
      </DialogContent>
    </Dialog>
  );
}
