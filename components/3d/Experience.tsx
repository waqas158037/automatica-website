"use client";

import { Component, Suspense, useEffect, useRef, useState, type ReactNode } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { PerformanceMonitor, Preload } from "@react-three/drei";
import * as THREE from "three";
import { SceneManager } from "./SceneManager";
import { CameraController } from "./CameraController";
import { Lighting } from "./Lighting";
import { MaterialsProvider } from "./materials";
import { forcedTier, lowerTier, QUALITY } from "@/lib/device";
import { scrollState, ui, useUI } from "@/lib/store";
import { contactDim, veilAt } from "@/lib/scenes";

class GLBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidCatch() {
    ui.set({ webgl: false, ready: true });
  }
  render() {
    return this.state.failed ? null : this.props.children;
  }
}

/** Signals readiness after a few rendered frames (shaders compiled, textures uploaded). */
function ReadySignal() {
  const frames = useRef(0);
  useFrame(() => {
    frames.current++;
    if (frames.current === 4) ui.set({ ready: true });
  });
  return null;
}

/**
 * Runtime safety net: if the device can't hold ~30 fps after warm-up, step the
 * quality tier down (then resolution) instead of delivering a stuttering experience.
 */
function FrameGuard({ onSlow }: { onSlow: () => void }) {
  const s = useRef({ frames: 0, time: 0, warm: 0, done: false });
  useFrame((_, dt) => {
    const st = s.current;
    if (st.done) return;
    if (st.warm < 30) {
      st.warm++;
      return;
    }
    st.frames++;
    st.time += dt;
    if (st.frames >= 60) {
      const avg = st.time / st.frames;
      if (avg > 1 / 28) onSlow();
      st.frames = 0;
      st.time = 0;
      st.warm = 0;
      st.done = avg <= 1 / 28;
    }
  });
  return null;
}

/** Scene-cut veil, driven every frame from the damped scroll position. */
function Veil() {
  const el = useRef<HTMLDivElement>(null);
  const dim = useRef<HTMLDivElement>(null);
  useEffect(() => {
    let raf = 0;
    let last = -1;
    let lastDim = -1;
    const tick = () => {
      const v = Math.round(veilAt(scrollState.smooth) * 1000) / 1000;
      if (v !== last && el.current) {
        el.current.style.opacity = String(v);
        last = v;
      }
      const d = Math.round(contactDim(scrollState.smooth) * 1000) / 1000;
      if (d !== lastDim && dim.current) {
        dim.current.style.opacity = String(d);
        lastDim = d;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);
  return (
    <>
      <div ref={el} className="pointer-events-none fixed inset-0 z-[1] bg-[#02040a]" style={{ opacity: 0 }} aria-hidden />
      {/* Light room → contact: the whole frame settles into deep navy, keeping a faint glow of the doorway. */}
      <div
        ref={dim}
        className="pointer-events-none fixed inset-0 z-[1] [background:radial-gradient(60%_45%_at_50%_30%,rgba(11,94,215,0.28),transparent_70%),linear-gradient(180deg,#040817,#03050c)]"
        style={{ opacity: 0 }}
        aria-hidden
      />
    </>
  );
}

export default function Experience() {
  const tier = useUI((s) => s.tier);
  const quality = QUALITY[tier];
  const [dpr, setDpr] = useState(quality.dpr[1]);
  useEffect(() => setDpr(QUALITY[tier].dpr[1]), [tier]);
  const [source, setSource] = useState<HTMLElement | null>(null);

  useEffect(() => {
    setSource(document.getElementById("app-root"));
  }, []);

  if (!source) return null;

  return (
    <>
      <div className="fixed inset-0 z-0" aria-hidden>
        <GLBoundary>
          <Canvas
            dpr={dpr}
            eventSource={source}
            eventPrefix="client"
            gl={{ antialias: quality.antialias, powerPreference: "high-performance", alpha: false, stencil: false }}
            camera={{ fov: 48, near: 0.1, far: 420, position: [0, 1.8, 26] }}
            onCreated={({ gl }) => {
              gl.toneMapping = THREE.ACESFilmicToneMapping;
              gl.toneMappingExposure = 1.05;
              gl.setClearColor("#05080f");
            }}
          >
            <FrameGuard
              onSlow={() => {
                if (forcedTier()) return;
                const t = ui.get().tier;
                if (t !== "low") ui.set({ tier: lowerTier(t) });
                else setDpr((d) => Math.max(0.6, d - 0.2));
              }}
            />
            <PerformanceMonitor
              bounds={() => [45, 58]}
              onDecline={() => setDpr((d) => Math.max(quality.dpr[0], d - 0.25))}
              onIncline={() => setDpr((d) => Math.min(quality.dpr[1], d + 0.25))}
              flipflops={3}
            />
            <MaterialsProvider quality={quality}>
              <Lighting />
              <CameraController />
              <Suspense fallback={null}>
                <SceneManager quality={quality} />
                <Preload all />
                <ReadySignal />
              </Suspense>
            </MaterialsProvider>
          </Canvas>
        </GLBoundary>
      </div>
      <Veil />
    </>
  );
}
