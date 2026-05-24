// module-pipelines.jsx — Risk-as-Code embeds in CI/CD
// HERO MODULE for Internal Audit. Shows policies acting as runtime gates.

function Pipelines() {
  const { PIPELINES } = window.LR_DATA;
  const [pick, setPick] = React.useState(PIPELINES[0].id);
  const [exceptionFor, setExceptionFor] = React.useState(null);
  const toast = window.useToast();
  const run = PIPELINES.find(p => p.id === pick) || PIPELINES[0];

  return (
    <div className="lr-page">
      <PageHeader
        eyebrow="MODULE · 05"
        title="Risk-as-Code"
        sub="The Closed Loop. Every build queries the Brain; every block prints the policy that stopped it. Exceptions don't get e-mailed — they get hashed."
        actions={<>
          <button className="lr-btn" onClick={() => toast({ msg: "Opening .lex-risk.yml template in clipboard…", tone: "ok" })}>View YAML</button>
          <button className="lr-btn primary" onClick={() => toast({ title: "Gate scaffolded", msg: "lex_gate added to .gitlab-ci.yml · merge to enable on main.", tone: "ok", hash: "PR co/payments-service#3142" })}>Install gate</button>
        </>}
      />

      {/* Embed example */}
      <SectionHd idx="01" title="The embed" sub="drop into any CI/CD" />
      <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: 16, marginBottom: 8 }}>
        <CodeBlock title=".gitlab-ci.yml" lang="yaml" lines={[
          { t: "lex_gate:",                            c: "k" },
          { t: "  stage: gate",                        c: "" },
          { t: "  image: lexrisk/cli:0.4",             c: "" },
          { t: "  script:",                            c: "k" },
          { t: "    - lex pull --brain prod",          c: "v" },
          { t: "    - lex evaluate \\",                c: "v" },
          { t: "        --pipeline $CI_PIPELINE_ID \\", c: "v" },
          { t: "        --threshold weight>=80 block",  c: "v", hl: true },
          { t: "        --threshold weight>=30 warn",   c: "v" },
          { t: "  rules:",                             c: "k" },
          { t: "    - if: $CI_COMMIT_BRANCH == \"main\"", c: "v" },
        ]} />
        <div className="lr-card" style={{ padding: 16 }}>
          <div style={{ fontSize: 10.5, color: "var(--fg-3)", letterSpacing: 0.06 + "em", textTransform: "uppercase" }}>What this does</div>
          <ul style={{ margin: "10px 0 0", padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: 12 }}>
            <Step n="1" t="Pulls the live policy manifest from the Brain." sub="Single fetch · cached for the build duration." />
            <Step n="2" t="Evaluates every policy hook against the target environment." sub="OPA, AWS Config, K8s, GitLab Scan — fan-out is the engine's problem, not yours." />
            <Step n="3" t="Blocks on weight ≥ 80; warns on ≥ 30; passes the rest." sub="Thresholds are policy-level; the auditor's view is uniform across teams." />
            <Step n="4" t="Writes the verdict — pass, warn, block — back to the Ledger." sub="The build log isn't the audit trail. The Ledger is." />
          </ul>
        </div>
      </div>

      {/* Active pipelines */}
      <SectionHd idx="02" title="Active pipelines" sub="last 4 hours" />
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1.4fr", gap: 16 }}>
        <div className="lr-card" style={{ overflow: "hidden" }}>
          {PIPELINES.map((p, i) => (
            <PipelineRow key={p.id} run={p} active={p.id === pick} onClick={() => setPick(p.id)} />
          ))}
        </div>
        <RunDetail run={run} onRequestException={(c) => setExceptionFor(c)} />
      </div>

      {/* Closed loop diagram */}
      <SectionHd idx="03" title="The closed loop" sub="how acceptance returns to the chain" />
      <ClosedLoop />

      <ExceptionModal open={!!exceptionFor} onClose={() => setExceptionFor(null)} run={run} check={exceptionFor} />
    </div>
  );
}

function Step({ n, t, sub }) {
  return (
    <li style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
      <span style={{
        width: 18, height: 18, borderRadius: "50%", border: "1px solid var(--accent)",
        display: "grid", placeItems: "center", fontSize: 10, color: "var(--accent)",
        fontFamily: "Geist Mono, monospace", flexShrink: 0, marginTop: 1,
      }}>{n}</span>
      <div>
        <div style={{ fontSize: 13, color: "var(--fg-0)" }}>{t}</div>
        <div style={{ fontSize: 11.5, color: "var(--fg-2)", marginTop: 2 }}>{sub}</div>
      </div>
    </li>
  );
}

