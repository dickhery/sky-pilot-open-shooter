import { CombatField, ExtractMarker } from "@/components/flight/CombatField";
import { Environment } from "@/components/flight/Environment";
import { PlaneModel } from "@/components/flight/PlaneModel";
import {
  AirportBuildings,
  DestinationAirport,
  DistantMountains,
  GroundDressing,
  MapLandmarks,
  Terrain,
  TreeField,
  WaterBody,
} from "@/components/flight/Scenery";
import {
  HovercraftModel,
  ParkedMarker,
  SoldierModel,
} from "@/components/flight/VehicleModels";
import {
  type FlightState,
  type SceneLayout,
  stepFlight,
} from "@/components/flight/flightPhysics";
import type { FlightPhase, Plane as PlaneType, Weather } from "@/types/game";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";

export interface FlightSceneProps {
  plane: PlaneType;
  weather: Weather;
  layout: SceneLayout;
  /** Live control axes ref from useFlightControls. */
  controlsAxes: React.MutableRefObject<{
    pitch: number;
    roll: number;
    throttle: number;
    brakes: boolean;
    fire: boolean;
    interact: boolean;
  }>;
  /** Shared mutable flight state — the page reads this for scoring/HUD. */
  flightState: React.MutableRefObject<FlightState>;
  /** Called when the flight phase changes so the page can update the store. */
  onPhaseChange: (phase: FlightPhase) => void;
  /** Pilot-seat camera when true. */
  cockpitView: boolean;
  /** Freeze physics while the briefing overlay is up. */
  paused?: boolean;
  /** Paid country flags currently locked in for this theater. */
  playerFlag?: string;
  enemyFlag?: string;
}

/**
 * react-three-fiber Canvas hosting the plane, environment, runways, and
 * the waypoint marker. The render loop integrates flight physics each
 * frame and chases the plane with a follow camera.
 */
export function FlightScene({
  plane,
  weather,
  layout,
  controlsAxes,
  flightState,
  onPhaseChange,
  cockpitView,
  paused = false,
  playerFlag = "us",
  enemyFlag = "ru",
}: FlightSceneProps) {
  return (
    <Canvas
      shadows
      className="touch-none"
      dpr={[1, 1.5]}
      gl={{
        alpha: false,
        antialias: true,
        powerPreference: "high-performance",
        toneMapping: THREE.ACESFilmicToneMapping,
        toneMappingExposure: 1.05,
      }}
      camera={{
        fov: cockpitView ? 68 : 58,
        near: cockpitView ? 0.1 : 0.2,
        far: 6500,
        position: [0, 6, 50],
      }}
    >
      <Environment weather={weather} />
      <Terrain layout={layout} />
      <WaterBody theme={layout.theme} />
      <TreeField layout={layout} />
      <GroundDressing layout={layout} />
      <DistantMountains theme={layout.theme} />
      <MapLandmarks layout={layout} night={weather === "Nighttime"} />
      <AirportBuildings
        layout={layout}
        night={weather === "Nighttime"}
        playerFlag={playerFlag}
      />
      <DestinationAirport
        layout={layout}
        night={weather === "Nighttime"}
        playerFlag={playerFlag}
      />
      <Runway
        start={layout.departureStart}
        end={layout.departureEnd}
        weather={weather}
      />
      <Runway
        start={layout.landingThreshold}
        end={layout.landingEnd}
        weather={weather}
        isLanding
      />
      <CombatField
        layout={layout}
        flightState={flightState}
        enemyFlag={enemyFlag}
      />
      <ExtractMarker layout={layout} flightState={flightState} />
      <FlightRig
        plane={plane}
        layout={layout}
        controlsAxes={controlsAxes}
        flightState={flightState}
        onPhaseChange={onPhaseChange}
        cockpitView={cockpitView}
        paused={paused}
        playerFlag={playerFlag}
      />
    </Canvas>
  );
}

// ── Scene pieces ────────────────────────────────────────────────────────────

