"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { Logo } from "./Logo";
import { Button } from "./Button";
import { NAV_LINKS, SITE } from "@/lib/site";
import { scrollToTarget } from "@/components/providers/SmoothScroll";
import { ui, useUI } from "@/lib/store";

const MOBILE_LINKS = [{ label: "Home", href: "#top" }, ...NAV_LINKS];

function MobileMenu() {
  const open = useUI((s) => s.menuOpen);
  const panel = useRef<HTMLDivElement>(null);
  const firstLink = useRef<HTMLAnchorElement>(null);

  useEffect(() => {
    const el = panel.current;
    if (!el) return;
    const items = el.querySelectorAll("[data-menu-item]");
    if (open) {
      gsap.set(el, { display: "flex" });
      gsap.fromTo(el, { clipPath: "inset(0 0 100% 0)" }, { clipPath: "inset(0 0 0% 0)", duration: 0.7, ease: "expo.out" });
      gsap.fromTo(items, { y: 40, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.7, ease: "expo.out", stagger: 0.05, delay: 0.15 });
      firstLink.current?.focus({ preventScroll: true });
      document.documentElement.style.overflow = "hidden";
    } else {
      gsap.to(el, { clipPath: "inset(0 0 100% 0)", duration: 0.5, ease: "expo.inOut", onComplete: () => void gsap.set(el, { display: "none" }) });
      document.documentElement.style.overflow = "";
    }
  }, [open]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && ui.set({ menuOpen: false });
    addEventListener("keydown", onKey);
    return () => removeEventListener("keydown", onKey);
  }, []);

  const go = (href: string) => {
    ui.set({ menuOpen: false });
    window.setTimeout(() => scrollToTarget(href), 350);
  };

  return (
    <div
      ref={panel}
      id="mobile-menu"
      role="dialog"
      aria-modal="true"
      aria-label="Menu"
      className="fixed inset-0 z-40 hidden flex-col justify-between bg-[rgba(4,8,20,0.86)] px-6 pb-10 pt-28 backdrop-blur-2xl"
      style={{ clipPath: "inset(0 0 100% 0)" }}
    >
      <div className="pointer-events-none absolute inset-0 [background:radial-gradient(70%_50%_at_80%_10%,rgba(11,94,215,0.35),transparent_70%)]" />
      <ul className="relative flex flex-col gap-1">
        {MOBILE_LINKS.map((l, i) => (
          <li key={l.href} data-menu-item>
            <a
              ref={i === 0 ? firstLink : undefined}
              href={l.href}
              onClick={(e) => {
                e.preventDefault();
                go(l.href);
              }}
              className="flex items-baseline gap-4 border-b border-white/10 py-4 text-4xl font-bold uppercase tracking-tight text-white"
            >
              <span className="text-[10px] font-bold tracking-[0.2em] text-glow">{String(i + 1).padStart(2, "0")}</span>
              {l.label}
            </a>
          </li>
        ))}
      </ul>
      <div className="relative flex flex-col gap-5" data-menu-item>
        <Button href="#contact" variant="solid" onClick={() => ui.set({ menuOpen: false })}>
          Request a Quote
        </Button>
        <a href={`mailto:${SITE.email}`} className="text-sm text-mist">
          {SITE.email}
        </a>
      </div>
    </div>
  );
}

/** Floating navigation: transparent at the top, glass after scrolling, hides on scroll down. */
export function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const open = useUI((s) => s.menuOpen);

  useEffect(() => {
    let last = window.scrollY;
    const onScroll = () => {
      const y = window.scrollY;
      setScrolled(y > 40);
      if (Math.abs(y - last) > 6) {
        setHidden(y > last && y > 300);
        last = y;
      }
    };
    addEventListener("scroll", onScroll, { passive: true });
    return () => removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      <header
        className={`fixed inset-x-0 top-0 z-50 transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] ${hidden && !open ? "-translate-y-full" : "translate-y-0"}`}
      >
        <div className="mx-auto mt-3 max-w-[1440px] px-3 md:mt-4 md:px-6">
          <div
            className={`flex h-14 items-center justify-between rounded-full px-4 transition-all duration-700 md:h-16 md:px-6 ${
              scrolled && !open ? "border border-white/10 bg-[rgba(6,10,22,0.5)] shadow-[0_10px_40px_-20px_rgba(0,0,0,0.8)] backdrop-blur-xl" : "border border-transparent"
            }`}
          >
            <a
              href="#top"
              aria-label="AUTOMATICA — back to the entrance"
              onClick={(e) => {
                e.preventDefault();
                ui.set({ menuOpen: false });
                scrollToTarget("#top");
              }}
            >
              <Logo className="h-9 md:h-10" priority />
            </a>
            <nav aria-label="Primary" className="hidden lg:block">
              <ul className="flex items-center gap-9">
                {NAV_LINKS.map((l) => (
                  <li key={l.href}>
                    <a
                      href={l.href}
                      onClick={(e) => {
                        e.preventDefault();
                        scrollToTarget(l.href);
                      }}
                      className="group relative text-[11px] font-semibold uppercase tracking-[0.24em] text-white/75 transition-colors hover:text-white"
                    >
                      {l.label}
                      <span className="absolute -bottom-1.5 left-0 h-px w-full origin-left scale-x-0 bg-glow transition-transform duration-500 group-hover:scale-x-100" />
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
            <div className="hidden lg:block">
              <Button href="#contact" className="!h-11 !px-5 !text-[11px]">
                Request a Quote
              </Button>
            </div>
            <button
              className="relative grid h-11 w-11 place-items-center rounded-full border border-white/15 bg-white/5 backdrop-blur lg:hidden"
              aria-expanded={open}
              aria-controls="mobile-menu"
              aria-label={open ? "Close menu" : "Open menu"}
              onClick={() => ui.set({ menuOpen: !open })}
            >
              <span className={`absolute h-px w-5 bg-white transition-transform duration-500 ${open ? "rotate-45" : "-translate-y-1"}`} />
              <span className={`absolute h-px w-5 bg-white transition-transform duration-500 ${open ? "-rotate-45" : "translate-y-1"}`} />
            </button>
          </div>
        </div>
      </header>
      <MobileMenu />
    </>
  );
}
