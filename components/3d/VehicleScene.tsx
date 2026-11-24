"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { IndustrialShutter } from "./IndustrialShutter";
import { Box, InstancedBoxes, UNIT_CYL } from "./parts";
import { getBeamTexture, useMaterials } from "./materials";
import { scrollState } from "@/lib/store";
import { shutterOpen, shutterSensor, vehicleZ } from "@/lib/scenes";
import type { QualityProfile } from "@/lib/device";

const OPEN_W = 8;
const OPEN_H = 6;
const BLD_W = 34;
const BLD_H = 13;
const BLD_D = 36;

const p = () => scrollState.smooth;

/** Box truck — cab + cargo body + wheels + headlights. */
function Truck() {
  const m = useMaterials();
  const ref = useRef<THREE.Group>(null);
  const wheels = useRef<THREE.Group>(null);
  const lastZ = useRef(0);
  const beam = useMemo(
    () => new THREE.MeshBasicMaterial({ map: getBeamTexture(), color: "#cfe0ff", transparent: true, opacity: 0.16, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide }),
    [],
  );
  useFrame(() => {
    const z = vehicleZ(p());
    if (ref.current) ref.current.position.z = z;
    if (wheels.current) {
      const dz = z - lastZ.current;
      wheels.current.children.forEach((w) => (w.rotation.x += dz / 0.5));
    }
    lastZ.current = z;
  });
  return (
    <group ref={ref} position={[-1.2, 0, 60]}>
      {/* cargo body (truck drives toward -z) */}
      <Box size={[2.5, 2.9, 6.2]} position={[0, 2.05, 1.4]} material={m.paint} />
      <Box size={[2.52, 0.08, 6.22]} position={[0, 0.62, 1.4]} material={m.aluminumDark} />
      {/* cab */}
      <Box size={[2.4, 2.3, 2.1]} position={[0, 1.65, -2.8]} material={m.paint} />
      <Box size={[2.2, 0.9, 0.06]} position={[0, 2.2, -3.86]} material={m.tinted} />
      <Box size={[2.42, 0.5, 0.1]} position={[0, 0.75, -3.88]} material={m.aluminumDark} />
      <Box size={[0.4, 0.14, 0.04]} position={[-0.85, 0.95, -3.92]} material={m.lightStrip} />
      <Box size={[0.4, 0.14, 0.04]} position={[0.85, 0.95, -3.92]} material={m.lightStrip} />
      {/* headlight beams */}
      <mesh material={beam} position={[0, 0.5, -8]} rotation={[-Math.PI / 2 + 0.06, 0, 0]}>
        <planeGeometry args={[3.2, 8]} />
      </mesh>
      <group ref={wheels}>
        {[[-1.15, -2.7], [1.15, -2.7], [-1.15, 2.6], [1.15, 2.6], [-1.15, 3.6], [1.15, 3.6]].map(([x, z]) => (
          <mesh key={`${x}${z}`} geometry={UNIT_CYL} material={m.rubber} position={[x, 0.48, z]} rotation={[0, 0, Math.PI / 2]} scale={[0.96, 0.34, 0.96]} />
        ))}
      </group>
    </group>
  );
}

/** Warehouse exterior + yard + interior bay, with the industrial shutter and vehicle access sequence. */
export function VehicleScene({ quality }: { quality: QualityProfile }) {
  const m = useMaterials();
  const hw = BLD_W / 2;
  const sideW = (BLD_W - OPEN_W) / 2;

  const laneMarks = useMemo(() => {
    const items: number[][] = [];
    for (let z = 4; z < 70; z += 4) items.push([-1.2 - 2.1, 0.008, z, 0.12, 0.01, 2]);
    for (let z = 4; z < 70; z += 4) items.push([-1.2 + 2.1, 0.008, z, 0.12, 0.01, 2]);
    items.push([0, 0.008, 3, OPEN_W, 0.01, 0.16]);
    return items;
  }, []);
  const poles = useMemo(() => [[-12, 4.5, 16], [12, 4.5, 4], [-12, 4.5, 38], [12, 4.5, 40]], []);
  const interiorLights = useMemo(() => {
    const items: number[][] = [];
    for (const z of [-6, -14, -22, -30]) for (const x of [-8, 0, 8]) items.push([x, BLD_H - 1.2, z, 2.6, 0.06, 0.24]);
    return items;
  }, []);
  const racks = useMemo(() => {
    const items: number[][] = [];
    const n = quality.tier === "low" ? 2 : 4;
    for (let i = 0; i < n; i++) for (const x of [-12, 12]) items.push([x, 3, -8 - i * 6, 1.2, 6, 4.5]);
    return items;
  }, [quality.tier]);
  const wallPanels = useMemo(() => {
    const items: number[][] = [];
    for (let x = -hw + 1.2; x < hw; x += 2.4) if (Math.abs(x) > OPEN_W / 2 + 0.8) items.push([x, BLD_H / 2, 0.22, 0.05, BLD_H, 0.06]);
    return items;
  }, [hw]);

  return (
    <group>
      {/* Yard */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 20]} material={m.asphalt}>
        <planeGeometry args={[160, 140]} />
      </mesh>
      <InstancedBoxes items={laneMarks} material={m.paint} />
      {poles.map(([x, y, z]) => (
        <group key={`${x}${z}`}>
          <mesh geometry={UNIT_CYL} material={m.aluminumDark} position={[x, y, z]} scale={[0.14, 9, 0.14]} />
          <Box size={[1.4, 0.12, 0.4]} position={[x * 0.92, 9, z]} material={m.lightStrip} />
        </group>
      ))}

      {/* Facade with opening */}
      <Box size={[sideW, BLD_H, 0.4]} position={[-hw + sideW / 2, BLD_H / 2, 0]} material={m.concrete} />
      <Box size={[sideW, BLD_H, 0.4]} position={[hw - sideW / 2, BLD_H / 2, 0]} material={m.concrete} />
      <Box size={[OPEN_W, BLD_H - OPEN_H, 0.4]} position={[0, OPEN_H + (BLD_H - OPEN_H) / 2, 0]} material={m.concrete} />
      <InstancedBoxes items={wallPanels} material={m.wallDark} />
      <Box size={[BLD_W + 0.4, 0.5, 0.6]} position={[0, BLD_H + 0.25, 0]} material={m.aluminumDark} />
      <Box size={[OPEN_W + 0.8, 0.06, 0.08]} position={[0, OPEN_H + 1.15, 0.72]} material={m.accentBlue} />

      {/* Building shell */}
      <Box size={[0.4, BLD_H, BLD_D]} position={[-hw, BLD_H / 2, -BLD_D / 2]} material={m.concrete} />
      <Box size={[0.4, BLD_H, BLD_D]} position={[hw, BLD_H / 2, -BLD_D / 2]} material={m.concrete} />
      <Box size={[BLD_W, 0.4, BLD_D]} position={[0, BLD_H, -BLD_D / 2]} material={m.concrete} />
      <Box size={[BLD_W, BLD_H, 0.4]} position={[0, BLD_H / 2, -BLD_D]} material={m.wallDark} />
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.004, -BLD_D / 2]} material={m.stoneDark}>
        <planeGeometry args={[BLD_W, BLD_D]} />
      </mesh>
      <InstancedBoxes items={interiorLights} material={m.lightWarm} />
      <InstancedBoxes items={racks} material={m.steel} />

      <IndustrialShutter width={OPEN_W} height={OPEN_H} position={[0, 0, 0]} getOpen={() => shutterOpen(p())} getSensor={() => shutterSensor(p())} />
      <Truck />
    </group>
  );
}
