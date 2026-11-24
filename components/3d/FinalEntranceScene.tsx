"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { Facade } from "./EntranceScene";
import { Floor } from "./Floor";
import { Box, InstancedBoxes } from "./parts";
import { getGlowTexture, useMaterials } from "./materials";
import { scrollState } from "@/lib/store";
import { finalDoorOpen, finalLight, finalSensor, processProgress } from "@/lib/scenes";
import { clamp, damp } from "@/lib/math";
import type { QualityProfile } from "@/lib/device";

const p = () => scrollState.smooth;
export const MARKER_Z = [84, 70, 56, 42, 28];

/** Floor marker that ignites as the visitor walks past it (one per process step). */
function Marker({ z, index }: { z: number; index: number }) {
  const mat = useMemo(() => new THREE.MeshBasicMaterial({ color: new THREE.Color("#223a6e"), toneMapped: false }), []);
  const v = useRef(0);
  useFrame((_, dt) => {
    const lit = clamp(processProgress(p()) - index);
    v.current = damp(v.current, lit > 0.05 ? 1 : 0, 4, Math.min(dt, 0.05));
    mat.color.setRGB(0.13 + v.current * 0.9, 0.23 + v.current * 1.3, 0.43 + v.current * 1.9);
  });
  return (
    <group position={[0, 0, z]}>
      <Box size={[7, 0.02, 0.08]} position={[0, 0.012, 0]} material={mat} />
      <Box size={[0.08, 0.02, 1.2]} position={[-3.5, 0.012, 0]} material={mat} />
      <Box size={[0.08, 0.02, 1.2]} position={[3.5, 0.012, 0]} material={mat} />
    </group>
  );
}

/** The final approach: illuminated walkway (process steps) leading to a second entrance flooded with light. */
export function FinalEntranceScene({ quality }: { quality: QualityProfile }) {
  const m = useMaterials();
  const lightRoom = useMemo(() => new THREE.MeshBasicMaterial({ color: new THREE.Color("#ffffff"), toneMapped: false, side: THREE.BackSide }), []);
  // The room's own floor sits just above the dark walkway so no hard horizon shows inside the light.
  const roomFloor = useMemo(() => new THREE.MeshBasicMaterial({ color: new THREE.Color("#ffffff"), toneMapped: false }), []);
  const spill = useMemo(
    () => new THREE.SpriteMaterial({ map: getGlowTexture(), color: "#bcd4ff", transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false }),
    [],
  );
  const floorGlow = useMemo(
    () => new THREE.MeshBasicMaterial({ map: getGlowTexture(), color: "#9cc0ff", transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false }),
    [],
  );
  useFrame(() => {
    const l = finalLight(p());
    const k = 0.35 + l * 2.6;
    lightRoom.color.setRGB(0.55 * k, 0.7 * k, 1.0 * k);
    roomFloor.color.setRGB(0.5 * k, 0.64 * k, 0.92 * k);
    spill.opacity = l * 0.85;
    floorGlow.opacity = l * 0.7;
  });

  const walls = useMemo(() => {
    const items: number[][] = [];
    for (const x of [-6, 6]) items.push([x, 0.4, 56, 0.6, 0.8, 76]);
    return items;
  }, []);
  const strips = useMemo(() => [-5.68, 5.68].map((x) => [x, 0.6, 56, 0.03, 0.03, 76]), []);

  return (
    <group>
      <Floor quality={quality} size={[90, 130]} position={[0, 0, 40]} color="#0a0d13" mirror={0.55} />
      <InstancedBoxes items={walls} material={m.stoneDark} />
      <InstancedBoxes items={strips} material={m.accentBlue} />
      {MARKER_Z.map((z, i) => (
        <Marker key={z} z={z} index={i} />
      ))}

      <Facade quality={quality} getOpen={() => finalDoorOpen(p())} getSensor={() => finalSensor(p())} depth={20} width={30} height={9} />

      {/* Light-filled interior */}
      <mesh material={lightRoom} position={[0, 4.5, -10.2]}>
        <boxGeometry args={[29, 9, 20]} />
      </mesh>
      <mesh material={roomFloor} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.03, -10.2]}>
        <planeGeometry args={[29, 20]} />
      </mesh>
      <sprite material={spill} position={[0, 1.8, 0.6]} scale={[14, 8, 1]} />
      <mesh material={floorGlow} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 3]}>
        <planeGeometry args={[12, 10]} />
      </mesh>
    </group>
  );
}
