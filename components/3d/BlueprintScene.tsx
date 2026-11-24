"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Grid, Line } from "@react-three/drei";
import * as THREE from "three";
import { AutomaticGlassDoor } from "./AutomaticGlassDoor";
import { createDoorMaterials } from "./materials";
import { TechLabel } from "./TechLabel";
import { scrollState } from "@/lib/store";
import { blueprintDoorOpen, blueprintMix, blueprintScan } from "@/lib/scenes";
import type { QualityProfile } from "@/lib/device";

const p = () => scrollState.smooth;
const W = 5;
const H = 2.9;

function Dimension({ a, b, getVisible }: { a: [number, number, number]; b: [number, number, number]; getVisible: () => number }) {
  const ref = useRef<THREE.Group>(null);
  const tick = 0.12;
  const horizontal = a[1] === b[1];
  useFrame(() => {
    const v = getVisible();
    ref.current?.traverse((o) => {
      const mat = (o as THREE.Mesh).material as THREE.Material & { opacity?: number };
      if (mat && "opacity" in mat) mat.opacity = v * 0.9;
    });
    if (ref.current) ref.current.visible = v > 0.01;
  });
  const t1: [number, number, number][] = horizontal
    ? [[a[0], a[1] - tick, a[2]], [a[0], a[1] + tick, a[2]]]
    : [[a[0] - tick, a[1], a[2]], [a[0] + tick, a[1], a[2]]];
  const t2: [number, number, number][] = horizontal
    ? [[b[0], b[1] - tick, b[2]], [b[0], b[1] + tick, b[2]]]
    : [[b[0] - tick, b[1], b[2]], [b[0] + tick, b[1], b[2]]];
  return (
    <group ref={ref}>
      <Line points={[a, b]} color="#7fb0ff" lineWidth={1} transparent dashed dashSize={0.08} gapSize={0.05} />
      <Line points={t1} color="#7fb0ff" lineWidth={1} transparent />
      <Line points={t2} color="#7fb0ff" lineWidth={1} transparent />
    </group>
  );
}

/**
 * Engineering view: the realistic door dissolves into its technical wireframe —
 * dimensions and system components annotated — then resolves back.
 */
export function BlueprintScene({ quality }: { quality: QualityProfile }) {
  const mats = useMemo(() => createDoorMaterials({ fadeable: true }), []);
  const scan = useRef<THREE.Mesh>(null);
  const base = useRef({
    alu: 1,
    aluDark: 1,
    glass: mats.glass.opacity,
    rubber: 1,
  });

  useFrame(() => {
    const b = blueprintMix(p());
    const solid = 1 - b;
    mats.aluminum.opacity = base.current.alu * Math.max(solid, 0.04);
    mats.aluminumDark.opacity = base.current.aluDark * Math.max(solid, 0.04);
    mats.rubber.opacity = solid;
    mats.glass.opacity = base.current.glass * Math.max(solid, 0.25);
    mats.aluminum.depthWrite = solid > 0.5;
    mats.aluminumDark.depthWrite = solid > 0.5;
    if (mats.edges) mats.edges.opacity = b;
    if (scan.current) {
      const s = blueprintScan(p());
      scan.current.position.x = -W / 2 - 1 + s * (W + 2);
      (scan.current.material as THREE.MeshBasicMaterial).opacity = Math.sin(s * Math.PI) * 0.5;
    }
  });

  const vis = () => blueprintMix(p());

  return (
    <group>
      <Grid
        position={[0, 0.001, 0]}
        args={[60, 60]}
        cellSize={0.5}
        cellThickness={0.6}
        cellColor="#0f2a5e"
        sectionSize={2.5}
        sectionThickness={1}
        sectionColor="#2457c9"
        fadeDistance={34}
        fadeStrength={1.4}
        infiniteGrid
      />
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]}>
        <planeGeometry args={[200, 200]} />
        <meshStandardMaterial color="#030b1e" roughness={0.6} metalness={0.3} />
      </mesh>

      <AutomaticGlassDoor width={W} height={H} materials={mats} getOpen={() => blueprintDoorOpen(p())} getSensor={() => vis()} showField />

      <mesh ref={scan} position={[-W, H / 2 + 0.2, 0.2]}>
        <planeGeometry args={[0.05, H + 1.2]} />
        <meshBasicMaterial color="#7fb0ff" transparent opacity={0} blending={THREE.AdditiveBlending} depthWrite={false} toneMapped={false} />
      </mesh>

      <Dimension a={[-W / 2 - 0.1, -0.0 + 0.02, 0.6]} b={[W / 2 + 0.1, 0.02, 0.6]} getVisible={vis} />
      <Dimension a={[W / 2 + 0.55, 0, 0.2]} b={[W / 2 + 0.55, H, 0.2]} getVisible={vis} />

      {quality.labels && (
        <>
          <TechLabel position={[0, H - 0.1, 0.35]} title="01 · Motion sensor" detail="Detects approach" getVisible={vis} side="left" />
          <TechLabel position={[-0.9, H + 0.3, 0.25]} title="02 · Automatic control" detail="Processes the signal" getVisible={vis} />
          <TechLabel position={[1.9, H + 0.05, 0.25]} title="03 · Motor system" detail="Drives the belt" getVisible={vis} />
          <TechLabel position={[1.2, 1.2, 0.1]} title="04 · Sliding panels" detail="Glide on the track" getVisible={vis} />
          <TechLabel position={[0, 0.05, 0.6]} title="Width" getVisible={vis} />
          <TechLabel position={[W / 2 + 0.55, H / 2, 0.2]} title="Height" getVisible={vis} />
        </>
      )}
    </group>
  );
}
