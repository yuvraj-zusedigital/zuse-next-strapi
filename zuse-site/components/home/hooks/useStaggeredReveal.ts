"use client";

import type { RefObject } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger, useGSAP);
}

/**
 * Recreates the site's original delayed SAL fade-up animation.
 * Elements entering together are staggered; later rows animate when reached.
 */
export function useStaggeredReveal(
  scope: RefObject<HTMLElement | null>,
  selector: string
) {
  useGSAP(
    () => {
      const elements = scope.current
        ? Array.from(scope.current.querySelectorAll<HTMLElement>(selector))
        : [];
      if (!elements.length) return;

      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.set(elements, {
          opacity: 0,
          y: 24,
          force3D: true,
        });

        ScrollTrigger.batch(elements, {
          start: "top 90%",
          once: true,
          onEnter: (batch) => {
            gsap.to(batch, {
              opacity: 1,
              duration: 1.4,
              stagger: 0.20,
              ease: "power1.out",
              overwrite: "auto",
            });
            gsap.to(batch, {
              y: 0,
              duration: 1.2,
              stagger: 0.20,
              ease: "power2.out",
              overwrite: "auto",
            });
          },
        });
      });

      mm.add("(prefers-reduced-motion: reduce)", () => {
        gsap.set(elements, { opacity: 1, y: 0 });
      });

      // Mobile-only: stacked layout means more above-the-fold reflow (web
      // fonts swapping, images finishing) after ScrollTrigger's first
      // measurement, so already-visible items can get stuck at opacity:0
      // until the next auto-refresh (window "load", which lags well behind
      // first paint on mobile networks). Force a refresh once things settle
      // so in-view items reveal right away. Desktop doesn't exhibit this,
      // so it's left on the default refresh cadence.
      let raf = 0;
      mm.add("(max-width: 767px)", () => {
        raf = requestAnimationFrame(() => ScrollTrigger.refresh());
        document.fonts?.ready?.then(() => ScrollTrigger.refresh()).catch(() => {});
      });

      return () => {
        if (raf) cancelAnimationFrame(raf);
        mm.revert();
      };
    },
    { scope }
  );
}
