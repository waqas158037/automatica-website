"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { getGlowTexture } from "./materials";

type Props = { count: number; box: [number, number, number]; position?: [number, number, number]; color?: string; size?: number };

/** Sparse, slow dust motes catching the light. Deliberately understated. */
export function Particles({ count, box, position, color = "#a9c6ff", size = 0.05 }: Props) {
  const ref = useRef<THREE.Points>(null);
  const { geo, seeds } = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const seeds = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * box[0];
      pos[i * 3 + 1] = Math.random() * box[1];
      pos[i * 3 + 2] = (Math.random() - 0.5) * box[2];
      seeds[i] = Math.random() * 100;
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    return { geo, seeds };
  }, [count, box]);
  const mat = useMemo(
    () =>
      new THREE.PointsMaterial({
        size,
        map: getGlowTexture(),
        color,
        transparent: true,
        opacity: 0.55,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        sizeAttenuation: true,
      }),
    [color, size],
  );
  useFrame((s, dt) => {
    const attr = geo.getAttribute("position") as THREE.BufferAttribute;
    const arr = attr.array as Float32Array;
    const t = s.clock.elapsedTime;
    for (let i = 0; i < count; i++) {
      arr[i * 3 + 1] += Math.sin(t * 0.3 + seeds[i]) * 0.0015 + 0.0008;
      arr[i * 3] += Math.cos(t * 0.2 + seeds[i]) * 0.001;
      if (arr[i * 3 + 1] > box[1]) arr[i * 3 + 1] = 0;
    }
    attr.needsUpdate = true;
    void dt;
  });
  return <points ref={ref} geometry={geo} material={mat} position={position} frustumCulled={false} />;
}
