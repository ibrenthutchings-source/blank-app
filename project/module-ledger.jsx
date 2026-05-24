// module-ledger.jsx — Immutable hash chain · Merkle anchors

function Ledger() {
  const { LEDGER } = window.LR_DATA;
  const [pick, setPick] = React.useState(null);
  const toast = window.useToast();
  return (
    <div className="lr-page">
      <PageHeader
        eyebrow="MODULE · 04"
        title="Ledger of Truth"
        sub="Every anchor is a block; every block carries the hashes of both shadows of the policy at that instant. A comma slipped into either side breaks the signature."
        actions={<>
          <button className="lr-btn" onClick={() => toast({ title: "Evidence pack queued", msg: "Last 30 days · 47 anchors · 12 deviations → SOC bundle.", tone: "ok", hash: "evidence-2026-04-22_to_2026-05-22.zip" })}>Export evidence pack</button>
          <button className="lr-btn primary" onClick={() => window.__verifyChain?.()}>Verify chain</button>
        </>}
      />

      {/* Chain summary */}
      <div className="lr-stats" style={{ gridTemplateColumns: "repeat(5, 1fr)" }}>
        <div className="lr-stat">
          <div className="lr-stat-label">Latest block</div>
          <div className="lr-stat-value mono" style={{ fontFamily: "Geist Mono, monospace", fontSize: 26 }}>#482</div>
          <div className="lr-stat-meta">a8f3c91 · 2m ago</div>
        </div>
        <div className="lr-stat">
          <div className="lr-stat-label">Chain depth</div>
          <div className="lr-stat-value">482</div>
          <div className="lr-stat-meta">since 2024-09-04</div>
        </div>
        <div className="lr-stat">
          <div className="lr-stat-label">Verified</div>
          <div className="lr-stat-value" style={{ color: "var(--ok)" }}>100%</div>
          <div className="lr-stat-meta">last pass 4h ago</div>
        </div>
        <div className="lr-stat">
          <div className="lr-stat-label">Anchored policies</div>
          <div className="lr-stat-value">7 / 9</div>
          <div className="lr-stat-meta">2 require re-anchor</div>
        </div>
        <div className="lr-stat">
          <div className="lr-stat-label">Witnesses</div>
          <div className="lr-stat-value">3</div>
          <div className="lr-stat-meta">audit · sec · privacy</div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 16 }}>
        {/* Block list */}
        <div className="lr-card" style={{ overflow: "hidden" }}>
          <div className="lr-card-hd">
            <h3>Chain</h3>
            <span className="muted" style={{ fontSize: 11 }}>most recent first</span>
            <div style={{ marginLeft: "auto", display: "flex", gap: 6 }}>
              <button className="lr-btn sm ghost" onClick={() => toast({ msg: "Filter chain by policy, actor, action…", duration: 1800 })}>Filter</button>
              <button className="lr-btn sm ghost" onClick={() => toast({ title: "Exporting CSV", msg: `${LEDGER.length} visible blocks → ledger-2026-05-22.csv`, tone: "ok" })}>Export CSV</button>
            </div>
          </div>
          <div style={{ padding: "10px 0" }}>
            {LEDGER.map((b, i) => (
              <BlockRow key={b.block} block={b} prev={LEDGER[i + 1]} isPick={pick === b.block} onClick={() => setPick(b.block === pick ? null : b.block)} />
            ))}
          </div>
        </div>

        {/* Merkle anchor inspector */}
        <div className="lr-card">
          <div className="lr-card-hd">
            <h3>Anchor inspector</h3>
            <span className="muted" style={{ fontSize: 11 }}>{pick ? `block #${pick}` : "select a block"}</span>
          </div>
          <div className="lr-card-bd">
            <MerkleTree />

            <div style={{ height: 1, background: "var(--line-1)", margin: "16px 0" }}/>

            <HashTriple labelA="Context Hash"  va="e3b0c44…b855"
                        labelB="State Hash"    vb="9d4b2c8…1f6e"
                        labelM="Manifest"      vm="a8f3c91…2d7b" />

            <div style={{ marginTop: 14, padding: 10, border: "1px dashed var(--line-1)", borderRadius: 6, fontSize: 11.5, color: "var(--fg-2)", lineHeight: 1.55 }}>
              Witnesses co-sign each manifest. Internal Audit holds <span className="mono" style={{ color: "var(--fg-1)" }}>ed25519:0x7c4f…</span> — verify your local copy at the prompt with <span className="kbd">lex verify --block 482</span>.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function BlockRow({ block, prev, isPick, onClick }) {
  const actionColors = {
    "re-anchor":      "var(--accent)",
    "drift_detected": "var(--accent-2)",
    "approval":       "var(--ok)",
    "version_bump":   "var(--info)",
    "conflict_flag":  "var(--crit)",
    "gap_flag":       "var(--warn)",
    "create":         "var(--ok)",
  };
  return (
    <div onClick={onClick}
         style={{
           display: "grid", gridTemplateColumns: "44px 90px 1fr 160px",
           padding: "10px 14px", gap: 12, cursor: "pointer",
           background: isPick ? "color-mix(in oklab, var(--accent) 10%, transparent)" : "transparent",
           borderLeft: isPick ? "2px solid var(--accent)" : "2px solid transparent",
           transition: "background .12s",
         }}>
      {/* Chain link visual */}
      <div style={{ position: "relative", display: "flex", flexDirection: "column", alignItems: "center" }}>
        <div style={{
          width: 16, height: 16, borderRadius: 3,
          border: "1px solid " + actionColors[block.action],
          background: "color-mix(in oklab, " + actionColors[block.action] + " 25%, var(--bg-1))",
        }}/>
        {prev && <div style={{ position: "absolute", top: 18, bottom: -14, width: 1, background: "var(--line-1)" }}/>}
      </div>
      <div className="mono" style={{ color: "var(--fg-1)", fontSize: 12 }}>#{block.block}</div>
      <div style={{ minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span className="mono" style={{ color: "var(--fg-1)", fontSize: 12 }}>{block.policy}</span>
          <span className="lr-badge plain" style={{ color: actionColors[block.action] }}>{block.action.replace("_", " ")}</span>
        </div>
        <div style={{ fontSize: 12, color: "var(--fg-2)", marginTop: 3 }}>{block.note}</div>
      </div>
      <div style={{ textAlign: "right", fontFamily: "Geist Mono, monospace", fontSize: 11, color: "var(--fg-3)" }}>
        {block.actor}
        <div>{window.relTime(block.ts)}</div>
      </div>
    </div>
  );
}

function MerkleTree() {
  // 3-level miniature: leaves → branches → root
  const leaves = [
    { x: 30,  l: "text₀" },
    { x: 90,  l: "yaml₀" },
    { x: 150, l: "hooks" },
    { x: 210, l: "wflow" },
  ];
  return (
    <svg viewBox="0 0 240 130" style={{ width: "100%", height: 130 }}>
      {/* lines */}
      <path d="M30 100 L60 65 M90 100 L60 65 M150 100 L180 65 M210 100 L180 65 M60 65 L120 25 M180 65 L120 25"
            fill="none" stroke="var(--line-2)" strokeWidth="0.8"/>
      {/* leaves */}
      {leaves.map(n => (
        <g key={n.l} transform={`translate(${n.x},100)`}>
          <rect x="-15" y="-8" width="30" height="16" rx="2" fill="var(--bg-2)" stroke="var(--accent)" strokeWidth="0.8"/>
          <text textAnchor="middle" dy="3.5" fontSize="9" fill="var(--fg-1)" fontFamily="Geist Mono, monospace">{n.l}</text>
        </g>
      ))}
      {/* branches */}
      {[{ x: 60 }, { x: 180 }].map((b, i) => (
        <g key={i} transform={`translate(${b.x},65)`}>
          <circle r="9" fill="var(--bg-2)" stroke="var(--accent)" strokeWidth="0.8"/>
          <text textAnchor="middle" dy="3" fontSize="8" fill="var(--accent)" fontFamily="Geist Mono, monospace">⊕</text>
        </g>
      ))}
      {/* root */}
      <g transform="translate(120,25)">
        <circle r="13" fill="color-mix(in oklab, var(--accent) 35%, var(--bg-1))" stroke="var(--accent)" strokeWidth="1.2"/>
        <text textAnchor="middle" dy="4" fontSize="10" fill="var(--accent)" fontFamily="Geist Mono, monospace" fontWeight="600">root</text>
      </g>
      {/* labels */}
      <text x="120" y="5" textAnchor="middle" fontSize="8" fill="var(--fg-3)" fontFamily="Geist Mono, monospace" letterSpacing="0.06em">VERSION MANIFEST</text>
    </svg>
  );
}

function HashTriple({ labelA, va, labelB, vb, labelM, vm }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <Hash k={labelA} v={va} />
      <Hash k={labelB} v={vb} />
      <Hash k={labelM} v={vm} accent />
    </div>
  );
}

function Hash({ k, v, accent }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "6px 10px", border: "1px solid var(--line-1)", borderRadius: 6, background: "var(--bg-2)" }}>
      <span style={{ fontSize: 10.5, color: "var(--fg-3)", textTransform: "uppercase", letterSpacing: 0.06 + "em", minWidth: 100 }}>{k}</span>
      <span className="mono" style={{ fontSize: 12, color: accent ? "var(--accent)" : "var(--fg-1)" }}>{v}</span>
      <span style={{ marginLeft: "auto", color: "var(--fg-3)", cursor: "pointer", fontSize: 12 }}
            onClick={() => { try { navigator.clipboard?.writeText(v); } catch(_) {} }}>copy</span>
    </div>
  );
}

window.Ledger = Ledger;
