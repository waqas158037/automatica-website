import type { Metadata, Viewport } from "next";
import { Manrope } from "next/font/google";
import "./globals.css";
import { SITE } from "@/lib/site";

const manrope = Manrope({ subsets: ["latin"], weight: ["400", "500", "600", "700", "800"], variable: "--font-manrope", display: "swap" });

// CF_PAGES_URL is provided automatically by Cloudflare Pages builds (the *.pages.dev preview URL).
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || process.env.CF_PAGES_URL;

export const metadata: Metadata = {
  ...(siteUrl ? { metadataBase: new URL(siteUrl), alternates: { canonical: "/" } } : {}),
  title: SITE.title,
  description: SITE.description,
  applicationName: SITE.name,
  keywords: ["automatic doors", "automatic sliding glass doors", "industrial shutters", "roller shutters", "automatic door installation", "Lahore", "Pakistan"],
  openGraph: {
    type: "website",
    siteName: SITE.name,
    title: SITE.title,
    description: SITE.description,
    locale: "en_PK",
    images: [{ url: "/og.jpg", width: 1200, height: 630, alt: "AUTOMATICA — Automation that moves with you." }],
  },
  twitter: {
    card: "summary_large_image",
    title: SITE.title,
    description: SITE.description,
    images: ["/og.jpg"],
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: "#05080f",
  width: "device-width",
  initialScale: 1,
  colorScheme: "dark",
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  name: SITE.name,
  description: SITE.description,
  email: SITE.email,
  address: { "@type": "PostalAddress", addressLocality: "Lahore", addressCountry: "PK" },
  ...(siteUrl ? { url: siteUrl } : {}),
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={manrope.variable}>
      <body>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
        {children}
      </body>
    </html>
  );
}
