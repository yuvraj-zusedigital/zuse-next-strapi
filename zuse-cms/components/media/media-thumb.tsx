"use client";

import { FileText, Film, Music } from "lucide-react";
import { kindOf, mediaUrl } from "@/lib/media";
import type { MediaFile } from "@/lib/types";
import { cn } from "@/lib/utils";
import { useMediaBase } from "./media-base";

const ICONS = { video: Film, audio: Music, document: FileText } as const;

/** Square preview: the image itself, or an icon for video/audio/documents. */
export function MediaThumb({ file, className }: { file: MediaFile; className?: string }) {
  const base = useMediaBase();
  const kind = kindOf(file.mime);

  if (kind === "image") {
    return (
      // eslint-disable-next-line @next/next/no-img-element -- CDN URLs of any host; no optimisation needed in the CMS
      <img
        src={mediaUrl(file.previewUrl, base)}
        alt={file.alternativeText}
        loading="lazy"
        className={cn("aspect-square w-full rounded-md bg-muted object-cover", className)}
      />
    );
  }

  const Icon = ICONS[kind];
  return (
    <div className={cn("flex aspect-square w-full flex-col items-center justify-center gap-1 rounded-md bg-muted text-muted-foreground", className)}>
      <Icon className="size-6" />
      <span className="text-[10px] uppercase">{file.ext.replace(".", "")}</span>
    </div>
  );
}
