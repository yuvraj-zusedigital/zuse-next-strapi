"use server";

import { revalidatePath } from "next/cache";
import { isAccent } from "@/lib/accents";
import { StrapiError, updateMyPreferences } from "@/lib/strapi";

/** Saves the clock's time zone on the signed-in user's account. */
export async function saveTimezone(timezone: string | null): Promise<{ ok: true } | { ok: false; message: string }> {
  try {
    await updateMyPreferences({ timezone });
    revalidatePath("/", "layout");
    return { ok: true };
  } catch (error) {
    if (error instanceof StrapiError) return { ok: false, message: error.message };
    throw error;
  }
}

/**
 * Saves the colour theme on the signed-in user's account. The browser sets the
 * cookie the layout reads (components/theme.tsx); setting it here as well
 * would make Next re-render the whole page after every change (a flicker).
 */
export async function saveAccent(accent: string): Promise<{ ok: true } | { ok: false; message: string }> {
  if (!isAccent(accent)) return { ok: false, message: "Unknown colour theme." };
  try {
    await updateMyPreferences({ accent: accent === "zuse" ? null : accent });
  } catch (error) {
    if (error instanceof StrapiError) return { ok: false, message: error.message };
    throw error;
  }
  return { ok: true };
}
