/**
 * Strapi "blocks" rich text ⇄ TipTap (ProseMirror) JSON.
 *
 * Supported: paragraphs, headings, ordered/unordered lists (nested), quotes,
 * code blocks, and inline bold/italic/underline/strikethrough/code/links.
 * Anything else (e.g. images) is reported by unsupportedBlocks() so the
 * editor can refuse to edit rather than silently dropping it.
 */

export type StrapiInline =
  | { type: "text"; text: string; bold?: boolean; italic?: boolean; underline?: boolean; strikethrough?: boolean; code?: boolean }
  | { type: "link"; url: string; children: StrapiInline[] };

export type StrapiBlock = {
  type: string;
  children?: (StrapiInline | StrapiBlock)[];
  level?: number;
  format?: "ordered" | "unordered";
  indentLevel?: number;
  language?: string;
  [key: string]: unknown;
};

type Mark = { type: string; attrs?: Record<string, unknown> };
export type PMNode = { type: string; attrs?: Record<string, unknown>; content?: PMNode[]; text?: string; marks?: Mark[] };

const SUPPORTED = new Set(["paragraph", "heading", "list", "list-item", "quote", "code", "text", "link"]);

/** Block types present in the value that the editor can't represent. */
export function unsupportedBlocks(blocks: StrapiBlock[] | null): string[] {
  const found = new Set<string>();
  const walk = (nodes: unknown[] | undefined) => {
    for (const node of (nodes ?? []) as StrapiBlock[]) {
      if (!SUPPORTED.has(node.type)) found.add(node.type);
      walk(node.children);
    }
  };
  walk(blocks ?? []);
  return [...found];
}

// ── Strapi → TipTap ──

const MARKS = ["bold", "italic", "underline", "strikethrough", "code"] as const;
const MARK_NAME: Record<(typeof MARKS)[number], string> = {
  bold: "bold",
  italic: "italic",
  underline: "underline",
  strikethrough: "strike",
  code: "code",
};

function inlineToPM(children: StrapiInline[] = [], extra: Mark[] = []): PMNode[] {
  const out: PMNode[] = [];
  for (const child of children) {
    if (child.type === "link") {
      out.push(...inlineToPM(child.children, [...extra, { type: "link", attrs: { href: child.url } }]));
      continue;
    }
    const marks = [...extra, ...MARKS.filter((mark) => child[mark]).map((mark) => ({ type: MARK_NAME[mark] }))];
    // "\n" inside Strapi text is a line break.
    child.text.split("\n").forEach((part, index) => {
      if (index > 0) out.push({ type: "hardBreak" });
      if (part) out.push({ type: "text", text: part, ...(marks.length ? { marks } : {}) });
    });
  }
  return out;
}

const paragraph = (children?: StrapiInline[]): PMNode => {
  const content = inlineToPM(children);
  return { type: "paragraph", ...(content.length ? { content } : {}) };
};

function listToPM(block: StrapiBlock): PMNode {
  const items: PMNode[] = [];
  for (const child of (block.children ?? []) as StrapiBlock[]) {
    if (child.type === "list") {
      // Strapi nests a sub-list as a sibling after its parent item.
      const parent = items[items.length - 1] ?? { type: "listItem", content: [paragraph()] };
      if (!items.length) items.push(parent);
      parent.content = [...(parent.content ?? []), listToPM(child)];
    } else {
      items.push({ type: "listItem", content: [paragraph(child.children as StrapiInline[])] });
    }
  }
  return { type: block.format === "ordered" ? "orderedList" : "bulletList", content: items };
}

export function blocksToDoc(blocks: StrapiBlock[] | null): PMNode {
  const content: PMNode[] = [];
  for (const block of blocks ?? []) {
    const children = block.children as StrapiInline[] | undefined;
    switch (block.type) {
      case "paragraph":
        content.push(paragraph(children));
        break;
      case "heading":
        content.push({ type: "heading", attrs: { level: block.level ?? 2 }, content: inlineToPM(children) });
        break;
      case "list":
        content.push(listToPM(block));
        break;
      case "quote":
        content.push({ type: "blockquote", content: [paragraph(children)] });
        break;
      case "code": {
        const text = (children ?? []).map((child) => (child.type === "text" ? child.text : "")).join("");
        content.push({ type: "codeBlock", attrs: { language: block.language ?? null }, ...(text ? { content: [{ type: "text", text }] } : {}) });
        break;
      }
    }
  }
  return { type: "doc", content: content.length ? content : [{ type: "paragraph" }] };
}

