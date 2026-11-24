"use client";

import { useMemo, useRef, useState, type ReactNode } from "react";
import { useFrame, type ThreeEvent } from "@react-three/fiber";
import * as THREE from "three";
import { Box } from "./parts";
import { getGlowTexture, useMaterials, type DoorMaterials } from "./materials";
import { damp } from "@/lib/math";
import { ui } from "@/lib/store";

type V3 = [number, number, number];

export type AutomaticGlassDoorProps = {
  /** Overall structural width (two fixed side lights + two sliding leaves). */
  width?: number;
  height?: number;
  /** Target openness 0..1, sampled every frame. */
  getOpen: () => number;
  /** Sensor activation 0..1, sampled every frame. */
  getSensor?: () => number;
  materials?: DoorMaterials;
  glass?: THREE.Material;
  /** Hovering the door "presents" the visitor to the sensor and opens it. */
  interactive?: boolean;
  showField?: boolean;
  position?: V3;
  rotation?: V3;
  children?: ReactNode;
};

const FRAME = 0.05;
const RAIL_TOP = 0.08;
const RAIL_BOTTOM = 0.12;

function Leaf({ w, h, m, glass }: { w: number; h: number; m: DoorMaterials; glass: THREE.Material }) {
  const e = m.edges;
  return (
    <group>
      <Box size={[w - FRAME * 2, h - RAIL_TOP - RAIL_BOTTOM, 0.014]} position={[0, RAIL_BOTTOM + (h - RAIL_TOP - RAIL_BOTTOM) / 2, 0]} material={glass} edges={e} />
      <Box size={[FRAME, h, 0.05]} position={[-w / 2 + FRAME / 2, h / 2, 0]} material={m.aluminum} edges={e} />
      <Box size={[FRAME, h, 0.05]} position={[w / 2 - FRAME / 2, h / 2, 0]} material={m.aluminum} edges={e} />
      <Box size={[w, RAIL_TOP, 0.05]} position={[0, h - RAIL_TOP / 2, 0]} material={m.aluminum} edges={e} />
      <Box size={[w, RAIL_BOTTOM, 0.05]} position={[0, RAIL_BOTTOM / 2, 0]} material={m.aluminum} edges={e} />
      {/* meeting-stile brush seal */}
      <Box size={[0.012, h - 0.2, 0.03]} position={[0, h / 2, 0.028]} material={m.rubber} />
    </group>
  );
}

/**
 * A commercial bi-parting automatic sliding door: header-mounted operator,
 * motion sensor, two sliding leaves gliding in front of two fixed side lights,
 * and a floor guide track.
 */
