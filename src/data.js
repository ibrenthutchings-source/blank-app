// data.js — sample policies, ledger entries, pipeline runs, gaps
// All names/orgs are fictitious.

export const POLICIES = [
  {
    id: "POL-DB-001",
    title: "Database Encryption at Rest",
    version: "1.2.0",
    status: "anchored",          // anchored | adrift | gap | conflict | pending
    weight: 85,
    impact: "Critical",
    likelihood: "Occasional",
    categories: ["Data Privacy", "Compliance"],
    owner: "Platform Security",
    lastAnchor: "2026-05-18T11:42:00Z",
    hash: "e3b0c44298fc1c149afbf4c8996fb92427ae41e4",
    hooks: [
      { platform: "AWS_Config", ref: "arn:aws:config:us-east-1:12345:config-rule/db-instance-encryption-enabled", status: "compliant" },
      { platform: "OPA",        ref: "git://github.com/org/rego-policies/db_encryption.rego",                      status: "compliant" },
    ],
    approvals: [
      { stage: "Compliance Review",  approver: "Compliance_Admin",       type: "Role", cond: "One_Approves" },
      { stage: "VP Exception Path",  approver: "vp_engineering@co.com",  type: "User", cond: "All_Approve" },
    ],
    text: `All production databases must be encrypted at rest using AES-256 or stronger. Encryption keys must be managed through the organization's central KMS, rotated at least every 365 days, and access to keys must be logged immutably for a minimum of seven (7) years.`,
    yaml: `id: POL-DB-001
version: 1.2.0
encryption:
  state: at_rest
  algorithm: AES-256
  scope: production
key_management:
  provider: central_kms
  rotation_days: 365
  audit_log_retention_years: 7`,
  },
  {
    id: "POL-ACCESS-014",
    title: "Production Break-Glass Access",
    version: "2.0.1",
    status: "adrift",
    weight: 92,
    impact: "Critical",
    likelihood: "Likely",
    categories: ["Access", "Operational"],
    owner: "SRE Council",
    lastAnchor: "2026-04-02T08:11:00Z",
    hash: "9d4b2c8f1e6a3b0d8c5e9f2a1b4c7d6e3f8a0b1c",
    drift: { side: "text", lines: 3, since: "2026-05-19T14:21:00Z" },
    hooks: [
      { platform: "Kubernetes",  ref: "k8s://cluster-prod/rbac/breakglass-role.yaml", status: "non_compliant" },
      { platform: "AWS_Config",  ref: "arn:aws:config:.../iam-breakglass-mfa",         status: "compliant" },
    ],
    approvals: [
      { stage: "On-call Lead",        approver: "sre_oncall",            type: "Role", cond: "One_Approves" },
      { stage: "VP Engineering",      approver: "vp_engineering@co.com", type: "User", cond: "All_Approve" },
      { stage: "Security Officer",    approver: "ciso@co.com",           type: "User", cond: "All_Approve" },
    ],
    text: `Break-glass access to production systems requires multi-party approval and must be revoked within 30 minutes of grant. Sessions must be recorded in full and reviewed within 24 hours by Security.`,
    yaml: `id: POL-ACCESS-014
version: 2.0.1
break_glass:
  approval_parties: 2
  max_duration_minutes: 60
  session_recording: required
  review_sla_hours: 48`,
  },
  {
    id: "POL-DATA-007",
    title: "Customer Data Residency (EU)",
    version: "3.1.0",
    status: "anchored",
    weight: 78,
    impact: "High",
    likelihood: "Frequent",
    categories: ["Data Privacy", "Regulatory"],
    owner: "Privacy Office",
    lastAnchor: "2026-05-12T09:30:00Z",
    hash: "2a8d4f7c1b9e6f3a5d8c2b1f4e7a9c6d3b8f1e0a",
    hooks: [
      { platform: "AWS_Config", ref: "arn:aws:config:.../eu-region-only-storage", status: "compliant" },
      { platform: "OPA",        ref: "git://github.com/org/rego/data_residency.rego", status: "compliant" },
    ],
    approvals: [
      { stage: "DPO Review", approver: "dpo@co.com", type: "User", cond: "All_Approve" },
    ],
    text: `Customer personal data originating in the European Economic Area must be stored exclusively within EU-resident infrastructure. Cross-border processing requires an executed Standard Contractual Clause and a documented Transfer Impact Assessment.`,
    yaml: `id: POL-DATA-007
version: 3.1.0
residency:
  origin: EEA
  permitted_regions: [eu-west-1, eu-west-2, eu-central-1]
  cross_border:
    requires: [SCC, TIA]
    expires_days: 730`,
  },
  {
    id: "POL-CICD-022",
    title: "Pipeline Artifact Signing",
    version: "1.0.0",
    status: "gap",
    weight: 65,
    impact: "High",
    likelihood: "Occasional",
    categories: ["Supply Chain", "Operational"],
    owner: "DevSecOps",
    lastAnchor: "2026-05-01T16:44:00Z",
    hash: "5c9e2d8b4f7a1c6e3d9b8f2a4c7e1d6b3a9f8c2e",
    gap: { kind: "missing_workflow", detail: "Policy text states 'exceptions require Security Lead approval', but no approval_workflow_id is bound." },
    hooks: [
      { platform: "GitLab_Scan", ref: "git://github.com/org/ci/cosign-verify.yml", status: "compliant" },
    ],
    approvals: [],
    text: `All build artifacts deployed to production must be signed with the organization's Cosign keys. Exceptions require Security Lead approval and are valid for no more than 14 days.`,
    yaml: `id: POL-CICD-022
version: 1.0.0
signing:
  required_for: [production]
  tool: cosign
  key_source: vault://signing/prod
exceptions:
  max_duration_days: 14
  # WARN: approval workflow not bound`,
  },
  {
    id: "POL-PII-031",
    title: "PII Retention Limits",
    version: "1.4.2",
    status: "anchored",
    weight: 71,
    impact: "High",
    likelihood: "Frequent",
    categories: ["Data Privacy", "Regulatory"],
    owner: "Privacy Office",
    lastAnchor: "2026-05-15T10:15:00Z",
    hash: "8f3e1d7c5b2a9f4e6d3b8c1a7f5e2d9b4c8a1f6e",
    hooks: [
      { platform: "OPA",        ref: "git://github.com/org/rego/pii_retention.rego", status: "compliant" },
      { platform: "AWS_Config", ref: "arn:aws:config:.../s3-lifecycle-pii",          status: "compliant" },
    ],
    approvals: [
      { stage: "Privacy Officer", approver: "dpo@co.com", type: "User", cond: "All_Approve" },
    ],
    text: `Personally identifiable information must be deleted no later than 90 days after the close of the account or transaction it relates to, unless retention is required by an active legal hold or statutory obligation.`,
    yaml: `id: POL-PII-031
version: 1.4.2
retention:
  pii_max_days: 90
  trigger: account_or_transaction_close
  exceptions: [legal_hold, statutory_obligation]`,
  },
  {
    id: "POL-SOX-003",
    title: "SOX Change Management",
    version: "4.2.1",
    status: "anchored",
    weight: 88,
    impact: "Critical",
    likelihood: "Frequent",
    categories: ["Financial", "Regulatory"],
    owner: "Internal Audit",
    lastAnchor: "2026-05-17T13:22:00Z",
    hash: "1f8c5e2d9b4a7c6f3d1e8b5a2c7f4d9e6b3a8c1f",
    hooks: [
      { platform: "GitLab_Scan", ref: "git://github.com/org/ci/sox-gate.yml", status: "compliant" },
    ],
    approvals: [
      { stage: "Change Advisory Board", approver: "cab_chair", type: "Role", cond: "Threshold_Met" },
      { stage: "Audit Sign-off",        approver: "audit@co.com", type: "User", cond: "All_Approve" },
    ],
    text: `Any change to a financial reporting system requires a fully attested CAB record, paired test evidence, and a post-deployment verification step within seventy-two (72) hours.`,
    yaml: `id: POL-SOX-003
version: 4.2.1
change_control:
  applies_to: [fin_reporting_systems]
  requires: [cab_record, paired_test, post_deploy_verify]
  verify_within_hours: 72`,
  },
  {
    id: "POL-IR-009",
    title: "Incident Response SLA",
    version: "2.3.0",
    status: "conflict",
    weight: 80,
    impact: "High",
    likelihood: "Occasional",
    categories: ["Operational", "Regulatory"],
    owner: "SecOps",
    lastAnchor: "2026-05-08T19:00:00Z",
    hash: "7c4f1b8e2d5a9c6f3d1e8b4a2c7f5d9e6b3a8c1d",
    conflict: { with: "POL-DATA-007", reason: "Global IR forensic copy collides with EU residency window." },
    hooks: [
      { platform: "OPA", ref: "git://github.com/org/rego/ir_sla.rego", status: "non_compliant" },
    ],
    approvals: [
      { stage: "SecOps Lead", approver: "secops_lead", type: "Role", cond: "One_Approves" },
    ],
    text: `Critical incidents must be acknowledged within fifteen (15) minutes and contained within four (4) hours. A full forensic copy must be retained for 365 days in a globally accessible archive.`,
    yaml: `id: POL-IR-009
version: 2.3.0
ir_sla:
  ack_minutes: 15
  contain_hours: 4
  forensic_retain_days: 365
  forensic_region: global`,
  },
  {
    id: "POL-VND-011",
    title: "Vendor Risk Assessment",
    version: "1.1.0",
    status: "pending",
    weight: 54,
    impact: "Medium",
    likelihood: "Frequent",
    categories: ["Third-Party", "Operational"],
    owner: "Vendor Risk",
    lastAnchor: "2026-04-26T11:00:00Z",
    hash: "3e9b4c7f1d8a2e6c5b9f3a1d4e7c8b6f2a9d5c1e",
    hooks: [],
    approvals: [
      { stage: "Vendor Risk Lead", approver: "vrm_lead", type: "Role", cond: "One_Approves" },
    ],
    text: `Any new third-party processor handling Tier-1 data must complete the Vendor Risk Questionnaire and pass a SOC 2 Type II review before contract execution.`,
    yaml: `id: POL-VND-011
version: 1.1.0
vendor_intake:
  applies_to_tiers: [1]
  required: [questionnaire, soc2_type2]
  decision_sla_days: 21`,
  },
  {
    id: "POL-LOG-018",
    title: "Audit Log Immutability",
    version: "1.0.3",
    status: "anchored",
    weight: 76,
    impact: "High",
    likelihood: "Frequent",
    categories: ["Operational", "Compliance"],
    owner: "Internal Audit",
    lastAnchor: "2026-05-16T08:44:00Z",
    hash: "6a2f8c1d4b9e7f3a5c8d2b1e6f9c4a7d3b8e1f5c",
    hooks: [
      { platform: "AWS_Config", ref: "arn:aws:config:.../cloudtrail-write-once", status: "compliant" },
    ],
    approvals: [{ stage: "Audit Sign-off", approver: "audit@co.com", type: "User", cond: "All_Approve" }],
    text: `All audit logs must be written to immutable storage within five (5) minutes of generation and retained for a minimum of seven (7) years.`,
    yaml: `id: POL-LOG-018
version: 1.0.3
audit_log:
  write_immutable_within_minutes: 5
  retention_years: 7`,
  },
];

