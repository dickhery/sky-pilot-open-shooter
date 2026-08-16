import type {
  Checkpoint,
  OutpostTarget,
  SceneLayout,
  Sector,
  TargetKind,
} from "@/components/flight/mapLayouts";
import type { FlightPhase, Plane, VehicleMode } from "@/types/game";
import * as THREE from "three";

export type {
  Checkpoint,
  MapTheme,
  OutpostTarget,
  SceneLayout,
  Sector,
  TargetKind,
} from "@/components/flight/mapLayouts";
export { buildSceneLayout } from "@/components/flight/mapLayouts";

/** Runway surface elevation in world meters. */
export const RUNWAY_ELEVATION = 0.02;
/** Distance from plane origin to wheel contact point. */
export const WHEEL_HEIGHT = 1.05;
/** World Y when the plane is sitting on the runway. */
export const GROUND_CONTACT_Y = RUNWAY_ELEVATION + WHEEL_HEIGHT;
/** Half-width of runway corridor used for landing detection (meters). */
export const RUNWAY_HALF_WIDTH = 6.5;
/** Airspeed (kt) at which the HUD prompts rotation. */
export const ROTATE_SPEED_KTS = 95;
/** Target approach speed shown in the HUD (kt). */
export const APPROACH_SPEED_KTS = 140;
/** Hardest survivable jet touchdown (m/s). */
export const MAX_SAFE_DESCENT_MPS = 6.4;
/** Fastest survivable jet touchdown (m/s). */
export const MAX_SAFE_LANDING_MPS = 72;
export const PLAYER_MAX_HP = 100;
export const INTERACT_RANGE = 10;

const G = 9.81;
const _forward = new THREE.Vector3();
let nextShotId = 1;

export type LandingHint =
  | null
  | "brake_to_finish"
  | "gate_cleared"
  | "sector_cleared"
  | "extract_ready"
  | "board"
  | "dismount";

export type CrashReason =
  | "hard_landing"
  | "off_runway"
  | "wrong_runway"
  | "too_fast"
  | "missed_course"
  | "crooked"
  | "shot_down"
  | "destroyed";

export interface CombatTarget {
  id: string;
  sectorId: string;
  kind: TargetKind;
  position: THREE.Vector3;
  hp: number;
  maxHp: number;
  destroyed: boolean;
  fireCooldown: number;
}

export interface Projectile {
  id: number;
  position: THREE.Vector3;
  velocity: THREE.Vector3;
  owner: "player" | "enemy";
  life: number;
  damage: number;
}

export interface ControlInput {
  pitch: number;
  roll: number;
  throttle: number;
  brakes: boolean;
  fire: boolean;
  interact: boolean;
}

/**
 * Shared flight-simulation state.
 */
export interface FlightState {
  position: THREE.Vector3;
  /** Euler order YXZ: heading (y), pitch (x, +nose-up), bank (z, −right-wing-down). */
  rotation: THREE.Euler;
  speed: number;
  verticalSpeed: number;
  phase: FlightPhase;
  elapsed: number;
  touchdown: {
    descentRate: number;
    alignmentDeg: number;
    speed: number;
    centerlineOffset: number;
  } | null;
  finished: boolean;
  airborne: boolean;
  landingHint: LandingHint;
  hasFlown: boolean;
  crashed: boolean;
  crashReason: CrashReason | null;
  /** Index of the next uncleared sector (or sectors.length = extract). */
  nextCheckpoint: number;
  checkpointFlash: number;
  vehicleMode: VehicleMode;
  airParked: THREE.Vector3 | null;
  airHeading: number;
  hoverParked: THREE.Vector3 | null;
  hoverHeading: number;
  targets: CombatTarget[];
  projectiles: Projectile[];
  playerHealth: number;
  shotsFired: number;
  shotsHit: number;
  sectorsCleared: number;
  fireCooldown: number;
  extractHold: number;
}

export function createInitialRotation(heading = 0): THREE.Euler {
  return new THREE.Euler(0, heading, 0, "YXZ");
}

