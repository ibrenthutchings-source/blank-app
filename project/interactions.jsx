// interactions.jsx — global toast host, modal shell, contexts, button wiring
// All pieces are global on window so any module can import them.

// ─────────────────────────────────────────────────────────────
// Toast host
// ─────────────────────────────────────────────────────────────
const ToastContext = React.createContext(() => {});

function ToastProvider({ children }) {
  const [toasts, setToasts] = React.useState([]);
  const push = React.useCallback((t) => {
    const id = Math.random().toString(36).slice(2);
    const toast = typeof t === "string" ? { msg: t } : t;
    setToasts(ts => [...ts, { id, ...toast }]);
    setTimeout(() => setToasts(ts => ts.filter(x => x.id !== id)), toast.duration || 3600);
  }, []);
  return (
    <ToastContext.Provider value={push}>
      {children}
      <div style={{
        position: "fixed", right: 16, top: 60, zIndex: 100,
        display: "flex", flexDirection: "column", gap: 8, pointerEvents: "none",
      }}>
        {toasts.map(t => (
          <div key={t.id} className="lr-toast" style={{
            pointerEvents: "auto",
            display: "flex", alignItems: "flex-start", gap: 10,
            padding: "10px 14px", minWidth: 260, maxWidth: 360,
            background: "var(--bg-2)", border: "1px solid var(--line-2)",
            borderLeft: "2px solid " + (t.tone === "ok" ? "var(--ok)" : t.tone === "crit" ? "var(--crit)" : t.tone === "warn" ? "var(--warn)" : "var(--accent)"),
            borderRadius: 6, fontSize: 12.5, color: "var(--fg-0)",
            boxShadow: "0 8px 24px rgba(0,0,0,.4)",
            animation: "lr-toast-in .2s ease-out",
          }}>
            <div style={{ flex: 1 }}>
              {t.title && <div style={{ fontWeight: 500, marginBottom: 2 }}>{t.title}</div>}
              <div style={{ color: t.title ? "var(--fg-2)" : "var(--fg-0)" }}>{t.msg}</div>
              {t.hash && <div className="mono" style={{ fontSize: 11, color: "var(--fg-3)", marginTop: 4 }}>{t.hash}</div>}
            </div>
          </div>
        ))}
      </div>
      <style>{`
        @keyframes lr-toast-in { from { opacity: 0; transform: translateY(-6px); } to { opacity: 1; transform: none; } }
      `}</style>
    </ToastContext.Provider>
  );
}

function useToast() { return React.useContext(ToastContext); }

// ─────────────────────────────────────────────────────────────
// Policy store (hoists POLICIES into React state)
// ─────────────────────────────────────────────────────────────
const PolicyContext = React.createContext(null);

function PolicyProvider({ children }) {
  const [policies, setPolicies] = React.useState(window.LR_DATA.POLICIES);
  React.useEffect(() => { window.LR_DATA.POLICIES = policies; }, [policies]);
  return (
    <PolicyContext.Provider value={{ policies, setPolicies }}>
      {children}
    </PolicyContext.Provider>
  );
}

function usePolicies() { return React.useContext(PolicyContext); }

