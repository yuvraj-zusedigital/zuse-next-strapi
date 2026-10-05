import type { MediaFile, MediaKind } from "@/lib/types";

/** Local uploads come back as /uploads/…; S3/CloudFront URLs are already absolute. */
export function mediaUrl(url: string, base: string) {
  return /^https?:\/\//.test(url) ? url : `${base}${url}`;
}

export function formatSize(kb: number) {
  if (kb < 1024) return `${Math.round(kb)} KB`;
  return `${(kb / 1024).toFixed(1)} MB`;
}

export function kindOf(mime: string): MediaKind {
  if (mime.startsWith("image/")) return "image";
  if (mime.startsWith("video/")) return "video";
  if (mime.startsWith("audio/")) return "audio";
  return "document";
}

/** Accepted types, matching src/api/cms/services/media.js. */
export const ACCEPT = "image/jpeg,image/png,image/webp,image/gif,image/avif,video/mp4,video/webm,video/quicktime,audio/mpeg,audio/mp4,audio/wav,audio/ogg,application/pdf";

/** Accept value for a field restricted by Strapi's allowedTypes (images, videos, audios, files). */
export function acceptFor(allowedTypes?: string[]) {
  if (!allowedTypes?.length || allowedTypes.includes("files")) return ACCEPT;
  const prefixes = allowedTypes.map((type) => ({ images: "image/", videos: "video/", audios: "audio/" })[type]).filter(Boolean);
  return ACCEPT.split(",").filter((mime) => prefixes.some((prefix) => mime.startsWith(prefix!))).join(",");
}

/** A populated media value from an entry (Strapi file object) → MediaFile. */
export function toMediaFile(file: Record<string, unknown>): MediaFile {
  const formats = (file.formats ?? {}) as Record<string, { url: string }>;
  return {
    id: Number(file.id),
    name: String(file.name ?? ""),
    alternativeText: String(file.alternativeText ?? ""),
    caption: String(file.caption ?? ""),
    url: String(file.url),
    previewUrl: (formats.small ?? formats.thumbnail)?.url ?? String(file.url),
    mime: String(file.mime ?? ""),
    ext: String(file.ext ?? ""),
    size: Number(file.size ?? 0),
    width: (file.width as number) ?? null,
    height: (file.height as number) ?? null,
    createdAt: String(file.createdAt ?? ""),
    updatedAt: String(file.updatedAt ?? ""),
  };
}

export class SessionExpiredError extends Error {
  constructor() {
    super("Your session ended. Sign in again.");
  }
}

/**
 * Uploads through the CMS's streaming route. Uses XHR (not fetch) for upload
 * progress. Resolves with the created files; rejects with a readable message.
 */
export function uploadFiles(files: File[], onProgress?: (fraction: number) => void): Promise<MediaFile[]> {
  return new Promise((resolve, reject) => {
    const body = new FormData();
    for (const file of files) body.append("files", file, file.name);

    const xhr = new XMLHttpRequest();
    xhr.open("POST", "/api/media/upload");
    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) onProgress?.(event.loaded / event.total);
    };
    xhr.onerror = () => reject(new Error("Upload failed. Check your connection and try again."));
    xhr.onload = () => {
      let response: { data?: MediaFile[]; error?: { message?: string } } = {};
      try {
        response = JSON.parse(xhr.responseText);
      } catch {
        // fall through to the status-based message
      }
      if (xhr.status === 401) return reject(new SessionExpiredError());
      if (xhr.status >= 200 && xhr.status < 300 && response.data) resolve(response.data);
      else reject(new Error(response.error?.message ?? `Upload failed (${xhr.status})`));
    };
    xhr.send(body);
  });
}
