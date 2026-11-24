"use client";

import { useId, useState, type FormEvent } from "react";
import { Button } from "@/components/ui/Button";
import { PROJECT_TYPES, SITE } from "@/lib/site";
import { SCENE } from "@/lib/scenes";

type Fields = { name: string; company: string; email: string; phone: string; projectType: string; message: string };
type Errors = Partial<Record<keyof Fields, string>>;
type Status =
  | { kind: "idle" }
  | { kind: "sending" }
  | { kind: "sent" }
  | { kind: "error"; message: string }
  | { kind: "mailto" };

/**
 * Integration point: set NEXT_PUBLIC_FORM_ENDPOINT to any endpoint that accepts a JSON POST
 * (Formspree, Basin, a Cloudflare Pages Function, …). Without it, the form never pretends to
 * submit: it opens the visitor's email app with the request pre-filled to support@automatica.com.
 */
const ENDPOINT = process.env.NEXT_PUBLIC_FORM_ENDPOINT || "";

const EMPTY: Fields = { name: "", company: "", email: "", phone: "", projectType: "", message: "" };

function validate(f: Fields): Errors {
  const e: Errors = {};
  if (f.name.trim().length < 2) e.name = "Please enter your name.";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(f.email.trim())) e.email = "Please enter a valid email address.";
  if (f.phone.trim() && !/^[+()\d\s-]{7,20}$/.test(f.phone.trim())) e.phone = "Please enter a valid phone number.";
  if (!f.projectType) e.projectType = "Please choose a project type.";
  if (f.message.trim().length < 10) e.message = "Please tell us a little about your space (10+ characters).";
  return e;
}

