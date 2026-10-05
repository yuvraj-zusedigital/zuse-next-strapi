"use client";

import { CDN_URL } from "@/lib/config/cdn";
import { useRef } from "react";
import Image from "next/image";
import { useStaggeredReveal } from "@/components/home/hooks/useStaggeredReveal";
import type { BulletGridSection, ProcessStepsSection } from "@/lib/sections";

const CF = `${CDN_URL}/images`;
/** Decorative connectors between steps, in the order every service page uses. */
const RODS = [1, 2, 3, 4, 5, 6, 3].map((n) => `${CF}/serv-process-rod-${n}.svg`);

/** Timeline process (sections.process-steps), shared by the service pages. */
export default function ProcessSteps({ data }: { data: ProcessStepsSection }) {
  const ref = useRef<HTMLElement>(null);
  useStaggeredReveal(ref, ".zuse-seo-process-copy");
  const { steps } = data;

  return (
    <section className="zuse-seo-process" ref={ref}>
      <div className="zuse-seo-process-inner">
        {data.title ? <h2 className="zuse-seo-process-heading">{data.title}</h2> : null}
        <ol className="zuse-seo-process-list">
          {steps.map((step, index) => {
            const isLast = index === steps.length - 1;
            const size = step.iconSize || 100;
            return (
              <li key={`${step.title}-${index}`} className="zuse-seo-process-item">
                <div className="zuse-seo-process-icon">
                  {step.icon ? (
                    <Image src={step.icon.url} alt="" width={size} height={size} className="zuse-seo-process-icon-img" unoptimized />
                  ) : null}
                  {step.iconOverlay ? (
                    <Image src={step.iconOverlay.url} alt="" width={36} height={36} className="zuse-seo-process-icon-overlay" unoptimized />
                  ) : null}
                </div>
                <div className="zuse-seo-process-copy" data-sal="fade">
                  <h3 className="zuse-seo-process-title">
                    {step.titleImage ? (
                      <Image src={step.titleImage.url} alt="" width={24} height={24} className="zuse-seo-process-emoji" unoptimized />
                    ) : null}
                    {step.title}
                  </h3>
                  <p className="zuse-seo-process-desc">{step.description}</p>
                </div>
                {!isLast ? (
                  <div className="zuse-seo-process-rod" aria-hidden="true">
                    <Image src={RODS[index % RODS.length]} alt="" width={2} height={128} className="zuse-seo-process-rod-img" unoptimized />
                  </div>
                ) : null}
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}

/** Grid of short points (sections.bullet-grid), e.g. "Tools We Use". */
export function BulletGrid({ data }: { data: BulletGridSection }) {
  const ref = useRef<HTMLElement>(null);
  useStaggeredReveal(ref, ".zuse-seo-bullet-item");

  return (
    <section className="zuse-seo-bullet-section" ref={ref} data-sal="fade">
      {data.title ? <h2 className="zuse-seo-bullet-heading">{data.title}</h2> : null}
      {data.lead ? <p className="zuse-seo-bullet-lead">{data.lead}</p> : null}
      <ul className="zuse-seo-bullet-grid">
        {data.items.map((item, index) => (
          <li key={`${item.title}-${index}`} className="zuse-seo-bullet-item" data-sal="fade">
            <h3 className="zuse-seo-bullet-title">{item.title}</h3>
            <p className="zuse-seo-bullet-desc">{item.description}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}
