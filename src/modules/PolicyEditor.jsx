import React from 'react'
import { useToast, usePolicies } from '../contexts'
import { STATUS_META } from '../data'
import { PageHeader, StatusBadge, WeightBar } from '../components/Shell'
import { relTime } from '../utils'

// ── Token mapping registry ─────────────────────────────────────────────
function buildMappings(policyId) {
  const m = {
    "POL-DB-001": [
      {
        id: "algo",
        textRe: /AES-(\d+)/,
        yamlRe: /algorithm: AES-(\d+)/,
        deriveYaml: (g) => g[1],
        yamlReplace: (v) => `algorithm: AES-${v}`,
        deriveText: (g) => g[1],
        textReplace: (v) => `AES-${v}`,
      },
      {
        id: "rot",
        textRe: /every (\d+) days/,
        yamlRe: /rotation_days: (\d+)/,
        deriveYaml: (g) => g[1],
        yamlReplace: (v) => `rotation_days: ${v}`,
        deriveText: (g) => g[1],
        textReplace: (v) => `every ${v} days`,
      },
      {
        id: "retain",
        textRe: /seven \(7\) years/,
        yamlRe: /audit_log_retention_years: (\d+)/,
        deriveYaml: () => 7,
        yamlReplace: (v) => `audit_log_retention_years: ${v}`,
      },
    ],
    "POL-ACCESS-014": [
      {
        id: "duration",
        textRe: /within (\d+) minutes/,
        yamlRe: /max_duration_minutes: (\d+)/,
        deriveYaml: (g) => g[1],
        yamlReplace: (v) => `max_duration_minutes: ${v}`,
        deriveText: (g) => g[1],
        textReplace: (v) => `within ${v} minutes`,
      },
      {
        id: "review",
        textRe: /within (\d+) hours/,
        yamlRe: /review_sla_hours: (\d+)/,
        deriveYaml: (g) => g[1],
        yamlReplace: (v) => `review_sla_hours: ${v}`,
      },
    ],
    "POL-DATA-007": [
      {
        id: "expires",
        textRe: /Transfer Impact Assessment/,
        yamlRe: /expires_days: (\d+)/,
        deriveYaml: () => 730,
        yamlReplace: (v) => `expires_days: ${v}`,
      },
    ],
    "POL-CICD-022": [
      {
        id: "days",
        textRe: /no more than (\d+) days/,
        yamlRe: /max_duration_days: (\d+)/,
        deriveYaml: (g) => g[1],
        yamlReplace: (v) => `max_duration_days: ${v}`,
        deriveText: (g) => g[1],
        textReplace: (v) => `no more than ${v} days`,
      },
    ],
    "POL-PII-031": [
      {
        id: "ret",
        textRe: /(\d+) days after/,
        yamlRe: /pii_max_days: (\d+)/,
        deriveYaml: (g) => g[1],
        yamlReplace: (v) => `pii_max_days: ${v}`,
        deriveText: (g) => g[1],
        textReplace: (v) => `${v} days after`,
      },
    ],
    "POL-SOX-003": [
      {
        id: "verify",
        textRe: /seventy-two \(72\) hours/,
        yamlRe: /verify_within_hours: (\d+)/,
        deriveYaml: () => 72,
        yamlReplace: (v) => `verify_within_hours: ${v}`,
      },
    ],
    "POL-IR-009": [
      {
        id: "ack",
        textRe: /(\d+)\) minutes/,
        yamlRe: /ack_minutes: (\d+)/,
        deriveYaml: (g) => g[1],
        yamlReplace: (v) => `ack_minutes: ${v}`,
      },
      {
        id: "contain",
        textRe: /(\d+)\) hours/,
        yamlRe: /contain_hours: (\d+)/,
        deriveYaml: (g) => g[1],
        yamlReplace: (v) => `contain_hours: ${v}`,
      },
    ],
    "POL-VND-011": [
      {
        id: "sla",
        textRe: /SOC 2 Type II/,
        yamlRe: /decision_sla_days: (\d+)/,
        deriveYaml: () => 21,
        yamlReplace: (v) => `decision_sla_days: ${v}`,
      },
    ],
    "POL-LOG-018": [
      {
        id: "imm",
        textRe: /within (\w+) \((\d+)\) minutes/,
        yamlRe: /write_immutable_within_minutes: (\d+)/,
        deriveYaml: (g) => g[2],
        yamlReplace: (v) => `write_immutable_within_minutes: ${v}`,
      },
    ],
  };
  return m[policyId] || [];
}

