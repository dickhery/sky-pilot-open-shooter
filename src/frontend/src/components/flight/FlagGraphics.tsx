import { paintFlag } from "@/lib/flagPaint";
import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";

const textureCache = new Map<string, THREE.CanvasTexture>();

export function getFlagTexture(code: string): THREE.CanvasTexture {
  const key = code.trim().toLowerCase() || "us";
  const hit = textureCache.get(key);
  if (hit) return hit;
  const canvas = document.createElement("canvas");
  canvas.width = 256;
  canvas.height = 170;
  const ctx = canvas.getContext("2d");
  if (ctx) {
    paintFlag(ctx, 256, 170, key);
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 8;
  tex.needsUpdate = true;
  textureCache.set(key, tex);
  return tex;
}

export function useFlagTexture(code: string): THREE.CanvasTexture {
  const key = code.trim().toLowerCase() || "us";
  return useMemo(() => getFlagTexture(key), [key]);
}

export function FlagDecal({
  code,
  width = 0.72,
  height = 0.44,
  position,
  rotation,
  scale,
}: {
  code: string;
  width?: number;
  height?: number;
  position?: [number, number, number];
  rotation?: [number, number, number];
  scale?: number | [number, number, number];
}) {
  const tex = useFlagTexture(code);
  return (
    <mesh position={position} rotation={rotation} scale={scale} renderOrder={2}>
      <planeGeometry args={[width, height]} />
      <meshBasicMaterial
        map={tex}
        side={THREE.DoubleSide}
        toneMapped={false}
        polygonOffset
        polygonOffsetFactor={-2}
        polygonOffsetUnits={-2}
      />
    </mesh>
  );
}

/** Cloth on a pole. Hoist sits on the shaft so the flag flies outward. */
export function FlagPole({
  code,
  height = 8,
  clothWidth,
  clothHeight,
  poleScale = 1,
}: {
  code: string;
  height?: number;
  clothWidth?: number;
  clothHeight?: number;
  poleScale?: number;
}) {
  const tex = useFlagTexture(code);
  const fly = useRef<THREE.Group>(null);
  const clothW = clothWidth ?? Math.max(4.2, height * 0.72);
  const clothH = clothHeight ?? clothW * 0.62;
  useFrame((state) => {
    if (!fly.current) return;
    fly.current.rotation.y = Math.sin(state.clock.elapsedTime * 1.35) * 0.18;
  });
  return (
    <group scale={poleScale}>
      <mesh position={[0, height / 2, 0]} castShadow>
        <cylinderGeometry args={[height * 0.012, height * 0.018, height, 8]} />
        <meshStandardMaterial
          color="#c5ccd3"
          metalness={0.55}
          roughness={0.32}
        />
      </mesh>
      <mesh position={[0, height + height * 0.018, 0]}>
        <sphereGeometry args={[height * 0.022, 8, 8]} />
        <meshStandardMaterial
          color="#e2c15a"
          metalness={0.65}
          roughness={0.28}
        />
      </mesh>
      <group position={[0, height - clothH * 0.52, 0]}>
        <group ref={fly}>
          <mesh position={[clothW / 2, 0, 0]} renderOrder={3}>
            <planeGeometry args={[clothW, clothH]} />
            <meshBasicMaterial
              map={tex}
              side={THREE.DoubleSide}
              toneMapped={false}
            />
          </mesh>
        </group>
      </group>
    </group>
  );
}
