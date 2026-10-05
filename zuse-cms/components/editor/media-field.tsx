"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight, ImagePlus, X } from "lucide-react";
import { Lightbox } from "@/components/media/lightbox";
import { MediaLibrary } from "@/components/media/media-library";
import { MediaThumb } from "@/components/media/media-thumb";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { acceptFor, kindOf } from "@/lib/media";
import type { MediaFile, MediaKind } from "@/lib/types";

const KINDS: Record<string, MediaKind[]> = {
  images: ["image"],
  videos: ["video"],
  audios: ["audio"],
  files: ["image", "video", "audio", "document"],
};

type Props = {
  id: string;
  label: string;
  multiple: boolean;
  allowedTypes?: string[];
  value: MediaFile[];
  onChange: (value: MediaFile[]) => void;
};

/** Selected file(s) for a media attribute, chosen from (or uploaded to) the media library. */
export function MediaField({ id, label, multiple, allowedTypes, value, onChange }: Props) {
  const [open, setOpen] = useState(false);
  const [viewing, setViewing] = useState<number | null>(null);
  const kinds = [...new Set((allowedTypes?.length ? allowedTypes : ["files"]).flatMap((type) => KINDS[type] ?? []))];

  const move = (index: number, by: number) => {
    const next = [...value];
    const [item] = next.splice(index, 1);
    next.splice(index + by, 0, item);
    onChange(next);
  };

  return (
    <div id={id} className="grid gap-2">
      {value.length > 0 && (
        <ul className="flex flex-wrap gap-3">
          {value.map((file, index) => (
            <li key={file.id} className="w-32">
              <div className="group relative">
                <button
                  type="button"
                  onClick={() => setViewing(index)}
                  aria-label={`View ${file.name}`}
                  className="block w-full cursor-zoom-in rounded-md outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
                >
                  <MediaThumb file={file} className="border transition-opacity hover:opacity-90" />
                </button>
                <div className="absolute inset-x-1 top-1 flex justify-between opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100">
                  {multiple ? (
                    <span className="flex gap-0.5">
                      <Button type="button" size="icon-xs" variant="secondary" aria-label={`Move ${file.name} earlier`} disabled={index === 0} onClick={() => move(index, -1)}>
                        <ChevronLeft />
                      </Button>
                      <Button type="button" size="icon-xs" variant="secondary" aria-label={`Move ${file.name} later`} disabled={index === value.length - 1} onClick={() => move(index, 1)}>
                        <ChevronRight />
                      </Button>
                    </span>
                  ) : (
                    <span />
                  )}
                  <Button type="button" size="icon-xs" variant="secondary" aria-label={`Remove ${file.name}`} onClick={() => onChange(value.filter((item) => item.id !== file.id))}>
                    <X />
                  </Button>
                </div>
              </div>
              <div className="mt-1 truncate text-xs text-muted-foreground" title={file.name}>
                {file.name}
              </div>
              {kindOf(file.mime) === "image" && !file.alternativeText && (
                <div className="text-xs text-amber-700 dark:text-amber-400">No alt text</div>
              )}
            </li>
          ))}
        </ul>
      )}

      <div>
        <Button type="button" variant="outline" onClick={() => setOpen(true)}>
          <ImagePlus /> {value.length === 0 ? (multiple ? "Choose files" : "Choose file") : multiple ? "Add or change files" : "Replace"}
        </Button>
      </div>

      <Lightbox files={value} index={viewing} onIndexChange={setViewing} />

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="flex h-[85vh] flex-col sm:max-w-5xl">
          <DialogHeader>
            <DialogTitle>{label}</DialogTitle>
          </DialogHeader>
          {open && (
            <MediaLibrary
              mode="pick"
              multiple={multiple}
              kinds={kinds}
              accept={acceptFor(allowedTypes)}
              initialSelection={value}
              onCancel={() => setOpen(false)}
              onPick={(files) => {
                onChange(files);
                setOpen(false);
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
