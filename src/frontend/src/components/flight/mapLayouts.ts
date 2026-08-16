import * as THREE from "three";

const RUNWAY_Y = 0.02;
const START_Y = 1.07;

export type MapTheme =
  | "coast"
  | "ridge"
  | "harbor"
  | "city"
  | "valley"
  | "storm";

export type TargetKind = "turret" | "bunker" | "radar" | "truck";

export interface Checkpoint {
  id: string;
  name: string;
  position: THREE.Vector3;
  radius: number;
}

export interface OutpostTarget {
  id: string;
  kind: TargetKind;
  position: THREE.Vector3;
  hp: number;
}

export interface Sector {
  id: string;
  name: string;
  center: THREE.Vector3;
  radius: number;
  targets: OutpostTarget[];
}

export interface SceneLayout {
  planId: number;
  theme: MapTheme;
  departureStart: THREE.Vector3;
  departureHeading: number;
  departureEnd: THREE.Vector3;
  waypoint: THREE.Vector3;
  checkpoints: Checkpoint[];
  landingThreshold: THREE.Vector3;
  landingHeading: number;
  landingEnd: THREE.Vector3;
  sectors: Sector[];
  hoverPad: THREE.Vector3;
  extractRadius: number;
}

const GATE = 22;

function along(
  x: number,
  z: number,
  heading: number,
  dist: number,
): { x: number; z: number } {
  return {
    x: x - Math.sin(heading) * dist,
    z: z - Math.cos(heading) * dist,
  };
}

function gate(
  id: string,
  name: string,
  x: number,
  y: number,
  z: number,
): Checkpoint {
  return { id, name, position: new THREE.Vector3(x, y, z), radius: GATE };
}

function strip(
  x: number,
  z: number,
  heading: number,
  behind: number,
  ahead: number,
): {
  start: THREE.Vector3;
  end: THREE.Vector3;
  heading: number;
} {
  const s = along(x, z, heading, -behind);
  const e = along(x, z, heading, ahead);
  return {
    start: new THREE.Vector3(s.x, START_Y, s.z),
    end: new THREE.Vector3(e.x, RUNWAY_Y, e.z),
    heading,
  };
}

function tgt(
  id: string,
  kind: TargetKind,
  x: number,
  z: number,
  hp: number,
): OutpostTarget {
  const y = kind === "radar" ? 2.4 : kind === "bunker" ? 1.5 : 1.15;
  return { id, kind, position: new THREE.Vector3(x, y, z), hp };
}

function outpost(id: string, name: string, x: number, z: number): Sector {
  return {
    id,
    name,
    center: new THREE.Vector3(x, 0, z),
    radius: 78,
    targets: [
      tgt(`${id}-turret`, "turret", x + 10, z - 8, 40),
      tgt(`${id}-bunker`, "bunker", x - 12, z + 6, 70),
      tgt(`${id}-radar`, "radar", x + 6, z + 16, 35),
      tgt(`${id}-truck`, "truck", x - 18, z - 14, 28),
    ],
  };
}

function pack(
  planId: number,
  theme: MapTheme,
  dep: ReturnType<typeof strip>,
  landing: ReturnType<typeof strip>,
  sectors: Sector[],
  hoverPad: THREE.Vector3,
): SceneLayout {
  const checkpoints = sectors.map((s) =>
    gate(s.id, s.name, s.center.x, 36, s.center.z),
  );
  return {
    planId,
    theme,
    departureStart: dep.start,
    departureEnd: dep.end,
    departureHeading: dep.heading,
    waypoint: checkpoints[0]?.position ?? landing.start,
    checkpoints,
    landingThreshold: landing.start,
    landingEnd: landing.end,
    landingHeading: landing.heading,
    sectors,
    hoverPad,
    extractRadius: 48,
  };
}

function coastLayout(): SceneLayout {
  const h0 = 0;
  return pack(
    1,
    "coast",
    strip(0, 0, h0, 150, 150),
    strip(90, -1780, 0, 0, 260),
    [
      outpost("battery", "Lighthouse Battery", -260, -860),
      outpost("ridge", "Coastal Ridge", 170, -1280),
      outpost("depot", "Marsh Depot", 40, -1580),
    ],
    new THREE.Vector3(28, 0.02, 18),
  );
}

function ridgeLayout(): SceneLayout {
  const hDep = 0.32;
  const hLand = 0.22;
  return pack(
    2,
    "ridge",
    strip(-60, 40, hDep, 130, 140),
    strip(460, -1680, hLand, 0, 280),
    [
      outpost("climb", "Ridge Climb", 90, -400),
      outpost("pass", "Ridge Pass Camp", 300, -880),
      outpost("plateau", "Plateau Nest", 420, -1380),
    ],
    new THREE.Vector3(-28, 0.02, 70),
  );
}

