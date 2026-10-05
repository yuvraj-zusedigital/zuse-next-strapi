import { describe, expect, it } from "vitest";
import { applySnippets, fillSnippets, unknownSnippets, withBuiltIns } from "@/lib/snippets";

const snippets = withBuiltIns({ phone: "1300 000 000", yearsInBusiness: "12", name: "ignored" }, new Date("2026-10-02"));

describe("text snippets", () => {
  it("fills known snippets and the built-in year", () => {
    expect(fillSnippets("Call {phone} — {yearsInBusiness} years, © {year}", snippets)).toBe("Call 1300 000 000 — 12 years, © 2026");
  });

  it("leaves unknown words and {name} (thank-you title) alone", () => {
    expect(fillSnippets("Thank you{name}. {unknown} {not a token}", snippets)).toBe("Thank you{name}. {unknown} {not a token}");
  });

  it("fills every string in nested data, not object keys or other values", () => {
    const data = { title: "{yearsInBusiness} years", items: [{ text: "{phone}", count: 3, "{phone}": true }], hidden: false };
    expect(applySnippets(data, snippets)).toEqual({ title: "12 years", items: [{ text: "1300 000 000", count: 3, "{phone}": true }], hidden: false });
  });

  it("lists snippets used without a value", () => {
    expect(unknownSnippets("{phone} {fax} {name} {year}", snippets)).toEqual(["fax"]);
  });
});
