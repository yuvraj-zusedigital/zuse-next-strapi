"use client";

import { useRef } from "react";
import Image from "next/image";
import { useStaggeredReveal } from "@/components/home/hooks/useStaggeredReveal";
import type { CaseStudyCardsSection } from "@/lib/sections";

/**
 * Case-study poster cards (sections.case-study-cards): image, name and tags,
 * linking to the case study. The poster grid from the live service pages.
 */
export default function CaseStudyCards({ data }: { data: CaseStudyCardsSection }) {
  const ref = useRef<HTMLElement>(null);
  useStaggeredReveal(ref, ".zuse-service-banner-item");
  const cards = data.cards.filter((card) => card.title);
  if (!cards.length) return null;

  return (
    <section ref={ref}>
      {data.title ? <h2 className="zuse-seo-our-services-heading">{data.title}</h2> : null}
      <div className="zuse-service-banner-grid">
        {cards.map((card, index) => {
          const content = (
            <>
              <div className="zuse-service-banner-item-img">
                {card.image ? (
                  <Image
                    src={card.image.url}
                    alt={card.image.alt || `${card.title} Case Study`}
                    width={330}
                    height={329}
                    className="zuse-service-banner-item-photo"
                    sizes="(max-width: 640px) 90vw, 30vw"
                    unoptimized
                  />
                ) : null}
              </div>
              <div className="zuse-service-banner-item-title">{card.title}</div>
              {card.tags ? <div className="zuse-service-banner-item-desc">{card.tags}</div> : null}
            </>
          );
          return card.href ? (
            <a key={`${card.title}-${index}`} href={card.href} className="zuse-service-banner-item" data-sal="fade">
              {content}
            </a>
          ) : (
            <div key={`${card.title}-${index}`} className="zuse-service-banner-item" data-sal="fade">
              {content}
            </div>
          );
        })}
      </div>
    </section>
  );
}
