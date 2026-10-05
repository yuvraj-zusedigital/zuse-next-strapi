"use client";

import React, { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { GradientText } from "@/components/ui/GradientText";
import type { ProcessStagesSection } from "@/lib/sections";

/** DOM ids of the stages (used for aria links); extra stages get numbered ids. */
const STAGE_IDS = ["discovery", "strategy", "design", "build", "launch"];

const toStages = (data: ProcessStagesSection) =>
  data.stages.map((stage, index) => ({
    id: STAGE_IDS[index] ?? `stage-${index + 1}`,
    index: String(index + 1).padStart(2, "0"),
    title: stage.title,
    shortTitle: stage.shortTitle || stage.title,
    body: stage.body ?? "",
  }));

declare global {
  interface Window {
    __ztProcessBoot?: () => Promise<void>;
    __ztProcessField?: { dispose?: () => void; setStage?: (idx: number) => void };
    setProcessStage?: (idx: number) => void;
  }
}

function loadScript(src: string) {
  return new Promise<void>((resolve, reject) => {
    const exact = document.querySelector(`script[src="${src}"]`);
    if (exact) {
      resolve();
      return;
    }
    const script = document.createElement("script");
    script.src = src;
    script.async = false;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error(`Failed to load ${src}`));
    document.body.appendChild(script);
  });
}

