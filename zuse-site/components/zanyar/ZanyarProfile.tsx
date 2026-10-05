import { Fragment } from "react";
import Link from "next/link";
import { GradientTitle } from "@/components/sections/InlineText";
import ZanyarPortrait from "@/components/zanyar/ZanyarPortrait";
import { linkHref, type Media, type ProfileSection } from "@/lib/sections";

const DEFAULT_PORTRAIT: Media = {
  url: "/images/zanyar/zanyar-outhman-australia-top-50-small-business-leader-2017.webp",
  alt: "Zanyar Outhman, recognized as one of Australia’s Top 50 Small Business Leaders in 2017 by Inside Small Business",
};

/** Person banner with portrait, bio blocks and a link (sections.profile). */
export default function ZanyarProfile({ data: profile }: { data: ProfileSection }) {
  const portrait = profile.image ?? DEFAULT_PORTRAIT;
  const link = profile.link;
  const href = linkHref(link);

  return (
      <section className="about-zan-banner">
        <div className="section-container">
          <div className="about-zan-banner-inn">
            <div className="about-zan-banner-left">
              <h1 className="about-zan-banner-title">
                <GradientTitle text={profile.name} immediate as="span" className="zuse-display-gradient" />
              </h1>
              {profile.role ? <h2 className="about-zan-banner-role">{profile.role}</h2> : null}

              {profile.lead ? <p className="about-zan-banner-lead">{profile.lead}</p> : null}

              <ZanyarPortrait className="about-zan-portrait-mobile" image={portrait} caption={profile.imageCaption} />

              {profile.blocks.map((block, index) => (
                <Fragment key={index}>
                  <h3 className="about-zan-banner-heading">{block.title}</h3>
                  <p className="about-zan-banner-copy">{block.description}</p>
                </Fragment>
              ))}

              {link && href ? (
                <Link
                  href={href}
                  {...(link.openInNewTab ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                  className="about-zan-banner-linkedin"
                >
                  {link.label}
                </Link>
              ) : null}
            </div>

            <aside className="about-zan-banner-right">
              <ZanyarPortrait image={portrait} caption={profile.imageCaption} />
            </aside>
          </div>
        </div>
      </section>
  );
}
