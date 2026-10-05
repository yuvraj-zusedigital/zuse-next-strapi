/**
 * Strapi "blocks" rich text: types, plus a tiny Markdown → blocks converter
 * used to write the built-in page content (content/pages) readably.
 *
 * Supported Markdown: paragraphs (blank line between), "## " / "### "
 * headings, "- " and "1. " lists, **bold**, _italic_ and [text](href).
 */

export type BlockText = { type: "text"; text: string; bold?: boolean; italic?: boolean; underline?: boolean; strikethrough?: boolean; code?: boolean };
export type BlockLink = { type: "link"; url: string; children: BlockText[] };
export type BlockInline = BlockText | BlockLink;
export type Block =
  | { type: "paragraph"; children: BlockInline[] }
  | { type: "heading"; level: 1 | 2 | 3 | 4 | 5 | 6; children: BlockInline[] }
  | { type: "list"; format: "ordered" | "unordered"; indentLevel?: number; children: (Block | { type: "list-item"; children: BlockInline[] })[] }
  | { type: "quote"; children: BlockInline[] }
  | { type: "code"; children: BlockText[] }
  | { type: "image"; image: { url: string; alternativeText?: string | null; width?: number; height?: number }; children: BlockText[] };

/** Inline Markdown → block children. */
export function inline(text: string): BlockInline[] {
  const out: BlockInline[] = [];
  // Inline images (![alt](src)) stay as text; components/sections/Blocks.tsx renders them.
  const pattern = /(!\[[^\]]*\]\([^)]+\))|\[([^\]]+)\]\(([^)]+)\)|\*\*([^*]+)\*\*|_([^_]+)_/g;
  let last = 0;
  const pushText = (value: string) => {
    const previous = out[out.length - 1];
    if (previous?.type === "text" && !previous.bold && !previous.italic) previous.text += value;
    else out.push({ type: "text", text: value });
  };
  for (const match of text.matchAll(pattern)) {
    if (match.index! > last) pushText(text.slice(last, match.index));
    if (match[1] !== undefined) pushText(match[1]);
    else if (match[2] !== undefined) out.push({ type: "link", url: match[3], children: inline(match[2]) as BlockText[] });
    else if (match[4] !== undefined) out.push({ type: "text", text: match[4], bold: true });
    else out.push({ type: "text", text: match[5], italic: true });
    last = match.index! + match[0].length;
  }
  if (last < text.length) pushText(text.slice(last));
  return out.length ? out : [{ type: "text", text: "" }];
}

/** Markdown → Strapi blocks. */
export function md(source: string): Block[] {
  const blocks: Block[] = [];
  const chunks = source
    .replace(/\r/g, "")
    .trim()
    .split(/\n\s*\n/);

  for (const chunk of chunks) {
    const lines = chunk.split("\n").map((line) => line.trim());
    const heading = /^(#{1,6})\s+(.*)$/.exec(lines[0]);
    if (heading && lines.length === 1) {
      blocks.push({ type: "heading", level: heading[1].length as 2, children: inline(heading[2]) });
    } else if (lines.every((line) => /^[-*]\s+/.test(line))) {
      blocks.push({ type: "list", format: "unordered", children: lines.map((line) => ({ type: "list-item", children: inline(line.replace(/^[-*]\s+/, "")) })) });
    } else if (lines.every((line) => /^\d+\.\s+/.test(line))) {
      blocks.push({ type: "list", format: "ordered", children: lines.map((line) => ({ type: "list-item", children: inline(line.replace(/^\d+\.\s+/, "")) })) });
    } else {
      blocks.push({ type: "paragraph", children: inline(lines.join(" ")) });
    }
  }
  return blocks;
}
