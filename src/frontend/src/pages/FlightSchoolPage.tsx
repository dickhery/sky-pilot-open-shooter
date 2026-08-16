import { ControlsReference } from "@/components/ControlsReference";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { BookOpen, Gauge, Landmark, Plane, Trophy } from "lucide-react";
import { motion } from "motion/react";

interface Phase {
  id: string;
  step: number;
  title: string;
  summary: string;
  details: string[];
}

const PHASES: Phase[] = [
  {
    id: "dropin",
    step: 1,
    title: "Drop in",
    summary:
      "Take off from the FOB in a strike jet or attack helicopter and enter the theater.",
    details: [
      "Add power with Shift. Jets rotate around 95 kt; the helicopter lifts when collective is above hover.",
      "The AH-9 Spectre can hover and land off-strip. The F-27 Viper needs a paved FOB or extract strip.",
      "Amber rings mark enemy outposts. The green ring is the extract LZ — it lights after the first sector falls.",
    ],
  },
  {
    id: "clear",
    step: 2,
    title: "Clear sectors",
    summary: "Destroy every target in an outpost, then push or extract.",
    details: [
      "Fire with F or the left mouse button. Turrets shoot back — do not linger in their envelope.",
      "Clearing a sector raises the score multiplier. Extract after one, or keep hunting for more.",
      "On the Spectre, land and press E to dismount. On the Viper, land at the FOB and E onto the hovercraft.",
    ],
  },
  {
    id: "extract",
    step: 3,
    title: "Extract",
    summary:
      "Enter the green LZ on any vehicle (or on foot) and hold to finish.",
    details: [
      "At least one sector must be cleared before an extract counts.",
      "Hold brake / Space or press E in the LZ. A jet that puts down off-strip crashes.",
      "Combat never writes the canister. Only a finished extract is logged — one update, signed in.",
    ],
  },
];

interface ScoreFactor {
  id: string;
  label: string;
  weight: string;
  description: string;
}

const SCORE_FACTORS: ScoreFactor[] = [
  {
    id: "tempo",
    label: "Tempo",
    weight: "40%",
    description:
      "Time to clear sectors and extract. Faster sorties score higher, but rushing turrets costs hull.",
  },
  {
    id: "accuracy",
    label: "Accuracy",
    weight: "30%",
    description:
      "Hits versus shots fired, plus remaining hull. Spray-and-pray bleeds this score.",
  },
  {
    id: "extract",
    label: "Extract",
    weight: "30%",
    description:
      "How cleanly you reached the LZ, remaining health, and how many sectors you cleared.",
  },
];

/**
 * Briefing Room — controls, arcade loop, and scoring.
 */
