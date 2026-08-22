import { FlagDecal, FlagPole } from "@/components/flight/FlagGraphics";
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
  enemyFlag = "ru",
}: {
  layout: SceneLayout;
  flightState: React.MutableRefObject<FlightState>;
  enemyFlag?: string;
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
      {layout.sectors.map((sector) => (
        <group
          key={`base-flag-${sector.id}`}
          position={[sector.center.x + 22, 0, sector.center.z + 16]}
        >
          <FlagPole
            code={enemyFlag}
            height={30}
            clothWidth={20}
            clothHeight={12}
          />
        </group>
      ))}
      <TargetMeshes flightState={flightState} />
      <EnemyAircraftMeshes flightState={flightState} enemyFlag={enemyFlag} />
      <ProjectileMeshes flightState={flightState} />
      <BlastMeshes flightState={flightState} />
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
        <meshBasicMaterial color="#c4a24a" transparent opacity={0.55} />
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
          color="#ff7a18"
          transparent
          opacity={0.55}
          side={THREE.DoubleSide}
          depthWrite={false}
        />
      </mesh>
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, -0.05, 0]}>
        <ringGeometry args={[8, 11, 32]} />
        <meshBasicMaterial
          color="#ffd060"
          transparent
          opacity={0.28}
          side={THREE.DoubleSide}
          depthWrite={false}
        />
      </mesh>
      <mesh position={[0, 22, 0]}>
        <cylinderGeometry args={[0.28, 0.4, 44, 8]} />
        <meshBasicMaterial color="#ff8a20" transparent opacity={0.42} />
      </mesh>
      <Html
        position={[0, 32, 0]}
        center
        distanceFactor={90}
        style={{ pointerEvents: "none" }}
      >
        <div className="rounded border border-orange-400/80 bg-black/75 px-2 py-0.5 font-mono text-[10px] tracking-wide text-orange-300 uppercase">
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
  const beacon = useRef<THREE.Mesh>(null);
  useFrame((clock) => {
    if (!ref.current) return;
    const target = flightState.current.targets.find((t) => t.id === targetId);
    ref.current.visible = Boolean(target && !target.destroyed);
    if (beacon.current) {
      const pulse = 0.55 + Math.sin(clock.clock.elapsedTime * 4.2) * 0.35;
      const mat = beacon.current.material as THREE.MeshBasicMaterial;
      mat.opacity = pulse;
    }
  });
  const target = flightState.current.targets.find((t) => t.id === targetId);
  if (!target) return null;
  return (
    <group ref={ref} position={target.position}>
      {/* Ground paint — readable from altitude */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, -target.position.y + 0.06, 0]}
      >
        <ringGeometry args={[3.2, 5.4, 24]} />
        <meshBasicMaterial
          color="#ff6a10"
          transparent
          opacity={0.7}
          side={THREE.DoubleSide}
          depthWrite={false}
        />
      </mesh>
      <mesh
        rotation={[-Math.PI / 2, 0, Math.PI / 4]}
        position={[0, -target.position.y + 0.07, 0]}
      >
        <planeGeometry args={[7.2, 0.55]} />
        <meshBasicMaterial color="#ffd040" transparent opacity={0.85} />
      </mesh>
      <mesh
        rotation={[-Math.PI / 2, 0, -Math.PI / 4]}
        position={[0, -target.position.y + 0.07, 0]}
      >
        <planeGeometry args={[7.2, 0.55]} />
        <meshBasicMaterial color="#ffd040" transparent opacity={0.85} />
      </mesh>
      <mesh ref={beacon} position={[0, 9, 0]}>
        <cylinderGeometry args={[0.18, 0.32, 18, 8]} />
        <meshBasicMaterial color="#ff7a18" transparent opacity={0.65} />
      </mesh>
      <HardTarget target={target} />
    </group>
  );
}

