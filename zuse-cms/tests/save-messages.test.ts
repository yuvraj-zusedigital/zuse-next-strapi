import { describe, expect, it } from "vitest";
import { savedMessage } from "@/lib/save-messages";

const snippet = { slug: "text-snippet", displayName: "Text snippet", draftAndPublish: false };

describe("savedMessage", () => {
  it("names the snippet and shows its new value", () => {
    expect(savedMessage(snippet, { name: "phone", value: "1300 123 456" })).toEqual({
      title: "Snippet {phone} saved",
      description: "The site now shows “1300 123 456” wherever {phone} is used.",
    });
  });

  it("warns when a snippet's value is empty, and shortens long values", () => {
    expect(savedMessage(snippet, { name: "fax", value: "" }).description).toBe("Its value is empty, so {fax} shows as nothing on the site.");
    expect(savedMessage(snippet, { name: "long", value: "x".repeat(100) }).description).toContain("…”");
  });

  it("says whether other saves are live", () => {
    expect(savedMessage({ slug: "page", displayName: "Page", draftAndPublish: true }, {})).toEqual({
      title: "Draft saved",
      description: "Not on the live site yet. Publish to update it.",
    });
    expect(savedMessage({ slug: "organization-setting", displayName: "Organization Settings", draftAndPublish: false }, {}).description).toBe("Live on the site now.");
  });
});