function Runway({
  start,
  end,
  weather,
  isLanding = false,
}: {
  start: THREE.Vector3;
  end: THREE.Vector3;
  weather: Weather;
  isLanding?: boolean;
}) {
  const length = start.distanceTo(end);
  const center = start.clone().add(end).multiplyScalar(0.5);
  const heading = Math.atan2(end.x - start.x, end.z - start.z);
  const isNight = weather === "Nighttime";

  const dashes = useMemo(() => {
    const arr: number[] = [];
    const count = Math.floor(length / 10);
    for (let i = 0; i < count; i++) {
      arr.push(-length / 2 + 6 + i * 10);
    }
    return arr;
  }, [length]);

  const thresholdBars = useMemo(() => {
    const bars: number[] = [];
    for (let i = 0; i < 8; i++) {
      bars.push(-3.2 + i * 0.92);
    }
    return bars;
  }, []);

  return (
    <group position={center} rotation={[0, heading, 0]}>
      {/* Shoulders */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.015, 0]}>
        <planeGeometry args={[16, length + 8]} />
        <meshStandardMaterial color="#3a3d36" roughness={0.95} />
      </mesh>
      {/* Tarmac */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.025, 0]}>
        <planeGeometry args={[12, length]} />
        <meshStandardMaterial color="#2a2d32" roughness={0.88} />
      </mesh>
      {/* Edge stripes */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-5.7, 0.035, 0]}>
        <planeGeometry args={[0.35, length]} />
        <meshStandardMaterial
          color={isNight ? "#ffe08a" : "#e8e4d8"}
          emissive={isNight ? "#ffc44a" : "#000"}
          emissiveIntensity={isNight ? 1.35 : 0}
        />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[5.7, 0.035, 0]}>
        <planeGeometry args={[0.35, length]} />
        <meshStandardMaterial
          color={isNight ? "#ffe08a" : "#e8e4d8"}
          emissive={isNight ? "#ffc44a" : "#000"}
          emissiveIntensity={isNight ? 1.35 : 0}
        />
      </mesh>
      {/* Centerline dashes */}
      {dashes.map((z) => (
        <mesh
          key={`dash-${z}`}
          rotation={[-Math.PI / 2, 0, 0]}
          position={[0, 0.036, z]}
        >
          <planeGeometry args={[0.28, 4]} />
          <meshStandardMaterial
            color="#f0f0ec"
            emissive={isNight ? "#fff4c8" : "#000"}
            emissiveIntensity={isNight ? 0.9 : 0}
          />
        </mesh>
      ))}
      {/* Threshold bars */}
      {thresholdBars.map((x) => (
        <mesh
          key={`th-${x}`}
          rotation={[-Math.PI / 2, 0, 0]}
          position={[x, 0.037, -length / 2 + 8]}
        >
          <planeGeometry args={[0.38, 10]} />
          <meshStandardMaterial
            color="#f2f2ee"
            emissive={isNight ? "#fff6d0" : "#000"}
            emissiveIntensity={isNight ? 0.85 : 0}
          />
        </mesh>
      ))}
      {/* Aiming point */}
      {isLanding && (
        <>
          <mesh
            rotation={[-Math.PI / 2, 0, 0]}
            position={[-2.2, 0.037, -length / 2 + 36]}
          >
            <planeGeometry args={[1.6, 8]} />
            <meshStandardMaterial
              color="#f2f2ee"
              emissive={isNight ? "#fff6d0" : "#000"}
              emissiveIntensity={isNight ? 0.9 : 0}
            />
          </mesh>
          <mesh
            rotation={[-Math.PI / 2, 0, 0]}
            position={[2.2, 0.037, -length / 2 + 36]}
          >
            <planeGeometry args={[1.6, 8]} />
            <meshStandardMaterial
              color="#f2f2ee"
              emissive={isNight ? "#fff6d0" : "#000"}
              emissiveIntensity={isNight ? 0.9 : 0}
            />
          </mesh>
        </>
      )}
      <RunwayEdgeLamps length={length} night={isNight} />
      {isLanding && (
        <>
          <ApproachLight x={-4.2} z={-length / 2 + 2} night={isNight} lit />
          <ApproachLight x={4.2} z={-length / 2 + 2} night={isNight} lit />
          <ApproachLight x={-4.2} z={-length / 2 + 14} night={isNight} />
          <ApproachLight x={4.2} z={-length / 2 + 14} night={isNight} />
          <ApproachLight x={-4.2} z={-length / 2 + 28} night={isNight} />
          <ApproachLight x={4.2} z={-length / 2 + 28} night={isNight} />
        </>
      )}
      {isNight && (
        <pointLight
          position={[0, 8, 0]}
          color="#ffe9b8"
          intensity={2.6}
          distance={110}
        />
      )}
    </group>
  );
}

