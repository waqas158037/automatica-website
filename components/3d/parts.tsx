"use client";

import { forwardRef } from "react";
import * as THREE from "three";

/** Shared unit geometries — every box in the scene is a scaled instance of these. */
export const UNIT_BOX = new THREE.BoxGeometry(1, 1, 1);
export const UNIT_EDGES = new THREE.EdgesGeometry(UNIT_BOX);
export const UNIT_PLANE = new THREE.PlaneGeometry(1, 1);
export const UNIT_CYL = new THREE.CylinderGeometry(0.5, 0.5, 1, 24);

type V3 = [number, number, number];

export type BoxProps = {
  size: V3;
  position?: V3;
  rotation?: V3;
  material: THREE.Material;
  edges?: THREE.LineBasicMaterial;
  name?: string;
};

/** A box built from the shared unit geometry, optionally with blueprint edge lines. */
export const Box = forwardRef<THREE.Mesh, BoxProps>(function Box({ size, position, rotation, material, edges, name }, ref) {
  return (
    <group position={position} rotation={rotation}>
      <mesh ref={ref} name={name} geometry={UNIT_BOX} material={material} scale={size} />
      {edges && <lineSegments geometry={UNIT_EDGES} material={edges} scale={size} />}
    </group>
  );
});

export function Plane({
  size,
  position,
  rotation,
  material,
}: {
  size: [number, number];
  position?: V3;
  rotation?: V3;
  material: THREE.Material;
}) {
  return <mesh geometry={UNIT_PLANE} material={material} position={position} rotation={rotation} scale={[size[0], size[1], 1]} />;
}

/** Many identical-material boxes in a single draw call. Each item: [x,y,z, sx,sy,sz, rotY?]. */
export function InstancedBoxes({ items, material }: { items: number[][]; material: THREE.Material }) {
  const ref = (mesh: THREE.InstancedMesh | null) => {
    if (!mesh) return;
    const o = new THREE.Object3D();
    items.forEach((it, i) => {
      o.position.set(it[0], it[1], it[2]);
      o.scale.set(it[3], it[4], it[5]);
      o.rotation.set(0, it[6] ?? 0, 0);
      o.updateMatrix();
      mesh.setMatrixAt(i, o.matrix);
    });
    mesh.instanceMatrix.needsUpdate = true;
    mesh.computeBoundingSphere();
  };
  return <instancedMesh key={items.length} ref={ref} args={[UNIT_BOX, material, items.length]} frustumCulled={false} />;
}
