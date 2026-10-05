"use client";

import { Component, useDeferredValue, useEffect, useMemo, useRef, useState } from "react";
import { useFormContext, useWatch } from "react-hook-form";
import { Monitor, Smartphone, Tablet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { applySnippets, withBuiltIns } from "@/lib/snippets";
import { cn } from "@/lib/utils";
import { SECTION_RENDERERS } from "./sections";
import { Placeholder, type Values } from "./primitives";
import { PreviewFooter, PreviewHeader, useSiteChrome } from "./site-chrome";

export const FOCUS_SECTION_EVENT = "cms:focus-section";
export type FocusSectionDetail = { name: string; index: number };

const DEVICES = {
  desktop: { width: 1280, label: "Desktop", icon: Monitor },
  tablet: { width: 768, label: "Tablet", icon: Tablet },
  mobile: { width: 390, label: "Mobile", icon: Smartphone },
} as const;
type Device = keyof typeof DEVICES;

/**
 * Live, approximate preview of a page's sections, rendered from the form's
 * current values (no save needed). Click a section to edit it.
 */
export function PagePreview({ name }: { name: string }) {
  const { control } = useFormContext();
  const watched = useWatch({ control, name }) as Values[] | undefined;
  // Typing stays responsive; the preview catches up a moment later.
  const deferred = useDeferredValue(watched ?? []);
  const rawChrome = useSiteChrome();
  // {phone}, {year}… read as they will on the site.
  const snippets = useMemo(() => withBuiltIns(rawChrome?.snippets), [rawChrome]);
  const sections = useMemo(() => applySnippets(deferred, snippets), [deferred, snippets]);
  const chrome = useMemo(() => (rawChrome ? applySnippets(rawChrome, snippets) : rawChrome), [rawChrome, snippets]);
  const [device, setDevice] = useState<Device>("desktop");
  const [paneWidth, setPaneWidth] = useState(0);
  const pane = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = pane.current;
    if (!element) return;
    const observer = new ResizeObserver(([entry]) => setPaneWidth(entry.contentRect.width));
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  const { width } = DEVICES[device];
  // Render at the device's real width (so layouts match), scaled down to fit the pane.
  const zoom = paneWidth ? Math.min(1, (paneWidth - 24) / width) : 1;

  const focus = (index: number) =>
    window.dispatchEvent(new CustomEvent<FocusSectionDetail>(FOCUS_SECTION_EVENT, { detail: { name, index } }));

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="cms-glass flex items-center gap-2 border-b px-3 py-2">
        <span className="text-xs text-muted-foreground">
          Preview · approximate, updates as you type{chrome ? " · live header & footer" : ""}
        </span>
        <div className="ml-auto flex gap-1" role="group" aria-label="Preview width">
          {(Object.keys(DEVICES) as Device[]).map((key) => {
            const { label, icon: Icon } = DEVICES[key];
            return (
              <Button
                key={key}
                type="button"
                size="icon-sm"
                variant={device === key ? "secondary" : "ghost"}
                aria-pressed={device === key}
                aria-label={label}
                title={`${label} (${DEVICES[key].width}px)`}
                onClick={() => setDevice(key)}
              >
                <Icon />
              </Button>
            );
          })}
        </div>
      </div>
      <div ref={pane} className="min-h-0 flex-1 overflow-auto bg-muted/50 p-3">
        <div className="site-preview @container mx-auto min-h-full shadow-sm ring-1 ring-black/5" style={{ width, zoom }}>
          {chrome && <PreviewHeader chrome={chrome} />}
          {sections.length === 0 && (
            <div className="p-10">
              <Placeholder>Add sections to see them here.</Placeholder>
            </div>
          )}
          {sections.map((section, index) => {
            const Renderer = SECTION_RENDERERS[String(section.__component)];
            return (
              <div
                key={String(section.__key ?? index)}
                role="button"
                tabIndex={0}
                aria-label={`Edit section ${index + 1}`}
                onClick={() => focus(index)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    focus(index);
                  }
                }}
                className={cn("group/preview relative cursor-pointer outline-none", section.hidden === true && "opacity-35 grayscale")}
              >
                <span className="pointer-events-none absolute inset-0 z-10 hidden ring-2 ring-sky-500 ring-inset group-hover/preview:block group-focus-visible/preview:block" />
                <span className="pointer-events-none absolute top-2 left-2 z-10 hidden rounded bg-sky-500 px-2 py-0.5 text-xs font-medium text-white group-hover/preview:block group-focus-visible/preview:block">
                  Edit section {index + 1}
                </span>
                {section.hidden === true && (
                  <span className="pointer-events-none absolute top-2 right-2 z-10 rounded bg-site-ink/80 px-2 py-0.5 text-xs font-medium text-white">
                    Hidden on site
                  </span>
                )}
                <SectionBoundary>
                  {Renderer ? (
                    <Renderer data={section} />
                  ) : (
                    <div className="p-10">
                      <Placeholder>{String(section.__component)}</Placeholder>
                    </div>
                  )}
                </SectionBoundary>
              </div>
            );
          })}
          {chrome && <PreviewFooter chrome={chrome} />}
        </div>
      </div>
    </div>
  );
}

/** One broken section preview shouldn't take down the editor. */
class SectionBoundary extends Component<{ children: React.ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    if (this.state.failed) {
      return (
        <div className={cn("p-10")}>
          <Placeholder>This section can&apos;t be previewed.</Placeholder>
        </div>
      );
    }
    return this.props.children;
  }
}
