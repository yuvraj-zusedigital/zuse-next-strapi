import "server-only";

import { readFile } from "node:fs/promises";
import path from "node:path";

/**
 * In-app help: Markdown files in content/help/, editable without touching
 * code. screens/<topic>.md is the guide for a CMS screen (opened with the
 * Help button or "?"), sections/<type>.md for one page-builder section type
 * (the "?" on a section card).
 */
const ROOT = path.join(process.cwd(), "content", "help");
const SAFE = /^[a-z0-9-]+$/;

export type HelpKind = "screens" | "sections";

export async function readHelp(kind: HelpKind, topic: string): Promise<string | null> {
  if ((kind !== "screens" && kind !== "sections") || !SAFE.test(topic)) return null;
  try {
    return await readFile(path.join(ROOT, kind, `${topic}.md`), "utf8");
  } catch {
    return null;
  }
}