function RunwayEdgeLamps({
  length,
  night,
}: {
  length: number;
  night: boolean;
}) {
  const posts = useMemo(() => {
    const zs: number[] = [];
    for (let z = -length / 2 + 10; z < length / 2 - 4; z += 26) {
      zs.push(z);
    }
    return zs;
  }, [length]);
  if (!night) return null;
  return (
    <group>
      {posts.map((z) => (
        <group key={`el-${z}`}>
          <mesh position={[-6.3, 0.22, z]}>
            <sphereGeometry args={[0.13, 8, 8]} />
            <meshBasicMaterial color="#ffe7a0" />
          </mesh>
          <mesh position={[6.3, 0.22, z]}>
            <sphereGeometry args={[0.13, 8, 8]} />
            <meshBasicMaterial color="#ffe7a0" />
          </mesh>
        </group>
      ))}
    </group>
  );
}

function ApproachLight({
  x,
  z,
  night,
  lit = false,
}: {
  x: number;
  z: number;
  night: boolean;
  lit?: boolean;
}) {
  return (
    <group position={[x, 0.15, z]}>
      <mesh>
        <cylinderGeometry args={[0.06, 0.08, 0.3, 6]} />
        <meshStandardMaterial color="#2a2a2a" />
      </mesh>
      <mesh position={[0, 0.22, 0]}>
        <sphereGeometry args={[0.12, 8, 8]} />
        <meshBasicMaterial color="#5dff8a" />
      </mesh>
      {lit && (
        <pointLight
          color="#7dff9a"
          intensity={night ? 3.2 : 0.6}
          distance={36}
        />
      )}
    </group>
  );
}

// ── Flight rig: vehicle + camera + physics loop ─────────────────────────────

const _camOffset = new THREE.Vector3();
const _camTarget = new THREE.Vector3();
const _lookAt = new THREE.Vector3();
const _up = new THREE.Vector3();

function FlightRig({
  plane,
  layout,
  controlsAxes,
  flightState,
  onPhaseChange,
  cockpitView,
  paused,
  playerFlag,
}: {
  plane: PlaneType;
  layout: SceneLayout;
  controlsAxes: FlightSceneProps["controlsAxes"];
  flightState: React.MutableRefObject<FlightState>;
  onPhaseChange: (phase: FlightPhase) => void;
  cockpitView: boolean;
  paused: boolean;
  playerFlag: string;
}) {
  const planeRef = useRef<THREE.Group>(null);
  const shadowRef = useRef<THREE.Mesh>(null);
  const { camera } = useThree();
  const persp = camera as THREE.PerspectiveCamera;
  const lastPhase = useRef<FlightPhase>("takeoff");
  const camPos = useRef(new THREE.Vector3(0, 6, 50));

  useFrame((_, delta) => {
    const dt = Math.min(delta, 0.05);
    const state = flightState.current;
    const input = controlsAxes.current;

    if (!paused) {
      stepFlight(state, layout, plane, input, dt);
    }

    if (state.phase !== lastPhase.current) {
      lastPhase.current = state.phase;
      onPhaseChange(state.phase);
    }

    if (planeRef.current) {
      planeRef.current.position.copy(state.position);
      planeRef.current.rotation.copy(state.rotation);
    }

    if (shadowRef.current) {
      const agl = Math.max(0, state.position.y - 1.07);
      const scale = THREE.MathUtils.clamp(3.2 + agl * 0.35, 3.2, 10);
      const opacity = THREE.MathUtils.clamp(0.38 - agl * 0.018, 0.04, 0.38);
      shadowRef.current.position.set(state.position.x, 0.04, state.position.z);
      shadowRef.current.scale.set(scale, scale, 1);
      const mat = shadowRef.current.material as THREE.MeshBasicMaterial;
      mat.opacity = opacity;
    }

    const heading = state.rotation.y;
    const bankLean = state.rotation.z * 0.35;

    const onFoot = state.vehicleMode === "onFoot";
    const hover = state.vehicleMode === "hovercraft";
    if (cockpitView && state.vehicleMode === "air") {
      persp.fov = 68;
      persp.near = 0.1;
      persp.far = 6500;
      persp.updateProjectionMatrix();
      _camOffset.set(0.16, 0.42, 0.22);
      _camOffset.applyEuler(state.rotation);
      camera.position.copy(state.position).add(_camOffset);
      camera.quaternion.setFromEuler(state.rotation);
      camera.rotateX(-0.08);
      _up.set(0, 1, 0).applyEuler(state.rotation);
      camera.up.copy(_up);
    } else {
      persp.fov = onFoot ? 72 : 58;
      persp.near = 0.15;
      persp.far = 6500;
      persp.updateProjectionMatrix();
      const dist = onFoot ? 4.2 : hover ? 8.5 : state.airborne ? 14 : 10;
      const height = onFoot ? 2.1 : hover ? 3.2 : state.airborne ? 4.2 : 2.8;
      _camOffset.set(
        Math.sin(heading) * dist + Math.cos(heading) * bankLean * 2.2,
        height + Math.abs(state.rotation.x) * 1.4,
        Math.cos(heading) * dist - Math.sin(heading) * bankLean * 2.2,
      );
      camPos.current.lerp(
        _camTarget.set(
          state.position.x + _camOffset.x,
          state.position.y + _camOffset.y,
          state.position.z + _camOffset.z,
        ),
        Math.min(1, dt * 3.1),
      );
      camera.position.copy(camPos.current);
      _lookAt.set(
        state.position.x - Math.sin(heading) * 10,
        state.position.y + (onFoot ? 1.3 : 0.55) + state.rotation.x * 2.5,
        state.position.z - Math.cos(heading) * 10,
      );
      camera.lookAt(_lookAt);
      _up.set(-Math.sin(heading) * bankLean * 0.25, 1, 0).normalize();
      camera.up.lerp(_up, Math.min(1, dt * 4));
    }
  });

  return (
    <>
      <group ref={planeRef}>
        <ActiveVehicle
          plane={plane}
          axes={controlsAxes}
          flightState={flightState}
          cockpitView={cockpitView}
          playerFlag={playerFlag}
        />
      </group>
      <ParkedVehicles
        plane={plane}
        flightState={flightState}
        axes={controlsAxes}
        playerFlag={playerFlag}
      />
      <mesh ref={shadowRef} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[1, 20]} />
        <meshBasicMaterial
          color="#1a1a14"
          transparent
          opacity={0.3}
          depthWrite={false}
        />
      </mesh>
    </>
  );
}

