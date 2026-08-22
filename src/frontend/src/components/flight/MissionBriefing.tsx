import type { SceneLayout } from "@/components/flight/mapLayouts";
import { Button } from "@/components/ui/button";
import type { Plane } from "@/types/game";
import { Crosshair, Keyboard, Target } from "lucide-react";
import { useEffect } from "react";

interface MissionBriefingProps {
  missionName: string;
  brief: string;
  sectors: SceneLayout["sectors"];
  extractName: string;
  plane: Plane;
  onBegin: () => void;
}

/**
 * Pre-sortie card. Combat stays client-side; this overlay only pauses
 * the local sim until the player understands the objective.
 */
export function MissionBriefing({
  missionName,
  brief,
  sectors,
  extractName,
  plane,
  onBegin,
}: MissionBriefingProps) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.code === "Enter" || e.code === "KeyB") {
        e.preventDefault();
        onBegin();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onBegin]);

  const heli = plane.class === "heli";

  return (
    <div
      className="absolute inset-0 z-40 flex items-start justify-center overflow-y-auto bg-background/75 p-3 py-6 backdrop-blur-sm sm:items-center"
      data-ocid="flight.briefing.overlay"
    >
      <div className="hud-scanlines glow-instrument w-full max-w-lg rounded-lg border border-primary/40 bg-card p-5 shadow-2xl sm:p-6">
        <p className="hud-label text-[10px] text-primary">Mission Brief</p>
        <h2 className="mt-1 font-display text-2xl font-semibold tracking-tight text-foreground">
          {missionName}
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          {brief}
        </p>

        <div className="mt-4 rounded-md border border-accent/40 bg-accent/10 p-3">
          <div className="flex items-center gap-2 text-accent">
            <Target className="h-4 w-4" aria-hidden="true" />
            <p className="hud-label text-[11px] font-bold">Your job</p>
          </div>
          <ol className="mt-2 list-decimal space-y-1 pl-5 text-sm text-foreground">
            <li>
              Fly to the orange-marked outpost. Follow the top arrow. Rounds arc
              and explode on dirt — you do not need a direct hit.
            </li>
            <li>
              Clear one sector, then extract at{" "}
              <span className="font-medium">{extractName}</span> — or hit the
              next outpost for a score multiplier.
            </li>
            <li>
              Hostile jets patrol the theater. Shoot them down for extra points.
            </li>
            <li>Hold brake / E in the green LZ to finish.</li>
          </ol>
        </div>

        <div className="mt-3">
          <p className="hud-label mb-1.5 text-[10px] text-muted-foreground">
            Outposts this theater
          </p>
          <ul className="flex flex-col gap-1">
            {sectors.map((sector, i) => (
              <li
                key={sector.id}
                className="flex items-center justify-between rounded-sm border border-border/60 bg-secondary/30 px-2.5 py-1.5 text-sm"
              >
                <span className="flex items-center gap-2">
                  <Crosshair className="h-3.5 w-3.5 text-accent" />
                  <span>
                    {i + 1}. {sector.name}
                  </span>
                </span>
                <span className="hud-label text-[10px] text-muted-foreground">
                  {sector.targets.length} targets
                </span>
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-4 rounded-md border border-primary/30 bg-primary/5 p-3">
          <div className="mb-1.5 flex items-center gap-2">
            <Keyboard className="h-3.5 w-3.5 text-primary" />
            <p className="hud-label text-[10px] text-primary">
              {heli ? "AH-9 Spectre" : "F-27 Viper"}
            </p>
          </div>
          <div className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-0.5 text-[11px] text-muted-foreground">
            {heli ? (
              <>
                <kbd className="hud-label rounded-sm border border-border px-1.5">
                  Shift
                </kbd>
                <span>Collective up — climb</span>
                <kbd className="hud-label rounded-sm border border-border px-1.5">
                  Ctrl
                </kbd>
                <span>Collective down — descend</span>
                <kbd className="hud-label rounded-sm border border-border px-1.5">
                  W / S
                </kbd>
                <span>Fly forward / back</span>
                <kbd className="hud-label rounded-sm border border-border px-1.5">
                  A / D
                </kbd>
                <span>Turn</span>
                <kbd className="hud-label rounded-sm border border-border px-1.5">
                  E
                </kbd>
                <span>Land, then dismount on foot</span>
              </>
            ) : (
              <>
                <kbd className="hud-label rounded-sm border border-border px-1.5">
                  Shift
                </kbd>
                <span>Throttle up — take off</span>
                <kbd className="hud-label rounded-sm border border-border px-1.5">
                  W / S
                </kbd>
                <span>Pitch up / down</span>
                <kbd className="hud-label rounded-sm border border-border px-1.5">
                  A / D
                </kbd>
                <span>Bank / turn</span>
                <kbd className="hud-label rounded-sm border border-border px-1.5">
                  E
                </kbd>
                <span>Land at the FOB pad to take the hovercraft</span>
              </>
            )}
            <kbd className="hud-label rounded-sm border border-border px-1.5">
              F
            </kbd>
            <span>Fire at outposts</span>
          </div>
        </div>

        <Button
          className="hud-label mt-5 w-full gap-2"
          onClick={onBegin}
          data-ocid="flight.briefing.begin_button"
        >
          Begin sortie
          <span className="text-[10px] opacity-70">(Enter)</span>
        </Button>
      </div>
    </div>
  );
}
