/** Factual company information only. Do not add unverified details here. */
export const SITE = {
  name: "AUTOMATICA",
  tagline: "Automation that moves with you.",
  descriptor: "Automatic Door & Shutter Solutions",
  location: "Lahore, Pakistan",
  email: "support@automatica.com",
  title: "Automatica | Automatic Doors & Industrial Shutter Solutions",
  description:
    "Automatica provides automatic glass doors, sliding door systems and industrial shutter solutions for commercial and industrial spaces in Lahore, Pakistan.",
} as const;

export const NAV_LINKS = [
  { label: "Solutions", href: "#solutions" },
  { label: "Applications", href: "#applications" },
  { label: "Process", href: "#process" },
  { label: "About", href: "#about" },
  { label: "Contact", href: "#contact" },
] as const;

export const PROJECT_TYPES = [
  "Automatic Glass Door",
  "Sliding Door",
  "Industrial Shutter",
  "Vehicle Access",
  "Other",
] as const;
