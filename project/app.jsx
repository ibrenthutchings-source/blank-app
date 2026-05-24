// app.jsx — router + main + tweaks

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "theme": "phosphor",
  "navMode": "full",
  "density": "regular",
  "showAtmosphere": true,
  "showAnchorIndicator": true,
  "fontScale": 1
}/*EDITMODE-END*/;

function AppInner() {
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);
  const [route, setRoute] = React.useState("library");
  const [selected, setSelected] = React.useState("POL-DB-001");
  const [newPolicyOpen, setNewPolicyOpen] = React.useState(false);
  const [verifying, setVerifying] = React.useState(false);
  const toast = useToast();

  React.useEffect(() => {
    window.__openNewPolicy = () => setNewPolicyOpen(true);
    window.__verifyChain = () => setVerifying(true);
    window.__navigate = (r, id) => { setRoute(r); if (id) setSelected(id); };
  }, []);

  // Apply theme + density to document root
  React.useEffect(() => {
    document.documentElement.dataset.theme = t.theme;
    document.documentElement.style.fontSize = (13.5 * t.fontScale) + "px";
  }, [t.theme, t.fontScale]);

  const Page = {
    library:   <Library setRoute={setRoute} setSelected={setSelected} />,
    editor:    <PolicyEditor selectedId={selected} setSelected={setSelected} setRoute={setRoute} />,
    ingest:    <Ingest />,
    brain:     <Brain />,
    ledger:    <Ledger />,
    pipelines: <Pipelines />,
    settings:  <Settings />,
  }[route];

  const contextual = route === "editor" ? selected : null;

  return (
    <>
      {t.showAtmosphere && <div className="lr-atmosphere" aria-hidden="true"/>}
      <div className="lr-app" data-nav={t.navMode} data-density={t.density}>
        <Sidebar route={route} setRoute={setRoute} navMode={t.navMode} />
        <Topbar route={route} contextual={contextual} onNewPolicy={() => setNewPolicyOpen(true)} />
        <main className="lr-main" key={route}>{Page}</main>
      </div>

      <NewPolicyModal open={newPolicyOpen} onClose={() => setNewPolicyOpen(false)}
        onCreated={(id) => { setSelected(id); setRoute("editor"); }} />
      <VerifyChainOverlay open={verifying} onDone={() => { setVerifying(false); toast({ title: "Chain intact", msg: "All 482 blocks verified · 3 witness signatures match.", tone: "ok", hash: "root a8f3c91…2d7b" }); }} />

      {t.showAnchorIndicator && <AnchorPill />}

      <TweaksPanel title="Tweaks">
        <TweakSection label="Theme" />
        <TweakColor label="Palette" value={[t.theme]} options={[
          ["#b8a4ff", "#0c0a14", "#ff7ad9"],
          ["#6b4eff", "#f4f0e7", "#c1185c"],
          ["#5cffae", "#060807", "#ffd45c"],
        ]}
          onChange={(v) => {
            const map = { "#b8a4ff": "phosphor", "#6b4eff": "vellum", "#5cffae": "terminal" };
            setTweak("theme", map[v[0]] || "phosphor");
          }}/>
        <TweakRadio label="Theme" value={t.theme} options={["phosphor", "vellum", "terminal"]} onChange={(v) => setTweak("theme", v)} />
        <TweakToggle label="Atmosphere" value={t.showAtmosphere} onChange={(v) => setTweak("showAtmosphere", v)} />

        <TweakSection label="Layout" />
        <TweakRadio label="Navigation" value={t.navMode} options={["full", "rail", "hidden"]} onChange={(v) => setTweak("navMode", v)} />
        <TweakRadio label="Density" value={t.density} options={["compact", "regular", "comfy"]} onChange={(v) => setTweak("density", v)} />
        <TweakSlider label="Font scale" value={t.fontScale} min={0.85} max={1.2} step={0.05} unit="×" onChange={(v) => setTweak("fontScale", v)} />

        <TweakSection label="Display" />
        <TweakToggle label="Anchor pill" value={t.showAnchorIndicator} onChange={(v) => setTweak("showAnchorIndicator", v)} />

        <TweakSection label="Demo" />
        <TweakButton label="Open Pipelines" onClick={() => setRoute("pipelines")} />
        <TweakButton label="Open Editor" onClick={() => { setSelected("POL-ACCESS-014"); setRoute("editor"); }} secondary />
      </TweaksPanel>
    </>
  );
}

// Tiny floating status — the "are we anchored?" eye, always visible
function AnchorPill() {
  const { POLICIES } = window.LR_DATA;
  const adrift = POLICIES.filter(p => p.status === "adrift").length;
  const gaps = POLICIES.filter(p => p.status === "gap").length;
  const conflicts = POLICIES.filter(p => p.status === "conflict").length;
  const ok = adrift + gaps + conflicts === 0;
  return (
    <div style={{
      position: "fixed", left: "50%", bottom: 14, transform: "translateX(-50%)",
      display: "flex", alignItems: "center", gap: 12,
      padding: "6px 12px", background: "color-mix(in oklab, var(--bg-1) 82%, transparent)",
      backdropFilter: "blur(12px)",
      border: "1px solid var(--line-2)", borderRadius: 999,
      fontSize: 11.5, color: "var(--fg-1)", zIndex: 50,
      boxShadow: "0 4px 16px rgba(0,0,0,.3)",
    }}>
      <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
        <span style={{ width: 7, height: 7, borderRadius: "50%", background: ok ? "var(--ok)" : "var(--accent-2)", boxShadow: `0 0 8px ${ok ? "var(--ok)" : "var(--accent-2)"}` }}/>
        Chain block <span className="mono" style={{ color: "var(--fg-0)" }}>#482</span>
      </span>
      <span className="dim">·</span>
      <span style={{ color: adrift ? "var(--accent-2)" : "var(--fg-2)" }}>{adrift} adrift</span>
      <span style={{ color: gaps ? "var(--warn)" : "var(--fg-2)" }}>{gaps} gap</span>
      <span style={{ color: conflicts ? "var(--crit)" : "var(--fg-2)" }}>{conflicts} collision</span>
    </div>
  );
}

function App() {
  return (
    <ToastProvider>
      <PolicyProvider>
        <AppInner />
      </PolicyProvider>
    </ToastProvider>
  );
}

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<App />);
