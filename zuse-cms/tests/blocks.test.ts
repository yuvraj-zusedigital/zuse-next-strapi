import { describe, expect, it } from "vitest";
import { blocksToDoc, docToBlocks, unsupportedBlocks, type StrapiBlock } from "@/lib/blocks";

const roundTrip = (blocks: StrapiBlock[]) => docToBlocks(blocksToDoc(blocks));

describe("Strapi blocks ⇄ TipTap", () => {
  it("round-trips headings, marks, links, line breaks, nested lists, quotes and code unchanged", () => {
    const blocks: StrapiBlock[] = [
      { type: "heading", level: 2, children: [{ type: "text", text: "Title" }] },
      {
        type: "paragraph",
        children: [
          { type: "text", text: "Hi " },
          { type: "text", text: "bold", bold: true },
          { type: "text", text: " line\nbreak" },
          { type: "link", url: "https://example.com", children: [{ type: "text", text: "link", italic: true }] },
        ],
      },
      {
        type: "list",
        format: "unordered",
        indentLevel: 0,
        children: [
          { type: "list-item", children: [{ type: "text", text: "one" }] },
          { type: "list", format: "ordered", indentLevel: 1, children: [{ type: "list-item", children: [{ type: "text", text: "one.a" }] }] },
          { type: "list-item", children: [{ type: "text", text: "two" }] },
        ],
      },
      { type: "quote", children: [{ type: "text", text: "Quote" }] },
      { type: "code", children: [{ type: "text", text: "const a = 1;" }] },
    ];
    expect(roundTrip(blocks)).toEqual(blocks);
  });

  it("treats an empty editor as no content", () => {
    expect(docToBlocks(blocksToDoc(null))).toBeNull();
  });

  it("drops the empty paragraph the editor keeps after a trailing list", () => {
    const doc = blocksToDoc([{ type: "list", format: "unordered", indentLevel: 0, children: [{ type: "list-item", children: [{ type: "text", text: "a" }] }] }]);
    doc.content!.push({ type: "paragraph" });
    expect(docToBlocks(doc)?.map((block) => block.type)).toEqual(["list"]);
  });

  it("reports block types the editor can't represent", () => {
    expect(unsupportedBlocks([{ type: "image", image: {} }, { type: "paragraph", children: [{ type: "text", text: "x" }] }])).toEqual(["image"]);
    expect(unsupportedBlocks(null)).toEqual([]);
  });
});