// ─────────────────────────────────────────────────────────────
// Modal shell
// ─────────────────────────────────────────────────────────────
function Modal({ open, onClose, title, sub, children, footer, width = 540 }) {
  React.useEffect(() => {
    if (!open) return;
    const onKey = (e) => { if (e.key === "Escape") onClose?.(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);
  if (!open) return null;
  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 90,
      background: "color-mix(in oklab, var(--bg-0) 70%, transparent)",
      backdropFilter: "blur(6px)",
      display: "grid", placeItems: "center",
      animation: "lr-fade-in .15s ease-out",
    }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{
        width, maxWidth: "92vw", maxHeight: "90vh",
        background: "var(--bg-1)", border: "1px solid var(--line-2)", borderRadius: 10,
        boxShadow: "0 24px 64px rgba(0,0,0,.55)",
        display: "flex", flexDirection: "column",
        animation: "lr-modal-in .18s ease-out",
      }}>
        <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--line-1)" }}>
          <div className="lr-page-eyebrow" style={{ marginBottom: 4 }}>{sub}</div>
          <div style={{ display: "flex", alignItems: "baseline", gap: 10 }}>
            <h2 className="serif" style={{ margin: 0, fontSize: 28, lineHeight: 1 }}>{title}</h2>
            <button onClick={onClose} style={{
              marginLeft: "auto", appearance: "none", border: 0, background: "transparent",
              color: "var(--fg-2)", fontSize: 16, cursor: "pointer", padding: 4,
            }}>✕</button>
          </div>
        </div>
        <div style={{ padding: "16px 20px", overflowY: "auto" }}>{children}</div>
        {footer && (
          <div style={{ padding: "12px 20px", borderTop: "1px solid var(--line-1)", display: "flex", gap: 8, justifyContent: "flex-end" }}>
            {footer}
          </div>
        )}
      </div>
      <style>{`
        @keyframes lr-fade-in { from { opacity: 0 } to { opacity: 1 } }
        @keyframes lr-modal-in { from { opacity: 0; transform: translateY(8px) scale(.98); } to { opacity: 1; transform: none; } }
      `}</style>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Form field bits
// ─────────────────────────────────────────────────────────────
function Lab({ k, hint, children }) {
  return (
    <label style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 14 }}>
      <span style={{ fontSize: 11, color: "var(--fg-3)", textTransform: "uppercase", letterSpacing: 0.06 + "em" }}>{k}</span>
      {children}
      {hint && <span style={{ fontSize: 11, color: "var(--fg-3)" }}>{hint}</span>}
    </label>
  );
}

function Input(props) {
  return <input {...props} style={{
    appearance: "none", border: "1px solid var(--line-1)", borderRadius: 6,
    background: "var(--bg-2)", color: "var(--fg-0)", fontFamily: "inherit",
    padding: "8px 10px", fontSize: 13, outline: "none",
    ...(props.style || {}),
  }}/>;
}

function Select({ children, ...props }) {
  return <select {...props} style={{
    appearance: "none", border: "1px solid var(--line-1)", borderRadius: 6,
    background: "var(--bg-2)", color: "var(--fg-0)",
    padding: "8px 10px", fontSize: 13, fontFamily: "inherit", outline: "none",
    backgroundImage: "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='10' height='6' viewBox='0 0 10 6'><path fill='%23999' d='M0 0h10L5 6z'/></svg>\")",
    backgroundRepeat: "no-repeat", backgroundPosition: "right 10px center", paddingRight: 28,
    ...(props.style || {}),
  }}>{children}</select>;
}

function Tx(props) {
  return <textarea {...props} spellCheck={false} style={{
    appearance: "none", border: "1px solid var(--line-1)", borderRadius: 6,
    background: "var(--bg-2)", color: "var(--fg-0)", fontFamily: "Geist Mono, monospace",
    padding: "10px", fontSize: 12.5, outline: "none", lineHeight: 1.55, resize: "vertical",
    ...(props.style || {}),
  }}/>;
}

