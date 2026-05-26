import React from 'react'
import { useToast } from '../contexts'
import { INGEST_RUNS } from '../data'
import { PageHeader, SectionHd } from '../components/Shell'
import { relTime } from '../utils'

const STAGES = [
  { name: "OCR & Normalize",  sub: "Tables, headers, footnotes → Markdown" },
  { name: "Neural Extraction", sub: "Identify obligations · constraints" },
  { name: "Schema Mapping",    sub: "Bind to risk taxonomy + UUIDs" },
  { name: "Gap Audit",         sub: "Compare against Brain — bind or flag" },
  { name: "Immutable Anchor",  sub: "Hash twin · write to ledger" },
];

function PipelineStages({ run }) {
  return (
    <div className="lr-card" style={{ padding: 18, marginBottom: 8 }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 0, position: "relative" }}>
        {/* horizontal rail */}
        <div style={{ position: "absolute", top: 14, left: "10%", right: "10%", height: 1, background: "var(--line-1)" }}/>
        <div style={{
          position: "absolute", top: 14, left: "10%",
          width: `${Math.max(0, ((run.stage / 4) * 80))}%`, height: 1,
          background: "linear-gradient(90deg, var(--accent), var(--accent-2))",
        }}/>
        {STAGES.map((s, i) => {
          const done = i < run.stage;
          const cur = i === run.stage;
          const todo = i > run.stage;
          return (
            <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8, position: "relative" }}>
              <div style={{
                width: 28, height: 28, borderRadius: "50%",
                border: cur ? "1.5px solid var(--accent-2)" : done ? "1px solid var(--accent)" : "1px solid var(--line-2)",
                background: done ? "var(--accent)" : cur ? "color-mix(in oklab, var(--accent-2) 30%, var(--bg-1))" : "var(--bg-1)",
                color: done ? "var(--bg-0)" : cur ? "var(--accent-2)" : "var(--fg-3)",
                display: "grid", placeItems: "center",
                fontSize: 11, fontFamily: "Geist Mono, monospace", fontWeight: 600,
                position: "relative", zIndex: 1,
                boxShadow: cur ? "0 0 0 6px color-mix(in oklab, var(--accent-2) 14%, transparent)" : "none",
              }}>
                {done ? "✓" : cur ? <span className="lr-pulse">●</span> : (i + 1)}
              </div>
              <div style={{ textAlign: "center", padding: "0 10px" }}>
                <div style={{ fontSize: 12.5, fontWeight: 500, color: todo ? "var(--fg-3)" : "var(--fg-0)" }}>{s.name}</div>
                <div style={{ fontSize: 11, color: "var(--fg-3)", marginTop: 2 }}>{s.sub}</div>
              </div>
            </div>
          );
        })}
      </div>
      <style>{`
        .lr-pulse { animation: lr-pulse 1.4s ease-in-out infinite; }
        @keyframes lr-pulse { 0%,100% { opacity: 1 } 50% { opacity: 0.35 } }
      `}</style>
    </div>
  );
}

const EXTRACTED_RULES = [
  { clause: "9.1",  text: "Providers shall establish a risk management system covering the entire lifecycle of the high-risk AI system.",        modality: "shall", risk: "AI/ML Lifecycle",       maps: "POL-AI-001", status: "new" },
  { clause: "9.2",  text: "The risk management system must be continuously and iteratively updated throughout the lifecycle.",                  modality: "must",  risk: "AI/ML Lifecycle",       maps: "POL-AI-001", status: "new" },
  { clause: "9.3",  text: "Reasonably foreseeable risks to health, safety, and fundamental rights shall be identified and analysed.",            modality: "shall", risk: "Fundamental Rights",    maps: "—",          status: "gap" },
  { clause: "9.4",  text: "Risk-mitigation measures shall give due consideration to effects on persons under 18 and other vulnerable groups.",   modality: "shall", risk: "Vulnerable Persons",    maps: "POL-DATA-007", status: "bound" },
  { clause: "9.5",  text: "The provider may rely on internal testing where conformity with general-purpose models is otherwise demonstrated.",   modality: "may",   risk: "Conformity Testing",    maps: "—",          status: "bloat" },
  { clause: "9.6",  text: "Test results shall be documented in technical files retained for ten (10) years after the system is placed on market.",modality: "shall", risk: "Records · Retention",   maps: "POL-LOG-018",status: "bound" },
];

