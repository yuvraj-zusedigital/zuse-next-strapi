import { describe, expect, it } from "vitest";
import { htmlLosses, isEmptyHtml } from "@/lib/html";

describe("htmlLosses (what the visual editor would drop)", () => {
  it("is empty for content the visual editor keeps, including TinyMCE div roots and pasted junk attributes", () => {
    const html =
      '<div><p class="p1" data-start="1">Hi <strong>bold</strong> <a href="/contact" target="_blank" rel="noopener">link</a></p><h3>Head</h3><blockquote>q</blockquote><img src="x.jpg" alt=""></div>';
    expect(htmlLosses(html)).toEqual([]);
  });

  it("flags inline styles, image sizes, tables and unknown elements", () => {
    expect(htmlLosses('<span style="color: #7e8c8d;">grey</span>')).toContain("inline styles (e.g. text colour)");
    expect(htmlLosses('<img src="x.jpg" width="300">')).toContain("image sizes");
    expect(htmlLosses("<table><tr><td>1</td></tr></table>")).toContain("tables");
    expect(htmlLosses('<iframe src="https://youtube.com"></iframe>')).toContain("<iframe> elements");
  });

  it("handles empty values", () => {
    expect(htmlLosses("")).toEqual([]);
    expect(htmlLosses(null)).toEqual([]);
    expect(isEmptyHtml("<p></p>")).toBe(true);
    expect(isEmptyHtml("<p>x</p>")).toBe(false);
  });
});
