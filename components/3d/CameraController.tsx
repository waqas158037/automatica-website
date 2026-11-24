"use client";

import { useMemo } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { CAMERA_KEYS } from "@/lib/scenes";
import { scrollState, syncScroll, ui } from "@/lib/store";
import { damp, easeInOutCubic, lerp } from "@/lib/math";

const BASE_FOV = 48;

/**
 * Scroll-driven cinematic camera. `scrollState.p` (set by ScrollTrigger) is damped
 * into `scrollState.smooth`, then sampled against camera keyframes with eased
 * segments. Pointer adds a few centimetres of parallax for depth.
 */
export function CameraController() {
  const camera = useThree((s) => s.camera) as THREE.PerspectiveCamera;
  const size = useThree((s) => s.size);
  const tmp = useMemo(() => ({ pos: new THREE.Vector3(), look: new THREE.Vector3(), a: new THREE.Vector3(), b: new THREE.Vector3(), par: new THREE.Vector2() }), []);

  useFrame((state, dt) => {
    const d = Math.min(dt, 0.05);
    syncScroll(); // read scroll every frame — independent of scroll-event delivery
    const target = scrollState.p;
    // Large jumps (anchor navigation across environments) snap instead of flying through walls.
    if (Math.abs(target - scrollState.smooth) > 1.5) scrollState.smooth = target;
    else scrollState.smooth = damp(scrollState.smooth, target, 4.2, d);
    const p = scrollState.smooth;

    let i = 0;
    while (i < CAMERA_KEYS.length - 2 && CAMERA_KEYS[i + 1].p <= p) i++;
    const k0 = CAMERA_KEYS[i];
    const k1 = CAMERA_KEYS[i + 1];
    const raw = THREE.MathUtils.clamp((p - k0.p) / Math.max(1e-4, k1.p - k0.p), 0, 1);
    // Segments separated by a scene cut move linearly (the veil hides them).
    const t = k1.p - k0.p < 0.05 ? raw : easeInOutCubic(raw);

    tmp.pos.set(lerp(k0.pos[0], k1.pos[0], t), lerp(k0.pos[1], k1.pos[1], t), lerp(k0.pos[2], k1.pos[2], t));
    tmp.look.set(lerp(k0.look[0], k1.look[0], t), lerp(k0.look[1], k1.look[1], t), lerp(k0.look[2], k1.look[2], t));

    // Subtle pointer parallax + breathing.
    tmp.par.x = damp(tmp.par.x, state.pointer.x, 2, d);
    tmp.par.y = damp(tmp.par.y, state.pointer.y, 2, d);
    // Reduced motion: no ambient sway or pointer parallax — the camera only moves with scroll.
    const ambient = ui.get().reducedMotion ? 0 : 1;
    const time = state.clock.elapsedTime;
    tmp.pos.x += (tmp.par.x * 0.18 + Math.sin(time * 0.35) * 0.03) * ambient;
    tmp.pos.y += (tmp.par.y * 0.08 + Math.sin(time * 0.5) * 0.015) * ambient;

    camera.position.copy(tmp.pos);
    camera.lookAt(tmp.look);

    // Portrait screens get a wider lens so the doors stay in frame.
    const aspect = size.width / size.height;
    const fov = aspect < 1 ? BASE_FOV + (1 - aspect) * 34 : BASE_FOV;
    if (Math.abs(camera.fov - fov) > 0.01) {
      camera.fov = fov;
      camera.updateProjectionMatrix();
    }
  });
  return null;
}
