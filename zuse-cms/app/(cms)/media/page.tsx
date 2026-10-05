import type { Metadata } from "next";
import { MediaLibrary } from "@/components/media/media-library";

export const metadata: Metadata = { title: "Media library" };

export default function MediaPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Media library</h1>
        <p className="text-sm text-muted-foreground">
          Images, videos, audio and PDFs used across the site. Drop files anywhere below to upload.
        </p>
      </div>
      <MediaLibrary mode="manage" />
    </div>
  );
}
