import type { QualityTier } from "./store";

export type QualityProfile = {
  tier: QualityTier;
  dpr: [number, number];
  antialias: boolean;
  reflector: boolean;
  reflectorResolution: number;
  transmission: boolean;
  particles: number;
  cityBlocks: number;
  labels: boolean;
};

export const QUALITY: Record<QualityTier, QualityProfile> = {
  high: { tier: "high", dpr: [1, 1.75], antialias: true, reflector: true, reflectorResolution: 768, transmission: true, particles: 260, cityBlocks: 220, labels: true },
  medium: { tier: "medium", dpr: [1, 1.25], antialias: true, reflector: false, reflectorResolution: 0, transmission: false, particles: 140, cityBlocks: 150, labels: true },
  low: { tier: "low", dpr: [0.75, 1], antialias: false, reflector: false, reflectorResolution: 0, transmission: false, particles: 50, cityBlocks: 80, labels: false },
};

/** Unmasked GPU renderer string (best effort). */
export function gpuRenderer(): string {
  try {
    const gl = document.createElement("canvas").getContext("webgl");
    if (!gl) return "";
    const ext = gl.getExtension("WEBGL_debug_renderer_info");
    return String(ext ? gl.getParameter(ext.UNMASKED_RENDERER_WEBGL) : gl.getParameter(gl.RENDERER));
  } catch {
    return "";
  }
}

export function detectTier(): QualityTier {
  if (typeof window === "undefined") return "high";
  const forced = forcedTier();
  if (forced) return forced;
  const w = window.innerWidth;
  const coarse = window.matchMedia("(pointer: coarse)").matches;
  const cores = navigator.hardwareConcurrency || 4;
  const mem = (navigator as Navigator & { deviceMemory?: number }).deviceMemory ?? 8;
  const gpu = gpuRenderer();
  // Software rasterisers and older integrated GPUs get the light path.
  if (/swiftshader|llvmpipe|software|basic render|(?<!U)HD Graphics( Family|\s[2-5]\d{2,3})?\b|Mali-[GT][0-7]\d\b|Adreno \(TM\) [3-5]/i.test(gpu)) return "low";
  if (w < 768 || (coarse && w < 1024)) return "low";
  if (/Intel/i.test(gpu) || w < 1200 || coarse || cores <= 4 || mem <= 4) return "medium";
  return "high";
}

/** `?quality=high|medium|low` pins the tier (QA); the runtime guard is then disabled. */
export function forcedTier(): QualityTier | null {
  if (typeof window === "undefined") return null;
  const q = new URLSearchParams(window.location.search).get("quality");
  return q === "high" || q === "medium" || q === "low" ? q : null;
}

export const lowerTier = (t: QualityTier): QualityTier => (t === "high" ? "medium" : "low");

export function hasWebGL(): boolean {
  try {
    const c = document.createElement("canvas");
    return !!(c.getContext("webgl2") || c.getContext("webgl"));
  } catch {
    return false;
  }
}

/** Honour the OS setting; `?motion=full` forces the full experience (QA / visitor opt-in). */
export const prefersReducedMotion = () => {
  if (typeof window === "undefined") return false;
  if (new URLSearchParams(window.location.search).get("motion") === "full") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
};
