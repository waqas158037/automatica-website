"use client";

import { createContext, useContext, useMemo, type ReactNode } from "react";
import * as THREE from "three";
import type { QualityProfile } from "@/lib/device";

export type DoorMaterials = {
  aluminum: THREE.MeshStandardMaterial;
  aluminumDark: THREE.MeshStandardMaterial;
  glass: THREE.MeshPhysicalMaterial;
  rubber: THREE.MeshStandardMaterial;
  sensorLens: THREE.MeshStandardMaterial;
  /** Present only for doors that can morph into a blueprint wireframe. */
  edges?: THREE.LineBasicMaterial;
};

export type SceneMaterials = DoorMaterials & {
  heroGlass: THREE.MeshPhysicalMaterial;
  facadeGlass: THREE.MeshPhysicalMaterial;
  stoneDark: THREE.MeshStandardMaterial;
  wallDark: THREE.MeshStandardMaterial;
  ceiling: THREE.MeshStandardMaterial;
  lightStrip: THREE.MeshBasicMaterial;
  lightWarm: THREE.MeshBasicMaterial;
  accentBlue: THREE.MeshBasicMaterial;
  concrete: THREE.MeshStandardMaterial;
  asphalt: THREE.MeshStandardMaterial;
  steel: THREE.MeshStandardMaterial;
  shutterSlat: THREE.MeshStandardMaterial;
  foliage: THREE.MeshStandardMaterial;
  paint: THREE.MeshStandardMaterial;
  tinted: THREE.MeshStandardMaterial;
  cityBlock: THREE.MeshStandardMaterial;
};

export const BRAND_BLUE = new THREE.Color("#0B5ED7");
export const GLOW_BLUE = new THREE.Color("#4d8bff");

export function createDoorMaterials(opts: { transmission?: boolean; fadeable?: boolean } = {}): DoorMaterials {
  const fade = !!opts.fadeable;
  return {
    aluminum: new THREE.MeshStandardMaterial({ color: "#c9ced6", metalness: 1, roughness: 0.26, transparent: fade }),
    aluminumDark: new THREE.MeshStandardMaterial({ color: "#3a404a", metalness: 0.9, roughness: 0.38, transparent: fade }),
    glass: opts.transmission
      ? new THREE.MeshPhysicalMaterial({
          color: "#f2f8ff",
          metalness: 0,
          roughness: 0.02,
          transmission: 1,
          thickness: 0.04,
          ior: 1.5,
          envMapIntensity: 1.6,
          specularIntensity: 1,
          clearcoat: 1,
          clearcoatRoughness: 0.02,
        })
      : new THREE.MeshPhysicalMaterial({
          color: "#d7e7ff",
          metalness: 0.05,
          roughness: 0.03,
          transparent: true,
          opacity: 0.16,
          envMapIntensity: 2.2,
          clearcoat: 1,
          clearcoatRoughness: 0.03,
          depthWrite: false,
          side: THREE.DoubleSide,
        }),
    rubber: new THREE.MeshStandardMaterial({ color: "#0d0f13", roughness: 0.9, metalness: 0, transparent: fade }),
    sensorLens: new THREE.MeshStandardMaterial({ color: "#0a0d12", emissive: GLOW_BLUE.clone(), emissiveIntensity: 0.3, roughness: 0.3, transparent: fade }),
    edges: fade ? new THREE.LineBasicMaterial({ color: "#5d9bff", transparent: true, opacity: 0, depthWrite: false }) : undefined,
  };
}

const MaterialsContext = createContext<SceneMaterials | null>(null);

