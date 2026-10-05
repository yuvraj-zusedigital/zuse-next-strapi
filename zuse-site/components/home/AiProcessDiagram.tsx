import type { CSSProperties } from "react";

export function AiProcessDiagram() {
  return (
    <div
      className="aiprocess-container zuse-service-card-art zuse-no-hover-scale"
      style={
        {
          "--nh-width": "417px",
          "--nh-width-adjust": "0px",
          "--nh-bottom": "76px",
          "--nh-left": "calc(50% - 208px)",
          "--nh-left-adjust": "0px",
          height: "217px",
        } as CSSProperties
      }
    >
      <div className="aiprocess-card card-4">
        <img loading="lazy" src="/images/aiprocess/analitics.png" className="analytics-icon" alt="Analytics" />
        <h3 className="title">Predictive Analytics</h3>
      </div>
      <div className="aiprocess-card card-3">
        <img loading="lazy" src="/images/aiprocess/aisearch.png" className="search-icon" alt="AI Search" />
        <h3 className="title">AI Search &amp; Knowledge</h3>
      </div>
      <div className="aiprocess-card card-2">
        <img loading="lazy" src="/images/aiprocess/document.png" className="doc-icon" alt="Document Intelligence" />
        <h3 className="title">Document Intelligence</h3>
      </div>
      <div className="aiprocess-card card-1">
        <img loading="lazy" src="/images/aiprocess/voice.png" className="voice-icon" alt="Voice AI Products" />
        <div className="text-content">
          <h3 className="title">Voice AI Products</h3>
          <p className="subtitle">Make every conversation count.</p>
        </div>
      </div>
    </div>
  );
}
