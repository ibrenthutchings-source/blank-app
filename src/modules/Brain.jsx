import React from 'react'
import { useToast, usePolicies } from '../contexts'
import { PageHeader, StatusBadge, WeightBar, SectionHd } from '../components/Shell'

function hashSeed(s) {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}

function layoutConstellation(policies, bump = 0) {
  const W = 800, H = 540;
  return policies.map((p, i) => {
    const seed = hashSeed(p.id) + bump * 17;
    const cat = p.categories[0] || "Other";
    const angles = { "Data Privacy": 0.2, "Access": 1.6, "Operational": 2.5, "Supply Chain": 3.2, "Financial": 4.0, "Regulatory": 5.0, "Third-Party": 5.7, "Compliance": 0.9 };
    const baseAngle = angles[cat] ?? (seed % 628) / 100;
    const angle = baseAngle + ((seed >> 4) % 60 - 30) / 80;
    const r = 130 + ((seed >> 8) % 110);
    const cx = W / 2 + Math.cos(angle) * r;
    const cy = H / 2 + Math.sin(angle) * r * 0.78;

    const hooks = p.hooks.slice(0, 3).map((h, j) => {
      const a = (j / 3) * Math.PI * 2 + angle * 0.5;
      const hr = 30 + ((seed >> (j * 3)) % 14);
      return {
        x: cx + Math.cos(a) * hr,
        y: cy + Math.sin(a) * hr,
        compliant: h.status === "compliant",
      };
    });
    return { ...p, x: cx, y: cy, hooks };
  });
}

function deriveEdges(nodes) {
  const edges = [];
  for (const n of nodes) {
    if (n.conflict?.with) edges.push({ from: n.id, to: n.conflict.with, kind: "conflict" });
  }
  const byCat = {};
  for (const n of nodes) {
    const c = n.categories[0];
    (byCat[c] = byCat[c] || []).push(n.id);
  }
  for (const c of Object.keys(byCat)) {
    const grp = byCat[c];
    for (let i = 0; i < grp.length - 1; i++) {
      edges.push({ from: grp[i], to: grp[i + 1], kind: "cat" });
    }
  }
  return edges;
}

function Tally({ label, value, sub, tone }) {
  const color = tone === "drift" ? "var(--accent-2)" : tone === "crit" ? "var(--crit)" : "var(--fg-0)";
  return (
    <div className="lr-card" style={{ padding: "12px 16px" }}>
      <div style={{ fontSize: 10.5, color: "var(--fg-3)", letterSpacing: 0.06 + "em", textTransform: "uppercase" }}>{label}</div>
      <div style={{ fontFamily: "Instrument Serif, serif", fontStyle: "italic", fontSize: 32, lineHeight: 1, margin: "6px 0 2px", color }}>{value}</div>
      <div style={{ fontSize: 11, color: "var(--fg-3)", fontFamily: "Geist Mono, monospace" }}>{sub}</div>
    </div>
  );
}

function LegendDot({ c, l }) {
  return <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>
    <span style={{ width: 8, height: 8, borderRadius: "50%", background: c, display: "inline-block" }}/>
    {l}
  </span>;
}

function Row({ k, v }) {
  return <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10 }}>
    <span style={{ color: "var(--fg-3)" }}>{k}</span>
    <span style={{ color: "var(--fg-1)" }}>{v}</span>
  </div>;
}

function Inspector({ hovered, onNavigate }) {
  if (!hovered) {
    return (
      <div className="lr-card" style={{ padding: 16, color: "var(--fg-2)", fontSize: 12.5 }}>
        <div style={{ fontSize: 10.5, color: "var(--fg-3)", letterSpacing: 0.06 + "em", textTransform: "uppercase", marginBottom: 10 }}>Inspector</div>
        <div className="serif" style={{ fontSize: 18, color: "var(--fg-1)", marginBottom: 10 }}>Hover a body</div>
        <div>The Brain shows your governance estate as bodies in motion. Click any node to open it in the Editor; collisions are dashed magenta arcs.</div>
        <div style={{ height: 1, background: "var(--line-1)", margin: "16px 0" }}/>
        <div style={{ display: "flex", flexDirection: "column", gap: 6, fontFamily: "Geist Mono, monospace", fontSize: 11.5 }}>
          <Row k="Total tethers" v="38" />
          <Row k="Largest mass" v="POL-ACCESS-014 · 92" />
          <Row k="Audit pass" v="last 4h ago" />
        </div>
      </div>
    );
  }
  return (
    <div className="lr-card" style={{ padding: 16 }}>
      <div style={{ fontSize: 10.5, color: "var(--fg-3)", letterSpacing: 0.06 + "em", textTransform: "uppercase", marginBottom: 8 }}>Inspector</div>
      <div className="mono dim" style={{ fontSize: 11 }}>{hovered.id}</div>
      <h3 style={{ margin: "4px 0 10px", fontSize: 16, fontWeight: 500 }}>{hovered.title}</h3>
      <StatusBadge status={hovered.status} />
      <div style={{ height: 1, background: "var(--line-1)", margin: "12px 0" }}/>
      <div style={{ display: "flex", flexDirection: "column", gap: 8, fontSize: 12.5 }}>
        <Row k="Risk weight" v={<WeightBar w={hovered.weight} />} />
        <Row k="Impact" v={hovered.impact} />
        <Row k="Owner" v={hovered.owner} />
        <Row k="Tethers" v={`${hovered.hooks.length} hook${hovered.hooks.length === 1 ? "" : "s"}`} />
      </div>
      <button className="lr-btn primary" style={{ marginTop: 14, width: "100%", justifyContent: "center" }}
        onClick={() => onNavigate?.("editor", hovered.id)}>Open in Editor →</button>
    </div>
  );
}

