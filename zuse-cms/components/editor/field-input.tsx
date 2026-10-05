"use client";

import { Controller, useFormContext } from "react-hook-form";
import { Wand2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import type { StrapiBlock } from "@/lib/blocks";
import { isWide, slugify, type Field, type RelationOption } from "@/lib/fields";
import type { MediaFile } from "@/lib/types";
import { cn } from "@/lib/utils";
import { BlocksEditor } from "./blocks-editor";
import { HtmlEditor } from "./html-editor";
import { ComponentField } from "./component-field";
import { MediaField } from "./media-field";
import { RelationField } from "./relation-field";
import { RepeatableField } from "./repeatable-field";
import { SectionsField } from "./sections-field";

/**
 * One form field for a Strapi attribute. `name` is the full form path, e.g.
 * `sections.2.items.0.title`, so the same component works at any depth.
 */
export function FieldInput({ field, name }: { field: Field; name: string }) {
  const { register, control, formState, getFieldState, getValues, setValue } = useFormContext();
  const id = `field-${name.replace(/\./g, "-")}`;
  const message = getFieldState(name, formState).error?.message;
  const error = typeof message === "string" ? message : undefined;
  const invalid = Boolean(error);
  const describedBy = [field.hint && `${id}-hint`, error && `${id}-error`].filter(Boolean).join(" ") || undefined;
  const aria = { "aria-invalid": invalid || undefined, "aria-describedby": describedBy };
  const { attribute } = field;
  /** Path of a sibling field (same component). */
  const sibling = (fieldName: string) => name.replace(/[^.]+$/, fieldName);

  let control_: React.ReactNode;
  switch (field.kind) {
    case "string":
    case "email":
      control_ = <Input id={id} type={field.kind === "email" ? "email" : "text"} {...aria} {...register(name)} />;
      break;
    case "text":
      control_ = <Textarea id={id} rows={attribute.type === "richtext" ? 10 : 3} {...aria} {...register(name)} />;
      break;
    case "uid": {
      const source = attribute.targetField as string | undefined;
      control_ = (
        <div className="flex gap-2">
          <Input id={id} className="font-mono" {...aria} {...register(name)} />
          {source && (
            <Button
              type="button"
              variant="outline"
              title={`Generate from ${source}`}
              onClick={() => setValue(name, slugify(String(getValues(sibling(source)) ?? "")), { shouldDirty: true, shouldValidate: true })}
            >
              <Wand2 /> Generate
            </Button>
          )}
        </div>
      );
      break;
    }
    case "color":
      control_ = (
        <Controller
          control={control}
          name={name}
          render={({ field: f }) => (
            <div className="flex items-center gap-2">
              <input
                type="color"
                aria-label={`${field.label} picker`}
                value={/^#[0-9a-f]{6}$/i.test(String(f.value ?? "")) ? String(f.value) : "#000000"}
                onChange={(event) => f.onChange(event.target.value)}
                className="h-8 w-10 cursor-pointer rounded border bg-transparent p-0.5"
              />
              <Input id={id} value={String(f.value ?? "")} onChange={f.onChange} onBlur={f.onBlur} placeholder="#1a2b3c" className="w-32 font-mono" {...aria} />
            </div>
          )}
        />
      );
      break;
    case "integer":
    case "decimal":
      control_ = (
        <Input
          id={id}
          type="number"
          inputMode={field.kind === "integer" ? "numeric" : "decimal"}
          step={field.kind === "integer" ? 1 : "any"}
          min={attribute.min as number | undefined}
          max={attribute.max as number | undefined}
          className="w-40"
          {...aria}
          {...register(name)}
        />
      );
      break;
    case "date":
    case "datetime":
      control_ = <Input id={id} type={field.kind === "date" ? "date" : "datetime-local"} className="w-60" {...aria} {...register(name)} />;
      break;
    case "json":
      control_ = <Textarea id={id} rows={6} className="font-mono text-xs" {...aria} {...register(name)} />;
      break;
    case "boolean":
      control_ = (
        <Controller
          control={control}
          name={name}
          render={({ field: f }) => <Switch id={id} checked={Boolean(f.value)} onCheckedChange={f.onChange} onBlur={f.onBlur} {...aria} />}
        />
      );
      break;
    case "choice": {
      const choices = field.choices ?? [];
      control_ = (
        <Controller
          control={control}
          name={name}
          render={({ field: f }) => {
            const value = typeof f.value === "string" ? f.value : "";
            // A value set elsewhere (e.g. the Strapi admin) stays selectable instead of being lost.
            const options = choices.some((choice) => choice.value === value) ? choices : [...choices, { value, label: value }];
            return (
              <select
                id={id}
                value={value}
                onChange={(event) => f.onChange(event.target.value)}
                onBlur={f.onBlur}
                className="h-8 w-full max-w-md rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-input/30"
                {...aria}
              >
                {options.map((choice) => (
                  <option key={choice.value || "default"} value={choice.value}>
                    {choice.label}
                  </option>
                ))}
              </select>
            );
          }}
        />
      );
      break;
    }
    case "enumeration": {
      const options = (attribute.enum as string[]) ?? [];
      control_ = (
        <Controller
          control={control}
          name={name}
          render={({ field: f }) => (
            <Select value={(f.value as string) || null} onValueChange={(v) => f.onChange(v ?? "")}>
              <SelectTrigger id={id} className="w-60" {...aria}>
                <SelectValue placeholder="Choose…" />
              </SelectTrigger>
              <SelectContent>
                {options.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
      );
      break;
    }
    case "blocks":
      control_ = (
        <Controller
          control={control}
          name={name}
          render={({ field: f }) => (
            <BlocksEditor id={id} value={(f.value as StrapiBlock[] | null) ?? null} onChange={f.onChange} onBlur={f.onBlur} invalid={invalid} />
          )}
        />
      );
      break;
    case "html":
      control_ = (
        <Controller
          control={control}
          name={name}
          render={({ field: f }) => (
            <HtmlEditor id={id} value={String(f.value ?? "")} onChange={f.onChange} onBlur={f.onBlur} invalid={invalid} />
          )}
        />
      );
      break;
    case "relation":
      control_ = (
        <Controller
          control={control}
          name={name}
          render={({ field: f }) => (
            <RelationField
              id={id}
              targetType={field.targetType!}
              multiple={Boolean(field.multiple)}
              value={(f.value as RelationOption[]) ?? []}
              onChange={f.onChange}
              invalid={invalid}
            />
          )}
        />
      );
      break;
    case "media":
      control_ = (
        <Controller
          control={control}
          name={name}
          render={({ field: f }) => (
            <MediaField
              id={id}
              label={field.label}
              multiple={Boolean(field.multiple)}
              allowedTypes={attribute.allowedTypes as string[] | undefined}
              value={(f.value as MediaFile[]) ?? []}
              onChange={f.onChange}
            />
          )}
        />
      );
      break;
    case "component":
      control_ = field.repeatable ? <RepeatableField field={field} name={name} /> : <ComponentField field={field} name={name} />;
      break;
    case "dynamiczone":
      control_ = <SectionsField field={field} name={name} />;
      break;
    case "readonly":
      control_ = <div className="rounded-lg border border-dashed px-3 py-2 text-sm text-muted-foreground">{field.readonlyReason}</div>;
      break;
  }

  // Lists and groups aren't a single control, so their label isn't tied to an input.
  const labelled = !["readonly", "component", "dynamiczone", "media", "html"].includes(field.kind);

  return (
    <div className={cn("grid min-w-0 content-start gap-2", isWide(field) && "@xl:col-span-2")} role={labelled ? undefined : "group"} aria-labelledby={labelled ? undefined : `${id}-label`}>
      <Label id={`${id}-label`} htmlFor={labelled ? id : undefined} className={cn(field.kind === "dynamiczone" && "text-base")}>
        {field.label}
        {field.required && (
          <span className="text-destructive" title="Required to publish">
            *
          </span>
        )}
      </Label>
      {control_}
      {field.hint && (
        <p id={`${id}-hint`} className="text-xs text-muted-foreground">
          {field.hint}
        </p>
      )}
      {error && (
        <p id={`${id}-error`} role="alert" className="text-xs text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}
