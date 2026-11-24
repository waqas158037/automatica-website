"use client";

import { useMemo } from "react";
import { useTexture } from "@react-three/drei";
import * as THREE from "three";
import { AutomaticGlassDoor } from "./AutomaticGlassDoor";
import { Box, InstancedBoxes, UNIT_CYL } from "./parts";
import { useMaterials } from "./materials";
import { asset } from "@/lib/asset";
import type { QualityProfile } from "@/lib/device";

export const LOGO_URL = asset("/assets/logo/automatica-logo.png");
const LOGO_ASPECT = 1032 / 317;

export function LogoPlane({ width, position, opacity = 1 }: { width: number; position: [number, number, number]; opacity?: number }) {
  const tex = useTexture(LOGO_URL);
  const mat = useMemo(() => {
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.anisotropy = 8;
    return new THREE.MeshBasicMaterial({ map: tex, transparent: true, opacity, toneMapped: false, depthWrite: false });
  }, [tex, opacity]);
  return (
    <mesh position={position} material={mat}>
      <planeGeometry args={[width, width / LOGO_ASPECT]} />
    </mesh>
  );
}

type FacadeProps = {
  quality: QualityProfile;
  getOpen: () => number;
  getSensor: () => number;
  glass?: THREE.Material;
  width?: number;
  height?: number;
  depth?: number;
};

/**
 * Premium commercial façade: glass curtain wall on an aluminium grid, a deep
 * canopy with downlights and branded fascia, and the automatic entrance at centre.
 */
export function Facade({ quality, getOpen, getSensor, glass, width = 34, height = 10, depth = 47 }: FacadeProps) {
  const m = useMaterials();
  const hw = width / 2;
  const doorW = 6;
  const doorH = 3.1;
  const transom = 3.75;
  const portal = doorW / 2 + 0.55;

  const mullions = useMemo(() => {
    const items: number[][] = [];
    const step = 2.25;
    for (let x = -hw; x <= hw + 0.01; x += step) {
      if (Math.abs(x) < portal) {
        items.push([x, (transom + height) / 2, 0, 0.08, height - transom, 0.28]);
      } else {
        items.push([x, height / 2, 0, 0.08, height, 0.28]);
      }
    }
    for (const y of [0.06, transom, 7.0]) items.push([0, y, 0, width, y < 0.1 ? 0.12 : 0.1, 0.3]);
    return items;
  }, [hw, height, portal, width]);

  const downlights = useMemo(() => {
    const items: number[][] = [];
    for (const z of [1.2, 3.4]) for (const x of [-4.5, -1.5, 1.5, 4.5]) items.push([x, 4.18, z, 0.32, 0.02, 0.32]);
    return items;
  }, []);

  return (
    <group>
      {/* Curtain wall glass */}
      <mesh material={m.facadeGlass} position={[-(hw + portal) / 2, height / 2, 0]}>
        <planeGeometry args={[hw - portal, height]} />
      </mesh>
      <mesh material={m.facadeGlass} position={[(hw + portal) / 2, height / 2, 0]}>
        <planeGeometry args={[hw - portal, height]} />
      </mesh>
      <mesh material={m.facadeGlass} position={[0, (transom + height) / 2, 0]}>
        <planeGeometry args={[portal * 2, height - transom]} />
      </mesh>
      <InstancedBoxes items={mullions} material={m.aluminumDark} />

      {/* Entrance portal */}
      <Box size={[0.5, transom, 0.5]} position={[-portal + 0.25, transom / 2, 0]} material={m.aluminum} />
      <Box size={[0.5, transom, 0.5]} position={[portal - 0.25, transom / 2, 0]} material={m.aluminum} />
      <Box size={[portal * 2, transom - doorH - 0.34, 0.32]} position={[0, (transom + doorH + 0.34) / 2, 0]} material={m.aluminumDark} />
      <AutomaticGlassDoor width={doorW} height={doorH} getOpen={getOpen} getSensor={getSensor} glass={glass} />

      {/* Canopy */}
      <Box size={[13, 0.24, 4.8]} position={[0, 4.32, 2.4]} material={m.wallDark} />
      <Box size={[13, 0.62, 0.14]} position={[0, 4.32, 4.8]} material={m.aluminumDark} />
      <InstancedBoxes items={downlights} material={m.lightWarm} />
      <LogoPlane width={1.85} position={[0, 4.32, 4.88]} />
      <mesh geometry={UNIT_CYL} material={m.aluminum} position={[-6.1, 2.1, 4.4]} scale={[0.16, 4.2, 0.16]} />
      <mesh geometry={UNIT_CYL} material={m.aluminum} position={[6.1, 2.1, 4.4]} scale={[0.16, 4.2, 0.16]} />

      {/* Building mass */}
      <Box size={[width + 0.8, 1.1, 1]} position={[0, height + 0.55, -0.2]} material={m.wallDark} />
      <Box size={[0.8, height + 1.1, depth]} position={[-hw - 0.4, (height + 1.1) / 2, -depth / 2]} material={m.wallDark} />
      <Box size={[0.8, height + 1.1, depth]} position={[hw + 0.4, (height + 1.1) / 2, -depth / 2]} material={m.wallDark} />
      <Box size={[width + 1.6, 0.6, depth]} position={[0, height + 0.8, -depth / 2]} material={m.wallDark} />
      {/* Threshold mat */}
      <Box size={[doorW + 0.6, 0.01, 1.6]} position={[0, 0.005, 0.2]} material={m.rubber} />
      {quality.tier !== "low" && <Box size={[width, 0.04, 0.06]} position={[0, 0.03, 0.2]} material={m.accentBlue} />}
    </group>
  );
}

/** Exterior plaza: approach path, bollard lights, low planters. */
export function EntranceScene({ quality, getOpen, getSensor }: Omit<FacadeProps, "glass">) {
  const m = useMaterials();
  const bollards = useMemo(() => {
    const items: number[][] = [];
    const step = quality.tier === "low" ? 7 : 4.5;
    for (let z = 7; z < 34; z += step) for (const x of [-4.4, 4.4]) items.push([x, 0.45, z, 0.16, 0.9, 0.16]);
    return items;
  }, [quality.tier]);
  const bollardTops = useMemo(() => bollards.map((b) => [b[0], 0.92, b[2], 0.17, 0.05, 0.17]), [bollards]);
  const planters = useMemo(() => {
    const items: number[][] = [];
    for (const z of [9, 19, 29]) for (const x of [-10, 10]) items.push([x, 0.35, z, 3.4, 0.7, 1.3]);
    return items;
  }, []);
  const hedges = useMemo(() => planters.map((p) => [p[0], 0.82, p[2], 3.1, 0.3, 1.05]), [planters]);

  return (
    <group>
      <Facade quality={quality} getOpen={getOpen} getSensor={getSensor} glass={m.heroGlass} />
      <InstancedBoxes items={bollards} material={m.aluminumDark} />
      <InstancedBoxes items={bollardTops} material={m.lightStrip} />
      <InstancedBoxes items={planters} material={m.concrete} />
      <InstancedBoxes items={hedges} material={m.foliage} />
      {/* Path inlays */}
      <Box size={[0.05, 0.01, 34]} position={[-3.2, 0.006, 18]} material={m.aluminum} />
      <Box size={[0.05, 0.01, 34]} position={[3.2, 0.006, 18]} material={m.aluminum} />
    </group>
  );
}
