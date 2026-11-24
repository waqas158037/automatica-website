"use client";

import { useEffect } from "react";
import dynamic from "next/dynamic";
import { useUI } from "@/lib/store";

const Experience = dynamic(() => import("./Experience"), { ssr: false, loading: () => null });

/**
 * Premium static backdrop for devices without WebGL
 * motion. All content remains fully readable and navigable.
 */
function StaticBackdrop() {
  return (
    <div className="fallback-bg pointer-events-none fixed inset-0 z-0" aria-hidden>
      <svg className="absolute bottom-0 left-1/2 h-[78vh] -translate-x-1/2 opacity-70" viewBox="0 0 600 520" fill="none">
        <defs>
          <linearGradient id="fb-light" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0" stopColor="#cfe0ff" stopOpacity=".75" />
            <stop offset="1" stopColor="#3d7bff" stopOpacity=".08" />
          </linearGradient>
          <linearGradient id="fb-glass" x1="0" x2="1" y1="0" y2="1">
            <stop offset="0" stopColor="#ffffff" stopOpacity=".14" />
            <stop offset=".5" stopColor="#9fb6d9" stopOpacity=".04" />
            <stop offset="1" stopColor="#ffffff" stopOpacity=".1" />
          </linearGradient>
        </defs>
        <rect x="230" y="70" width="140" height="450" fill="url(#fb-light)" />
        <rect x="60" y="40" width="480" height="26" fill="#9aa3ad" />
        <rect x="292" y="66" width="16" height="5" fill="#6aa0ff" />
        {[80, 160, 370, 450].map((x) => (
          <rect key={x} x={x} y="72" width="78" height="448" fill="url(#fb-glass)" stroke="#c9d3e0" strokeOpacity=".45" />
        ))}
        <rect x="56" y="516" width="488" height="4" fill="#3a404a" />
      </svg>
    </div>
  );
}

export function ExperienceGate() {
  const webgl = useUI((s) => s.webgl);
  const isStatic = webgl === false;

  useEffect(() => {
    document.documentElement.classList.toggle("static-mode", isStatic);
  }, [isStatic]);

  if (webgl === null) return null;
  return isStatic ? <StaticBackdrop /> : <Experience />;
}
