"use client";

import { useEffect, useState } from "react";
import { Dialog as DialogPrimitive } from "@base-ui/react/dialog";
import { AlertTriangle, ChevronLeft, ChevronRight, Copy, ExternalLink, FileText, Music, X, ZoomIn, ZoomOut } from "lucide-react";
import { toast } from "sonner";
import { formatSize, kindOf, mediaUrl } from "@/lib/media";
import type { MediaFile } from "@/lib/types";
import { cn } from "@/lib/utils";
import { useMediaBase } from "./media-base";

/** What the viewer needs; editor values and library files both fit. */
export type LightboxFile = Pick<MediaFile, "url" | "mime"> & Partial<Omit<MediaFile, "url" | "mime">>;

type Props = {
  files: LightboxFile[];
  /** The file shown; null = closed. */
  index: number | null;
  onIndexChange: (index: number | null) => void;
};

const roundButton =
  "grid size-9 place-items-center rounded-full bg-white/10 text-white ring-1 ring-white/15 backdrop-blur transition-colors hover:bg-white/20 focus-visible:ring-2 focus-visible:ring-white/60 outline-none disabled:pointer-events-none disabled:opacity-30";

/**
 * Full-screen viewer for images (and video/audio/documents): fits the window,
 * click or Z to view at full size, ← → between files, Esc to close.
 */
export function Lightbox({ files, index, onIndexChange }: Props) {
  const base = useMediaBase();
  const [zoomed, setZoomed] = useState(false);
  const open = index !== null && Boolean(files[index]);
  const file = open ? files[index] : null;
  const count = files.length;

  const go = (by: number) => {
    if (index === null || count < 2) return;
    setZoomed(false);
    onIndexChange((index + by + count) % count);
  };

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "ArrowRight") go(1);
      else if (event.key === "ArrowLeft") go(-1);
      else if (event.key.toLowerCase() === "z") setZoomed((value) => !value);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  const url = file ? mediaUrl(file.url, base) : "";
  const kind = file ? kindOf(file.mime) : "image";
  const name = file?.name || url.split("/").pop() || "File";

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(new URL(url, location.href).href);
      toast.success("Link copied");
    } catch {
      toast.error("Couldn't copy the link");
    }
  };

  return (
    <DialogPrimitive.Root
      open={open}
      onOpenChange={(next) => {
        if (!next) {
          setZoomed(false);
          onIndexChange(null);
        }
      }}
    >
      <DialogPrimitive.Portal>
        <DialogPrimitive.Backdrop forceRender className="fixed inset-0 z-[60] bg-black/85 backdrop-blur-sm duration-200 data-open:animate-in data-open:fade-in-0 data-closed:animate-out data-closed:fade-out-0" />
        <DialogPrimitive.Popup
          aria-label={`View ${name}`}
          className="fixed inset-0 z-[60] flex flex-col text-white outline-none duration-200 data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0"
        >
          {file && (
            <>
              {/* Top bar */}
              <div className="flex items-center gap-3 px-4 py-3">
                <div className="min-w-0 flex-1">
                  <DialogPrimitive.Title className="truncate text-sm font-medium">{name}</DialogPrimitive.Title>
                  <p className="truncate text-xs text-white/60">
                    {[
                      file.width && file.height ? `${file.width} × ${file.height}` : null,
                      file.size ? formatSize(file.size) : null,
                      file.ext ? file.ext.replace(".", "").toUpperCase() : null,
                      count > 1 ? `${index! + 1} of ${count}` : null,
                    ]
                      .filter(Boolean)
                      .join(" · ")}
                  </p>
                </div>
                {kind === "image" && (
                  <button type="button" className={roundButton} onClick={() => setZoomed((value) => !value)} aria-label={zoomed ? "Fit to screen (Z)" : "View at full size (Z)"}>
                    {zoomed ? <ZoomOut className="size-4" /> : <ZoomIn className="size-4" />}
                  </button>
                )}
                <button type="button" className={roundButton} onClick={copy} aria-label="Copy link to this file">
                  <Copy className="size-4" />
                </button>
                <a href={url} target="_blank" rel="noreferrer" className={roundButton} aria-label="Open the original in a new tab">
                  <ExternalLink className="size-4" />
                </a>
                <DialogPrimitive.Close className={roundButton} aria-label="Close (Esc)">
                  <X className="size-4" />
                </DialogPrimitive.Close>
              </div>

              {/* The file */}
              <div className="relative flex min-h-0 flex-1 items-center justify-center px-4 sm:px-16">
                <div
                  className={cn("flex size-full justify-center", zoomed ? "overflow-auto items-start" : "items-center")}
                  onClick={(event) => {
                    // Clicking the dark area around the image closes, like most viewers.
                    if (event.target === event.currentTarget) onIndexChange(null);
                  }}
                >
                  {kind === "image" && (
                    // eslint-disable-next-line @next/next/no-img-element -- CDN/local media of any host
                    <img
                      key={url}
                      src={url}
                      alt={file.alternativeText ?? ""}
                      onClick={() => setZoomed((value) => !value)}
                      className={cn(
                        "rounded-md shadow-2xl animate-in fade-in-0 duration-300",
                        zoomed ? "max-w-none cursor-zoom-out" : "max-h-full max-w-full cursor-zoom-in object-contain",
                      )}
                    />
                  )}
                  {kind === "video" && <video key={url} src={url} controls autoPlay className="max-h-full max-w-full rounded-md shadow-2xl" />}
                  {(kind === "audio" || kind === "document") && (
                    <div className="flex flex-col items-center gap-4 rounded-xl bg-white/5 p-10 ring-1 ring-white/10">
                      {kind === "audio" ? <Music className="size-10 text-white/70" /> : <FileText className="size-10 text-white/70" />}
                      {kind === "audio" ? (
                        <audio key={url} src={url} controls autoPlay />
                      ) : (
                        <a href={url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 text-sm underline underline-offset-4">
                          <ExternalLink className="size-4" /> Open {name}
                        </a>
                      )}
                    </div>
                  )}
                </div>

                {count > 1 && (
                  <>
                    <button type="button" className={cn(roundButton, "absolute top-1/2 left-3 size-11 -translate-y-1/2")} onClick={() => go(-1)} aria-label="Previous (←)">
                      <ChevronLeft className="size-5" />
                    </button>
                    <button type="button" className={cn(roundButton, "absolute top-1/2 right-3 size-11 -translate-y-1/2")} onClick={() => go(1)} aria-label="Next (→)">
                      <ChevronRight className="size-5" />
                    </button>
                  </>
                )}
              </div>

              {/* Alt text: what screen readers and Google read for this image */}
              <div className="px-4 py-3 text-center text-xs">
                {kind === "image" &&
                  (file.alternativeText ? (
                    <span className="text-white/70">
                      <span className="text-white/45">Alt text:</span> {file.alternativeText}
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 text-amber-300">
                      <AlertTriangle className="size-3.5" /> No alt text. Add it in the Media library.
                    </span>
                  ))}
              </div>
            </>
          )}
        </DialogPrimitive.Popup>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