function CodeBlock({ title, lang, lines }) {
  return (
    <div className="lr-card" style={{ padding: 0, overflow: "hidden" }}>
      <div style={{ padding: "8px 14px", borderBottom: "1px solid var(--line-1)", display: "flex", alignItems: "center", gap: 8 }}>
        <span style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--accent)" }}/>
        <span className="mono" style={{ fontSize: 11.5, color: "var(--fg-1)" }}>{title}</span>
        <span className="lr-badge plain" style={{ marginLeft: "auto" }}>{lang}</span>
      </div>
      <pre style={{ margin: 0, padding: "12px 14px", fontFamily: "Geist Mono, monospace", fontSize: 12, lineHeight: 1.7, color: "var(--fg-1)" }}>
        {lines.map((l, i) => (
          <div key={i} style={{
            background: l.hl ? "color-mix(in oklab, var(--accent) 14%, transparent)" : "transparent",
            marginLeft: -14, marginRight: -14, padding: "0 14px",
            borderLeft: l.hl ? "2px solid var(--accent)" : "2px solid transparent",
            color: l.c === "k" ? "var(--accent-2)" : l.c === "v" ? "var(--fg-1)" : "var(--fg-2)",
          }}>
            {l.t}
          </div>
        ))}
      </pre>
    </div>
  );
}

