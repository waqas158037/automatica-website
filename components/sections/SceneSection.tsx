import { forwardRef, type ReactNode } from "react";

type Props = {
  scene: number;
  id?: string;
  /** Tailwind height classes, e.g. "h-[220vh] md:h-[260vh]". */
  height: string;
  /** Fraction of section height to land on when navigated to by anchor. */
  anchorOffset?: number;
  labelledBy?: string;
  className?: string;
  innerClassName?: string;
  children: ReactNode;
};

/**
 * A tall story section with a sticky viewport-sized stage. Its scroll range
 * drives scene coordinate p ∈ [scene, scene + 1).
 */
export const SceneSection = forwardRef<HTMLElement, Props>(function SceneSection(
  { scene, id, height, anchorOffset = 0.2, labelledBy, className = "", innerClassName = "", children },
  ref,
) {
  return (
    <section ref={ref} id={id} data-scene={scene} data-anchor-offset={anchorOffset} aria-labelledby={labelledBy} className={`relative ${height} ${className}`}>
      <div className={`sticky top-0 flex h-[100svh] w-full overflow-hidden ${innerClassName}`}>{children}</div>
    </section>
  );
});
