import React from "react";
import Image from "next/image";

export default function WebApplicationDiagram() {
  return (
    <div className="webapplication-container">
      <div className="webapp-header">
        <div className="webapp-header-actions">
          <img loading="lazy"
            className="webapp-icon-btn"
            src="/images/web-application/search.svg"
            alt="Search"
          />
          <button className="webapp-btn">
            <img loading="lazy"
              src="/images/web-application/customize.svg"
              alt="Customize"
              style={{ width: "6.43px", height: "6.43px" }}
            />
            Customize
          </button>
          <button className="webapp-btn">
            <img loading="lazy"
              src="/images/web-application/export.svg"
              alt="Export"
              style={{ width: "6.43px", height: "6.43px" }}
            />
            Export
          </button>
        </div>
      </div>
      <div className="webapp-top-graphs">
        <img loading="lazy"
          className="webapp-graph-1"
          src="/images/web-application/graph1.svg"
          alt="Bar Chart"
        />
        <img loading="lazy"
          className="webapp-graph-2"
          src="/images/web-application/graph2.svg"
          alt="Circular Chart"
        />
      </div>
      <img loading="lazy"
        className="webapp-graph-3"
        src="/images/web-application/graph3.svg"
        alt="Table Data"
      />
    </div>
  );
}
