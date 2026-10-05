"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useRef, MouseEvent } from "react";
import { GradientTitle } from "@/components/sections/InlineText";
import { linkHref, type FeaturedWorkSection } from "@/lib/sections";
import { SectionHeader } from "@/components/ui";
import { useStaggeredReveal } from "./hooks/useStaggeredReveal";

type ProductSize = "sm" | "lg";

interface ProductItem {
  id: string;
  title: string;
  tags: string[];
  desc: string;
  img: string;
  video: string;
  href: string;
  size: ProductSize;
}

/** Featured-work card → the card shape below (tags are comma separated). */
const toItem = (card: FeaturedWorkSection["cards"][number], index: number): ProductItem => ({
  id: `${index}-${card.title}`,
  title: card.title,
  tags: (card.tags ?? "")
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean),
  desc: card.description ?? "",
  img: card.image?.url ?? "",
  video: card.video?.url ?? "",
  href: card.href || "/work",
  size: card.size === "large" ? "lg" : "sm",
});

function ProductCard({ item }: { item: ProductItem }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const mediaRef = useRef<HTMLSpanElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const playGenRef = useRef(0);

  const handleMouseMove = (e: MouseEvent<HTMLAnchorElement>) => {
    if (!mediaRef.current) return;
    const rect = mediaRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    mediaRef.current.style.setProperty("--dp-mouse-x", `${x}px`);
    mediaRef.current.style.setProperty("--dp-mouse-y", `${y}px`);
  };

  const handleMouseEnter = () => {
    const video = videoRef.current;
    if (!video) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const gen = ++playGenRef.current;

    const reveal = () => {
      if (gen !== playGenRef.current) return;
      setIsPlaying(true);
    };

    // Wait for an actual painted frame — `playing` alone can still flash black.
    const revealAfterFrame = () => {
      if (gen !== playGenRef.current) return;
      const rvfc = (
        video as HTMLVideoElement & {
          requestVideoFrameCallback?: (cb: () => void) => number;
        }
      ).requestVideoFrameCallback;
      if (typeof rvfc === "function") {
        rvfc.call(video, () => reveal());
        return;
      }
      requestAnimationFrame(() => requestAnimationFrame(reveal));
    };

    const onPlaying = () => {
      video.removeEventListener("playing", onPlaying);
      revealAfterFrame();
    };

    video.addEventListener("playing", onPlaying);
    void video.play().catch(() => {
      video.removeEventListener("playing", onPlaying);
    });
  };

  const handleMouseLeave = () => {
    const leaveGen = ++playGenRef.current;
    // Poster snaps opaque immediately (CSS) — then stop/rewind underneath.
    setIsPlaying(false);

    if (mediaRef.current) {
      mediaRef.current.style.setProperty("--dp-mouse-x", "0px");
      mediaRef.current.style.setProperty("--dp-mouse-y", "0px");
    }

    const video = videoRef.current;
    if (!video) return;

    requestAnimationFrame(() => {
      if (leaveGen !== playGenRef.current) return;
      video.pause();
      try {
        video.currentTime = 0;
      } catch {
        /* ignore seek abort */
      }
    });
  };

  return (
    <div className={`zuse-dp-card zuse-dp-col-${item.size}`}>
      <div className="zuse-dp-img-wrap">
        <Link
          href={item.href}
          className="zuse-dp-img-link"
          aria-label={`View ${item.title} case study`}
          onMouseMove={handleMouseMove}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          <span
            ref={mediaRef}
            className={`zuse-dp-media${isPlaying ? " is-playing" : ""}`}
          >
            <span className="zuse-dp-media-border" aria-hidden="true">
              <span className="zuse-dp-media-border-glow">
                <span className="zuse-dp-media-border-gradient"></span>
              </span>
            </span>
            <span className="zuse-dp-media-surface">
              <Image
                src={item.img}
                alt={item.title}
                width={item.size === "sm" ? 428 : 635}
                height={item.size === "sm" ? 423 : 650}
                className="zuse-dp-img"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
              {item.video ? <video
                ref={videoRef}
                src={item.video}
                className="zuse-dp-video"
                muted
                playsInline
                loop
                preload="metadata"
                aria-hidden="true"
              /> : null}
            </span>
          </span>
        </Link>
      </div>
      <div className="zuse-dp-body">
        <div className="zuse-dp-title-row">
          <h3 className="zuse-dp-title">{item.title}</h3>
          <div className="zuse-dp-tags">
            {item.tags.map((tag, idx) => (
              <span key={idx} className="zuse-dp-tag">
                {tag}
              </span>
            ))}
          </div>
        </div>
        <p className="zuse-dp-desc">{item.desc}</p>
      </div>
    </div>
  );
}

export default function DigitalProducts({ data }: { data: FeaturedWorkSection }) {
  const sectionRef = useRef<HTMLElement>(null);
  useStaggeredReveal(sectionRef, ".zuse-dp-card");
  const items = data.cards.map(toItem);
  // Two cards per row.
  const rows = Array.from({ length: Math.ceil(items.length / 2) }, (_, index) => items.slice(index * 2, index * 2 + 2));
  const ctaHref = linkHref(data.cta);

  return (
    <section className="zuse-dp-section section-padding" ref={sectionRef}>
      <div className="section-container">
        <SectionHeader title={<GradientTitle text={data.title} className="inline" />} description={data.description ?? ""} />
        {rows.map((row, index) => (
          <div key={index} className="zuse-dp-row">
            {row.map((item) => (
              <ProductCard key={item.id} item={item} />
            ))}
          </div>
        ))}
        {data.cta && ctaHref ? (
          <div className="zuse-dp-explore">
            <a href={ctaHref} className="btn-base btn-secondary btn-no-icon !w-auto px-6 md:px-8">
              <span className="btn-fill"></span>
              <span className="btn-text-default">{data.cta.label}</span>
              <span className="btn-text-hover">{data.cta.label}</span>
            </a>
          </div>
        ) : null}
      </div>
    </section>
  );
}
