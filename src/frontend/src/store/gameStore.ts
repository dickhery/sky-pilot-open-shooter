import type { FlightPlan } from "@/backend";
import { derivePlaneFromCatalog } from "@/lib/aircraft";
import type {
  FlightPhase,
  Plane,
  PlaneId,
  ScoreBreakdown,
  Weather,
} from "@/types/game";
import { create } from "zustand";

interface GameState {
  selectedPlan: FlightPlan | null;
  selectedPlane: Plane | null;
  selectedPlaneId: PlaneId | null;
  selectedWeather: Weather;

  phase: FlightPhase;
  score: ScoreBreakdown;

  selectPlan: (plan: FlightPlan) => void;
  selectPlane: (plane: Plane) => void;
  selectPlaneById: (id: PlaneId) => void;
  selectWeather: (weather: Weather) => void;
  setPhase: (phase: FlightPhase) => void;
  setScore: (score: ScoreBreakdown) => void;
  resetFlight: () => void;
}

const emptyScore: ScoreBreakdown = {
  speed: 0,
  landingSmoothness: 0,
  runwayAlignment: 0,
  total: 0,
};

export const useGameStore = create<GameState>((set) => ({
  selectedPlan: null,
  selectedPlane: null,
  selectedPlaneId: null,
  selectedWeather: "Daytime",

  phase: "idle",
  score: emptyScore,

  selectPlan: (plan) => {
    const selectedPlane = derivePlaneFromCatalog(
      plan.plane.name,
      plan.plane.handling,
      plan.plane.id,
    );
    set({
      selectedPlan: plan,
      selectedPlane,
      selectedPlaneId: selectedPlane.id,
    });
  },
  selectPlane: (plane) =>
    set({ selectedPlane: plane, selectedPlaneId: plane.id }),
  selectPlaneById: (id) => set({ selectedPlaneId: id }),
  selectWeather: (weather) => set({ selectedWeather: weather }),
  setPhase: (phase) => set({ phase }),
  setScore: (score) => set({ score }),
  resetFlight: () =>
    set({
      phase: "idle",
      score: emptyScore,
      selectedPlan: null,
      selectedPlane: null,
      selectedPlaneId: null,
      selectedWeather: "Daytime",
    }),
}));
