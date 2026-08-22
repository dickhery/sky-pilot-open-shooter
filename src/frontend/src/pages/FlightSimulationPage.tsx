import { Plane as BackendPlane, Weather as BackendWeather } from "@/backend";
import { FlightScene } from "@/components/flight/FlightScene";
import { FlightTouchControls } from "@/components/flight/FlightTouchControls";
import { HUD } from "@/components/flight/HUD";
import { MissionBriefing } from "@/components/flight/MissionBriefing";
import { ResultsScreen } from "@/components/flight/ResultsScreen";
import {
  type LandingHint,
  ROTATE_SPEED_KTS,
  bearing,
  buildSceneLayout,
  compassDegFromYaw,
  computeScore,
  createInitialFlightState,
  currentNavTarget,
  missionStep,
  navRelativeDeg,
  remainingInSector,
} from "@/components/flight/flightPhysics";
import { Button } from "@/components/ui/button";
import {
  bindMusicHotkey,
  readMusicPref,
  useFlightAudio,
  writeMusicPref,
} from "@/hooks/useFlightAudio";
import { useFlightControls } from "@/hooks/useFlightControls";
import { useRecordFlightLog } from "@/hooks/useFlightData";
import { useInternetIdentity } from "@/icp-auth";
import { FALLBACK_JET } from "@/lib/aircraft";
import { useGameStore } from "@/store/gameStore";
import type {
  FlightPhase,
  ScoreBreakdown,
  VehicleMode,
  Weather,
} from "@/types/game";
import { useNavigate } from "@tanstack/react-router";
import { Plane as PlaneIcon, Rocket } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

/**
 * Convert a backend Weather enum variant to the frontend Weather type.
 * Backend uses lowercase ('daytime'|'nighttime'|'partlyCloudy'); the
 * FlightScene / Environment components expect the capitalized frontend
 * Weather ('Daytime'|'Nighttime'|'PartlyCloudy').
 */
function mapWeatherToFrontend(w: BackendWeather): Weather {
  switch (w) {
    case BackendWeather.nighttime:
      return "Nighttime";
    case BackendWeather.partlyCloudy:
      return "PartlyCloudy";
    case BackendWeather.daytime:
      return "Daytime";
  }
}

/**
 * Main flight simulation screen.
 *
 * Reads the selected plan + plane from the game store, renders the 3D
 * FlightScene with the HUD overlay, manages phase transitions and scoring,
 * persists the completed flight to the backend via recordFlightLog, and
 * shows the ResultsScreen on completion.
 *
 * The render loop lives inside FlightScene; this page samples a telemetry
 * snapshot on a 100ms interval to feed the HUD without per-frame re-renders.
 */