// ── TipTap → Strapi ──

function pmToInline(nodes: PMNode[] = []): StrapiInline[] {
  const out: StrapiInline[] = [];
  const sameMarks = (a: StrapiInline, b: StrapiInline) =>
    a.type === "text" && b.type === "text" && MARKS.every((mark) => Boolean(a[mark]) === Boolean(b[mark]));

  /** Appends text, merging into the previous text node when its formatting matches. */
  const append = (list: StrapiInline[], node: StrapiInline & { type: "text" }) => {
    const last = list[list.length - 1];
    if (last && sameMarks(last, node)) (last as typeof node).text += node.text;
    else list.push(node);
  };

  const pushText = (text: string, marks: Mark[] = []) => {
    const link = marks.find((mark) => mark.type === "link");
    const node: StrapiInline & { type: "text" } = { type: "text", text };
    for (const mark of MARKS) if (marks.some((m) => m.type === MARK_NAME[mark])) node[mark] = true;

    if (link) {
      const url = String(link.attrs?.href ?? "");
      const last = out[out.length - 1];
      if (last?.type === "link" && last.url === url) append(last.children, node);
      else out.push({ type: "link", url, children: [node] });
    } else {
      append(out, node);
    }
  };

  for (const node of nodes) {
    if (node.type === "text") pushText(node.text ?? "", node.marks);
    else if (node.type === "hardBreak") pushText("\n");
  }
  // Strapi requires at least one text child.
  return out.length ? out : [{ type: "text", text: "" }];
}

function pmListToBlocks(node: PMNode, indentLevel = 0): StrapiBlock {
  const children: StrapiBlock[] = [];
  for (const item of node.content ?? []) {
    const [first, ...rest] = item.content ?? [];
    children.push({ type: "list-item", children: pmToInline(first?.content) });
    for (const nested of rest) {
      if (nested.type === "bulletList" || nested.type === "orderedList") children.push(pmListToBlocks(nested, indentLevel + 1));
      else children.push({ type: "list-item", children: pmToInline(nested.content) });
    }
  }
  return { type: "list", format: node.type === "orderedList" ? "ordered" : "unordered", indentLevel, children };
}

export function docToBlocks(doc: PMNode): StrapiBlock[] | null {
  const blocks: StrapiBlock[] = [];
  for (const node of doc.content ?? []) {
    switch (node.type) {
      case "paragraph":
        blocks.push({ type: "paragraph", children: pmToInline(node.content) });
        break;
      case "heading":
        blocks.push({ type: "heading", level: Number(node.attrs?.level ?? 2), children: pmToInline(node.content) });
        break;
      case "bulletList":
      case "orderedList":
        blocks.push(pmListToBlocks(node));
        break;
      case "blockquote":
        blocks.push({
          type: "quote",
          children: pmToInline((node.content ?? []).flatMap((child, i) => (i ? [{ type: "hardBreak" }, ...(child.content ?? [])] : (child.content ?? [])))),
        });
        break;
      case "codeBlock":
        blocks.push({
          type: "code",
          ...(node.attrs?.language ? { language: String(node.attrs.language) } : {}),
          children: [{ type: "text", text: (node.content ?? []).map((child) => child.text ?? "").join("") }],
        });
        break;
    }
  }

  const isEmptyParagraph = (block: StrapiBlock) =>
    block.type === "paragraph" && (block.children as StrapiInline[]).every((child) => child.type === "text" && !child.text);

  // The editor keeps an empty paragraph after a trailing list/quote so the cursor can leave it; don't store it.
  while (blocks.length && isEmptyParagraph(blocks[blocks.length - 1])) blocks.pop();
  return blocks.length ? blocks : null;
}
