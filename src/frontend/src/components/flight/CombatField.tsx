import type {
  CombatTarget,
  FlightState,
  SceneLayout,
} from "@/components/flight/flightPhysics";
import { Html } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import * as THREE from "three";

export function CombatField({
  layout,
  flightState,
}: {
  layout: SceneLayout;
  flightState: React.MutableRefObject<FlightState>;
}) {
  return (
    <group>
      {layout.sectors.map((sector, i) => (
        <SectorMarker
          key={sector.id}
          layout={layout}
          sectorIndex={i}
          flightState={flightState}
        />
      ))}
      <TargetMeshes flightState={flightState} />
      <ProjectileMeshes flightState={flightState} />
      <mesh
        position={[layout.hoverPad.x, 0.04, layout.hoverPad.z]}
        rotation={[-Math.PI / 2, 0, 0]}
      >
        <circleGeometry args={[6, 24]} />
        <meshStandardMaterial color="#3a4034" roughness={0.85} />
      </mesh>
      <mesh
        position={[layout.hoverPad.x, 0.06, layout.hoverPad.z]}
        rotation={[-Math.PI / 2, 0, 0]}
      >
        <ringGeometry args={[5.2, 5.8, 24]} />
        <meshBasicMaterial color="#8fd4a0" transparent opacity={0.55} />
      </mesh>
    </group>
  );
}

function SectorMarker({
  layout,
  sectorIndex,
  flightState,
}: {
  layout: SceneLayout;
  sectorIndex: number;
  flightState: React.MutableRefObject<FlightState>;
}) {
  const ref = useRef<THREE.Group>(null);
  const sector = layout.sectors[sectorIndex];
  useFrame((clock) => {
    if (!ref.current) return;
    const s = flightState.current;
    const live = s.targets.some(
      (t) => t.sectorId === sector.id && !t.destroyed,
    );
    ref.current.visible = live;
    const active = s.nextCheckpoint === sectorIndex;
    const pulse = active
      ? 1 + Math.sin(clock.clock.elapsedTime * 2.2) * 0.08
      : 1;
    ref.current.scale.setScalar(pulse);
  });
  return (
    <group ref={ref} position={[sector.center.x, 0.2, sector.center.z]}>
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <ringGeometry args={[sector.radius * 0.72, sector.radius * 0.78, 48]} />
        <meshBasicMaterial
          color="#ffb14a"
          transparent
          opacity={0.35}
          side={THREE.DoubleSide}
          depthWrite={false}
        />
      </mesh>
      <mesh position={[0, 18, 0]}>
        <cylinderGeometry args={[0.18, 0.28, 36, 8]} />
        <meshBasicMaterial color="#ffb14a" transparent opacity={0.28} />
      </mesh>
      <Html
        position={[0, 28, 0]}
        center
        distanceFactor={80}
        style={{ pointerEvents: "none" }}
      >
        <div className="rounded border border-amber-400/70 bg-black/70 px-2 py-0.5 font-mono text-[10px] tracking-wide text-amber-300 uppercase">
          Destroy · {sector.name}
        </div>
      </Html>
    </group>
  );
}

function TargetMeshes({
  flightState,
}: {
  flightState: React.MutableRefObject<FlightState>;
}) {
  return (
    <group>
      {flightState.current.targets.map((target) => (
        <TargetMesh
          key={target.id}
          targetId={target.id}
          flightState={flightState}
        />
      ))}
    </group>
  );
}

function TargetMesh({
  targetId,
  flightState,
}: {
  targetId: string;
  flightState: React.MutableRefObject<FlightState>;
}) {
  const ref = useRef<THREE.Group>(null);
  useFrame(() => {
    if (!ref.current) return;
    const target = flightState.current.targets.find((t) => t.id === targetId);
    ref.current.visible = Boolean(target && !target.destroyed);
  });
  const target = flightState.current.targets.find((t) => t.id === targetId);
  if (!target) return null;
  return (
    <group ref={ref} position={target.position}>
      <HardTarget target={target} />
    </group>
  );
}