function harborLayout(): SceneLayout {
  const hDep = -0.7;
  const hLand = 2.55;
  return pack(
    3,
    "harbor",
    strip(0, 20, hDep, 140, 140),
    strip(180, -920, hLand, 0, 240),
    [
      outpost("wharf", "Beacon Wharf", 540, -80),
      outpost("docks", "East Docks", 360, -360),
      outpost("radar", "Harbor Radar", 300, -640),
    ],
    new THREE.Vector3(24, 0.02, 50),
  );
}

function cityLayout(): SceneLayout {
  const hDep = Math.PI;
  const hLand = -0.18;
  return pack(
    4,
    "city",
    strip(0, 80, hDep, 130, 140),
    strip(210, -40, hLand, 0, 250),
    [
      outpost("downtown", "Downtown Block", 70, 480),
      outpost("tower", "Tower District", 340, 640),
      outpost("uptown", "Uptown Yard", 260, 180),
    ],
    new THREE.Vector3(-26, 0.02, 50),
  );
}

function valleyLayout(): SceneLayout {
  const hDep = -0.7;
  const hLand = 0.35;
  return pack(
    5,
    "valley",
    strip(80, 20, hDep, 100, 140),
    strip(120, -1240, hLand, 0, 250),
    [
      outpost("gap", "Cloud Gap Camp", 360, -560),
      outpost("river", "River Nest", 200, -820),
      outpost("overlook", "Overlook Guns", 160, -1080),
    ],
    new THREE.Vector3(108, 0.02, 40),
  );
}

function stormLayout(): SceneLayout {
  const hDep = -2.2;
  const hLand = 0.95;
  return pack(
    6,
    "storm",
    strip(20, 40, hDep, 130, 140),
    strip(-80, 420, hLand, 0, 250),
    [
      outpost("offshore", "Offshore Guns", 320, -80),
      outpost("buoy", "Buoy Battery", 620, 160),
      outpost("spit", "Spit Camp", 160, 280),
    ],
    new THREE.Vector3(48, 0.02, 20),
  );
}

/** Build the theater and scenery theme for a backend mission id (1–6). */
export function buildSceneLayout(planId = 1): SceneLayout {
  switch (planId) {
    case 2:
      return ridgeLayout();
    case 3:
      return harborLayout();
    case 4:
      return cityLayout();
    case 5:
      return valleyLayout();
    case 6:
      return stormLayout();
    default:
      return coastLayout();
  }
}

/** Place a field to the right of a runway so hangars never sit on the strip. */
export function apronBeside(
  start: THREE.Vector3,
  end: THREE.Vector3,
  rightMeters: number,
): { x: number; y: number; z: number; heading: number } {
  const ax = end.x - start.x;
  const az = end.z - start.z;
  const heading = Math.atan2(-ax, -az);
  const midX = (start.x + end.x) * 0.5;
  const midZ = (start.z + end.z) * 0.5;
  return {
    x: midX + Math.cos(heading) * rightMeters,
    y: 0,
    z: midZ - Math.sin(heading) * rightMeters,
    heading,
  };
}

/**
 * How strongly a world XZ point should be graded flat for an airfield.
 * Wider than the terrain vertex spacing (~42 m) so hills cannot poke
 * through the runway between samples.
 */
export function stripClearance(
  x: number,
  z: number,
  start: THREE.Vector3,
  end: THREE.Vector3,
  halfWidth = 130,
  endPad = 90,
): number {
  const ax = end.x - start.x;
  const az = end.z - start.z;
  const len = Math.hypot(ax, az) || 1;
  const ux = ax / len;
  const uz = az / len;
  const dx = x - start.x;
  const dz = z - start.z;
  const alongDist = dx * ux + dz * uz;
  const across = dx * -uz + dz * ux;
  const alongClamped = THREE.MathUtils.clamp(alongDist, -endPad, len + endPad);
  const alongOff = alongDist - alongClamped;
  const dist = Math.hypot(across, alongOff);
  return THREE.MathUtils.smoothstep(halfWidth, halfWidth * 0.28, dist);
}

function radialClearance(
  x: number,
  z: number,
  cx: number,
  cz: number,
  outer: number,
  inner: number,
): number {
  const d = Math.hypot(x - cx, z - cz);
  return THREE.MathUtils.smoothstep(outer, inner, d);
}

/** 1 = fully graded airfield / outpost, 0 = untouched countryside. */
export function airfieldClearance(
  layout: SceneLayout,
  x: number,
  z: number,
): number {
  let grade = Math.max(
    stripClearance(x, z, layout.departureStart, layout.departureEnd),
    stripClearance(x, z, layout.landingThreshold, layout.landingEnd),
  );
  grade = Math.max(
    grade,
    radialClearance(x, z, layout.hoverPad.x, layout.hoverPad.z, 22, 8),
  );
  for (const sector of layout.sectors) {
    grade = Math.max(
      grade,
      radialClearance(x, z, sector.center.x, sector.center.z, 36, 12),
    );
  }
  return grade;
}
