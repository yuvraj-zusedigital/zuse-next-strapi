"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
  type MouseEvent as ReactMouseEvent,
} from "react";
import { GradientTitle } from "@/components/sections/InlineText";
import BlogCard from "@/components/blog/BlogCard";
import { useStaggeredReveal } from "./hooks/useStaggeredReveal";

export type HomeBlogPost = {
  id: string | number;
  title: string;
  image: string;
  href: string;
};

const FALLBACK_BLOG_POSTS: HomeBlogPost[] = [
  {
    id: 1,
    title: "My 2026 AI Growth Advice for SMEs, Featured in Inside Small Business",
    image: "/images/blogs/blog-1.png",
    href: "/blog/my-2026-ai-growth-advice-for-smes-featured-in-inside-small-business",
  },
  {
    id: 2,
    title: "The Zuse Process: Our Web App Development Process (Melbourne to Global)",
    image: "/images/blogs/blog-3.png",
    href: "/blog/the-zuse-process-our-web-app-development-process-melbourne-to-global",
  },
];

/** Stripe FullWidthCarousel thresholds */
const CLICK_THRESHOLD = 5;
const DRAG_THRESHOLD = 0.2;

function NavArrow({ direction }: { direction: "prev" | "next" }) {
  const isPrev = direction === "prev";
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden="true"
    >
      {isPrev ? (
        <path d="M19 12H5M12 19l-7-7 7-7" strokeLinecap="round" strokeLinejoin="round" />
      ) : (
        <path d="M5 12h14M12 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
      )}
    </svg>
  );
}