function ActiveVehicle({
  plane,
  axes,
  flightState,
  cockpitView,
  playerFlag,
}: {
  plane: PlaneType;
  axes: FlightSceneProps["controlsAxes"];
  flightState: React.MutableRefObject<FlightState>;
  cockpitView: boolean;
  playerFlag: string;
}) {
  const air = useRef<THREE.Group>(null);
  const hover = useRef<THREE.Group>(null);
  const foot = useRef<THREE.Group>(null);
  useFrame(() => {
    const mode = flightState.current.vehicleMode;
    if (air.current) air.current.visible = mode === "air";
    if (hover.current) hover.current.visible = mode === "hovercraft";
    if (foot.current) foot.current.visible = mode === "onFoot";
  });
  return (
    <>
      <group ref={air}>
        <PlaneModel
          planeId={plane.id}
          axes={axes}
          flightState={flightState}
          cockpitView={cockpitView}
          playerFlag={playerFlag}
        />
      </group>
      <group ref={hover} visible={false}>
        <HovercraftModel axes={axes} />
      </group>
      <group ref={foot} visible={false}>
        <SoldierModel />
      </group>
    </>
  );
}

function ParkedVehicles({
  plane,
  flightState,
  axes,
  playerFlag,
}: {
  plane: PlaneType;
  flightState: React.MutableRefObject<FlightState>;
  axes: FlightSceneProps["controlsAxes"];
  playerFlag: string;
}) {
  const airRef = useRef<THREE.Group>(null);
  const hoverRef = useRef<THREE.Group>(null);
  useFrame(() => {
    const s = flightState.current;
    if (airRef.current) {
      if (s.airParked) {
        airRef.current.visible = true;
        airRef.current.position.copy(s.airParked);
        airRef.current.rotation.set(0, s.airHeading, 0);
      } else {
        airRef.current.visible = false;
      }
    }
    if (hoverRef.current) {
      if (s.hoverParked) {
        hoverRef.current.visible = true;
        hoverRef.current.position.copy(s.hoverParked);
        hoverRef.current.rotation.set(0, s.hoverHeading, 0);
      } else {
        hoverRef.current.visible = false;
      }
    }
  });
  return (
    <>
      <group ref={airRef} visible={false}>
        <PlaneModel
          planeId={plane.id}
          axes={axes}
          flightState={flightState}
          cockpitView={false}
          playerFlag={playerFlag}
        />
        {flightState.current.airParked && (
          <ParkedMarker
            position={new THREE.Vector3()}
            heading={0}
            kind={plane.class === "jet" ? "air-jet" : "air-heli"}
          />
        )}
      </group>
      <group ref={hoverRef} visible={false}>
        <HovercraftModel axes={axes} />
      </group>
    </>
  );
}
