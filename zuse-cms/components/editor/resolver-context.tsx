"use client";

import { createContext, useContext } from "react";
import type { Resolver } from "@/lib/fields";

/** Gives nested field inputs access to component schemas. */
const ResolverContext = createContext<Resolver | null>(null);

export const ResolverProvider = ResolverContext.Provider;

export function useResolver() {
  const resolver = useContext(ResolverContext);
  if (!resolver) throw new Error("useResolver must be used inside <ResolverProvider>");
  return resolver;
}