export default function Blog({ posts = [], title = "From the *Blog*" }: { posts?: HomeBlogPost[]; title?: string }) {
  const blogPosts = posts.length ? posts : FALLBACK_BLOG_POSTS;
  const sectionRef = useRef<HTMLElement>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<(HTMLElement | null)[]>([]);
  const leftSpacerRef = useRef<HTMLDivElement>(null);

  const [activeIndex, setActiveIndex] = useState(0);
  const [lastIndex, setLastIndex] = useState(blogPosts.length - 1);
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(true);
  const lastIndexRef = useRef(blogPosts.length - 1);
  useStaggeredReveal(sectionRef, ".zuse-blog-fwc-item");

  const dragRef = useRef({
    isDragging: false,
    pointerId: -1,
    startX: 0,
    startY: 0,
    lastX: 0,
    dragDirection: 0,
    itemWidth: 0,
    leftSpacerWidth: 0,
  });

  const updateLayoutVars = useCallback(() => {
    const root = rootRef.current;
    if (!root) return;
    const ww = window.innerWidth;
    root.style.setProperty("--windowWidth", `${ww}px`);
  }, []);

  const measure = useCallback(() => {
    updateLayoutVars();
    const first = itemRefs.current[0];
    if (!first) return;

    // Item stride = full item box (includes padding-right gap), matching Stripe wrappers
    dragRef.current.itemWidth = first.offsetWidth;
    dragRef.current.leftSpacerWidth = leftSpacerRef.current?.offsetWidth ?? 0;

    const track = trackRef.current;
    if (!track) return;
    const maxScroll = Math.max(0, track.scrollWidth - track.clientWidth);
    const origin = first.offsetLeft - dragRef.current.leftSpacerWidth;
    const maxIndex = Math.max(
      0,
      Math.min(
        blogPosts.length - 1,
        Math.ceil((maxScroll - origin) / dragRef.current.itemWidth - 1e-6)
      )
    );
    lastIndexRef.current = maxIndex;
    setLastIndex(maxIndex);
    setActiveIndex((current) => Math.min(current, maxIndex));
    setCanPrev(track.scrollLeft > 2);
    setCanNext(track.scrollLeft < maxScroll - 2);
  }, [blogPosts.length, updateLayoutVars]);

  const getScrollProgress = useCallback(() => {
    const track = trackRef.current;
    const first = itemRefs.current[0];
    const itemWidth = dragRef.current.itemWidth || 1;
    if (!track || !first) {
      return { current: { index: 0, progress: 0 }, next: { index: 0, progress: 0 } };
    }

    const origin = first.offsetLeft - dragRef.current.leftSpacerWidth;
    const raw = (track.scrollLeft - origin) / itemWidth;
    const maxIndex = lastIndexRef.current;
    const clamped = Math.max(0, Math.min(maxIndex, raw));
    const index = Math.min(maxIndex, Math.floor(clamped + 1e-6));
    const progress = Math.max(0, Math.min(1, clamped - index));
    const nextIndex = Math.min(maxIndex, index + 1);

    return {
      current: { index, progress },
      next: { index: nextIndex, progress },
    };
  }, []);

  const goToSlide = useCallback((index: number, behavior: ScrollBehavior = "smooth") => {
    const track = trackRef.current;
    const targetIndex = Math.max(0, Math.min(lastIndexRef.current, index));
    const item = itemRefs.current[targetIndex];
    if (!track || !item) return;

    const target = item.offsetLeft - dragRef.current.leftSpacerWidth;
    track.scrollTo({ left: Math.max(0, target), behavior });
    setActiveIndex(targetIndex);
  }, []);

  const syncFromScroll = useCallback(() => {
    const { current } = getScrollProgress();
    const nearest =
      current.progress >= 0.5
        ? Math.min(lastIndexRef.current, current.index + 1)
        : current.index;
    setActiveIndex(nearest);

    const track = trackRef.current;
    if (!track) return;
    const maxScroll = Math.max(0, track.scrollWidth - track.clientWidth);
    setCanPrev(track.scrollLeft > 2);
    setCanNext(track.scrollLeft < maxScroll - 2);
  }, [getScrollProgress]);

  useEffect(() => {
    measure();
    const onResize = () => measure();
    window.addEventListener("resize", onResize);

    const track = trackRef.current;
    let raf = 0;
    const onScroll = () => {
      if (!raf) {
        raf = requestAnimationFrame(() => {
          raf = 0;
          syncFromScroll();
        });
      }
    };
    track?.addEventListener("scroll", onScroll, { passive: true });

    const ro =
      typeof ResizeObserver !== "undefined" ? new ResizeObserver(() => measure()) : null;
    if (rootRef.current) ro?.observe(rootRef.current);
    if (leftSpacerRef.current) ro?.observe(leftSpacerRef.current);

    return () => {
      window.removeEventListener("resize", onResize);
      track?.removeEventListener("scroll", onScroll);
      if (raf) cancelAnimationFrame(raf);
      ro?.disconnect();
    };
  }, [measure, syncFromScroll]);

  const endDrag = useCallback(() => {
    const track = trackRef.current;
    const d = dragRef.current;
    if (!track || d.pointerId < 0) return;

    const wasDragging = d.isDragging;
    d.pointerId = -1;

    if (!wasDragging) {
      track.style.scrollSnapType = "";
      d.isDragging = false;
      return;
    }

    const { current, next } = getScrollProgress();
    let target = current.index;
    if (d.dragDirection === 1 && current.index < next.index && next.progress > DRAG_THRESHOLD) {
      target = next.index;
    } else if (
      d.dragDirection === -1 &&
      current.index < next.index &&
      current.progress < 1 - DRAG_THRESHOLD
    ) {
      target = current.index;
    } else if (d.dragDirection === -1 && current.progress >= 1 - DRAG_THRESHOLD) {
      target = next.index;
    }

    goToSlide(target, "smooth");
    requestAnimationFrame(() => {
      track.style.scrollSnapType = "";
    });
    window.setTimeout(() => {
      d.isDragging = false;
    }, 40);
  }, [getScrollProgress, goToSlide]);

  const handlePointerDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (e.pointerType === "touch") return; // native touch scroll + snap
    if (e.button !== 0) return;
    const track = trackRef.current;
    if (!track) return;

    const d = dragRef.current;
    d.pointerId = e.pointerId;
    d.isDragging = false;
    d.startX = e.clientX;
    d.startY = e.clientY;
    d.lastX = e.clientX;
    d.dragDirection = 0;
    // Don't capture yet — capture only after drag starts so Link clicks work.
    track.style.scrollSnapType = "none";
  };

  const handlePointerMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    const d = dragRef.current;
    const track = trackRef.current;
    if (!track || d.pointerId !== e.pointerId) return;

    if (
      !d.isDragging &&
      (Math.abs(d.startX - e.clientX) > CLICK_THRESHOLD ||
        Math.abs(d.startY - e.clientY) > CLICK_THRESHOLD)
    ) {
      d.isDragging = true;
      track.setPointerCapture?.(e.pointerId);
    }

    const delta = d.lastX - e.clientX;
    d.lastX = e.clientX;
    if (delta !== 0) d.dragDirection = delta > 0 ? 1 : -1;
    if (d.isDragging) {
      track.scrollLeft += delta;
      e.preventDefault();
    }
  };

  const handlePointerUp = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (dragRef.current.pointerId !== e.pointerId) return;
    endDrag();
  };

  const handleLinkClick = (e: ReactMouseEvent) => {
    if (dragRef.current.isDragging) {
      e.preventDefault();
      e.stopPropagation();
    }
  };

  return (
    <section className="zuse-blog-section" ref={sectionRef}>
      <div className="zuse-blog-inner">
        <div className="zuse-blog-header">
          <h2 className="zuse-blog-title">
            <GradientTitle text={title} />
          </h2>
          <div className="zuse-blog-arrows">
            <button
              type="button"
              className={`zuse-blog-nav${!canPrev ? " is-inactive" : ""}`}
              aria-label="Previous blog"
              disabled={!canPrev}
              onClick={() => goToSlide(Math.max(0, activeIndex - 1))}
            >
              <NavArrow direction="prev" />
            </button>
            <button
              type="button"
              className={`zuse-blog-nav${!canNext ? " is-inactive" : ""}`}
              aria-label="Next blog"
              disabled={!canNext}
              onClick={() => goToSlide(Math.min(lastIndex, activeIndex + 1))}
            >
              <NavArrow direction="next" />
            </button>
          </div>
        </div>
      </div>

      <div className="zuse-blog-fwc" ref={rootRef}>
        <div className="zuse-blog-fwc-layout">
          <div
            className="zuse-blog-fwc-track"
            ref={trackRef}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
          >
            <div
              className="zuse-blog-fwc-spacer is-left"
              ref={leftSpacerRef}
              aria-hidden
            />

            {blogPosts.map((post, index) => (
              <BlogCard
                key={post.id}
                title={post.title}
                href={post.href}
                image={post.image}
                className="zuse-blog-fwc-item"
                ref={(el) => {
                  if (el) itemRefs.current[index] = el;
                }}
                onClick={handleLinkClick}
                draggable={false}
              />
            ))}

            <div className="zuse-blog-fwc-spacer is-right" aria-hidden />
          </div>
        </div>
      </div>

      <div className="zuse-blog-pagination" aria-label="Blog carousel pagination">
        {blogPosts.slice(0, lastIndex + 1).map((post, index) => (
          <button
            key={post.id}
            type="button"
            className={`zuse-blog-pagination-dot${activeIndex === index ? " is-active" : ""}`}
            aria-label={`Go to blog ${index + 1}`}
            aria-current={activeIndex === index ? "true" : undefined}
            onClick={() => goToSlide(index)}
          />
        ))}
      </div>
    </section>
  );
}
