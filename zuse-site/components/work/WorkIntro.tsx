import { GradientTitle } from "@/components/sections/InlineText";

/** Work page heading (sections.page-intro on the Work page). Defaults: the original copy. */
export function WorkIntro({
  label = "Our Work",
  title = "Website, App\n& \u00a0*AI Case Studies*",
  lead = "See how we design and build websites, web apps, mobile apps and AI solutions that solve real business problems and drive growth.",
}: {
  label?: string;
  title?: string;
  lead?: string;
}) {
  return (
      <section className="page-title work-page-title relative pt-[140px] md:pt-[160px] lg:pt-[187px]">
        <div className="work-hero-blob-1" aria-hidden="true" />
        <div className="work-hero-blob-2" aria-hidden="true" />
        <div className="section-container relative z-10">
          <span className="block font-sans font-bold text-base md:text-[18px] leading-[1.4] tracking-[0.01em] uppercase text-ink-hero-label mb-2">
            {label}
          </span>
          <h1 className="work-page-heading">
            <GradientTitle text={title} as="span" immediate />
          </h1>
          <h2 className="work-page-lead">{lead}</h2>
        </div>
      </section>
  );
}