// Render text/YAML with token spans highlighted
function renderHighlighted(str, mappings, activeId, side) {
  const hits = [];
  for (const m of mappings) {
    const re = side === "text" ? new RegExp(m.textRe.source, m.textRe.flags + (m.textRe.flags.includes("g") ? "" : "g"))
                                : new RegExp(m.yamlRe.source, m.yamlRe.flags + (m.yamlRe.flags.includes("g") ? "" : "g"));
    let mt;
    while ((mt = re.exec(str)) !== null) {
      hits.push({ start: mt.index, end: mt.index + mt[0].length, id: m.id, s: mt[0] });
      if (mt[0].length === 0) re.lastIndex++;
    }
  }
  hits.sort((a, b) => a.start - b.start);
  const out = [];
  let cur = 0;
  for (const h of hits) {
    if (h.start < cur) continue;
    if (h.start > cur) out.push({ s: str.slice(cur, h.start) });
    out.push({ s: h.s, id: h.id });
    cur = h.end;
  }
  if (cur < str.length) out.push({ s: str.slice(cur) });
  return out;
}

function MetaItem({ k, v }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 4, minWidth: 0 }}>
      <span style={{ fontSize: 10, color: "var(--fg-3)", textTransform: "uppercase", letterSpacing: 0.08 + "em" }}>{k}</span>
      <span style={{ fontSize: 12.5 }}>{v}</span>
    </div>
  );
}

function ShadowPane({ side, label, sub, glyph, value, rendered, onChange, onTokenHover }) {
  const [editing, setEditing] = React.useState(false);
  const taRef = React.useRef(null);
  React.useEffect(() => { if (editing) taRef.current?.focus(); }, [editing]);

  return (
    <div className="lr-card" style={{ position: "relative" }}>
      <div className="lr-card-hd">
        <span style={{
          display: "grid", placeItems: "center", width: 22, height: 22,
          border: "1px solid var(--line-2)", borderRadius: 4,
          fontFamily: "'Instrument Serif', serif", fontStyle: "italic",
          color: "var(--accent)", fontSize: 13,
        }}>{glyph}</span>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <h3>{label}</h3>
          <span style={{ fontSize: 10.5, color: "var(--fg-3)", letterSpacing: 0.06 + "em", textTransform: "uppercase" }}>{sub}</span>
        </div>
        <div style={{ marginLeft: "auto", display: "flex", gap: 6 }}>
          <button className={"lr-btn sm" + (editing ? " primary" : "")} onClick={() => setEditing(e => !e)}>
            {editing ? "✓ Done" : "✎ Edit"}
          </button>
        </div>
      </div>
      <div className="lr-card-bd" style={{ minHeight: 220, padding: 0 }}>
        {editing ? (
          <textarea
            ref={taRef}
            value={value}
            onChange={e => onChange(e.target.value)}
            spellCheck={false}
            style={{
              width: "100%", minHeight: 220, padding: 14,
              border: 0, background: "transparent", color: "var(--fg-0)",
              resize: "vertical", outline: "none",
              fontFamily: side === "yaml" ? "Geist Mono, monospace" : "Geist, sans-serif",
              fontSize: side === "yaml" ? 12.5 : 13.5,
              lineHeight: 1.55,
            }}
          />
        ) : (
          <pre style={{
            margin: 0, padding: 14, whiteSpace: "pre-wrap", lineHeight: 1.55,
            fontFamily: side === "yaml" ? "Geist Mono, monospace" : "Geist, sans-serif",
            fontSize: side === "yaml" ? 12.5 : 13.5,
            color: "var(--fg-0)",
          }}>
            {rendered.map((tok, i) =>
              tok.id ? (
                <span key={i}
                      onMouseEnter={() => onTokenHover(tok.id)}
                      onMouseLeave={() => onTokenHover(null)}
                      style={{
                        background: "color-mix(in oklab, var(--accent) 18%, transparent)",
                        borderBottom: "1px dashed var(--accent)",
                        padding: "0 2px", borderRadius: 2, cursor: "pointer",
                        color: "var(--fg-0)",
                      }}>{tok.s}</span>
              ) : tok.s.split('').map((c, j) => c) && (
                <React.Fragment key={i}>{tok.s}</React.Fragment>
              )
            )}
          </pre>
        )}
      </div>
      {/* edge glow when active */}
      <div style={{
        position: "absolute", inset: -1, borderRadius: 9,
        pointerEvents: "none",
        boxShadow: editing ? "0 0 0 1px var(--accent), 0 0 24px -4px color-mix(in oklab, var(--accent) 40%, transparent)" : "none",
        transition: "box-shadow .2s",
      }}/>
    </div>
  );
}

