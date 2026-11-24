"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { Box, InstancedBoxes } from "./parts";
import { useMaterials } from "./materials";
import { scrollState } from "@/lib/store";
import { appIndexAt, SCENE } from "@/lib/scenes";
import { damp } from "@/lib/math";
import type { QualityProfile } from "@/lib/device";

const p = () => scrollState.smooth;

/** Deterministic pseudo-random so the city is identical on every load. */
function rng(seed: number) {
  let s = seed;
  return () => ((s = (s * 16807) % 2147483647) / 2147483647);
}

type Landmark = { x: number; z: number; parts: number[][]; door: number[] };

/** Six application archetypes, matching the order of the Applications list. */
const LANDMARKS: Landmark[] = [
  // Shopping mall — broad, low, long glazed frontage
  { x: -24, z: -22, parts: [[0, 4, 0, 22, 8, 14], [0, 8.6, 0, 16, 1.2, 10]], door: [0, 1.6, 7.05, 8, 3.2, 0.1] },
  // Corporate office — glass tower
  { x: 22, z: -24, parts: [[0, 17, 0, 9, 34, 9], [0, 34.6, 0, 6, 1.2, 6]], door: [0, 1.6, 4.55, 4, 3.2, 0.1] },
  // Retail & commercial — row of units
  { x: -24, z: 22, parts: [[-6, 3, 0, 5.6, 6, 8], [0, 3, 0, 5.6, 6, 8], [6, 3, 0, 5.6, 6, 8]], door: [0, 1.3, 4.05, 16, 2.6, 0.1] },
  // Warehouse — wide shed with shutter
  { x: 24, z: 22, parts: [[0, 5, 0, 18, 10, 16]], door: [0, 2.6, 8.05, 6, 5.2, 0.1] },
  // Factory — sawtooth roof halls
  { x: -52, z: -4, parts: [[0, 5, 0, 16, 10, 22], [-5, 11, 0, 5, 2, 22], [0, 11, 0, 5, 2, 22], [5, 11, 0, 5, 2, 22]], door: [0, 2.4, 11.05, 6, 4.8, 0.1] },
  // Commercial building — mid-rise
  { x: 52, z: 4, parts: [[0, 10, 0, 12, 20, 12], [0, 20.6, 0, 9, 1.2, 9]], door: [0, 1.6, 6.05, 5, 3.2, 0.1] },
];

function Landmark({ data, index }: { data: Landmark; index: number }) {
  const m = useMaterials();
  const doorMat = useMemo(() => new THREE.MeshBasicMaterial({ color: new THREE.Color("#4d8bff"), toneMapped: false }), []);
  const ringMat = useMemo(
    () => new THREE.MeshBasicMaterial({ color: "#4d8bff", transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false }),
    [],
  );
  const st = useRef(0);
  const ring = useRef<THREE.Mesh>(null);
  useFrame((s, dt) => {
    const inApps = p() > SCENE.applications - 0.2 && p() < SCENE.applications + 0.85;
    const active = inApps && appIndexAt(p()) === index ? 1 : 0;
    st.current = damp(st.current, active, 4, Math.min(dt, 0.05));
    const v = st.current;
    doorMat.color.setRGB(0.3 + v * 1.6, 0.55 + v * 1.6, 1 + v * 1.8);
    ringMat.opacity = v * (0.5 + 0.3 * Math.sin(s.clock.elapsedTime * 3));
    ring.current?.scale.setScalar(1 + ((s.clock.elapsedTime * 0.5) % 1) * 0.15);
  });
  const radius = useMemo(() => Math.max(...data.parts.map((q) => Math.max(q[3], q[5]))) * 0.75 + 3, [data.parts]);
  return (
    <group position={[data.x, 0, data.z]}>
      {data.parts.map((q, i) => (
        <Box key={i} size={[q[3], q[4], q[5]]} position={[q[0], q[1], q[2]]} material={i === 0 && index === 1 ? m.facadeGlass : m.cityBlock} />
      ))}
      {index === 1 && <Box size={[8.6, 33.6, 8.6]} position={[0, 17, 0]} material={m.tinted} />}
      <Box size={[data.door[3], data.door[4], data.door[5]]} position={[data.door[0], data.door[1], data.door[2]]} material={doorMat} />
      <mesh ref={ring} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.05, 0]} material={ringMat}>
        <ringGeometry args={[radius, radius + 0.35, 96]} />
      </mesh>
    </group>
  );
}

/** Night-time city used for the Applications and Why sequences. */
export function CityScene({ quality }: { quality: QualityProfile }) {
  const m = useMaterials();
  const { blocks, entrances, lamps } = useMemo(() => {
    const r = rng(7);
    const blocks: number[][] = [];
    const entrances: number[][] = [];
    const lamps: number[][] = [];
    const keepOut = LANDMARKS.map((l) => [l.x, l.z]);
    for (let x = -150; x <= 150; x += 14) {
      for (let z = -200; z <= 150; z += 14) {
        if (blocks.length >= quality.cityBlocks) break;
        if (Math.abs(x) < 10 || Math.abs(z) < 9) continue; // avenues
        if (keepOut.some(([kx, kz]) => Math.abs(kx - x) < 20 && Math.abs(kz - z) < 18)) continue;
        if (r() < 0.25) continue;
        const w = 6 + r() * 5;
        const d = 6 + r() * 5;
        const h = 5 + Math.pow(r(), 2.2) * (Math.hypot(x, z) < 70 ? 30 : 55);
        blocks.push([x, h / 2, z, w, h, d]);
        entrances.push([x, 1.1, z + d / 2 + 0.03, Math.min(2.4, w * 0.4), 2.2, 0.06]);
      }
    }
    for (let z = -200; z < 150; z += 12) for (const x of [-7.5, 7.5]) lamps.push([x, 0.08, z, 0.4, 0.06, 1.6]);
    return { blocks, entrances, lamps };
  }, [quality.cityBlocks]);

  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, -25]} material={m.asphalt}>
        <planeGeometry args={[420, 420]} />
      </mesh>
      <Box size={[14, 0.02, 420]} position={[0, 0.01, -25]} material={m.stoneDark} />
      <Box size={[420, 0.02, 12]} position={[0, 0.01, 0]} material={m.stoneDark} />
      <InstancedBoxes items={blocks} material={m.cityBlock} />
      <InstancedBoxes items={entrances} material={m.lightWarm} />
      <InstancedBoxes items={lamps} material={m.lightStrip} />
      {LANDMARKS.map((l, i) => (
        <Landmark key={i} data={l} index={i} />
      ))}
    </group>
  );
}
