# Field Olive — Design Brief

## Direction
Field Olive: a war-theater HUD. Dark mode is primary — olive-black base,
drab green as the signal color, brass as the caution/accent. The feeling is
field command, not civilian avionics.

## Tone
Terse and operational ("Cleared hot", "Destroy the outpost"). Numbers and HUD
labels use JetBrains Mono in uppercase with wide tracking. Body copy stays
plain and instructional.

## Differentiation
Most flight UIs lean cyan-cockpit or arcade-neon. Field Olive sits in olive
drab and brass so the chrome matches the air-to-ground war theme.

## Color Palette

| Token        | Light (daylight field)        | Dark (field night)             | Use                  |
| ------------ | ---------------------------- | ------------------------------ | -------------------- |
| background   | oklch(0.93 0.02 118)         | oklch(0.13 0.028 128)          | page base            |
| card         | oklch(0.96 0.016 115)        | oklch(0.17 0.03 125)           | header / panels      |
| muted        | oklch(0.9 0.02 118)          | oklch(0.2 0.026 122)           | alternating sections |
| primary      | oklch(0.42 0.08 128) olive    | oklch(0.72 0.09 128) olive     | CTAs, active state   |
| accent       | oklch(0.68 0.14 72) brass     | oklch(0.74 0.15 72) brass      | warnings, highlights |
| foreground   | oklch(0.18 0.025 125)        | oklch(0.9 0.02 110)            | body text            |
| border       | oklch(0.82 0.03 118)         | oklch(0.26 0.03 122)           | dividers, inputs     |

## Typography
- **Display** — Space Grotesk. Headings, hero numerals, menu titles.
- **Body** — Figtree. Paragraphs, labels, button text.
- **Mono** — JetBrains Mono. HUD readouts, coordinates, scores, `.hud-label`.

## Elevation
- `shadow-subtle` — header and cards, single soft drop.
- `instrument-glow` — cyan ring + bloom on active instruments and focused inputs.
- `caution-glow` — amber variant for landing alerts and warnings.

## Structural Zones

| Zone     | Background                | Treatment                                |
| -------- | ------------------------- | ---------------------------------------- |
| Header   | `bg-card` + `border-b`    | Elevated, `shadow-subtle`, HUD label nav |
| Hero     | `bg-horizon`              | Full-bleed horizon gradient, display H1  |
| Content  | `bg-background`           | Primary surface, cards float on it       |
| Alt sect | `bg-muted/30`             | Alternating band for rhythm              |
| Footer   | `bg-card` + `border-t`    | Branding strip, mono caption             |

## Spacing
8px base grid. Section padding `py-16 md:py-24`. Card padding `p-6`. HUD
clusters use `gap-2`/`gap-3`; menu cards use `gap-6`.

## Component Patterns
- **Menu cards** — 3-up grid, `bg-card`, hover lifts with `glow-instrument`.
- **Flight plan list** — level-select rows, mono index, amber lock for locked.
- **HUD overlay** — fixed corners, `hud-scanlines`, `hud-label`, `animate-hud-flicker`.
- **Buttons** — primary cyan, caution amber variant, verb-first labels.
- **Score readout** — large mono numerals, `glow-instrument` on landing score.

## Motion
- `horizon-pulse` — slow 4s opacity breath on hero horizon.
- `hud-flicker` — 6s CRT-style flicker on HUD overlays.
- `runway-strobe` — 1.4s strobe for runway lights and active CTA pulse.
- Entrance: `motion/react` `whileInView`, stagger `delay: i * 0.1`, alternate
  slide direction per section. Honor `prefers-reduced-motion`.

## Constraints
- Dark mode primary; light mode is the daytime-flight variant only.
- No raw Tailwind palette colors — only semantic tokens.
- No inline color/font styles — all via CSS variables and utilities.
- Two airframes (strike jet, attack helicopter), plus hovercraft / on-foot, and three weather conditions.

## Signature Detail
The horizon gradient (`bg-horizon`) behind the hero, paired with a JetBrains
Mono HUD cluster running `hud-flicker` and `hud-scanlines`. It reads as a real
cockpit glass panel, not a landing page.
