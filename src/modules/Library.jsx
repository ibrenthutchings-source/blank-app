import React from 'react'
import { useToast, usePolicies } from '../contexts'
import { STATUS_META } from '../data'
import { PageHeader, StatusBadge, WeightBar } from '../components/Shell'
import { relTime } from '../utils'

export function Library({ setRoute, setSelected, onNewPolicy }) {
  const { policies: POLICIES } = usePolicies();
  const toast = useToast();
  const [filter, setFilter] = React.useState("all");
  const [sortKey, setSortKey] = React.useState("weight");

  const stats = React.useMemo(() => {
    const total = POLICIES.length;
    const adrift = POLICIES.filter(p => p.status === "adrift").length;
    const gaps = POLICIES.filter(p => p.status === "gap").length;
    const conflicts = POLICIES.filter(p => p.status === "conflict").length;
    return { total, adrift, gaps, conflicts };
  }, [POLICIES]);

  const filtered = POLICIES
    .filter(p => filter === "all" ? true : p.status === filter)
    .sort((a, b) => sortKey === "weight" ? b.weight - a.weight : a.id.localeCompare(b.id));

  return (
    <div className="lr-page">
      <PageHeader
        eyebrow="MODULE · 01"
        title="Policy Library"
        sub="Every clause has two shadows — plain text and machine logic. When they agree, the policy is anchored. When they drift, the Brain flags it here."
        actions={<>
          <button className="lr-btn" onClick={() => toast({ title: "Exporting…", msg: `${POLICIES.length} policies bundled as YAML · download starting.`, tone: "ok", hash: "lex-risk-export-2026-05-22.tar.gz" })}>Export YAML</button>
          <button className="lr-btn primary" onClick={() => onNewPolicy?.()}>+ New Policy</button>
        </>}
      />

      <div className="lr-stats">
        <div className="lr-stat">
          <div className="lr-stat-label">Policies</div>
          <div className="lr-stat-value">{stats.total}</div>
          <div className="lr-stat-meta"><span className="up">+3</span> in 30d</div>
        </div>
        <div className="lr-stat">
          <div className="lr-stat-label">Adrift</div>
          <div className="lr-stat-value" style={{ color: "var(--accent-2)" }}>{stats.adrift}</div>
          <div className="lr-stat-meta">avg drift age 1d 6h</div>
        </div>
        <div className="lr-stat">
          <div className="lr-stat-label">Structural Gaps</div>
          <div className="lr-stat-value" style={{ color: "var(--warn)" }}>{stats.gaps}</div>
          <div className="lr-stat-meta">missing workflows</div>
        </div>
        <div className="lr-stat">
          <div className="lr-stat-label">Collisions</div>
          <div className="lr-stat-value" style={{ color: "var(--crit)" }}>{stats.conflicts}</div>
          <div className="lr-stat-meta">cross-policy conflict</div>
        </div>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 14 }}>
        <div className="lr-chips">
          {[
            { v: "all",      label: "All" },
            { v: "anchored", label: "Anchored" },
            { v: "adrift",   label: "Adrift" },
            { v: "gap",      label: "Gap" },
            { v: "conflict", label: "Collision" },
            { v: "pending",  label: "Pending" },
          ].map(o => (
            <div key={o.v}
                 className={"lr-chip" + (filter === o.v ? " on" : "")}
                 onClick={() => setFilter(o.v)}>
              {o.label}
              <span className="mono dim">
                {o.v === "all" ? POLICIES.length : POLICIES.filter(p => p.status === o.v).length}
              </span>
            </div>
          ))}
        </div>
        <div style={{ marginLeft: "auto", display: "flex", gap: 6, alignItems: "center", fontSize: 12, color: "var(--fg-2)" }}>
          <span>Sort</span>
          <select
            value={sortKey} onChange={e => setSortKey(e.target.value)}
            style={{ background: "var(--bg-1)", color: "var(--fg-0)", border: "1px solid var(--line-1)", padding: "4px 8px", borderRadius: 6, fontSize: 12 }}>
            <option value="weight">Risk weight</option>
            <option value="id">ID</option>
          </select>
        </div>
      </div>

      <div className="lr-card" style={{ overflow: "hidden" }}>
        <table className="lr-table">
          <thead>
            <tr>
              <th style={{ width: 28 }}></th>
              <th style={{ width: 120 }}>ID</th>
              <th>Policy</th>
              <th style={{ width: 140 }}>Owner</th>
              <th style={{ width: 130 }}>Risk Weight</th>
              <th style={{ width: 110 }}>Status</th>
              <th style={{ width: 140 }}>Last Anchor</th>
              <th style={{ width: 60 }}></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(p => (
              <tr key={p.id} onClick={() => { setSelected(p.id); setRoute("editor"); }} style={{ cursor: "pointer" }}>
                <td>
                  <span style={{
                    color: `var(--${STATUS_META[p.status].color === "drift" ? "accent-2" : STATUS_META[p.status].color === "ok" ? "ok" : STATUS_META[p.status].color === "warn" ? "warn" : STATUS_META[p.status].color === "crit" ? "crit" : "info"})`,
                    fontSize: 14, fontFamily: "Geist Mono, monospace",
                  }}>{STATUS_META[p.status].glyph}</span>
                </td>
                <td className="mono dim">{p.id}</td>
                <td>
                  <div style={{ fontWeight: 500 }}>{p.title}</div>
                  <div style={{ fontSize: 11.5, color: "var(--fg-3)", marginTop: 2 }}>
                    {p.categories.join(" · ")} · v{p.version}
                  </div>
                </td>
                <td style={{ color: "var(--fg-1)" }}>{p.owner}</td>
                <td><WeightBar w={p.weight} /></td>
                <td><StatusBadge status={p.status} /></td>
                <td className="mono dim">{relTime(p.lastAnchor)}</td>
                <td style={{ color: "var(--fg-3)", textAlign: "right" }}>→</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div style={{ marginTop: 14, fontSize: 11.5, color: "var(--fg-3)", display: "flex", gap: 14 }}>
        <span>Hover a row for clause preview · click to open editor · <span className="kbd">⌘N</span> new policy</span>
      </div>
    </div>
  );
}

export default Library;
