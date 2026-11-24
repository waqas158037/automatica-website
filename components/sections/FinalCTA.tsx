"use client";

import { useRef } from "react";
import { SceneSection } from "./SceneSection";
import { Button } from "@/components/ui/Button";
import { Logo } from "@/components/ui/Logo";
import { useReveal } from "@/lib/useReveal";
import { SCENE } from "@/lib/scenes";

/** The ending: a second entrance opens into light, the brand line returns. */
export function FinalCTA() {
  const ref = useRef<HTMLElement>(null);
  useReveal(ref, {
    outAt: null,
    scrub: 1.6,
    extend: (tl, q) => {
      // Door opens by 0.30 and the camera is through it by 0.45. Only then does the closing
      // block arrive inside the light: a slow zoom-out from large to its normal size.
      const block = q("[data-final-copy]");
      tl.fromTo(
        block,
        { autoAlpha: 0, scale: 1.7, filter: "blur(10px)" },
        { autoAlpha: 1, scale: 1, filter: "blur(0px)", duration: 0.14, ease: "sine.out" },
        0.46,
      );
      // Fade before the form's navy backdrop settles in (dark text would vanish on navy).
      tl.to(block, { autoAlpha: 0, filter: "blur(8px)", duration: 0.05, ease: "sine.in" }, 0.65);
    },
  });
  return (
    <SceneSection ref={ref} scene={SCENE.final} id="final" height="h-[300vh] md:h-[320vh]" anchorOffset={0.6} labelledBy="final-title" innerClassName="items-center">
      <div data-final-copy className="mx-auto flex w-full max-w-[1440px] origin-center flex-col items-center px-4 text-center md:px-10">
        <div>
          <Logo onBlue className="h-16 rounded-xl shadow-[0_20px_60px_-20px_rgba(11,94,215,0.9)] md:h-24" />
        </div>
        <p id="final-title" className="final-title display mt-8 text-[11vw] md:text-[7vw] xl:text-[104px]">
          Automation that
          <br />
          moves with you.
        </p>
        <div className="mt-10">
          <Button href="#contact" variant="solid">
            Request a Quote
          </Button>
        </div>
      </div>
    </SceneSection>
  );
}
