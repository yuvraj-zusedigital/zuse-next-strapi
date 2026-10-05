"use client";

import { useState } from "react";
import { Button } from "@/components/ui";
import { AiSummaryIcon } from "@/components/icons/ai-summery";
import { PlayIcon } from "@/components/icons/play";
import { CloseIcon } from "@/components/icons";

import { AudioPlayer } from "@/components/ui/AudioPlayer";

interface BlogActionsProps {
  aiSummary?: string | null;
  readTime?: string;
  audioVariants?: { url: string; label: string;[key: string]: any }[];
}

export function BlogActions({ aiSummary, readTime = "4 min", audioVariants }: BlogActionsProps) {
  const [isSummaryOpen, setIsSummaryOpen] = useState(false);
  const [isAudioOpen, setIsAudioOpen] = useState(false);

  const audioUrl = audioVariants?.[0]?.url;

  return (
    <>
      <div className="flex flex-wrap items-center gap-3 mb-6">
        {aiSummary && (
          <Button
            variant="primary"
            className="w-auto"
            font="sans"
            size="sm"
            leftIcon={<AiSummaryIcon className="w-4 h-4 relative top-[1px]" />}
            onClick={() => setIsSummaryOpen(!isSummaryOpen)}
            aria-expanded={isSummaryOpen}
          >
            {isSummaryOpen ? "Hide Summary" : "Summary"}
          </Button>
        )}

        {isAudioOpen && audioUrl ? (
          <AudioPlayer url={audioUrl} autoPlay={true} onPause={() => setIsAudioOpen(false)} />
        ) : (
          <Button
            variant="secondary"
            className="w-auto"
            font="sans"
            size="sm"
            leftIcon={<PlayIcon className="w-4 h-4" />}
            onClick={() => {
              if (audioUrl) setIsAudioOpen(true);
            }}
          >
            {readTime}
          </Button>
        )}
      </div>

      {aiSummary && (
        <div
          className={`grid transition-[grid-template-rows,margin] duration-300 ease-out ${
            isSummaryOpen ? "grid-rows-[1fr] mb-6" : "grid-rows-[0fr] mb-0"
          }`}
          aria-hidden={!isSummaryOpen}
        >
          <div className="min-h-0 overflow-hidden">
            <div
              className={`relative p-5 bg-surface-50 rounded-lg border border-border-100 transition-[opacity,transform] duration-300 ease-out ${
                isSummaryOpen
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 -translate-y-2 pointer-events-none"
              }`}
            >
              <button
                type="button"
                className="absolute top-3 right-3 inline-flex items-center justify-center w-8 h-8 rounded-md text-ink-500 hover:text-ink-900 hover:bg-white/70 transition-colors cursor-pointer"
                aria-label="Close summary"
                tabIndex={isSummaryOpen ? 0 : -1}
                onClick={() => setIsSummaryOpen(false)}
              >
                <CloseIcon width={16} height={16} />
              </button>
              <h4 className="font-semibold text-ink-900 mb-3 flex items-center gap-2 pr-8">
                <AiSummaryIcon className="w-4 h-4 text-brand-600" />
                AI Generated Summary
              </h4>
              <p className="text-ink-700 font-sans text-[15px] leading-relaxed">{aiSummary}</p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
