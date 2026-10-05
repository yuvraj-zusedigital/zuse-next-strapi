import Image from "next/image";
import type { Media } from "@/lib/sections";

/** Auto-scrolling photo strip matching live site collage. */
export default function ZanyarCollage({ images }: { images: Media[] }) {
  const loop = [...images, ...images];

  return (
    <section className="about-zan-collage" aria-label="Photo collage">
      <div className="about-zan-collage-viewport">
        <div className="about-zan-collage-track">
          {loop.map((slide, index) => (
            <div className="about-zan-collage-slide" key={`${slide.url}-${index}`}>
              <Image
                src={slide.url}
                alt={slide.alt}
                width={480}
                height={560}
                className="about-zan-collage-img"
                sizes="(max-width: 767px) 206px, (max-width: 1023px) 344px, 300px"
                style={{ width: "100%", height: "100%" }}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
