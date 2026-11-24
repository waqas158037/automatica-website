import { useSyncExternalStore } from "react";

/**
 * Hot-path scroll state. Mutated directly (no React re-render) and read inside
 * animation frames. `p` is the continuous scene coordinate: sceneIndex + localProgress.
 */
export const scrollState = {
  p: 0,
  /** Damped copy of p used by the 3D scene. */
  smooth: 0,
};

/** Document-space bounds of each `[data-scene]` section, re-measured on layout changes. */
type SceneBound = { index: number; top: number; height: number };
let sceneBounds: SceneBound[] = [];

export function measureScenes() {
  if (typeof document === "undefined") return;
  const y = window.scrollY;
  sceneBounds = Array.from(document.querySelectorAll<HTMLElement>("[data-scene]"))
    .map((el) => ({ index: Number(el.dataset.scene), top: el.getBoundingClientRect().top + y, height: el.offsetHeight }))
    .sort((a, b) => a.top - b.top);
}

/**
 * Scene coordinate for a scroll position: index + progress through that section
 * (top of section at viewport top → bottom of section at viewport top).
 * Pure read of window.scrollY, so it works with native scroll, Lenis, anchors and keyboard.
 */
export function progressAt(y: number) {
  if (!sceneBounds.length) return 0;
  let p = 0;
  for (const b of sceneBounds) {
    if (y < b.top) break;
    p = b.index + Math.min(1, (y - b.top) / Math.max(1, b.height));
  }
  return p;
}

export function syncScroll() {
  scrollState.p = progressAt(window.scrollY);
}

export type CursorMode = "default" | "hover" | "explore";
export type QualityTier = "high" | "medium" | "low";

type UIState = {
  ready: boolean;
  webgl: boolean | null;
  reducedMotion: boolean;
  tier: QualityTier;
  menuOpen: boolean;
  cursor: CursorMode;
};

let state: UIState = {
  ready: false,
  webgl: null,
  reducedMotion: false,
  tier: "high",
  menuOpen: false,
  cursor: "default",
};
const listeners = new Set<() => void>();

export const ui = {
  get: () => state,
  set(patch: Partial<UIState>) {
    let changed = false;
    for (const k in patch) {
      const key = k as keyof UIState;
      if (state[key] !== patch[key]) changed = true;
    }
    if (!changed) return;
    state = { ...state, ...patch };
    listeners.forEach((l) => l());
  },
  subscribe(l: () => void) {
    listeners.add(l);
    return () => listeners.delete(l);
  },
};

const serverState = state;
export function useUI<T>(selector: (s: UIState) => T): T {
  return useSyncExternalStore(
    ui.subscribe,
    () => selector(state),
    () => selector(serverState),
  );
}
