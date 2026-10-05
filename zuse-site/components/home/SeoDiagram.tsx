export function SeoDiagram() {
  return (
    <div className="seo-html-diagram">
      <div className="seo-diagram-container">
            {/* AI answer block */}
            <div className="ai-answer">
              <div className="header">
                <div className="label">
                  <div className="mark">
                    <div className="sparkle">✦</div>
                  </div>
                  <div className="ai-assistant">AI assistant</div>
                </div>
                <div className="dots">•••</div>
              </div>

              <div className="question-row">
                <div className="user-question">
                  <div className="user-question-text">
                    Who does custom kitchens in Melbourne? I want design and installation from one
                    studio.
                  </div>
                </div>
              </div>

              <div className="answer-text">
                For design-and-install from one team <span className="box-shape-wrap"><span className="box-shape-text">Box Shape</span></span> is a Melbourne studio
                consistently well
                reviewed for custom kitchens and joinery. They design, make and install in-house, so one team owns the result.
                Other options include Halden Joinery and Studio Nine.
              </div>

              <div className="divider"></div>

              <div className="sources">
                <div className="sources-label">SOURCES</div>
                <div className="chip chip-1">
                  <div className="chip-text">boxshape.com.au</div>
                </div>
                <div className="chip chip-2">
                  <div className="chip-text">houzz.com.au</div>
                </div>
                <div className="plus-1">+1</div>
              </div>
            </div>

            {/* AI crawlers block */}
            <div className="crawler">
              <div className="ai-crawlers">
                <div className="crawler-header">
                  <div className="donut-container">
                    <img loading="lazy" src="/images/seo/progress.svg" style={{ width: "100%", height: "100%" }} alt="progress" />
                  </div>
                  <div className="crawler-header-stats">
                    <div className="crawler-period">last 30 days</div>
                    <div className="crawler-title">AI visibility</div>
                    <div className="crawler-trend">
                      <img loading="lazy" src="/images/seo/graph-hick.svg" className="crawler-trend-icon" alt="trend" />
                      <div className="crawler-trend-text">12 since last month</div>
                    </div>
                  </div>
                </div>

                <div className="list-item item-1" style={{ top: "101px" }}>
                  <div className="list-item-icon-box">
                    <img loading="lazy" src="/images/seo/chat-gtp.svg" style={{ width: "100%", height: "100%" }} alt="gpt" />
                  </div>
                  <div className="list-item-name">GPTBot</div>
                  <div className="list-item-right">
                    <div className="list-item-right-inner">
                      <img loading="lazy" src="/images/seo/check.svg" style={{ width: "11px", height: "11px" }} alt="trend" />
                      <div className="list-item-value">12</div>
                    </div>
                  </div>
                </div>

                <div className="list-item item-2" style={{ top: "136px" }}>
                  <div className="list-item-icon-box">
                    <img loading="lazy" src="/images/seo/PerplexityBot.svg" style={{ width: "100%", height: "100%" }} alt="perplexity" />
                  </div>
                  <div className="list-item-name">PerplexityBot</div>
                  <div className="list-item-right">
                    <div className="list-item-right-inner">
                      <img loading="lazy" src="/images/seo/check.svg" style={{ width: "11px", height: "11px" }} alt="trend" />
                      <div className="list-item-value">9</div>
                    </div>
                  </div>
                </div>

                <div className="list-item item-3" style={{ top: "171px" }}>
                  <div className="list-item-icon-box">
                    <img loading="lazy" src="/images/seo/google-extended.svg" style={{ width: "100%", height: "100%" }} alt="google-extended" />
                  </div>
                  <div className="list-item-name">Google-Extended</div>
                  <div className="list-item-right">
                    <div className="list-item-right-inner">
                      <img loading="lazy" src="/images/seo/check.svg" style={{ width: "11px", height: "11px" }} alt="trend" />
                      <div className="list-item-value">5</div>
                    </div>
                  </div>
                </div>

                <div className="list-item item-4" style={{ top: "206px" }}>
                  <div className="list-item-icon-box">
                    <img loading="lazy" src="/images/seo/claudebot.svg" style={{ width: "100%", height: "100%" }} alt="claude" />
                  </div>
                  <div className="list-item-name">ClaudeBot</div>
                  <div className="list-item-right">
                    <div className="list-item-right-inner last">
                      <img loading="lazy" src="/images/seo/check.svg" style={{ width: "11px", height: "11px" }} alt="trend" />
                      <div className="list-item-value">200</div>
                      <div className="days-ago">· 1d ago</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* AI visibility proof block */}
            <div className="ai-visibility-proof">
              <img loading="lazy" src="/images/seo/google-organic.svg" className="proof-image" alt="google-organic" />
              <div className="proof-inner">
                <div className="proof-query">
                  <div className="proof-label">Google organic</div>
                  <div className="proof-keyword">custom kitchens melbourne</div>
                </div>
                <div className="proof-rank">
                  <div className="proof-number">#1</div>
                </div>
              </div>
            </div>
          </div>
        </div>
  );
}