function PipelineRow({ run, active, onClick }) {
  const stateColor = run.state === "pass" ? "var(--ok)" : run.state === "warn" ? "var(--warn)" : "var(--crit)";
  const stateLabel = run.state === "pass" ? "PASSED" : run.state === "warn" ? "WARNING" : "BLOCKED";
  return (
    <div onClick={onClick} style={{
      padding: "12px 14px",
      cursor: "pointer",
      borderLeft: active ? "2px solid var(--accent)" : "2px solid transparent",
      borderBottom: "1px solid var(--line-1)",
      background: active ? "color-mix(in oklab, var(--accent) 6%, transparent)" : "transparent",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <span style={{
          width: 10, height: 10, borderRadius: 2,
          background: stateColor,
          boxShadow: `0 0 12px ${stateColor}`,
        }}/>
        <span className="mono" style={{ fontSize: 12.5, color: "var(--fg-0)" }}>{run.repo}</span>
        <span className="lr-badge plain" style={{ color: stateColor, marginLeft: "auto" }}>{stateLabel}</span>
      </div>
      <div style={{ marginTop: 6, display: "flex", alignItems: "center", gap: 12, fontSize: 11.5, color: "var(--fg-2)", fontFamily: "Geist Mono, monospace" }}>
        <span>{run.sha}</span>
        <span className="dim">·</span>
        <span>{run.branch}</span>
        <span className="dim">·</span>
        <span>{run.actor}</span>
        <span className="dim" style={{ marginLeft: "auto" }}>{run.triggered}</span>
      </div>
    </div>
  );
}

function RunDetail({ run, onRequestException }) {
  const toast = window.useToast();
  const blocked = run.checks.find(c => c.status === "fail");
  const stateLabel = run.state === "pass" ? "Passed all gates" : run.state === "warn" ? "Warnings present" : "Blocked";
  return (
    <div className="lr-card">
      <div className="lr-card-hd">
        <h3>{run.repo}</h3>
        <span className="mono dim" style={{ fontSize: 11, marginLeft: 4 }}>{run.sha} · {run.branch}</span>
        <span className={"lr-badge " + (run.state === "pass" ? "ok" : run.state === "warn" ? "warn" : "crit")} style={{ marginLeft: "auto" }}>{stateLabel}</span>
      </div>
      <div className="lr-card-bd" style={{ padding: 0 }}>
        {run.checks.map((c, i) => (
          <div key={i} style={{
            padding: "12px 14px",
            borderBottom: i < run.checks.length - 1 ? "1px solid var(--line-1)" : 0,
            display: "flex", alignItems: "center", gap: 12,
          }}>
            <CheckIcon status={c.status} />
            <div style={{ minWidth: 0, flex: 1 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span className="mono" style={{ color: "var(--fg-1)", fontSize: 12 }}>{c.policy}</span>
                <WeightBar w={c.weight}/>
              </div>
              {c.why && <div style={{ fontSize: 12, color: c.status === "fail" ? "var(--crit)" : "var(--warn)", marginTop: 4 }}>{c.why}</div>}
            </div>
            {c.status === "fail" && <button className="lr-btn sm" onClick={() => onRequestException?.(c)}>Request exception →</button>}
            {c.status === "pending" && <span className="lr-badge info">awaiting CAB</span>}
          </div>
        ))}
      </div>
      {blocked && (
        <div style={{ borderTop: "1px solid var(--line-1)", padding: 14, background: "color-mix(in oklab, var(--crit) 6%, transparent)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
            <span className="lr-badge crit">Exception path</span>
            <span style={{ fontSize: 12.5 }}>{blocked.policy} routes to <b>VP Engineering</b> + <b>CISO</b> · both must approve.</span>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button className="lr-btn sm" onClick={() => toast({ msg: "Workflow opens in Settings → Approvals.", duration: 1800 })}>View workflow</button>
            <button className="lr-btn sm primary" onClick={() => toast({ title: "Pinged 2 approvers", msg: "vp_engineering@co · ciso@co · response SLA 30m", tone: "ok" })}>Ping approvers</button>
            <span style={{ marginLeft: "auto", fontSize: 11.5, color: "var(--fg-3)", fontFamily: "Geist Mono, monospace" }}>
              acceptance → ledger block #483
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

function CheckIcon({ status }) {
  if (status === "pass") return <span style={{ width: 18, height: 18, borderRadius: "50%", background: "color-mix(in oklab, var(--ok) 25%, transparent)", color: "var(--ok)", display: "grid", placeItems: "center", fontSize: 11 }}>✓</span>;
  if (status === "fail") return <span style={{ width: 18, height: 18, borderRadius: "50%", background: "color-mix(in oklab, var(--crit) 25%, transparent)", color: "var(--crit)", display: "grid", placeItems: "center", fontSize: 11 }}>✕</span>;
  if (status === "warn") return <span style={{ width: 18, height: 18, borderRadius: "50%", background: "color-mix(in oklab, var(--warn) 25%, transparent)", color: "var(--warn)", display: "grid", placeItems: "center", fontSize: 11 }}>!</span>;
  return <span style={{ width: 18, height: 18, borderRadius: "50%", background: "var(--bg-3)", color: "var(--fg-2)", display: "grid", placeItems: "center", fontSize: 11 }}>○</span>;
}

function ClosedLoop() {
  return (
    <div className="lr-card" style={{ padding: 24, overflow: "hidden", position: "relative" }}>
      <svg viewBox="0 0 920 220" style={{ width: "100%", height: 220, display: "block" }}>
        <defs>
          <marker id="lr-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
            <path d="M0 0 L10 5 L0 10 z" fill="var(--accent)"/>
          </marker>
          <marker id="lr-arrow-2" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
            <path d="M0 0 L10 5 L0 10 z" fill="var(--accent-2)"/>
          </marker>
        </defs>

        {[
          { x: 60,  y: 110, label: "CI/CD build", sub: "main @ a8f3c91", side: "outside" },
          { x: 240, y: 110, label: "lex gate",   sub: "embed", side: "outside" },
          { x: 420, y: 110, label: "Brain",      sub: "policy manifest", accent: true },
          { x: 600, y: 110, label: "Hooks fan-out", sub: "OPA · AWS · K8s", side: "outside" },
          { x: 780, y: 110, label: "Verdict",    sub: "pass / warn / block", side: "outside" },
        ].map((n, i, arr) => (
          <g key={i} transform={`translate(${n.x},${n.y})`}>
            <rect x="-58" y="-26" width="116" height="52" rx="6"
                  fill={n.accent ? "color-mix(in oklab, var(--accent) 18%, var(--bg-2))" : "var(--bg-2)"}
                  stroke={n.accent ? "var(--accent)" : "var(--line-2)"} strokeWidth="0.8"/>
            <text textAnchor="middle" y="-4" fontSize="12" fill="var(--fg-0)" fontWeight="500">{n.label}</text>
            <text textAnchor="middle" y="12" fontSize="10" fill="var(--fg-3)" fontFamily="Geist Mono, monospace">{n.sub}</text>
          </g>
        ))}

        {/* Forward arrows */}
        {[
          [60+58, 110, 240-58, 110],
          [240+58, 110, 420-58, 110],
          [420+58, 110, 600-58, 110],
          [600+58, 110, 780-58, 110],
        ].map((a, i) => (
          <line key={i} x1={a[0]} y1={a[1]} x2={a[2]} y2={a[3]} stroke="var(--accent)" strokeWidth="1" markerEnd="url(#lr-arrow)"/>
        ))}

        {/* Return arc: verdict → ledger → brain */}
        <path d="M 780 136 Q 780 200 600 200 L 240 200 Q 60 200 60 136"
              fill="none" stroke="var(--accent-2)" strokeWidth="1" strokeDasharray="4 3"
              markerEnd="url(#lr-arrow-2)"/>
        <g transform="translate(420, 200)">
          <rect x="-58" y="-14" width="116" height="28" rx="6" fill="var(--bg-2)" stroke="var(--accent-2)" strokeWidth="0.8"/>
          <text textAnchor="middle" y="4" fontSize="11" fill="var(--accent-2)">Ledger ← exception accepted</text>
        </g>
      </svg>
      <div style={{ fontSize: 11.5, color: "var(--fg-2)", textAlign: "center", marginTop: 6 }}>
        Acceptance is not a checkmark in an inbox. It is a signed block — block #483 — written into the chain, retrievable by hash, immutable.
      </div>
    </div>
  );
}

window.Pipelines = Pipelines;