export function createInitialFlightState(layout: SceneLayout): FlightState {
  const targets: CombatTarget[] = [];
  for (const sector of layout.sectors) {
    for (const t of sector.targets) {
      targets.push({
        id: t.id,
        sectorId: sector.id,
        kind: t.kind,
        position: t.position.clone(),
        hp: t.hp,
        maxHp: t.hp,
        destroyed: false,
        fireCooldown: 0.6 + Math.random() * 0.8,
      });
    }
  }
  return {
    position: layout.departureStart.clone(),
    rotation: createInitialRotation(layout.departureHeading),
    speed: 0,
    verticalSpeed: 0,
    phase: "takeoff",
    elapsed: 0,
    touchdown: null,
    finished: false,
    airborne: false,
    landingHint: null,
    hasFlown: false,
    crashed: false,
    crashReason: null,
    nextCheckpoint: 0,
    checkpointFlash: 0,
    vehicleMode: "air",
    airParked: null,
    airHeading: layout.departureHeading,
    hoverParked: layout.hoverPad.clone(),
    hoverHeading: layout.departureHeading,
    targets,
    projectiles: [],
    playerHealth: PLAYER_MAX_HP,
    shotsFired: 0,
    shotsHit: 0,
    sectorsCleared: 0,
    fireCooldown: 0,
    extractHold: 0,
  };
}

export function routeLength(layout: SceneLayout): number {
  let len = 0;
  let prev = layout.departureStart;
  for (const sector of layout.sectors) {
    len += prev.distanceTo(sector.center);
    prev = sector.center;
  }
  return len + prev.distanceTo(layout.landingEnd);
}

export function currentNavTarget(
  state: FlightState,
  layout: SceneLayout,
): { name: string; position: THREE.Vector3; kind: "gate" | "runway" } {
  const i = state.nextCheckpoint;
  if (i < layout.sectors.length) {
    const sector = layout.sectors[i];
    return { name: sector.name, position: sector.center, kind: "gate" };
  }
  return {
    name: "Extract LZ",
    position: layout.landingThreshold,
    kind: "runway",
  };
}

export function cruiseSpeedMps(plane: Plane): number {
  return plane.topSpeedKts * 0.48;
}

export function stallSpeedMps(plane: Plane): number {
  return plane.class === "heli" ? 8 : 34 + (1 - plane.stability) * 10;
}

function rotateSpeedMps(plane: Plane): number {
  return stallSpeedMps(plane) * 1.12;
}

function maxBank(plane: Plane): number {
  return 0.85 + plane.agility * 0.45;
}

function crash(state: FlightState, reason: CrashReason, groundY: number): void {
  state.crashed = true;
  state.crashReason = reason;
  state.phase = "crashed";
  state.finished = true;
  state.airborne = false;
  state.speed = 0;
  state.verticalSpeed = 0;
  state.position.y = groundY;
  state.rotation.x *= 0.15;
  state.rotation.z = THREE.MathUtils.clamp(state.rotation.z + 0.35, -0.8, 0.8);
  state.landingHint = null;
}

export function centerlineOffset(
  position: THREE.Vector3,
  start: THREE.Vector3,
  end: THREE.Vector3,
): number {
  const ax = end.x - start.x;
  const az = end.z - start.z;
  const len = Math.hypot(ax, az) || 1;
  const dx = position.x - start.x;
  const dz = position.z - start.z;
  return Math.abs(dx * (-az / len) + dz * (ax / len));
}

export function isOnStrip(
  position: THREE.Vector3,
  start: THREE.Vector3,
  end: THREE.Vector3,
  halfWidth = RUNWAY_HALF_WIDTH,
  padStart = 12,
  padEnd = 12,
): boolean {
  const ax = end.x - start.x;
  const az = end.z - start.z;
  const len = Math.hypot(ax, az) || 1;
  const fx = ax / len;
  const fz = az / len;
  const dx = position.x - start.x;
  const dz = position.z - start.z;
  const alongDist = dx * fx + dz * fz;
  const across = dx * -fz + dz * fx;
  return (
    alongDist >= -padStart &&
    alongDist <= len + padEnd &&
    Math.abs(across) <= halfWidth
  );
}

export function isOnLandingRunway(
  position: THREE.Vector3,
  layout: SceneLayout,
): boolean {
  return isOnStrip(
    position,
    layout.landingThreshold,
    layout.landingEnd,
    RUNWAY_HALF_WIDTH,
    20,
    12,
  );
}

export function isOnDepartureRunway(
  position: THREE.Vector3,
  layout: SceneLayout,
): boolean {
  return isOnStrip(
    position,
    layout.departureStart,
    layout.departureEnd,
    RUNWAY_HALF_WIDTH,
    12,
    12,
  );
}

function isOnAnyRunway(position: THREE.Vector3, layout: SceneLayout): boolean {
  return (
    isOnLandingRunway(position, layout) || isOnDepartureRunway(position, layout)
  );
}

