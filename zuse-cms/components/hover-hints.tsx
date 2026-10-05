"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

/**
 * One tooltip for the whole CMS: hovering (or keyboard-focusing) any button,
 * link, tab or switch shows what it does. The text comes from, in order,
 * data-hint, title, aria-label; it's only shown when it says more than the
 * visible text (so "Publish" doesn't get a "Publish" tooltip, but an icon-only
 * button or "Export CSV" with a title does). Native title tooltips are
 * replaced so they don't double up.
 */
const TARGETS = "button, a[href], [role=button], [role=tab], [role=switch], [role=radio], [role=menuitem], input[type=checkbox], [data-hint], [title], [data-title]";
const DELAY_MS = 350;
const GAP = 8;

type Hint = { text: string; x: number; y: number; below: boolean };

const normalise = (text: string) => text.replace(/\s+/g, " ").trim().toLowerCase();

/** The element's hint text, or null if it has none worth showing. */
export function hintFor(element: HTMLElement): string | null {
  // Move title into data-title so the browser's own tooltip doesn't also appear.
  const title = element.getAttribute("title");
  if (title) {
    element.dataset.title = title;
    element.removeAttribute("title");
    const hasText = Boolean(element.textContent?.trim());
    if (!hasText && !element.getAttribute("aria-label")) element.setAttribute("aria-label", title);
  }
  const hint = element.dataset.hint || element.dataset.title || element.getAttribute("aria-label");
  if (!hint?.trim()) return null;
  const visible = normalise(element.innerText || "");
  return visible && normalise(hint) === visible ? null : hint.trim();
}

function findTarget(node: EventTarget | null): HTMLElement | null {
  const element = node instanceof Element ? (node.closest(TARGETS) as HTMLElement | null) : null;
  // The site preview is the real site's markup: leave it alone.
  if (!element || element.closest(".site-preview, [data-no-hint]")) return null;
  return element;
}

export function HoverHints() {
  const [hint, setHint] = useState<Hint | null>(null);
  const current = useRef<HTMLElement | null>(null);
  const timer = useRef<number | undefined>(undefined);
  const bubble = useRef<HTMLDivElement>(null);
  const [x, setX] = useState<number | null>(null);

  useEffect(() => {
    // Focus hints are for keyboard users; a dialog focusing its first button after a click shouldn't show one.
    let keyboard = false;
    const hide = () => {
      window.clearTimeout(timer.current);
      current.current = null;
      setHint(null);
    };
    const show = (element: HTMLElement, immediate: boolean) => {
      if (current.current === element) return;
      hide();
      const text = hintFor(element);
      if (!text) return;
      current.current = element;
      timer.current = window.setTimeout(
        () => {
          if (current.current !== element || !element.isConnected) return;
          const rect = element.getBoundingClientRect();
          const below = rect.top < 44;
          setX(null);
          setHint({ text, x: rect.left + rect.width / 2, y: below ? rect.bottom + GAP : rect.top - GAP, below });
        },
        immediate ? 0 : DELAY_MS,
      );
    };

    const onOver = (event: PointerEvent) => {
      if (event.pointerType === "touch") return;
      const target = findTarget(event.target);
      if (target) show(target, false);
      else if (current.current) hide();
    };
    const onOut = (event: PointerEvent) => {
      if (!current.current) return;
      const next = event.relatedTarget;
      if (!(next instanceof Node) || !current.current.contains(next)) hide();
    };
    const onFocus = (event: FocusEvent) => {
      const target = findTarget(event.target);
      if (keyboard && target?.matches(":focus-visible")) show(target, true);
    };
    const onKey = (event: KeyboardEvent) => {
      keyboard = event.key === "Tab" || event.key.startsWith("Arrow") || keyboard;
      if (event.key === "Escape") hide();
    };
    const onPointerDown = () => {
      keyboard = false;
      hide();
    };

    document.addEventListener("pointerover", onOver);
    document.addEventListener("pointerout", onOut);
    document.addEventListener("pointerdown", onPointerDown, true);
    document.addEventListener("focusin", onFocus);
    document.addEventListener("focusout", hide);
    document.addEventListener("keydown", onKey);
    window.addEventListener("scroll", hide, true);
    window.addEventListener("blur", hide);
    return () => {
      hide();
      document.removeEventListener("pointerover", onOver);
      document.removeEventListener("pointerout", onOut);
      document.removeEventListener("pointerdown", onPointerDown, true);
      document.removeEventListener("focusin", onFocus);
      document.removeEventListener("focusout", hide);
      document.removeEventListener("keydown", onKey);
      window.removeEventListener("scroll", hide, true);
      window.removeEventListener("blur", hide);
    };
  }, []);

  // Keep the bubble inside the window horizontally once its width is known.
  useEffect(() => {
    if (!hint || !bubble.current) return;
    const width = bubble.current.offsetWidth;
    setX(Math.min(Math.max(hint.x - width / 2, GAP), window.innerWidth - width - GAP));
  }, [hint]);

  if (!hint) return null;
  return createPortal(
    <div
      ref={bubble}
      role="tooltip"
      className="pointer-events-none fixed z-[100] max-w-xs animate-in rounded-md bg-foreground px-2.5 py-1.5 text-xs leading-snug font-medium text-background shadow-lg duration-150 fade-in zoom-in-95"
      style={{
        left: x ?? hint.x,
        top: hint.y,
        transform: `${x === null ? "translateX(-50%) " : ""}${hint.below ? "" : "translateY(-100%)"}`,
        visibility: x === null ? "hidden" : "visible",
      }}
    >
      {hint.text}
    </div>,
    document.body,
  );
}
