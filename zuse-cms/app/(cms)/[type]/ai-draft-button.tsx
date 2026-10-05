"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { draftPageWithAi } from "./ai-actions";

const TONES = ["Confident and plain-spoken (default)", "Warm and friendly", "Technical and detailed", "Short and punchy"];
const MIN_BRIEF = 20;

/** "Draft with AI" on the Pages list: a brief in, an unpublished draft page out. */
export function AiDraftButton({ available }: { available: boolean }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [brief, setBrief] = useState("");
  const [audience, setAudience] = useState("");
  const [tone, setTone] = useState(TONES[0]);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const submit = () => {
    setError(null);
    startTransition(async () => {
      const result = await draftPageWithAi({ brief, audience: audience || undefined, tone: tone === TONES[0] ? undefined : tone });
      if (!result.ok) {
        setError(result.message);
        return;
      }
      toast.success(`Draft created: ${result.name}`, {
        description: `${result.sections} sections${result.demo ? " (demo sample)" : ""}. Review the text, add images and SEO image, then publish.`,
      });
      setOpen(false);
      setBrief("");
      router.push(`/page/${result.documentId}`);
    });
  };

  return (
    <>
      <Button
        type="button"
        variant="outline"
        disabled={!available}
        onClick={() => setOpen(true)}
        data-hint={available ? "Describe a page and get a first draft built from text sections" : "Needs an OpenAI key in Strapi (OPENAI_API_KEY)"}
      >
        <Sparkles /> Draft with AI
      </Button>
      <Dialog open={open} onOpenChange={(next) => !pending && setOpen(next)}>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>Draft a page with AI</DialogTitle>
            <DialogDescription>
              Describe the page. You&apos;ll get an unpublished draft with an intro, text sections, an FAQ and SEO, ready to edit. Nothing goes live until you publish.
            </DialogDescription>
          </DialogHeader>
          <form
            className="grid gap-4"
            onSubmit={(event) => {
              event.preventDefault();
              if (brief.trim().length >= MIN_BRIEF && !pending) submit();
            }}
          >
            <div className="grid gap-2">
              <Label htmlFor="ai-brief">What is the page about?</Label>
              <Textarea
                id="ai-brief"
                rows={6}
                value={brief}
                onChange={(event) => setBrief(event.target.value)}
                maxLength={3000}
                placeholder="e.g. A landing page for our AI chatbot service for real estate agencies in Australia. Cover lead qualification, 24/7 enquiries and CRM integration. Goal: book a free consultation."
                disabled={pending}
                autoFocus
              />
              <p className="text-xs text-muted-foreground">Who it&apos;s for, what you offer, the key points and what visitors should do next. Avoid personal or confidential details.</p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor="ai-audience">Audience (optional)</Label>
                <Input id="ai-audience" value={audience} onChange={(event) => setAudience(event.target.value)} placeholder="e.g. Agency owners" disabled={pending} maxLength={200} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="ai-tone">Tone</Label>
                <select
                  id="ai-tone"
                  value={tone}
                  onChange={(event) => setTone(event.target.value)}
                  disabled={pending}
                  className="h-8 w-full min-w-0 rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-input/30"
                >
                  {TONES.map((item) => (
                    <option key={item}>{item}</option>
                  ))}
                </select>
              </div>
            </div>
            {error && (
              <p className="text-sm text-destructive" role="alert">
                {error}
              </p>
            )}
            <DialogFooter>
              <Button type="button" variant="ghost" onClick={() => setOpen(false)} disabled={pending}>
                Cancel
              </Button>
              <Button type="submit" disabled={pending || brief.trim().length < MIN_BRIEF}>
                {pending ? (
                  <>
                    <Loader2 className="animate-spin" /> Drafting… (up to a minute)
                  </>
                ) : (
                  <>
                    <Sparkles /> Create draft
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
