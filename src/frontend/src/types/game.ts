// Frontend domain types for Sky Pilot open shooter.
// Backend still stores plane as #cessna / #gulfstream (Candid-stable).
// The frontend maps those to the strike jet and attack helicopter.

export type Weather = "Daytime" | "Nighttime" | "PartlyCloudy";

export type PlaneId = "StrikeJet" | "AttackHeli";

export type VehicleClass = "jet" | "heli";

export type VehicleMode = "air" | "hovercraft" | "onFoot";

export interface Plane {
  id: PlaneId;
  class: VehicleClass;
  name: string;
  /** Short tagline describing the handling character. */
  handling: string;
  /** Top speed in knots — affects scoring on tempo. */
  topSpeedKts: number;
  /** 0–1 agility rating; higher = more responsive controls. */
  agility: number;
  /** 0–1 stability rating; higher = easier to hold a hover / land. */
  stability: number;
  /** One-line description shown on the plane-select card. */
  description: string;
  canHover: boolean;
  canDismount: boolean;
}

export interface FlightPlan {
  id: string;
  name: string;
  /** Origin airport ICAO-style code. */
  origin: string;
  /** Destination airport ICAO-style code. */
  destination: string;
  /** Approximate route distance in nautical miles. */
  distanceNm: number;
  /** Difficulty tier — drives the level-select ordering. */
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  /** Short narrative brief shown on the level-select card. */
  brief: string;
  /** Default weather the plan was authored for. */
  defaultWeather: Weather;
}

export interface ScoreBreakdown {
  /** 0–100 — how quickly sectors were cleared. */
  speed: number;
  /** 0–100 — combat accuracy and remaining hull. */
  landingSmoothness: number;
  /** 0–100 — extract quality (health, alignment, multiplier). */
  runwayAlignment: number;
  /** Weighted composite 0–100, after sector multiplier. */
  total: number;
}

export interface FlightLog {
  id: string;
  planId: string;
  planName: string;
  planeId: PlaneId;
  planeName: string;
  weather: Weather;
  /** ISO timestamp of the flight. */
  timestamp: string;
  /** Total flight duration in seconds. */
  durationSec: number;
  score: ScoreBreakdown;
}

// ── Frontend-only runtime types ───────────────────────────────────────────

export type FlightPhase =
  | "idle"
  | "takeoff"
  | "cruising"
  | "landing"
  | "rollout"
  | "complete"
  | "crashed";

export type GameStatus = "ready" | "in_flight" | "paused" | "finished";
