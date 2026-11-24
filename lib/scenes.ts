/**
 * Scroll choreography.
 *
 * Every story section in the DOM carries `data-scene={index}`. While a section
 * scrolls from "top hits viewport top" to "bottom hits viewport top", the scene
 * coordinate `p` runs from `index` to `index + 1`. Text panels are visible in
 * roughly the first 60% of each section; the remaining scroll is used for
 * camera travel into the next scene.
 */
import { clamp, easeDoor, range, smoothstep, window4 } from "./math";

export const SCENE = {
  hero: 0,
  intro: 1,
  solGlass: 2,
  solSliding: 3,
  solShutter: 4,
  solVehicle: 5,
  solInstall: 6,
  applications: 7,
  why: 8,
  process: 9,
  final: 10,
  contact: 11,
} as const;

/** World offsets of each environment (they are separated in space, joined by camera moves + veils). */
export const ENV_OFFSET = {
  entrance: [0, 0, 0],
  warehouse: [0, 0, -400],
  blueprint: [0, 0, -800],
  city: [0, 0, -1200],
  final: [0, 0, -1600],
} as const;
export type EnvId = keyof typeof ENV_OFFSET;

/** Environment switch points (each hidden behind a veil). */
const ENV_SWITCHES: [number, EnvId][] = [
  [3.8, "warehouse"],
  [5.8, "blueprint"],
  [6.8, "city"],
  [8.8, "final"],
];
export function envAt(p: number): EnvId {
  let env: EnvId = "entrance";
  for (const [at, id] of ENV_SWITCHES) if (p >= at) env = id;
  return env;
}

/** Fade-through-dark windows [start, peak, end] used for scene cuts. */
export const VEILS: [number, number, number][] = [
  [3.6, 3.8, 3.98],
  [5.6, 5.8, 5.98],
  [6.6, 6.8, 6.98],
  [8.6, 8.8, 8.98],
];
export function veilAt(p: number) {
  let v = 0;
  for (const [a, m, b] of VEILS) {
    if (p >= a && p <= b) v = Math.max(v, p < m ? smoothstep(p, a, m) : 1 - smoothstep(p, m + 0.04, b));
  }
  return v;
}

type V3 = [number, number, number];
export type CameraKey = { p: number; pos: V3; look: V3; fov?: number };

const W = ENV_OFFSET.warehouse[2];
const B = ENV_OFFSET.blueprint[2];
const C = ENV_OFFSET.city[2];
const F = ENV_OFFSET.final[2];

function orbit(p0: number, p1: number, steps: number, a0: number, a1: number, r: number, h: number): CameraKey[] {
  const keys: CameraKey[] = [];
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const a = a0 + (a1 - a0) * t;
    keys.push({ p: p0 + (p1 - p0) * t, pos: [Math.sin(a) * r, h, C + Math.cos(a) * r], look: [0, 2, C] });
  }
  return keys;
}

export const CAMERA_KEYS: CameraKey[] = [
  // 00 — Approach → detect → open → enter
  { p: 0.0, pos: [0, 1.8, 26], look: [0, 2.3, 0] },
  { p: 0.2, pos: [0, 1.72, 14], look: [0, 2.1, 0] },
  { p: 0.4, pos: [0, 1.66, 7.2], look: [0, 1.9, 0] },
  { p: 0.55, pos: [0, 1.66, 5.6], look: [0, 1.75, -6] },
  { p: 0.75, pos: [0, 1.66, -2.5], look: [0, 1.95, -24] },
  { p: 1.0, pos: [0, 1.7, -6.5], look: [0, 2.7, -45] },
  // 01 — Introduction (interior, logo wall)
  { p: 1.55, pos: [0, 1.75, -10.5], look: [0, 2.9, -45] },
  // 02 — Automatic glass doors (display A, left)
  { p: 2.0, pos: [-0.6, 1.66, -13.6], look: [-3.4, 1.55, -20.5] },
  { p: 2.3, pos: [-2.0, 1.6, -15.2], look: [-3.9, 1.6, -21] },
  { p: 2.6, pos: [-1.8, 1.7, -15.6], look: [-4.0, 1.75, -21] },
  // 03 — Sliding doors (display B, right)
  { p: 3.0, pos: [1.0, 1.66, -26.6], look: [3.6, 1.55, -32.6] },
  { p: 3.3, pos: [2.0, 1.6, -27.4], look: [4.0, 1.6, -33] },
  { p: 3.6, pos: [2.3, 1.6, -28.0], look: [4.2, 1.6, -33.4] },
  { p: 3.79, pos: [2.6, 1.6, -28.6], look: [4.4, 1.6, -33.8] },
  // 04 — Industrial shutter (front)
  { p: 3.81, pos: [-1.5, 2.3, W + 30], look: [1.5, 3.6, W] },
  { p: 4.0, pos: [-1.2, 2.1, W + 22], look: [1.6, 3.4, W] },
  { p: 4.3, pos: [-0.8, 2.0, W + 16.5], look: [1.8, 3.2, W] },
  { p: 4.6, pos: [-0.6, 1.9, W + 13.5], look: [1.6, 2.8, W - 6] },
  // 05 — Vehicle access (three-quarter side view)
  { p: 5.0, pos: [17, 4.6, W + 32], look: [4, 2.0, W + 12] },
  { p: 5.3, pos: [16, 4.2, W + 24], look: [4, 2.2, W + 7] },
  { p: 5.6, pos: [13.5, 3.6, W + 16], look: [3, 2.6, W + 1] },
  { p: 5.79, pos: [11.5, 3.2, W + 12], look: [2, 2.6, W - 3] },
  // 06 — Installation & integration (blueprint)
  { p: 5.81, pos: [0, 1.9, B + 12], look: [1.4, 1.6, B] },
  { p: 6.0, pos: [0, 1.9, B + 9.5], look: [1.6, 1.6, B] },
  { p: 6.3, pos: [-2.6, 2.5, B + 8.6], look: [1.4, 1.7, B] },
  { p: 6.6, pos: [2.0, 2.2, B + 8.8], look: [2.4, 1.7, B] },
  { p: 6.79, pos: [3.0, 2.3, B + 9.4], look: [2.4, 1.7, B] },
  // 07 — Applications (aerial orbit over the city)
  { p: 6.81, pos: [0, 70, C + 95], look: [0, 0, C] },
  ...orbit(7.0, 7.75, 6, -0.25, 1.85, 78, 46),
  // 08 — Why Automatica (descend into the avenue)
  { p: 8.05, pos: [8, 14, C + 76], look: [0, 4, C] },
  { p: 8.3, pos: [0, 2.0, C + 62], look: [0, 6, C - 20] },
  { p: 8.6, pos: [0, 1.8, C + 34], look: [0, 6, C - 60] },
  { p: 8.79, pos: [0, 1.8, C + 22], look: [0, 6, C - 70] },
  // 09 — Process (walk the illuminated approach)
  { p: 8.81, pos: [0, 1.75, F + 98], look: [0, 2.2, F] },
  { p: 9.0, pos: [0, 1.72, F + 92], look: [0, 2.2, F] },
  { p: 9.6, pos: [0, 1.72, F + 30], look: [0, 2.2, F] },
  // 10 — Final entrance
  { p: 10.0, pos: [0, 1.7, F + 21], look: [0, 2.1, F] },
  { p: 10.15, pos: [0, 1.68, F + 9.5], look: [0, 1.95, F] },
  { p: 10.3, pos: [0, 1.68, F + 6.5], look: [0, 1.8, F - 6] },
  { p: 10.45, pos: [0, 1.68, F - 1.5], look: [0, 1.85, F - 12] },
  { p: 10.7, pos: [0, 1.7, F - 3.5], look: [0, 1.9, F - 14] },
  { p: 12.0, pos: [0, 1.7, F - 6], look: [0, 1.9, F - 14] },
];

