export function AiAgentDiagram() {
  return (
    <div className="diagram-container ai-agent zuse-service-card-art zuse-no-hover-scale">
      <div className="column left-column">
        <div className="item">
          <img loading="lazy" src="/images/ai-agent/mail.png" alt="Gmail" className="icon" />
          <div className="text-group">
            <div className="title">New enquiry</div>
            <div className="subtitle">Gmail</div>
          </div>
        </div>
        <div className="item">
          <img loading="lazy" src="/images/ai-agent/lead.png" alt="HubSpot" className="icon" />
          <div className="text-group">
            <div className="title">New leadw</div>
            <div className="subtitle">HubSpot</div>
          </div>
        </div>
        <div className="item">
          <img loading="lazy" src="/images/ai-agent/drive.png" alt="Google Drive" className="icon" />
          <div className="text-group">
            <div className="title">Client filew</div>
            <div className="subtitle">PDF</div>
          </div>
        </div>
      </div>

      <div className="flow-connector left">
        <img loading="lazy" src="/images/ai-agent/mobileflow.svg" alt="" className="block md:hidden" />
        <img loading="lazy" src="/images/ai-agent/leftflow.svg" alt="" className="hidden md:block desktop-img" />
      </div>

      <div className="center-card">
        <div className="card-header">
          <img loading="lazy" src="/images/ai-agent/spark-tile.png" alt="AI Agent" />
          <h2>AI Agent</h2>
        </div>

        <div className="card-list">
          <div className="list-item">
            <img loading="lazy" src="/images/ai-agent/roundedcheck.svg" alt="" className="check-icon" />
            <span className="task">Researching company</span>
            <span className="time">2.1s</span>
          </div>
          <div className="list-item">
            <img loading="lazy" src="/images/ai-agent/roundedcheck.svg" alt="" className="check-icon" />
            <span className="task">Qualifying lead</span>
            <span className="time">1.4s</span>
          </div>
          <div className="list-item active">
            <img loading="lazy" src="/images/ai-agent/ai.png" alt="" className="spark-icon" />
            <span className="task">Routing to enterprise</span>
            <span className="status-badge">Running</span>
          </div>
        </div>
      </div>

      <div className="flow-connector right">
        <img loading="lazy" src="/images/ai-agent/mobileflow.svg" alt="" className="block md:hidden rotate-180" />
        <img loading="lazy" src="/images/ai-agent/rightflow.svg" alt="" className="hidden md:block desktop-img" />
      </div>

      <div className="column right-column">
        <div className="item">
          <img loading="lazy" src="/images/ai-agent/fillroundedcheck.png" alt="" className="icon-small" />
          <div className="title">Lead qualified</div>
        </div>
        <div className="item">
          <img loading="lazy" src="/images/ai-agent/fillroundedcheck.png" alt="" className="icon-small" />
          <div className="title">CRM updated</div>
        </div>
        <div className="item">
          <img loading="lazy" src="/images/ai-agent/fillroundedcheck.png" alt="" className="icon-small" />
          <div className="title">Summary ready</div>
        </div>
      </div>
    </div>
  );
}
