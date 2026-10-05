import Image from "next/image";
import type { LogoStripSection } from "@/lib/sections";

export default function Logos({ data }: { data: LogoStripSection }) {
  return (
    <section className="zuse-logos-section">
      <div className="max-w-zuse mx-auto">
        <div className="zuse-logos-heading-wrap">
          <span className="zuse-logos-heading zuse-logos-text-1">{data.headingBefore}</span>
          <span className="zuse-logos-heading zuse-logos-text-2">{data.headingHighlight}</span>
          {data.avatarImage ? (
            <Image src={data.avatarImage.url} alt={data.avatarImage.alt} width={46} height={20} className="zuse-logos-avatar-group" />
          ) : null}
          <span className="zuse-logos-heading zuse-logos-text-3">{data.headingAfter}</span>
        </div>

        <div className="zuse-logos-grid">
          {data.logos.map((logo, index) => (
            <Image
              key={`${logo.url}-${index}`}
              src={logo.url}
              alt={logo.alt}
              // Displayed at its natural size, capped by CSS (max 30px high).
              width={logo.width || 120}
              height={logo.height || 40}
              loading="lazy"
              className="zuse-logo-img"
            />
          ))}
        </div>
      </div>
    </section>
  );
}