export function FlightSimulationPage() {
  const navigate = useNavigate();
  const selectedPlan = useGameStore((s) => s.selectedPlan);
  const selectedPlane = useGameStore((s) => s.selectedPlane);
  const setPhase = useGameStore((s) => s.setPhase);
  const setScore = useGameStore((s) => s.setScore);

  const [showResults, setShowResults] = useState(false);
  const [showBriefing, setShowBriefing] = useState(true);
  const [musicOn, setMusicOn] = useState(readMusicPref);
  const heliStart = selectedPlane?.class === "heli";
  const { axes, touch, throttlePct, brakesOn, cockpitView, toggleCockpit } =
    useFlightControls({
      enabled: !showResults && !showBriefing,
      initialThrottle: heliStart ? 0.5 : 0.28,
    });
  useEffect(() => {
    if (selectedPlane?.class === "heli") {
      axes.current.throttle = Math.max(axes.current.throttle, 0.5);
    }
  }, [selectedPlane, axes]);

  const planId = selectedPlan ? Number(selectedPlan.id) : 1;
  const layout = useMemo(() => buildSceneLayout(planId), [planId]);

  const flightState = useRef(createInitialFlightState(layout));

  const [phase, setPhaseState] = useState<FlightPhase>("takeoff");
  const [telemetry, setTelemetry] = useState({
    altitude: 0,
    airspeed: 0,
    heading: 0,
    verticalSpeed: 0,
    airborne: false,
    landingHint: null as LandingHint,
    step: 1,
  });
  const flightOver = phase === "complete" || phase === "crashed";
  useFlightAudio(flightState, axes, {
    engineMuted: flightOver,
    musicMuted: !musicOn || flightOver || showResults,
    planId,
  });
  const toggleMusic = useCallback(() => {
    setMusicOn((on) => {
      const next = !on;
      writeMusicPref(next);
      return next;
    });
  }, []);
  useEffect(() => bindMusicHotkey(toggleMusic), [toggleMusic]);
  const [waypointInfo, setWaypointInfo] = useState<{
    name: string;
    distance: number;
    bearing: number;
    relativeDeg: number;
    kind: "gate" | "runway";
    index: number;
    total: number;
  } | null>(null);
  const [score, setScoreState] = useState<ScoreBreakdown>({
    speed: 0,
    landingSmoothness: 0,
    runwayAlignment: 0,
    total: 0,
  });
  const [persisted, setPersisted] = useState(false);
  const [finalDuration, setFinalDuration] = useState(0);

  const recordMutation = useRecordFlightLog();
  const { isAuthenticated } = useInternetIdentity();
  const [vehicleMode, setVehicleMode] = useState<VehicleMode>("air");
  const [combatHud, setCombatHud] = useState({
    health: 100,
    sectorsCleared: 0,
    sectorTotal: 1,
    targetsLeft: 0,
    multiplier: 1,
    airKills: 0,
    airTotal: 3,
  });

  // Phase change handler passed into the scene.
  const handlePhaseChange = useCallback(
    (newPhase: FlightPhase) => {
      setPhaseState(newPhase);
      setPhase(newPhase);
    },
    [setPhase],
  );

  // Telemetry sampling interval — feeds HUD without per-frame renders.
  useEffect(() => {
    const id = setInterval(() => {
      const s = flightState.current;
      setTelemetry({
        altitude: Math.max(0, (s.position.y - 1.07) * 3.28),
        airspeed: s.speed * 1.94,
        heading: compassDegFromYaw(s.rotation.y),
        verticalSpeed: s.verticalSpeed * 196.85,
        airborne: s.airborne,
        landingHint: s.landingHint,
        step: missionStep(s.phase),
      });
      setVehicleMode(s.vehicleMode);
      const sector = remainingInSector(s, layout);
      setCombatHud({
        health: s.playerHealth,
        sectorsCleared: s.sectorsCleared,
        sectorTotal: layout.sectors.length,
        targetsLeft: sector?.left ?? 0,
        multiplier: 1 + Math.max(0, s.sectorsCleared - 1) * 0.25,
        airKills: s.airKills,
        airTotal: s.enemies.length,
      });

      if (s.phase === "crashed" || s.phase === "complete") {
        setWaypointInfo(null);
      } else {
        const nav = currentNavTarget(s, layout);
        const name =
          nav.kind === "gate" &&
          layout.checkpoints[s.nextCheckpoint]?.id === "waypoint"
            ? (selectedPlan?.waypoint.name ?? nav.name)
            : nav.kind === "runway"
              ? (selectedPlan?.landing.name ?? nav.name)
              : nav.name;
        setWaypointInfo({
          name,
          distance: s.position.distanceTo(nav.position) / 1852,
          bearing: bearing(s.position, nav.position),
          relativeDeg: navRelativeDeg(s.position, s.rotation.y, nav.position),
          kind: nav.kind,
          index: Math.min(s.nextCheckpoint + 1, layout.checkpoints.length),
          total: layout.checkpoints.length,
        });
      }
    }, 100);
    return () => clearInterval(id);
  }, [layout, selectedPlan]);

  // On a successful landing, score and persist. Crashes end the flight
  // without a canister write (no score to keep, and no extra cycles).
  useEffect(() => {
    if ((phase !== "complete" && phase !== "crashed") || showResults) return;
    const s = flightState.current;
    const computed = computeScore(s, layout, selectedPlane ?? FALLBACK_JET);
    setScoreState(computed);
    setScore(computed);
    setFinalDuration(s.elapsed);
    setShowResults(true);

    if (phase === "crashed" || !selectedPlane || !selectedPlan) {
      setPersisted(true);
      return;
    }
    // Combat never writes the canister. One authenticated update at extract
    // keeps cycle use bounded; unsigned sorties stay local-only.
    if (!isAuthenticated) {
      setPersisted(true);
      return;
    }

    recordMutation.mutate(
      {
        completedAt: BigInt(Date.now()),
        planName: selectedPlan.name,
        plane:
          selectedPlane.id === "StrikeJet"
            ? BackendPlane.cessna
            : BackendPlane.gulfstream,
        weather: selectedPlan.weather,
        score: {
          speed: BigInt(computed.speed),
          landingSmoothness: BigInt(computed.landingSmoothness),
          total: BigInt(computed.total),
        },
      },
      {
        onSuccess: () => setPersisted(true),
        onError: () => setPersisted(true),
      },
    );
  }, [
    phase,
    showResults,
    layout,
    selectedPlane,
    selectedPlan,
    setScore,
    recordMutation,
    isAuthenticated,
  ]);

  // No plan/plane selected — bounce to flight plans.
  if (!selectedPlan || !selectedPlane) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-4 text-center">
        <PlaneIcon
          className="h-12 w-12 text-muted-foreground"
          aria-hidden="true"
        />
        <div>
          <h2 className="font-display text-xl font-semibold text-foreground">
            No flight plan selected
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Choose a mission and airframe before dropping in.
          </p>
        </div>
        <Button
          onClick={() => navigate({ to: "/flight-plans" })}
          className="hud-label gap-2"
          data-ocid="flight.no_plan.flight_plans_button"
        >
          <Rocket className="h-4 w-4" aria-hidden="true" />
          Go to Flight Plans
        </Button>
      </div>
    );
  }

  const landingHdg = Math.round(compassDegFromYaw(layout.landingHeading));
  const { objective, subObjective } = getMissionBrief(
    phase,
    telemetry.airborne,
    selectedPlan.waypoint.name,
    selectedPlan.landing.name,
    landingHdg,
    vehicleMode,
    selectedPlane.canDismount,
    combatHud.targetsLeft,
  );

  const handleRetry = () => {
    flightState.current = createInitialFlightState(layout);
    axes.current.throttle = selectedPlane.class === "heli" ? 0.5 : 0.28;
    setPhaseState("takeoff");
    setPhase("takeoff");
    setShowResults(false);
    setShowBriefing(true);
    setPersisted(false);
    setScoreState({
      speed: 0,
      landingSmoothness: 0,
      runwayAlignment: 0,
      total: 0,
    });
  };

  return (
    <div className="relative h-[calc(100svh-3.25rem-env(safe-area-inset-top))] w-full select-none overflow-hidden bg-background [-webkit-tap-highlight-color:transparent] sm:h-[calc(100svh-4rem-env(safe-area-inset-top))] sm:rounded-lg sm:border sm:border-border">
      <FlightScene
        plane={selectedPlane}
        weather={mapWeatherToFrontend(selectedPlan.weather)}
        layout={layout}
        controlsAxes={axes}
        flightState={flightState}
        onPhaseChange={handlePhaseChange}
        cockpitView={cockpitView}
        paused={showBriefing}
      />
      <HUD
        altitude={telemetry.altitude}
        airspeed={telemetry.airspeed}
        heading={telemetry.heading}
        verticalSpeed={telemetry.verticalSpeed}
        airborne={telemetry.airborne}
        phase={phase}
        missionStep={telemetry.step}
        objective={objective}
        subObjective={subObjective}
        landingHint={telemetry.landingHint}
        nextWaypoint={waypointInfo}
        throttlePct={throttlePct}
        brakesOn={brakesOn}
        cockpitView={cockpitView}
        onToggleCockpit={toggleCockpit}
        musicOn={musicOn}
        onToggleMusic={toggleMusic}
        vehicleMode={vehicleMode}
        playerHealth={combatHud.health}
        sectorsCleared={combatHud.sectorsCleared}
        sectorTotal={combatHud.sectorTotal}
        targetsLeft={combatHud.targetsLeft}
        airKills={combatHud.airKills}
        airTotal={combatHud.airTotal}
        multiplier={combatHud.multiplier}
        vehicleClass={selectedPlane.class}
      />
      {showBriefing && (
        <MissionBriefing
          missionName={selectedPlan.name}
          brief={selectedPlan.routeDescription}
          sectors={layout.sectors}
          extractName={selectedPlan.landing.name}
          plane={selectedPlane}
          onBegin={() => setShowBriefing(false)}
        />
      )}
      {!showResults &&
        !showBriefing &&
        phase !== "crashed" &&
        phase !== "complete" && (
          <FlightTouchControls
            touch={touch}
            throttlePct={throttlePct}
            brakesOn={brakesOn}
            cockpitView={cockpitView}
            onToggleCockpit={toggleCockpit}
            musicOn={musicOn}
            onToggleMusic={toggleMusic}
          />
        )}
      {showResults && (
        <ResultsScreen
          score={score}
          plan={selectedPlan}
          plane={selectedPlane}
          airKills={flightState.current.airKills}
          durationSec={finalDuration}
          persisted={persisted}
          crashed={phase === "crashed"}
          crashReason={flightState.current.crashReason}
          onRetry={handleRetry}
        />
      )}
    </div>
  );
}

