"use client";

import { CDN_URL } from "@/lib/config/cdn";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { categoryLabel, type WorkCategory } from "@/lib/work";

type WorkFilterProps = {
  categories: WorkCategory[];
  activeSlug?: string | null;
};

export default function WorkFilter({ categories, activeSlug }: WorkFilterProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const linksRef = useRef<HTMLDivElement>(null);
  const [showLeftButton, setShowLeftButton] = useState(false);
  const [showRightButton, setShowRightButton] = useState(false);
  const [isScrolling, setIsScrolling] = useState(false);

  const updateScrollState = () => {
    const wrap = containerRef.current;
    const links = linksRef.current;
    if (!wrap || !links) return;

    const scrollLeft = links.scrollLeft;
    const maxScrollLeft = links.scrollWidth - links.clientWidth;
    setShowLeftButton(scrollLeft > 2);
    setShowRightButton(scrollLeft < maxScrollLeft - 2);
    setIsScrolling(scrollLeft > 0);
  };

  useEffect(() => {
    updateScrollState();
    const links = linksRef.current;
    if (!links) return;
    links.addEventListener("scroll", updateScrollState, { passive: true });
    window.addEventListener("resize", updateScrollState);
    return () => {
      links.removeEventListener("scroll", updateScrollState);
      window.removeEventListener("resize", updateScrollState);
    };
  }, [categories]);

  useEffect(() => {
    const wrap = containerRef.current;
    if (!wrap) return;
    wrap.classList.toggle("scrolling", isScrolling);
  }, [isScrolling]);

  return (
    <div className="anime-grid-links anime-grid-links-metal relative mt-[60px] md:mt-[80px] lg:mt-[103px] mb-[20px] md:mb-[50px] lg:mb-[79px]">
      <div className="section-container relative">
        <div
          className="anime-grid-links-wrap"
          id="myBtnContainer"
          ref={containerRef}
        >
          <div className="links-container" ref={linksRef}>
            <Link href="/work" className={`btn ${!activeSlug ? "tbx" : ""}`}>
              All
            </Link>
            {categories.map((cat) => {
              const slug = cat.slug || "";
              const label = categoryLabel(cat);
              return (
                <Link
                  key={slug}
                  href={`/casestudies/${slug}`}
                  className={`btn ${activeSlug === slug ? "tbx" : ""}`}
                >
                  {label}
                </Link>
              );
            })}
          </div>
        </div>
        {showLeftButton ? (
          <button
            type="button"
            className="btn-scr-com btn-scr-left"
            aria-label="Scroll categories left"
            onClick={() =>
              linksRef.current?.scrollBy({ left: -120, behavior: "smooth" })
            }
          >
            <img loading="lazy"
              src={`${CDN_URL}/filter_arrow_fe81ebc8b6.svg`}
              alt=""
              width={40}
              height={40}
            />
          </button>
        ) : null}
        {showRightButton ? (
          <button
            type="button"
            className="btn-scr-com btn-scr-right"
            aria-label="Scroll categories right"
            onClick={() =>
              linksRef.current?.scrollBy({ left: 120, behavior: "smooth" })
            }
          >
            <img loading="lazy"
              src={`${CDN_URL}/filter_arrow_fe81ebc8b6.svg`}
              alt=""
              width={40}
              height={40}
            />
          </button>
        ) : null}
      </div>
    </div>
  );
}
