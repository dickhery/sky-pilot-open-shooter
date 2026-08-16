import type { Plane as BackendPlane } from "@/backend";
import type { Plane, PlaneId } from "@/types/game";

/** Display names for the Candid-stable plane variants. */
export const BACKEND_PLANE_LABEL: Record<BackendPlane, string> = {
  cessna: "F-27 Viper",
  gulfstream: "AH-9 Spectre",
};

export const BACKEND_PLANE_ROLE: Record<BackendPlane, string> = {
  cessna: "Strike jet",
  gulfstream: "Attack heli",
};

export function isStrikeJetId(id: bigint | number): boolean {
  return Number(id) === 1;
}

export function planeIdFromBackend(id: bigint | number): PlaneId {
  return isStrikeJetId(id) ? "StrikeJet" : "AttackHeli";
}

export function derivePlaneFromCatalog(
  name: string,
  handling: string,
  id: bigint,
): Plane {
  const jet = isStrikeJetId(id);
  return {
    id: jet ? "StrikeJet" : "AttackHeli",
    class: jet ? "jet" : "heli",
    name,
    handling,
    topSpeedKts: jet ? 420 : 155,
    agility: jet ? 0.78 : 0.7,
    stability: jet ? 0.52 : 0.74,
    description: handling,
    canHover: !jet,
    canDismount: !jet,
  };
}

export const FALLBACK_JET: Plane = {
  id: "StrikeJet",
  class: "jet",
  name: "F-27 Viper",
  handling: "Strike jet",
  topSpeedKts: 420,
  agility: 0.78,
  stability: 0.52,
  description: "",
  canHover: false,
  canDismount: false,
};
