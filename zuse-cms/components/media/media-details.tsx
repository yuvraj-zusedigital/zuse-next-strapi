"use client";

import { useEffect, useState, useTransition } from "react";
import { toast } from "sonner";
import { Copy, ExternalLink, Loader2 } from "lucide-react";
import { deleteMedia, getMedia, updateMedia } from "@/app/(cms)/media/actions";
import { ConfirmButton } from "@/components/confirm-button";
import { useCan } from "@/components/role-context";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { formatSize, kindOf, mediaUrl } from "@/lib/media";
import type { MediaFile } from "@/lib/types";
import { Lightbox } from "./lightbox";
import { useMediaBase } from "./media-base";

type Props = {
  file: MediaFile | null;
  onClose: () => void;
  onSaved: (file: MediaFile) => void;
  onDeleted: (id: number) => void;
};

/** View and edit one file: preview, name, alt text, caption, URL, delete. */
export function MediaDetails({ file, ...props }: Props) {
  // Keyed by id so the form starts from each file's own values.
  return file ? <DetailsDialog key={file.id} file={file} {...props} /> : null;
}

function DetailsDialog({ file, onClose, onSaved, onDeleted }: Props & { file: MediaFile }) {
  const base = useMediaBase();
  const canDelete = useCan("admin");
  const [draft, setDraft] = useState({ name: file.name, alternativeText: file.alternativeText, caption: file.caption });
  const [usedBy, setUsedBy] = useState<number | null>(null);
  const [pending, startTransition] = useTransition();
  const [viewing, setViewing] = useState<number | null>(null);

  useEffect(() => {
    getMedia(file.id).then(
      (full) => setUsedBy(full.usedBy ?? 0),
      () => setUsedBy(null),
    );
  }, [file.id]);

  const url = mediaUrl(file.url, base);
  const kind = kindOf(file.mime);
  const dirty =
    draft.name !== file.name || draft.alternativeText !== file.alternativeText || draft.caption !== file.caption;

  const save = () =>
    startTransition(async () => {
      const result = await updateMedia(file.id, draft);
      if (!result.ok) return void toast.error(result.message);
      toast.success("File details saved");
      onSaved(result.file);
    });

  const remove = () =>
    startTransition(async () => {
      const result = await deleteMedia(file.id);
      if (!result.ok) return void toast.error(result.message);
      toast.success("File deleted");
      onDeleted(file.id);
    });

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle className="truncate pr-8">{file.name}</DialogTitle>
        </DialogHeader>

        <div className="grid gap-6 md:grid-cols-[1fr_18rem]">
          <div className="flex min-h-48 items-center justify-center overflow-hidden rounded-lg bg-muted">
            {kind === "image" && (
              <button
                type="button"
                onClick={() => setViewing(0)}
                aria-label="View full screen"
                className="cursor-zoom-in outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
              >
                {/* eslint-disable-next-line @next/next/no-img-element -- CDN URLs of any host */}
                <img src={url} alt={file.alternativeText} className="max-h-[60vh] w-auto object-contain" />
              </button>
            )}
            {kind === "video" && <video src={url} controls className="max-h-[60vh] w-full" />}
            {kind === "audio" && <audio src={url} controls className="w-full px-4" />}
            {kind === "document" && (
              <a href={url} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-sm underline">
                <ExternalLink className="size-4" /> Open {file.ext}
              </a>
            )}
          </div>

          <div className="grid content-start gap-4">
            <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-xs text-muted-foreground">
              <dt>Type</dt>
              <dd className="text-foreground">{file.mime}</dd>
              <dt>Size</dt>
              <dd className="text-foreground">{formatSize(file.size)}</dd>
              {file.width && (
                <>
                  <dt>Dimensions</dt>
                  <dd className="text-foreground">
                    {file.width} × {file.height}
                  </dd>
                </>
              )}
              <dt>Used in</dt>
              <dd className="text-foreground">
                {usedBy === null ? "…" : usedBy === 0 ? "Not used" : `${usedBy} ${usedBy === 1 ? "place" : "places"}`}
              </dd>
            </dl>

            <div className="grid gap-2">
              <Label htmlFor="media-name">File name</Label>
              <Input id="media-name" value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} />
            </div>
            {kind === "image" && (
              <div className="grid gap-2">
                <Label htmlFor="media-alt">Alt text</Label>
                <Textarea
                  id="media-alt"
                  rows={2}
                  value={draft.alternativeText}
                  onChange={(e) => setDraft({ ...draft, alternativeText: e.target.value })}
                  aria-describedby="media-alt-hint"
                />
                <p id="media-alt-hint" className="text-xs text-muted-foreground">
                  Describes the image for screen readers and search engines.
                </p>
              </div>
            )}
            <div className="grid gap-2">
              <Label htmlFor="media-caption">Caption</Label>
              <Input id="media-caption" value={draft.caption} onChange={(e) => setDraft({ ...draft, caption: e.target.value })} />
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => navigator.clipboard.writeText(url).then(() => toast.success("URL copied"))}
            >
              <Copy /> Copy URL
            </Button>
          </div>
        </div>

        <DialogFooter className="sm:justify-between">
          {canDelete ? <ConfirmButton
            title="Delete this file?"
            description={
              usedBy
                ? `It's used in ${usedBy} ${usedBy === 1 ? "place" : "places"}. Those entries will lose it, and the live site too once they're republished. This can't be undone.`
                : "It's removed from storage. This can't be undone."
            }
            confirmLabel="Delete file"
            destructive
            disabled={pending}
            onConfirm={remove}
          >
            Delete
          </ConfirmButton> : <span />}
          <Button type="button" onClick={save} disabled={!dirty || pending}>
            {pending && <Loader2 className="animate-spin" />} Save details
          </Button>
        </DialogFooter>
        <Lightbox files={[{ ...file, ...draft }]} index={viewing} onIndexChange={setViewing} />
      </DialogContent>
    </Dialog>
  );
}
