import { flagEmoji } from "@/lib/countries";
import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";

const textureCache = new Map<string, THREE.CanvasTexture>();

function hashHue(code: string): number {
  let h = 0;
  for (let i = 0; i < code.length; i++) {
    h = (h * 33 + code.charCodeAt(i)) % 360;
  }
  return h;
}

export function getFlagTexture(code: string): THREE.CanvasTexture {
  const key = code.trim().toLowerCase() || "us";
  const hit = textureCache.get(key);
  if (hit) return hit;
  const canvas = document.createElement("canvas");
  canvas.width = 256;
  canvas.height = 160;
  const ctx = canvas.getContext("2d");
  if (ctx) {
    const hue = hashHue(key);
    ctx.fillStyle = `hsl(${hue} 44% 30%)`;
    ctx.fillRect(0, 0, 256, 160);
    ctx.fillStyle = `hsl(${hue} 52% 18%)`;
    ctx.fillRect(0, 0, 256, 16);
    ctx.fillRect(0, 144, 256, 16);
    ctx.font = "92px serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(flagEmoji(key), 128, 70);
    ctx.font = "bold 20px sans-serif";
    ctx.fillStyle = "#f3f1ea";
    ctx.fillText(key.toUpperCase(), 128, 136);
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 4;
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
    <mesh position={position} rotation={rotation} scale={scale}>
      <planeGeometry args={[width, height]} />
      <meshStandardMaterial
        map={tex}
        roughness={0.52}
        metalness={0.08}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
}

/** Cloth on a pole. Used at friendly fields and hostile bases. */
export function FlagPole({
  code,
  height = 8,
  poleScale = 1,
}: {
  code: string;
  height?: number;
  poleScale?: number;
}) {
  const tex = useFlagTexture(code);
  const cloth = useRef<THREE.Mesh>(null);
  useFrame((state) => {
    if (!cloth.current) return;
    cloth.current.rotation.y = Math.sin(state.clock.elapsedTime * 1.7) * 0.14;
  });
  return (
    <group scale={poleScale}>
      <mesh position={[0, height / 2, 0]} castShadow>
        <cylinderGeometry args={[0.05, 0.07, height, 6]} />
        <meshStandardMaterial
          color="#8a9298"
          metalness={0.55}
          roughness={0.35}
        />
      </mesh>
      <mesh position={[0, height + 0.08, 0]}>
        <sphereGeometry args={[0.09, 8, 8]} />
        <meshStandardMaterial color="#c4a24a" metalness={0.6} roughness={0.3} />
      </mesh>
      <mesh ref={cloth} position={[0.85, height - 0.55, 0]}>
        <planeGeometry args={[1.7, 1.05]} />
        <meshStandardMaterial
          map={tex}
          side={THREE.DoubleSide}
          roughness={0.48}
          metalness={0.05}
        />
      </mesh>
    </group>
  );
}
