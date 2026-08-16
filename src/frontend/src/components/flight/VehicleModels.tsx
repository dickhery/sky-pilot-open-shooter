import type { FlightState } from "@/components/flight/flightPhysics";
import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import * as THREE from "three";

const SKIRT = "#3a3d32";
const HULL = "#4a5340";
const ARMOR = "#2c3326";
const GLASS = "#6a8894";

export function HovercraftModel({
  axes,
}: {
  axes: React.MutableRefObject<{ throttle: number }>;
}) {
  const fan = useRef<THREE.Group>(null);
  useFrame((_, dt) => {
    if (fan.current) {
      fan.current.rotation.z += dt * (8 + axes.current.throttle * 22);
    }
  });
  return (
    <group>
      <mesh position={[0, 0.28, 0]} castShadow>
        <boxGeometry args={[2.6, 0.35, 4.2]} />
        <meshStandardMaterial color={HULL} metalness={0.25} roughness={0.55} />
      </mesh>
      <mesh position={[0, 0.08, 0]}>
        <boxGeometry args={[2.9, 0.22, 4.5]} />
        <meshStandardMaterial color={SKIRT} roughness={0.9} />
      </mesh>
      <mesh position={[0, 0.62, -0.35]}>
        <boxGeometry args={[1.4, 0.55, 1.6]} />
        <meshStandardMaterial color={ARMOR} metalness={0.3} roughness={0.5} />
      </mesh>
      <mesh position={[0, 0.95, -0.2]} rotation={[0.15, 0, 0]}>
        <boxGeometry args={[1.1, 0.28, 0.9]} />
        <meshStandardMaterial
          color={GLASS}
          metalness={0.7}
          roughness={0.12}
          transparent
          opacity={0.45}
        />
      </mesh>
      <mesh position={[0.7, 0.85, 0.4]}>
        <cylinderGeometry args={[0.08, 0.1, 0.7, 8]} />
        <meshStandardMaterial color="#2a2a2a" />
      </mesh>
      <mesh position={[0.7, 1.22, 0.4]}>
        <boxGeometry args={[0.18, 0.12, 0.55]} />
        <meshStandardMaterial color="#1a1a1a" metalness={0.6} />
      </mesh>
      <group ref={fan} position={[0, 0.85, 1.7]} rotation={[Math.PI / 2, 0, 0]}>
        <mesh>
          <torusGeometry args={[0.55, 0.08, 8, 16]} />
          <meshStandardMaterial color="#2a2e28" metalness={0.4} />
        </mesh>
        <mesh>
          <boxGeometry args={[1.0, 0.08, 0.05]} />
          <meshStandardMaterial color="#c8c8c0" />
        </mesh>
      </group>
      <mesh position={[0, 0.55, -1.85]}>
        <boxGeometry args={[1.8, 0.08, 0.35]} />
        <meshStandardMaterial color="#5a4030" />
      </mesh>
    </group>
  );
}

export function SoldierModel() {
  return (
    <group>
      <mesh position={[0, 0.95, 0]} castShadow>
        <capsuleGeometry args={[0.22, 0.7, 4, 8]} />
        <meshStandardMaterial color="#3d4a36" roughness={0.8} />
      </mesh>
      <mesh position={[0, 1.55, 0]}>
        <sphereGeometry args={[0.18, 10, 10]} />
        <meshStandardMaterial color="#4a4034" />
      </mesh>
      <mesh position={[0.08, 1.25, -0.35]} rotation={[0.1, 0, 0]}>
        <boxGeometry args={[0.08, 0.08, 0.7]} />
        <meshStandardMaterial color="#2a2a2a" metalness={0.5} />
      </mesh>
    </group>
  );
}

export function ParkedMarker({
  position,
  heading,
  kind,
}: {
  position: THREE.Vector3;
  heading: number;
  kind: "air-jet" | "air-heli" | "hover";
}) {
  const color = kind === "hover" ? "#8fd4a0" : "#5ef2ff";
  return (
    <group position={[position.x, 0.4, position.z]} rotation={[0, heading, 0]}>
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <ringGeometry args={[2.2, 2.7, 24]} />
        <meshBasicMaterial
          color={color}
          transparent
          opacity={0.45}
          side={THREE.DoubleSide}
          depthWrite={false}
        />
      </mesh>
    </group>
  );
}
