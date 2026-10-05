"use client";

import { useEffect, useState, useTransition } from "react";
import { createPortal } from "react-dom";
import { usePathname } from "next/navigation";
import { CircleHelp, Loader2, X } from "lucide-react";
import { getHelp } from "@/app/(cms)/help-actions";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Markdown } from "./markdown";

/** The guide for the current screen: /, /media, /activity, /users, or a content type (/page, /page/123…). */
export function screenTopic(pathname: string) {
  return pathname.split("/").filter(Boolean)[0] ?? "dashboard";
}

/** Side panel with a guide (Markdown from content/help). */
export function HelpPanel({
  title,
  kind,
  topic,
  onClose,
}: {
  title: string;
  kind: "screens" | "sections";
  topic: string;
  onClose: () => void;
}) {
  const [source, setSource] = useState<string | null | undefined>(undefined);
  const [, startLoading] = useTransition();

  useEffect(() => {
    startLoading(async () => setSource(await getHelp(kind, topic)));
  }, [kind, topic]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  // Rendered at the page root: a blurred ancestor (the top bar) would otherwise trap a fixed panel.
  return createPortal(
    <div className="fixed inset-0 z-50" role="dialog" aria-modal="true" aria-label={title}>
      <button type="button" aria-label="Close help" onClick={onClose} className="absolute inset-0 animate-in bg-black/20 backdrop-blur-[2px] fade-in" />
      <aside className="cms-glass absolute top-0 right-0 flex h-full w-full max-w-md animate-in flex-col border-l bg-card/95 shadow-2xl duration-200 slide-in-from-right">
        <div className="flex items-center gap-2 border-b px-5 py-3">
          <CircleHelp className="size-4 text-primary" />
          <span className="text-sm font-medium">{title}</span>
          <Button type="button" variant="ghost" size="icon-sm" className="ml-auto" onClick={onClose} aria-label="Close help">
            <X />
          </Button>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">
          {source === undefined ? (
            <Loader2 className="size-5 animate-spin text-muted-foreground" />
          ) : source ? (
            <Markdown source={source} />
          ) : (
            <p className="text-sm text-muted-foreground">There&apos;s no guide for this yet.</p>
          )}
        </div>
        <div className="border-t px-5 py-3 text-xs text-muted-foreground">
          Press <kbd className="rounded border bg-muted px-1 font-mono">?</kbd> for help on any screen.
        </div>
      </aside>
    </div>,
    document.body,
  );
}

/** "Help" in the top bar: the guide for the screen that's open. Also opens with "?". */
export function HelpButton({ className }: { className?: string }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      const typing = Boolean(target && (target.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName)));
      if (event.key === "?" && !typing && !event.metaKey && !event.ctrlKey) {
        event.preventDefault();
        setOpen(true);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={cn(
          "cms-glass inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm ring-1 ring-white/70 transition-shadow hover:shadow-[0_8px_24px_-10px_color-mix(in_oklab,var(--a-deep)_45%,transparent)] dark:ring-white/10",
          className,
        )}
        aria-label="Help for this screen"
        title="Help for this screen (?)"
      >
        <CircleHelp className="size-4 text-primary" /> Help
      </button>
      {open && <HelpPanel title="Help for this screen" kind="screens" topic={screenTopic(pathname)} onClose={() => setOpen(false)} />}
    </>
  );
}

/** "?" on a section card: what that section type does. */
export function SectionHelpButton({ uid, label }: { uid: string; label: string }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button
        type="button"
        size="icon-sm"
        variant="ghost"
        onClick={() => setOpen(true)}
        aria-label={`Help: ${label} section`}
        title={`What is the ${label} section?`}
      >
        <CircleHelp />
      </Button>
      {open && <HelpPanel title={`${label} section`} kind="sections" topic={uid.replace(/^sections\./, "")} onClose={() => setOpen(false)} />}
    </>
  );
}
