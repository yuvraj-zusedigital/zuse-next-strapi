import { describe, expect, it } from "vitest";
import { listHref, nextSort, parseListQuery, toCsv } from "@/lib/list-query";

describe("parseListQuery", () => {
  it("reads filters and falls back to safe defaults", () => {
    expect(parseListQuery({ q: "seo", status: "modified", sort: "title:asc", page: "3" })).toEqual({
      q: "seo",
      status: "modified",
      sort: "title:asc",
      page: 3,
    });
    expect(parseListQuery({ status: "deleted", sort: "title;drop", page: "-2" })).toEqual({
      q: "",
      status: "",
      sort: "updatedAt:desc",
      page: 1,
    });
  });
});

describe("listHref", () => {
  const query = { q: "web", status: "draft" as const, sort: "updatedAt:desc", page: 4 };

  it("keeps the other filters and resets to page 1 on change", () => {
    expect(listHref("/page", query, { status: "published" })).toBe("/page?q=web&status=published");
  });

  it("keeps the page when paging, and drops defaults", () => {
    expect(listHref("/page", query, { page: 5 })).toBe("/page?q=web&status=draft&page=5");
    expect(listHref("/page", query, { q: "", status: "" })).toBe("/page");
  });
});

describe("nextSort", () => {
  it("starts a new column in its natural order, then flips", () => {
    expect(nextSort("updatedAt:desc", "title", "asc")).toBe("title:asc");
    expect(nextSort("title:asc", "title", "asc")).toBe("title:desc");
    expect(nextSort("title:desc", "title", "asc")).toBe("title:asc");
  });
});

describe("toCsv", () => {
  it("quotes commas, quotes and new lines", () => {
    expect(toCsv([["a,b", 'say "hi"', "line\nbreak", null]])).toBe('"a,b","say ""hi""","line\nbreak",');
  });

  it("stops spreadsheets running cells as formulas", () => {
    expect(toCsv([["=HYPERLINK(\"x\")", "+1", "-2", "@cmd", "fine"]])).toBe(`"'=HYPERLINK(""x"")",'+1,'-2,'@cmd,fine`);
  });
});
