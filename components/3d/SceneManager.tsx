"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { EntranceScene } from "./EntranceScene";
import { InteriorScene } from "./InteriorScene";
import { VehicleScene } from "./VehicleScene";
import { BlueprintScene } from "./BlueprintScene";
import { CityScene } from "./CityScene";
import { FinalEntranceScene } from "./FinalEntranceScene";
import { Floor } from "./Floor";
import { Particles } from "./Particles";
import { ENV_OFFSET, envAt, heroDoorOpen, heroSensor, type EnvId } from "@/lib/scenes";
import { scrollState, useUI } from "@/lib/store";
import type { QualityProfile } from "@/lib/device";

const p = () => scrollState.smooth;
const ENVS: EnvId[] = ["entrance", "warehouse", "blueprint", "city", "final"];

/** Owns all environments; only the active one is rendered each frame. */
export function SceneManager({ quality }: { quality: QualityProfile }) {
  const reduced = useUI((s) => s.reducedMotion);
  const groups = useRef<Partial<Record<EnvId, THREE.Group | null>>>({});

  useFrame(() => {
    const active = envAt(p());
    for (const id of ENVS) {
      const g = groups.current[id];
      if (g) g.visible = id === active;
    }
  });

  const bind = (id: EnvId) => (el: THREE.Group | null) => {
    groups.current[id] = el;
  };

  return (
    <>
      <group ref={bind("entrance")} position={ENV_OFFSET.entrance as unknown as [number, number, number]}>
        <Floor quality={quality} size={[90, 100]} position={[0, 0, -4]} />
        <EntranceScene quality={quality} getOpen={() => heroDoorOpen(p())} getSensor={() => heroSensor(p())} />
        <InteriorScene quality={quality} />
        {!reduced && <Particles count={quality.particles} box={[28, 6.5, 40]} position={[0, 0, -24]} />}
      </group>
      <group ref={bind("warehouse")} position={ENV_OFFSET.warehouse as unknown as [number, number, number]}>
        <VehicleScene quality={quality} />
      </group>
      <group ref={bind("blueprint")} position={ENV_OFFSET.blueprint as unknown as [number, number, number]}>
        <BlueprintScene quality={quality} />
        {!reduced && <Particles count={Math.round(quality.particles / 3)} box={[14, 5, 10]} color="#5d8dff" size={0.04} />}
      </group>
      <group ref={bind("city")} position={ENV_OFFSET.city as unknown as [number, number, number]}>
        <CityScene quality={quality} />
      </group>
      <group ref={bind("final")} position={ENV_OFFSET.final as unknown as [number, number, number]}>
        <FinalEntranceScene quality={quality} />
        {!reduced && <Particles count={Math.round(quality.particles / 2)} box={[10, 5, 14]} position={[0, 0, 2]} color="#dfe9ff" />}
      </group>
    </>
  );
}
