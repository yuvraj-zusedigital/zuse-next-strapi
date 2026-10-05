"use client";

import { createContext, useContext } from "react";
import { atLeast, type RoleType } from "@/lib/roles";

const RoleContext = createContext<string | null>(null);

/** The signed-in user's CMS role, for showing only what they may do (Strapi enforces it). */
export const RoleProvider = RoleContext.Provider;

/** True when the signed-in user's role is `min` or higher. */
export function useCan(min: RoleType) {
  return atLeast(useContext(RoleContext), min);
}
