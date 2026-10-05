"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "@/components/icons/ArrowUpRight";

export type AuthorProfile = {
  name?: string;
  designation?: string;
  description?: string;
  imageUrl?: string;
  profileUrl?: string;
};

const DEFAULT_AUTHOR: Required<AuthorProfile> = {
  name: "Zanyar",
  designation: "Founder of Zuse Digital",
  description:
    "My lifelong pursuit is building digital products that empower people and drive positive change. I'm an AI Product Architect bridging product design, AI systems and delivery, leading teams from discovery to production and scale.",
  imageUrl: "/images/blogs/zanyar.png",
  profileUrl: "/zanyar-outhman",
};

/** Strapi stores absolute production URLs; keep same-site links relative so staging stays on staging. */
function toSiteHref(url: string): string {
  try {
    const parsed = new URL(url);
    return /(^|\.)zusedigital\.com$/.test(parsed.hostname)
      ? `${parsed.pathname}${parsed.search}${parsed.hash}`
      : url;
  } catch {
    return url;
  }
}

export function AuthorProfileCard({
  className = "",
  author,
}: {
  className?: string;
  author?: AuthorProfile;
}) {
  const cardRef = useRef<HTMLAnchorElement>(null);
  const name = author?.name || DEFAULT_AUTHOR.name;
  const designation = author?.designation || DEFAULT_AUTHOR.designation;
  const description = (author?.description || DEFAULT_AUTHOR.description)
    .replace(/^\s*↗\s*/, "");
  const imageUrl = author?.imageUrl || DEFAULT_AUTHOR.imageUrl;
  const profileHref = toSiteHref(author?.profileUrl || DEFAULT_AUTHOR.profileUrl);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!cardRef.current) return;
      const card = cardRef.current;
      const rect = card.getBoundingClientRect();
      const xOffset = e.clientX - rect.left - rect.width / 2;
      const yOffset = e.clientY - rect.top - rect.height / 2;
      card.style.setProperty("--card-mouse-x", `${xOffset}px`);
      card.style.setProperty("--card-mouse-y", `${yOffset}px`);
    };

    const card = cardRef.current;
    if (card) {
      card.addEventListener("mousemove", handleMouseMove);
      return () => card.removeEventListener("mousemove", handleMouseMove);
    }
  }, []);

  return (
    <Link
      ref={cardRef}
      href={profileHref}
      aria-label={`About ${name}`}
      className={`author-profile-glow ${className}`}
    >
      <div className="author-profile-border" aria-hidden="true">
        <div className="author-profile-border-glow">
          <div className="author-profile-border-gradient"></div>
        </div>
      </div>
      <div className="author-profile-card relative rounded-[6px] overflow-hidden w-full h-full">
        <div className="author-profile-clip scale-[1.1] absolute inset-0 overflow-hidden rounded-[6px]">
          <Image
            src="/images/blogs/blog-profile-bg.jpg"
            alt=""
            fill
            className="author-profile-bg object-cover absolute inset-0 z-0 pointer-events-none"
          />
        </div>
        <div
          className="author-profile-frame absolute inset-0 z-[1] rounded-[6px] pointer-events-none"
          aria-hidden="true"
        />
        <div className="author-profile-inner relative z-10 flex items-center md:items-start p-[20px] md:p-[30px]">
          <div className="flex flex-col md:flex-row gap-5 items-start">
            <Image
              src={imageUrl}
              alt={name}
              width={60}
              height={60}
              className="author-profile-avatar rounded-[4.28px] shrink-0 w-[60px] h-[60px]"
            />
            <div className="flex flex-col gap-3">
              <div className="author-profile-name flex flex-col gap-1">
                <div className="font-display font-semibold text-[28px] leading-[96%] tracking-[-0.02em] text-ink-800">
                  {name}
                </div>
                <div className="font-sans font-normal text-[14px] leading-[1.41] text-ink-400">
                  {designation}
                </div>
              </div>
              <p className="author-profile-desc font-sans font-normal text-base leading-[1.5] text-ink-550 m-0">
                <ArrowUpRight className="inline-block align-[-1px] mr-1 shrink-0" />
                {description}
              </p>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
