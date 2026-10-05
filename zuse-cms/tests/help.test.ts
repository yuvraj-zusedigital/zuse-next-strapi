import { readFileSync } from "node:fs";
import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));
const { readHelp } = await import("@/lib/help");

const pageSchema = JSON.parse(readFileSync(new URL("../../src/api/page/content-types/page/schema.json", import.meta.url), "utf8"));
const sectionTypes: string[] = pageSchema.attributes.sections.components.map((uid: string) => uid.replace(/^sections\./, ""));
const screens = ["getting-started", "dashboard", "media", "activity", "users", "leads", "speed", "text-snippet", "page", "blog", "project", "testimonial", "award", "author", "project-category", "global", "organization-setting"];

describe("help guides", () => {
  it.each(sectionTypes)("has a guide for the %s section", async (type) => {
    const text = await readHelp("sections", type);
    expect(text).toMatch(/^# /);
  });

  it.each(screens)("has a guide for the %s screen", async (screen) => {
    expect(await readHelp("screens", screen)).toMatch(/^# /);
  });

  it("refuses paths outside the help folder", async () => {
    expect(await readHelp("screens", "../../package")).toBeNull();
    expect(await readHelp("screens", "page.md")).toBeNull();
    expect(await readHelp("other" as never, "page")).toBeNull();
  });
});
