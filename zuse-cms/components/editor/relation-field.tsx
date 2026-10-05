"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import {
  Combobox,
  ComboboxChip,
  ComboboxChips,
  ComboboxChipsInput,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
  useComboboxAnchor,
} from "@/components/ui/combobox";
import { searchEntries } from "@/app/(cms)/[type]/actions";
import type { RelationOption } from "@/lib/fields";

type Props = {
  id: string;
  targetType: string;
  multiple: boolean;
  value: RelationOption[];
  onChange: (value: RelationOption[]) => void;
  invalid?: boolean;
};

/** Searchable picker for entries of another CMS type; options load from Strapi as you type. */
export function RelationField({ id, targetType, multiple, value, onChange, invalid }: Props) {
  const [query, setQuery] = useState("");
  const [options, setOptions] = useState<RelationOption[]>([]);
  const [loading, startLoading] = useTransition();
  const anchor = useComboboxAnchor();
  const latest = useRef(0);

  useEffect(() => {
    const request = ++latest.current;
    const timer = setTimeout(() => {
      startLoading(async () => {
        const results = await searchEntries(targetType, query);
        if (request === latest.current) setOptions(results);
      });
    }, 250);
    return () => clearTimeout(timer);
  }, [query, targetType]);

  const shared = {
    items: options,
    filter: null,
    itemToStringLabel: (item: RelationOption) => item.label,
    isItemEqualToValue: (a: RelationOption, b: RelationOption) => a.documentId === b.documentId,
    onInputValueChange: (next: string) => setQuery(next),
  };

  const list = (
    <ComboboxContent anchor={multiple ? anchor : undefined}>
      <ComboboxEmpty>{loading ? "Searching…" : "No matches"}</ComboboxEmpty>
      <ComboboxList>
        {(item: RelationOption) => (
          <ComboboxItem key={item.documentId} value={item}>
            {item.label}
          </ComboboxItem>
        )}
      </ComboboxList>
    </ComboboxContent>
  );

  if (multiple) {
    return (
      <Combobox multiple value={value} onValueChange={(next) => onChange(next as RelationOption[])} {...shared}>
        <ComboboxChips ref={anchor} aria-invalid={invalid || undefined}>
          {value.map((item) => (
            <ComboboxChip key={item.documentId}>{item.label}</ComboboxChip>
          ))}
          <ComboboxChipsInput id={id} placeholder={value.length ? "" : "Search…"} />
        </ComboboxChips>
        {list}
      </Combobox>
    );
  }

  return (
    <Combobox
      value={value[0] ?? null}
      onValueChange={(next) => onChange(next ? [next as RelationOption] : [])}
      {...shared}
    >
      <ComboboxInput id={id} placeholder="Search…" showClear={value.length > 0} aria-invalid={invalid || undefined} className="w-full" />
      {list}
    </Combobox>
  );
}
