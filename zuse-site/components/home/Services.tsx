"use client";

import { Fragment, useEffect, useRef, type CSSProperties, type ReactNode } from "react";
import Link from "next/link";
import { SectionHeader } from "@/components/ui";
import { GradientTitle } from "@/components/sections/InlineText";
import type { ServiceDiagram, ServicesGridSection } from "@/lib/sections";
import { AiAgentDiagram } from "./AiAgentDiagram";
import { AiProcessDiagram } from "./AiProcessDiagram";
import WebApplicationDiagram from "./WebApplicationDiagram";
import MobileDesignDiagram from "./MobileDesignDiagram";
import WebDesignDiagram from "./WebDesignDiagram";
import { SeoDiagram } from "./SeoDiagram";
import { useStaggeredReveal } from "./hooks/useStaggeredReveal";

const ArrowIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 16 16"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
  >
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M5.71875 10.0024L10.5235 5.19778L11.4663 6.14058L6.66155 10.9453L5.71875 10.0024Z"
      fill="currentColor"
    />
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M5 6.33464L10.3333 6.33464L10.3333 11.668L11.6667 11.668L11.6667 5.0013L5 5.0013L5 6.33464Z"
      fill="currentColor"
    />
  </svg>
);

type Card = ServicesGridSection["cards"][number];

/**
 * Layout of each card, chosen by its diagram: card classes, the animated
 * diagram and where it sits, and how line breaks in the description render.
 */
const LAYOUTS: Record<ServiceDiagram, { className: string; outline: boolean; copyClass?: string; breaks: "md" | "all" | "lines"; art?: ReactNode }> = {
  "ai-agents": { className: "service-card-glow is-services-half", outline: false, breaks: "md", art: <AiAgentDiagram /> },
  "ai-product": { className: "service-card-glow is-light is-ai-product", outline: true, breaks: "all", art: <AiProcessDiagram /> },
  seo: {
    className: "service-card-glow w-full is-light is-services-full seo-service-card",
    outline: false,
    copyClass: "max-w-[400px]",
    breaks: "md",
    art: (
      <div
        className="zuse-service-card-art zuse-no-hover-scale seo-diagram justify-end"
        style={{ "--nh-bottom": "-20px", "--nh-right": "-50px", "--nh-left": "auto", "--nh-width": "auto" } as CSSProperties}
      >
        <SeoDiagram />
      </div>
    ),
  },
  "web-application": {
    className: "service-card-glow is-services-third",
    outline: true,
    breaks: "all",
    art: (
      <div
        className="zuse-service-card-art zuse-no-hover-scale"
        style={{ "--nh-width": "326px", "--nh-width-adjust": "0px", "--nh-bottom": "-3px", "--nh-left": "-3px", borderBottomLeftRadius: "0px" } as CSSProperties}
      >
        <WebApplicationDiagram />
      </div>
    ),
  },
  "mobile-app": {
    className: "service-card-glow is-services-third",
    outline: true,
    breaks: "lines",
    art: (
      <div
        className="zuse-service-card-art zuse-no-hover-scale"
        style={
          {
            "--nh-width": "273px",
            "--nh-width-adjust": "0px",
            "--nh-bottom": "20px",
            "--nh-left": "calc(50% - 136.5px)",
            "--nh-left-adjust": "0px",
            borderBottomLeftRadius: "0px",
            borderBottomRightRadius: "0px",
          } as CSSProperties
        }
      >
        <MobileDesignDiagram />
      </div>
    ),
  },
  "web-design": {
    className: "service-card-glow is-services-third",
    outline: true,
    breaks: "all",
    art: (
      <div
        className="zuse-service-card-art zuse-no-hover-scale"
        style={
          {
            "--nh-width": "332px",
            "--nh-width-adjust": "0px",
            "--nh-bottom": "-10px",
            "--nh-left": "auto",
            "--nh-right": "-15px",
            borderBottomRightRadius: "0px",
          } as CSSProperties
        }
      >
        <WebDesignDiagram />
      </div>
    ),
  },
  none: { className: "service-card-glow is-services-third", outline: true, breaks: "all" },
};

