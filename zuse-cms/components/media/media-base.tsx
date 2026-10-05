"use client";

import { createContext, useContext } from "react";

/** Strapi's origin, for resolving relative (local) upload URLs on the client. */
const MediaBaseContext = createContext("");

export function MediaBaseProvider({ value, children }: { value: string; children: React.ReactNode }) {
  return <MediaBaseContext.Provider value={value}>{children}</MediaBaseContext.Provider>;
}

export const useMediaBase = () => useContext(MediaBaseContext);

/** The public website's origin (SITE_URL), for site images referenced by path in previews. */
const SiteBaseContext = createContext("");
export const SiteBaseProvider = SiteBaseContext.Provider;
export const useSiteBase = () => useContext(SiteBaseContext);
