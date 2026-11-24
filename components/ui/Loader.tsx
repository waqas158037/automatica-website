"use client";

import { useEffect, useState } from "react";
import { Logo } from "./Logo";
import { useUI } from "@/lib/store";

const MIN_MS = 1100;
const MAX_MS = 7000;

/** Brief branded loading screen; never holds the visitor longer than needed. */
export function Loader() {
  const ready = useUI((s) => s.ready);
  const webgl = useUI((s) => s.webgl);
  const [minDone, setMinDone] = useState(false);
  const [timedOut, setTimedOut] = useState(false);
  const [gone, setGone] = useState(false);
  const [sim, setSim] = useState(8);

  useEffect(() => {
    const a = setTimeout(() => setMinDone(true), MIN_MS);
    const b = setTimeout(() => setTimedOut(true), MAX_MS);
    const i = setInterval(() => setSim((s) => Math.min(92, s + (92 - s) * 0.12)), 120);
    return () => {
      clearTimeout(a);
      clearTimeout(b);
      clearInterval(i);
    };
  }, []);

  const done = (ready || webgl === false || timedOut) && minDone;
  useEffect(() => {
    if (!done) return;
    const t = setTimeout(() => setGone(true), 900);
    return () => clearTimeout(t);
  }, [done]);

  if (gone) return null;
  const pct = done ? 100 : ready ? 96 : sim;
  return (
    <div
      className="fixed inset-0 z-[80] grid place-items-center bg-ink transition-opacity duration-700"
      style={{ opacity: done ? 0 : 1, pointerEvents: done ? "none" : "auto" }}
      role="status"
      aria-live="polite"
    >
      <div className="pointer-events-none absolute inset-0 [background:radial-gradient(40%_35%_at_50%_55%,rgba(11,94,215,0.22),transparent_70%)]" />
      <div className="relative flex flex-col items-center gap-8">
        <Logo className="h-14 md:h-16" priority />
        <div className="loader-bar">
          <span style={{ transform: `scaleX(${pct / 100})` }} />
        </div>
        <p className="eyebrow !text-[10px] !tracking-[0.42em] text-[#8ea3c4]">Initializing automation…</p>
      </div>
    </div>
  );
}
