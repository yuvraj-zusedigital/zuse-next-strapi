import { CDN_URL } from "@/lib/config/cdn";
import Image from "next/image";

type ReviewBadgeProps = {
  icon: string;
  label: string;
  iconWidth?: number;
  iconHeight?: number;
};

export default function ReviewBadge({ icon, label, iconWidth = 34, iconHeight = 34 }: ReviewBadgeProps) {
  return (
    <div className="contact-review-badge">
      <img loading="lazy" src={icon} alt={`${label} icon`} width={iconWidth} height={iconHeight} className="contact-review-icon" />
      <div className="contact-review-content">
        <div className="contact-review-score">
          <span>5.0</span>
          <div className="contact-review-stars">
            {[...Array(5)].map((_, i) => (
              <img loading="lazy"
                key={i}
                src={`${CDN_URL}/images/cont-star-icon.svg`}
                alt="Star"
                width={20}
                height={20}
                className="contact-review-star"
              />
            ))}
          </div>
        </div>
        <p>{label}</p>
      </div>
    </div>
  );
}
