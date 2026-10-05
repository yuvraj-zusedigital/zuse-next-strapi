import Image from "next/image";
import type {
  CaseStudy,
  CaseStudyBlock,
  CaseStudyImage,
  CaseStudyMetaField,
} from "@/lib/casestudies/types";
import CaseStudyTestimonial from "@/components/casestudy/CaseStudyTestimonial";
import { JsonLd } from "@/components/seo/JsonLd";

type Props = {
  study: CaseStudy;
  jsonLd: Record<string, unknown> | Record<string, unknown>[];
};

function MetaValue({ field }: { field: CaseStudyMetaField }) {
  if (field.list?.length) {
    return (
      <ul className="case-study-meta-list">
        {field.list.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    );
  }
  if (field.href) {
    return (
      <a
        href={field.href}
        target="_blank"
        rel="noopener noreferrer"
        className="case-study-meta-link"
      >
        {field.hrefLabel || field.value || field.href}
      </a>
    );
  }
  return <p>{field.value}</p>;
}

function StudyImage({ image }: { image: CaseStudyImage }) {
  return (
    <Image
      src={image.src}
      alt={image.alt || "Case study image"}
      width={image.width || 1084}
      height={image.height || 610}
      className="case-study-img"
      sizes="(max-width: 1100px) 100vw, 1084px"
    />
  );
}

function Block({ block }: { block: CaseStudyBlock }) {
  if (block.type === "image") {
    return (
      <div className="case-study-full-width-img">
        <div className="case-study-container">
          <StudyImage image={block.image} />
        </div>
      </div>
    );
  }

  if (block.type === "imageGrid") {
    return (
      <div className="case-study-grid-imgs">
        <div className="case-study-container">
          <div className="case-study-grid-imgs-inn">
            {block.images.map((image, i) => (
              <div key={i} className="case-study-grid-imgs-inn-comm">
                <StudyImage image={image} />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const cols = block.bulletColumns === 2 ? "case-study-bullets-2" : "";

  return (
    <section className="case-study-section">
      <div className="case-study-container">
        {block.title ? <h3 className="case-study-h3">{block.title}</h3> : null}
        {block.paragraphs?.map((p, i) => (
          <p key={i} className="case-study-p">
            {p}
          </p>
        ))}
        {block.bullets?.length ? (
          <ul className={`case-study-bullets ${cols}`.trim()}>
            {block.bullets.map((bullet, i) => (
              <li key={i}>
                {bullet.title ? <h4>{bullet.title}</h4> : null}
                <div className="case-study-bullet-body">{bullet.body}</div>
              </li>
            ))}
          </ul>
        ) : null}
      </div>
    </section>
  );
}

export default function CaseStudyExperience({ study, jsonLd }: Props) {
  return (
    <main className="case-study-page overflow-x-hidden">
      <JsonLd data={jsonLd} />

      <section
        className="case-study-banner"
        style={{ backgroundImage: `url(${study.banner})` }}
      >
        <div className="case-study-container hidden md:block">
          <h1 className="case-study-banner-title">{study.title}</h1>
        </div>
      </section>

      <section className="case-study-textual">
        <div className="case-study-container">
          {/* Same title shown in the mobile layout position; kept as a styled
              non-heading so the page has a single <h1> (the banner one above). */}
          <p className="case-study-banner-title md:hidden">{study.title}</p>
          <div className="case-about-parent">
            <div className="case-about">
              <h2>About</h2>
              <p className="case-study-textual-desc">{study.about}</p>
            </div>
            <div className="case-points">
              {study.meta.map((field) => (
                <div key={field.label} className="case-point">
                  <h4>{field.label}:</h4>
                  <MetaValue field={field} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {study.blocks.map((block, i) => (
        <Block key={i} block={block} />
      ))}

      {study.testimonial ? (
        <CaseStudyTestimonial testimonial={study.testimonial} />
      ) : null}
    </main>
  );
}