/* ---------- Object state as a function of p ---------- */

export const heroDoorOpen = (p: number) => easeDoor(range(p, 0.4, 0.55)) * (1 - easeDoor(range(p, 1.25, 1.45)));
export const heroSensor = (p: number) => window4(p, 0.2, 0.27, 0.6, 0.7);

export const displayAOpen = (p: number) => easeDoor(range(p, 2.22, 2.4)) * (1 - easeDoor(range(p, 2.72, 2.85)));
export const showcaseShutterOpen = (p: number) => easeDoor(range(p, 4.22, 4.52)) * (1 - easeDoor(range(p, 4.7, 4.92)));
export const vehicleShutterOpen = (p: number) => easeDoor(range(p, 5.42, 5.6));
export const shutterOpen = (p: number) => (p < 4.97 ? showcaseShutterOpen(p) : vehicleShutterOpen(p));
export const shutterSensor = (p: number) => Math.max(window4(p, 4.14, 4.2, 4.3, 4.38), window4(p, 5.34, 5.38, 5.66, 5.74));
/** Vehicle z (local to warehouse; facade at z=0, yard toward +z). */
export const vehicleZ = (p: number) => {
  const approach = easeDoor(range(p, 5.02, 5.4));
  const pass = range(p, 5.62, 5.95);
  return 62 - approach * 51 - pass * pass * 30;
};
export const blueprintMix = (p: number) => window4(p, 6.12, 6.26, 6.5, 6.6);
export const blueprintScan = (p: number) => range(p, 6.1, 6.3);
export const blueprintDoorOpen = (p: number) => easeDoor(range(p, 6.28, 6.42)) * (1 - easeDoor(range(p, 6.48, 6.58)));

export const APP_COUNT = 6;
export const appIndexAt = (p: number) => clamp(Math.floor(((p - SCENE.applications) - 0.05) / (0.7 / APP_COUNT)), 0, APP_COUNT - 1);

export const PROCESS_STEPS = 5;
/** Continuous 0..5 progress along the approach path (process steps). */
export const processProgress = (p: number) => range(p, 9.04, 9.6) * PROCESS_STEPS;

export const finalSensor = (p: number) => window4(p, 10.06, 10.12, 10.4, 10.48);
export const finalDoorOpen = (p: number) => easeDoor(range(p, 10.16, 10.3));
export const finalLight = (p: number) => smoothstep(p, 10.16, 10.45);
/** Smooth dim from the bright final room into the deep-navy contact backdrop. */
export const contactDim = (p: number) => smoothstep(p, 10.66, 10.98);

/** Stage indicator groups (progress rail). */
export const STAGES = [
  { label: "Entrance", from: 0, to: 2, target: "#top" },
  { label: "Solutions", from: 2, to: 7, target: "#solutions" },
  { label: "Applications", from: 7, to: 8, target: "#applications" },
  { label: "Process", from: 8, to: 10, target: "#about" },
  { label: "Contact", from: 10, to: 99, target: "#contact" },
] as const;