function HardTarget({ target }: { target: CombatTarget }) {
  switch (target.kind) {
    case "turret":
      return (
        <group>
          <mesh position={[0, 0.25, 0]}>
            <cylinderGeometry args={[0.95, 1.15, 0.55, 8]} />
            <meshStandardMaterial
              color="#6a3a1c"
              emissive="#5a2208"
              emissiveIntensity={0.35}
              roughness={0.65}
            />
          </mesh>
          <mesh position={[0, 0.85, 0]}>
            <boxGeometry args={[1.05, 0.55, 1.05]} />
            <meshStandardMaterial
              color="#c45a18"
              metalness={0.35}
              roughness={0.45}
            />
          </mesh>
          <mesh position={[0, 0.9, -0.85]} rotation={[0.1, 0, 0]}>
            <cylinderGeometry args={[0.1, 0.12, 1.6, 8]} />
            <meshStandardMaterial color="#222" metalness={0.6} />
          </mesh>
        </group>
      );
    case "bunker":
      return (
        <group>
          <mesh>
            <boxGeometry args={[5.2, 2.6, 3.8]} />
            <meshStandardMaterial
              color="#8a4a22"
              emissive="#3a1808"
              emissiveIntensity={0.25}
              roughness={0.8}
            />
          </mesh>
          <mesh position={[0, 1.45, 0]}>
            <boxGeometry args={[5.4, 0.18, 4]} />
            <meshStandardMaterial color="#e07020" roughness={0.5} />
          </mesh>
        </group>
      );
    case "radar":
      return (
        <group>
          <mesh position={[0, -0.4, 0]}>
            <cylinderGeometry args={[0.22, 0.3, 2.6, 8]} />
            <meshStandardMaterial color="#3a3a3a" />
          </mesh>
          <mesh rotation={[0.6, 0.4, 0]}>
            <sphereGeometry
              args={[1.35, 10, 8, 0, Math.PI * 2, 0, Math.PI * 0.55]}
            />
            <meshStandardMaterial
              color="#f0c060"
              emissive="#c08020"
              emissiveIntensity={0.4}
              metalness={0.45}
              roughness={0.28}
              side={THREE.DoubleSide}
            />
          </mesh>
        </group>
      );
    default:
      return (
        <group>
          <mesh>
            <boxGeometry args={[3.1, 1.35, 1.5]} />
            <meshStandardMaterial
              color="#c45a18"
              emissive="#5a2008"
              emissiveIntensity={0.3}
              roughness={0.65}
            />
          </mesh>
          <mesh position={[0.85, -0.4, 0.65]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.32, 0.32, 0.24, 10]} />
            <meshStandardMaterial color="#1a1a1a" />
          </mesh>
          <mesh position={[-0.85, -0.4, 0.65]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.32, 0.32, 0.24, 10]} />
            <meshStandardMaterial color="#1a1a1a" />
          </mesh>
        </group>
      );
  }
}

function EnemyAircraftMeshes({
  flightState,
  enemyFlag,
}: {
  flightState: React.MutableRefObject<FlightState>;
  enemyFlag: string;
}) {
  return (
    <group>
      {flightState.current.enemies.map((enemy) => (
        <EnemyCraft
          key={enemy.id}
          enemyId={enemy.id}
          flightState={flightState}
          enemyFlag={enemyFlag}
        />
      ))}
    </group>
  );
}

function EnemyCraft({
  enemyId,
  flightState,
  enemyFlag,
}: {
  enemyId: string;
  flightState: React.MutableRefObject<FlightState>;
  enemyFlag: string;
}) {
  const ref = useRef<THREE.Group>(null);
  useFrame(() => {
    const enemy = flightState.current.enemies.find((e) => e.id === enemyId);
    if (!ref.current || !enemy) return;
    const show = enemy.alive || enemy.position.y > 2;
    ref.current.visible = show;
    if (!show) return;
    ref.current.position.copy(enemy.position);
    ref.current.rotation.set(enemy.pitch, enemy.yaw, enemy.bank, "YXZ");
  });
  return (
    <group ref={ref}>
      <EnemyJetMesh enemyFlag={enemyFlag} />
    </group>
  );
}