export const STATUS_META = {
  anchored: { label: "Anchored",  color: "ok",    glyph: "◆",  desc: "Text and YAML hashes agree." },
  adrift:   { label: "Adrift",    color: "drift", glyph: "↯",  desc: "Hashes diverged; re-anchor needed." },
  gap:      { label: "Gap",       color: "warn",  glyph: "◌",  desc: "Required workflow or hook missing." },
  conflict: { label: "Collision", color: "crit",  glyph: "✕",  desc: "Conflicts with another policy." },
  pending:  { label: "Pending",   color: "info",  glyph: "○",  desc: "Awaiting initial anchor." },
};

export const LEDGER = [
  { block: 482, ts: "2026-05-19T14:21:00Z", policy: "POL-ACCESS-014", action: "drift_detected", actor: "system",   note: "Text edited; YAML untouched." },
  { block: 481, ts: "2026-05-18T11:42:00Z", policy: "POL-DB-001",     action: "re-anchor",      actor: "j.okafor", note: "Rotated to AES-256-GCM." },
  { block: 480, ts: "2026-05-17T13:22:00Z", policy: "POL-SOX-003",    action: "approval",       actor: "cab_chair",note: "CAB sign-off block #2026-Q2-014." },
  { block: 479, ts: "2026-05-16T08:44:00Z", policy: "POL-LOG-018",    action: "re-anchor",      actor: "audit@co", note: "Retention bumped 5→7 years." },
  { block: 478, ts: "2026-05-15T10:15:00Z", policy: "POL-PII-031",    action: "re-anchor",      actor: "dpo@co",   note: "Quarterly review pass." },
  { block: 477, ts: "2026-05-14T17:08:00Z", policy: "POL-IR-009",     action: "conflict_flag",  actor: "brain",    note: "Collision with POL-DATA-007 detected." },
  { block: 476, ts: "2026-05-12T09:30:00Z", policy: "POL-DATA-007",   action: "re-anchor",      actor: "dpo@co",   note: "Added eu-central-1 to permitted_regions." },
  { block: 475, ts: "2026-05-08T19:00:00Z", policy: "POL-IR-009",     action: "version_bump",   actor: "secops",   note: "2.2.0 → 2.3.0; ack_minutes 30→15." },
  { block: 474, ts: "2026-05-04T12:11:00Z", policy: "POL-CICD-022",   action: "gap_flag",       actor: "brain",    note: "Missing approval_workflow_id." },
  { block: 473, ts: "2026-05-01T16:44:00Z", policy: "POL-CICD-022",   action: "create",         actor: "devsecops",note: "Initial anchor; v1.0.0." },
];

