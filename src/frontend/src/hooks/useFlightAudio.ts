import type { FlightState } from "@/components/flight/flightPhysics";
import { isTypingTarget } from "@/hooks/useFlightControls";
import { useEffect, useRef } from "react";

export interface FlightAudioOptions {
  /** Kill engine + wind (results / crash). */
  engineMuted: boolean;
  /** Pause the route soundtrack. */
  musicMuted: boolean;
  /** Picks night_1 vs night_2 (or jet/heli pair) so maps don't share one loop. */
  planId: number;
  /** Night maps always use the night pair, even in a jet or heli. */
  night: boolean;
  /** Non-night maps: jet vs helicopter soundtrack. */
  vehicleClass: "jet" | "heli";
}

const MUSIC_PREF_KEY = "sky-pilot-music";
/** Keep scored tracks under the engine rumble. */
const MUSIC_VOLUME = 0.32;

const NIGHT_TRACKS = [
  "/assets/music/night_1.mp3",
  "/assets/music/night_2.mp3",
] as const;
const HELI_TRACKS = [
  "/assets/music/helicopter_1.mp3",
  "/assets/music/helicopter_2.mp3",
] as const;
const JET_TRACKS = [
  "/assets/music/jet_1.mp3",
  "/assets/music/jet_2.mp3",
] as const;

function trackFor(options: FlightAudioOptions): string {
  const pair = options.night
    ? NIGHT_TRACKS
    : options.vehicleClass === "heli"
      ? HELI_TRACKS
      : JET_TRACKS;
  return pair[options.planId % 2];
}

export function readMusicPref(): boolean {
  try {
    return window.localStorage.getItem(MUSIC_PREF_KEY) !== "off";
  } catch {
    return true;
  }
}

export function writeMusicPref(on: boolean): void {
  try {
    window.localStorage.setItem(MUSIC_PREF_KEY, on ? "on" : "off");
  } catch {
    /* ignore quota / private mode */
  }
}

/**
 * Engine rumble is synthesized. Route music is night / helicopter / jet
 * stems in /assets/music, chosen from weather and airframe.
 */
export function useFlightAudio(
  flightState: React.MutableRefObject<FlightState>,
  axes: React.MutableRefObject<{ throttle: number }>,
  options: FlightAudioOptions,
): void {
  const engine = useRef<EngineKit | null>(null);
  const music = useRef<HTMLAudioElement | null>(null);
  const lastAirborne = useRef(false);
  const lastShots = useRef(0);
  const shotRaw = useRef<ArrayBuffer | null>(null);
  const optionsRef = useRef(options);
  optionsRef.current = options;
  const unlocked = useRef(false);

  useEffect(() => {
    void fetch(SHOT_SRC)
      .then((res) => (res.ok ? res.arrayBuffer() : null))
      .then((buf) => {
        shotRaw.current = buf;
      })
      .catch(() => {});

    const el = new Audio();
    el.loop = true;
    el.preload = "none";
    el.volume = 0;
    el.setAttribute("playsinline", "true");
    music.current = el;

    let raf = 0;

    const unlock = () => {
      unlocked.current = true;
      if (!engine.current) {
        engine.current = createEngine();
      }
      if (engine.current) {
        void engine.current.ctx.resume();
        loadShotBuffer(engine.current, shotRaw.current);
      }
      syncMusic();
    };

    const syncMusic = () => {
      const elNow = music.current;
      if (!elNow) return;
      const opts = optionsRef.current;
      const src = trackFor(opts);
      const want = Boolean(src) && !opts.musicMuted;
      if (!want) {
        elNow.pause();
        elNow.volume = 0;
        return;
      }
      if (elNow.dataset.track !== src) {
        elNow.pause();
        elNow.src = src;
        elNow.dataset.track = src;
        elNow.volume = 0;
        elNow.load();
      }
      if (!unlocked.current) return;
      if (elNow.paused) {
        const play = elNow.play();
        if (play) void play.catch(() => {});
      }
      if (elNow.volume < MUSIC_VOLUME - 0.01) {
        elNow.volume = Math.min(MUSIC_VOLUME, elNow.volume + 0.018);
      }
    };

    const onGesture = () => unlock();
    window.addEventListener("pointerdown", onGesture);
    window.addEventListener("keydown", onGesture);
    window.addEventListener("touchstart", onGesture, { passive: true });

    const tick = () => {
      const kit = engine.current;
      const s = flightState.current;
      const opts = optionsRef.current;
      if (kit) {
        if (kit.ctx.state === "suspended") void kit.ctx.resume();
        const throttle = opts.engineMuted ? 0 : axes.current.throttle;
        const speed = opts.engineMuted ? 0 : s.speed;
        const rpm = 70 + throttle * 90;
        kit.engineOsc.frequency.setTargetAtTime(rpm, kit.ctx.currentTime, 0.08);
        kit.engineOsc2.frequency.setTargetAtTime(
          rpm * 1.97,
          kit.ctx.currentTime,
          0.08,
        );
        const engineGain = opts.engineMuted
          ? 0
          : 0.012 + throttle * 0.055 + (s.airborne ? 0.008 : 0.018);
        kit.engineGain.gain.setTargetAtTime(
          engineGain,
          kit.ctx.currentTime,
          0.06,
        );
        const wind = opts.engineMuted ? 0 : Math.min(0.045, speed * 0.0009);
        kit.windGain.gain.setTargetAtTime(wind, kit.ctx.currentTime, 0.1);

        if (lastAirborne.current && !s.airborne && !opts.engineMuted) {
          bump(kit, 0.08, 0.12);
        }
        lastAirborne.current = s.airborne;
        if (s.shotsFired < lastShots.current) {
          lastShots.current = s.shotsFired;
        } else if (s.shotsFired > lastShots.current && !opts.engineMuted) {
          const n = Math.min(3, s.shotsFired - lastShots.current);
          lastShots.current = s.shotsFired;
          for (let i = 0; i < n; i++) playShot(kit);
        } else {
          lastShots.current = s.shotsFired;
        }
      }
      syncMusic();
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    syncMusic();

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointerdown", onGesture);
      window.removeEventListener("keydown", onGesture);
      window.removeEventListener("touchstart", onGesture);
      el.pause();
      el.src = "";
      music.current = null;
      engine.current?.ctx.close();
      engine.current = null;
    };
  }, [axes, flightState]);
}

