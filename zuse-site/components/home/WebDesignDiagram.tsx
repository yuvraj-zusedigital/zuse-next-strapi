import React from "react";
import Image from "next/image";

export default function WebDesignDiagram() {
  return (
    <div className="webdesign-container">
      <div className="webdesign-card">
        {/* Image Rectangle 161124112 */}
        <div className="webdesign-image"></div>

        {/* Title */}
        <div className="webdesign-title">
          DESIGNED
          <br />
          TO CONVERT
        </div>

        {/* Group 2147222168 */}
        <div className="webdesign-group"></div>

        {/* Texts (Dots) */}
        <div className="webdesign-dot-red"></div>
        <div className="webdesign-dot-yellow"></div>
        <div className="webdesign-dot-green"></div>

        {/* Button */}
        <div className="webdesign-button">
          <div className="webdesign-button-padding">
            <div className="webdesign-button-text">Let's Talk</div>
          </div>
          <div className="webdesign-button-placeholder"></div>
        </div>

        {/* Grey Text */}
        <div className="webdesign-desc-text">
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod
          tempor incididunt ut labore et dolore magna aliqua.
        </div>

        {/* Line 63 */}
        <div className="webdesign-line-63"></div>

        {/* Frame 2147228883 */}
        <div className="webdesign-top-frame">
          <div className="webdesign-box-fill"></div>

          {/* Keep the logo, but follow structure! Actually wait, they wanted exact structure. So I'll put logo inside box fill maybe? No, let's just keep the logo they requested earlier in a way that respects the structure */}
          <img loading="lazy"
            src="/images/webdesign/logo.svg"
            alt="Logo"
            className="webdesign-logo"
            style={{
              position: "absolute",
              left: "10.4%",
              right: "10.44%",
              top: "4.19%",
              bottom: "4.14%",
              height: "100%",
              width: "auto",
              objectFit: "contain",
              zIndex: 2,
            }}
          />
        </div>

        {/* Nav Texts */}
        <div className="webdesign-nav-links">
          <div className="webdesign-nav-item">Work</div>
          <div className="webdesign-nav-item">About us</div>
          <div className="webdesign-nav-item">Services</div>
          <div className="webdesign-nav-item">Contact us</div>
        </div>
      </div>
    </div>
  );
}
