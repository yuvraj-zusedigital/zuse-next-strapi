"use client";

import { useEffect, useRef, useState } from "react";
import { EditorContent, useEditor, type Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import { Code2, Eye, ImagePlus } from "lucide-react";
import { Lightbox, type LightboxFile } from "@/components/media/lightbox";
import { MediaLibrary } from "@/components/media/media-library";
import { useMediaBase } from "@/components/media/media-base";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { htmlLosses, isEmptyHtml } from "@/lib/html";
import { acceptFor, mediaUrl } from "@/lib/media";
import { cn } from "@/lib/utils";
import { EDITOR_CONTENT_CLASS, RichToolbar } from "./rich-toolbar";

type Props = {
  id: string;
  value: string;
  onChange: (value: string) => void;
  onBlur: () => void;
  invalid?: boolean;
};

/**
 * HTML body (TinyMCE custom field): a visual editor plus an HTML tab.
 * Content with formatting the visual editor would drop opens in HTML, and
 * switching to visual asks first. Opening never changes the value; only edits do.
 */
export function HtmlEditor({ id, value, onChange, onBlur, invalid }: Props) {
  const losses = htmlLosses(value);
  const [mode, setMode] = useState<"visual" | "html">(losses.length ? "html" : "visual");
  const [confirming, setConfirming] = useState(false);

  const switchToVisual = () => (htmlLosses(value).length ? setConfirming(true) : setMode("visual"));

  return (
    <div className="grid gap-2">
      <div className="flex gap-1" role="group" aria-label="Editor mode">
        <Button type="button" size="sm" variant={mode === "visual" ? "secondary" : "ghost"} aria-pressed={mode === "visual"} onClick={switchToVisual}>
          <Eye /> Visual
        </Button>
        <Button type="button" size="sm" variant={mode === "html" ? "secondary" : "ghost"} aria-pressed={mode === "html"} onClick={() => setMode("html")}>
          <Code2 /> HTML
        </Button>
      </div>

      {mode === "html" ? (
        <>
          {losses.length > 0 && (
            <Alert>
              <AlertDescription>
                Opened as HTML because the visual editor would remove: {losses.join(", ")}. Edit here to keep everything.
              </AlertDescription>
            </Alert>
          )}
          <Textarea
            id={id}
            value={value}
            onChange={(event) => onChange(event.target.value)}
            onBlur={onBlur}
            rows={18}
            spellCheck={false}
            aria-invalid={invalid || undefined}
            className="font-mono text-xs leading-relaxed"
          />
        </>
      ) : (
        <Visual id={id} value={value} onChange={onChange} onBlur={onBlur} invalid={invalid} />
      )}

      <AlertDialog open={confirming} onOpenChange={setConfirming}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Switch to the visual editor?</AlertDialogTitle>
            <AlertDialogDescription>
              Once you edit visually, this will be removed: {htmlLosses(value).join(", ")}. Nothing changes until you make an edit.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep HTML</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                setConfirming(false);
                setMode("visual");
              }}
            >
              Switch to visual
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function Visual({ id, value, onChange, onBlur, invalid }: Props) {
  // The last HTML this editor emitted, to tell our own updates from outside resets.
  const emitted = useRef(value);
  const [picking, setPicking] = useState(false);
  const [viewing, setViewing] = useState<{ files: LightboxFile[]; index: number } | null>(null);
  const base = useMediaBase();

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        // Keep each link's own target/rel instead of forcing target=_blank + nofollow.
        link: { openOnClick: false, autolink: true, HTMLAttributes: { target: null, rel: null, class: null } },
      }),
      Image.configure({ inline: false, allowBase64: false }),
    ],
    content: value || "",
    editorProps: {
      attributes: { id, role: "textbox", "aria-multiline": "true", class: "min-h-64 px-3 py-2 outline-none" },
    },
    onUpdate: ({ editor: e }) => {
      const html = isEmptyHtml(e.getHTML()) ? "" : e.getHTML();
      emitted.current = html;
      onChange(html);
    },
    onBlur: () => onBlur(),
  });

  // The form was reset (discard, or edited in the HTML tab): load it without emitting a change.
  useEffect(() => {
    if (!editor || value === emitted.current) return;
    emitted.current = value;
    editor.commands.setContent(value || "", { emitUpdate: false });
  }, [editor, value]);

  const insertImage = (target: Editor | null, url: string, alt: string) => target?.chain().focus().setImage({ src: url, alt }).run();

  return (
    <div className={cn("rounded-lg border border-input focus-within:border-ring focus-within:ring-3 focus-within:ring-ring/50", invalid && "border-destructive")}>
      <RichToolbar editor={editor} extra={[{ label: "Image", icon: ImagePlus, run: () => setPicking(true) }]} />
      <EditorContent
        editor={editor}
        className={EDITOR_CONTENT_CLASS}
        // Click selects an image (to move or delete it); double-click views it full screen.
        onDoubleClick={(event) => {
          const target = event.target;
          if (!(target instanceof HTMLImageElement) || !editor) return;
          const images = [...editor.view.dom.querySelectorAll("img")];
          setViewing({ files: images.map((img) => ({ url: img.src, mime: "image/*", alternativeText: img.alt })), index: images.indexOf(target) });
        }}
      />
      <Lightbox
        files={viewing?.files ?? []}
        index={viewing?.index ?? null}
        onIndexChange={(index) => setViewing((current) => (current && index !== null ? { ...current, index } : null))}
      />

      <Dialog open={picking} onOpenChange={setPicking}>
        <DialogContent className="flex h-[85vh] flex-col sm:max-w-5xl">
          <DialogHeader>
            <DialogTitle>Insert image</DialogTitle>
          </DialogHeader>
          {picking && (
            <MediaLibrary
              mode="pick"
              kinds={["image"]}
              accept={acceptFor(["images"])}
              onCancel={() => setPicking(false)}
              onPick={([file]) => {
                setPicking(false);
                if (file) insertImage(editor, mediaUrl(file.url, base), file.alternativeText);
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
