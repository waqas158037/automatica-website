"use client";

import { useRef } from "react";
import { SceneSection } from "./SceneSection";
import { Button } from "@/components/ui/Button";
import { useReveal } from "@/lib/useReveal";
import { SCENE } from "@/lib/scenes";

type Solution = {
  scene: number;
  id?: string;
  no: string;
  title: string;
  text: string;
  chain: string[];
  align: "left" | "right";
  note?: string;
};

const SOLUTIONS: Solution[] = [
  {
    scene: SCENE.solGlass,
    id: "solutions",
    no: "01",
    title: "Automatic Glass Doors",
    text: "Seamless entrances designed for malls, offices, commercial buildings and modern architectural spaces.",
    chain: ["Motion sensor", "Automatic control", "Motor system", "Sliding panels"],
    align: "right",
    note: "Hover the door to trigger its sensor",
  },
  {
    scene: SCENE.solSliding,
    no: "02",
    title: "Automatic Sliding Doors",
    text: "Smooth, reliable automatic entry systems designed for high-traffic environments.",
    chain: ["Detect", "Open", "Hold", "Close"],
    align: "left",
  },
  {
    scene: SCENE.solShutter,
    no: "03",
    title: "Automatic Industrial Shutters",
    text: "Robust automated shutter systems built for warehouses, industrial facilities and large vehicle access points.",
    chain: ["Control", "Drive motor", "Steel slats", "Guide rails"],
    align: "right",
  },
  {
    scene: SCENE.solVehicle,
    no: "04",
    title: "Vehicle Access Shutters",
    text: "Automated access solutions designed for vehicle and industrial entry points.",
    chain: ["Vehicle approaches", "Sensor activates", "Shutter opens", "Vehicle passes"],
    align: "right",
  },
  {
    scene: SCENE.solInstall,
    no: "05",
    title: "Installation & Integration",
    text: "Professional installation and system integration tailored to the requirements of each site.",
    chain: ["Measure", "Mount", "Integrate", "Test"],
    align: "left",
  },
];

function SolutionPanel({ s }: { s: Solution }) {
  const ref = useRef<HTMLElement>(null);
  useReveal(ref, { inAt: 0.2, outAt: 0.54 });
  const first = s.no === "01";
  return (
    <SceneSection
      ref={ref}
      scene={s.scene}
      id={s.id}
      height="h-[210vh] md:h-[250vh]"
      anchorOffset={first ? 0.18 : 0.22}
      labelledBy={`sol-${s.no}`}
      innerClassName="items-end md:items-center"
    >
      <div className={`mx-auto flex w-full max-w-[1440px] px-4 pb-8 md:px-10 md:pb-0 ${s.align === "right" ? "md:justify-end" : "md:justify-start"}`}>
        <article data-panel className="glass-panel w-full max-w-[480px] rounded-2xl p-6 md:p-9">
          {first && (
            <h2 data-reveal className="eyebrow mb-6 !text-glow">
              Engineered to move.
            </h2>
          )}
          <div data-reveal className="flex items-center gap-3">
            <span className="text-[11px] font-bold tracking-[0.24em] text-glow">{s.no}</span>
            <span className="h-px w-10 bg-white/20" />
            <span className="text-[11px] font-semibold tracking-[0.24em] text-mist">05</span>
          </div>
          <h3 id={`sol-${s.no}`} data-reveal className="display mt-4 text-[34px] leading-[1] md:text-[46px]">
            {s.title}
          </h3>
          <p data-reveal className="lede mt-4 text-[15px] md:text-base">
            {s.text}
          </p>
          <div data-reveal className="chain mt-6" aria-label="System sequence">
            {s.chain.map((c, i) => (
              <span key={c} className="contents">
                {i > 0 && <span className="chain__link" aria-hidden />}
                <span className="chain__node">{c}</span>
              </span>
            ))}
          </div>
          <div data-reveal className="mt-7 flex flex-wrap items-center gap-4">
            <Button href="#contact" variant="ghost">
              Request a Quote
            </Button>
            {s.note && <span className="hidden text-[10px] uppercase tracking-[0.24em] text-mist lg:inline">{s.note}</span>}
          </div>
        </article>
      </div>
    </SceneSection>
  );
}

export function Solutions() {
  return (
    <div aria-label="Solutions">
      {SOLUTIONS.map((s) => (
        <SolutionPanel key={s.no} s={s} />
      ))}
    </div>
  );
}
