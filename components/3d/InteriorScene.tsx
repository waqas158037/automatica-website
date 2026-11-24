"use client";

import { useMemo } from "react";
import { AutomaticGlassDoor } from "./AutomaticGlassDoor";
import { LogoPlane } from "./EntranceScene";
import { Box, InstancedBoxes, UNIT_CYL } from "./parts";
import { useMaterials } from "./materials";
import { TechLabel } from "./TechLabel";
import { scrollState } from "@/lib/store";
import { displayAOpen, SCENE } from "@/lib/scenes";
import { window4 } from "@/lib/math";
import type { QualityProfile } from "@/lib/device";

const ROOM_W = 33;
const ROOM_H = 7;
const ROOM_D = 46;

/** Display B demonstrates continuous operation: open, hold, close, hold. */
function cycleOpen() {
  const t = (performance.now() / 1000) % 6.5;
  if (t < 0.4) return 0;
  if (t < 3.6) return 1;
  return 0;
}

const p = () => scrollState.smooth;
const labelsA = () => window4(p(), SCENE.solGlass + 0.26, SCENE.solGlass + 0.34, SCENE.solGlass + 0.56, SCENE.solGlass + 0.64);

/** Premium showroom interior with the brand wall and two product display doors. */
export function InteriorScene({ quality }: { quality: QualityProfile }) {
  const m = useMaterials();
  const hw = ROOM_W / 2;

  const ceilingStrips = useMemo(() => [-9, -3, 3, 9].map((x) => [x, ROOM_H - 0.03, -ROOM_D / 2, 0.09, 0.04, ROOM_D - 2]), []);
  const fins = useMemo(() => {
    const items: number[][] = [];
    const step = quality.tier === "low" ? 3 : 1.5;
    for (let z = -2; z > -ROOM_D; z -= step) for (const x of [-hw + 0.2, hw - 0.2]) items.push([x, ROOM_H / 2, z, 0.06, ROOM_H, 0.34]);
    return items;
  }, [hw, quality.tier]);
  const columns = useMemo(() => {
    const out: [number, number][] = [];
    for (const z of [-12, -26, -40]) for (const x of [-10.5, 10.5]) out.push([x, z]);
    return out;
  }, []);
  const planters = useMemo(() => [
    [-14.6, 0.4, -9, 1.3, 0.8, 3.2],
    [14.6, 0.4, -18, 1.3, 0.8, 3.2],
    [-14.6, 0.4, -34, 1.3, 0.8, 3.2],
    [14.6, 0.4, -40, 1.3, 0.8, 3.2],
  ], []);
  const foliage = useMemo(() => planters.map((q) => [q[0], 0.95, q[2], 1.1, 0.4, 3]), [planters]);

  return (
    <group>
      {/* Envelope */}
      <Box size={[ROOM_W, 0.1, ROOM_D]} position={[0, ROOM_H + 0.05, -ROOM_D / 2]} material={m.ceiling} />
      <InstancedBoxes items={ceilingStrips} material={m.lightStrip} />
      <InstancedBoxes items={fins} material={m.aluminumDark} />
      <Box size={[0.04, 0.03, ROOM_D]} position={[-hw + 0.45, 0.05, -ROOM_D / 2]} material={m.accentBlue} />
      <Box size={[0.04, 0.03, ROOM_D]} position={[hw - 0.45, 0.05, -ROOM_D / 2]} material={m.accentBlue} />
      {columns.map(([x, z]) => (
        <mesh key={`${x}${z}`} geometry={UNIT_CYL} material={m.stoneDark} position={[x, ROOM_H / 2, z]} scale={[0.7, ROOM_H, 0.7]} />
      ))}
      <InstancedBoxes items={planters} material={m.concrete} />
      <InstancedBoxes items={foliage} material={m.foliage} />

      {/* Brand wall */}
      <Box size={[ROOM_W, ROOM_H, 0.3]} position={[0, ROOM_H / 2, -ROOM_D]} material={m.wallDark} />
      <Box size={[12, 3, 0.1]} position={[0, 3.3, -ROOM_D + 0.2]} material={m.aluminumDark} />
      <Box size={[12, 0.04, 0.06]} position={[0, 4.82, -ROOM_D + 0.28]} material={m.lightStrip} />
      <Box size={[12, 0.03, 0.06]} position={[0, 1.78, -ROOM_D + 0.28]} material={m.accentBlue} />
      <LogoPlane width={8.4} position={[0, 3.3, -ROOM_D + 0.27]} />

      {/* Display A — automatic glass door (hover to trigger the sensor) */}
      <group position={[-4.8, 0, -21]} rotation={[0, 0.5, 0]}>
        <Box size={[5.6, 0.1, 1.9]} position={[0, 0.05, 0]} material={m.stoneDark} />
        <Box size={[5.6, 0.02, 0.03]} position={[0, 0.1, 0.95]} material={m.accentBlue} />
        <AutomaticGlassDoor width={4.4} height={2.75} position={[0, 0.1, 0]} interactive getOpen={() => displayAOpen(p())} getSensor={() => window4(p(), 2.12, 2.18, 2.5, 2.6)}>
          {quality.labels && (
            <>
              <TechLabel position={[0, 2.95, 0.3]} title="Motion sensor" detail="Detects approach" getVisible={labelsA} />
              <TechLabel position={[1.9, 2.95, 0.2]} title="Operator" detail="Motor · belt drive · control" getVisible={labelsA} />
              <TechLabel position={[1.4, 1.4, 0.1]} title="Sliding leaf" detail="Framed safety glass" getVisible={labelsA} />
              <TechLabel position={[-1.2, 0.12, 0.2]} title="Floor guide" detail="Keeps leaves on track" getVisible={labelsA} side="left" />
            </>
          )}
        </AutomaticGlassDoor>
      </group>

      {/* Display B — sliding door in continuous operation */}
      <group position={[4.8, 0, -33]} rotation={[0, -0.5, 0]}>
        <Box size={[5.6, 0.1, 1.9]} position={[0, 0.05, 0]} material={m.stoneDark} />
        <Box size={[5.6, 0.02, 0.03]} position={[0, 0.1, 0.95]} material={m.accentBlue} />
        <AutomaticGlassDoor width={4.4} height={2.75} position={[0, 0.1, 0]} interactive getOpen={cycleOpen} getSensor={cycleOpen} />
      </group>
    </group>
  );
}
