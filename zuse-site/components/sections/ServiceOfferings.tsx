"use client";

import { useRef } from "react";
import { useStaggeredReveal } from "@/components/home/hooks/useStaggeredReveal";
import type { BulletGroupsSection, ServiceOfferingsSection } from "@/lib/sections";

/**
 * "Our Services" card grid (sections.service-offerings), shared by the service
 * pages. A point with a description renders as label + detail; without, as
 * plain text — matching the original per-page variants.
 */
export default function ServiceOfferings({ data }: { data: ServiceOfferingsSection }) {
  const ref = useRef<HTMLElement>(null);
  useStaggeredReveal(ref, ".zuse-seo-service-card");

  return (
    <section className="zuse-seo-our-services" ref={ref} data-sal="fade">
      {data.title ? <h2 className="zuse-seo-our-services-heading">{data.title}</h2> : null}
      <div className="zuse-seo-our-services-grid">
        {data.items.map((service, index) => (
          <article key={`${service.title}-${index}`} className="zuse-seo-service-card" data-sal="fade">
            <h3 className="zuse-seo-service-card-title">{service.title}</h3>
            {service.description ? <p className="zuse-seo-service-card-desc">{service.description}</p> : null}
            <ul className="zuse-seo-service-card-list">
              {service.points.map((point, i) =>
                point.description ? (
                  <li key={i}>
                    <strong className="zuse-seo-service-card-list-label">{point.title}</strong>
                    <span className="zuse-seo-service-card-list-detail">{point.description}</span>
                  </li>
                ) : (
                  <li key={i}>{point.title}</li>
                ),
              )}
            </ul>
          </article>
        ))}
      </div>
    </section>
  );
}

/** "Technologies We Use"-style grouped lists (sections.bullet-groups). */
export function BulletGroups({ data }: { data: BulletGroupsSection }) {
  const ref = useRef<HTMLElement>(null);
  useStaggeredReveal(ref, ".zuse-seo-service-card");

  return (
    <section className="zuse-seo-our-services zuse-seo-tech-section" ref={ref} data-sal="fade">
      {data.title ? <h2 className="zuse-seo-our-services-heading">{data.title}</h2> : null}
      <div className="zuse-seo-our-services-grid">
        {data.groups.map((group, index) => (
          <article key={`${group.title}-${index}`} className="zuse-seo-service-card" data-sal="fade">
            <h3 className="zuse-seo-service-card-title">{group.title}</h3>
            <ul className="zuse-seo-service-card-list">
              {group.items.map((item, i) => (
                <li key={i}>
                  <strong className="zuse-seo-service-card-list-label">{item.title}</strong>
                  <span className="zuse-seo-service-card-list-detail">{item.description}</span>
                </li>
              ))}
            </ul>
          </article>
        ))}
      </div>
    </section>
  );
}
