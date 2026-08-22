import { CockpitInterior } from "@/components/flight/CockpitInterior";
import { FlagDecal } from "@/components/flight/FlagGraphics";
import { HelicopterModel } from "@/components/flight/VehicleModels";
import type { FlightState } from "@/components/flight/flightPhysics";
import type { PlaneId } from "@/types/game";
import { useFrame } from "@react-three/fiber";
import { forwardRef, useMemo, useRef } from "react";
import * as THREE from "three";

interface ControlAxesLike {
  pitch: number;
  roll: number;
  throttle: number;
}

interface PlaneModelProps {
  planeId: PlaneId;
  axes: React.MutableRefObject<ControlAxesLike>;
  flightState: React.MutableRefObject<FlightState>;
  cockpitView?: boolean;
  playerFlag?: string;
}

interface Palette {
  body: string;
  accent: string;
  trim: string;
  glass: string;
  wing: string;
  stripe: string;
}

function makeFuselage(isJet: boolean): THREE.LatheGeometry {
  const pts = isJet
    ? [
        [0.01, -3.15],
        [0.12, -2.95],
        [0.22, -2.55],
        [0.32, -1.9],
        [0.38, -1.1],
        [0.4, -0.2],
        [0.38, 0.7],
        [0.32, 1.5],
        [0.24, 2.2],
        [0.16, 2.75],
        [0.08, 3.15],
        [0.02, 3.35],
      ]
    : [
        [0.02, -2.05],
        [0.28, -1.7],
        [0.42, -1.1],
        [0.5, -0.3],
        [0.52, 0.4],
        [0.46, 1.1],
        [0.32, 1.7],
        [0.18, 2.15],
        [0.08, 2.55],
      ];
  const vectors = pts.map(([x, y]) => new THREE.Vector2(x, y));
  const geo = new THREE.LatheGeometry(vectors, 28);
  geo.rotateX(Math.PI / 2);
  geo.computeVertexNormals();
  return geo;
}

function makeWing(
  span: number,
  rootChord: number,
  tipChord: number,
  thickness: number,
  sweep: number,
): THREE.ExtrudeGeometry {
  const shape = new THREE.Shape();
  const half = span / 2;
  const rootLe = rootChord * 0.32;
  const rootTe = -rootChord * 0.68;
  const tipLe = tipChord * 0.22 - sweep;
  const tipTe = -tipChord * 0.78 - sweep;
  shape.moveTo(0, rootLe);
  shape.lineTo(half, tipLe);
  shape.quadraticCurveTo(half + 0.08, (tipLe + tipTe) * 0.5, half, tipTe);
  shape.lineTo(0, rootTe);
  shape.lineTo(-half, tipTe);
  shape.quadraticCurveTo(-half - 0.08, (tipLe + tipTe) * 0.5, -half, tipLe);
  shape.closePath();
  const geo = new THREE.ExtrudeGeometry(shape, {
    depth: thickness,
    bevelEnabled: true,
    bevelThickness: thickness * 0.45,
    bevelSize: Math.min(0.1, thickness * 0.8),
    bevelSegments: 2,
    steps: 1,
    curveSegments: 4,
  });
  geo.rotateX(-Math.PI / 2);
  geo.translate(0, thickness * 0.5, 0);
  geo.computeVertexNormals();
  return geo;
}

function makeFin(
  height: number,
  root: number,
  tip: number,
  thickness: number,
  sweep: number,
): THREE.ExtrudeGeometry {
  const shape = new THREE.Shape();
  shape.moveTo(0, 0);
  shape.lineTo(root * 0.25, 0);
  shape.lineTo(-sweep + tip * 0.2, height);
  shape.lineTo(-sweep - tip * 0.8, height * 0.92);
  shape.lineTo(-root * 0.75, 0);
  shape.closePath();
  const geo = new THREE.ExtrudeGeometry(shape, {
    depth: thickness,
    bevelEnabled: true,
    bevelThickness: thickness * 0.3,
    bevelSize: 0.03,
    bevelSegments: 1,
    steps: 1,
  });
  geo.rotateY(Math.PI / 2);
  geo.translate(thickness * 0.5, 0, 0);
  geo.computeVertexNormals();
  return geo;
}