// ─────────────────────────────────────────────────────────────
// New Policy modal
// ─────────────────────────────────────────────────────────────
function NewPolicyModal({ open, onClose, onCreated }) {
  const { policies, setPolicies } = usePolicies();
  const toast = useToast();
  const [f, setF] = React.useState({
    id: "POL-NEW-001",
    title: "",
    category: "Operational",
    owner: "Internal Audit",
    impact: "Medium",
    likelihood: "Occasional",
    weight: 60,
    text: "",
    yaml: "id: POL-NEW-001\nversion: 0.1.0\n",
  });

  // Suggest a unique ID
  React.useEffect(() => {
    if (!open) return;
    const used = new Set(policies.map(p => p.id));
    const prefix = ({
      "Data Privacy": "POL-DATA",
      "Operational":  "POL-OPS",
      "Regulatory":   "POL-REG",
      "Access":       "POL-ACCESS",
      "Compliance":   "POL-COMP",
      "Financial":    "POL-SOX",
      "Supply Chain": "POL-CICD",
      "Third-Party":  "POL-VND",
    })[f.category] || "POL-NEW";
    let n = 1;
    while (used.has(`${prefix}-${String(n).padStart(3, "0")}`)) n++;
    setF(cur => ({ ...cur, id: `${prefix}-${String(n).padStart(3, "0")}` }));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, f.category]);

  const create = () => {
    if (!f.title.trim()) { toast({ msg: "Add a title before anchoring.", tone: "warn" }); return; }
    const newP = {
      id: f.id,
      title: f.title,
      version: "0.1.0",
      status: "pending",
      weight: Number(f.weight),
      impact: f.impact,
      likelihood: f.likelihood,
      categories: [f.category],
      owner: f.owner,
      lastAnchor: new Date().toISOString(),
      hash: Math.random().toString(16).slice(2, 42),
      hooks: [],
      approvals: [],
      text: f.text || "(draft — write the plain-language policy here)",
      yaml:  f.yaml,
    };
    setPolicies(ps => [newP, ...ps]);
    toast({ title: "Draft created", msg: `${newP.id} · awaiting initial anchor`, tone: "ok", hash: "ledger pending · queued" });
    onCreated?.(newP.id);
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose}
      title="A new policy"
      sub="DRAFT · PENDING ANCHOR"
      width={620}
      footer={<>
        <button className="lr-btn" onClick={onClose}>Cancel</button>
        <button className="lr-btn primary" onClick={create}>Create draft</button>
      </>}>
      <p style={{ marginTop: 0, color: "var(--fg-2)", fontSize: 12.5, lineHeight: 1.55 }}>
        A draft policy is born untethered. It joins the Brain in <b>pending</b> state and earns its anchor when both shadows — plain language and YAML — are filled and the witnesses co-sign.
      </p>
      <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr 1fr", gap: 12 }}>
        <Lab k="Title">
          <Input value={f.title} placeholder="Customer Data Retention" onChange={e => setF({ ...f, title: e.target.value })}/>
        </Lab>
        <Lab k="ID" hint="auto-derived from category">
          <Input value={f.id} className="mono" onChange={e => setF({ ...f, id: e.target.value.toUpperCase() })}/>
        </Lab>
        <Lab k="Owner">
          <Select value={f.owner} onChange={e => setF({ ...f, owner: e.target.value })}>
            {["Internal Audit","Privacy Office","Platform Security","SRE Council","DevSecOps","Vendor Risk","SecOps"].map(o => <option key={o}>{o}</option>)}
          </Select>
        </Lab>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 12 }}>
        <Lab k="Category">
          <Select value={f.category} onChange={e => setF({ ...f, category: e.target.value })}>
            {["Operational","Data Privacy","Regulatory","Access","Compliance","Financial","Supply Chain","Third-Party"].map(o => <option key={o}>{o}</option>)}
          </Select>
        </Lab>
        <Lab k="Impact">
          <Select value={f.impact} onChange={e => setF({ ...f, impact: e.target.value })}>
            {["Low","Medium","High","Critical"].map(o => <option key={o}>{o}</option>)}
          </Select>
        </Lab>
        <Lab k="Likelihood">
          <Select value={f.likelihood} onChange={e => setF({ ...f, likelihood: e.target.value })}>
            {["Rare","Occasional","Likely","Frequent"].map(o => <option key={o}>{o}</option>)}
          </Select>
        </Lab>
        <Lab k="Risk Weight" hint="0–100; ≥80 blocks pipelines">
          <Input type="number" value={f.weight} min={0} max={100} onChange={e => setF({ ...f, weight: e.target.value })}/>
        </Lab>
      </div>
      <Lab k="Plain language" hint="the human-readable policy">
        <Tx rows={3} value={f.text} placeholder="Customer data must be deleted within 90 days of …" onChange={e => setF({ ...f, text: e.target.value })}
            style={{ fontFamily: "Geist, sans-serif", fontSize: 13 }}/>
      </Lab>
      <Lab k="YAML — machine logic" hint="will be hashed alongside the text on anchor">
        <Tx rows={5} value={f.yaml} onChange={e => setF({ ...f, yaml: e.target.value })}/>
      </Lab>
    </Modal>
  );
}