export function MaterialsProvider({ quality, children }: { quality: QualityProfile; children: ReactNode }) {
  const mats = useMemo<SceneMaterials>(() => {
    const door = createDoorMaterials();
    const heroDoor = createDoorMaterials({ transmission: quality.transmission });
    return {
      ...door,
      heroGlass: heroDoor.glass,
      facadeGlass: new THREE.MeshPhysicalMaterial({
        color: "#9fb8d8",
        metalness: 0.2,
        roughness: 0.06,
        transparent: true,
        opacity: 0.22,
        envMapIntensity: 1.8,
        depthWrite: false,
        side: THREE.DoubleSide,
      }),
      stoneDark: new THREE.MeshStandardMaterial({ color: "#11151c", roughness: 0.5, metalness: 0.2 }),
      wallDark: new THREE.MeshStandardMaterial({ color: "#151a22", roughness: 0.7, metalness: 0.25 }),
      ceiling: new THREE.MeshStandardMaterial({ color: "#0c0f15", roughness: 0.85, metalness: 0.1 }),
      lightStrip: new THREE.MeshBasicMaterial({ color: new THREE.Color("#eef4ff").multiplyScalar(2.2), toneMapped: false }),
      lightWarm: new THREE.MeshBasicMaterial({ color: new THREE.Color("#ffe2b8").multiplyScalar(1.6), toneMapped: false }),
      accentBlue: new THREE.MeshBasicMaterial({ color: GLOW_BLUE.clone().multiplyScalar(1.8), toneMapped: false }),
      concrete: new THREE.MeshStandardMaterial({ color: "#2a2d33", roughness: 0.92, metalness: 0.05 }),
      asphalt: new THREE.MeshStandardMaterial({ color: "#121418", roughness: 0.82, metalness: 0.1 }),
      steel: new THREE.MeshStandardMaterial({ color: "#7c838d", roughness: 0.45, metalness: 0.9 }),
      shutterSlat: new THREE.MeshStandardMaterial({ color: "#9aa1aa", roughness: 0.38, metalness: 0.92 }),
      foliage: new THREE.MeshStandardMaterial({ color: "#16251c", roughness: 1, metalness: 0 }),
      paint: new THREE.MeshStandardMaterial({ color: "#d9dde3", roughness: 0.35, metalness: 0.5 }),
      tinted: new THREE.MeshStandardMaterial({ color: "#0a0d12", roughness: 0.1, metalness: 0.8 }),
      cityBlock: new THREE.MeshStandardMaterial({ color: "#3a4458", roughness: 0.55, metalness: 0.35, envMapIntensity: 0.6 }),
    };
  }, [quality.transmission]);
  return <MaterialsContext.Provider value={mats}>{children}</MaterialsContext.Provider>;
}

export function useMaterials() {
  const m = useContext(MaterialsContext);
  if (!m) throw new Error("useMaterials must be used inside <MaterialsProvider>");
  return m;
}

/** Soft radial glow texture shared by sensors, lamps and beams. */
let glowTex: THREE.Texture | null = null;
export function getGlowTexture() {
  if (glowTex) return glowTex;
  const s = 128;
  const c = document.createElement("canvas");
  c.width = c.height = s;
  const g = c.getContext("2d")!;
  const grd = g.createRadialGradient(s / 2, s / 2, 0, s / 2, s / 2, s / 2);
  grd.addColorStop(0, "rgba(255,255,255,1)");
  grd.addColorStop(0.25, "rgba(255,255,255,0.45)");
  grd.addColorStop(1, "rgba(255,255,255,0)");
  g.fillStyle = grd;
  g.fillRect(0, 0, s, s);
  glowTex = new THREE.CanvasTexture(c);
  glowTex.colorSpace = THREE.SRGBColorSpace;
  return glowTex;
}

/** Vertical fade texture (bright at bottom → transparent at top) for light beams. */
let beamTex: THREE.Texture | null = null;
export function getBeamTexture() {
  if (beamTex) return beamTex;
  const c = document.createElement("canvas");
  c.width = 4;
  c.height = 128;
  const g = c.getContext("2d")!;
  const grd = g.createLinearGradient(0, 0, 0, 128);
  grd.addColorStop(0, "rgba(255,255,255,0)");
  grd.addColorStop(1, "rgba(255,255,255,1)");
  g.fillStyle = grd;
  g.fillRect(0, 0, 4, 128);
  beamTex = new THREE.CanvasTexture(c);
  return beamTex;
}
