import type { FlightState } from "@/components/flight/flightPhysics";
import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import * as THREE from "three";

const HELI_BODY = "#2c3426";
const HELI_ACCENT = "#4a553c";
const HELI_GLASS = "#6a8894";
const BLADE = "#1a1c18";

const SKIRT = "#3a3d32";
const HULL = "#4a5340";
const ARMOR = "#2c3326";
const GLASS = "#6a8894";

/**
 * Attack helicopter. Main-rotor blades are parented on the mast axis so
 * they spin as a disc, not around each blade's own center.
 */
export function HelicopterModel({
  axes,
  cockpitView = false,
}: {
  axes: React.MutableRefObject<{ throttle: number }>;
  cockpitView?: boolean;
}) {
  const mainRotor = useRef<THREE.Group>(null);
  const tailRotor = useRef<THREE.Group>(null);
  const disc = useRef<THREE.Mesh>(null);
  const blades = useRef<THREE.Group>(null);

  useFrame((_, dt) => {
    const throttle = axes.current.throttle;
    const rpm = 14 + throttle * 22;
    if (mainRotor.current) {
      mainRotor.current.rotation.y += dt * rpm;
    }
    if (tailRotor.current) {
      tailRotor.current.rotation.x += dt * (rpm * 1.35);
    }
    const blurred = throttle > 0.18;
    if (blades.current) blades.current.visible = !blurred;
    if (disc.current) {
      disc.current.visible = blurred;
      const mat = disc.current.material as THREE.MeshBasicMaterial;
      mat.opacity = 0.16 + throttle * 0.2;
    }
  });

  return (
    <group>
      {/* Cabin */}
      <mesh position={[0, 0.15, 0.15]} castShadow visible={!cockpitView}>
        <boxGeometry args={[1.35, 1.05, 2.4]} />
        <meshStandardMaterial
          color={HELI_BODY}
          metalness={0.32}
          roughness={0.48}
        />
      </mesh>
      <mesh position={[0, 0.08, 1.15]} visible={!cockpitView}>
        <boxGeometry args={[1.15, 0.7, 0.85]} />
        <meshStandardMaterial
          color={HELI_ACCENT}
          metalness={0.3}
          roughness={0.5}
        />
      </mesh>
      {/* Canopy */}
      {!cockpitView && (
        <mesh position={[0, 0.42, -0.85]} rotation={[0.18, 0, 0]}>
          <boxGeometry args={[1.2, 0.72, 1.05]} />
          <meshStandardMaterial
            color={HELI_GLASS}
            metalness={0.82}
            roughness={0.08}
            transparent
            opacity={0.42}
          />
        </mesh>
      )}
      {/* Chin gun */}
      <mesh
        position={[0, -0.42, -1.15]}
        rotation={[1.15, 0, 0]}
        visible={!cockpitView}
      >
        <cylinderGeometry args={[0.06, 0.07, 0.9, 8]} />
        <meshStandardMaterial color="#1a1a1a" metalness={0.6} />
      </mesh>
      {/* Stub wings + pods */}
      <mesh position={[0, -0.05, 0.2]} visible={!cockpitView}>
        <boxGeometry args={[3.4, 0.1, 0.55]} />
        <meshStandardMaterial color={HELI_ACCENT} metalness={0.28} />
      </mesh>
      <mesh position={[1.45, -0.22, 0.2]} visible={!cockpitView}>
        <cylinderGeometry args={[0.12, 0.12, 1.15, 8]} />
        <meshStandardMaterial color="#2a2a2a" />
      </mesh>
      <mesh position={[-1.45, -0.22, 0.2]} visible={!cockpitView}>
        <cylinderGeometry args={[0.12, 0.12, 1.15, 8]} />
        <meshStandardMaterial color="#2a2a2a" />
      </mesh>
      {/* Tail boom */}
      <mesh
        position={[0, 0.22, 2.35]}
        rotation={[Math.PI / 2, 0, 0]}
        visible={!cockpitView}
      >
        <cylinderGeometry args={[0.13, 0.2, 2.6, 8]} />
        <meshStandardMaterial color={HELI_BODY} metalness={0.3} />
      </mesh>
      {/* Tail fin */}
      <mesh position={[0, 0.72, 3.55]} visible={!cockpitView}>
        <boxGeometry args={[0.08, 0.95, 0.55]} />
        <meshStandardMaterial color={HELI_ACCENT} metalness={0.28} />
      </mesh>
      <mesh position={[0, 0.28, 3.5]} visible={!cockpitView}>
        <boxGeometry args={[0.7, 0.08, 0.35]} />
        <meshStandardMaterial color={HELI_ACCENT} />
      </mesh>
      {/* Skids */}
      <mesh position={[0.48, -0.82, 0.05]} visible={!cockpitView}>
        <boxGeometry args={[0.07, 0.07, 2.4]} />
        <meshStandardMaterial color="#555" metalness={0.5} />
      </mesh>
      <mesh position={[-0.48, -0.82, 0.05]} visible={!cockpitView}>
        <boxGeometry args={[0.07, 0.07, 2.4]} />
        <meshStandardMaterial color="#555" metalness={0.5} />
      </mesh>
      <mesh position={[0.48, -0.5, 0.35]} visible={!cockpitView}>
        <boxGeometry args={[0.05, 0.55, 0.06]} />
        <meshStandardMaterial color="#666" />
      </mesh>
      <mesh position={[-0.48, -0.5, 0.35]} visible={!cockpitView}>
        <boxGeometry args={[0.05, 0.55, 0.06]} />
        <meshStandardMaterial color="#666" />
      </mesh>
      <mesh position={[0.48, -0.5, -0.55]} visible={!cockpitView}>
        <boxGeometry args={[0.05, 0.55, 0.06]} />
        <meshStandardMaterial color="#666" />
      </mesh>
      <mesh position={[-0.48, -0.5, -0.55]} visible={!cockpitView}>
        <boxGeometry args={[0.05, 0.55, 0.06]} />
        <meshStandardMaterial color="#666" />
      </mesh>

      {/* Main rotor — blades sit on radial arms so the disc is mast-centered */}
      <group ref={mainRotor} position={[0, 1.28, 0.05]}>
        <mesh>
          <cylinderGeometry args={[0.1, 0.12, 0.22, 10]} />
          <meshStandardMaterial color="#222" metalness={0.65} />
        </mesh>
        <group ref={blades}>
          {[0, 1, 2, 3].map((i) => {
            const yaw = (i * Math.PI) / 2;
            return (
              <group key={`main-blade-${i}`} rotation={[0, yaw, 0]}>
                <mesh position={[2.15, 0.02, 0]} rotation={[0.02, 0, 0.035]}>
                  <boxGeometry args={[4.3, 0.03, 0.2]} />
                  <meshStandardMaterial
                    color={BLADE}
                    metalness={0.4}
                    roughness={0.45}
                  />
                </mesh>
              </group>
            );
          })}
        </group>
        <mesh ref={disc} rotation={[-Math.PI / 2, 0, 0]} visible={false}>
          <circleGeometry args={[4.25, 48]} />
          <meshBasicMaterial
            color="#c8d0c4"
            transparent
            opacity={0.22}
            side={THREE.DoubleSide}
            depthWrite={false}
          />
        </mesh>
      </group>
      <mesh position={[0, 0.78, 0.05]} visible={!cockpitView}>
        <cylinderGeometry args={[0.07, 0.09, 0.85, 8]} />
        <meshStandardMaterial color="#2a2a2a" metalness={0.5} />
      </mesh>

      {/* Tail rotor — four blades around the fin's lateral axis */}
      <group ref={tailRotor} position={[0.22, 0.88, 3.58]}>
        <mesh>
          <sphereGeometry args={[0.07, 8, 8]} />
          <meshStandardMaterial color="#222" metalness={0.6} />
        </mesh>
        {[0, 1, 2, 3].map((i) => (
          <group key={`tail-blade-${i}`} rotation={[(i * Math.PI) / 2, 0, 0]}>
            <mesh position={[0, 0.36, 0]}>
              <boxGeometry args={[0.035, 0.72, 0.09]} />
              <meshStandardMaterial color={BLADE} metalness={0.4} />
            </mesh>
          </group>
        ))}
      </group>
    </group>
  );
}

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
