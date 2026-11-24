"use client";

import { useRef } from "react";
import { SceneSection } from "./SceneSection";
import { useReveal } from "@/lib/useReveal";
import { SCENE } from "@/lib/scenes";

const WORD = "AUTOMATICA".split("");

export function Intro() {
  const ref = useRef<HTMLElement>(null);
  useReveal(ref, {
    inAt: 0.3,
    outAt: 0.56,
    extend: (tl, q) => {
      tl.fromTo(
        q("[data-char]"),
        { autoAlpha: 0, yPercent: 60, filter: "blur(12px)" },
        { autoAlpha: 1, yPercent: 0, filter: "blur(0px)", duration: 0.1, stagger: 0.012, ease: "power3.out" },
        0.04,
      );
      tl.to(q("[data-char]"), { autoAlpha: 0, filter: "blur(10px)", duration: 0.06, stagger: 0.004 }, 0.55);
    },
  });
  return (
    <SceneSection ref={ref} scene={SCENE.intro} id="about-intro" height="h-[200vh] md:h-[230vh]" labelledBy="intro-title" innerClassName="items-end pb-[10vh] md:pb-[12vh]">
      <div className="mx-auto w-full max-w-[1440px] px-4 text-center md:px-10">
        <h2 id="intro-title" className="display text-shadow-soft flex justify-center text-[15vw] tracking-[0.04em] md:text-[11vw] xl:text-[170px]" aria-label="AUTOMATICA">
          {WORD.map((c, i) => (
            <span key={i} data-char className="inline-block" aria-hidden>
              {c}
            </span>
          ))}
        </h2>
        <p data-reveal className="mt-4 text-sm font-semibold uppercase tracking-[0.42em] text-silver md:mt-6 md:text-base">
          Smart Access. Seamless Movement.
        </p>
        <p data-reveal className="lede text-shadow-soft mx-auto mt-6 max-w-xl text-base md:text-lg">
          Automatica delivers automatic door and shutter solutions designed for modern commercial, industrial and architectural spaces.
        </p>
      </div>
    </SceneSection>
  );
}
