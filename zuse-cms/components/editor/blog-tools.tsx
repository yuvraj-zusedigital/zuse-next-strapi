"use client";

import { useEffect, useState, useTransition } from "react";
import { toast } from "sonner";
import { AudioLines, Loader2, Sparkles } from "lucide-react";
import {
  generateBlogAudio,
  generateBlogSummary,
  getBlogTools,
  type BlogTools as Tools,
} from "@/app/(cms)/[type]/blog-actions";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import type { EntryStatus } from "@/lib/types";

const POLL_MS = 2000;

type Props = {
  documentId: string;
  /** Saves pending edits first (the tools read the saved draft). Resolves false if saving failed. */
  ensureSaved: () => Promise<boolean>;
  onSummary: (summary: string, status: EntryStatus) => void;
};

/** AI summary and text-to-speech for a blog post (Editor-only versions of the Strapi admin side panels). */
export function BlogTools({ documentId, ensureSaved, onSummary }: Props) {
  const [tools, setTools] = useState<Tools | null>(null);
  const [summaryError, setSummaryError] = useState<string | null>(null);
  const [summarizing, startSummary] = useTransition();
  const [starting, startAudio] = useTransition();
  const generating = tools?.ttsStatus === "generating";

  // Load once, then poll while audio is being generated.
  useEffect(() => {
    let cancelled = false;
    const load = () =>
      getBlogTools(documentId).then(
        (next) => !cancelled && setTools(next),
        () => !cancelled && toast.error("Couldn't load the blog tools."),
      );
    load();
    const timer = generating ? setInterval(load, POLL_MS) : undefined;
    return () => {
      cancelled = true;
      clearInterval(timer);
    };
  }, [documentId, generating]);

  const summarize = () =>
    startSummary(async () => {
      setSummaryError(null);
      if (!(await ensureSaved())) return;
      const result = await generateBlogSummary(documentId);
      if (!result.ok) return setSummaryError(result.message);
      onSummary(result.aiSummary, result.status);
      toast.success("AI summary generated");
    });

  const generateAudio = (provider: "openai" | "elevenlabs") =>
    startAudio(async () => {
      if (!(await ensureSaved())) return;
      const result = await generateBlogAudio(documentId, provider);
      if (!result.ok) return void toast.error(result.message);
      setTools((current) => (current ? { ...current, ttsStatus: "generating", ttsProgress: { message: "Starting…" } } : current));
    });

  const progress = tools?.ttsProgress;
  const fraction =
    progress?.totalVoices && progress.totalChunks
      ? ((Math.max(0, (progress.currentVoice ?? 1) - 1) + (progress.chunk ?? 0) / progress.totalChunks) / progress.totalVoices) * 100
      : null;

  return (
    <section aria-labelledby="blog-tools" className="grid gap-4 rounded-lg border bg-muted/30 p-4 @xl:grid-cols-2">
      <h2 id="blog-tools" className="sr-only">
        AI and audio tools
      </h2>

      <div className="space-y-2">
        <div className="flex items-center gap-2 text-sm font-medium">
          <Sparkles className="size-4" /> AI summary
        </div>
        <p className="text-xs text-muted-foreground">Writes a short summary from the saved title and body (OpenAI) into the “AI summary” field.</p>
        <Button type="button" variant="outline" size="sm" onClick={summarize} disabled={summarizing}>
          {summarizing && <Loader2 className="animate-spin" />} {tools?.aiSummary ? "Regenerate summary" : "Generate summary"}
        </Button>
        {summaryError && (
          <Alert variant="destructive">
            <AlertDescription>{summaryError}</AlertDescription>
          </Alert>
        )}
      </div>

      <div className="space-y-2">
        <div className="flex items-center gap-2 text-sm font-medium">
          <AudioLines className="size-4" /> Listen to this article
        </div>
        <p className="text-xs text-muted-foreground">Reads the saved post aloud in several voices. Runs in the background; you can keep editing.</p>
        <div className="flex flex-wrap gap-2">
          <Button type="button" variant="outline" size="sm" disabled={!tools || generating || starting} onClick={() => generateAudio("openai")}>
            {starting && <Loader2 className="animate-spin" />} Generate with OpenAI
          </Button>
          <Button type="button" variant="outline" size="sm" disabled={!tools || generating || starting} onClick={() => generateAudio("elevenlabs")}>
            Generate with ElevenLabs
          </Button>
        </div>

        {generating && (
          <div className="space-y-1.5" aria-live="polite">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Loader2 className="size-3 animate-spin" /> {progress?.message ?? "Generating audio…"}
            </div>
            {fraction !== null && <Progress value={Math.round(fraction)} aria-label="Audio generation progress" />}
          </div>
        )}
        {tools?.ttsStatus === "failed" && (
          <Alert variant="destructive">
            <AlertDescription>{progress?.message ?? "Audio generation failed."}</AlertDescription>
          </Alert>
        )}
        {tools && tools.audioVariants.length > 0 && (
          <ul className="space-y-2 pt-1">
            {tools.audioVariants.map((variant) => (
              <li key={variant.url} className="space-y-1">
                <div className="text-xs text-muted-foreground">{variant.label ?? variant.voice ?? "Audio"}</div>
                <audio src={variant.url} controls preload="none" className="h-8 w-full" />
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
