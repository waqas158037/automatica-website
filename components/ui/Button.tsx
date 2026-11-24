"use client";

import { useRef, type MouseEvent, type ReactNode } from "react";
import { scrollToTarget } from "@/components/providers/SmoothScroll";
import { ui } from "@/lib/store";

type Props = {
  children: ReactNode;
  href?: string;
  variant?: "glass" | "solid" | "ghost";
  arrow?: boolean;
  type?: "button" | "submit";
  className?: string;
  onClick?: () => void;
  disabled?: boolean;
};

/** Magnetic glass button. In-page hashes scroll smoothly; mailto/external links behave normally. */
export function Button({ children, href, variant = "glass", arrow = true, type = "button", className = "", onClick, disabled }: Props) {
  const ref = useRef<HTMLElement>(null);

  const move = (e: MouseEvent) => {
    const el = ref.current;
    if (!el || !window.matchMedia("(pointer: fine)").matches) return;
    const r = el.getBoundingClientRect();
    const x = (e.clientX - r.left - r.width / 2) * 0.18;
    const y = (e.clientY - r.top - r.height / 2) * 0.28;
    el.style.transform = `translate3d(${x}px, ${y}px, 0)`;
  };
  const leave = () => {
    const el = ref.current;
    if (el) {
      el.style.transition = "transform 0.6s cubic-bezier(0.16,1,0.3,1), border-color 0.5s, box-shadow 0.5s";
      el.style.transform = "";
      window.setTimeout(() => {
        el.style.transition = "";
      }, 600);
    }
    ui.set({ cursor: "default" });
  };
  const enter = () => ui.set({ cursor: "hover" });

  const cls = `btn ${variant === "solid" ? "btn--solid" : variant === "ghost" ? "btn--ghost" : ""} ${className}`;
  const content = (
    <>
      <span>{children}</span>
      {arrow && (
        <svg className="btn-arrow" width="16" height="10" viewBox="0 0 16 10" fill="none" aria-hidden>
          <path d="M0 5h14M10 1l4 4-4 4" stroke="currentColor" strokeWidth="1.4" />
        </svg>
      )}
    </>
  );

  if (href) {
    const internal = href.startsWith("#");
    return (
      <a
        ref={ref as React.RefObject<HTMLAnchorElement>}
        href={href}
        className={cls}
        onMouseMove={move}
        onMouseEnter={enter}
        onMouseLeave={leave}
        onClick={(e) => {
          if (internal) {
            e.preventDefault();
            scrollToTarget(href);
          }
          onClick?.();
        }}
      >
        {content}
      </a>
    );
  }
  return (
    <button
      ref={ref as React.RefObject<HTMLButtonElement>}
      type={type}
      className={cls}
      onMouseMove={move}
      onMouseEnter={enter}
      onMouseLeave={leave}
      onClick={onClick}
      disabled={disabled}
    >
      {content}
    </button>
  );
}