export function distanceToLandingThreshold(
  position: THREE.Vector3,
  layout: SceneLayout,
): number {
  const dx = position.x - layout.landingThreshold.x;
  const dz = position.z - layout.landingThreshold.z;
  return Math.hypot(dx, dz);
}

export function xzDistance(a: THREE.Vector3, b: THREE.Vector3): number {
  return Math.hypot(a.x - b.x, a.z - b.z);
}

export function isInExtract(state: FlightState, layout: SceneLayout): boolean {
  return (
    isOnLandingRunway(state.position, layout) ||
    xzDistance(state.position, layout.landingThreshold) < layout.extractRadius
  );
}

function liveTargetsInSector(
  state: FlightState,
  sectorId: string,
): CombatTarget[] {
  return state.targets.filter((t) => t.sectorId === sectorId && !t.destroyed);
}

function syncSectorProgress(state: FlightState, layout: SceneLayout): void {
  let cleared = 0;
  for (const sector of layout.sectors) {
    if (liveTargetsInSector(state, sector.id).length === 0) {
      cleared += 1;
    }
  }
  if (cleared > state.sectorsCleared) {
    state.sectorsCleared = cleared;
    state.checkpointFlash = 2.2;
    state.landingHint = "sector_cleared";
  }
  let next = layout.sectors.length;
  for (let i = 0; i < layout.sectors.length; i++) {
    if (liveTargetsInSector(state, layout.sectors[i].id).length > 0) {
      next = i;
      break;
    }
  }
  state.nextCheckpoint = next;
  if (next >= layout.sectors.length && state.sectorsCleared > 0) {
    if (state.phase === "cruising" || state.phase === "takeoff") {
      state.phase = "landing";
    }
  }
}

function tryInteract(
  state: FlightState,
  layout: SceneLayout,
  plane: Plane,
): void {
  if (state.finished) return;
  const grounded =
    !state.airborne || state.position.y <= GROUND_CONTACT_Y + 0.4;
  const slow = state.speed < 6;

  if (state.vehicleMode === "air" && grounded && slow) {
    if (plane.canDismount) {
      state.airParked = state.position.clone();
      state.airHeading = state.rotation.y;
      state.vehicleMode = "onFoot";
      state.airborne = false;
      state.speed = 0;
      state.verticalSpeed = 0;
      state.rotation.x = 0;
      state.rotation.z = 0;
      state.landingHint = "dismount";
      return;
    }
    if (
      isOnDepartureRunway(state.position, layout) &&
      state.hoverParked &&
      xzDistance(state.position, state.hoverParked) < INTERACT_RANGE * 2.4
    ) {
      state.airParked = state.position.clone();
      state.airHeading = state.rotation.y;
      state.vehicleMode = "hovercraft";
      if (state.hoverParked) {
        state.position.copy(state.hoverParked);
        state.position.y = GROUND_CONTACT_Y * 0.55;
      }
      state.hoverParked = null;
      state.airborne = false;
      state.speed = 0;
      state.rotation.x = 0;
      state.rotation.z = 0;
      state.landingHint = "board";
      return;
    }
  }

  if (state.vehicleMode === "hovercraft" && slow) {
    state.hoverParked = state.position.clone();
    state.hoverHeading = state.rotation.y;
    state.vehicleMode = "onFoot";
    state.speed = 0;
    state.landingHint = "dismount";
    return;
  }

  if (state.vehicleMode === "onFoot") {
    if (
      state.airParked &&
      xzDistance(state.position, state.airParked) < INTERACT_RANGE
    ) {
      state.position.copy(state.airParked);
      state.position.y = GROUND_CONTACT_Y;
      state.rotation.y = state.airHeading;
      state.airParked = null;
      state.vehicleMode = "air";
      state.airborne = false;
      state.speed = 0;
      state.landingHint = "board";
      return;
    }
    if (
      state.hoverParked &&
      xzDistance(state.position, state.hoverParked) < INTERACT_RANGE
    ) {
      state.position.copy(state.hoverParked);
      state.position.y = GROUND_CONTACT_Y * 0.55;
      state.rotation.y = state.hoverHeading;
      state.hoverParked = null;
      state.vehicleMode = "hovercraft";
      state.speed = 0;
      state.landingHint = "board";
    }
  }
}

