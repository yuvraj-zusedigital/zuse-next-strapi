"use client";

import Image from "next/image";
import { GoogleReviewIcon } from "@/components/icons/GoogleReviewIcon";
import Link from "next/link";
import { useEffect, useRef, type MouseEvent as ReactMouseEvent } from "react";
import { GradientText } from "@/components/ui/GradientText";

export type HomeTestimonial = {
  id: string;
  author: string;
  company: string;
  avatar: string;
  text: string;
};

function distributeTestimonials(testimonials: HomeTestimonial[]) {
  const rows: [HomeTestimonial[], HomeTestimonial[], HomeTestimonial[]] = [
    [],
    [],
    [],
  ];

  testimonials.forEach((testimonial, index) => {
    rows[index % rows.length].push(testimonial);
  });

  return rows;
}

function TestimonialCard({ item }: { item: HomeTestimonial }) {
  return (
    <div className="testimonial-card testimonial-glow">
      <div className="testimonial-card-border" aria-hidden="true">
        <div className="testimonial-card-border-glow">
          <div className="testimonial-card-border-gradient"></div>
        </div>
      </div>
      <div className="testimonial-card-inner">
        <div className="testimonial-card-content">
          <div className="testimonial-card-top">
            <div className="testimonial-avatar-wrap">
              <Image
                src={item.avatar}
                alt={item.author}
                width={40}
                height={40}
                className="testimonial-avatar-img"
              />
            </div>
            <div>
              <div className="testimonial-author">{item.author}</div>
              <div className="testimonial-company">{item.company}</div>
            </div>
          </div>
          <div className="testimonial-text">{item.text}</div>
        </div>
      </div>
    </div>
  );
}

function pauseMarqueeRow(e: ReactMouseEvent<HTMLElement>) {
  e.currentTarget.style.animationPlayState = "paused";
}

function resumeMarqueeRow(e: ReactMouseEvent<HTMLElement>) {
  e.currentTarget.style.animationPlayState = "running";
}

export default function Testimonials({
  testimonials,
  title = "5-star experiences",
  description = "Our commitment at Zuse Digital to professionalism and quality has earned us the trust of many. Discover their 5-star testimonials and reviews",
}: {
  testimonials: HomeTestimonial[];
  /** From the testimonials section (defaults: the original copy). */
  title?: string;
  description?: string;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [rowOne, rowTwo, rowThree] = distributeTestimonials(testimonials);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      const cards = containerRef.current.querySelectorAll('.testimonial-card');

      cards.forEach((card) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        // Calculate offset for gradient tracking center of mouse
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        const xOffset = x - centerX;
        const yOffset = y - centerY;

        (card as HTMLElement).style.setProperty('--card-mouse-x', `${xOffset}px`);
        (card as HTMLElement).style.setProperty('--card-mouse-y', `${yOffset}px`);
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  return (
    <section className="zuse-testimonials-section" ref={containerRef}>
      <div className="zuse-testimonials-header flex-col flex">
        <div className="zuse-testimonials-clutch">
          <GoogleReviewIcon className="zuse-testimonials-clutch-stars" />
        </div>
        <h2 className="zuse-testimonials-title">
          <GradientText as="span">{title}</GradientText>
        </h2>
        {description ? <p className="zuse-testimonials-copy">{description}</p> : null}
      </div>

      <div className="zuse-testimonials-marquee">
        <div className="zuse-testimonials-fade-left" aria-hidden="true"></div>
        <div className="zuse-testimonials-fade-right" aria-hidden="true"></div>

        {/* Row 1 */}
        <div
          className="zuse-marquee-row is-right"
          onMouseEnter={pauseMarqueeRow}
          onMouseLeave={resumeMarqueeRow}
        >
          <div className="zuse-marquee-track">
            {rowOne.map((item) => (
              <TestimonialCard key={`r1-t1-${item.id}`} item={item} />
            ))}
          </div>
          <div className="zuse-marquee-track" aria-hidden="true">
            {rowOne.map((item) => (
              <TestimonialCard key={`r1-t2-${item.id}`} item={item} />
            ))}
          </div>
        </div>

        {/* Row 2 */}
        <div
          className="zuse-marquee-row is-left is-slow"
          onMouseEnter={pauseMarqueeRow}
          onMouseLeave={resumeMarqueeRow}
        >
          <div className="zuse-marquee-track is-offset-left">
            {rowTwo.map((item) => (
              <TestimonialCard key={`r2-t1-${item.id}`} item={item} />
            ))}
          </div>
          <div className="zuse-marquee-track" aria-hidden="true">
            {rowTwo.map((item) => (
              <TestimonialCard key={`r2-t2-${item.id}`} item={item} />
            ))}
          </div>
        </div>

        {/* Row 3 (Desktop Only) */}
        <div
          className="zuse-marquee-row is-right is-fast is-desktop-only"
          onMouseEnter={pauseMarqueeRow}
          onMouseLeave={resumeMarqueeRow}
        >
          <div className="zuse-marquee-track is-offset-pad">
            {rowThree.map((item) => (
              <TestimonialCard key={`r3-t1-${item.id}`} item={item} />
            ))}
          </div>
          <div className="zuse-marquee-track" aria-hidden="true">
            {rowThree.map((item) => (
              <TestimonialCard key={`r3-t2-${item.id}`} item={item} />
            ))}
          </div>
        </div>
      </div>

      <div className="zuse-testimonials-cta">
        <Link href="/testimonials" className="btn-base btn-secondary btn-no-icon !w-auto px-6 md:px-8">
          <span className="btn-fill"></span>
          <span className="btn-text-default">Explore all Testimonials</span>
          <span className="btn-text-hover">Explore all Testimonials</span>
        </Link>
      </div>
    </section>
  );
}
