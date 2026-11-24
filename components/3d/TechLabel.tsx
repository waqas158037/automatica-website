"use client";

import { useMemo, useRef, type MutableRefObject } from "react";
import { Html } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";

type Props = {
  position: [number, number, number];
  title: string;
  detail?: string;
  getVisible: () => number;
  side?: "left" | "right";
};

/** Small blueprint-style annotation pinned to a point in 3D space. */
export function TechLabel({ position, title, detail, getVisible, side = "right" }: Props) {
  const el = useRef<HTMLDivElement>(null);
  const last = useRef(-1);
  // Portal into the fixed canvas container (the R3F event source is the tall page root).
  const gl = useThree((st) => st.gl);
  const portal = useMemo(() => ({ current: gl.domElement.parentElement as HTMLElement }) as MutableRefObject<HTMLElement>, [gl]);
  useFrame(() => {
    const v = Math.round(getVisible() * 100) / 100;
    if (v === last.current || !el.current) return;
    last.current = v;
    el.current.style.opacity = String(v);
    el.current.style.translate = `0 ${(1 - v) * 8}px`;
    el.current.style.visibility = v < 0.01 ? "hidden" : "visible";
  });
  return (
    <Html portal={portal} position={position} zIndexRange={[5, 0]} style={{ pointerEvents: "none" }}>
      <div ref={el} className={`tech-label ${side === "left" ? "tech-label--left" : ""}`} style={{ opacity: 0, visibility: "hidden" }} aria-hidden>
        <span className="tech-label__dot" />
        <span className="tech-label__line" />
        <span className="tech-label__text">
          <strong>{title}</strong>
          {detail && <em>{detail}</em>}
        </span>
      </div>
    </Html>
  );
}
