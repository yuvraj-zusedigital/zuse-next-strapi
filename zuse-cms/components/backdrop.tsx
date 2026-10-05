"use client";

import { useEffect, useRef } from "react";

/**
 * Brand backdrop behind the CMS: slowly drifting colour, a faint dot grid and
 * a soft light that follows the cursor. Purely decorative (pointer-events off).
 */
export function Backdrop() {
  const spotlight = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let frame = 0;
    const move = (event: PointerEvent) => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        spotlight.current?.style.setProperty("--cms-x", `${event.clientX}px`);
        spotlight.current?.style.setProperty("--cms-y", `${event.clientY}px`);
      });
    };
    window.addEventListener("pointermove", move, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("pointermove", move);
    };
  }, []);

  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      {/* Colours and strengths: --blob-* in app/globals.css (checked by the glass contrast test). */}
      <div className="cms-blob cms-blob-a -top-40 -left-32 size-[38rem]" />
      <div className="cms-blob cms-blob-b top-1/4 -right-40 size-[34rem]" />
      <div className="cms-blob cms-blob-c -bottom-48 left-1/3 size-[40rem]" />
      <div className="cms-blob cms-blob-d top-1/2 left-1/4 size-[26rem]" />
      <div className="cms-grid absolute inset-0" />
      <div ref={spotlight} className="cms-spotlight absolute inset-0" />
    </div>
  );
}
