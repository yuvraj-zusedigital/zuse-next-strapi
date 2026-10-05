"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import {
  projectHref,
  projectPoster,
  projectTitle,
  projectVideo,
  type WorkProject,
  projectLabel,
} from "@/lib/work";

function WorkTile({ project, index }: { project: WorkProject; index: number }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const title = projectTitle(project);
  const href = projectHref(project);
  const poster = projectPoster(project);
  const videoUrl = projectVideo(project);
  const isFull = project.GirdStyle === "FullWidth";
  const comingSoon = Boolean(
    project.is_coming_soon || project.select_type === "Image"
  );

  const play = async () => {
    const video = videoRef.current;
    if (!video || !videoUrl) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    try {
      video.currentTime = 0;
      await video.play();
      setIsPlaying(true);
    } catch {
      setIsPlaying(false);
    }
  };

  const pause = () => {
    const video = videoRef.current;
    if (!video) return;
    video.pause();
    video.currentTime = 0;
    setIsPlaying(false);
  };

  const media = (
    <div
      className={`block img-wrapper ${
        isFull
          ? "min-h-[40.77vw] md:min-h-[38.77vw] xl:min-h-[499px]"
          : "h-[94.595vw] md:h-[38.77vw] xl:h-[499px]"
      } ${isPlaying ? "is-playing" : ""}`}
    >
      <div className="work-card-border" aria-hidden="true">
        <div className="work-card-border-glow">
          <div className="work-card-border-gradient"></div>
        </div>
      </div>
      {videoUrl ? (
        <video
          ref={videoRef}
          className="work_video_has_url"
          src={videoUrl}
          muted
          playsInline
          loop
          preload="metadata"
        />
      ) : null}
      {poster ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          className="slide-thumb-img"
          src={poster}
          alt=""
          loading={index < 4 ? "eager" : "lazy"}
          width={isFull ? 1176 : 500}
          height={499}
        />
      ) : (
        <div className="work-tile-fallback" aria-hidden="true" />
      )}
    </div>
  );

  const meta = (
    <div className="home-projects-grid-info relative">
      {comingSoon ? (
        <div className="home-projects-grid-coming-soon">Coming Soon</div>
      ) : null}
      <h3 className="case_tile_anime home-projects-grid-title">
        <span>{title}</span>
      </h3>
      {projectLabel(project) ? (
        <div className="home-projects-grid-label">{projectLabel(project)}</div>
      ) : null}
    </div>
  );

  const className = isFull
    ? "home-projects-grid-item home-projects-grid-item-1 work_case_tile_anime w-full mb-[30px] md:mb-[50px] lg:mb-[70px] relative"
    : "anime-grid-item-row-init work_case_tile_anime anime-grid-item-row filterDiv web home-projects-grid-item w-full md:w-[42.5782vw] xl:w-[500px] mb-[30px] md:mb-[50px] lg:mb-[70px] relative";

  const body = (
    <>
      {isFull ? (
        <div className="comm-video-wrap rounded-[8px]">{media}</div>
      ) : (
        media
      )}
      {meta}
    </>
  );

  if (href) {
    return (
      <div
        className={className}
        onMouseEnter={play}
        onMouseLeave={pause}
      >
        <Link href={href} className="work-tile-link" aria-label={title}>
          {body}
        </Link>
      </div>
    );
  }

  return (
    <div className={className} onMouseEnter={play} onMouseLeave={pause}>
      {body}
    </div>
  );
}

export default function WorkProjectGrid({
  projects,
}: {
  projects: WorkProject[];
}) {
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const cards = document.querySelectorAll('.home-projects-grid-item');

      cards.forEach((card) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        // Calculate offset for gradient tracking center of mouse
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        const xOffset = x - centerX;
        const yOffset = y - centerY;

        (card as HTMLElement).style.setProperty('--card-mouse-x', `${xOffset}px`);
        (card as HTMLElement).style.setProperty('--card-mouse-y', `${yOffset}px`);
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  if (!projects.length) {
    return (
      <p className="work-empty-copy">
        Case studies for this category are coming soon.
      </p>
    );
  }

  return (
    <>
      {projects.map((project, index) => (
        <WorkTile
          key={
            project.slug || project.id || `${projectTitle(project)}-${index}`
          }
          project={project}
          index={index}
        />
      ))}
    </>
  );
}