export const PIPELINES = [
  {
    id: "build-prod-payments",
    repo: "co/payments-service",
    sha: "a8f3c91",
    branch: "main",
    actor: "j.okafor",
    triggered: "8m ago",
    state: "blocked",
    duration: "2m 14s",
    checks: [
      { policy: "POL-DB-001",     status: "pass", weight: 85 },
      { policy: "POL-CICD-022",   status: "pass", weight: 65 },
      { policy: "POL-ACCESS-014", status: "fail", weight: 92, why: "Break-glass session active without VP sign-off." },
      { policy: "POL-SOX-003",    status: "pending", weight: 88, why: "CAB block #2026-Q2-014 not yet attested." },
    ],
  },
  {
    id: "build-prod-ledger-api",
    repo: "co/ledger-api",
    sha: "1e02d7b",
    branch: "main",
    actor: "l.rivera",
    triggered: "26m ago",
    state: "warn",
    duration: "1m 48s",
    checks: [
      { policy: "POL-DB-001",   status: "pass", weight: 85 },
      { policy: "POL-PII-031",  status: "pass", weight: 71 },
      { policy: "POL-LOG-018",  status: "warn", weight: 76, why: "Log retention bucket lifecycle reduced to 5y." },
      { policy: "POL-DATA-007", status: "pass", weight: 78 },
    ],
  },
  {
    id: "deploy-prod-mobile-api",
    repo: "co/mobile-api",
    sha: "9c4ae22",
    branch: "release/v4.2",
    actor: "release-bot",
    triggered: "1h 12m ago",
    state: "pass",
    duration: "3m 02s",
    checks: [
      { policy: "POL-DB-001",  status: "pass", weight: 85 },
      { policy: "POL-PII-031", status: "pass", weight: 71 },
      { policy: "POL-SOX-003", status: "pass", weight: 88 },
      { policy: "POL-LOG-018", status: "pass", weight: 76 },
    ],
  },
  {
    id: "build-staging-recon",
    repo: "co/recon-jobs",
    sha: "4f7b110",
    branch: "feat/quarterly-rollup",
    actor: "m.chen",
    triggered: "2h 04m ago",
    state: "pass",
    duration: "0m 51s",
    checks: [
      { policy: "POL-DB-001",  status: "pass", weight: 85 },
      { policy: "POL-LOG-018", status: "pass", weight: 76 },
    ],
  },
];

export const INGEST_RUNS = [
  { name: "ISO-27001 Annex A 8.24.pdf",   pages: 4,  stage: 4, rules: 12, gaps: 2, conflicts: 0, ts: "2026-05-19T09:14:00Z" },
  { name: "EU AI Act — Article 9.pdf",    pages: 6,  stage: 3, rules: 18, gaps: 1, conflicts: 1, ts: "2026-05-18T16:02:00Z" },
  { name: "Vendor MSA — Acme v3.pdf",     pages: 22, stage: 2, rules: 31, gaps: 4, conflicts: 0, ts: "2026-05-18T11:30:00Z" },
  { name: "Internal — IR Runbook 2026.pdf",pages: 9, stage: 4, rules: 7,  gaps: 0, conflicts: 0, ts: "2026-05-17T08:21:00Z" },
];
