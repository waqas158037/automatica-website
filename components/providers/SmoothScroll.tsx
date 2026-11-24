"use client";

import { useEffect, type ReactNode } from "react";
import Lenis from "lenis";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { measureScenes, progressAt, scrollState, syncScroll, ui } from "@/lib/store";
import { detectTier, hasWebGL, prefersReducedMotion } from "@/lib/device";

gsap.registerPlugin(ScrollTrigger);

let lenis: Lenis | null = null;

/** Scroll to an in-page anchor. Story sections land slightly inside so their text is revealed. */
export function scrollToTarget(hash: string) {
  const el = hash === "#top" ? document.body : document.querySelector<HTMLElement>(hash);
  if (!el) return;
  const offsetRatio = Number(el.dataset.anchorOffset ?? 0);
  const top = hash === "#top" ? 0 : el.getBoundingClientRect().top + window.scrollY + el.offsetHeight * offsetRatio;
  const distance = Math.abs(top - window.scrollY);
  // Very long jumps would fly the camera through every scene — cut instead.
  const immediate = distance > window.innerHeight * 6;
  if (lenis) lenis.scrollTo(top, { immediate, duration: 1.6, easing: (t) => 1 - Math.pow(1 - t, 4) });
  else window.scrollTo({ top, behavior: immediate || prefersReducedMotion() ? "auto" : "smooth" });
}

export function SmoothScroll({ children }: { children: ReactNode }) {
  useEffect(() => {
    const reduced = prefersReducedMotion();
    ui.set({ reducedMotion: reduced, tier: detectTier(), webgl: hasWebGL() });
    if (new URLSearchParams(location.search).has("debug")) {
      (window as unknown as { __automatica?: unknown }).__automatica = { scrollState, ui, ScrollTrigger, progressAt };
    }

    if (!reduced) {
      lenis = new Lenis({ lerp: 0.085, wheelMultiplier: 0.9, smoothWheel: true });
      lenis.on("scroll", ScrollTrigger.update);
      const raf = (time: number) => lenis?.raf(time * 1000);
      gsap.ticker.add(raf);
      gsap.ticker.lagSmoothing(0);
      (window as unknown as { __lenis?: Lenis }).__lenis = lenis;
      // Freeze page scroll while the full-screen menu is open.
      const unsub = ui.subscribe(() => (ui.get().menuOpen ? lenis?.stop() : lenis?.start()));
      return () => {
        unsub();
        gsap.ticker.remove(raf);
        lenis?.destroy();
        lenis = null;
      };
    }
  }, []);

  // Map scroll position to the continuous scene coordinate p (see lib/store.ts).
  useEffect(() => {
    const remeasure = () => {
      measureScenes();
      syncScroll();
    };
    remeasure();
    const onLoad = () => ScrollTrigger.refresh();
    ScrollTrigger.addEventListener("refresh", remeasure);
    window.addEventListener("scroll", syncScroll, { passive: true });
    window.addEventListener("resize", remeasure);
    window.addEventListener("load", onLoad);
    document.fonts?.ready.then(() => ScrollTrigger.refresh());
    return () => {
      ScrollTrigger.removeEventListener("refresh", remeasure);
      window.removeEventListener("scroll", syncScroll);
      window.removeEventListener("resize", remeasure);
      window.removeEventListener("load", onLoad);
    };
  }, []);

  return <>{children}</>;
}
