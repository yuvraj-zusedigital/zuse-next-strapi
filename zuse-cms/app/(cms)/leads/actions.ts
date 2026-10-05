"use server";

import { redirect } from "next/navigation";
import { isLeadKind } from "@/lib/leads";
import { deleteLead, StrapiError } from "@/lib/strapi";

/** Deletes a lead (Admins; Strapi checks) and goes back to its list. */
export async function deleteLeadAction(kind: string, id: number) {
  if (!isLeadKind(kind)) return { ok: false as const, message: "Unknown list." };
  try {
    await deleteLead(kind, id);
  } catch (error) {
    if (error instanceof StrapiError && error.status !== 404) return { ok: false as const, message: error.message };
    if (!(error instanceof StrapiError)) throw error;
  }
  redirect(`/leads/${kind}?deleted=1`);
}
