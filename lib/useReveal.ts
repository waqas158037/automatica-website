"use client";

import { useEffect, useRef, type RefObject } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export type RevealOptions = {
  /** Local section progress (0..1) at which elements finish revealing. */
  inAt?: number;
  /** Local progress at which they start fading out; omit to keep visible. */
  outAt?: number | null;
  stagger?: number;
  /** Seconds the animation takes to catch up with the scroll (higher = smoother, more gliding). */
  scrub?: number;
  /** Extra timeline choreography (timeline length is normalised to 1). */
  extend?: (tl: gsap.core.Timeline, q: (sel: string) => Element[]) => void;
};

/**
 * Scroll-scrubbed reveal for `[data-reveal]` children of a story section.
 * Timeline time 0..1 equals the section's scroll progress (top/top → bottom/top),
 * matching the 3D scene coordinate.
 */
export function useReveal(ref: RefObject<HTMLElement | null>, { inAt = 0.16, outAt = 0.56, stagger = 0.025, scrub = 0.5, extend }: RevealOptions = {}) {
  const extendRef = useRef(extend);
  extendRef.current = extend;
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    // Reveals are scrubbed by the visitor's own scroll (nothing autoplays), so they stay on
    // under reduced motion; only the 3D story becomes static when WebGL is unavailable.
    if (document.documentElement.classList.contains("static-mode")) return;
    const q = gsap.utils.selector(el);
    const ctx = gsap.context(() => {
      const items = q("[data-reveal]");
      const tl = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: { trigger: el, start: "top top", end: "bottom top", scrub },
      });
      tl.to({}, { duration: 1 }, 0);
      if (items.length) {
        const dur = Math.max(0.04, inAt * 0.45);
        gsap.set(items, { autoAlpha: 0, y: 36, filter: "blur(10px)" });
        tl.to(items, { autoAlpha: 1, y: 0, filter: "blur(0px)", duration: dur, stagger, ease: "power2.out" }, Math.max(0, inAt - dur - stagger * items.length));
        if (outAt != null) tl.to(items, { autoAlpha: 0, y: -24, filter: "blur(6px)", duration: 0.06, stagger: stagger * 0.4, ease: "power1.in" }, outAt);
      }
      const panels = q("[data-panel]");
      if (panels.length) {
        gsap.set(panels, { autoAlpha: 0, y: 30 });
        tl.to(panels, { autoAlpha: 1, y: 0, duration: 0.08, ease: "power2.out" }, Math.max(0, inAt - 0.14));
        if (outAt != null) tl.to(panels, { autoAlpha: 0, y: -20, duration: 0.07, ease: "power1.in" }, outAt + 0.02);
      }
      extendRef.current?.(tl, q);
    }, el);
    return () => ctx.revert();
  }, [ref, inAt, outAt, stagger, scrub]);
}