function muzzleOrigin(state: FlightState): THREE.Vector3 {
  const heading = state.rotation.y;
  const lift =
    state.vehicleMode === "onFoot"
      ? 1.5
      : state.vehicleMode === "hovercraft"
        ? 1.4
        : 0.2;
  return new THREE.Vector3(
    state.position.x - Math.sin(heading) * 3.2,
    state.position.y + lift,
    state.position.z - Math.cos(heading) * 3.2,
  );
}

function firePlayer(state: FlightState, plane: Plane): void {
  if (state.fireCooldown > 0 || state.finished) return;
  const heading = state.rotation.y;
  const pitch = state.vehicleMode === "air" ? state.rotation.x : 0;
  const speed =
    state.vehicleMode === "air" ? (plane.class === "jet" ? 420 : 280) : 220;
  const dir = new THREE.Vector3(
    -Math.sin(heading) * Math.cos(pitch),
    Math.sin(pitch),
    -Math.cos(heading) * Math.cos(pitch),
  ).normalize();
  state.projectiles.push({
    id: nextShotId++,
    position: muzzleOrigin(state),
    velocity: dir.multiplyScalar(speed),
    owner: "player",
    life: 1.8,
    damage:
      state.vehicleMode === "air" ? (plane.class === "jet" ? 18 : 14) : 11,
  });
  state.shotsFired += 1;
  state.fireCooldown =
    state.vehicleMode === "air" ? (plane.class === "jet" ? 0.09 : 0.13) : 0.2;
}

function stepProjectiles(state: FlightState, dt: number): void {
  const keep: Projectile[] = [];
  for (const shot of state.projectiles) {
    shot.life -= dt;
    shot.position.addScaledVector(shot.velocity, dt);
    if (shot.life <= 0 || shot.position.y < -2) continue;

    if (shot.owner === "player") {
      let hit = false;
      for (const target of state.targets) {
        if (target.destroyed) continue;
        if (shot.position.distanceTo(target.position) < 4.6) {
          target.hp -= shot.damage;
          state.shotsHit += 1;
          if (target.hp <= 0) {
            target.hp = 0;
            target.destroyed = true;
          }
          hit = true;
          break;
        }
      }
      if (!hit) keep.push(shot);
      continue;
    }

    const hitRadius = state.vehicleMode === "onFoot" ? 1.6 : 3.4;
    if (shot.position.distanceTo(state.position) < hitRadius) {
      state.playerHealth = Math.max(0, state.playerHealth - shot.damage);
      if (state.playerHealth <= 0) {
        crash(state, "shot_down", Math.max(state.position.y, GROUND_CONTACT_Y));
      }
      continue;
    }
    keep.push(shot);
  }
  state.projectiles = keep;
}

function stepTurrets(state: FlightState, dt: number): void {
  const range = state.vehicleMode === "air" ? 260 : 150;
  for (const target of state.targets) {
    if (target.destroyed || target.kind !== "turret") continue;
    target.fireCooldown -= dt;
    const dist = target.position.distanceTo(state.position);
    if (dist > range || target.fireCooldown > 0) continue;
    const dir = state.position.clone().sub(target.position);
    if (dir.lengthSq() < 1) continue;
    dir.normalize();
    state.projectiles.push({
      id: nextShotId++,
      position: target.position.clone().add(new THREE.Vector3(0, 1.2, 0)),
      velocity: dir.multiplyScalar(95),
      owner: "enemy",
      life: 2.4,
      damage: 8,
    });
    target.fireCooldown = 1.55 + Math.random() * 0.5;
  }
}

function tryExtract(
  state: FlightState,
  layout: SceneLayout,
  input: ControlInput,
  dt: number,
): void {
  if (state.finished || state.sectorsCleared < 1) return;
  const inZone = isInExtract(state, layout);
  const slow = state.speed < 14 && Math.abs(state.verticalSpeed) < 4;
  const grounded =
    !state.airborne ||
    state.vehicleMode !== "air" ||
    state.position.y <= GROUND_CONTACT_Y + 1.2;
  if (inZone && slow && grounded) {
    state.extractHold += dt;
    state.landingHint = "extract_ready";
    if (state.extractHold > 1.15 || input.interact || input.brakes) {
      state.phase = "complete";
      state.finished = true;
      state.landingHint = null;
      state.touchdown = {
        descentRate: Math.max(0, -state.verticalSpeed),
        alignmentDeg: 0,
        speed: state.speed,
        centerlineOffset: centerlineOffset(
          state.position,
          layout.landingThreshold,
          layout.landingEnd,
        ),
      };
    }
  } else {
    state.extractHold = 0;
  }
}