// ─────────────────────────────────────────────────────────────
// Exception request modal
// ─────────────────────────────────────────────────────────────
function ExceptionModal({ open, onClose, run, check }) {
  const toast = useToast();
  const [reason, setReason] = React.useState("");
  const [duration, setDuration] = React.useState("24");
  const submit = () => {
    if (!reason.trim()) { toast({ msg: "Reason required for audit trail.", tone: "warn" }); return; }
    toast({ title: "Exception requested", msg: `Pinged VP Engineering + CISO · routed to ledger block #483`, tone: "ok", hash: "tx 0x9c4a…f1e2 · awaiting 2 signatures" });
    onClose();
    setReason("");
  };
  return (
    <Modal open={open} onClose={onClose}
      title="Request exception"
      sub={check ? `BLOCKED BY · ${check.policy}` : ""}
      width={520}
      footer={<>
        <button className="lr-btn" onClick={onClose}>Cancel</button>
        <button className="lr-btn primary" onClick={submit}>Send for co-sign</button>
      </>}>
      {check && (
        <div style={{ padding: 12, border: "1px solid var(--line-1)", borderRadius: 6, marginBottom: 14, background: "color-mix(in oklab, var(--crit) 6%, transparent)" }}>
          <div className="mono" style={{ fontSize: 11.5, color: "var(--fg-2)" }}>{run?.repo} @ {run?.sha}</div>
          <div style={{ marginTop: 4, fontSize: 13 }}>{check.why}</div>
        </div>
      )}
      <Lab k="Reason — for the ledger">
        <Tx rows={4} value={reason} onChange={e => setReason(e.target.value)} placeholder="One-time deploy to roll back the breaking change. On-call lead approves."
            style={{ fontFamily: "Geist, sans-serif", fontSize: 13 }}/>
      </Lab>
      <Lab k="Valid for">
        <Select value={duration} onChange={e => setDuration(e.target.value)}>
          <option value="4">4 hours</option>
          <option value="24">24 hours</option>
          <option value="72">72 hours</option>
          <option value="168">7 days</option>
        </Select>
      </Lab>
      <div style={{ fontSize: 11.5, color: "var(--fg-3)", padding: 10, border: "1px dashed var(--line-1)", borderRadius: 6 }}>
        Two signatures required: <b style={{ color: "var(--fg-1)" }}>VP Engineering</b> + <b style={{ color: "var(--fg-1)" }}>CISO</b>. Acceptance writes a new block to the chain — block <span className="mono">#483</span>.
      </div>
    </Modal>
  );
}

// ─────────────────────────────────────────────────────────────
// Verify-chain animation
// ─────────────────────────────────────────────────────────────
function VerifyChainOverlay({ open, onDone }) {
  const [step, setStep] = React.useState(0);
  React.useEffect(() => {
    if (!open) return;
    setStep(0);
    const ts = [
      setTimeout(() => setStep(1), 400),
      setTimeout(() => setStep(2), 1000),
      setTimeout(() => setStep(3), 1600),
      setTimeout(() => onDone?.(), 2200),
    ];
    return () => ts.forEach(clearTimeout);
  }, [open, onDone]);
  if (!open) return null;
  const stages = [
    "Reading genesis block…",
    "Recomputing 482 leaf hashes…",
    "Verifying 3 witness signatures…",
    "Chain intact. ✓",
  ];
  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 95,
      background: "color-mix(in oklab, var(--bg-0) 75%, transparent)",
      backdropFilter: "blur(8px)",
      display: "grid", placeItems: "center",
    }}>
      <div style={{
        padding: 28, minWidth: 380,
        background: "var(--bg-1)", border: "1px solid var(--accent)", borderRadius: 10,
        boxShadow: "0 0 0 4px color-mix(in oklab, var(--accent) 18%, transparent), 0 24px 60px rgba(0,0,0,.5)",
      }}>
        <div className="lr-page-eyebrow" style={{ marginBottom: 4 }}>CRYPTO · CHAIN AUDIT</div>
        <div className="serif" style={{ fontSize: 26, lineHeight: 1.1, marginBottom: 14 }}>Verifying the chain</div>
        {stages.map((s, i) => (
          <div key={i} style={{
            padding: "8px 0", display: "flex", alignItems: "center", gap: 10,
            opacity: i <= step ? 1 : 0.3,
            color: i < step ? "var(--ok)" : i === step ? "var(--accent)" : "var(--fg-3)",
            fontSize: 13,
          }}>
            <span style={{ fontFamily: "Geist Mono, monospace", fontSize: 14, width: 14 }}>
              {i < step ? "✓" : i === step ? <span className="lr-pulse">●</span> : "○"}
            </span>
            <span>{s}</span>
          </div>
        ))}
      </div>
      <style>{`
        .lr-pulse { animation: lr-pulse 1.2s ease-in-out infinite; }
        @keyframes lr-pulse { 0%,100% { opacity: 1 } 50% { opacity: 0.3 } }
      `}</style>
    </div>
  );
}

Object.assign(window, {
  ToastProvider, useToast,
  PolicyProvider, usePolicies,
  Modal, NewPolicyModal, ExceptionModal, VerifyChainOverlay,
  Lab, Input, Select, Tx,
});
