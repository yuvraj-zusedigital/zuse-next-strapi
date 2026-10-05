"use client";

import { createContext, useContext } from "react";

/** Which entry is being edited (for panels that depend on the type, e.g. SEO). */
export type EntryInfo = { typeSlug: string; mainField: string | null };

const EntryContext = createContext<EntryInfo | null>(null);
export const EntryInfoProvider = EntryContext.Provider;
export const useEntryInfo = () => useContext(EntryContext);
