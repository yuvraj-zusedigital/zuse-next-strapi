"use client";

import type { Field } from "@/lib/fields";
import { FieldInput } from "./field-input";

/**
 * Lays out fields in two columns when there's room (measured on this grid's
 * own width, so it also works in the narrower split view); wide fields
 * (text, lists, components) span both.
 */
export function FieldsGrid({ fields, prefix }: { fields: Field[]; prefix?: string }) {
  return (
    <div className="@container">
      <div className="grid grid-cols-[minmax(0,1fr)] gap-6 @xl:grid-cols-[repeat(2,minmax(0,1fr))]">
        {fields.filter((field) => !field.hiddenInForm).map((field) => (
          <FieldInput key={field.name} field={field} name={prefix ? `${prefix}.${field.name}` : field.name} />
        ))}
      </div>
    </div>
  );
}
