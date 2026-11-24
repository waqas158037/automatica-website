# AUTOMATICA — Premium 3D Website

A cinematic, scroll-driven single-page experience for **AUTOMATICA**, a Lahore-based provider of automatic glass doors, sliding door systems and industrial shutter solutions.

The visitor approaches a building, the automatic door senses them and opens, and the camera walks them through the products: showroom displays, a warehouse with an industrial shutter and vehicle access, a blueprint view, a city of applications, the installation process, and a final entrance that opens into light. The story is **Approach → Detect → Open → Enter → Discover → Automate → Connect**.

## Stack

| Layer | Technology |
| --- | --- |
| Framework | Next.js 15 (App Router, **static export**), React 19, TypeScript |
| Styling | Tailwind CSS 4, Manrope (via `next/font`) |
| 3D | Three.js, React Three Fiber, Drei (reflections, grid, HTML labels, procedural environment) |
| Motion | GSAP + ScrollTrigger (scroll choreography), Lenis (smooth scrolling) |
| Hosting | Cloudflare Pages (static, no server or backend required) |

All 3D geometry is procedural, so there are no heavy model downloads. The 3D bundle is code-split and loads after the page shell.

## Local development

Requires Node.js 20 or newer.

```bash
npm install
npm run dev
```

Open http://localhost:3000.

Useful query parameters for QA:

| Parameter | Effect |
| --- | --- |
| `?motion=full` | Forces the 3D experience even when the OS asks for reduced motion |
| `?quality=high` / `medium` / `low` | Pins the rendering tier and disables automatic down-grading |
| `?debug` | Exposes `window.__automatica` (scroll state, UI store) in the console |

## Production build

```bash
npm run build
```

This writes a fully static site to `out/`. To preview it locally:

```bash
npm start
```

