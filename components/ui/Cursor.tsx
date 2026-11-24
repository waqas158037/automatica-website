"use client";

import { useEffect, useRef, useState } from "react";
import { ui } from "@/lib/store";

/** Small premium cursor (fine pointers only). Expands on controls, shows EXPLORE on 3D products. */
export function Cursor() {
  const el = useRef<HTMLDivElement>(null);
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const fine = window.matchMedia("(pointer: fine)").matches && !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    setEnabled(fine);
    if (!fine) return;
    document.documentElement.classList.add("has-cursor");
    let x = innerWidth / 2;
    let y = innerHeight / 2;
    let cx = x;
    let cy = y;
    let raf = 0;
    const move = (e: PointerEvent) => {
      x = e.clientX;
      y = e.clientY;
    };
    const over = (e: PointerEvent) => {
      const t = e.target as HTMLElement;
      const control = !!t.closest("a, button, select, [role=button]");
      if (control) ui.set({ cursor: "hover" });
      else if (ui.get().cursor === "hover") ui.set({ cursor: "default" });
    };
    const tick = () => {
      cx += (x - cx) * 0.22;
      cy += (y - cy) * 0.22;
      if (el.current) {
        el.current.style.transform = `translate3d(${cx}px, ${cy}px, 0)`;
        el.current.dataset.mode = ui.get().cursor;
      }
      raf = requestAnimationFrame(tick);
    };
    const hide = () => {
      if (el.current) el.current.style.opacity = "0";
    };
    const show = () => {
      if (el.current) el.current.style.opacity = "1";
    };
    addEventListener("pointermove", move, { passive: true });
    addEventListener("pointerover", over, { passive: true });
    document.addEventListener("mouseleave", hide);
    document.addEventListener("mouseenter", show);
    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      removeEventListener("pointermove", move);
      removeEventListener("pointerover", over);
      document.removeEventListener("mouseleave", hide);
      document.removeEventListener("mouseenter", show);
      document.documentElement.classList.remove("has-cursor");
    };
  }, []);

  if (!enabled) return null;
  return (
    <div ref={el} className="cursor" data-mode="default" aria-hidden>
      <span>EXPLORE</span>
    </div>
  );
}