interface EngineKit {
  ctx: AudioContext;
  engineOsc: OscillatorNode;
  engineOsc2: OscillatorNode;
  engineGain: GainNode;
  windGain: GainNode;
  master: GainNode;
  shotBuf: AudioBuffer | null;
}

const SHOT_SRC = "/assets/music/shot.mp3";
const SHOT_VOLUME = 0.42;

function playShot(kit: EngineKit): void {
  if (!kit.shotBuf) return;
  const src = kit.ctx.createBufferSource();
  src.buffer = kit.shotBuf;
  const g = kit.ctx.createGain();
  g.gain.value = SHOT_VOLUME;
  src.connect(g);
  g.connect(kit.master);
  src.start();
}

function loadShotBuffer(kit: EngineKit, prefetched: ArrayBuffer | null): void {
  if (kit.shotBuf) return;
  const raw = prefetched
    ? Promise.resolve(prefetched.slice(0))
    : fetch(SHOT_SRC).then((res) => {
        if (!res.ok) throw new Error("shot missing");
        return res.arrayBuffer();
      });
  void raw
    .then((buf) => kit.ctx.decodeAudioData(buf))
    .then((decoded) => {
      kit.shotBuf = decoded;
    })
    .catch(() => {
      /* keep flying silent if the clip fails to decode */
    });
}

function createEngine(): EngineKit | null {
  const Ctor =
    window.AudioContext ||
    (window as unknown as { webkitAudioContext?: typeof AudioContext })
      .webkitAudioContext;
  if (!Ctor) return null;
  const ctx = new Ctor();
  const master = ctx.createGain();
  master.gain.value = 0.9;
  master.connect(ctx.destination);

  const engineGain = ctx.createGain();
  engineGain.gain.value = 0;
  const filter = ctx.createBiquadFilter();
  filter.type = "lowpass";
  filter.frequency.value = 420;
  engineGain.connect(filter);
  filter.connect(master);

  const engineOsc = ctx.createOscillator();
  engineOsc.type = "sawtooth";
  engineOsc.frequency.value = 80;
  engineOsc.connect(engineGain);
  engineOsc.start();

  const engineOsc2 = ctx.createOscillator();
  engineOsc2.type = "triangle";
  engineOsc2.frequency.value = 160;
  const g2 = ctx.createGain();
  g2.gain.value = 0.45;
  engineOsc2.connect(g2);
  g2.connect(engineGain);
  engineOsc2.start();

  const noise = ctx.createBufferSource();
  noise.buffer = makeNoise(ctx);
  noise.loop = true;
  const windFilter = ctx.createBiquadFilter();
  windFilter.type = "highpass";
  windFilter.frequency.value = 800;
  const windGain = ctx.createGain();
  windGain.gain.value = 0;
  noise.connect(windFilter);
  windFilter.connect(windGain);
  windGain.connect(master);
  noise.start();

  return {
    ctx,
    engineOsc,
    engineOsc2,
    engineGain,
    windGain,
    master,
    shotBuf: null,
  };
}

function makeNoise(ctx: AudioContext): AudioBuffer {
  const len = ctx.sampleRate * 2;
  const buf = ctx.createBuffer(1, len, ctx.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < len; i++) data[i] = Math.random() * 2 - 1;
  return buf;
}

function bump(kit: EngineKit, peak: number, seconds: number) {
  const t = kit.ctx.currentTime;
  const g = kit.ctx.createGain();
  g.gain.setValueAtTime(peak, t);
  g.gain.exponentialRampToValueAtTime(0.0001, t + seconds);
  const src = kit.ctx.createBufferSource();
  src.buffer = makeNoise(kit.ctx);
  const f = kit.ctx.createBiquadFilter();
  f.type = "lowpass";
  f.frequency.value = 180;
  src.connect(f);
  f.connect(g);
  g.connect(kit.master);
  src.start();
  src.stop(t + seconds);
}

/** Toggle music from M unless a text field is focused. */
export function bindMusicHotkey(toggle: () => void): () => void {
  const onKey = (e: KeyboardEvent) => {
    if (e.repeat || e.code !== "KeyM") return;
    if (isTypingTarget(e.target)) return;
    e.preventDefault();
    toggle();
  };
  window.addEventListener("keydown", onKey);
  return () => window.removeEventListener("keydown", onKey);
}
