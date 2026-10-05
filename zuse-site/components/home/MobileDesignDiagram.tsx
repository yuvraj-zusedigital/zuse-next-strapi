import React from "react";
import Image from "next/image";

export default function MobileDesignDiagram() {
  return (
    <div className="mobile-container">
      <img loading="lazy"
        src="/images/mobiledesign/004/Silver.webp"
        className="mobile-mockup"
        alt="iPhone Mockup"
      />

      <div className="release-card">
        <div className="release-header">
          <div className="release-title-group">
            <span className="label">Release</span>
            <span className="version">v2.4.0</span>
          </div>
          <div className="release-badges">
            <div className="commit-badge">
              <img loading="lazy" src="/images/mobiledesign/filter.png" alt="commit" />
              <span>a1b2c3</span>
            </div>
            <div className="branch-badge">
              <img loading="lazy" src="/images/mobiledesign/branch.png" alt="branch" />
              <span>main</span>
            </div>
          </div>
        </div>

        <div className="release-list">
          <div className="release-item app-store">
            <div className="icon-wrapper">
              <img loading="lazy" src="/images/mobiledesign/apple.png" alt="Apple" />
            </div>
            <div className="text-group">
              <span className="store-name">App Store</span>
              <span className="status-text">submitted 2h ago</span>
            </div>
            <div className="status-label in-review">
              <div className="dot"></div>
              <span>In Review</span>
            </div>
          </div>

          <div className="release-item google-play">
            <div className="icon-wrapper">
              <img loading="lazy" src="/images/mobiledesign/googleplay.png" alt="Google Play" />
            </div>
            <div className="text-group">
              <span className="store-name">Google Play</span>
              <span className="status-text">rolled out</span>
            </div>
            <div className="status-label live">
              <div className="dot"></div>
              <span>Live · 100%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