export function AutomaticGlassDoor({
  width = 6,
  height = 3,
  getOpen,
  getSensor,
  materials,
  glass,
  interactive = false,
  showField = true,
  position,
  rotation,
  children,
}: AutomaticGlassDoorProps) {
  const ctx = useMaterials();
  const m = materials ?? ctx;
  const glassMat = glass ?? m.glass;
  const e = m.edges;
  const leafW = width / 4;
  const left = useRef<THREE.Group>(null);
  const right = useRef<THREE.Group>(null);
  const field = useRef<THREE.Mesh>(null);
  const ring = useRef<THREE.Mesh>(null);
  const glow = useRef<THREE.Sprite>(null);
  const state = useRef({ open: 0, sensor: 0, hover: 0 });
  const [hovered, setHovered] = useState(false);
  const lens = useMemo(() => m.sensorLens.clone(), [m]);

  const fieldMat = useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        color: "#4d8bff",
        transparent: true,
        opacity: 0,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        side: THREE.DoubleSide,
      }),
    [],
  );
  const ringMat = useMemo(() => fieldMat.clone(), [fieldMat]);
  const glowMat = useMemo(
    () => new THREE.SpriteMaterial({ map: getGlowTexture(), color: "#6aa0ff", transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false }),
    [],
  );
  const fieldGeo = useMemo(() => new THREE.ConeGeometry(1.7, height - 0.1, 40, 1, true), [height]);
  const ringGeo = useMemo(() => new THREE.RingGeometry(1.45, 1.55, 64), []);

  useFrame((s, dt) => {
    const st = state.current;
    const d = Math.min(dt, 0.05);
    st.hover = damp(st.hover, hovered ? 1 : 0, 3.5, d);
    const target = Math.max(getOpen(), st.hover);
    // Mechanical feel: motor drives toward target at a bounded rate, then damped.
    st.open = damp(st.open, target, 7, d);
    const travel = leafW * 0.97;
    if (left.current) left.current.position.x = -leafW / 2 - st.open * travel;
    if (right.current) right.current.position.x = leafW / 2 + st.open * travel;

    const sensorTarget = Math.max(getSensor ? getSensor() : 0, st.hover);
    st.sensor = damp(st.sensor, sensorTarget, 6, d);
    const pulse = 0.75 + 0.25 * Math.sin(s.clock.elapsedTime * 6);
    lens.emissiveIntensity = 0.3 + st.sensor * 4 * pulse;
    if (glowMat) glowMat.opacity = st.sensor * 0.9 * pulse;
    if (field.current) fieldMat.opacity = showField ? st.sensor * 0.07 : 0;
    if (ring.current) {
      ringMat.opacity = showField ? st.sensor * 0.5 * pulse : 0;
      const sc = 0.9 + ((s.clock.elapsedTime * 0.6) % 1) * 0.25;
      ring.current.scale.setScalar(sc);
    }
  });

  const onOver = (ev: ThreeEvent<PointerEvent>) => {
    if (!interactive) return;
    ev.stopPropagation();
    setHovered(true);
    ui.set({ cursor: "explore" });
  };
  const onOut = () => {
    if (!interactive) return;
    setHovered(false);
    ui.set({ cursor: "default" });
  };

  const hw = width / 2;
  const sensorY = height + 0.02;

  return (
    <group position={position} rotation={rotation}>
      {/* Jambs */}
      <Box size={[0.12, height + 0.36, 0.2]} position={[-hw - 0.06, (height + 0.36) / 2, 0]} material={m.aluminum} edges={e} />
      <Box size={[0.12, height + 0.36, 0.2]} position={[hw + 0.06, (height + 0.36) / 2, 0]} material={m.aluminum} edges={e} />
      {/* Operator header (motor + belt drive + control unit live here) */}
      <Box size={[width + 0.36, 0.34, 0.3]} position={[0, height + 0.17, 0.06]} material={m.aluminum} edges={e} />
      <Box size={[width + 0.36, 0.035, 0.31]} position={[0, height + 0.02, 0.06]} material={m.aluminumDark} edges={e} />
      {/* Motion sensor */}
      <Box size={[0.36, 0.07, 0.1]} position={[0, sensorY - 0.06, 0.24]} material={m.aluminumDark} edges={e} />
      <Box size={[0.22, 0.02, 0.06]} position={[0, sensorY - 0.1, 0.25]} material={lens} />
      <sprite ref={glow} material={glowMat} position={[0, sensorY - 0.1, 0.32]} scale={[0.7, 0.7, 0.7]} />
      <mesh ref={field} geometry={fieldGeo} material={fieldMat} position={[0, sensorY - 0.1 - (height - 0.1) / 2, 0.75]} rotation={[-0.35, 0, 0]} />
      <mesh ref={ring} geometry={ringGeo} material={ringMat} position={[0, 0.012, 1.55]} rotation={[-Math.PI / 2, 0, 0]} />

      {/* Fixed side lights (behind the sliding plane) */}
      {[-1, 1].map((sgn) => (
        <group key={sgn} position={[sgn * (hw - leafW / 2), 0, -0.05]}>
          <Leaf w={leafW} h={height} m={m} glass={glassMat} />
        </group>
      ))}
      {/* Sliding leaves */}
      <group ref={left} position={[-leafW / 2, 0, 0.06]}>
        <Leaf w={leafW} h={height} m={m} glass={glassMat} />
      </group>
      <group ref={right} position={[leafW / 2, 0, 0.06]}>
        <Leaf w={leafW} h={height} m={m} glass={glassMat} />
      </group>

      {/* Floor guide track */}
      <Box size={[width + 0.2, 0.012, 0.16]} position={[0, 0.006, 0.02]} material={m.aluminumDark} edges={e} />

      {interactive && (
        <mesh position={[0, height / 2, 0.3]} onPointerOver={onOver} onPointerOut={onOut}>
          <planeGeometry args={[width, height]} />
          <meshBasicMaterial colorWrite={false} depthWrite={false} />
        </mesh>
      )}
      {children}
    </group>
  );
}