function getMissionBrief(
  phase: FlightPhase,
  airborne: boolean,
  waypointName: string,
  landingName: string,
  landingHdg: number,
  vehicleMode: VehicleMode,
  canDismount: boolean,
  targetsLeft: number,
): { objective: string; subObjective?: string } {
  switch (phase) {
    case "takeoff":
      return airborne
        ? {
            objective: `Destroy the outpost at ${waypointName}`,
            subObjective:
              "Orange beacons mark targets. F fires — follow the top arrow to the outpost",
          }
        : canDismount
          ? {
              objective: "Lift off and fly to the first outpost",
              subObjective:
                "Hold Shift to climb. W flies forward. A / D turns.",
            }
          : {
              objective: "Take off and fly to the first outpost",
              subObjective: `Shift for power, then at ${ROTATE_SPEED_KTS} kt pull up (W) to rotate`,
            };
    case "cruising":
      return {
        objective:
          targetsLeft > 0
            ? `Destroy ${targetsLeft} target${targetsLeft === 1 ? "" : "s"} at ${waypointName}`
            : `Next outpost, or extract at ${landingName}`,
        subObjective:
          vehicleMode === "onFoot"
            ? "On foot — F to fire, E to remount"
            : vehicleMode === "hovercraft"
              ? "Hovercraft — drive in, F to fire, E to hop out"
              : canDismount
                ? "Shift climbs. W flies forward. Land + E to go on foot."
                : "Strafe the amber ring. Hostile jets will hunt you — shoot them down for extra points.",
      };
    case "landing":
      return {
        objective: `Extract at ${landingName} — or keep hunting`,
        subObjective: `Green LZ · heading ${landingHdg.toString().padStart(3, "0")}° · hold Space / E to finish`,
      };
    case "crashed":
      return { objective: "Sortie over — the vehicle is down" };
    case "rollout":
      return {
        objective: "Hold in the extract zone",
        subObjective: "Brake / Space or E finishes the mission",
      };
    case "complete":
      return { objective: "Mission complete" };
    default:
      return { objective: "Prepare for drop-in" };
  }
}
