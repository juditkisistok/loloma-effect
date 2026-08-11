export function clamp(v, a, b) {
  return Math.max(a, Math.min(b, v));
}

export function scrollProgressOf(el) {
  if (!el) return 0;
  const r = el.getBoundingClientRect();
  const denom = r.height - window.innerHeight;
  return clamp(-r.top / (denom || 1), 0, 1);
}

export function scrollProgressBetween(startEl, endEl) {
  if (!startEl || !endEl) return 0;
  const start = startEl.getBoundingClientRect();
  const end = endEl.getBoundingClientRect();
  const denom = end.bottom - start.top - window.innerHeight;
  return clamp(-start.top / (denom || 1), 0, 1);
}
