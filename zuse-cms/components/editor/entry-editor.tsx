"use client";

import { useCallback, useEffect, useMemo, useRef, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormProvider, useForm, useWatch, type Control } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { savedMessage } from "@/lib/save-messages";
import { ArrowLeft, Columns2, Eye, Loader2, PanelLeft } from "lucide-react";
import { ConfirmButton } from "@/components/confirm-button";
import { useCan } from "@/components/role-context";
import { FOCUS_SECTION_EVENT, PagePreview } from "@/components/preview/page-preview";
import { StatusBadge } from "@/components/status-badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { deleteEntry, saveEntry, transitionEntry, type ActionResult } from "@/app/(cms)/[type]/actions";
import { createResolver, formSchema, toFormValues, toPayload, type Field, type FormValues, type Resolver } from "@/lib/fields";
import type { ComponentSchema, ContentTypeSchema, Entry, EntryStatus } from "@/lib/types";
import { cn } from "@/lib/utils";
import { BlogTools } from "./blog-tools";
import { FieldsGrid } from "./fields-grid";
import { EntryInfoProvider } from "./entry-context";
import { ResolverProvider } from "./resolver-context";

type Props = {
  type: ContentTypeSchema;
  /** CMS slug → title attribute, for labelling relation options. */
  mainFields: Record<string, string | null>;
  /** Every component schema, for nested fields and page sections. */
  components: ComponentSchema[];
  entry: Entry | null;
  status: EntryStatus;
  /** From the audit log, e.g. "Last edited by editor · 5 minutes ago". */
  lastChange?: string | null;
};

type View = "form" | "split" | "preview";
type SaveState = { kind: "idle" } | { kind: "saving" } | { kind: "saved"; at: Date } | { kind: "error"; message: string };

const AUTOSAVE_DELAY_MS = 2500;
const timeFormat = new Intl.DateTimeFormat("en-AU", {
  hour: "numeric",
  minute: "2-digit",
});

/** What would be sent to Strapi, as a string: the basis for "unsaved changes". */
const snapshotOf = (fields: Field[], values: FormValues, resolver: Resolver) => JSON.stringify(toPayload(fields, values, resolver));