export function Ingest() {
  const [active, setActive] = React.useState(1); // EU AI Act
  const toast = useToast();
  const fileRef = React.useRef(null);
  const run = INGEST_RUNS[active];
  const handleUpload = (e) => {
    const f = e.target.files?.[0];
    if (f) toast({ title: "Queued for OCR", msg: `${f.name} · ${(f.size/1024).toFixed(0)} KB · joining stage 1.`, tone: "ok" });
  };

  return (
    <div className="lr-page">
      <PageHeader
        eyebrow="MODULE · 02"
        title="Ingest"
        sub="A PDF is not text — it is a graph of obligations. Ingestion lifts that graph out, tags every clause, and offers it to the Brain for binding."
        actions={<>
          <input type="file" ref={fileRef} accept="application/pdf,.pdf,.md,.txt" style={{ display: "none" }} onChange={handleUpload} />
          <button className="lr-btn" onClick={() => toast({ msg: `Archive · 142 prior runs since 2024.`, duration: 1800 })}>View archive</button>
          <button className="lr-btn primary" onClick={() => fileRef.current?.click()}>+ Upload PDF</button>
        </>}
      />

      {/* Drop zone */}
      <div style={{
        border: "1px dashed var(--line-2)", borderRadius: 8,
        padding: "26px 20px", marginBottom: 24,
        background: "color-mix(in oklab, var(--accent) 4%, var(--bg-1))",
        display: "flex", alignItems: "center", gap: 18,
      }}>
        <div style={{
          width: 48, height: 56, border: "1px solid var(--accent)", borderRadius: 4,
          display: "grid", placeItems: "center", position: "relative", flexShrink: 0,
        }}>
          <span className="serif" style={{ fontSize: 22, color: "var(--accent)" }}>¶</span>
          <span style={{ position: "absolute", bottom: -7, right: -7, fontSize: 9, padding: "1px 4px", background: "var(--bg-0)", border: "1px solid var(--accent)", color: "var(--accent)", borderRadius: 3, fontFamily: "Geist Mono, monospace" }}>PDF</span>
        </div>
        <div>
          <div style={{ fontFamily: "Instrument Serif, serif", fontStyle: "italic", fontSize: 22, marginBottom: 2 }}>Drop a policy document to begin</div>
          <div style={{ fontSize: 12.5, color: "var(--fg-2)" }}>
            Confluence export · standards body PDF · vendor MSA · internal runbook.
            Tables, footnotes and headings are preserved through Markdown.
          </div>
        </div>
        <div style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
          <button className="lr-btn" onClick={() => toast({ msg: "Confluence OAuth would open here.", duration: 1800 })}>Connect Confluence</button>
          <button className="lr-btn primary" onClick={() => fileRef.current?.click()}>Browse files</button>
        </div>
      </div>

      <SectionHd idx="01" title="Active run" sub={run.name} />

      {/* Pipeline stages */}
      <PipelineStages run={run} />

      {/* Extracted rules preview */}
      <SectionHd idx="02" title="Extracted rules" sub={`${run.rules} obligations · ${run.gaps} gaps · ${run.conflicts} collisions`} />
      <div className="lr-card" style={{ overflow: "hidden" }}>
        <table className="lr-table">
          <thead>
            <tr>
              <th style={{ width: 70 }}>Clause</th>
              <th>Obligation</th>
              <th style={{ width: 130 }}>Modality</th>
              <th style={{ width: 160 }}>Tagged risk</th>
              <th style={{ width: 120 }}>Maps to</th>
              <th style={{ width: 110 }}>Status</th>
            </tr>
          </thead>
          <tbody>
            {EXTRACTED_RULES.map((r, i) => (
              <tr key={i}>
                <td className="mono dim">§ {r.clause}</td>
                <td style={{ color: "var(--fg-0)" }}>{r.text}</td>
                <td>
                  <span className="lr-badge plain" style={{ color: r.modality === "shall" ? "var(--crit)" : r.modality === "must" ? "var(--accent-2)" : "var(--fg-1)" }}>
                    {r.modality}
                  </span>
                </td>
                <td>
                  <span className="mono" style={{ fontSize: 11.5, color: "var(--fg-1)" }}>{r.risk}</span>
                </td>
                <td className="mono dim">{r.maps || "—"}</td>
                <td>
                  {r.status === "bound"   && <span className="lr-badge ok">bound</span>}
                  {r.status === "new"     && <span className="lr-badge info">new clause</span>}
                  {r.status === "gap"     && <span className="lr-badge warn">no workflow</span>}
                  {r.status === "bloat"   && <span className="lr-badge plain" style={{ color: "var(--fg-3)" }}>metadata</span>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div style={{ marginTop: 14, display: "flex", gap: 10, justifyContent: "flex-end" }}>
        <button className="lr-btn" onClick={() => toast({ msg: "Run discarded · nothing was written to the ledger.", duration: 1800 })}>Discard run</button>
        <button className="lr-btn" onClick={() => toast({ title: "Saved as draft", msg: `${run.rules} rules pending review · keep in Inbox.`, tone: "ok" })}>Save as draft</button>
        <button className="lr-btn primary" onClick={() => toast({ title: "Anchoring 4 policies", msg: "Blocks #483–486 will be witnessed by Audit + Security.", tone: "ok", hash: "draft manifest 7f4b…0c1d" })}>Anchor 4 new policies →</button>
      </div>

      <SectionHd idx="03" title="Recent runs" />
      <div className="lr-card" style={{ overflow: "hidden" }}>
        <table className="lr-table">
          <thead>
            <tr>
              <th>Document</th>
              <th style={{ width: 70 }}>Pages</th>
              <th style={{ width: 90 }}>Rules</th>
              <th style={{ width: 90 }}>Gaps</th>
              <th style={{ width: 110 }}>Collisions</th>
              <th style={{ width: 130 }}>Stage</th>
              <th style={{ width: 140 }}>Ingested</th>
            </tr>
          </thead>
          <tbody>
            {INGEST_RUNS.map((r, i) => (
              <tr key={i} onClick={() => setActive(i)} style={{ cursor: "pointer" }} className={i === active ? "selected" : ""}>
                <td style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span className="serif" style={{ color: "var(--accent)" }}>¶</span>
                  <span>{r.name}</span>
                </td>
                <td className="mono dim">{r.pages}</td>
                <td className="mono">{r.rules}</td>
                <td className="mono" style={{ color: r.gaps ? "var(--warn)" : "var(--fg-3)" }}>{r.gaps}</td>
                <td className="mono" style={{ color: r.conflicts ? "var(--crit)" : "var(--fg-3)" }}>{r.conflicts}</td>
                <td>
                  <span className="lr-badge plain">{["queued","ocr","extract","map","ready"][r.stage]}</span>
                </td>
                <td className="mono dim">{relTime(r.ts)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Ingest;
