"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import { AWARDS, type Award } from "@/lib/awards";
import { GradientText } from "@/components/ui";

export default function AwardsRecognition({
  className = "",
  detailed = false,
  awards = AWARDS,
  title = "Awards & Recognition",
  lead = "Industry recognition for human-centred design, craft, and products that drive real outcomes.",
}: {
  /** Heading and lead of the compact variant (sections.awards-list). */
  title?: string;
  lead?: string;
  className?: string;
  /** From Strapi (lib/cms-content.ts); the static list is the fallback. */
  awards?: Award[];
  /** @deprecated kept for call-site compatibility */
  showLink?: boolean;
  /** Full "About the Award" / "Why We Won" copy, without the section header. */
  detailed?: boolean;
}) {
  const sectionRef = useRef<HTMLElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const list = listRef.current;
    if (!list) return;

    const fields = list.querySelectorAll<HTMLElement>(".awards-fieldset");
    const cleanups: Array<() => void> = [];

    const onMove = (e: MouseEvent) => {
      fields.forEach((field) => {
        const rect = field.getBoundingClientRect();
        field.style.setProperty(
          "--card-mouse-x",
          `${e.clientX - rect.left - rect.width / 2}px`
        );
        field.style.setProperty(
          "--card-mouse-y",
          `${e.clientY - rect.top - rect.height / 2}px`
        );
      });
    };
    window.addEventListener("mousemove", onMove);
    cleanups.push(() => window.removeEventListener("mousemove", onMove));

    const observer =
      typeof IntersectionObserver !== "undefined"
        ? new IntersectionObserver(
            (entries) => {
              entries.forEach((entry) => {
                if (!entry.isIntersecting) return;
                entry.target.classList.add("is-drawn");
                observer?.unobserve(entry.target);
              });
            },
            { threshold: 0.15, rootMargin: "0px 0px -5% 0px" }
          )
        : null;

    fields.forEach((field, i) => {
      field.style.setProperty("--awards-draw-delay", `${i * 90}ms`);
      // Reveal immediately if already on screen (observer can miss this)
      const rect = field.getBoundingClientRect();
      const inView =
        rect.top < window.innerHeight * 0.95 && rect.bottom > 0;
      if (inView || !observer) {
        field.classList.add("is-drawn");
      } else {
        observer.observe(field);
      }
    });

    // Safety net if observer never fires
    const fallback = window.setTimeout(() => {
      fields.forEach((field) => field.classList.add("is-drawn"));
    }, 600);

    return () => {
      cleanups.forEach((fn) => fn());
      observer?.disconnect();
      window.clearTimeout(fallback);
    };
  }, []);

  return (
    <section
      className={`awards-recognition ${className}`.trim()}
      ref={sectionRef}
      aria-labelledby={detailed ? undefined : "awards-recognition-heading"}
      aria-label={detailed ? "Awards" : undefined}
    >
      {detailed ? null : (
        <div className="awards-recognition-header">
          <h2 id="awards-recognition-heading" className="awards-recognition-title">
            <GradientText as="span" className="zuse-display-gradient">
              {title}
            </GradientText>
          </h2>
          {lead ? <p className="awards-recognition-lead">{lead}</p> : null}
        </div>
      )}

      <div className="awards-recognition-list" ref={listRef}>
        {awards.map((award) => (
          <fieldset key={award.id} className="awards-fieldset">
            <div className="awards-fieldset-border" aria-hidden="true">
              <div className="awards-fieldset-border-glow">
                <div className="awards-fieldset-border-gradient" />
              </div>
            </div>

            <div className="awards-fieldset-surface">
              <div className="awards-fieldset-body">
                <div className="awards-fieldset-media">
                  <Image
                    src={award.image}
                    alt={award.imageAlt}
                    width={award.imageWidth || 250}
                    height={award.imageHeight || 250}
                    className="awards-fieldset-img"
                  />
                  {detailed
                    ? award.extraImages?.map((image) => (
                        <Image
                          key={image.src}
                          src={image.src}
                          alt={image.alt}
                          width={image.width || 250}
                          height={image.height || 250}
                          className="awards-fieldset-img"
                        />
                      ))
                    : null}
                </div>
                <div className="awards-fieldset-copy">
                  {detailed ? (
                    <>
                      <h2 className="awards-fieldset-title">{award.title}</h2>
                      <p className="awards-fieldset-featured">Featured by: {award.featuredBy}</p>
                      <h3 className="awards-fieldset-subtitle">About the Award</h3>
                      <p className="awards-fieldset-summary">{award.about}</p>
                      <h3 className="awards-fieldset-subtitle">Why We Won</h3>
                      <ul className="awards-fieldset-reasons">
                        {award.reasons.map((reason) => (
                          <li key={reason}>{reason}</li>
                        ))}
                      </ul>
                    </>
                  ) : (
                    <>
                      <h3 className="awards-fieldset-title">{award.title}</h3>
                      <p className="awards-fieldset-featured">Featured by: {award.featuredBy}</p>
                      <p className="awards-fieldset-summary">{award.summary}</p>
                    </>
                  )}
                </div>
              </div>
            </div>
          </fieldset>
        ))}
      </div>
    </section>
  );
}
