"use client";

import { useRef } from "react";
import Image from "next/image";
import { useStaggeredReveal } from "./hooks/useStaggeredReveal";
import type { BadgeGridSection } from "@/lib/sections";

export default function Stats({ data }: { data: BadgeGridSection }) {
  const sectionRef = useRef<HTMLElement>(null);
  useStaggeredReveal(sectionRef, ".zuse-stat-item");

  return (
    <section className="zuse-stats-section" ref={sectionRef}>
      <div className="zuse-stats-grid">
        {data.badges.map((stat, index) => (
          <div key={`${stat.url}-${index}`} className="zuse-stat-item">
            <Image
              src={stat.url}
              alt={stat.alt}
              width={210}
              height={140}
              className="w-full max-w-stat-item h-auto object-contain block"
              style={{ width: "100%", height: "auto" }}
            />
          </div>
        ))}
      </div>
    </section>
  );
}
