export function clamp(v, a, b) {
  return Math.max(a, Math.min(b, v));
}

export function scrollProgressOf(el) {
  if (!el) return 0;
  const r = el.getBoundingClientRect();
  const denom = r.height - window.innerHeight;
  return clamp(-r.top / (denom || 1), 0, 1);
}
