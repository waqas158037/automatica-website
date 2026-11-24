import { asset } from "@/lib/asset";

/** Official logo lockup (served from /public/assets/logo). Height-driven, never stretched. */
export function Logo({ className = "h-7", priority = false, onBlue = false }: { className?: string; priority?: boolean; onBlue?: boolean }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={asset(onBlue ? "/assets/logo/automatica-logo-blue.png" : "/assets/logo/automatica-logo.png")}
      alt="AUTOMATICA"
      className={`${className} w-auto select-none`}
      width={onBlue ? 1192 : 1032}
      height={onBlue ? 437 : 317}
      draggable={false}
      fetchPriority={priority ? "high" : "auto"}
    />
  );
}
