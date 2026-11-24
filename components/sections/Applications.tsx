"use client";

import { useEffect, useRef, useState } from "react";
import { SceneSection } from "./SceneSection";
import { useReveal } from "@/lib/useReveal";
import { appIndexAt, SCENE } from "@/lib/scenes";
import { scrollState } from "@/lib/store";

const APPS = [
  { title: "Shopping Malls", text: "Automatic glass entrances." },
  { title: "Corporate Offices", text: "Modern automatic access." },
  { title: "Retail & Commercial Spaces", text: "High-traffic entrances." },
  { title: "Warehouses", text: "Industrial shutters." },
  { title: "Factories", text: "Vehicle access systems." },
  { title: "Commercial Buildings", text: "Automated entrances." },
];

export function Applications() {
  const ref = useRef<HTMLElement>(null);
  const [active, setActive] = useState(0);
  useReveal(ref, { inAt: 0.08, outAt: 0.78 });

  useEffect(() => {
    let raf = 0;
    const tick = () => {
      const i = appIndexAt(scrollState.p);
      setActive((a) => (a === i ? a : i));
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <SceneSection ref={ref} scene={SCENE.applications} id="applications" height="h-[340vh] md:h-[420vh]" anchorOffset={0.08} labelledBy="apps-title" innerClassName="items-end md:items-center">
      <div className="mx-auto w-full max-w-[1440px] px-4 pb-8 md:px-10 md:pb-0">
        <div data-panel className="glass-panel max-w-[460px] rounded-2xl p-6 md:p-9">
          <p data-reveal className="eyebrow !text-glow">
            Applications
          </p>
          <h2 id="apps-title" data-reveal className="display mt-4 text-[38px] md:text-[54px]">
            Built for real spaces.
          </h2>
          <ol data-reveal className="mt-6 flex flex-col md:mt-8">
            {APPS.map((a, i) => {
              const on = i === active;
              return (
                <li key={a.title} className="border-t border-white/10 first:border-t-0" aria-current={on ? "true" : undefined}>
                  <div className={`flex items-baseline gap-4 py-2.5 transition-all duration-500 md:py-3 ${on ? "opacity-100" : "opacity-40"}`}>
                    <span className={`text-[10px] font-bold tracking-[0.2em] ${on ? "text-glow" : "text-mist"}`}>{String(i + 1).padStart(2, "0")}</span>
                    <div className="flex-1">
                      <h3 className="text-[15px] font-bold uppercase tracking-[0.08em] md:text-[17px]">{a.title}</h3>
                      <p
                        className="overflow-hidden text-[13px] text-silver/80 transition-all duration-500"
                        style={{ maxHeight: on ? 24 : 0, opacity: on ? 1 : 0 }}
                      >
                        {a.text}
                      </p>
                    </div>
                    <span className={`h-1.5 w-1.5 rounded-full transition-all duration-500 ${on ? "bg-glow shadow-[0_0_10px_#4d8bff]" : "bg-white/20"}`} />
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