(serves `out/` at http://localhost:3000 via `serve`)

Other scripts:

- `npm run typecheck`: TypeScript check
- `npm run assets`: re-extract the logo assets, favicon and Open Graph image from `public/assets/logo/source/automatica-logo-source.jpg`

## Cloudflare Pages deployment

1. Create a Cloudflare account (or sign in) at https://dash.cloudflare.com.
2. Push this project to a GitHub (or GitLab) repository.
3. In Cloudflare go to **Workers & Pages → Create → Pages → Connect to Git** and select the repository.
4. Use these build settings:
   - **Framework preset:** `Next.js (Static HTML Export)` (or `None`)
   - **Build command:** `npm run build`
   - **Build output directory:** `out`
   - **Environment variable:** `NODE_VERSION` = `20` (or newer)
5. Optionally add the environment variables listed below under **Settings → Environment variables**.
6. Click **Save and Deploy**.
7. Open the generated `https://<project>.pages.dev` URL and test it. Open Graph URLs automatically use this address (Cloudflare provides `CF_PAGES_URL` during the build).
8. Later, connect the AUTOMATICA domain under **Custom domains → Set up a custom domain**, then set `NEXT_PUBLIC_SITE_URL` to it and redeploy so canonical and social URLs use the final domain.

No domain is required during development. `public/_headers` sets long-lived caching for hashed assets and basic security headers on Cloudflare.

**Direct upload (no Git):** run `npm run build`, then `npx wrangler pages deploy out --project-name automatica`.

## Environment variables

All are optional. See `.env.example`.

| Variable | Purpose |
| --- | --- |
| `NEXT_PUBLIC_SITE_URL` | Final public URL (e.g. `https://automatica.example`). Used for canonical and Open Graph URLs. Falls back to Cloudflare's `CF_PAGES_URL`. |
| `NEXT_PUBLIC_BASE_PATH` | Only if the site is hosted under a sub-path. |
| `NEXT_PUBLIC_FORM_ENDPOINT` | Endpoint for the quote form (see below). |

`NEXT_PUBLIC_*` values are embedded in the public bundle, so never put secrets in them.

### Quote form integration

The form validates input in the browser. Because the site is static, it does **not** pretend to send anything:

- **No endpoint configured (default):** after validation the visitor's email app opens with the request pre-filled to `support@automatica.com`, and the page says so.
- **Endpoint configured:** the form `POST`s JSON (`name, company, email, phone, projectType, message, source`) to `NEXT_PUBLIC_FORM_ENDPOINT` and shows success only when the response is `2xx`. Compatible options include Formspree, Basin, Getform, or your own Cloudflare Pages Function or Worker that forwards the email (keep its API keys in Cloudflare secrets, never in the frontend).

The integration point is `components/sections/Contact.tsx`.

## Assets

```
public/assets/
  logo/
    source/automatica-logo-source.jpg   official artwork as supplied (do not edit)
    automatica-logo.png / .webp         white logo, transparent background (extracted)
    automatica-logo-blue.png            logo on AUTOMATICA blue (bright scenes)
    automatica-mark.png                 door symbol only
  doors/  shutters/  applications/  textures/  icons/
app/icon.png, app/apple-icon.png        favicons (generated)
public/og.jpg                           Open Graph / social image (generated from the artwork)
```

The logo is extracted pixel-for-pixel from the supplied artwork by `scripts/extract-logo.mjs` (not redrawn). If a vector (SVG) or higher-resolution master becomes available, drop it in and update `src` in `components/ui/Logo.tsx` and `LOGO_URL` / `LOGO_ASPECT` in `components/3d/EntranceScene.tsx`.

Photography and reference images go in the matching folders as WebP or AVIF (each ≤ 300 KB). The 3D scenes do not depend on them.

## Architecture

```
app/                    layout (SEO metadata, JSON-LD), page, global styles
components/
  3d/                   Experience (Canvas), SceneManager, CameraController, Lighting,
                        EntranceScene, InteriorScene, AutomaticGlassDoor, IndustrialShutter,
                        VehicleScene, BlueprintScene, CityScene, FinalEntranceScene,
                        Particles, TechLabel, Floor, materials, ExperienceGate (WebGL / static switch)
  sections/             Hero, Intro, Solutions, Applications, WhyAutomatica, Process,
                        FinalCTA, Contact, Footer
  ui/                   Nav (and mobile menu), Loader, Cursor, ProgressRail, Button, Logo
  providers/            SmoothScroll (Lenis + ScrollTrigger → scene progress)
lib/
  scenes.ts             the choreography: camera keyframes, door/shutter/vehicle timing, scene cuts
  site.ts               factual company info (single source of truth)
  device.ts             quality tiers, GPU detection, WebGL and reduced-motion detection
  store.ts, math.ts, useReveal.ts
```

**How scroll drives the story:** every story section has `data-scene={n}`. As it scrolls past, the global scene coordinate `p` runs from `n` to `n+1`. The camera, doors, shutter, vehicle, lighting and scene cuts are pure functions of `p` (see `lib/scenes.ts`). The text panels use scrubbed GSAP timelines over the same range, so the 3D and the copy always stay in sync.

## Performance and accessibility

- **Quality tiers** (`high` / `medium` / `low`) are chosen from screen size, input type, CPU and memory, and the GPU renderer. Software renderers and older integrated GPUs get the light path. Mobile uses lower DPR, no real-time reflections or transmission, fewer particles and a smaller city.
- **Runtime guard:** if the device can't sustain about 30 fps after warm-up, the tier steps down automatically, then resolution. Drei's `PerformanceMonitor` also adapts DPR.
- Only the active environment is rendered. Lights come from a fixed pool to avoid shader recompiles, and shaders are precompiled during the loader.
- **Reduced motion** (`prefers-reduced-motion`): the site shows a static architectural backdrop with no smooth scrolling and no scrubbed animation, with an opt-in link to the 3D version.
- **No WebGL / GPU failure:** the same static backdrop is used, and all content stays readable and navigable.
- Semantic landmarks, a single H1, a skip link, keyboard-accessible navigation and menu (Escape closes it), labelled form fields with inline errors, and visible focus states.

## Content policy

Only factual information supplied by the company is used: name, services, Lahore, Pakistan, and `support@automatica.com`. No phone numbers, addresses, certifications, client counts, reviews or social profiles have been invented. Add them in `lib/site.ts` once they are confirmed.
