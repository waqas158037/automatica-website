"use client";

import { useRef, type ReactNode } from "react";
import { SceneSection } from "./SceneSection";
import { useReveal } from "@/lib/useReveal";
import { SCENE } from "@/lib/scenes";

const Icon = ({ children }: { children: ReactNode }) => (
  <svg width="28" height="28" viewBox="0 0 28 28" fill="none" stroke="currentColor" strokeWidth="1.2" aria-hidden className="text-glow">
    {children}
  </svg>
);

const BENEFITS = [
  {
    title: "Precision",
    text: "Systems designed for smooth and controlled movement.",
    icon: (
      <Icon>
        <circle cx="14" cy="14" r="10" />
        <circle cx="14" cy="14" r="3" />
        <path d="M14 1v6M14 21v6M1 14h6M21 14h6" />
      </Icon>
    ),
  },
  {
    title: "Reliability",
    text: "Solutions designed for demanding commercial and industrial environments.",
    icon: (
      <Icon>
        <path d="M14 2l10 4v7c0 6-4.3 10.6-10 13-5.7-2.4-10-7-10-13V6l10-4z" />
        <path d="M9.5 14l3 3 6-6" />
      </Icon>
    ),
  },
  {
    title: "Professional Installation",
    text: "Installation focused on proper fit, function and integration.",
    icon: (
      <Icon>
        <path d="M3 25h22M6 25V9h16v16M6 9l8-6 8 6" />
        <path d="M11 25v-9h6v9" />
      </Icon>
    ),
  },
  {
    title: "Modern Technology",
    text: "Automation designed around modern architectural and industrial requirements.",
    icon: (
      <Icon>
        <rect x="6" y="6" width="16" height="16" rx="2" />
        <rect x="11" y="11" width="6" height="6" />
        <path d="M10 2v4M14 2v4M18 2v4M10 22v4M14 22v4M18 22v4M2 10h4M2 14h4M2 18h4M22 10h4M22 14h4M22 18h4" />
      </Icon>
    ),
  },
  {
    title: "Tailored Solutions",
    text: "Solutions selected according to the requirements of each project.",
    icon: (
      <Icon>
        <path d="M4 7h12M20 7h4M4 14h4M12 14h12M4 21h14M22 21h2" />
        <circle cx="18" cy="7" r="2" />
        <circle cx="10" cy="14" r="2" />
        <circle cx="20" cy="21" r="2" />
      </Icon>
    ),
  },
];

export function WhyAutomatica() {
  const ref = useRef<HTMLElement>(null);
  useReveal(ref, { inAt: 0.26, outAt: 0.56, stagger: 0.018 });
  return (
    <SceneSection ref={ref} scene={SCENE.why} id="about" height="h-[260vh] md:h-[280vh]" anchorOffset={0.2} labelledBy="why-title" innerClassName="items-end md:items-center">
      <div className="mx-auto w-full max-w-[1440px] px-4 pb-8 md:px-10 md:pb-0">
        <div className="max-w-[1100px]">
          <p data-reveal className="eyebrow !text-glow">
            Why Automatica
          </p>
          <h2 id="why-title" data-reveal className="display text-shadow-soft mt-4 text-[38px] md:text-[64px]">
            Engineered for
            <br />
            every entrance.
          </h2>
          <ul className="mt-8 grid grid-cols-1 gap-px overflow-hidden rounded-2xl border border-white/10 bg-white/10 sm:grid-cols-2 lg:grid-cols-5 md:mt-12">
            {BENEFITS.map((b) => (
              <li key={b.title} data-reveal className="flex gap-4 bg-[rgba(5,9,20,0.72)] p-4 backdrop-blur-md md:flex-col md:gap-5 md:p-6">
                <span className="mt-0.5 shrink-0">{b.icon}</span>
                <div>
                  <h3 className="text-[13px] font-bold uppercase tracking-[0.14em]">{b.title}</h3>
                  <p className="mt-1.5 text-[13px] leading-relaxed text-silver/75 md:mt-2">{b.text}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </SceneSection>
  );
}