export function EntryEditor({ type, mainFields, components, entry: initialEntry, status: initialStatus, lastChange }: Props) {
  const router = useRouter();
  const resolver = useMemo(() => createResolver(components, mainFields), [components, mainFields]);
  const entryInfo = useMemo(() => ({ typeSlug: type.slug, mainField: type.mainField }), [type.slug, type.mainField]);
  const fields = useMemo(() => resolver.fieldsForType(type), [resolver, type]);
  const [initialValues] = useState(() => toFormValues(fields, initialEntry, resolver));

  const [entry, setEntry] = useState(initialEntry);
  const [status, setStatus] = useState(initialStatus);
  const [saved, setSaved] = useState(() => snapshotOf(fields, initialValues, resolver));
  const [unsaved, setUnsaved] = useState(false);
  const [saveState, setSaveState] = useState<SaveState>({ kind: "idle" });
  const [autosave, setAutosave] = useState(true);
  const [pending, startTransition] = useTransition();
  const [busy, setBusy] = useState<string | null>(null);
  const saving = useRef(false);

  // The live preview renders page-builder sections; other dynamic zones (e.g. project sliders) have no preview.
  const zone = fields.find((field) => field.kind === "dynamiczone" && (field.components ?? []).every((uid) => uid.startsWith("sections.")));
  const [view, setView] = useState<View>(zone ? "split" : "form");

  const form = useForm<FormValues>({
    defaultValues: initialValues,
    resolver: zodResolver(formSchema(fields, resolver) as never),
    mode: "onTouched",
  });

  const isSingle = type.kind === "singleType";
  const documentId = isSingle ? null : (entry?.documentId ?? null);
  const isNew = !entry;
  const canAutosave = autosave && type.draftAndPublish && !isNew;
  const mainValue = useWatch({
    control: form.control,
    name: type.mainField ?? "__none__",
  }) as string | undefined;
  const title = mainValue || (isNew && !isSingle ? `New ${type.displayName.toLowerCase()}` : type.displayName);

  // Warn before leaving with unsaved edits.
  useEffect(() => {
    if (!unsaved) return;
    const warn = (event: BeforeUnloadEvent) => event.preventDefault();
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [unsaved]);

  // Clicking a section in preview-only mode switches to split so its fields are visible.
  useEffect(() => {
    const onFocus = () => setView((current) => (current === "preview" ? "split" : current));
    window.addEventListener(FOCUS_SECTION_EVENT, onFocus);
    return () => window.removeEventListener(FOCUS_SECTION_EVENT, onFocus);
  }, []);

  const showErrors = (result: Extract<ActionResult, { ok: false }>) => {
    for (const [name, message] of Object.entries(result.fieldErrors)) {
      form.setError(name, { type: "server", message });
    }
  };

  /**
   * Saves the current values. The form is NOT reset afterwards, so typing
   * (and focus) survive autosaves; `saved` records what Strapi now has.
   */
  const save = async (source: "manual" | "auto"): Promise<Entry | false> => {
    saving.current = true;
    setSaveState({ kind: "saving" });
    const snapshot = snapshotOf(fields, form.getValues(), resolver);
    try {
      const result = await saveEntry(type.slug, documentId, JSON.parse(snapshot));
      if (!result.ok) {
        showErrors(result);
        setSaveState({ kind: "error", message: result.message });
        if (source === "manual") toast.error(result.message);
        return false;
      }
      setSaved(snapshot);
      setEntry(result.entry.data);
      setStatus(result.entry.meta.status);
      setSaveState({ kind: "saved", at: new Date() });
      return result.entry.data ?? false;
    } finally {
      saving.current = false;
    }
  };

  /** Applies a transition (publish, discard…); discard replaces the content, so the form is reset. */
  const applyTransition = (result: ActionResult, { reset = false } = {}) => {
    if (!result.ok) {
      showErrors(result);
      toast.error(result.message);
      return false;
    }
    const { data, meta } = result.entry;
    setEntry(data);
    setStatus(meta.status);
    if (reset) {
      const values = toFormValues(fields, data, resolver);
      form.reset(values);
      setSaved(snapshotOf(fields, values, resolver));
    }
    return data ?? false;
  };

  /** A new collection entry moves to its own URL once its first action finishes. */
  const settle = (data: Entry | false) => {
    if (data && isNew && !isSingle) router.replace(`/${type.slug}/${data.documentId}`);
  };

  const act = (label: string, work: () => Promise<unknown>) => {
    setBusy(label);
    startTransition(async () => {
      try {
        await work();
      } finally {
        setBusy(null);
      }
    });
  };

  const onSave = () =>
    form.handleSubmit(
      () =>
        act("save", async () => {
          const data = await save("manual");
          if (data) {
            const { title, description } = savedMessage(type, data);
            toast.success(title, { description, duration: 6000 });
          }
          settle(data);
        }),
      () => toast.error("Some fields need attention."),
    )();

  const onPublish = () =>
    form.handleSubmit(
      () =>
        act("publish", async () => {
          let id = documentId;
          if (isNew || unsaved) {
            const savedEntry = await save("manual");
            if (!savedEntry) return;
            id = isSingle ? null : savedEntry.documentId;
          }
          const data = applyTransition(await transitionEntry(type.slug, id, "publish"));
          if (data) toast.success("Published");
          // Saved but not published (e.g. a required field is empty) still gets its URL.
          settle(data || (id ? ({ documentId: id } as Entry) : false));
        }),
      () => toast.error("Some fields need attention."),
    )();

  const onTransition = (action: "unpublish" | "discard", message: string) =>
    act(action, async () => {
      if (
        applyTransition(await transitionEntry(type.slug, documentId, action), {
          reset: action === "discard",
        })
      )
        toast.success(message);
    });

  const onDelete = () => act("delete", () => deleteEntry(type.slug, documentId!));
  const canDelete = useCan("admin");

  // Latest save function for the autosave timer, without re-arming it on every render.
  const saveRef = useRef(save);
  useEffect(() => {
    saveRef.current = save;
  });

  /** Autosave: after a pause in editing, save the draft if the form is valid. */
  const onIdle = useCallback(async () => {
    if (!canAutosave || saving.current || pending) return;
    if (!(await form.trigger())) return; // leave invalid input for the editor to fix
    await saveRef.current("auto");
  }, [canAutosave, pending, form]);

  // ⌘S / Ctrl+S saves.
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "s") {
        event.preventDefault();
        if (!pending) onSave();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  const spinner = (label: string) => busy === label && <Loader2 className="animate-spin" />;
  const canPublish = type.draftAndPublish && (isNew || unsaved || status !== "published");

  const saveLabel =
    saveState.kind === "saving"
      ? "Saving…"
      : unsaved
        ? saveState.kind === "error"
          ? `Not saved: ${saveState.message}`
          : "Unsaved changes"
        : saveState.kind === "saved"
          ? `Saved ${timeFormat.format(saveState.at)}`
          : null;

  /** Blog tools read the saved draft, so pending edits are saved first. */
  const ensureSaved = async () => {
    if (!unsaved) return true;
    if (!(await form.trigger())) {
      toast.error("Some fields need attention.");
      return false;
    }
    return Boolean(await save("manual"));
  };

  const formPane = (
    <div className={cn("@container space-y-6", view !== "split" && "max-w-5xl")}>
      {type.slug === "blog" && entry && (
        <BlogTools
          documentId={entry.documentId}
          ensureSaved={ensureSaved}
          onSummary={(summary, nextStatus) => {
            // Strapi already stored it, so the form stays "saved".
            form.setValue("aiSummary", summary);
            setSaved(snapshotOf(fields, form.getValues(), resolver));
            setStatus(nextStatus);
          }}
        />
      )}
      <FieldsGrid fields={fields} />
    </div>
  );

  return (
    <ResolverProvider value={resolver}>
      <EntryInfoProvider value={entryInfo}>
        <FormProvider {...form}>
          <ChangeTracker
            control={form.control}
            fields={fields}
            resolver={resolver}
            saved={saved}
            onUnsavedChange={setUnsaved}
            onIdle={onIdle}
          />
          <form
            onSubmit={(event) => {
              event.preventDefault();
              onSave();
            }}
            className="space-y-8"
          >
            <header className="sticky top-12 z-20 -mx-6 border-b cms-glass border-[var(--glass-edge)] px-6 py-4 shadow-[0_8px_24px_-18px_color-mix(in_oklab,var(--a-ink1)_35%,transparent)] backdrop-blur-xl backdrop-saturate-150 md:-mx-10 md:px-10">
              {!isSingle && (
                <Link
                  href={`/${type.slug}`}
                  className="mb-2 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
                >
                  <ArrowLeft className="size-4" /> {type.displayName}
                </Link>
              )}
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex min-w-0 items-center gap-3">
                  <h1 className="truncate text-2xl font-semibold">{title}</h1>
                  {!isNew && type.draftAndPublish && <StatusBadge status={status} />}
                  {saveLabel && (
                    <span
                      className={cn("truncate text-sm text-muted-foreground", saveState.kind === "error" && unsaved && "text-destructive")}
                      aria-live="polite"
                    >
                      {saveLabel}
                    </span>
                  )}
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  {type.draftAndPublish && !isNew && (
                    <div className="mr-1 flex items-center gap-2">
                      <Switch
                        id="autosave"
                        checked={autosave}
                        onCheckedChange={setAutosave}
                        size="sm"
                        data-hint="Saves the draft a few seconds after you stop editing. The live site only changes when you publish."
                      />
                      <Label htmlFor="autosave" className="text-sm font-normal text-muted-foreground">
                        Autosave
                      </Label>
                    </div>
                  )}
                  {!isNew && !isSingle && canDelete && (
                    <ConfirmButton
                      title={`Delete this ${type.displayName.toLowerCase()}?`}
                      description="It's removed from the CMS and the live site. This can't be undone."
                      confirmLabel="Delete"
                      destructive
                      disabled={pending}
                      onConfirm={onDelete}
                    >
                      {spinner("delete")} Delete
                    </ConfirmButton>
                  )}
                  {status === "modified" && !unsaved && (
                    <ConfirmButton
                      title="Discard unpublished changes?"
                      description="The draft goes back to what's live on the site."
                      confirmLabel="Discard changes"
                      destructive
                      disabled={pending}
                      onConfirm={() => onTransition("discard", "Changes discarded")}
                    >
                      {spinner("discard")} Discard changes
                    </ConfirmButton>
                  )}
                  {!isNew && status !== "draft" && type.draftAndPublish && (
                    <ConfirmButton
                      title="Unpublish?"
                      description="It's taken off the live site and kept as a draft."
                      confirmLabel="Unpublish"
                      variant="outline"
                      disabled={pending}
                      onConfirm={() => onTransition("unpublish", "Unpublished")}
                    >
                      {spinner("unpublish")} Unpublish
                    </ConfirmButton>
                  )}
                  <Button type="submit" variant={type.draftAndPublish ? "outline" : "default"} disabled={pending || (!unsaved && !isNew)}>
                    {spinner("save")} {type.draftAndPublish ? "Save draft" : "Save"}
                  </Button>
                  {type.draftAndPublish && (
                    <Button type="button" onClick={onPublish} disabled={pending || !canPublish}>
                      {spinner("publish")} Publish
                    </Button>
                  )}
                </div>
              </div>
              {lastChange && saveState.kind === "idle" && <p className="mt-1 text-xs text-muted-foreground">{lastChange}</p>}
              {zone && (
                <div className="mt-3 flex gap-1" role="group" aria-label="Layout">
                  {(
                    [
                      ["form", "Form", PanelLeft],
                      ["split", "Form + preview", Columns2],
                      ["preview", "Preview", Eye],
                    ] as const
                  ).map(([value, label, Icon]) => (
                    <Button
                      key={value}
                      type="button"
                      size="sm"
                      variant={view === value ? "secondary" : "ghost"}
                      aria-pressed={view === value}
                      onClick={() => setView(value)}
                      className={cn(value === "split" && "max-lg:hidden")}
                    >
                      <Icon /> {label}
                    </Button>
                  ))}
                </div>
              )}
            </header>

            {zone && view !== "form" ? (
              <div className={cn("grid gap-6", view === "split" && "lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]")}>
                <div className={cn(view === "preview" && "hidden", view === "split" && "max-lg:hidden")}>{formPane}</div>
                <div
                  className={cn(
                    "overflow-hidden rounded-lg border",
                    view === "split" ? "max-lg:hidden lg:sticky lg:top-52 lg:h-[calc(100svh-16rem)]" : "h-[calc(100svh-15rem)]",
                  )}
                >
                  <PagePreview name={zone.name} />
                </div>
              </div>
            ) : (
              formPane
            )}
          </form>
        </FormProvider>
      </EntryInfoProvider>
    </ResolverProvider>
  );
}

/**
 * Watches the whole form in its own component (so the editor doesn't
 * re-render on every keystroke), reports whether it differs from what's
 * saved, and calls onIdle after a pause in editing.
 */
function ChangeTracker({
  control,
  fields,
  resolver,
  saved,
  onUnsavedChange,
  onIdle,
}: {
  control: Control<FormValues>;
  fields: Field[];
  resolver: Resolver;
  saved: string;
  onUnsavedChange: (unsaved: boolean) => void;
  onIdle: () => void;
}) {
  const values = useWatch({ control }) as FormValues;
  const snapshot = useMemo(() => snapshotOf(fields, values, resolver), [fields, values, resolver]);
  const unsaved = snapshot !== saved;

  useEffect(() => onUnsavedChange(unsaved), [unsaved, onUnsavedChange]);

  useEffect(() => {
    if (!unsaved) return;
    const timer = setTimeout(onIdle, AUTOSAVE_DELAY_MS);
    return () => clearTimeout(timer);
  }, [snapshot, unsaved, onIdle]);

  return null;
}
