import { CDN_URL } from "@/lib/config/cdn";
import { forwardRef, type MouseEvent } from "react";
import Image from "next/image";
import Link from "next/link";

export type BlogCardProps = {
  title: string;
  href: string;
  image: string;
  authorName?: string;
  authorImage?: string;
  className?: string;
  onClick?: (e: MouseEvent<HTMLAnchorElement>) => void;
  draggable?: boolean;
};

const DEFAULT_AUTHOR_NAME = "Zanyar";
const DEFAULT_AUTHOR_IMAGE =
  `${CDN_URL}/DSC_1471_bbfb859049.JPG`;

const BlogCard = forwardRef<HTMLElement, BlogCardProps>(function BlogCard(
  {
    title,
    href,
    image,
    authorName = DEFAULT_AUTHOR_NAME,
    authorImage = DEFAULT_AUTHOR_IMAGE,
    className = "",
    onClick,
    draggable,
  },
  ref
) {
  return (
    <article
      ref={ref}
      className={`flex h-full flex-col ${className}`.trim()}
    >

      <Link
        href={href}
        className="zuse-blog-card relative flex-1 h-full"
        onClick={onClick}
        draggable={draggable}
        aria-label={title}
      >
        <div className="zuse-blog-card-graphic">
          <div className="zuse-blog-card-graphic-wrap">
            <Image
              src={image}
              alt=""
              fill
              sizes="(max-width: 700px) 92vw, (max-width: 1100px) 45vw, 280px"
              className="object-cover"
              draggable={draggable}
              unoptimized={image.startsWith("http")}
            />
          </div>
        </div>
        <div className="zuse-blog-card-body">
          <h3 className="zuse-blog-card-title">{title}</h3>
          <div className="flex flex-wrap flex-row items-center mt-5">
            <Image
              src={authorImage}
              alt={authorName}
              width={68}
              height={68}
              className="zuse-manifesto-img rounded-[6px] zuse-manifesto-img-1 manifesto-word"
            />
            <p>By {authorName}</p>
          </div>
        </div>
        <div className="zuse-blog-card-cta" aria-hidden="true">
          <span className="zuse-blog-card-cta-label">Read article</span>
          <svg
            className="zuse-blog-card-cta-arrow"
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            aria-hidden="true"
          >
            <path
              d="M5 12h14M12 5l7 7-7 7"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      </Link>
    </article>
  );
});

export default BlogCard;
