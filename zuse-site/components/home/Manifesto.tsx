"use client";

import { Fragment, useRef } from "react";
import { linkHref, type ManifestoSection, type Media } from "@/lib/sections";
import Image from "next/image";
import Button from "@/components/ui/Button";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger, useGSAP);
}

/** Round portrait, or a wider image group (e.g. two app logos) when the image is landscape. */
function InlineImage({ image }: { image: Media }) {
  const wide = (image.width ?? 1) / (image.height ?? 1) > 1.5;
  return wide ? (
    <Image
      src={image.url}
      alt={image.alt}
      width={68}
      height={34}
      className="zuse-manifesto-img-group manifesto-word object-contain relative top-[-7px] left-[-4px]"
    />
  ) : (
    <Image src={image.url} alt={image.alt} width={34} height={34} className="zuse-manifesto-img zuse-manifesto-img-1 manifesto-word" />
  );
}

export default function Manifesto({ data }: { data: ManifestoSection }) {
  const ctaHref = linkHref(data.cta);
  const sectionRef = useRef<HTMLElement>(null);
  const container = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const section = sectionRef.current;
      if (!section) return;

      const mm = gsap.matchMedia();

      // Scroll-driven reveal that only moves forward and runs once.
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        section.setAttribute("data-motion", "scroll-once");
        gsap.set(".manifesto-word", { opacity: 0.2 });

        const reveal = gsap.to(".manifesto-word", {
          opacity: 1,
          ease: "none",
          stagger: 0.12,
          paused: true,
        });
        let furthestProgress = 0;

        const trigger = ScrollTrigger.create({
          trigger: container.current,
          start: "top 80%",
          end: "bottom 35%",
          onUpdate: (self) => {
            if (self.progress <= furthestProgress) return;

            furthestProgress = self.progress;
            gsap.to(reveal, {
              progress: furthestProgress,
              duration: 0.18,
              ease: "power1.out",
              overwrite: true,
            });

            if (furthestProgress >= 0.999) self.kill();
          },
        });

        return () => {
          trigger.kill();
          reveal.kill();
          section.removeAttribute("data-motion");
          gsap.set(".manifesto-word", { clearProps: "opacity" });
        };
      });

      // Explicit full opacity when reduced motion is preferred.
      mm.add("(prefers-reduced-motion: reduce)", () => {
        section.removeAttribute("data-motion");
        gsap.set(".manifesto-word", { opacity: 1 });
        return () => {
          gsap.set(".manifesto-word", { clearProps: "opacity" });
        };
      });

      return () => mm.revert();
    },
    { scope: container }
  );

  const wrapWords = (text: string) => {
    return text.split(/\s+/).filter(Boolean).map((word, i) => (
      <span key={`${word}-${i}`} className="manifesto-word">
        {word}{" "}
      </span>
    ));
  };

  return (
    <section className="zuse-manifesto-section" ref={sectionRef}>
      <div className="zuse-manifesto-text-container" ref={container}>
        <p className="zuse-manifesto-text md:mt-2" id="manifesto-text">
          {data.paragraphs.map((paragraph, index) => (
            <Fragment key={index}>
              {index > 0 && (
                <>
                  <br />
                  <br />
                </>
              )}
              {wrapWords(paragraph.textBefore ?? "")}
              {paragraph.inlineImage ? <InlineImage image={paragraph.inlineImage} /> : null}
              {wrapWords(paragraph.textAfter ?? "")}
            </Fragment>
          ))}
        </p>

        {data.cta && ctaHref ? (
          <Button href={ctaHref} variant={data.cta.variant ?? "secondary"} className="zuse-manifesto-btn">
            {data.cta.label}
          </Button>
        ) : null}
      </div>
    </section>
  );
}