function stepJet(
  state: FlightState,
  layout: SceneLayout,
  plane: Plane,
  input: ControlInput,
  step: number,
): void {
  const agility = 0.7 + plane.agility * 1.15;
  const stability = 0.45 + plane.stability * 0.9;
  const vCruise = cruiseSpeedMps(plane);
  const vStall = stallSpeedMps(plane);
  const vRotate = rotateSpeedMps(plane);
  const groundY = GROUND_CONTACT_Y;
  const pitch = state.rotation.x;
  const bank = state.rotation.z;
  const wasAirborne = state.airborne;
  const airborneThreshold = groundY + 0.14;
  const nowHigh = state.position.y > airborneThreshold;
  if (nowHigh) {
    state.airborne = true;
    state.hasFlown = true;
  }

  if (!wasAirborne && !nowHigh) {
    const steerAuth = THREE.MathUtils.clamp(state.speed / 8, 0.15, 1.15);
    state.rotation.y -= input.roll * agility * 0.7 * steerAuth * step;
    state.rotation.z += (0 - bank) * Math.min(1, step * 8);
    if (state.speed >= vRotate * 0.55 || state.phase === "rollout") {
      state.rotation.x += input.pitch * agility * 0.42 * step;
      state.rotation.x = THREE.MathUtils.clamp(state.rotation.x, -0.04, 0.28);
    } else {
      state.rotation.x += (0 - pitch) * Math.min(1, step * 4);
    }
  } else {
    const pitchRate = agility * 0.4;
    const rollRate = agility * 1.1;
    state.rotation.x += input.pitch * pitchRate * step;
    state.rotation.x = THREE.MathUtils.clamp(state.rotation.x, -0.55, 0.72);
    state.rotation.z -= input.roll * rollRate * step;
    const bankLimit = maxBank(plane);
    state.rotation.z = THREE.MathUtils.clamp(
      state.rotation.z,
      -bankLimit,
      bankLimit,
    );
    if (input.roll === 0) {
      state.rotation.z *= 1 - Math.min(1, step * (0.55 + stability * 0.7));
    }
    const speedForTurn = Math.max(state.speed, 16);
    const yawRate = (Math.tan(state.rotation.z) * G * 1.15) / speedForTurn;
    state.rotation.y += yawRate * step;
  }

  const pathAngle = Math.atan2(
    state.verticalSpeed,
    Math.max(state.speed, 0.35),
  );
  const aoa = state.rotation.x - pathAngle;
  const throttle = THREE.MathUtils.clamp(input.throttle, 0, 1);
  const thrustAccel = (9.2 + plane.agility * 2.4) * throttle;
  const q = 0.5 * state.speed * state.speed;
  const stallAoa = 0.24 + plane.stability * 0.04;
  let cl = 0.2 + aoa * 4.1;
  let stalled = false;
  if (aoa > stallAoa) {
    stalled = true;
    const over = aoa - stallAoa;
    cl = 0.2 + stallAoa * 4.1 - over * 11;
  }
  if (state.speed < vStall && state.airborne) {
    stalled = true;
    cl *= Math.max(0.15, state.speed / vStall);
  }
  cl = THREE.MathUtils.clamp(cl, -0.7, 1.55);
  const heightAgl = state.position.y - groundY;
  const groundEffect = heightAgl < 3.5 ? 1 + (1 - heightAgl / 3.5) * 0.28 : 1;
  const liftAccel = q * cl * 0.012 * groundEffect;
  const cd0 = 0.0016 + (1 - plane.agility) * 0.0003;
  const induced = (0.7 * cl * cl) / Math.max(state.speed * state.speed, 80);
  const parasite = cd0 * state.speed * state.speed;
  const gravityAlongPath = G * Math.sin(pathAngle);
  let accel = thrustAccel - parasite - induced - gravityAlongPath;
  if (!wasAirborne && !nowHigh) {
    const onPaved = isOnAnyRunway(state.position, layout);
    const rolling = onPaved ? 0.55 : 2.4;
    const braking = input.brakes ? (onPaved ? 11 : 7) : 0;
    accel -= rolling + braking;
  } else if (input.brakes) {
    accel -= 2.2;
  }
  state.speed = Math.max(0, state.speed + accel * step);
  if (!wasAirborne && !nowHigh && input.brakes) {
    state.speed = Math.max(0, state.speed - step * 2);
  }

  if (!wasAirborne && !nowHigh) {
    const canRotate =
      state.phase !== "rollout" &&
      state.speed >= vRotate * 0.92 &&
      (input.pitch > 0.05 || state.rotation.x > 0.09);
    const liftExceedsWeight = liftAccel > G * 0.96;
    if (canRotate && liftExceedsWeight) {
      state.verticalSpeed = Math.max(0.45, (liftAccel - G) * 0.35);
      state.position.y += state.verticalSpeed * step;
      if (state.position.y > airborneThreshold) {
        state.airborne = true;
        state.hasFlown = true;
      }
    } else {
      state.verticalSpeed = 0;
      state.position.y = groundY;
    }
  } else {
    const bankRad = state.rotation.z;
    const verticalLift =
      liftAccel * Math.cos(bankRad) * Math.cos(state.rotation.x);
    const thrustUp = thrustAccel * Math.sin(state.rotation.x);
    let vsAccel = verticalLift + thrustUp - G;
    if (stalled) {
      state.rotation.x -= step * (0.55 + Math.max(0, aoa) * 0.8);
      vsAccel -= 3.2;
    }
    vsAccel -= state.verticalSpeed * 0.12;
    state.verticalSpeed += vsAccel * step;
    state.position.y += state.verticalSpeed * step;
    if (state.position.y <= groundY) {
      resolveGroundContact(state, layout, plane, wasAirborne, groundY, vCruise);
      if (state.finished) return;
    }
  }

  const heading = state.rotation.y;
  _forward.set(-Math.sin(heading), 0, -Math.cos(heading));
  state.position.addScaledVector(_forward, state.speed * step);
}