export function FlightSchoolPage() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-10 py-2"
    >
      <header className="flex flex-col gap-3" data-ocid="flight_school.page">
        <div className="flex items-center gap-3">
          <span className="glow-instrument flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <BookOpen className="h-5 w-5" aria-hidden="true" />
          </span>
          <div>
            <p className="hud-label text-[10px] text-primary">Operations</p>
            <h1 className="font-display text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
              Briefing Room
            </h1>
          </div>
        </div>
        <p className="max-w-2xl text-sm text-muted-foreground">
          Hybrid air-to-ground loop: drop in, clear a sector, extract — or push
          the next outpost for a multiplier. The theater is large and open, but
          finite. No infinite streaming.
        </p>
      </header>

      <section
        className="flex flex-col gap-4"
        data-ocid="flight_school.controls.section"
      >
        <div className="flex items-center gap-2">
          <Plane className="h-4 w-4 text-primary" aria-hidden="true" />
          <h2 className="hud-label text-xs text-primary">01 · Controls</h2>
        </div>
        <ControlsReference />
      </section>

      <section
        className="flex flex-col gap-4"
        data-ocid="flight_school.walkthrough.section"
      >
        <div className="flex items-center gap-2">
          <Gauge className="h-4 w-4 text-primary" aria-hidden="true" />
          <h2 className="hud-label text-xs text-primary">02 · How to Play</h2>
        </div>
        <Card className="glow-instrument border-primary/30 bg-card/80">
          <CardHeader className="border-b border-border/60 bg-secondary/40">
            <CardTitle className="font-display text-lg tracking-tight text-foreground">
              The Arcade Loop
            </CardTitle>
            <CardDescription className="text-sm text-muted-foreground">
              Drop in, clear, extract. Expand each phase for the procedure.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-2">
            <Accordion
              type="single"
              collapsible
              defaultValue="dropin"
              className="w-full"
            >
              {PHASES.map((phase) => (
                <AccordionItem
                  key={phase.id}
                  value={phase.id}
                  className="border-border/60"
                  data-ocid={`flight_school.walkthrough.item.${phase.step}`}
                >
                  <AccordionTrigger
                    className="group hover:no-underline"
                    data-ocid={`flight_school.walkthrough.tab.${phase.step}`}
                  >
                    <div className="flex flex-1 items-center gap-3 text-left">
                      <span className="glow-instrument flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 font-mono text-sm font-semibold text-primary">
                        {phase.step}
                      </span>
                      <div className="min-w-0">
                        <p className="font-display text-base font-medium text-foreground">
                          {phase.title}
                        </p>
                        <p className="truncate text-xs text-muted-foreground">
                          {phase.summary}
                        </p>
                      </div>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="pl-11 pr-1 pb-4">
                    <ul className="flex flex-col gap-2.5">
                      {phase.details.map((detail) => (
                        <li
                          key={detail}
                          className="flex items-start gap-2.5 text-sm text-foreground"
                        >
                          <span
                            className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-accent"
                            aria-hidden="true"
                          />
                          <span className="min-w-0 break-words">{detail}</span>
                        </li>
                      ))}
                    </ul>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </CardContent>
        </Card>
      </section>

      <section
        className="flex flex-col gap-4"
        data-ocid="flight_school.scoring.section"
      >
        <div className="flex items-center gap-2">
          <Trophy className="h-4 w-4 text-accent" aria-hidden="true" />
          <h2 className="hud-label text-xs text-accent">03 · Scoring</h2>
        </div>
        <Card className="glow-caution border-accent/30 bg-card/80">
          <CardHeader className="border-b border-border/60 bg-accent/5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <CardTitle className="font-display text-lg tracking-tight text-foreground">
                  How Your Score Is Calculated
                </CardTitle>
                <CardDescription className="text-sm text-muted-foreground">
                  Total score combines tempo, accuracy, and extract quality,
                  then a sector multiplier (1.00 / 1.25 / 1.50).
                </CardDescription>
              </div>
              <Landmark
                className="hidden h-8 w-8 shrink-0 text-accent sm:block"
                aria-hidden="true"
              />
            </div>
          </CardHeader>
          <CardContent className="grid gap-3 pt-4 sm:grid-cols-3">
            {SCORE_FACTORS.map((factor, idx) => (
              <div
                key={factor.id}
                className="flex flex-col gap-2 rounded-lg border border-border/60 bg-secondary/30 p-4"
                data-ocid={`flight_school.scoring.card.${idx + 1}`}
              >
                <div className="flex items-center justify-between">
                  <p className="hud-label text-[10px] text-muted-foreground">
                    {factor.label}
                  </p>
                  <Badge
                    variant="outline"
                    className="hud-label border-accent/40 bg-accent/10 text-[10px] text-accent"
                  >
                    {factor.weight}
                  </Badge>
                </div>
                <p className="text-sm leading-relaxed text-foreground">
                  {factor.description}
                </p>
              </div>
            ))}
          </CardContent>
          <CardContent className="pt-2">
            <div className="flex items-start gap-3 rounded-lg border border-primary/20 bg-primary/5 p-4">
              <Trophy
                className="mt-0.5 h-5 w-5 shrink-0 text-primary"
                aria-hidden="true"
              />
              <p className="text-sm text-foreground">
                <span className="hud-label text-[10px] text-primary">
                  Final Score
                </span>{" "}
                = (Tempo 40% + Accuracy 30% + Extract 30%) × sector multiplier,
                capped at 100. Shot down, crashed, or extracting with no sector
                cleared logs nothing. Sign in with Internet Identity to persist
                a score — one canister write per extract.
              </p>
            </div>
          </CardContent>
        </Card>
      </section>
    </motion.div>
  );
}