function mailtoHref(f: Fields) {
  const subject = `Quote request — ${f.projectType}${f.company ? ` — ${f.company}` : ""}`;
  const details = [
    `Name: ${f.name}`,
    f.company ? `Company: ${f.company}` : null,
    `Email: ${f.email}`,
    f.phone ? `Phone: ${f.phone}` : null,
    `Project type: ${f.projectType}`,
  ].filter(Boolean);
  const body = [...details, "", f.message].join("\n");
  return `mailto:${SITE.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

export function Contact() {
  const uid = useId();
  const [f, setF] = useState<Fields>(EMPTY);
  const [errors, setErrors] = useState<Errors>({});
  const [touched, setTouched] = useState(false);
  const [status, setStatus] = useState<Status>({ kind: "idle" });

  const set = (k: keyof Fields) => (e: { target: { value: string } }) => {
    const next = { ...f, [k]: e.target.value };
    setF(next);
    if (touched) setErrors(validate(next));
  };

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setTouched(true);
    const errs = validate(f);
    setErrors(errs);
    if (Object.keys(errs).length) {
      const first = Object.keys(errs)[0];
      document.getElementById(`${uid}-${first}`)?.focus();
      return;
    }
    if (!ENDPOINT) {
      window.location.href = mailtoHref(f);
      setStatus({ kind: "mailto" });
      return;
    }
    setStatus({ kind: "sending" });
    try {
      const res = await fetch(ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({ ...f, source: "automatica-website" }),
      });
      if (!res.ok) throw new Error(`Request failed (${res.status})`);
      setStatus({ kind: "sent" });
      setF(EMPTY);
      setTouched(false);
    } catch {
      setStatus({ kind: "error", message: "We couldn't send your request. Please try again, or email us directly." });
    }
  };

  const field = (k: keyof Fields, label: string, input: React.ReactNode, optional = false) => (
    <div className="field">
      <label htmlFor={`${uid}-${k}`}>
        {label}
        {optional && <span className="ml-2 normal-case tracking-normal text-mist/70">(optional)</span>}
      </label>
      {input}
      {errors[k] && (
        <span id={`${uid}-${k}-err`} className="field-error" role="alert">
          {errors[k]}
        </span>
      )}
    </div>
  );
  const a11y = (k: keyof Fields) => ({
    id: `${uid}-${k}`,
    name: k,
    "aria-invalid": errors[k] ? true : undefined,
    "aria-describedby": errors[k] ? `${uid}-${k}-err` : undefined,
  });

  return (
    <section id="contact" data-scene={SCENE.contact} data-anchor-offset={0} aria-labelledby="contact-title" className="relative z-10">
      {/* Static/no-WebGL fallback only; with 3D the backdrop is the scroll-driven dim in Experience. */}
      <div className="absolute inset-0 -z-10 hidden bg-[#03050c] [.static-mode_&]:block" aria-hidden />
      <div className="mx-auto grid w-full max-w-[1440px] gap-12 px-4 pb-24 pt-[28vh] md:px-10 lg:grid-cols-[1fr_1.1fr] lg:gap-20 lg:pb-32">
        <div className="lg:sticky lg:top-32 lg:self-start">
          <p className="eyebrow !text-glow">Contact</p>
          <h2 id="contact-title" className="display mt-5 text-[42px] md:text-[72px]">
            Ready to automate your entrance?
          </h2>
          <p className="lede mt-6 max-w-md text-base md:text-lg">Tell us about your space and we&apos;ll help you find the right automatic door or shutter solution.</p>
          <div className="mt-10 flex flex-col gap-6 border-t border-white/10 pt-8 text-sm">
            <div>
              <p className="eyebrow !text-[10px]">Email</p>
              <a href={`mailto:${SITE.email}`} className="mt-2 inline-block text-lg font-semibold text-white transition-colors hover:text-glow">
                {SITE.email}
              </a>
            </div>
            <div>
              <p className="eyebrow !text-[10px]">Location</p>
              <p className="mt-2 text-lg font-semibold">{SITE.location}</p>
            </div>
            <div>
              <Button href={`mailto:${SITE.email}`}>Email AUTOMATICA</Button>
            </div>
          </div>
        </div>

        <form onSubmit={submit} noValidate className="glass-panel rounded-3xl p-6 md:p-10" aria-describedby={`${uid}-formnote`}>
          <h3 className="text-[13px] font-bold uppercase tracking-[0.24em]">Request a Quote</h3>
          <div className="mt-8 grid gap-5 md:grid-cols-2">
            {field("name", "Name", <input {...a11y("name")} autoComplete="name" value={f.name} onChange={set("name")} required />)}
            {field("company", "Company", <input {...a11y("company")} autoComplete="organization" value={f.company} onChange={set("company")} />, true)}
            {field("email", "Email", <input {...a11y("email")} type="email" autoComplete="email" inputMode="email" value={f.email} onChange={set("email")} required />)}
            {field("phone", "Phone", <input {...a11y("phone")} type="tel" autoComplete="tel" inputMode="tel" value={f.phone} onChange={set("phone")} />, true)}
            <div className="md:col-span-2">
              {field(
                "projectType",
                "Project Type",
                <select {...a11y("projectType")} value={f.projectType} onChange={set("projectType")} required>
                  <option value="" disabled>
                    Select a project type
                  </option>
                  {PROJECT_TYPES.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>,
              )}
            </div>
            <div className="md:col-span-2">
              {field("message", "Message", <textarea {...a11y("message")} rows={5} value={f.message} onChange={set("message")} required placeholder="Site type, opening size, traffic, timeline…" />)}
            </div>
          </div>
          <div className="mt-8 flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
            <Button type="submit" variant="solid" disabled={status.kind === "sending"}>
              {status.kind === "sending" ? "Sending…" : "Request a Quote"}
            </Button>
            <p id={`${uid}-formnote`} className="max-w-xs text-xs leading-relaxed text-mist">
              {ENDPOINT ? "Your details are only used to respond to your enquiry." : "Submitting opens your email app with your request addressed to our team."}
            </p>
          </div>
          <div aria-live="polite" className="mt-6 text-sm">
            {status.kind === "sent" && <p className="rounded-xl border border-glow/40 bg-brand/10 p-4">Thank you — your request has been received. We&apos;ll be in touch by email.</p>}
            {status.kind === "error" && (
              <p className="rounded-xl border border-red-400/40 bg-red-500/10 p-4">
                {status.message}{" "}
                <a className="underline" href={mailtoHref(f)}>
                  Email {SITE.email}
                </a>
              </p>
            )}
            {status.kind === "mailto" && (
              <p className="rounded-xl border border-white/15 bg-white/5 p-4">
                Your email app should now be open with your request. Press send to deliver it. If nothing opened, write to{" "}
                <a className="underline" href={`mailto:${SITE.email}`}>
                  {SITE.email}
                </a>
                .
              </p>
            )}
          </div>
        </form>
      </div>
    </section>
  );
}
