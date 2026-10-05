"use server";

import { verifySession } from "@/lib/dal";
import { readHelp, type HelpKind } from "@/lib/help";

/** The guide for a screen or a section type; falls back to "Getting started" for screens without one. */
export async function getHelp(kind: HelpKind, topic: string): Promise<string | null> {
  await verifySession();
  const text = await readHelp(kind, topic);
  if (text || kind !== "screens") return text;
  return readHelp("screens", "getting-started");
}
