"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { ArrowRight } from "@/components/icons/ArrowRight";
import { GradientTitle } from "@/components/sections/InlineText";
import type { IndustriesSection } from "@/lib/sections";
import { SectionHeader } from "@/components/ui";

const MOBILE_GRADIENT =
  "linear-gradient(180deg, rgba(0, 9, 49, 0) 0%, rgba(0, 9, 49, 0.18) 38%, rgba(0, 9, 49, 0.78) 72%, rgba(0, 9, 49, 0.96) 100%)";

/** "#124AB9" → "18, 74, 185" */
const rgb = (hex: string) => {
  const full = hex.replace("#", "").replace(/^(.)(.)(.)$/, "$1$1$2$2$3$3");
  return [0, 2, 4].map((i) => parseInt(full.slice(i, i + 2), 16) || 0).join(", ");
};

/** Industry → card data; the card gradients are derived from its colour. */
const toCards = (data: IndustriesSection) =>
  data.items.map((item) => {
    const color = item.color || "#030821";
    return {
      id: item.title.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
      title: item.title,
      copy: item.copy ?? "",
      imgDesktop: item.imageDesktop?.url ?? "",
      imgMobile: item.imageMobile?.url ?? item.imageDesktop?.url ?? "",
      color,
      gradientDesktop: `linear-gradient(90.28deg, ${color} 1%, rgba(${rgb(color)}, 0) 30%)`,
      gradientMobile: MOBILE_GRADIENT,
    };
  });

export default function Leaders({ data }: { data: IndustriesSection }) {
  const LEADERS_DATA = toCards(data);
  const [expandedIndex, setExpandedIndex] = useState(0);
  const trackRef = useRef<HTMLDivElement>(null);
  const stickyRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const track = trackRef.current;
    const stickyEl = stickyRef.current;
    const cards = cardsRef.current.filter(Boolean) as HTMLDivElement[];
    if (!track || !stickyEl || cards.length === 0) return;

    let rafId: number | null = null;
    const GAP_PX = 110;
    const cardCount = cards.length;
    const clamp = (v: number) => Math.max(0, Math.min(1, v));
    let stopPositions: number[] = [];
    let targetProgress = 0;
    let currentProgress = 0;
    const lerpEase = 0.08;
    let isInitialized = false;

    const computeStopPositions = () => {
      const cardH = cards[0].offsetHeight || 380;
      stopPositions = cards.map((_, i) => (i * GAP_PX / cardH) * 100);
    };

    const resetCards = () => {
      cards.forEach((card) => {
        card.style.position = "";
        card.style.top = "";
        card.style.left = "";
        card.style.width = "";
        card.style.transform = "";
        card.style.zIndex = "";
        card.style.setProperty("--stack-darken", "0");
      });
      isInitialized = false;
    };

    const initDesktopCards = () => {
      computeStopPositions();
      const cardH = cards[0].offsetHeight || 380;
      const GAP_PCT = (GAP_PX / cardH) * 100;

      cards.forEach((card, index) => {
        card.style.position = "absolute";
        card.style.top = "0";
        card.style.left = "0";
        card.style.width = "100%";
        card.style.zIndex = String(index + 1);
        const startY = index === 0 ? 0 : index * (100 + GAP_PCT);
        card.style.transform = `translateY(${startY}%)`;
        card.style.setProperty("--stack-darken", "0");
      });
    };

    const animateCards = () => {
      if (window.innerWidth < 768) {
        resetCards();
        rafId = null;
        return;
      }

      const rect = track.getBoundingClientRect();
      const stickyTop = parseInt(window.getComputedStyle(stickyEl).top) || 200;
      const stickyHeight = stickyEl.offsetHeight;

      const stickDuration = track.offsetHeight - stickyHeight;
      if (stickDuration <= 0) {
        rafId = requestAnimationFrame(animateCards);
        return;
      }

      targetProgress = clamp((stickyTop - rect.top) / stickDuration);

      if (!isInitialized) {
        currentProgress = targetProgress;
        isInitialized = true;
      } else {
        currentProgress += (targetProgress - currentProgress) * lerpEase;
        if (Math.abs(targetProgress - currentProgress) < 0.0001) {
          currentProgress = targetProgress;
        }
      }

      const darkens = new Array(cardCount).fill(0);
      const cardH = cards[0].offsetHeight || 380;
      const GAP_PCT = (GAP_PX / cardH) * 100;
      const scrollAmount = currentProgress * (cardCount - 1) * 100;

      cards.forEach((card, index) => {
        if (index === 0) return;

        const initialY = index * (100 + GAP_PCT);
        const stopY = stopPositions[index];
        const y = Math.max(stopY, initialY - scrollAmount);

        card.style.transform = `translateY(${y}%)`;

        const ownProgress = clamp((scrollAmount - (index - 1) * 100) / 100);
        if (ownProgress > 0) {
          for (let below = 0; below < index; below += 1) {
            darkens[below] = Math.max(darkens[below], (index - below) * 0.14 * ownProgress);
          }
        }
      });

      cards.forEach((card, index) => {
        card.style.setProperty("--stack-darken", String(darkens[index]));
      });
      rafId = requestAnimationFrame(animateCards);
    };

    const onResize = () => {
      if (window.innerWidth < 768) {
        if (rafId) cancelAnimationFrame(rafId);
        rafId = null;
        resetCards();
        return;
      }
      initDesktopCards();
      if (!rafId) rafId = requestAnimationFrame(animateCards);
    };

    window.addEventListener("resize", onResize);
    onResize();

    return () => {
      window.removeEventListener("resize", onResize);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, []);

  return (
    <section className="zuse-leaders-section" id="leaders-section">
      <div className="section-container">
        <SectionHeader
          title={<GradientTitle text={data.title} className="inline" />}
          description={data.description ? <p className="m-0">{data.description}</p> : null}
        />

        <div className="zuse-leaders-track js-scroll-track" ref={trackRef}>
          <div className="zuse-leaders-sticky js-sticky-viewport" ref={stickyRef}>
            <div className="zuse-leaders-cards" id="leaders-cards-container">
              {LEADERS_DATA.map((item, index) => {
                const isExpanded = expandedIndex === index;
                return (
                  <div
                    key={item.id}
                    ref={(el) => {
                      cardsRef.current[index] = el;
                    }}
                    className={`zuse-leader-card group ${isExpanded ? "is-expanded" : ""}`}
                    role="button"
                    tabIndex={0}
                    style={{
                      "--card-color": item.color,
                      "--grad-desktop": item.gradientDesktop,
                      "--grad-mobile": item.gradientMobile,
                    } as React.CSSProperties}
                    onClick={() => setExpandedIndex(index)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        setExpandedIndex(index);
                      }
                    }}
                  >
                    {/* Desktop Image */}
                    <Image
                      alt={item.title}
                      src={item.imgDesktop}
                      fill
                      className="zuse-leader-card-bg hidden md:block"
                    />
                    {/* Mobile Image */}
                    <Image
                      alt={item.title}
                      src={item.imgMobile}
                      fill
                      className="zuse-leader-card-bg md:hidden block"
                    />
                    <div
                      className="zuse-leader-card-overlay"
                      aria-hidden="true"
                    ></div>
                    <div className="zuse-leader-card-body">
                      <h3 className="zuse-leader-card-title">{item.title}</h3>
                      <div className="zuse-leader-card-copy">
                        <p>{item.copy}</p>
                      </div>
                      <Link href="/work" className="zuse-btn-leader">
                        <span>See our case studies</span>
                        <ArrowRight />
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

    </section>
  );
}