function stepHeli(
  state: FlightState,
  layout: SceneLayout,
  plane: Plane,
  input: ControlInput,
  step: number,
): void {
  const groundY = GROUND_CONTACT_Y;
  const hover = 0.5;
  const collective = THREE.MathUtils.clamp(input.throttle, 0, 1);
  // W = fly forward (cyclic). S = back up. Shift/Ctrl = climb / descend.
  const cyclicFwd = THREE.MathUtils.clamp(input.pitch, -1, 1);
  const yaw = THREE.MathUtils.clamp(input.roll, -1, 1);

  const lift = (collective - hover) * 24;
  if (!state.airborne && collective < hover + 0.02) {
    state.verticalSpeed = 0;
  } else {
    state.verticalSpeed += (lift - state.verticalSpeed * 2.1) * step;
  }
  if (input.brakes) {
    state.verticalSpeed -= 8 * step;
    state.speed += (0 - state.speed) * Math.min(1, step * 2.4);
  }

  const noseTarget = -cyclicFwd * 0.28;
  state.rotation.x += (noseTarget - state.rotation.x) * Math.min(1, step * 4);
  const bankTarget = yaw * 0.32;
  state.rotation.z += (bankTarget - state.rotation.z) * Math.min(1, step * 5);
  state.rotation.y -= yaw * 1.45 * step;

  const maxHeli = 56;
  const targetSpeed = cyclicFwd * maxHeli;
  state.speed += (targetSpeed - state.speed) * Math.min(1, step * 1.8);

  state.position.y += state.verticalSpeed * step;
  const heading = state.rotation.y;
  _forward.set(-Math.sin(heading), 0, -Math.cos(heading));
  state.position.addScaledVector(_forward, state.speed * step);

  if (state.position.y > groundY + 0.18) {
    state.airborne = true;
    state.hasFlown = true;
  }
  if (state.position.y <= groundY) {
    const descent = Math.max(0, -state.verticalSpeed);
    state.position.y = groundY;
    state.airborne = false;
    state.verticalSpeed = 0;
    if (descent > 10) {
      crash(state, "hard_landing", groundY);
      return;
    }
    if (Math.abs(state.speed) > 32) {
      crash(state, "too_fast", groundY);
      return;
    }
    state.rotation.x *= 0.25;
    state.rotation.z *= 0.25;
    if (isOnLandingRunway(state.position, layout) && state.sectorsCleared > 0) {
      state.landingHint = "extract_ready";
    } else if (plane.canDismount && Math.abs(state.speed) < 4) {
      state.landingHint = "dismount";
    }
  }
}

