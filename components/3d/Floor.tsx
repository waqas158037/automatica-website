"use client";

import { MeshReflectorMaterial } from "@react-three/drei";
import type { QualityProfile } from "@/lib/device";

type Props = {
  quality: QualityProfile;
  size: [number, number];
  position?: [number, number, number];
  color?: string;
  mirror?: number;
  roughness?: number;
};

/** Polished stone floor: real-time blurred reflections on capable devices, env-mapped standard material otherwise. */
export function Floor({ quality, size, position = [0, 0, 0], color = "#0b0e14", mirror = 0.6, roughness = 0.75 }: Props) {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={position}>
      <planeGeometry args={size} />
      {quality.reflector ? (
        <MeshReflectorMaterial
          resolution={quality.reflectorResolution}
          blur={[320, 90]}
          mixBlur={1}
          mixStrength={2.2 * mirror}
          mixContrast={1.1}
          mirror={mirror}
          depthScale={0.8}
          minDepthThreshold={0.4}
          maxDepthThreshold={1.3}
          roughness={roughness}
          metalness={0.55}
          color={color}
        />
      ) : (
        <meshStandardMaterial color={color} roughness={0.32} metalness={0.45} envMapIntensity={0.9} />
      )}
    </mesh>
  );
}
