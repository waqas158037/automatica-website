export const clamp = (v: number, min = 0, max = 1) => Math.min(max, Math.max(min, v));
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
/** 0 → 1 as v moves from a to b (clamped). */
export const range = (v: number, a: number, b: number) => clamp((v - a) / (b - a));
export const smoothstep = (v: number, a: number, b: number) => {
  const t = range(v, a, b);
  return t * t * (3 - 2 * t);
};
export const easeInOutCubic = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
export const easeOutExpo = (t: number) => (t >= 1 ? 1 : 1 - Math.pow(2, -10 * t));
/** Mechanical door easing: gentle start, firm travel, soft stop. */
export const easeDoor = (t: number) => {
  const c = clamp(t);
  return c * c * c * (c * (c * 6 - 15) + 10);
};
/** Frame-rate independent exponential damping. */
export const damp = (current: number, target: number, lambda: number, dt: number) =>
  lerp(current, target, 1 - Math.exp(-lambda * dt));
/** Rises 0→1 over [a,b], holds, falls 1→0 over [c,d]. */
export const window4 = (v: number, a: number, b: number, c: number, d: number) =>
  Math.min(smoothstep(v, a, b), 1 - smoothstep(v, c, d));