function stepHovercraft(
  state: FlightState,
  input: ControlInput,
  step: number,
): void {
  const groundY = GROUND_CONTACT_Y * 0.55;
  state.airborne = false;
  state.rotation.x *= 1 - Math.min(1, step * 8);
  state.rotation.z *= 1 - Math.min(1, step * 8);
  state.rotation.y -= input.roll * 1.55 * step;
  const throttle = THREE.MathUtils.clamp(input.throttle, 0, 1);
  const target = throttle * 34 + Math.max(0, input.pitch) * -6;
  const accel = (target - state.speed) * 2.1;
  state.speed = Math.max(0, state.speed + accel * step);
  if (input.brakes) state.speed = Math.max(0, state.speed - 22 * step);
  const heading = state.rotation.y;
  _forward.set(-Math.sin(heading), 0, -Math.cos(heading));
  state.position.addScaledVector(_forward, state.speed * step);
  state.position.y = groundY;
  state.verticalSpeed = 0;
}

function stepOnFoot(
  state: FlightState,
  input: ControlInput,
  step: number,
): void {
  const groundY = 1.0;
  state.airborne = false;
  state.rotation.x = 0;
  state.rotation.z = 0;
  state.rotation.y -= input.roll * 2.1 * step;
  const walk = 5.4 + input.throttle * 1.8;
  const forward = input.pitch;
  state.speed = Math.abs(forward) * walk;
  const heading = state.rotation.y;
  _forward.set(-Math.sin(heading), 0, -Math.cos(heading));
  state.position.addScaledVector(_forward, forward * walk * step);
  state.position.y = groundY;
  state.verticalSpeed = 0;
}

function resolveGroundContact(
  state: FlightState,
  layout: SceneLayout,
  plane: Plane,
  wasAirborne: boolean,
  groundY: number,
  vCruise: number,
): void {
  const descentAtContact = Math.max(0, -state.verticalSpeed);
  state.position.y = groundY;
  state.airborne = false;
  state.verticalSpeed = 0;
  if (!wasAirborne || !state.hasFlown) return;

  if (plane.class === "heli") {
    if (descentAtContact > 9) {
      crash(state, "hard_landing", groundY);
    }
    return;
  }

  const onLanding = isOnLandingRunway(state.position, layout);
  const onDeparture = isOnDepartureRunway(state.position, layout);
  const headingErr = Math.atan2(
    Math.sin(state.rotation.y - layout.landingHeading),
    Math.cos(state.rotation.y - layout.landingHeading),
  );
  const alignmentDeg = Math.abs(THREE.MathUtils.radToDeg(headingErr));

  if (!onLanding && !onDeparture) {
    crash(state, "off_runway", groundY);
    return;
  }
  if (onDeparture) {
    const leftTheField =
      state.sectorsCleared > 0 ||
      state.position.distanceTo(layout.departureStart) > 280;
    if (!leftTheField && state.phase !== "landing") {
      return;
    }
    if (leftTheField && state.sectorsCleared === 0) {
      crash(state, "wrong_runway", groundY);
    }
    return;
  }
  if (descentAtContact > MAX_SAFE_DESCENT_MPS) {
    crash(state, "hard_landing", groundY);
    return;
  }
  if (state.speed > MAX_SAFE_LANDING_MPS || state.speed > vCruise * 0.85) {
    crash(state, "too_fast", groundY);
    return;
  }
  if (alignmentDeg > 32) {
    crash(state, "crooked", groundY);
    return;
  }
  state.rotation.x *= 0.18;
  state.rotation.z *= 0.15;
  if (state.sectorsCleared > 0) {
    state.landingHint = "extract_ready";
    state.phase = "landing";
  }
}

/**
 * One simulation step. Mutates `state` in place.
 * Combat is entirely client-side — the canister only sees the final score.
 */
export function stepFlight(
  state: FlightState,
  layout: SceneLayout,
  plane: Plane,
  input: ControlInput,
  dt: number,
): void {
  if (state.finished) return;
  const step = Math.min(dt, 0.05);
  state.elapsed += step;
  if (state.rotation.order !== "YXZ") {
    state.rotation.order = "YXZ";
  }
  if (state.fireCooldown > 0) {
    state.fireCooldown = Math.max(0, state.fireCooldown - step);
  }
  if (state.checkpointFlash > 0) {
    state.checkpointFlash = Math.max(0, state.checkpointFlash - step);
    if (state.checkpointFlash <= 0 && state.landingHint === "sector_cleared") {
      state.landingHint = null;
    }
  } else if (
    state.landingHint === "board" ||
    state.landingHint === "dismount" ||
    state.landingHint === "gate_cleared"
  ) {
    state.landingHint = null;
  }

  if (input.interact) {
    tryInteract(state, layout, plane);
    input.interact = false;
  }

  switch (state.vehicleMode) {
    case "air":
      if (plane.class === "heli") {
        stepHeli(state, layout, plane, input, step);
      } else {
        stepJet(state, layout, plane, input, step);
      }
      break;
    case "hovercraft":
      stepHovercraft(state, input, step);
      break;
    case "onFoot":
      stepOnFoot(state, input, step);
      break;
  }
  if (state.finished) return;

  if (input.fire) {
    firePlayer(state, plane);
  }
  stepTurrets(state, step);
  stepProjectiles(state, step);
  if (state.finished) return;

  syncSectorProgress(state, layout);
  tryExtract(state, layout, input, step);

  if (state.phase === "takeoff" && state.hasFlown) {
    state.phase = "cruising";
  }
  if (
    state.phase === "cruising" &&
    state.nextCheckpoint >= layout.sectors.length
  ) {
    state.phase = "landing";
  }
}

