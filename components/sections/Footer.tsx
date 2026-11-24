"use client";

import { Logo } from "@/components/ui/Logo";
import { scrollToTarget } from "@/components/providers/SmoothScroll";
import { SITE } from "@/lib/site";

const LINKS = [
  { label: "Solutions", href: "#solutions" },
  { label: "Applications", href: "#applications" },
  { label: "Process", href: "#process" },
  { label: "Contact", href: "#contact" },
];

export function Footer() {
  return (
    <footer className="relative z-10 border-t border-white/10 bg-[#03050c]">
      <div className="mx-auto flex max-w-[1440px] flex-col gap-10 px-4 py-14 md:flex-row md:items-end md:justify-between md:px-10">
        <div>
          <Logo className="h-11" />
          <p className="mt-5 text-sm font-semibold uppercase tracking-[0.2em] text-silver">{SITE.descriptor}</p>
          <p className="mt-3 text-sm text-mist">{SITE.location}</p>
          <a href={`mailto:${SITE.email}`} className="mt-1 inline-block text-sm text-mist transition-colors hover:text-white">
            {SITE.email}
          </a>
        </div>
        <nav aria-label="Footer">
          <ul className="flex flex-wrap gap-x-8 gap-y-3">
            {LINKS.map((l) => (
              <li key={l.href}>
                <a
                  href={l.href}
                  onClick={(e) => {
                    e.preventDefault();
                    scrollToTarget(l.href);
                  }}
                  className="text-[11px] font-semibold uppercase tracking-[0.24em] text-white/70 transition-colors hover:text-white"
                >
                  {l.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </div>
      <div className="border-t border-white/5">
        <p className="mx-auto max-w-[1440px] px-4 py-6 text-[11px] tracking-[0.12em] text-mist/70 md:px-10">© 2026 AUTOMATICA. All rights reserved.</p>
      </div>
    </footer>
  );
}
