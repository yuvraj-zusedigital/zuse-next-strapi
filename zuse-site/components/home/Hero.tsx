import { Fragment } from "react";
import Image from "next/image";
import { Button } from "@/components/ui";
import { GradientTitle } from "@/components/sections/InlineText";
import { linkHref, type HeroSection } from "@/lib/sections";

/** A line break in the label only applies on mobile. */
function Label({ text }: { text: string }) {
  return (
    <>
      {text.split("\n").map((line, index) => (
        <Fragment key={index}>
          {index > 0 && <br className="md:hidden" />}
          {line}
        </Fragment>
      ))}
    </>
  );
}

export default function Hero({ data }: { data: HeroSection }) {
  const primaryHref = linkHref(data.primaryCta);
  const secondaryHref = linkHref(data.secondaryCta);
  return (
    <section className="zuse-hero-section">
      <div className="zuse-global-bg-wrapper" aria-hidden="true">
        <div className="zuse-global-bg-inner">
          {data.backgroundImage ? <Image
            src={data.backgroundImage.url}
            alt={data.backgroundImage.alt}
            width={1224}
            height={1400}
            className="zuse-hero-bg"
            priority
            fetchPriority="high"
          /> : null}
        </div>
        <div className="zuse-global-bg-fade" />
      </div>

      <div className="max-w-zuse  w-full mx-auto">
        <div className="max-w-hero-title relative z-10">
          {data.label ? <div className="zuse-hero-label">
            {data.labelIcon ? <Image
              src={data.labelIcon.url}
              alt=""
              width={20}
              height={14}
              className="zuse-hero-label-flag"
              priority
              aria-hidden="true"
            /> : null}
            <span className="md:mt-1  max-md:leading-[1.4]"><Label text={data.label} /></span>
          </div> : null}

          <h1 className="zuse-hero-h1">
            <GradientTitle text={data.title} immediate as="span" className="zuse-display-gradient" />
          </h1>

          {data.description ? <p className="zuse-hero-p max-w-hero-desc">{data.description}</p> : null}

          <div className="zuse-hero-buttons">
            {data.primaryCta && primaryHref ? (
              <Button href={primaryHref} variant={data.primaryCta.variant ?? "primary"} arrow disabled>
                {data.primaryCta.label}
              </Button>
            ) : null}
            {data.secondaryCta && secondaryHref ? (
              <Button href={secondaryHref} variant={data.secondaryCta.variant ?? "secondary"}>
                {data.secondaryCta.label}
              </Button>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}