export function computeScore(
  state: FlightState,
  layout: SceneLayout,
  plane: Plane,
): {
  speed: number;
  landingSmoothness: number;
  runwayAlignment: number;
  total: number;
} {
  if (state.crashed || state.sectorsCleared < 1) {
    return { speed: 0, landingSmoothness: 0, runwayAlignment: 0, total: 0 };
  }

  const parTime =
    routeLength(layout) / cruiseSpeedMps(plane) / 0.55 +
    state.sectorsCleared * 18;
  const speedRatio = Math.min(1.6, state.elapsed / Math.max(parTime, 20));
  const speed = Math.max(
    0,
    Math.min(100, Math.round(100 - (speedRatio - 0.65) * 90)),
  );

  const accuracy =
    state.shotsFired === 0 ? 40 : (state.shotsHit / state.shotsFired) * 100;
  const hull = (state.playerHealth / PLAYER_MAX_HP) * 100;
  const landingSmoothness = Math.round(
    Math.max(0, Math.min(100, accuracy * 0.7 + hull * 0.3)),
  );

  const extractBonus = state.finished && !state.crashed ? 24 : 0;
  const sectorBonus = Math.min(40, state.sectorsCleared * 14);
  const runwayAlignment = Math.round(
    Math.max(0, Math.min(100, hull * 0.36 + extractBonus + sectorBonus)),
  );

  const multiplier = 1 + Math.max(0, state.sectorsCleared - 1) * 0.25;
  const total = Math.round(
    Math.max(
      0,
      Math.min(
        100,
        (speed * 0.4 + landingSmoothness * 0.3 + runwayAlignment * 0.3) *
          multiplier,
      ),
    ),
  );
  return { speed, landingSmoothness, runwayAlignment, total };
}

export function bearing(from: THREE.Vector3, to: THREE.Vector3): number {
  const dx = to.x - from.x;
  const dz = to.z - from.z;
  return (THREE.MathUtils.radToDeg(Math.atan2(dx, -dz)) + 360) % 360;
}

export function mpsToKts(mps: number): number {
  return mps * 1.94384;
}

export function crashReasonMessage(reason: CrashReason): string {
  switch (reason) {
    case "hard_landing":
      return "Hard landing — the airframe didn't survive the impact.";
    case "off_runway":
      return "You put the jet down off the strip. Use the helicopter or hovercraft off-runway.";
    case "wrong_runway":
      return "Wrong pad — that was the drop-in strip. Clear a sector or extract.";
    case "too_fast":
      return "Too fast on touchdown — the gear collapsed.";
    case "missed_course":
      return "No sector cleared. Flatten an outpost before you extract.";
    case "crooked":
      return "Too much crab on touchdown — the gear collapsed.";
    case "shot_down":
      return "Shot down — enemy turrets chewed through the hull.";
    case "destroyed":
      return "Vehicle destroyed.";
  }
}

/** Mission step index (1-based) for HUD progress display. */
export function missionStep(phase: FlightPhase): number {
  switch (phase) {
    case "takeoff":
      return 1;
    case "cruising":
      return 2;
    case "landing":
      return 3;
    case "rollout":
      return 4;
    case "complete":
      return 4;
    case "crashed":
      return 4;
    default:
      return 1;
  }
}

export function remainingInSector(
  state: FlightState,
  layout: SceneLayout,
): { name: string; left: number; total: number } | null {
  const i = Math.min(state.nextCheckpoint, layout.sectors.length - 1);
  if (i < 0 || layout.sectors.length === 0) return null;
  const sector = layout.sectors[Math.max(0, i)];
  const total = sector.targets.length;
  const left = liveTargetsInSector(state, sector.id).length;
  return { name: sector.name, left, total };
}
