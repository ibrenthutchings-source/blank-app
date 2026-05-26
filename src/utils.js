export function relTime(iso) {
  const now = new Date("2026-05-21T12:00:00Z").getTime();
  const t = new Date(iso).getTime();
  const ms = now - t;
  const m = Math.floor(ms / 60000);
  if (m < 60) return m + "m ago";
  const h = Math.floor(m / 60);
  if (h < 24) return h + "h ago";
  const d = Math.floor(h / 24);
  return d + "d ago";
}
