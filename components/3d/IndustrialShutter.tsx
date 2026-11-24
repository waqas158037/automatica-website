"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { Box, UNIT_BOX } from "./parts";
import { getGlowTexture, useMaterials } from "./materials";
import { damp } from "@/lib/math";

type Props = {
  width?: number;
  height?: number;
  getOpen: () => number;
  getSensor?: () => number;
  position?: [number, number, number];
};

const PITCH = 0.16;

/**
 * Commercial roller shutter: horizontal interlocking steel slats running in side
 * guide rails, a heavy bottom bar, and an external coil housing with motion sensor.
 * Slats retract upward into the lintel/housing zone.
 */
export function IndustrialShutter({ width = 8, height = 6, getOpen, getSensor, position }: Props) {
  const m = useMaterials();
  const count = Math.ceil(height / PITCH);
  const slats = useRef<THREE.InstancedMesh>(null);
  const bottom = useRef<THREE.Group>(null);
  const glow = useRef<THREE.Sprite>(null);
  const field = useRef<THREE.Mesh>(null);
  const st = useRef({ open: -1, sensor: 0 });
  const tmp = useMemo(() => new THREE.Object3D(), []);
  const slatMat = useMemo(() => {
    const mat = m.shutterSlat.clone();
    return mat;
  }, [m.shutterSlat]);
  const lens = useMemo(() => m.sensorLens.clone(), [m.sensorLens]);
  const glowMat = useMemo(
    () => new THREE.SpriteMaterial({ map: getGlowTexture(), color: "#6aa0ff", transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false }),
    [],
  );
  const fieldMat = useMemo(
    () => new THREE.MeshBasicMaterial({ color: "#4d8bff", transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide }),
    [],
  );
  const fieldGeo = useMemo(() => new THREE.ConeGeometry(3.2, 7, 48, 1, true), []);

  useFrame((s, dt) => {
    const d = Math.min(dt, 0.05);
    const target = getOpen();
    const prev = st.current.open;
    st.current.open = prev < 0 ? target : damp(prev, target, 5, d);
    const lift = st.current.open * (height - 0.25);
    const mesh = slats.current;
    if (mesh && Math.abs(prev - st.current.open) > 1e-4) {
      for (let i = 0; i < count; i++) {
        const y = i * PITCH + PITCH / 2 + 0.14 + lift;
        tmp.position.set(0, y, 0);
        // Slats that have rolled into the housing are hidden.
        const hidden = y > height + 0.1;
        tmp.scale.set(hidden ? 0 : width, PITCH * 0.93, hidden ? 0 : 0.05);
        tmp.updateMatrix();
        mesh.setMatrixAt(i, tmp.matrix);
      }
      mesh.instanceMatrix.needsUpdate = true;
    }
    if (bottom.current) bottom.current.position.y = lift;

    const sensor = getSensor ? getSensor() : 0;
    st.current.sensor = damp(st.current.sensor, sensor, 6, d);
    const pulse = 0.7 + 0.3 * Math.sin(s.clock.elapsedTime * 7);
    lens.emissiveIntensity = 0.3 + st.current.sensor * 5 * pulse;
    glowMat.opacity = st.current.sensor * pulse;
    if (field.current) fieldMat.opacity = st.current.sensor * 0.06;
  });

  return (
    <group position={position}>
      <instancedMesh ref={slats} args={[UNIT_BOX, slatMat, count]} frustumCulled={false} />
      {/* Bottom bar with rubber seal */}
      <group ref={bottom}>
        <Box size={[width, 0.14, 0.09]} position={[0, 0.09, 0]} material={m.steel} />
        <Box size={[width, 0.03, 0.06]} position={[0, 0.015, 0]} material={m.rubber} />
      </group>
      {/* Side guide rails */}
      <Box size={[0.16, height + 0.2, 0.22]} position={[-width / 2 - 0.06, (height + 0.2) / 2, 0]} material={m.aluminumDark} />
      <Box size={[0.16, height + 0.2, 0.22]} position={[width / 2 + 0.06, (height + 0.2) / 2, 0]} material={m.aluminumDark} />
      {/* Coil housing */}
      <Box size={[width + 0.7, 0.9, 0.85]} position={[0, height + 0.55, 0.32]} material={m.steel} />
      <Box size={[width + 0.72, 0.05, 0.86]} position={[0, height + 0.12, 0.32]} material={m.aluminumDark} />
      {/* Sensor */}
      <Box size={[0.5, 0.16, 0.16]} position={[0, height + 0.02, 0.8]} material={m.aluminumDark} />
      <Box size={[0.3, 0.04, 0.05]} position={[0, height - 0.06, 0.86]} material={lens} />
      <sprite ref={glow} material={glowMat} position={[0, height - 0.06, 0.95]} scale={[1, 1, 1]} />
      <mesh ref={field} geometry={fieldGeo} material={fieldMat} position={[0, height - 0.06 - 3.5, 2.6]} rotation={[-0.55, 0, 0]} />
    </group>
  );
}