function Lines({ text, breakClass }: { text: string; breakClass?: string }) {
  return (
    <>
      {text.split("\n").map((line, index) => (
        <Fragment key={index}>
          {index > 0 && <br className={breakClass} />}
          {line}
        </Fragment>
      ))}
    </>
  );
}

function ServiceCard({ card }: { card: Card }) {
  const layout = LAYOUTS[card.diagram ?? "none"] ?? LAYOUTS.none;
  const description = card.description ?? "";
  const label = card.title.replace(/\s*\n\s*/g, " ");
  return (
    <Link href={card.href || "#"} className={layout.className} aria-label={label}>
      <div className="service-card-border" aria-hidden="true">
        <div className="service-card-border-glow">
          <div className="service-card-border-gradient"></div>
        </div>
      </div>
      <div className="service-card-surface">
        {card.backgroundImage ? (
          // eslint-disable-next-line @next/next/no-img-element -- decorative SVG background
          <img loading="lazy" src={card.backgroundImage.url} alt="" className="zuse-service-card-bg" />
        ) : null}
        {layout.art}
        <div className="zuse-service-card-content">
          <div className={`zuse-service-card-copy is-wide-desc${layout.copyClass ? ` ${layout.copyClass}` : ""}`}>
            <h3 className="zuse-service-card-title">
              <Lines text={card.title} />
            </h3>
            {layout.breaks === "lines" ? (
              <p className="zuse-service-card-desc is-fixed-lines">
                {description.split("\n").map((line, index) => (
                  <span key={index} className="zuse-service-card-desc-line">
                    {line}
                  </span>
                ))}
              </p>
            ) : (
              <p className="zuse-service-card-desc">
                <Lines text={description} breakClass={layout.breaks === "md" ? "hidden md:block" : undefined} />
              </p>
            )}
          </div>
          <span className={`zuse-service-card-btn${layout.outline ? " is-outline" : ""}`} aria-hidden="true">
            <ArrowIcon />
          </span>
        </div>
      </div>
    </Link>
  );
}

export default function Services({ data }: { data: ServicesGridSection }) {
  const sectionRef = useRef<HTMLElement>(null);
  useStaggeredReveal(sectionRef, ".service-card-glow");

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!sectionRef.current) return;
      const cards = sectionRef.current.querySelectorAll(".service-card-glow");

      cards.forEach((card) => {
        const rect = card.getBoundingClientRect();
        const xOffset = e.clientX - rect.left - rect.width / 2;
        const yOffset = e.clientY - rect.top - rect.height / 2;
        (card as HTMLElement).style.setProperty("--card-mouse-x", `${xOffset}px`);
        (card as HTMLElement).style.setProperty("--card-mouse-y", `${yOffset}px`);
      });
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  const cards = data.cards;
  const rows = [
    { className: "zuse-services-row zuse-services-row-2 justify-between", cards: cards.slice(0, 2) },
    { className: "zuse-services-row zuse-services-row-1 mb-6", cards: cards.slice(2, 3) },
    { className: "zuse-services-row zuse-services-row-3", cards: cards.slice(3) },
  ].filter((row) => row.cards.length);

  return (
    <section className="zuse-services-section" ref={sectionRef}>
      <div className="section-container pt-8">
        <SectionHeader
          title={<GradientTitle text={data.title} immediate as="span" className="zuse-display-gradient" />}
          description={data.description ?? ""}
        />

        {rows.map((row, index) => (
          <div key={index} className={row.className}>
            {row.cards.map((card, i) => (
              <ServiceCard key={`${card.title}-${i}`} card={card} />
            ))}
          </div>
        ))}
      </div>
    </section>
  );
}
