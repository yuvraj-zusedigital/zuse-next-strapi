"use client";

import { useEffect, useRef } from "react";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { blocksToDoc, docToBlocks, unsupportedBlocks, type PMNode, type StrapiBlock } from "@/lib/blocks";
import { cn } from "@/lib/utils";
import { EDITOR_CONTENT_CLASS, RichToolbar } from "./rich-toolbar";

type Props = {
  id: string;
  value: StrapiBlock[] | null;
  onChange: (value: StrapiBlock[] | null) => void;
  onBlur: () => void;
  invalid?: boolean;
};

/** Rich text for Strapi "blocks" fields. */
export function BlocksEditor(props: Props) {
  const unsupported = unsupportedBlocks(props.value);
  if (unsupported.length) {
    // Editing would drop these nodes; leave the value untouched.
    return (
      <Alert>
        <AlertDescription>
          This text contains {unsupported.join(", ")} content the CMS can&apos;t edit yet, so it&apos;s shown read-only here to
          avoid losing it. Edit it in the Strapi admin for now.
        </AlertDescription>
      </Alert>
    );
  }
  return <Editable {...props} />;
}

function Editable({ id, value, onChange, onBlur, invalid }: Props) {
  // The last value this editor emitted, to tell our own updates from outside resets.
  const emitted = useRef(JSON.stringify(value));

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3, 4] },
        horizontalRule: false,
        link: { openOnClick: false, autolink: true, defaultProtocol: "https" },
      }),
    ],
    content: blocksToDoc(value),
    editorProps: {
      attributes: {
        id,
        "aria-multiline": "true",
        role: "textbox",
        class: "min-h-32 px-3 py-2 outline-none",
      },
    },
    onUpdate: ({ editor }) => {
      const next = docToBlocks(editor.getJSON() as PMNode);
      emitted.current = JSON.stringify(next);
      onChange(next);
    },
    onBlur: () => onBlur(),
  });

  // The form was reset (save, discard): load the new value without emitting a change.
  useEffect(() => {
    if (!editor || JSON.stringify(value) === emitted.current) return;
    emitted.current = JSON.stringify(value);
    editor.commands.setContent(blocksToDoc(value), { emitUpdate: false });
  }, [editor, value]);

  return (
    <div
      className={cn(
        "rounded-lg border border-input focus-within:border-ring focus-within:ring-3 focus-within:ring-ring/50",
        invalid && "border-destructive",
      )}
    >
      <RichToolbar editor={editor} />
      <EditorContent editor={editor} className={EDITOR_CONTENT_CLASS} />
    </div>
  );
}