/**
 * Procedural military airframes. Strike jet is a twin-intake fighter;
 * Spectre is a stub-winged attack helicopter with a spinning rotor.
 */
export const PlaneModel = forwardRef<THREE.Group, PlaneModelProps>(
  function PlaneModel(
    { planeId, axes, flightState, cockpitView = false, playerFlag = "us" },
    ref,
  ) {
    const isJet = planeId === "StrikeJet";
    const gearRef = useRef<THREE.Group>(null);
    const lightRef = useRef<THREE.PointLight>(null);
    const shakeRef = useRef<THREE.Group>(null);
    const exhaustRef = useRef<THREE.Group>(null);

    const colors = useMemo<Palette>(
      () =>
        isJet
          ? {
              body: "#3d4638",
              accent: "#6b7a58",
              trim: "#1c2218",
              glass: "#7aa0b0",
              wing: "#454e3e",
              stripe: "#c4a24a",
            }
          : {
              body: "#2f3828",
              accent: "#4a553c",
              trim: "#1a1e16",
              glass: "#6a8894",
              wing: "#3a4432",
              stripe: "#8a6a28",
            },
      [isJet],
    );

    const fuselage = useMemo(() => makeFuselage(isJet), [isJet]);
    const wing = useMemo(
      () =>
        isJet
          ? makeWing(8.6, 2.4, 0.55, 0.1, 1.55)
          : makeWing(5.4, 1.15, 0.7, 0.08, 0.12),
      [isJet],
    );
    const stab = useMemo(
      () =>
        isJet
          ? makeWing(3.4, 1.05, 0.42, 0.07, 0.55)
          : makeWing(2.2, 0.7, 0.4, 0.06, 0.12),
      [isJet],
    );
    const fin = useMemo(
      () =>
        isJet
          ? makeFin(1.55, 1.25, 0.45, 0.07, 0.55)
          : makeFin(1.05, 0.85, 0.4, 0.07, 0.22),
      [isJet],
    );

    useFrame((state) => {
      const throttle = axes.current.throttle;
      const airborne = flightState.current.airborne;
      if (isJet && shakeRef.current) {
        const shake = throttle * 0.005;
        shakeRef.current.position.y =
          Math.sin(state.clock.elapsedTime * 80) * shake;
      }
      if (gearRef.current) {
        gearRef.current.visible = !airborne && !cockpitView;
      }
      if (lightRef.current) {
        lightRef.current.intensity = airborne ? 0.15 : 0.55;
      }
      if (exhaustRef.current) {
        exhaustRef.current.visible = isJet && throttle > 0.35 && !cockpitView;
        exhaustRef.current.scale.setScalar(0.7 + throttle * 0.9);
      }
    });

    if (!isJet) {
      return (
        <group ref={ref}>
          {cockpitView && (
            <CockpitInterior
              planeId={planeId}
              flightState={flightState}
              axes={axes}
            />
          )}
          <HelicopterModel
            axes={axes}
            cockpitView={cockpitView}
            playerFlag={playerFlag}
          />
        </group>
      );
    }

    return (
      <group ref={ref}>
        <group ref={shakeRef}>
          <mesh geometry={fuselage} castShadow visible={!cockpitView}>
            <meshStandardMaterial
              color={colors.body}
              metalness={0.38}
              roughness={0.42}
              envMapIntensity={0.55}
            />
          </mesh>

          {cockpitView ? (
            <CockpitInterior
              planeId={planeId}
              flightState={flightState}
              axes={axes}
            />
          ) : (
            <>
              <mesh
                position={[0, isJet ? 0.38 : 0.42, isJet ? -0.35 : 0.15]}
                rotation={[0.08, 0, 0]}
                scale={[1, 0.62, isJet ? 1.05 : 0.95]}
              >
                <sphereGeometry
                  args={[0.48, 20, 14, 0, Math.PI * 2, 0, Math.PI * 0.55]}
                />
                <meshStandardMaterial
                  color={colors.glass}
                  metalness={0.85}
                  roughness={0.06}
                  transparent
                  opacity={0.46}
                  envMapIntensity={1.2}
                />
              </mesh>
            </>
          )}

          <group position={[0, isJet ? -0.05 : 0.05, isJet ? 0.15 : 0.25]}>
            <mesh geometry={wing} castShadow>
              <meshStandardMaterial
                color={colors.wing}
                metalness={0.28}
                roughness={0.5}
              />
            </mesh>
            {!cockpitView && (
              <>
                <FlagDecal
                  code={playerFlag}
                  width={2.15}
                  height={1.25}
                  position={[2.85, 0.18, 0.05]}
                  rotation={[-Math.PI / 2, 0, 0]}
                />
                <FlagDecal
                  code={playerFlag}
                  width={2.15}
                  height={1.25}
                  position={[-2.85, 0.18, 0.05]}
                  rotation={[-Math.PI / 2, 0, 0]}
                />
                <FlagDecal
                  code={playerFlag}
                  width={2.15}
                  height={1.25}
                  position={[2.85, -0.12, 0.05]}
                  rotation={[Math.PI / 2, 0, 0]}
                />
                <FlagDecal
                  code={playerFlag}
                  width={2.15}
                  height={1.25}
                  position={[-2.85, -0.12, 0.05]}
                  rotation={[Math.PI / 2, 0, 0]}
                />
              </>
            )}
            <mesh position={[isJet ? 4.05 : 2.55, 0.08, 0.05]}>
              <sphereGeometry args={[0.06, 8, 8]} />
              <meshBasicMaterial color="#ff3030" />
            </mesh>
            <mesh position={[isJet ? -4.05 : -2.55, 0.08, 0.05]}>
              <sphereGeometry args={[0.06, 8, 8]} />
              <meshBasicMaterial color="#30ff60" />
            </mesh>
          </group>

          {isJet && (
            <>
              <mesh
                position={[0.32, -0.18, -1.55]}
                rotation={[Math.PI / 2, 0, 0]}
                visible={!cockpitView}
              >
                <cylinderGeometry args={[0.16, 0.2, 1.4, 10]} />
                <meshStandardMaterial
                  color={colors.trim}
                  metalness={0.45}
                  roughness={0.4}
                />
              </mesh>
              <mesh
                position={[-0.32, -0.18, -1.55]}
                rotation={[Math.PI / 2, 0, 0]}
                visible={!cockpitView}
              >
                <cylinderGeometry args={[0.16, 0.2, 1.4, 10]} />
                <meshStandardMaterial
                  color={colors.trim}
                  metalness={0.45}
                  roughness={0.4}
                />
              </mesh>
              <mesh position={[0.32, -0.18, 2.85]} visible={!cockpitView}>
                <cylinderGeometry args={[0.14, 0.16, 0.45, 10]} />
                <meshStandardMaterial color="#111" metalness={0.7} />
              </mesh>
              <mesh position={[-0.32, -0.18, 2.85]} visible={!cockpitView}>
                <cylinderGeometry args={[0.14, 0.16, 0.45, 10]} />
                <meshStandardMaterial color="#111" metalness={0.7} />
              </mesh>
              <mesh position={[1.6, -0.22, 0.2]} visible={!cockpitView}>
                <boxGeometry args={[0.12, 0.12, 1.4]} />
                <meshStandardMaterial color="#2a2a2a" metalness={0.5} />
              </mesh>
              <mesh position={[-1.6, -0.22, 0.2]} visible={!cockpitView}>
                <boxGeometry args={[0.12, 0.12, 1.4]} />
                <meshStandardMaterial color="#2a2a2a" metalness={0.5} />
              </mesh>
            </>
          )}

          <group position={[0, isJet ? 0.18 : 0.22, isJet ? 2.85 : 2.15]}>
            <mesh geometry={stab} castShadow>
              <meshStandardMaterial
                color={colors.wing}
                metalness={0.28}
                roughness={0.5}
              />
            </mesh>
          </group>
          <group position={[0, isJet ? 0.18 : 0.28, isJet ? 2.75 : 2.05]}>
            <mesh geometry={fin} castShadow>
              <meshStandardMaterial
                color={colors.accent}
                metalness={0.3}
                roughness={0.42}
              />
            </mesh>
            {!cockpitView && (
              <>
                <FlagDecal
                  code={playerFlag}
                  width={0.95}
                  height={0.62}
                  position={[0.08, 0.72, -0.15]}
                  rotation={[0, Math.PI / 2, 0]}
                />
                <FlagDecal
                  code={playerFlag}
                  width={0.95}
                  height={0.62}
                  position={[-0.08, 0.72, -0.15]}
                  rotation={[0, -Math.PI / 2, 0]}
                />
              </>
            )}
          </group>

          <group ref={exhaustRef} visible={false}>
            <mesh position={[0.32, -0.18, 3.25]} rotation={[Math.PI / 2, 0, 0]}>
              <coneGeometry args={[0.15, 0.85, 8]} />
              <meshBasicMaterial color="#7ec8ff" transparent opacity={0.5} />
            </mesh>
            <mesh
              position={[-0.32, -0.18, 3.25]}
              rotation={[Math.PI / 2, 0, 0]}
            >
              <coneGeometry args={[0.15, 0.85, 8]} />
              <meshBasicMaterial color="#7ec8ff" transparent opacity={0.5} />
            </mesh>
          </group>

          <mesh position={[0, 0.02, 0.1]} visible={!cockpitView}>
            <boxGeometry args={[0.08, 0.06, isJet ? 4.6 : 2.8]} />
            <meshStandardMaterial color={colors.stripe} metalness={0.35} />
          </mesh>

          <mesh
            position={[0.16, -0.08, isJet ? -2.55 : -1.55]}
            visible={!cockpitView}
          >
            <sphereGeometry args={[0.05, 8, 8]} />
            <meshBasicMaterial color="#fff6d0" />
          </mesh>
          <pointLight
            ref={lightRef}
            position={[0, 0.1, isJet ? -2.8 : -1.8]}
            color="#fff4d8"
            intensity={0.4}
            distance={18}
            visible={!cockpitView}
          />

          {isJet && (
            <group ref={gearRef} visible={!cockpitView}>
              <LandingGear x={1.05} z={0.25} strutH={0.88} />
              <LandingGear x={-1.05} z={0.25} strutH={0.88} />
              <LandingGear x={0} z={-1.85} strutH={0.7} nose />
            </group>
          )}
        </group>
      </group>
    );
  },
);

function LandingGear({
  x,
  z,
  strutH,
  nose = false,
}: {
  x: number;
  z: number;
  strutH: number;
  nose?: boolean;
}) {
  const wheelR = nose ? 0.12 : 0.16;
  const contact = 1.05;
  const wheelY = -contact + wheelR;
  return (
    <group position={[x, 0, z]}>
      <mesh position={[0, wheelY + wheelR + strutH / 2, 0]}>
        <cylinderGeometry args={[0.028, 0.04, strutH, 8]} />
        <meshStandardMaterial
          color="#b8c0c8"
          metalness={0.65}
          roughness={0.28}
        />
      </mesh>
      <mesh position={[0, wheelY, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[wheelR, wheelR, 0.11, 16]} />
        <meshStandardMaterial color="#1a1a1a" roughness={0.92} />
      </mesh>
    </group>
  );
}
