"use client";
import { CDN_URL } from "@/lib/config/cdn";
import { useEffect, useRef, type CSSProperties } from "react";
import Image from "next/image";
import ReviewBadge from "@/components/reviews/ReviewBadge";
import { GradientTitle } from "@/components/sections/InlineText";
import { TESTIMONIALS } from "@/lib/testimonials";
import type { Testimonial } from "@/lib/cms-content";

/** Testimonials page banner (sections.page-intro on the Testimonials page). Defaults: the original copy. */
export function TestimonialsBanner({
  title = "Client Testimonials",
  lead = "5-star reviews and real results across websites, software and AI.",
}: {
  title?: string;
  lead?: string;
}) {
  return (
      <section className="testi-awards-banner relative z-0">
        <div className="testi-awards-bg-container">
          <div className="testi-awards-blob-top-left"></div>
          <div className="testi-awards-blob-bottom-right"></div>
          <Image
            src="/images/testimonial/leaf.svg"
            alt=""
            width={274}
            height={447}
            className="testi-awards-leaf"
            aria-hidden="true"
          />
        </div>
        <div className="section-container relative z-10">
          <div className="testi-awards-banner-inn">
            <h1>
              <GradientTitle text={title} immediate as="span" className="zuse-display-gradient" />
            </h1>
            <p>{lead}</p>
            <div className="testimonials-review-row">
              <ReviewBadge
                icon={`${CDN_URL}/images/cont-google-icon.svg`}
                label="Google Reviews"
              />
              <span className="testimonials-review-divider" aria-hidden="true" />
              <ReviewBadge
                icon={`${CDN_URL}/images/cont-clutch-icon.svg`}
                label="Clutch Reviews"
              />
            </div>
          </div>
        </div>
      </section>
  );
}

/** Full testimonials (sections.testimonials, grid layout). The static list is the fallback. */
export function TestimonialsGrid({ testimonials = TESTIMONIALS as unknown as Testimonial[] }: { testimonials?: Testimonial[] }) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      const cards = containerRef.current.querySelectorAll('.testi-text-item');
      cards.forEach((card) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;
        (card as HTMLElement).style.setProperty('--card-mouse-x', `${x}px`);
        (card as HTMLElement).style.setProperty('--card-mouse-y', `${y}px`);
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);


  return (
      <section className="testipage-textual !bg-transparent">
        <div className="section-container" ref={containerRef}>
          <div className="testipage-text-inn">
            {testimonials.map((testimonial, index) => (
              <article className="testimonial-card testimonial-glow testi-text-item" key={`${testimonial.documentId ?? testimonial.name}-${index}`}>
                <div className="testimonial-card-border" aria-hidden="true">
                  <div className="testimonial-card-border-glow">
                    <div className="testimonial-card-border-gradient"></div>
                  </div>
                </div>
                <div className="testimonial-card-inner testi-text-item-inn">
                  <div className="testimonial-card-content testi-text-item-content">
                    <div className="testi-text-item-left">
                      <div className="testi-text-desktop-meta">
                        <h2>{testimonial.name}</h2>
                        <p>{testimonial.company}</p>
                      </div>
                      <div className="testi-text-client-desc">
                        {testimonial.paragraphs.map((paragraph, i) => (
                          <p key={i}>{paragraph}</p>
                        ))}
                      </div>
                    </div>

                    <div className="testi-text-item-right">
                      <div className="testi-text-person">
                        <Image
                          src={testimonial.portrait}
                          alt={testimonial.portraitAlt}
                          width={215}
                          height={215}
                          className="testi-text-portrait"
                        />
                        <div className="testi-text-mobile-meta">
                          <h2>{testimonial.name}</h2>
                          <p>{testimonial.company}</p>
                        </div>
                      </div>
                      {testimonial.logo ? (
                        <img
                          src={testimonial.logo}
                          alt={testimonial.logoAlt || ""}
                          width={testimonial.logoWidth || 150}
                          height={testimonial.logoHeight || 40}
                          loading="lazy"
                          className="testi-text-logo"
                          style={
                            {
                              "--logo-w": `${testimonial.logoWidth || 150}px`,
                              "--logo-w-mob": `${testimonial.logoWidthMobile || 100}px`,
                            } as CSSProperties
                          }
                        />
                      ) : null}
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
  );
}