export default function Process({ data }: { data: ProcessStagesSection }) {
  const STAGES = toStages(data);
  // "Plain words *gradient words*": the plain part, then the gradient part.
  const [titlePlain, titleGradient = ""] = (data.title ?? "").split(/\*([^*]*)\*/);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const desktopMenuRef = useRef<HTMLDivElement>(null);
  const desktopWrapRefs = useRef<(HTMLDivElement | null)[]>([]);
  const mobileListRef = useRef<HTMLDivElement>(null);
  const mobileItemRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const [activeStep, setActiveStep] = useState(0);
  const [hoveredStep, setHoveredStep] = useState<number | null>(null);
  const [indicator, setIndicator] = useState({ left: 0, width: 0, ready: false });
  const activeStepRef = useRef(0);
  const indicatorStep = hoveredStep ?? activeStep;

  const updateIndicator = useCallback((index: number) => {
    const menu = desktopMenuRef.current;
    const wrap = desktopWrapRefs.current[index];
    if (!menu || !wrap) return;
    const menuRect = menu.getBoundingClientRect();
    const wrapRect = wrap.getBoundingClientRect();
    setIndicator({
      left: wrapRect.left - menuRect.left,
      width: wrapRect.width,
      ready: true,
    });
  }, []);

  useEffect(() => {
    // Keep indicator perfectly in sync with DOM during flex-grow layout shifts
    const menu = desktopMenuRef.current;
    if (!menu) return;
    
    const observer = new ResizeObserver(() => {
      updateIndicator(hoveredStep ?? activeStep);
    });
    
    desktopWrapRefs.current.forEach((wrap) => {
      if (wrap) observer.observe(wrap);
    });
    
    return () => observer.disconnect();
  }, [hoveredStep, activeStep, updateIndicator]);

  useLayoutEffect(() => {
    updateIndicator(indicatorStep);
  }, [indicatorStep, updateIndicator]);

  useEffect(() => {
    activeStepRef.current = activeStep;
  }, [activeStep]);

  useEffect(() => {
    const onResize = () => updateIndicator(activeStepRef.current);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [updateIndicator]);

  useEffect(() => {
    // The particle field is a decorative WebGL script (~570KB). Skip it entirely
    // for reduced-motion users, and otherwise defer loading until the Process
    // section nears the viewport so it never weighs on the initial page load.
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) {
      return;
    }

    let cancelled = false;
    let started = false;

    const boot = async () => {
      if (started) return;
      started = true;
      try {
        const LOADER_SRC = "/js/zt-process/loader.js?v=linewidth-step5-sharp";
        document
          .querySelectorAll('script[src^="/js/zt-process/loader.js"]')
          .forEach((el) => el.remove());
        await loadScript(LOADER_SRC);
        if (cancelled) return;
        await window.__ztProcessBoot?.();
        if (!cancelled) window.setProcessStage?.(activeStepRef.current);
      } catch {
        // Canvas animation is progressive enhancement
      }
    };

    // Observe the section (full-width), not the canvas — the canvas is 0-width
    // until the script sizes it, and an observer never fires on a 0-area element.
    const target = document.getElementById("process-section");
    let observer: IntersectionObserver | undefined;
    if (target && "IntersectionObserver" in window) {
      observer = new IntersectionObserver(
        (entries) => {
          if (entries.some((e) => e.isIntersecting)) {
            observer?.disconnect();
            void boot();
          }
        },
        { rootMargin: "200px" }
      );
      observer.observe(target);
    } else {
      void boot();
    }

    return () => {
      cancelled = true;
      observer?.disconnect();
      try {
        window.__ztProcessField?.dispose?.();
      } catch {
        /* ignore */
      }
      window.__ztProcessField = undefined;
    };
  }, []);

  // Sync active step when the mobile carousel is swiped
  useEffect(() => {
    const list = mobileListRef.current;
    if (!list) return;

    const onScroll = () => {
      if (window.innerWidth >= 768) return;
      const items = mobileItemRefs.current;
      const scrollLeft = list.scrollLeft;
      let best = 0;
      let bestDist = Infinity;
      for (let i = 0; i < items.length; i++) {
        const el = items[i];
        if (!el) continue;
        const dist = Math.abs(el.offsetLeft - 16 - scrollLeft);
        if (dist < bestDist) {
          bestDist = dist;
          best = i;
        }
      }
      if (best !== activeStepRef.current) {
        setActiveStep(best);
      }
    };

    let raf = 0;
    const onScrollRaf = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(onScroll);
    };
    list.addEventListener("scroll", onScrollRaf, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      list.removeEventListener("scroll", onScrollRaf);
    };
  }, []);

  const selectStep = (index: number) => {
    if (index === activeStepRef.current && window.innerWidth >= 768) return;
    setActiveStep(index);
    window.setProcessStage?.(index);
    requestAnimationFrame(() => updateIndicator(index));
    const list = mobileListRef.current;
    const item = mobileItemRefs.current[index];
    if (list && item && window.innerWidth < 768) {
      list.scrollTo({
        left: item.offsetLeft - 16,
        behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
          ? "auto"
          : "smooth",
      });
    }
  };

  return (
    <section
      id="process-section"
      className="process-section"
      aria-label="AI Strategy, Website Design and App Development Process"
    >
      <div className="process-section__container">
        <h2 className="process-section__title">
          <span className="process-section__title-plain">{titlePlain}</span>
          {titleGradient ? (
            <GradientText as="span" className="zuse-display-gradient">
              {titleGradient}
            </GradientText>
          ) : null}
        </h2>

        {/* Desktop — sliding top/bottom indicators on click + hover */}
        <div
          ref={desktopMenuRef}
          className="process-section__stats-menu process-section__stats-menu--desktop"
          role="tablist"
          aria-label="Process stages"
          onMouseLeave={() => setHoveredStep(null)}
        >
          <span
            className={`process-section__tab-indicator process-section__tab-indicator--top${indicator.ready ? " is-ready" : ""}${hoveredStep !== null && hoveredStep !== activeStep ? " is-sliding" : ""}`}
            aria-hidden="true"
            style={{
              width: indicator.width,
              transform: `translate3d(${indicator.left}px, 0, 0)`,
            }}
          />
          <span
            className={`process-section__tab-indicator process-section__tab-indicator--bottom${indicator.ready ? " is-ready" : ""}${hoveredStep !== null && hoveredStep !== activeStep ? " is-sliding" : ""}`}
            aria-hidden="true"
            style={{
              width: indicator.width,
              transform: `translate3d(${indicator.left}px, 0, 0)`,
            }}
          />
          {STAGES.map((stage, index) => {
            const isActive = index === activeStep;
            return (
              <div
                key={stage.id}
                ref={(el) => {
                  desktopWrapRefs.current[index] = el;
                }}
                className={`process-section__stat-wrap${isActive ? " is-displayed" : ""}`}
                onMouseEnter={() => setHoveredStep(index)}
              >
                <button
                  type="button"
                  role="tab"
                  id={`process-stat-${stage.id}`}
                  aria-selected={isActive}
                  aria-controls="process-canvas-wrapper"
                  className={`process-section__stat${isActive ? " is-active" : ""}`}
                  onClick={() => selectStep(index)}
                >
                  <span className="process-section__stat-index">
                    {stage.index}
                  </span>
                  <span className="process-section__stat-title">
                    {isActive ? stage.title : stage.shortTitle}
                  </span>
                  <span className="process-section__stat-desc">
                    {stage.body}
                  </span>
                </button>
              </div>
            );
          })}
        </div>

        {/* Mobile — carousel + arrows */}
        <div className="process-section__mobile">
          <div
            ref={mobileListRef}
            className="process-section__stats-menu process-section__stats-menu--mobile"
            role="tablist"
            aria-label="Process stages"
          >
            {STAGES.map((stage, index) => {
              const isActive = index === activeStep;
              return (
                <button
                  key={stage.id}
                  type="button"
                  role="tab"
                  id={`process-stat-mobile-${stage.id}`}
                  aria-selected={isActive}
                  aria-controls="process-canvas-wrapper"
                  ref={(el) => {
                    mobileItemRefs.current[index] = el;
                  }}
                  className={`process-section__stat${isActive ? " is-active" : ""}`}
                  onClick={() => selectStep(index)}
                >
                  <span className="process-section__stat-index">
                    {stage.index}
                  </span>
                  <span className="process-section__stat-title">
                    {stage.title}
                  </span>
                  <span className="process-section__stat-desc">
                    {stage.body}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="process-section__arrows">
            <button
              type="button"
              className="process-section__arrow"
              aria-label="Previous step"
              disabled={activeStep === 0}
              onClick={() => selectStep(Math.max(0, activeStep - 1))}
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                aria-hidden="true"
              >
                <path
                  d="M19 12H5M12 19l-7-7 7-7"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
            <button
              type="button"
              className="process-section__arrow is-next"
              aria-label="Next step"
              disabled={activeStep === STAGES.length - 1}
              onClick={() =>
                selectStep(Math.min(STAGES.length - 1, activeStep + 1))
              }
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                aria-hidden="true"
              >
                <path
                  d="M5 12h14M12 5l7 7-7 7"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>
      <div className="process-section__viz-bg" aria-hidden="true" />
      <div
        id="process-canvas-wrapper"
        className="process-section__viz"
        role="tabpanel"
        aria-labelledby={`process-stat-${STAGES[activeStep].id}`}
      >

        <canvas
          id="process-canvas"
          ref={canvasRef}
          className="process-section__canvas"
          aria-hidden="true"
        />
      </div>
    </section>
  );
}
