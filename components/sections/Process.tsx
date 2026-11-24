"use client";

import { useEffect, useRef, useState } from "react";
import { SceneSection } from "./SceneSection";
import { useReveal } from "@/lib/useReveal";
import { processProgress, PROCESS_STEPS, SCENE } from "@/lib/scenes";
import { scrollState } from "@/lib/store";

const STEPS = [
  { title: "Consultation", text: "Understand the site and requirements." },
  { title: "Site Assessment", text: "Evaluate dimensions, traffic and installation requirements." },
  { title: "System Selection", text: "Select the appropriate automatic door or shutter solution." },
  { title: "Installation", text: "Professional installation at the required location." },
  { title: "Testing & Handover", text: "Ensure the system operates correctly before completion." },
];

export function Process() {
  const ref = useRef<HTMLElement>(null);
  const fill = useRef<HTMLSpanElement>(null);
  const [active, setActive] = useState(0);
  useReveal(ref, { inAt: 0.06, outAt: 0.66 });

  useEffect(() => {
    let raf = 0;
    const tick = () => {
      const pr = processProgress(scrollState.p);
      const i = Math.min(PROCESS_STEPS - 1, Math.floor(pr));
      setActive((a) => (a === i ? a : i));
      if (fill.current) fill.current.style.transform = `scaleY(${Math.min(1, pr / (PROCESS_STEPS - 0.5))})`;
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <SceneSection ref={ref} scene={SCENE.process} id="process" height="h-[300vh] md:h-[340vh]" anchorOffset={0.08} labelledBy="process-title" innerClassName="items-end md:items-center">
      <div className="mx-auto flex w-full max-w-[1440px] px-4 pb-8 md:justify-end md:px-10 md:pb-0">
        <div data-panel className="glass-panel w-full max-w-[460px] rounded-2xl p-6 md:p-9">
          <p data-reveal className="eyebrow !text-glow">
            Process
          </p>
          <h2 id="process-title" data-reveal className="display mt-4 text-[34px] md:text-[48px]">
            From entry to installation.
          </h2>
          <ol data-reveal className="relative mt-6 flex flex-col md:mt-8">
            <span className="absolute bottom-3 left-[5px] top-3 w-px bg-white/10" aria-hidden>
              <span ref={fill} className="block h-full w-px origin-top bg-gradient-to-b from-glow to-white" style={{ transform: "scaleY(0)" }} />
            </span>
            {STEPS.map((s, i) => {
              const on = i === active;
              const done = i < active;
              return (
                <li key={s.title} className="relative flex gap-5 py-2.5" aria-current={on ? "step" : undefined}>
                  <span
                    className={`relative z-10 mt-1.5 h-[11px] w-[11px] shrink-0 rounded-full border transition-all duration-500 ${
                      on ? "border-glow bg-glow shadow-[0_0_12px_#4d8bff]" : done ? "border-glow bg-[#0a1430]" : "border-white/25 bg-[#070b16]"
                    }`}
                  />
                  <div className={`transition-opacity duration-500 ${on ? "opacity-100" : done ? "opacity-60" : "opacity-35"}`}>
                    <h3 className="text-[14px] font-bold uppercase tracking-[0.12em] md:text-[15px]">
                      <span className="mr-2 text-glow">{String(i + 1).padStart(2, "0")}</span>
                      {s.title}
                    </h3>
                    <p className="overflow-hidden text-[13px] text-silver/80 transition-all duration-500" style={{ maxHeight: on ? 40 : 0, opacity: on ? 1 : 0 }}>
                      {s.text}
                    </p>
                  </div>
                </li>
              );
            })}
          </ol>
        </div>
      </div>
    </SceneSection>
  );
}
