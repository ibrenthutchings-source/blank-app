import React from 'react'
import { STATUS_META } from '../data'
import { useToast } from '../contexts'

const NAV_ITEMS = [
  {
    group: "Risk",
    items: [
      { id: "library", label: "Policy Library", icon: "library", count: (policies) => policies.length },
      { id: "editor", label: "Editor", icon: "editor" },
      { id: "ingest", label: "Ingest", icon: "ingest", count: (policies, ingestRuns) => ingestRuns.length }
    ]
  },
  {
    group: "Governance",
    items: [
      { id: "brain", label: "Brain", icon: "brain", dot: () => 2 },
      { id: "ledger", label: "Ledger of Truth", icon: "ledger" },
      { id: "pipelines", label: "Risk-as-Code", icon: "pipe", dot: () => 1 }
    ]
  },
  {
    group: "Workspace",
    items: [
      { id: "settings", label: "Settings", icon: "settings" }
    ]
  }
];

const ICONS = {
  library: <><rect x="2.5" y="2.5" width="3" height="11" rx="0.5" /><rect x="6.5" y="2.5" width="3" height="11" rx="0.5" /><rect x="10.5" y="2.5" width="3" height="11" rx="0.5" /></>,
  editor: <><path d="M2.5 3.5h11M2.5 8h7M2.5 12.5h11" /><path d="M11 6.5l2.5 1.5L11 9.5z" fill="currentColor" /></>,
  ingest: <><path d="M8 1.5v8M5 7l3 3 3-3" /><rect x="2.5" y="11" width="11" height="3" rx="0.5" /></>,
  brain: <><circle cx="4" cy="5" r="1.5" /><circle cx="12" cy="5" r="1.5" /><circle cx="8" cy="11" r="1.5" /><path d="M5.5 5h5M5 6.5l2 3M11 6.5l-2 3" /></>,
  ledger: <><path d="M2.5 3.5h11v9h-11z" /><path d="M2.5 6.5h11M2.5 9.5h11M5.5 3.5v9" /></>,
  pipe: <><circle cx="4" cy="4" r="1.5" /><circle cx="4" cy="12" r="1.5" /><circle cx="12" cy="8" r="1.5" /><path d="M5.5 4h2.5a2 2 0 012 2v0M5.5 12h2.5a2 2 0 002-2v0" /></>,
  settings: <><circle cx="8" cy="8" r="2.5" /><path d="M8 1.5v2M8 12.5v2M1.5 8h2M12.5 8h2M3.3 3.3l1.4 1.4M11.3 11.3l1.4 1.4M3.3 12.7l1.4-1.4M11.3 4.7l1.4-1.4" /></>
};

export function NavIcon({ name }) {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round">
      {ICONS[name] || null}
    </svg>
  );
}

export function Sidebar({ route, setRoute, navMode, policies = [], ingestRuns = [] }) {
  const collapsed = navMode === "rail";
  if (navMode === "hidden") return null;
  return (
    <aside className="lr-side">
      <div className="lr-side-brand">
        <div className="lr-brand-mark" aria-hidden="true"></div>
        {!collapsed &&
          <div className="lr-brand-name">
            <b>Lex-Risk</b>
            <span>Protocol · v0.4</span>
          </div>
        }
      </div>
      <nav className="lr-nav">
        {NAV_ITEMS.map((g, gi) =>
          <div className="lr-nav-group" key={gi}>
            {!collapsed && <div className="lr-nav-label">{g.group}</div>}
            {g.items.map((it) => {
              const active = route === it.id;
              const count = it.count?.(policies, ingestRuns);
              const dot = it.dot?.();
              return (
                <div key={it.id}
                  className={"lr-nav-item" + (active ? " active" : "")}
                  onClick={() => setRoute(it.id)}
                  title={collapsed ? it.label : ""}>
                  <span className="lr-nav-icon"><NavIcon name={it.icon} /></span>
                  {!collapsed && <span>{it.label}</span>}
                  {!collapsed && count != null && <span className="lr-nav-count">{count}</span>}
                  {!collapsed && dot != null && <span className="lr-nav-count dot">●&nbsp;{dot}</span>}
                </div>
              );
            })}
          </div>
        )}
      </nav>
      <div className="lr-side-foot">
        <div className="lr-avatar">IA</div>
        {!collapsed &&
          <div className="lr-side-foot-info">
            <b>Internal Audit</b>
            <span>j.okafor · auditor</span>
          </div>
        }
      </div>
    </aside>
  );
}

const CRUMBS = {
  library: ["Risk", "Policy Library"],
  editor: ["Risk", "Editor"],
  ingest: ["Risk", "Ingest"],
  brain: ["Governance", "Brain"],
  ledger: ["Governance", "Ledger of Truth"],
  pipelines: ["Governance", "Risk-as-Code"],
  settings: ["Workspace", "Settings"]
};

export function Topbar({ route, contextual, onNewPolicy }) {
  const [a, b] = CRUMBS[route] || ["", ""];
  const toast = useToast();
  return (
    <header className="lr-topbar">
      <div className="lr-crumb">
        <span>{a}</span>
        <span className="lr-crumb-sep">/</span>
        <b>{b}</b>
        {contextual && <><span className="lr-crumb-sep">/</span><span className="mono" style={{ color: "var(--fg-1)" }}>{contextual}</span></>}
      </div>
      <div className="lr-topbar-actions">
        <button className="lr-cmdk" onClick={() => toast({ msg: "Command palette — soon", duration: 1800 })}
          style={{ appearance: "none", border: "1px solid var(--line-1)" }}>
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.2"><circle cx="5" cy="5" r="3.2" /><path d="M7.5 7.5L10 10" /></svg>
          <span>Search policies, clauses, hashes…</span>
          <kbd>⌘K</kbd>
        </button>
        <button className="lr-btn" onClick={() => toast({ title: "Anchor pass scheduled", msg: "All policies will re-hash on next pipeline trigger.", tone: "ok" })}>Anchor</button>
        <button className="lr-btn primary" onClick={onNewPolicy}>+ New Policy</button>
      </div>
    </header>
  );
}

export function PageHeader({ eyebrow, title, sub, actions }) {
  return (
    <div className="lr-page-hd">
      <div className="lr-page-hd-title">
        {eyebrow && <div className="lr-page-eyebrow">{eyebrow}</div>}
        <h1 className="lr-page-title">{title}</h1>
        {sub && <p className="lr-page-sub">{sub}</p>}
      </div>
      {actions && <div style={{ display: "flex", gap: 8 }}>{actions}</div>}
    </div>
  );
}

export function StatusBadge({ status }) {
  const s = STATUS_META[status];
  if (!s) return null;
  return <span className={"lr-badge " + s.color}>{s.label}</span>;
}

export function WeightBar({ w }) {
  return (
    <span className="lr-weight">
      <span className="lr-weight-bar"><i style={{ width: w + "%" }} /></span>
      <span style={{ minWidth: 22, textAlign: "right" }}>{w}</span>
    </span>
  );
}

export function SectionHd({ idx, title, sub }) {
  return (
    <div className="lr-section-hd">
      {idx && <span className="lr-section-idx">{idx}</span>}
      <h2>{title}</h2>
      {sub && <span className="lr-section-sub">{sub}</span>}
    </div>
  );
}