function HooksCard({ hooks }) {
  const toast = useToast();
  return (
    <div className="lr-card">
      <div className="lr-card-hd">
        <h3>Technical Hooks</h3>
        <span className="muted" style={{ fontSize: 11, marginLeft: 4 }}>enforcement targets</span>
        <button className="lr-btn sm ghost" style={{ marginLeft: "auto" }}
          onClick={() => toast({ msg: "Pick a platform · OPA / AWS Config / K8s …", duration: 1800 })}>+ Add</button>
      </div>
      <div className="lr-card-bd" style={{ padding: 0 }}>
        {hooks.length === 0 ? (
          <div style={{ padding: 14, color: "var(--fg-3)", fontSize: 12.5 }}>No hooks bound. <a style={{ color: "var(--accent)" }}>Suggest one →</a></div>
        ) : hooks.map((h, i) => (
          <div key={i} style={{
            padding: "10px 14px",
            borderTop: i ? "1px solid var(--line-1)" : 0,
            display: "flex", alignItems: "center", gap: 10,
          }}>
            <span className="lr-badge plain" style={{ minWidth: 90, justifyContent: "center" }}>{h.platform}</span>
            <span className="mono" style={{ fontSize: 11, color: "var(--fg-2)", flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {h.ref}
            </span>
            <span className={"lr-badge " + (h.status === "compliant" ? "ok" : "crit")}>{h.status === "compliant" ? "compliant" : "non-compliant"}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function ApprovalsCard({ approvals, gap }) {
  const toast = useToast();
  return (
    <div className="lr-card">
      <div className="lr-card-hd">
        <h3>Approval Workflow</h3>
        <span className="muted" style={{ fontSize: 11, marginLeft: 4 }}>{approvals.length} {approvals.length === 1 ? "stage" : "stages"}</span>
        <button className="lr-btn sm ghost" style={{ marginLeft: "auto" }}
          onClick={() => toast({ msg: "Add a stage · role or user · One/All/Threshold.", duration: 1800 })}>+ Stage</button>
      </div>
      <div className="lr-card-bd" style={{ padding: "14px 14px 16px" }}>
        {approvals.length === 0 ? (
          <div style={{ display: "flex", alignItems: "center", gap: 10, color: "var(--warn)", fontSize: 12.5 }}>
            <span style={{ fontSize: 14 }}>◌</span>
            <span>No workflow bound. Policy text implies approval — bind one to close the gap.</span>
          </div>
        ) : (
          <ol style={{ margin: 0, padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: 0 }}>
            {approvals.map((a, i) => (
              <li key={i} style={{ display: "flex", alignItems: "stretch", gap: 0 }}>
                <div style={{ width: 22, display: "flex", flexDirection: "column", alignItems: "center", paddingTop: 4 }}>
                  <div style={{ width: 14, height: 14, borderRadius: "50%", border: "1.5px solid var(--accent)", display: "grid", placeItems: "center", fontSize: 9, fontFamily: "Geist Mono", color: "var(--accent)" }}>{i + 1}</div>
                  {i < approvals.length - 1 && <div style={{ width: 1, flex: 1, background: "var(--line-1)", margin: "2px 0" }}/>}
                </div>
                <div style={{ flex: 1, padding: "2px 0 14px 10px" }}>
                  <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
                    <b style={{ fontSize: 13, fontWeight: 500 }}>{a.stage}</b>
                    <span className="lr-badge plain">{a.cond.replace("_", " ").toLowerCase()}</span>
                  </div>
                  <div style={{ fontSize: 11.5, color: "var(--fg-2)", marginTop: 2 }}>
                    {a.type}: <span className="mono" style={{ color: "var(--fg-1)" }}>{a.approver}</span>
                  </div>
                </div>
              </li>
            ))}
          </ol>
        )}
      </div>
    </div>
  );
}

function HashLine({ k, v, sub, accent }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", marginBottom: 8 }}>
      <span style={{ fontSize: 10.5, color: "var(--fg-3)", textTransform: "uppercase", letterSpacing: 0.06 + "em" }}>{k}</span>
      <span className="mono" style={{ fontSize: 13, color: accent ? "var(--accent)" : "var(--fg-1)", letterSpacing: 0 }}>{v}</span>
      {sub && <span style={{ fontSize: 11, color: "var(--fg-3)" }}>{sub}</span>}
    </div>
  );
}

function HashCard({ policy, drift }) {
  const textHash = "e3b0c44…b855";
  const yamlHash = "9d4b2c8…1f6e";
  const manifestHash = drift ? "—" : "a8f3c91…2d7b";
  return (
    <div className="lr-card">
      <div className="lr-card-hd">
        <h3>Anchor</h3>
        <span className="muted" style={{ fontSize: 11, marginLeft: 4 }}>version manifest</span>
      </div>
      <div className="lr-card-bd" style={{ padding: "12px 14px 14px" }}>
        <HashLine k="Context Hash" v={textHash} sub="SHA-256 of plain text" />
        <HashLine k="State Hash" v={yamlHash} sub="SHA-256 of YAML" />
        <div style={{ height: 1, background: "var(--line-1)", margin: "10px 0" }}/>
        <HashLine k="Version Manifest" v={manifestHash} sub={drift ? "diverged — anchor needed" : "block #481 · ledger"} accent />
        <div style={{ marginTop: 12, padding: 10, border: "1px dashed var(--line-1)", borderRadius: 6, fontSize: 11.5, color: "var(--fg-2)", lineHeight: 1.5 }}>
          A comma in either pane breaks the signature. Re-anchoring writes a new block to the ledger — the previous block is never overwritten.
        </div>
      </div>
    </div>
  );
}

export function PolicyEditor({ selectedId, setSelected, setRoute }) {
  const { policies: POLICIES } = usePolicies();
  const toast = useToast();
  const initial = POLICIES.find(p => p.id === selectedId) || POLICIES[0];
  const [text, setText] = React.useState(initial.text);
  const [yaml, setYaml] = React.useState(initial.yaml);
  const [active, setActive] = React.useState(null);

  React.useEffect(() => {
    setText(initial.text);
    setYaml(initial.yaml);
  }, [initial.id]);

  const drift = React.useMemo(() => {
    return text !== initial.text || yaml !== initial.yaml;
  }, [text, yaml, initial]);

  const mappings = React.useMemo(() => buildMappings(initial.id), [initial.id]);

  const onTextChange = (newText) => {
    setText(newText);
    let nextYaml = yaml;
    for (const m of mappings) {
      const got = newText.match(m.textRe);
      if (got && m.yamlRe.test(nextYaml)) {
        const val = m.deriveYaml(got);
        nextYaml = nextYaml.replace(m.yamlRe, m.yamlReplace(val));
      }
    }
    setYaml(nextYaml);
  };

  const onYamlChange = (newYaml) => {
    setYaml(newYaml);
    let nextText = text;
    for (const m of mappings) {
      const got = newYaml.match(m.yamlRe);
      if (got && m.textRe.test(nextText) && m.deriveText) {
        const val = m.deriveText(got);
        nextText = nextText.replace(m.textRe, m.textReplace(val));
      }
    }
    setText(nextText);
  };

  const highlightedText = React.useMemo(() => renderHighlighted(text, mappings, active, "text"), [text, mappings, active]);
  const highlightedYaml = React.useMemo(() => renderHighlighted(yaml, mappings, active, "yaml"), [yaml, mappings, active]);

  const statusForRender = drift ? "adrift" : initial.status;

  return (
    <div className="lr-page" style={{ paddingBottom: 30 }}>
      <PageHeader
        eyebrow={`POLICY · ${initial.id}`}
        title={initial.title}
        sub={`Bi-directional shadow editor. Edit either side; matched tokens propagate to the other. The Anchor commits both halves to the Ledger of Truth.`}
        actions={<>
          <select
            value={initial.id} onChange={e => setSelected(e.target.value)}
            style={{ background: "var(--bg-1)", color: "var(--fg-0)", border: "1px solid var(--line-1)", padding: "5px 10px", borderRadius: 6, fontSize: 12 }}>
            {POLICIES.map(p => <option key={p.id} value={p.id}>{p.id} · {p.title}</option>)}
          </select>
          <button className="lr-btn" onClick={() => toast({ title: "Loading diff…", msg: `${initial.id} v${initial.version} vs previous version · 3 lines changed.`, duration: 2200 })}>Diff vs last</button>
          <button className="lr-btn primary" disabled={!drift} style={{ opacity: drift ? 1 : 0.5 }}
            onClick={() => {
              if (!drift) return;
              setText(initial.text); setYaml(initial.yaml);
              toast({ title: "Re-anchored", msg: `Block #483 written · context + state hashes co-signed.`, tone: "ok", hash: "manifest a8f3c91…2d7b" });
            }}>
            {drift ? "↯ Re-anchor" : "◆ Anchored"}
          </button>
        </>}
      />

      {/* Meta strip */}
      <div style={{ display: "flex", alignItems: "center", gap: 18, marginBottom: 16, padding: "10px 14px", border: "1px solid var(--line-1)", borderRadius: 8, background: "var(--bg-1)" }}>
        <MetaItem k="Status" v={<StatusBadge status={statusForRender} />}/>
        <MetaItem k="Version" v={<span className="mono">v{initial.version}</span>} />
        <MetaItem k="Weight" v={<WeightBar w={initial.weight} />} />
        <MetaItem k="Impact" v={<span style={{ color: "var(--fg-0)" }}>{initial.impact}</span>} />
        <MetaItem k="Likelihood" v={<span style={{ color: "var(--fg-0)" }}>{initial.likelihood}</span>} />
        <MetaItem k="Owner" v={<span style={{ color: "var(--fg-0)" }}>{initial.owner}</span>} />
        <MetaItem k="Last Anchor" v={<span className="mono dim">{relTime(initial.lastAnchor)}</span>} />
      </div>

      {/* Twin shadows */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 22 }}>
        <ShadowPane
          side="text"
          label="Plain Language"
          sub="Human-readable"
          glyph="¶"
          value={text}
          rendered={highlightedText}
          onChange={onTextChange}
          onTokenHover={setActive}
        />
        <ShadowPane
          side="yaml"
          label="Machine Logic"
          sub="YAML — enforceable"
          glyph="{ }"
          value={yaml}
          rendered={highlightedYaml}
          onChange={onYamlChange}
          onTokenHover={setActive}
        />
      </div>

      {/* Three-up: hooks, approvals, hash */}
      <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1.4fr 1fr", gap: 16 }}>
        <HooksCard hooks={initial.hooks} />
        <ApprovalsCard approvals={initial.approvals} gap={initial.gap} />
        <HashCard policy={initial} drift={drift} />
      </div>

      {/* Issues banner */}
      {(initial.gap || initial.conflict) && (
        <div className="lr-card" style={{ marginTop: 16, borderColor: initial.conflict ? "color-mix(in oklab, var(--crit) 50%, var(--line-1))" : "color-mix(in oklab, var(--warn) 50%, var(--line-1))" }}>
          <div className="lr-card-hd">
            <span className={"lr-badge " + (initial.conflict ? "crit" : "warn")}>{initial.conflict ? "Collision" : "Structural Gap"}</span>
            <h3 style={{ marginLeft: 4 }}>{initial.conflict ? `Conflicts with ${initial.conflict.with}` : initial.gap.detail.split(",")[0]}</h3>
            <button className="lr-btn sm" style={{ marginLeft: "auto" }} onClick={() => setRoute("brain")}>Open in Brain →</button>
          </div>
          <div className="lr-card-bd" style={{ color: "var(--fg-1)", fontSize: 13 }}>
            {initial.conflict ? initial.conflict.reason : initial.gap.detail}
          </div>
        </div>
      )}
    </div>
  );
}

export default PolicyEditor;
