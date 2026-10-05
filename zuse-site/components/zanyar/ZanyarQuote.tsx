import Image from "next/image";
import type { QuoteSection } from "@/lib/sections";

export default function ZanyarQuote({ data }: { data: QuoteSection }) {
  return (
    <section className="about-zan-quote">
      <div className="section-container">
        <blockquote className="about-zan-quote-text">
          <Image
            src="/images/zanyar/about-zan-start-quote.svg"
            alt=""
            width={70}
            height={56}
            aria-hidden="true"
            className="about-zan-quote-mark about-zan-quote-mark-start"
          />
          {data.quote}
          <Image
            src="/images/zanyar/about-zan-end-quote.svg"
            alt=""
            width={70}
            height={56}
            aria-hidden="true"
            className="about-zan-quote-mark about-zan-quote-mark-end"
          />
        </blockquote>
        <cite className="about-zan-quote-cite"> {data.citeImage ? <Image
          src={data.citeImage.url}
          alt={data.citeImage.alt}
          width={34}
          height={34}
          className="zuse-manifesto-img zuse-manifesto-img-1 manifesto-word"
        /> : null}{data.cite}</cite>
      </div>
    </section>
  );
}