/** Compact hostile interceptor — no cockpit, no lights. */
function EnemyJetMesh({ enemyFlag }: { enemyFlag: string }) {
  return (
    <group>
      <mesh rotation={[Math.PI / 2, 0, 0]} castShadow>
        <capsuleGeometry args={[0.32, 3.4, 3, 8]} />
        <meshStandardMaterial
          color="#6a2218"
          metalness={0.42}
          roughness={0.4}
        />
      </mesh>
      <mesh position={[0, 0.02, 0.15]} castShadow>
        <boxGeometry args={[6.8, 0.07, 1.25]} />
        <meshStandardMaterial color="#3e1612" metalness={0.3} roughness={0.5} />
      </mesh>
      <FlagDecal
        code={enemyFlag}
        width={1.7}
        height={1.0}
        position={[2.15, 0.12, 0.05]}
        rotation={[-Math.PI / 2, 0, 0]}
      />
      <FlagDecal
        code={enemyFlag}
        width={1.7}
        height={1.0}
        position={[-2.15, 0.12, 0.05]}
        rotation={[-Math.PI / 2, 0, 0]}
      />
      <FlagDecal
        code={enemyFlag}
        width={0.7}
        height={0.45}
        position={[0.08, 0.55, 1.2]}
        rotation={[0, Math.PI / 2, 0]}
      />
      <mesh position={[0, 0.48, 1.35]} castShadow>
        <boxGeometry args={[0.08, 1.05, 0.85]} />
        <meshStandardMaterial color="#8a2e1c" />
      </mesh>
      <mesh position={[0, 0.18, 1.55]}>
        <boxGeometry args={[1.8, 0.06, 0.55]} />
        <meshStandardMaterial color="#3e1612" />
      </mesh>
      <mesh position={[0, 0.18, -0.55]}>
        <sphereGeometry args={[0.28, 8, 8]} />
        <meshStandardMaterial
          color="#1a2830"
          metalness={0.75}
          roughness={0.12}
        />
      </mesh>
      <mesh position={[0, 0.02, 2.15]} rotation={[Math.PI / 2, 0, 0]}>
        <coneGeometry args={[0.12, 0.7, 6]} />
        <meshBasicMaterial color="#ff7040" transparent opacity={0.55} />
      </mesh>
      <mesh position={[0, 0.55, 0]}>
        <boxGeometry args={[0.12, 0.04, 2.4]} />
        <meshStandardMaterial color="#c45a22" />
      </mesh>
    </group>
  );
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
        new THREE.SphereGeometry(0.32, 8, 8),
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
      mat.color.set(shot.owner === "player" ? "#ffb020" : "#ff5a3a");
    }
  });
  return <group ref={group} />;
}

function BlastMeshes({
  flightState,
}: {
  flightState: React.MutableRefObject<FlightState>;
}) {
  const group = useRef<THREE.Group>(null);
  const pool = useRef<THREE.Group[]>([]);

  useFrame(() => {
    const blasts = flightState.current.blasts;
    const parent = group.current;
    if (!parent) return;
    while (pool.current.length < blasts.length) {
      const g = new THREE.Group();
      const ball = new THREE.Mesh(
        new THREE.SphereGeometry(1, 12, 10),
        new THREE.MeshBasicMaterial({
          color: "#ff8a20",
          transparent: true,
          opacity: 0.85,
          depthWrite: false,
        }),
      );
      const ring = new THREE.Mesh(
        new THREE.RingGeometry(0.85, 1.05, 28),
        new THREE.MeshBasicMaterial({
          color: "#ffe080",
          transparent: true,
          opacity: 0.7,
          side: THREE.DoubleSide,
          depthWrite: false,
        }),
      );
      ring.rotation.x = -Math.PI / 2;
      g.add(ball);
      g.add(ring);
      parent.add(g);
      pool.current.push(g);
    }
    for (let i = 0; i < pool.current.length; i++) {
      const g = pool.current[i];
      const blast = blasts[i];
      if (!blast) {
        g.visible = false;
        continue;
      }
      g.visible = true;
      g.position.copy(blast.position);
      const t = blast.age / blast.life;
      const scale = blast.radius * (0.18 + t * 0.95);
      g.scale.setScalar(scale);
      const ball = g.children[0] as THREE.Mesh;
      const ring = g.children[1] as THREE.Mesh;
      (ball.material as THREE.MeshBasicMaterial).opacity = 0.75 * (1 - t);
      (ring.material as THREE.MeshBasicMaterial).opacity = 0.85 * (1 - t);
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
          color="#c4a24a"
          transparent
          opacity={0.55}
          side={THREE.DoubleSide}
          depthWrite={false}
        />
      </mesh>
    </group>
  );
}
