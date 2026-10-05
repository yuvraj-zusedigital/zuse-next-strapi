import Image from "next/image";
import type { Media } from "@/lib/sections";

export default function ZanyarPortrait({
  className = "",
  image,
  caption,
}: {
  className?: string;
  image: Media;
  /** Screen-reader caption. */
  caption?: string | null;
}) {
  return (
    <figure className={`about-zan-portrait ${className}`.trim()}>
      <Image
        src={image.url}
        alt={image.alt}
        width={620}
        height={876}
        className="about-zan-portrait-img"
        sizes="(max-width: 767px) 220px, (max-width: 1023px) 28vw, 35vw"
        priority
      />
      {caption ? <figcaption className="sr-only">{caption}</figcaption> : null}
    </figure>
  );
}
