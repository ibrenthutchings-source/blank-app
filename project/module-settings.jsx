// module-settings.jsx — light, but real

function Settings() {
  const toast = window.useToast();
  return (
    <SettingsBody toast={toast} />
  );
}

function SettingsBody({ toast }) {
  return (
    <div className="lr-page" style={{ maxWidth: 920 }}>
      <PageHeader
        eyebrow="MODULE · 06"
        title="Workspace"
        sub="Witnesses, brain endpoints, key material. Internal Audit has read of all; only Security can rotate."
      />

      <SectionHd idx="01" title="Identity" />
      <div className="lr-card" style={{ padding: 16, marginBottom: 22 }}>
        <Field label="Workspace" v="Acme · Internal Audit" sub="prod tenant" toast={toast}/>
        <Field label="Brain endpoint" v="brain.prod.lex-risk.acme" sub="ed25519:0xff3a…2c4" toast={toast}/>
        <Field label="Default policy owner" v="Internal Audit" toast={toast}/>
        <Field label="Default threshold" v="weight ≥ 80 blocks · ≥ 30 warns" toast={toast}/>
      </div>

      <SectionHd idx="02" title="Witnesses" sub="multi-party co-signing" />
      <div className="lr-card" style={{ overflow: "hidden", marginBottom: 22 }}>
        {[
          { who: "Internal Audit",  email: "audit@acme.co",   key: "ed25519:0x7c4f…a1e2", since: "2024-09-04" },
          { who: "Security Office", email: "ciso@acme.co",    key: "ed25519:0xb2a9…03c4", since: "2024-09-04" },
          { who: "Privacy Office",  email: "dpo@acme.co",     key: "ed25519:0x12fe…88d7", since: "2025-02-11" },
        ].map((w, i) => (
          <div key={i} style={{
            display: "grid", gridTemplateColumns: "200px 240px 1fr 110px",
            padding: "12px 14px", gap: 12, alignItems: "center",
            borderBottom: i < 2 ? "1px solid var(--line-1)" : 0,
          }}>
            <div>
              <div style={{ fontSize: 13, fontWeight: 500 }}>{w.who}</div>
              <div style={{ fontSize: 11, color: "var(--fg-3)" }}>since {w.since}</div>
            </div>
            <div className="mono" style={{ fontSize: 12, color: "var(--fg-1)" }}>{w.email}</div>
            <div className="mono" style={{ fontSize: 11.5, color: "var(--fg-2)" }}>{w.key}</div>
            <button className="lr-btn sm ghost" onClick={() => toast({ title: "Key rotation queued", msg: `${w.who} · pending Security co-sign · expires in 24h if unused.`, tone: "warn" })}>Rotate key</button>
          </div>
        ))}
      </div>

      <SectionHd idx="03" title="Integrations" />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, marginBottom: 22 }}>
        {[
          { name: "AWS Config", on: true,  sub: "us-east-1, eu-west-1" },
          { name: "OPA",        on: true,  sub: "rego-policies repo" },
          { name: "Kubernetes", on: true,  sub: "3 clusters" },
          { name: "GitLab",     on: true,  sub: "ci pipelines" },
          { name: "Confluence", on: false, sub: "not connected" },
          { name: "Slack",      on: true,  sub: "#governance, #sre-oncall" },
        ].map(i => (
          <div key={i.name} className="lr-card" style={{ padding: 14, display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{
              width: 30, height: 30, borderRadius: 6,
              background: i.on ? "color-mix(in oklab, var(--accent) 22%, var(--bg-2))" : "var(--bg-2)",
              border: "1px solid " + (i.on ? "var(--accent)" : "var(--line-2)"),
              display: "grid", placeItems: "center",
              fontFamily: "Geist Mono, monospace", fontSize: 11, color: i.on ? "var(--accent)" : "var(--fg-3)",
            }}>{i.name[0]}</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, fontWeight: 500 }}>{i.name}</div>
              <div style={{ fontSize: 11.5, color: "var(--fg-3)" }}>{i.sub}</div>
            </div>
            <span className={"lr-badge " + (i.on ? "ok" : "plain")}>{i.on ? "connected" : "off"}</span>
          </div>
        ))}
      </div>

      <SectionHd idx="04" title="Notes for Audit" />
      <div className="lr-card" style={{ padding: 16, color: "var(--fg-1)", fontSize: 13, lineHeight: 1.6 }}>
        <p style={{ margin: 0, marginBottom: 10 }}>
          <span className="serif" style={{ color: "var(--accent)", fontSize: 15, marginRight: 6 }}>—</span>
          The Ledger is append-only; admin rights cannot rewrite history. To excise a block (legal hold, GDPR erasure), Audit and Security must co-sign a redaction marker that <em>replaces the leaf's preimage</em> while preserving the manifest.
        </p>
        <p style={{ margin: 0, color: "var(--fg-2)" }}>
          Tweaks panel lets you reshape the surface — themes (Phosphor / Vellum / Terminal), navigation density, density of the data tables. None of it affects what is anchored in the chain.
        </p>
      </div>
    </div>
  );
}

function Field({ label, v, sub, toast }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "180px 1fr 80px", alignItems: "center", padding: "10px 0", borderBottom: "1px solid var(--line-1)", gap: 12 }}>
      <span style={{ fontSize: 12, color: "var(--fg-3)" }}>{label}</span>
      <div>
        <div style={{ fontSize: 13 }}>{v}</div>
        {sub && <div className="mono" style={{ fontSize: 11, color: "var(--fg-3)" }}>{sub}</div>}
      </div>
      <button className="lr-btn sm ghost" style={{ justifySelf: "end" }}
        onClick={() => toast?.({ msg: `Inline edit for "${label}" — coming soon.`, duration: 1800 })}>Edit</button>
    </div>
  );
}

window.Settings = Settings;
