"use client";

import { useEffect, useRef } from "react";
import { SceneSection } from "./SceneSection";
import { Button } from "@/components/ui/Button";
import { useReveal } from "@/lib/useReveal";
import { scrollState } from "@/lib/store";
import { SCENE } from "@/lib/scenes";
import { SITE } from "@/lib/site";

const LINES = ["Automation that", "moves with you."];

/** Live door-system readout: STANDBY → DETECTED → OPENING → OPEN. */
function SensorHUD() {
  const status = useRef<HTMLSpanElement>(null);
  const bar = useRef<HTMLSpanElement>(null);
  const dot = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    let raf = 0;
    let last = "";
    const tick = () => {
      const p = scrollState.smooth;
      const s = p < 0.21 ? "Standby" : p < 0.4 ? "Presence detected" : p < 0.55 ? "Opening" : p < 1.25 ? "Open" : "Closed";
      if (s !== last && status.current) {
        status.current.textContent = s;
        last = s;
        dot.current?.setAttribute("data-on", p >= 0.21 && p < 1.25 ? "1" : "0");
      }
      if (bar.current) bar.current.style.transform = `scaleX(${Math.min(1, p / 0.75)})`;
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);
  return (
    <div className="glass-panel hidden w-[260px] rounded-xl p-4 md:block" data-hud aria-hidden>
      <div className="flex items-center justify-between">
        <span className="eyebrow !text-[9px]">Entrance · Door 01</span>
        <span ref={dot} className="h-1.5 w-1.5 rounded-full bg-white/30 transition-colors data-[on='1']:bg-glow data-[on='1']:shadow-[0_0_10px_#4d8bff]" />
      </div>
      <p className="mt-3 text-[13px] font-semibold uppercase tracking-[0.18em] text-white">
        <span ref={status}>Standby</span>
      </p>
      <div className="mt-3 h-px w-full bg-white/10">
        <span ref={bar} className="block h-px w-full origin-left bg-gradient-to-r from-glow to-white" style={{ transform: "scaleX(0)" }} />
      </div>
      <div className="mt-2 flex justify-between text-[9px] uppercase tracking-[0.24em] text-mist">
        <span>Approach</span>
        <span>Enter</span>
      </div>
    </div>
  );
}

export function Hero() {
  const ref = useRef<HTMLElement>(null);
  useReveal(ref, {
    inAt: 0.5,
    outAt: null,
    scrub: 1.6,
    extend: (tl, q) => {
      tl.to(q("[data-hint]"), { autoAlpha: 0, y: 20, duration: 0.08 }, 0.02);
      tl.to(q("[data-hud]"), { autoAlpha: 0, duration: 0.05 }, 0.84);
      // The door finishes opening at 0.55. Only after that does the whole block — heading,
      // supporting line and both buttons together — zoom in from small to its normal size,
      // slowly and smoothly over a long stretch of scroll.
      const copy = q("[data-hero-copy]");
      tl.fromTo(
        copy,
        { autoAlpha: 0, scale: 0.3, filter: "blur(8px)" },
        { autoAlpha: 1, scale: 1, filter: "blur(0px)", duration: 0.15, ease: "sine.out" },
        0.57,
      );
      tl.to(copy, { autoAlpha: 0, filter: "blur(8px)", duration: 0.04, ease: "sine.in" }, 0.76);
    },
  });

  return (
    <SceneSection ref={ref} scene={SCENE.hero} id="top" height="h-[480vh] md:h-[500vh]" anchorOffset={0} labelledBy="hero-title">
      <div className="relative mx-auto flex w-full max-w-[1440px] flex-col justify-end px-4 pb-10 md:px-10 md:pb-14">
        {/* Initial state: the building, the door, and an invitation to approach. */}
        <div data-hint className="absolute inset-x-0 bottom-10 flex flex-col items-center gap-4 md:bottom-14">
          <p className="eyebrow text-shadow-soft">{SITE.location}</p>
          <p className="text-center text-[12px] font-semibold uppercase tracking-[0.42em] text-white/80 text-shadow-soft">Scroll to approach</p>
          <span className="scroll-hint__line" aria-hidden />
        </div>

        <div data-hero-copy className="absolute inset-0 flex origin-center items-center justify-center px-4">
          {/* soft vignette keeps the copy legible over the bright doorway */}
          <div className="pointer-events-none absolute left-1/2 top-1/2 h-[70vh] w-[min(1100px,120vw)] -translate-x-1/2 -translate-y-1/2 [background:radial-gradient(closest-side,rgba(3,6,14,0.55),transparent)]" aria-hidden />
          <div className="relative flex max-w-3xl flex-col items-center text-center">
            <h1 id="hero-title" className="display text-shadow-soft text-[10vw] sm:text-[7vw] md:text-[5.2vw] xl:text-[76px]">
              {LINES.map((l) => (
                <span key={l} className="block pb-[0.04em]">
                  {l}
                </span>
              ))}
            </h1>
            <div data-hero-sub className="mt-5 flex max-w-xl flex-col items-center gap-7 md:mt-6">
              <p className="lede text-shadow-soft text-base md:text-lg">Automatic doors and industrial shutter solutions engineered for modern spaces.</p>
              <div className="flex flex-wrap justify-center gap-3">
              <Button href="#solutions" variant="solid">
                Explore Solutions
              </Button>
              <Button href="#contact">Request a Quote</Button>
              </div>
            </div>
          </div>
        </div>
        <div className="absolute bottom-10 right-4 md:bottom-14 md:right-10 xl:right-24">
          <SensorHUD />
        </div>
      </div>
    </SceneSection>
  );
}
