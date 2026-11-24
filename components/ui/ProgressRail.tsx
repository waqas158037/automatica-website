"use client";

import { useEffect, useRef, useState } from "react";
import { STAGES } from "@/lib/scenes";
import { scrollState } from "@/lib/store";
import { scrollToTarget } from "@/components/providers/SmoothScroll";

/** Subtle vertical stage indicator (desktop). */
export function ProgressRail() {
  const [active, setActive] = useState(0);
  const fill = useRef<HTMLDivElement>(null);
  useEffect(() => {
    let raf = 0;
    const tick = () => {
      const p = scrollState.p;
      const idx = STAGES.findIndex((s) => p >= s.from && p < s.to);
      setActive((a) => (idx >= 0 && idx !== a ? idx : a));
      if (fill.current) fill.current.style.transform = `scaleY(${Math.min(1, p / 11)})`;
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <nav aria-label="Page progress" className="fixed right-6 top-1/2 z-30 hidden -translate-y-1/2 xl:block">
      <div className="relative flex flex-col gap-5 pr-5">
        <div className="absolute right-0 top-0 h-full w-px bg-white/10">
          <div ref={fill} className="h-full w-px origin-top bg-gradient-to-b from-glow to-white" style={{ transform: "scaleY(0)" }} />
        </div>
        {STAGES.map((s, i) => (
          <button
            key={s.label}
            onClick={() => scrollToTarget(s.target)}
            className={`flex flex-col items-end text-right transition-opacity duration-500 ${i === active ? "opacity-100" : "opacity-35 hover:opacity-70"}`}
            aria-current={i === active ? "step" : undefined}
          >
            <span className="text-[10px] font-bold tracking-[0.2em] text-glow">{String(i + 1).padStart(2, "0")}</span>
            <span className={`text-[9px] font-semibold uppercase tracking-[0.3em] ${i === active ? "text-white" : "text-mist"}`}>{s.label}</span>
          </button>
        ))}
      </div>
    </nav>
  );
}
