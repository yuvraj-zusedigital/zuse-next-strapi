"use client";

import { useState } from "react";
import { useFieldArray, useFormContext, useWatch } from "react-hook-form";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cloneValue, componentLabel, inSentence, newComponentValue, summarize, type Field, type FormValues } from "@/lib/fields";
import { FieldsGrid } from "./fields-grid";
import { ItemCard } from "./item-card";
import { useResolver } from "./resolver-context";
import { HIDDEN_FIELD, VisibilityButton } from "./visibility-button";
import { SortableList } from "./sortable-list";

/** A repeatable component: a reorderable list of items (FAQ entries, cards, steps…). */
export function RepeatableField({ field, name }: { field: Field; name: string }) {
  const resolver = useResolver();
  const { control, getFieldState, formState, setValue } = useFormContext();
  const { fields: items, append, insert, remove, move } = useFieldArray({ control, name, keyName: "_id" });
  const values = useWatch({ control, name }) as FormValues[] | undefined;
  const [open, setOpen] = useState<Set<string>>(new Set());
  const allFields = resolver.fieldsForComponent(field.component!);
  // "hidden" is the eye button on each item, not a form field.
  const canHide = allFields.some((sub) => sub.name === HIDDEN_FIELD);
  const subFields = allFields.filter((sub) => sub.name !== HIDDEN_FIELD);
  const itemLabel = componentLabel(resolver.component(field.component!)?.displayName, field.component!);

  const toggle = (id: string) =>
    setOpen((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const add = () => {
    const item = newComponentValue(field.component!, resolver);
    append(item);
    setOpen((current) => new Set(current).add(String(item.__key)));
  };

  return (
    <div className="grid grid-cols-[minmax(0,1fr)] gap-2">
      {items.length > 0 && (
        <SortableList ids={items.map((item) => item._id)} onMove={move}>
          {(id, index, handle, dragging) => {
            const key = String(values?.[index]?.__key ?? id);
            const invalid = getFieldState(`${name}.${index}`, formState).invalid;
            const hidden = values?.[index]?.[HIDDEN_FIELD] === true;
            return (
              <ItemCard
                hidden={hidden}
                actions={
                  canHide && (
                    <VisibilityButton hidden={hidden} onToggle={() => setValue(`${name}.${index}.${HIDDEN_FIELD}`, !hidden, { shouldDirty: true })} />
                  )
                }
                title={`${itemLabel} ${index + 1}`}
                summary={summarize(subFields, values?.[index])}
                index={index}
                total={items.length}
                open={open.has(key) || invalid}
                onToggle={() => toggle(key)}
                onMove={(to) => move(index, to)}
                onDuplicate={() => insert(index + 1, cloneValue(values?.[index] ?? {}))}
                onRemove={() => remove(index)}
                handle={handle}
                dragging={dragging}
                invalid={invalid}
              >
                <FieldsGrid fields={subFields} prefix={`${name}.${index}`} />
              </ItemCard>
            );
          }}
        </SortableList>
      )}
      <div>
        <Button type="button" variant="outline" size="sm" onClick={add}>
          <Plus /> Add {inSentence(itemLabel)}
        </Button>
      </div>
    </div>
  );
}
