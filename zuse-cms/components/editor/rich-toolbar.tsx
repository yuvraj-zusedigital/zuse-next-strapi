"use client";

import { useEditorState, type Editor } from "@tiptap/react";
import {
  Bold,
  Code,
  Heading2,
  Heading3,
  Italic,
  Link as LinkIcon,
  List,
  ListOrdered,
  Quote,
  Redo,
  Strikethrough,
  Underline,
  Undo,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

export type ToolbarTool = { label: string; icon: LucideIcon; active?: boolean; disabled?: boolean; run: () => void };

/** Formatting toolbar shared by the rich-text (blocks) and HTML editors. */
export function RichToolbar({ editor, extra = [] }: { editor: Editor | null; extra?: ToolbarTool[] }) {
  const state = useEditorState({
    editor,
    selector: ({ editor: e }) => ({
      bold: e?.isActive("bold") ?? false,
      italic: e?.isActive("italic") ?? false,
      underline: e?.isActive("underline") ?? false,
      strike: e?.isActive("strike") ?? false,
      code: e?.isActive("code") ?? false,
      link: e?.isActive("link") ?? false,
      h2: e?.isActive("heading", { level: 2 }) ?? false,
      h3: e?.isActive("heading", { level: 3 }) ?? false,
      bullet: e?.isActive("bulletList") ?? false,
      ordered: e?.isActive("orderedList") ?? false,
      quote: e?.isActive("blockquote") ?? false,
      canUndo: e?.can().undo() ?? false,
      canRedo: e?.can().redo() ?? false,
    }),
  });

  if (!editor || !state) return <div className="h-9 border-b" />;
  const chain = () => editor.chain().focus();

  const setLink = () => {
    const current = editor.getAttributes("link").href as string | undefined;
    const url = window.prompt("Link URL (leave empty to remove the link)", current ?? "https://");
    if (url === null) return;
    if (!url.trim()) chain().extendMarkRange("link").unsetLink().run();
    else chain().extendMarkRange("link").setLink({ href: url.trim() }).run();
  };

  const groups: ToolbarTool[][] = [
    [
      { label: "Bold", icon: Bold, active: state.bold, run: () => chain().toggleBold().run() },
      { label: "Italic", icon: Italic, active: state.italic, run: () => chain().toggleItalic().run() },
      { label: "Underline", icon: Underline, active: state.underline, run: () => chain().toggleUnderline().run() },
      { label: "Strikethrough", icon: Strikethrough, active: state.strike, run: () => chain().toggleStrike().run() },
      { label: "Inline code", icon: Code, active: state.code, run: () => chain().toggleCode().run() },
      { label: "Link", icon: LinkIcon, active: state.link, run: setLink },
    ],
    [
      { label: "Heading", icon: Heading2, active: state.h2, run: () => chain().toggleHeading({ level: 2 }).run() },
      { label: "Subheading", icon: Heading3, active: state.h3, run: () => chain().toggleHeading({ level: 3 }).run() },
      { label: "Bulleted list", icon: List, active: state.bullet, run: () => chain().toggleBulletList().run() },
      { label: "Numbered list", icon: ListOrdered, active: state.ordered, run: () => chain().toggleOrderedList().run() },
      { label: "Quote", icon: Quote, active: state.quote, run: () => chain().toggleBlockquote().run() },
    ],
    ...(extra.length ? [extra] : []),
    [
      { label: "Undo", icon: Undo, disabled: !state.canUndo, run: () => chain().undo().run() },
      { label: "Redo", icon: Redo, disabled: !state.canRedo, run: () => chain().redo().run() },
    ],
  ];

  return (
    <div role="toolbar" aria-label="Formatting" className="flex flex-wrap items-center gap-0.5 border-b p-1">
      {groups.map((group, index) => (
        <div key={index} className={cn("flex gap-0.5", index > 0 && "border-l pl-1")}>
          {group.map(({ label, icon: Icon, active, disabled, run }) => (
            <button
              key={label}
              type="button"
              title={label}
              aria-label={label}
              aria-pressed={active}
              disabled={disabled}
              onMouseDown={(event) => event.preventDefault()}
              onClick={run}
              className={cn(
                "flex size-7 items-center justify-center rounded text-muted-foreground hover:bg-muted hover:text-foreground disabled:opacity-40",
                active && "bg-muted text-foreground",
              )}
            >
              <Icon className="size-4" />
            </button>
          ))}
        </div>
      ))}
    </div>
  );
}

/** Content styles for TipTap editors (the CMS has no typography plugin). */
export const EDITOR_CONTENT_CLASS = cn(
  "text-sm",
  "[&_h2]:mt-3 [&_h2]:mb-1 [&_h2]:text-lg [&_h2]:font-semibold [&_h3]:mt-3 [&_h3]:mb-1 [&_h3]:font-semibold [&_h4]:font-semibold",
  "[&_p]:my-1.5 [&_ul]:my-1.5 [&_ul]:list-disc [&_ul]:pl-6 [&_ol]:my-1.5 [&_ol]:list-decimal [&_ol]:pl-6",
  "[&_blockquote]:border-l-2 [&_blockquote]:pl-3 [&_blockquote]:text-muted-foreground",
  "[&_pre]:rounded [&_pre]:bg-muted [&_pre]:p-2 [&_pre]:font-mono [&_code]:rounded [&_code]:bg-muted [&_code]:px-1 [&_code]:font-mono",
  "[&_a]:text-primary [&_a]:underline [&_img]:my-2 [&_img]:max-h-80 [&_img]:rounded [&_img.ProseMirror-selectednode]:ring-2 [&_img.ProseMirror-selectednode]:ring-ring",
);
