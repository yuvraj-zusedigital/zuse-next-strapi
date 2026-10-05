"use client";

import { CDN_URL } from "@/lib/config/cdn";
import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import type { CaseStudyTestimonial } from "@/lib/casestudies/types";

type Props = {
  testimonial: CaseStudyTestimonial;
};

export default function CaseStudyTestimonial({ testimonial }: Props) {
  const [expanded, setExpanded] = useState(false);
  const [fullHeight, setFullHeight] = useState(0);
  const fullRef = useRef<HTMLParagraphElement>(null);
  const hasFull = Boolean(testimonial.full?.length);
  const rating = testimonial.rating ?? 5;

  useEffect(() => {
    if (fullRef.current) {
      setFullHeight(fullRef.current.scrollHeight);
    }
  }, [expanded, testimonial.full]);

  return (
    <div className="case-study-testimonial">
      <div className="case-study-container">
        <div className="case-study-testimonial-wrap">
          <div className="case-study-testimonial-inn">
            <div className="case-study-testimonial-row case-study-testimonial-row-1">
              <div className="case-study-testimonial-avatar">
                <Image
                  src={testimonial.avatar.src}
                  alt={testimonial.avatar.alt || testimonial.name}
                  width={testimonial.avatar.width || 100}
                  height={testimonial.avatar.height || 100}
                  className="rounded-[8px]"
                />
                <div className="case-study-testimonial-avatar-title">
                  {testimonial.name}
                </div>
                <div className="case-study-testimonial-avatar-desg">
                  {testimonial.role}
                </div>
              </div>
              <div className="case-study-testimonial-text">
                <p
                  className={
                    expanded
                      ? "case-study-testimonial-text-half case-half-hidden"
                      : "case-study-testimonial-text-half case-half-visible"
                  }
                >
                  {testimonial.excerpt}
                </p>
                {hasFull ? (
                  <p
                    ref={fullRef}
                    className={
                      expanded
                        ? "case-study-testimonial-text-full case-full-visible"
                        : "case-study-testimonial-text-full case-full-hidden"
                    }
                    style={{
                      maxHeight: expanded ? `${fullHeight}px` : 0,
                      opacity: expanded ? 1 : 0,
                    }}
                  >
                    {testimonial.full!.map((para, i) => (
                      <span key={i} className="case-study-testimonial-full-para">
                        {para}
                      </span>
                    ))}
                  </p>
                ) : null}
                {hasFull && !expanded ? (
                  <button
                    type="button"
                    onClick={() => setExpanded(true)}
                    className="case-study-testimonial-text-action"
                  >
                    Read Full Review
                  </button>
                ) : null}
              </div>
            </div>
            <div className="case-study-testimonial-row case-study-testimonial-row-2">
              {testimonial.brandLogo ? (
                <div className="case-study-testimonial-brand-logo">
                  <Image
                    src={testimonial.brandLogo.src}
                    alt={testimonial.brandLogo.alt || `${testimonial.name} logo`}
                    width={testimonial.brandLogo.width || 99}
                    height={testimonial.brandLogo.height || 24}
                  />
                </div>
              ) : (
                <div className="case-study-testimonial-brand-logo" />
              )}
              <div className="case-study-testimonial-ratings">
                {Array.from({ length: rating }).map((_, i) => (
                  <Image
                    key={i}
                    src={`${CDN_URL}/images/star-rating.svg`}
                    alt=""
                    width={24}
                    height={24}
                    className="case-study-star"
                  />
                ))}
                <span className="case-study-rating-value">
                  {rating.toFixed(1)}
                </span>
              </div>
            </div>
          </div>
        </div>
        <div className="case-study-testimonials-link">
          <Link href="/testimonials" className="home-comm-action link-sweep">
            <span>View All Testimonials</span>
            <Image
              src={`${CDN_URL}/images/new-home-link-arro.svg`}
              alt=""
              width={6}
              height={12}
            />
          </Link>
        </div>
      </div>
    </div>
  );
}