function HardTarget({ target }: { target: CombatTarget }) {
  switch (target.kind) {
    case "turret":
      return (
        <group>
          <mesh position={[0, 0.2, 0]}>
            <cylinderGeometry args={[0.7, 0.9, 0.5, 8]} />
            <meshStandardMaterial color="#4a4034" roughness={0.7} />
          </mesh>
          <mesh position={[0, 0.7, 0]}>
            <boxGeometry args={[0.7, 0.45, 0.7]} />
            <meshStandardMaterial color="#3a342c" metalness={0.4} />
          </mesh>
          <mesh position={[0, 0.75, -0.7]} rotation={[0.1, 0, 0]}>
            <cylinderGeometry args={[0.08, 0.1, 1.3, 8]} />
            <meshStandardMaterial color="#222" metalness={0.6} />
          </mesh>
        </group>
      );
    case "bunker":
      return (
        <mesh>
          <boxGeometry args={[4.2, 2.2, 3.2]} />
          <meshStandardMaterial color="#5a5346" roughness={0.85} />
        </mesh>
      );
    case "radar":
      return (
        <group>
          <mesh position={[0, -0.6, 0]}>
            <cylinderGeometry args={[0.18, 0.25, 2.2, 8]} />
            <meshStandardMaterial color="#3a3a3a" />
          </mesh>
          <mesh rotation={[0.6, 0.4, 0]}>
            <sphereGeometry
              args={[1.1, 10, 8, 0, Math.PI * 2, 0, Math.PI * 0.55]}
            />
            <meshStandardMaterial
              color="#8a9aaa"
              metalness={0.55}
              roughness={0.3}
              side={THREE.DoubleSide}
            />
          </mesh>
        </group>
      );
    default:
      return (
        <group>
          <mesh>
            <boxGeometry args={[2.4, 1.1, 1.2]} />
            <meshStandardMaterial color="#4a5538" roughness={0.7} />
          </mesh>
          <mesh position={[0.7, -0.35, 0.55]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.28, 0.28, 0.22, 10]} />
            <meshStandardMaterial color="#1a1a1a" />
          </mesh>
          <mesh position={[-0.7, -0.35, 0.55]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.28, 0.28, 0.22, 10]} />
            <meshStandardMaterial color="#1a1a1a" />
          </mesh>
        </group>
      );
  }
}

function ProjectileMeshes({
  flightState,
}: {
  flightState: React.MutableRefObject<FlightState>;
}) {
  const group = useRef<THREE.Group>(null);
  const pool = useRef<THREE.Mesh[]>([]);
  useFrame(() => {
    const shots = flightState.current.projectiles;
    const parent = group.current;
    if (!parent) return;
    while (pool.current.length < shots.length) {
      const mesh = new THREE.Mesh(
        new THREE.SphereGeometry(0.18, 6, 6),
        new THREE.MeshBasicMaterial({ color: "#ffe08a" }),
      );
      parent.add(mesh);
      pool.current.push(mesh);
    }
    for (let i = 0; i < pool.current.length; i++) {
      const mesh = pool.current[i];
      const shot = shots[i];
      if (!shot) {
        mesh.visible = false;
        continue;
      }
      mesh.visible = true;
      mesh.position.copy(shot.position);
      const mat = mesh.material as THREE.MeshBasicMaterial;
      mat.color.set(shot.owner === "player" ? "#ffe08a" : "#ff5a3a");
    }
  });
  return <group ref={group} />;
}

export function ExtractMarker({
  layout,
  flightState,
}: {
  layout: SceneLayout;
  flightState: React.MutableRefObject<FlightState>;
}) {
  const ref = useRef<THREE.Group>(null);
  useFrame((clock) => {
    if (!ref.current) return;
    const s = flightState.current;
    ref.current.visible = s.sectorsCleared > 0 && !s.finished;
    const pulse = 1 + Math.sin(clock.clock.elapsedTime * 2.4) * 0.1;
    ref.current.scale.setScalar(pulse);
  });
  return (
    <group
      ref={ref}
      position={[
        layout.landingThreshold.x,
        layout.landingThreshold.y + 10,
        layout.landingThreshold.z,
      ]}
    >
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <ringGeometry args={[10, 13, 40]} />
        <meshBasicMaterial
          color="#3dff7a"
          transparent
          opacity={0.55}
          side={THREE.DoubleSide}
          depthWrite={false}
        />
      </mesh>
    </group>
  );
}