function CollisionGlyph() {
  return (
    <svg width="44" height="44" viewBox="0 0 44 44" style={{ flexShrink: 0 }}>
      <circle cx="16" cy="22" r="9" fill="var(--accent)" opacity="0.7"/>
      <circle cx="28" cy="22" r="9" fill="var(--accent-2)" opacity="0.7"/>
      <line x1="6" y1="6" x2="38" y2="38" stroke="var(--crit)" strokeWidth="1.5"/>
      <line x1="38" y1="6" x2="6" y2="38" stroke="var(--crit)" strokeWidth="1.5"/>
    </svg>
  );
}

export function Brain({ onNavigate }) {
  const { policies: POLICIES } = usePolicies();
  const toast = useToast();
  const [hover, setHover] = React.useState(null);
  const [filter, setFilter] = React.useState("all");
  const [layoutBump, setLayoutBump] = React.useState(0);

  const nodes = React.useMemo(() => layoutConstellation(POLICIES, layoutBump), [POLICIES, layoutBump]);
  const edges = React.useMemo(() => deriveEdges(nodes), [nodes]);

  const hovered = hover ? nodes.find(n => n.id === hover) : null;

  return (
    <div className="lr-page">
      <PageHeader
        eyebrow="MODULE · 03"
        title="Governance Brain"
        sub="Every policy in motion. Mass is risk weight; tethers run to enforcement hooks; magenta arcs mark collisions; haloed nodes have drifted from anchor."
        actions={<>
          <button className="lr-btn" onClick={() => setLayoutBump(b => b + 1)}>Re-layout</button>
          <button className="lr-btn primary" onClick={() => toast({ title: "Audit pass complete", msg: "9 policies inspected · 1 collision, 1 gap, 1 drift unchanged.", tone: "ok", hash: "scan 0x8c1e…3f6a" })}>Run audit pass</button>
        </>}
      />

      {/* Live tally */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr) 1.4fr", gap: 16, marginBottom: 22 }}>
        <Tally label="In motion" value={POLICIES.length} sub="active policies" />
        <Tally label="Adrift" value={POLICIES.filter(p => p.status === "adrift").length} sub="text/code diverged" tone="drift" />
        <Tally label="Collisions" value={POLICIES.filter(p => p.status === "conflict").length} sub="policy pairs" tone="crit" />
        <div className="lr-card" style={{ padding: "12px 16px" }}>
          <div style={{ fontSize: 10.5, color: "var(--fg-3)", letterSpacing: 0.06 + "em", textTransform: "uppercase", marginBottom: 8 }}>Filter</div>
          <div className="lr-chips">
            {["all","Data Privacy","Operational","Regulatory","Compliance","Financial"].map(c => (
              <div key={c} className={"lr-chip" + (filter === c ? " on" : "")} onClick={() => setFilter(c)}>{c}</div>
            ))}
          </div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: 16 }}>
        <div className="lr-card" style={{ padding: 0, position: "relative", overflow: "hidden" }}>
          <div style={{
            position: "absolute", inset: 0,
            backgroundImage: "radial-gradient(circle at 30% 20%, color-mix(in oklab, var(--accent) 14%, transparent) 0%, transparent 50%), radial-gradient(circle at 70% 80%, color-mix(in oklab, var(--accent-2) 10%, transparent) 0%, transparent 50%)",
            pointerEvents: "none",
          }}/>
          <svg viewBox="0 0 800 540" style={{ width: "100%", height: 540, display: "block", position: "relative" }}>
            {/* grid */}
            <defs>
              <pattern id="lr-grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M40 0H0V40" fill="none" stroke="var(--line-1)" strokeWidth="0.5" opacity="0.4"/>
              </pattern>
              <radialGradient id="lr-node" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.9"/>
                <stop offset="100%" stopColor="var(--accent)" stopOpacity="0.05"/>
              </radialGradient>
              <radialGradient id="lr-node-drift" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="var(--accent-2)" stopOpacity="0.9"/>
                <stop offset="100%" stopColor="var(--accent-2)" stopOpacity="0.05"/>
              </radialGradient>
            </defs>
            <rect width="800" height="540" fill="url(#lr-grid)"/>

            {/* Edges */}
            {edges.map((e, i) => {
              const from = nodes.find(n => n.id === e.from);
              const to = nodes.find(n => n.id === e.to);
              if (!from || !to) return null;
              const isConflict = e.kind === "conflict";
              const dim = hover && hover !== e.from && hover !== e.to;
              return (
                <line key={i} x1={from.x} y1={from.y} x2={to.x} y2={to.y}
                      stroke={isConflict ? "var(--accent-2)" : "var(--line-2)"}
                      strokeWidth={isConflict ? 1.4 : 0.6}
                      strokeDasharray={isConflict ? "4 4" : "0"}
                      opacity={dim ? 0.15 : isConflict ? 0.85 : 0.45}/>
              );
            })}

            {/* Hooks (small satellites) */}
            {nodes.map(n => n.hooks.map((h, i) => (
              <g key={n.id + ":" + i} opacity={hover && hover !== n.id ? 0.2 : 1}>
                <line x1={n.x} y1={n.y} x2={h.x} y2={h.y}
                      stroke="var(--fg-3)" strokeWidth="0.5" strokeDasharray="2 3" opacity="0.7"/>
                <rect x={h.x - 3} y={h.y - 3} width="6" height="6" fill="var(--bg-1)"
                      stroke={h.compliant ? "var(--ok)" : "var(--crit)"} strokeWidth="0.8"/>
              </g>
            )))}

            {/* Nodes */}
            {nodes.map(n => {
              const r = 6 + (n.weight / 100) * 14;
              const isHover = hover === n.id;
              const isAdrift = n.status === "adrift";
              const isGap = n.status === "gap";
              const isConflict = n.status === "conflict";
              return (
                <g key={n.id}
                   transform={`translate(${n.x},${n.y})`}
                   onMouseEnter={() => setHover(n.id)}
                   onMouseLeave={() => setHover(null)}
                   style={{ cursor: "pointer" }}>
                  {/* aura */}
                  <circle r={r * 2.2} fill={isAdrift ? "url(#lr-node-drift)" : "url(#lr-node)"} opacity={isHover ? 0.6 : 0.3}/>
                  {/* drift halo */}
                  {isAdrift && <circle r={r + 4} fill="none" stroke="var(--accent-2)" strokeWidth="1" strokeDasharray="2 3"/>}
                  {isGap && <circle r={r + 4} fill="none" stroke="var(--warn)" strokeWidth="1" strokeDasharray="1 2"/>}
                  {/* body */}
                  <circle r={r}
                          fill={isAdrift ? "var(--accent-2)" : isGap ? "var(--warn)" : isConflict ? "var(--crit)" : "var(--accent)"}
                          stroke="var(--bg-0)" strokeWidth="1"/>
                  {/* mass dot */}
                  <circle r={r * 0.45} fill="var(--bg-0)" opacity="0.45"/>
                  {/* id label */}
                  <text y={r + 12} textAnchor="middle" fontSize="9" fill="var(--fg-2)"
                        fontFamily="Geist Mono, monospace" letterSpacing="0.04em">
                    {n.id.replace("POL-", "")}
                  </text>
                </g>
              );
            })}
          </svg>

          {/* Legend overlay */}
          <div style={{ position: "absolute", left: 14, bottom: 14, display: "flex", gap: 14, fontSize: 11.5, color: "var(--fg-2)" }}>
            <LegendDot c="var(--accent)" l="anchored"/>
            <LegendDot c="var(--accent-2)" l="adrift"/>
            <LegendDot c="var(--warn)" l="gap"/>
            <LegendDot c="var(--crit)" l="collision"/>
            <span style={{ color: "var(--fg-3)" }}>· radius = risk weight</span>
          </div>
        </div>

        {/* Inspector */}
        <Inspector hovered={hovered} onNavigate={onNavigate} />
      </div>

      {/* Collision detail */}
      <SectionHd idx="03b" title="Active collisions" sub="cross-policy logical conflicts" />
      <div className="lr-card" style={{ padding: 16, display: "flex", gap: 14, alignItems: "center" }}>
        <CollisionGlyph />
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 13.5, fontWeight: 500 }}>
            POL-IR-009 <span className="dim" style={{ margin: "0 6px" }}>↔</span> POL-DATA-007
          </div>
          <div style={{ fontSize: 12.5, color: "var(--fg-2)", marginTop: 4 }}>
            <b style={{ color: "var(--fg-0)" }}>IR-009</b> requires a global forensic copy retained 365 days.
            <b style={{ color: "var(--fg-0)" }}> DATA-007</b> requires EU-origin data to remain in EU regions.
            One must yield. Suggested: scope the forensic copy by region.
          </div>
        </div>
        <button className="lr-btn" onClick={() => toast({ title: "Merge proposal drafted", msg: "Scope forensic copy by region · diff prepared for IR-009.", tone: "ok" })}>Propose merge</button>
        <button className="lr-btn primary" onClick={() => setHover("POL-IR-009")}>Open in Brain ↗</button>
      </div>
    </div>
  );
}

export default Brain;
