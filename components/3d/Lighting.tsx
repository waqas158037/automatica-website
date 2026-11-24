"use client";

import { useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { Environment, Lightformer } from "@react-three/drei";
import * as THREE from "three";
import { ENV_OFFSET, envAt, finalLight, type EnvId } from "@/lib/scenes";
import { scrollState } from "@/lib/store";

type PoolLight = { pos: [number, number, number]; color: string; intensity: number };
type EnvLook = {
  bg: string;
  fog: [number, number];
  hemi: [string, string, number];
  moon: number;
  pool: [PoolLight, PoolLight, PoolLight, PoolLight];
};

/**
 * A fixed pool of lights re-targeted per environment. Keeping the light count
 * constant avoids shader recompiles when environments switch.
 */
const LOOKS: Record<EnvId, EnvLook> = {
  entrance: {
    bg: "#05080f",
    fog: [26, 110],
    hemi: ["#33508f", "#06080d", 0.55],
    moon: 0.7,
    pool: [
      { pos: [0, 3.9, 3], color: "#ffe6c4", intensity: 18 },
      { pos: [0, 6.2, -12], color: "#dfe9ff", intensity: 55 },
      { pos: [-4.5, 4.5, -18.5], color: "#cfe0ff", intensity: 28 },
      { pos: [4.5, 4.5, -30.5], color: "#cfe0ff", intensity: 28 },
    ],
  },
  warehouse: {
    bg: "#04060b",
    fog: [24, 120],
    hemi: ["#2a3a5c", "#050608", 0.45],
    moon: 0.6,
    pool: [
      { pos: [-11, 8.6, 16], color: "#e3ecff", intensity: 110 },
      { pos: [11, 8.6, 4], color: "#e3ecff", intensity: 110 },
      { pos: [0, 10, -12], color: "#ffd9a8", intensity: 160 },
      { pos: [0, 7.5, 3], color: "#9bbcff", intensity: 22 },
    ],
  },
  blueprint: {
    bg: "#020817",
    fog: [10, 42],
    hemi: ["#2f5fd6", "#020617", 0.7],
    moon: 0.2,
    pool: [
      { pos: [0, 5, 4], color: "#7aa6ff", intensity: 40 },
      { pos: [-4, 3, 3], color: "#5d8dff", intensity: 18 },
      { pos: [4, 3, 3], color: "#5d8dff", intensity: 18 },
      { pos: [0, 6, -4], color: "#3f6fe8", intensity: 20 },
    ],
  },
  city: {
    bg: "#03060d",
    fog: [50, 230],
    hemi: ["#4a66a8", "#06080e", 1.1],
    moon: 1.8,
    pool: [
      { pos: [0, 20, 0], color: "#9db9ff", intensity: 0 },
      { pos: [0, 6, 40], color: "#cfdcff", intensity: 60 },
      { pos: [0, 6, 10], color: "#cfdcff", intensity: 40 },
      { pos: [0, 6, -20], color: "#cfdcff", intensity: 40 },
    ],
  },
  final: {
    bg: "#04070e",
    fog: [24, 120],
    hemi: ["#33508f", "#06080d", 0.5],
    moon: 0.5,
    pool: [
      { pos: [0, 4, 70], color: "#cfe0ff", intensity: 30 },
      { pos: [0, 4, 40], color: "#cfe0ff", intensity: 30 },
      { pos: [0, 3.9, 3], color: "#ffe6c4", intensity: 18 },
      { pos: [0, 2.5, -2], color: "#dbe7ff", intensity: 10 },
    ],
  },
};

export function Lighting() {
  const scene = useThree((s) => s.scene);
  const hemi = useRef<THREE.HemisphereLight>(null);
  const moon = useRef<THREE.DirectionalLight>(null);
  const pool = useRef<(THREE.PointLight | null)[]>([]);
  const current = useRef<EnvId | null>(null);

  useFrame(() => {
    const env = envAt(scrollState.smooth);
    if (env !== current.current) {
      current.current = env;
      const look = LOOKS[env];
      const off = ENV_OFFSET[env];
      const bg = new THREE.Color(look.bg);
      scene.background = bg;
      scene.fog = new THREE.Fog(bg, look.fog[0], look.fog[1]);
      hemi.current?.color.set(look.hemi[0]);
      hemi.current?.groundColor.set(look.hemi[1]);
      if (hemi.current) hemi.current.intensity = look.hemi[2];
      if (moon.current) {
        moon.current.intensity = look.moon;
        moon.current.position.set(off[0] - 20, 40, off[2] + 30);
        moon.current.target.position.set(off[0], 0, off[2]);
        moon.current.target.updateMatrixWorld();
      }
      look.pool.forEach((l, i) => {
        const pl = pool.current[i];
        if (!pl) return;
        pl.position.set(l.pos[0] + off[0], l.pos[1] + off[1], l.pos[2] + off[2]);
        pl.color.set(l.color);
        pl.intensity = l.intensity;
      });
    }
    // The final entrance light grows as the door opens.
    if (env === "final") {
      const pl = pool.current[3];
      if (pl) pl.intensity = 10 + finalLight(scrollState.smooth) * 260;
    }
  });

  return (
    <>
      <hemisphereLight ref={hemi} args={["#33508f", "#06080d", 0.55]} />
      <directionalLight ref={moon} color="#b9ccff" intensity={0.7} position={[-20, 40, 30]} />
      {[0, 1, 2, 3].map((i) => (
        <pointLight key={i} ref={(el) => { pool.current[i] = el; }} decay={2} distance={0} intensity={0} />
      ))}
      {/* Procedural studio environment for glass & metal reflections (no network fetch). */}
      <Environment resolution={256} frames={1}>
        <Lightformer form="rect" intensity={2.2} color="#dfe9ff" position={[0, 6, -8]} scale={[14, 2, 1]} />
        <Lightformer form="rect" intensity={0.5} color="#4d8bff" position={[-10, 2, 0]} rotation-y={Math.PI / 2} scale={[20, 3, 1]} />
        <Lightformer form="rect" intensity={1.6} color="#ffffff" position={[10, 3, 2]} rotation-y={-Math.PI / 2} scale={[20, 1.2, 1]} />
        <Lightformer form="ring" intensity={1.6} color="#9fc0ff" position={[0, 8, 10]} scale={4} />
        <Lightformer form="rect" intensity={0.2} color="#0B5ED7" position={[0, -4, 0]} rotation-x={Math.PI / 2} scale={[30, 30, 1]} />
      </Environment>
    </>
  );
}
