"use client";

import * as React from "react";

/* -------------------------------------------------------------------------- */
/*  Translucent Cassette Player                                               */
/*  A see-through portable tape player. Click the player (or the PLAY key)    */
/*  and the reels turn, the tape moves from one pack to the other, the motor, */
/*  belt, flywheel, gears and pinch roller all spin behind the casing.        */
/* -------------------------------------------------------------------------- */

export interface CassettePlayerProps {
  /** Colour of the translucent casing. */
  casingColor?: string;
  /** How much the casing hides the internals (0 = clear, 1 = solid). */
  casingOpacity?: number;
  /** PLAY key and cassette label stripe. */
  accentColor?: string;
  /** Top deck and transport keys. */
  metalColor?: string;
  /** Front door panel around the window. */
  doorColor?: string;
  /** Paper label on the cassette. */
  cassetteLabelColor?: string;
  /** Colour of the wound tape. */
  tapeColor?: string;
  /** Background behind the player. Use "transparent" to drop it. */
  backgroundColor?: string;
  /** Brand word printed on the door. */
  brandName?: string;
  /** Tape speed multiplier. */
  speed?: number;
  /** Show the motor, PCB, battery and gears through the casing. */
  showInternals?: boolean;
  /** Handwritten title on the cassette label (local addition; default is the original's). */
  tapeLabel?: string;
  /** Start playing on mount (ignored when the user prefers reduced motion). */
  autoPlay?: boolean;
  /** Mechanical click when a key is pressed. */
  clickSound?: boolean;
  /** Maximum width of the player in px. */
  size?: number;
  /** Where the tape starts (0 = all on the left reel, 1 = all on the right). */
  initialProgress?: number;
  /** Called whenever the transport starts or stops. */
  onPlayingChange?: (playing: boolean) => void;
  className?: string;
  children?: React.ReactNode;
}

type Mode = "stop" | "play" | "ff" | "rew";
type RGB = [number, number, number];

/* ------------------------------ colour helpers ----------------------------- */

function parseColor(input: string | undefined, fallback: RGB): RGB {
  if (!input) return fallback;
  const c = input.trim();
  const hex = c.match(/^#([0-9a-f]{3,8})$/i);
  if (hex) {
    let h = hex[1];
    if (h.length === 3 || h.length === 4) h = h.split("").map((x) => x + x).join("");
    if (h.length >= 6) {
      return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)];
    }
  }
  const rgb = c.match(/^rgba?\(([^)]+)\)$/i);
  if (rgb) {
    const p = rgb[1].split(/[\s,\/]+/).filter(Boolean).map(parseFloat);
    if (p.length >= 3 && p.slice(0, 3).every((n) => Number.isFinite(n))) return [p[0], p[1], p[2]];
  }
  return fallback;
}

function mix(a: RGB, b: RGB, t: number): string {
  const k = Math.min(1, Math.max(0, t));
  const r = a.map((v, i) => Math.round(v + (b[i] - v) * k));
  return `rgb(${r[0]},${r[1]},${r[2]})`;
}

const WHITE: RGB = [255, 255, 255];
const BLACK: RGB = [0, 0, 0];

const clamp = (n: number, lo: number, hi: number) =>
  Number.isFinite(n) ? Math.min(hi, Math.max(lo, n)) : lo;

/* --------------------------------- geometry -------------------------------- */

const VB_W = 480;
const VB_H = 360;
// Body
const BX = 40, BY = 70, BW = 400, BH = 260, BR = 18;
// Door
const DX = 108, DY = 124, DW = 264, DH = 184;
// Door window (stadium)
const WX = 140, WY = 170, WW = 200, WH = 90;
// Cassette
const CX = 240, CY = 215;
const HUB_L = CX - 58, HUB_R = CX + 58;
const R_CORE = 17, R_FULL = 50;
// Cassette window
const CWX = 158, CWY = 197, CWW = 164, CWH = 36;
// Mechanics
const MOTOR = { x: 406, y: 142, r: 19 };
const FLY = { x: 404, y: 264, r: 30 };
const GEAR_A = { x: 68, y: 288, r: 13, t: 18 };
const GEAR_B = { x: 92, y: 300, r: 8, t: 11 };
const PINCH = { x: 278, y: 318, r: 7 };

const SIDE_SECONDS = 150; // one side at speed 1
const FAST = 9; // fast-wind multiplier

function gearPath(r: number, teeth: number) {
  const inner = r - 2.2;
  const step = (Math.PI * 2) / teeth;
  let d = "";
  for (let i = 0; i < teeth; i++) {
    const a = i * step;
    const pts: Array<[number, number]> = [
      [inner, a],
      [r, a + step * 0.18],
      [r, a + step * 0.5],
      [inner, a + step * 0.68],
    ];
    pts.forEach(([rad, ang], j) => {
      const x = (rad * Math.cos(ang)).toFixed(2);
      const y = (rad * Math.sin(ang)).toFixed(2);
      d += `${i === 0 && j === 0 ? "M" : "L"}${x} ${y} `;
    });
  }
  return d + "Z";
}

const stadium = (x: number, y: number, w: number, h: number) => {
  const r = h / 2;
  return `M${x + r} ${y} H${x + w - r} A${r} ${r} 0 0 1 ${x + w - r} ${y + h} H${x + r} A${r} ${r} 0 0 1 ${x + r} ${y} Z`;
};

const roundRect = (x: number, y: number, w: number, h: number, r: number) =>
  `M${x + r} ${y} H${x + w - r} Q${x + w} ${y} ${x + w} ${y + r} V${y + h - r} Q${x + w} ${y + h} ${x + w - r} ${y + h} H${x + r} Q${x} ${y + h} ${x} ${y + h - r} V${y + r} Q${x} ${y} ${x + r} ${y} Z`;

const useIsoLayoutEffect = typeof window !== "undefined" ? React.useLayoutEffect : React.useEffect;

/* -------------------------------- component -------------------------------- */

export function CassettePlayer({
  casingColor = "#2E6B64",
  casingOpacity = 0.55,
  accentColor = "#D9772B",
  metalColor = "#A3A3A3",
  doorColor = "#C9C5C6",
  cassetteLabelColor = "#EEE8DA",
  tapeColor = "#4A2F1C",
  backgroundColor = "#F0F0F1",
  brandName = "sono",
  tapeLabel = "mixtape — summer",
  speed = 1,
  showInternals = true,
  autoPlay = false,
  clickSound = true,
  size = 640,
  initialProgress = 0.3,
  onPlayingChange,
  className,
  children,
}: CassettePlayerProps) {
  const rawId = React.useId();
  const uid = "cp" + rawId.replace(/[^a-zA-Z0-9]/g, "");
  const id = (s: string) => `${uid}-${s}`;
  const url = (s: string) => `url(#${id(s)})`;

  const [mode, setMode] = React.useState<Mode>("stop");
  const [dir, setDir] = React.useState<1 | -1>(1);

  // Live values read by the animation loop.
  const live = React.useRef({ speed, onPlayingChange, clickSound });
  live.current = { speed, onPlayingChange, clickSound };

  const sim = React.useRef({
    mode: "stop" as Mode,
    dir: 1 as 1 | -1,
    p: clamp(initialProgress, 0, 1),
    v: 0,
    motor: 0,
    pinch: 0,
    aL: 0,
    aR: 0,
    aFly: 0,
    aPulley: 0,
    aGear: 0,
    aPinch: 0,
    belt: 0,
  });

  const refs = {
    reelL: React.useRef<SVGGElement>(null),
    reelR: React.useRef<SVGGElement>(null),
    packL: React.useRef<SVGCircleElement>(null),
    packR: React.useRef<SVGCircleElement>(null),
    fly: React.useRef<SVGGElement>(null),
    pulley: React.useRef<SVGGElement>(null),
    gearA: React.useRef<SVGGElement>(null),
    gearB: React.useRef<SVGGElement>(null),
    pinch: React.useRef<SVGGElement>(null),
    belt: React.useRef<SVGPathElement>(null),
  };
  const rafRef = React.useRef<number | null>(null);
  const lastRef = React.useRef<number | null>(null);
  const visibleRef = React.useRef(true);
  const rootRef = React.useRef<HTMLDivElement>(null);
  const audioRef = React.useRef<AudioContext | null>(null);

  /* ------------------------------ draw one frame ----------------------------- */
  const apply = React.useCallback(() => {
    const s = sim.current;
    const A = R_FULL * R_FULL - R_CORE * R_CORE;
    const rL = Math.sqrt(R_CORE * R_CORE + (1 - s.p) * A);
    const rR = Math.sqrt(R_CORE * R_CORE + s.p * A);
    refs.packL.current?.setAttribute("r", rL.toFixed(2));
    refs.packR.current?.setAttribute("r", rR.toFixed(2));
    refs.reelL.current?.setAttribute("transform", `translate(${HUB_L} ${CY}) rotate(${s.aL.toFixed(2)})`);
    refs.reelR.current?.setAttribute("transform", `translate(${HUB_R} ${CY}) rotate(${s.aR.toFixed(2)})`);
    refs.fly.current?.setAttribute("transform", `translate(${FLY.x} ${FLY.y}) rotate(${s.aFly.toFixed(2)})`);
    refs.pulley.current?.setAttribute("transform", `translate(${MOTOR.x} ${MOTOR.y}) rotate(${s.aPulley.toFixed(2)})`);
    refs.gearA.current?.setAttribute("transform", `translate(${GEAR_A.x} ${GEAR_A.y}) rotate(${s.aGear.toFixed(2)})`);
    refs.gearB.current?.setAttribute(
      "transform",
      `translate(${GEAR_B.x} ${GEAR_B.y}) rotate(${(-s.aGear * (GEAR_A.t / GEAR_B.t) + 9).toFixed(2)})`
    );
    refs.pinch.current?.setAttribute("transform", `translate(${PINCH.x} ${PINCH.y}) rotate(${s.aPinch.toFixed(2)})`);
    refs.belt.current?.setAttribute("stroke-dashoffset", s.belt.toFixed(2));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ------------------------------ animation loop ----------------------------- */
  const step = React.useCallback(
    (now: number) => {
      rafRef.current = null;
      const s = sim.current;
      const last = lastRef.current ?? now;
      const dt = Math.min(0.05, Math.max(0, (now - last) / 1000));
      lastRef.current = now;
      const spd = clamp(live.current.speed, 0, 6);

      // Target tape velocity (fraction of a side per SIDE_SECONDS).
      let target = 0;
      if (s.mode === "play") target = s.dir * spd;
      else if (s.mode === "ff") target = s.dir * spd * FAST;
      else if (s.mode === "rew") target = -s.dir * spd * FAST;
      const k = target === 0 ? 5 : s.mode === "play" ? 7 : 3;
      s.v += (target - s.v) * (1 - Math.exp(-dt * k));

      const motorTarget = s.mode === "stop" ? 0 : (s.mode === "play" ? 1 : 1.8) * Math.max(spd, 0.15);
      s.motor += (motorTarget - s.motor) * (1 - Math.exp(-dt * (motorTarget ? 6 : 2.5)));
      const pinchTarget = s.mode === "play" ? 1 : 0;
      s.pinch += (pinchTarget - s.pinch) * (1 - Math.exp(-dt * 10));

      // Advance tape.
      s.p += (s.v * dt) / SIDE_SECONDS;
      if (s.p >= 1) {
        s.p = 1;
        if (s.mode === "play" && s.dir === 1) {
          s.dir = -1;
          setDir(-1);
        } else if (s.mode !== "play" && s.v > 0) {
          s.mode = "stop";
          setMode("stop");
          live.current.onPlayingChange?.(false);
        }
        if (s.v > 0) s.v = 0;
      } else if (s.p <= 0) {
        s.p = 0;
        if (s.mode === "play" && s.dir === -1) {
          s.dir = 1;
          setDir(1);
        } else if (s.mode !== "play" && s.v < 0) {
          s.mode = "stop";
          setMode("stop");
          live.current.onPlayingChange?.(false);
        }
        if (s.v < 0) s.v = 0;
      }

      // Constant linear tape speed -> angular speed depends on pack radius.
      const A = R_FULL * R_FULL - R_CORE * R_CORE;
      const rL = Math.sqrt(R_CORE * R_CORE + (1 - s.p) * A);
      const rR = Math.sqrt(R_CORE * R_CORE + s.p * A);
      const linear = s.v * 2.6 * R_CORE; // px / s at pack edge
      const deg = 180 / Math.PI;
      // Forward play turns both reels counter-clockwise.
      s.aL = (s.aL - ((linear / rL) * deg * dt)) % 360;
      s.aR = (s.aR - ((linear / rR) * deg * dt)) % 360;
      s.aGear = (s.aGear + s.v * 140 * dt) % 360;
      s.aFly = (s.aFly + s.motor * 150 * dt) % 360;
      s.aPulley = (s.aPulley + s.motor * 900 * dt) % 360;
      s.aPinch = (s.aPinch - s.motor * s.pinch * 420 * dt) % 360;
      s.belt = (s.belt - s.motor * 60 * dt) % 1000;

      apply();

      const idle = s.mode === "stop" && Math.abs(s.v) < 0.002 && s.motor < 0.002;
      if (!idle && visibleRef.current) {
        rafRef.current = requestAnimationFrame(step);
      } else {
        lastRef.current = null;
      }
    },
    [apply]
  );

  const kick = React.useCallback(() => {
    if (rafRef.current == null && visibleRef.current) {
      lastRef.current = null;
      rafRef.current = requestAnimationFrame(step);
    }
  }, [step]);

  useIsoLayoutEffect(() => {
    apply();
  }, [apply, showInternals]);

  // Pause when off-screen.
  React.useEffect(() => {
    const el = rootRef.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    const io = new IntersectionObserver(([entry]) => {
      visibleRef.current = entry.isIntersecting;
      if (entry.isIntersecting) {
        kick();
      } else if (rafRef.current != null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
        lastRef.current = null;
      }
    });
    io.observe(el);
    return () => {
      io.disconnect();
    };
  }, [kick]);

  React.useEffect(() => {
    return () => {
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
      audioRef.current?.close().catch(() => {});
    };
  }, []);

  /* ---------------------------------- sound --------------------------------- */
  const click = React.useCallback((heavy: boolean) => {
    if (!live.current.clickSound || typeof window === "undefined") return;
    try {
      const Ctx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!Ctx) return;
      const ctx = audioRef.current ?? new Ctx();
      audioRef.current = ctx;
      if (ctx.state === "suspended") void ctx.resume();
      const t = ctx.currentTime;
      const len = Math.floor(ctx.sampleRate * 0.06);
      const buf = ctx.createBuffer(1, len, ctx.sampleRate);
      const data = buf.getChannelData(0);
      for (let i = 0; i < len; i++) data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 6);
      const src = ctx.createBufferSource();
      src.buffer = buf;
      const bp = ctx.createBiquadFilter();
      bp.type = "bandpass";
      bp.frequency.value = heavy ? 1800 : 3200;
      bp.Q.value = 1.2;
      const g = ctx.createGain();
      g.gain.value = heavy ? 0.55 : 0.35;
      src.connect(bp).connect(g).connect(ctx.destination);
      src.start(t);
      // low "thunk" of the mechanism engaging
      const o = ctx.createOscillator();
      const og = ctx.createGain();
      o.frequency.setValueAtTime(heavy ? 140 : 220, t);
      o.frequency.exponentialRampToValueAtTime(60, t + 0.08);
      og.gain.setValueAtTime(heavy ? 0.25 : 0.12, t);
      og.gain.exponentialRampToValueAtTime(0.0001, t + 0.1);
      o.connect(og).connect(ctx.destination);
      o.start(t);
      o.stop(t + 0.12);
    } catch {
      /* audio is optional */
    }
  }, []);

  /* -------------------------------- transport -------------------------------- */
  const setTransport = React.useCallback(
    (next: Mode) => {
      const s = sim.current;
      const was = s.mode;
      if (next === was) return;
      // Nothing to wind in that direction? Stay put.
      if (next === "ff" && ((s.dir === 1 && s.p >= 1) || (s.dir === -1 && s.p <= 0))) next = "stop";
      if (next === "rew" && ((s.dir === 1 && s.p <= 0) || (s.dir === -1 && s.p >= 1))) next = "stop";
      if (next === "play" && s.p >= 1 && s.dir === 1) {
        s.dir = -1;
        setDir(-1);
      }
      if (next === "play" && s.p <= 0 && s.dir === -1) {
        s.dir = 1;
        setDir(1);
      }
      s.mode = next;
      setMode(next);
      click(next !== "stop");
      if ((was === "stop") !== (next === "stop")) live.current.onPlayingChange?.(next !== "stop");
      kick();
    },
    [click, kick]
  );

  const toggle = React.useCallback(() => {
    setTransport(sim.current.mode === "play" ? "stop" : "play");
  }, [setTransport]);

  React.useEffect(() => {
    if (!autoPlay) return;
    const reduce =
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    if (!reduce) setTransport("play");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoPlay]);

  const press = (m: Mode) => (e: React.MouseEvent) => {
    e.stopPropagation();
    if (m === "stop") setTransport("stop");
    else setTransport(sim.current.mode === m ? "stop" : m);
  };

  /* --------------------------------- colours -------------------------------- */
  const c = React.useMemo(() => {
    const casing = parseColor(casingColor, [46, 107, 100]);
    const metal = parseColor(metalColor, [163, 163, 163]);
    const accent = parseColor(accentColor, [217, 119, 43]);
    const door = parseColor(doorColor, [201, 197, 198]);
    const label = parseColor(cassetteLabelColor, [238, 232, 218]);
    const tape = parseColor(tapeColor, [74, 47, 28]);
    return {
      casing: mix(casing, casing, 0),
      casingLight: mix(casing, WHITE, 0.3),
      casingLighter: mix(casing, WHITE, 0.55),
      casingDark: mix(casing, BLACK, 0.35),
      casingDeep: mix(casing, BLACK, 0.5),
      casingRib: mix(casing, WHITE, 0.18),
      metalHi: mix(metal, WHITE, 0.55),
      metalLight: mix(metal, WHITE, 0.3),
      metal: mix(metal, metal, 0),
      metalDark: mix(metal, BLACK, 0.3),
      metalDeep: mix(metal, BLACK, 0.55),
      metalInk: mix(metal, BLACK, 0.62),
      accentHi: mix(accent, WHITE, 0.35),
      accent: mix(accent, accent, 0),
      accentDark: mix(accent, BLACK, 0.35),
      doorHi: mix(door, WHITE, 0.45),
      door: mix(door, door, 0),
      doorDark: mix(door, BLACK, 0.18),
      doorDeep: mix(door, BLACK, 0.45),
      doorInk: mix(door, BLACK, 0.6),
      label: mix(label, label, 0),
      labelDark: mix(label, BLACK, 0.12),
      labelInk: mix(label, BLACK, 0.7),
      tapeHi: mix(tape, WHITE, 0.16),
      tape: mix(tape, tape, 0),
      tapeDark: mix(tape, BLACK, 0.35),
    };
  }, [casingColor, metalColor, accentColor, doorColor, cassetteLabelColor, tapeColor]);

  const opacity = clamp(casingOpacity, 0, 1);
  const playing = mode !== "stop";

  const keys: Array<{ m: Mode; x: number; w: number; label: string; icon: string }> = [
    { m: "rew", x: 148, w: 40, label: "Rewind", icon: "M-6 0 L0 -4 V4 Z M0 0 L6 -4 V4 Z" },
    { m: "ff", x: 194, w: 40, label: "Fast forward", icon: "M6 0 L0 -4 V4 Z M0 0 L-6 -4 V4 Z" },
    { m: "stop", x: 240, w: 40, label: "Stop", icon: "M-3.5 -3.5 H3.5 V3.5 H-3.5 Z" },
    { m: "play", x: 296, w: 54, label: "Play", icon: "M-3.5 -4.5 L5 0 L-3.5 4.5 Z" },
  ];

  const bodyPath = roundRect(BX, BY, BW, BH, BR);

  return (
    <div
      ref={rootRef}
      className={["relative flex w-full flex-col items-center justify-center gap-6 px-4 py-12", className]
        .filter(Boolean)
        .join(" ")}
      style={{ background: backgroundColor }}
    >
      <div
        role="button"
        tabIndex={0}
        aria-pressed={mode === "play"}
        aria-label={mode === "play" ? "Stop cassette" : "Play cassette"}
        onClick={toggle}
        onKeyDown={(e) => {
          if (e.key === " " || e.key === "Enter") {
            e.preventDefault();
            toggle();
          }
        }}
        className="relative w-full cursor-pointer select-none outline-none [-webkit-tap-highlight-color:transparent] focus-visible:ring-2 focus-visible:ring-offset-4 rounded-[28px]"
        style={{ maxWidth: clamp(size, 200, 1600) }}
      >
        <svg viewBox={`0 0 ${VB_W} ${VB_H}`} className="block h-auto w-full overflow-visible" aria-hidden>
          <defs>
            {/* casing */}
            <linearGradient id={id("casing")} x1="0" y1="0" x2="0.25" y2="1">
              <stop offset="0" stopColor={c.casingLight} stopOpacity={Math.min(1, opacity * 0.85)} />
              <stop offset="0.45" stopColor={c.casing} stopOpacity={opacity} />
              <stop offset="1" stopColor={c.casingDark} stopOpacity={Math.min(1, opacity * 1.15 + 0.05)} />
            </linearGradient>
            <linearGradient id={id("sideLight")} x1="0" y1="0" x2="1" y2="0">
              <stop offset="0" stopColor="#fff" stopOpacity="0.32" />
              <stop offset="0.5" stopColor="#fff" stopOpacity="0.1" />
              <stop offset="1" stopColor="#fff" stopOpacity="0" />
            </linearGradient>
            <linearGradient id={id("sideDark")} x1="1" y1="0" x2="0" y2="0">
              <stop offset="0" stopColor="#000" stopOpacity="0.28" />
              <stop offset="1" stopColor="#000" stopOpacity="0" />
            </linearGradient>
            <linearGradient id={id("sheen")} x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stopColor="#fff" stopOpacity="0" />
              <stop offset="0.42" stopColor="#fff" stopOpacity="0" />
              <stop offset="0.5" stopColor="#fff" stopOpacity="0.13" />
              <stop offset="0.58" stopColor="#fff" stopOpacity="0" />
              <stop offset="1" stopColor="#fff" stopOpacity="0" />
            </linearGradient>
            {/* metal */}
            <linearGradient id={id("metal")} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor={c.metalHi} />
              <stop offset="0.22" stopColor={c.metalLight} />
              <stop offset="0.7" stopColor={c.metal} />
              <stop offset="1" stopColor={c.metalDark} />
            </linearGradient>
            <linearGradient id={id("key")} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor={c.metalHi} />
              <stop offset="0.35" stopColor={c.metalLight} />
              <stop offset="1" stopColor={c.metalDark} />
            </linearGradient>
            <linearGradient id={id("keyAccent")} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor={c.accentHi} />
              <stop offset="0.4" stopColor={c.accent} />
              <stop offset="1" stopColor={c.accentDark} />
            </linearGradient>
            <pattern id={id("brushed")} width="480" height="3" patternUnits="userSpaceOnUse">
              <rect width="480" height="1" fill="#fff" opacity="0.07" />
              <rect y="1.6" width="480" height="0.6" fill="#000" opacity="0.05" />
            </pattern>
            {/* door */}
            <linearGradient id={id("door")} x1="0" y1="0" x2="0.15" y2="1">
              <stop offset="0" stopColor={c.doorHi} />
              <stop offset="0.12" stopColor={c.door} />
              <stop offset="1" stopColor={c.doorDark} />
            </linearGradient>
            {/* tape pack */}
            <radialGradient id={id("tape")} cx="0.5" cy="0.5" r="0.5">
              <stop offset="0" stopColor={c.tapeDark} />
              <stop offset="0.34" stopColor={c.tapeDark} />
              <stop offset="0.36" stopColor={c.tape} />
              <stop offset="0.55" stopColor={c.tapeHi} />
              <stop offset="0.6" stopColor={c.tape} />
              <stop offset="0.78" stopColor={c.tapeHi} />
              <stop offset="0.82" stopColor={c.tape} />
              <stop offset="0.96" stopColor={c.tapeHi} />
              <stop offset="1" stopColor={c.tapeDark} />
            </radialGradient>
            {/* chrome */}
            <radialGradient id={id("chrome")} cx="0.38" cy="0.32" r="0.75">
              <stop offset="0" stopColor="#ffffff" />
              <stop offset="0.35" stopColor="#c9cdd1" />
              <stop offset="0.75" stopColor="#7d8389" />
              <stop offset="1" stopColor="#4a4f54" />
            </radialGradient>
            <linearGradient id={id("chromeBar")} x1="0" y1="0" x2="1" y2="0">
              <stop offset="0" stopColor="#5d6268" />
              <stop offset="0.3" stopColor="#eef0f2" />
              <stop offset="0.55" stopColor="#a9aeb3" />
              <stop offset="1" stopColor="#4c5157" />
            </linearGradient>
            <radialGradient id={id("brass")} cx="0.4" cy="0.35" r="0.7">
              <stop offset="0" stopColor="#f6e3a8" />
              <stop offset="0.5" stopColor="#c49a45" />
              <stop offset="1" stopColor="#6e5320" />
            </radialGradient>
            <linearGradient id={id("battery")} x1="0" y1="0" x2="1" y2="0">
              <stop offset="0" stopColor="#0e0f10" />
              <stop offset="0.28" stopColor="#4b4f53" />
              <stop offset="0.42" stopColor="#24272a" />
              <stop offset="1" stopColor="#08090a" />
            </linearGradient>
            <radialGradient id={id("led")} cx="0.5" cy="0.5" r="0.5">
              <stop offset="0" stopColor="#fff6e0" />
              <stop offset="0.35" stopColor="#ff6a3d" />
              <stop offset="1" stopColor="#ff3b1f" stopOpacity="0" />
            </radialGradient>
            {/* filters */}
            <filter id={id("grain")} x="0" y="0" width="100%" height="100%">
              <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed="7" />
              <feColorMatrix values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 0.55 0" />
            </filter>
            <filter id={id("shadow")} x="-20%" y="-50%" width="140%" height="200%">
              <feGaussianBlur stdDeviation="8" />
            </filter>
            <filter id={id("soft")} x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="1.6" />
            </filter>
            <filter id={id("blur3")} x="-100%" y="-100%" width="300%" height="300%">
              <feGaussianBlur stdDeviation="3" />
            </filter>
            <filter id={id("partShadow")} x="-40%" y="-40%" width="180%" height="180%">
              <feGaussianBlur stdDeviation="2.4" />
            </filter>
            <filter id={id("glow")} x="-10%" y="-10%" width="120%" height="120%">
              <feGaussianBlur stdDeviation="2.2" />
            </filter>
            <filter id={id("grainDark")} x="0" y="0" width="100%" height="100%">
              <feTurbulence type="fractalNoise" baseFrequency="1.3" numOctaves="2" seed="3" />
              <feColorMatrix values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 0.7 0" />
            </filter>
            <radialGradient id={id("ambient")} cx="0.15" cy="0" r="1.1">
              <stop offset="0" stopColor="#fff" stopOpacity="0.2" />
              <stop offset="0.55" stopColor="#fff" stopOpacity="0" />
            </radialGradient>
            <linearGradient id={id("topFace")} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor={c.metalDark} />
              <stop offset="0.35" stopColor={c.metalLight} />
              <stop offset="1" stopColor={c.metalHi} />
            </linearGradient>
            <linearGradient id={id("keyTop")} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#fff" stopOpacity="0.9" />
              <stop offset="1" stopColor="#fff" stopOpacity="0.35" />
            </linearGradient>
            {/* clips */}
            <clipPath id={id("door")}>
              <path clipRule="evenodd" d={`${roundRect(DX, DY, DW, DH, 8)} ${stadium(WX, WY, WW, WH)}`} />
            </clipPath>
            <clipPath id={id("keysClip")}>
              <rect x={0} y={0} width={VB_W} height={65} />
            </clipPath>
            <clipPath id={id("body")}>
              <path d={bodyPath} />
            </clipPath>
            <clipPath id={id("window")}>
              <path d={stadium(WX, WY, WW, WH)} />
            </clipPath>
            <clipPath id={id("cwindow")}>
              <path d={stadium(CWX, CWY, CWW, CWH)} />
            </clipPath>
          </defs>

          {/* ground shadow */}
          <ellipse cx={240} cy={334} rx={196} ry={9} fill="#000" opacity={0.28} filter={url("shadow")} />
          <ellipse cx={240} cy={331} rx={180} ry={3} fill="#000" opacity={0.18} filter={url("soft")} />
          <ellipse cx={240} cy={329.5} rx={192} ry={2.2} fill="#000" opacity={0.35} filter={url("soft")} />

          {/* top face of the device (seen slightly from above) */}
          <path d={roundRect(BX + 13, BY - 10, BW - 26, 18, 9)} fill={url("topFace")} />
          <path d={roundRect(BX + 13, BY - 10, BW - 26, 18, 9)} fill={url("brushed")} />
          <path d={`M${BX + 14} ${BY - 9.5} H${BX + BW - 14}`} stroke="#000" strokeOpacity={0.25} strokeWidth={0.8} />
          {/* key slots in the top face */}
          {keys.map((k) => (
            <rect key={k.m} x={k.x - 1.6} y={BY - 6.5} width={k.w + 3.2} height={6} rx={1.6} fill="#000" opacity={0.55} />
          ))}

          {/* ------------------------------ transport keys ------------------------------ */}
          <g clipPath={url("keysClip")}>
          {keys.map((k) => {
            const down = mode === k.m;
            const accent = k.m === "play";
            return (
              <g
                key={k.m}
                role="button"
                aria-label={k.label}
                onClick={press(k.m)}
                style={{
                  transform: `translateY(${down ? 7 : 0}px)`,
                  transition: "transform 110ms cubic-bezier(.3,.7,.4,1)",
                  cursor: "pointer",
                }}
              >
                {/* top face of the key */}
                <path
                  d={`M${k.x + 2.5} ${BY - 26} H${k.x + k.w - 2.5} L${k.x + k.w} ${BY - 21} H${k.x} Z`}
                  fill={accent ? c.accentHi : c.metalHi}
                />
                <path
                  d={`M${k.x + 2.5} ${BY - 26} H${k.x + k.w - 2.5} L${k.x + k.w} ${BY - 21} H${k.x} Z`}
                  fill={url("keyTop")}
                  opacity={0.5}
                />
                {[0, 1, 2].map((r) => (
                  <path
                    key={r}
                    d={`M${k.x + 4} ${BY - 24.6 + r * 1.4} H${k.x + k.w - 4}`}
                    stroke="#000"
                    strokeOpacity={0.12}
                    strokeWidth={0.5}
                  />
                ))}
                {/* front face */}
                <rect x={k.x} y={BY - 21} width={k.w} height={28} rx={1.5} fill={url(accent ? "keyAccent" : "key")} />
                <rect x={k.x} y={BY - 21} width={k.w} height={0.9} fill="#fff" opacity={0.7} />
                <rect x={k.x} y={BY - 21} width={1.2} height={28} fill="#fff" opacity={0.25} />
                <rect x={k.x + k.w - 1.2} y={BY - 21} width={1.2} height={28} fill="#000" opacity={0.2} />
              </g>
            );
          })}
          </g>

          {/* volume wheel peeking from the right side */}
          <g>
            <rect x={434} y={150} width={11} height={50} rx={3} fill={c.metalDeep} />
            {Array.from({ length: 16 }).map((_, i) => (
              <rect key={i} x={436} y={152 + i * 3} width={9} height={1.4} rx={0.5} fill={c.metalLight} opacity={0.8} />
            ))}
          </g>

          {/* --------------------------------- body --------------------------------- */}
          <g clipPath={url("body")}>
            {/* inside back wall of the shell */}
            <rect x={BX} y={BY} width={BW} height={BH} fill={c.casingDeep} />
            {Array.from({ length: 24 }).map((_, i) => (
              <rect key={i} x={BX + 6 + i * 17} y={BY} width={1} height={BH} fill={c.casingRib} opacity={0.18} />
            ))}

            {showInternals && (
              <g>
                {/* main PCB */}
                <path d={roundRect(48, 98, 384, 226, 7)} fill="#1b2421" />
                <path d={roundRect(48, 98, 384, 226, 7)} fill="none" stroke="#000" strokeOpacity={0.4} />
                {/* copper traces */}
                <g fill="none" stroke="#c9a14a" strokeOpacity={0.55} strokeWidth={1} strokeLinecap="round">
                  <path d="M110 106 H150 M182 106 H200 L206 100 M110 118 H150 M182 118 H230 L236 112 H300" />
                  <path d="M262 112 H272 M292 112 H300 M340 108 H350 M340 116 H350 L356 122 H372" />
                  <path d="M50 312 H120 L128 304 H206 M50 320 H170 L178 314 H224" />
                  <path d="M256 314 H266 M292 312 H340 L348 320 H400 M300 324 H430" />
                  <path d="M100 140 V280 L108 288 M104 140 V270" />
                  <path d="M380 180 H436 M372 296 H436" />
                </g>
                {/* vias */}
                {[
                  [206, 100], [236, 112], [128, 304], [178, 314], [348, 320], [108, 288], [356, 122],
                  [372, 180], [432, 296], [140, 324], [212, 322],
                ].map(([x, y], i) => (
                  <g key={i}>
                    <circle cx={x} cy={y} r={1.9} fill="#d8b860" opacity={0.75} />
                    <circle cx={x} cy={y} r={0.8} fill="#0c100e" />
                  </g>
                ))}
                {/* silkscreen */}
                <text x={290} y={326} fontSize={4.2} fill="#fff" opacity={0.5} fontFamily="ui-monospace, monospace" letterSpacing={0.6}>
                  MAIN-PCB REV 2.1
                </text>

                {/* parts cast soft shadows onto the board */}
                <g fill="#000" opacity={0.6} filter={url("partShadow")}>
                  <rect x={153} y={107} width={32} height={18} rx={2} />
                  <circle cx={209} cy={116} r={8} />
                  <circle cx={229} cy={116} r={5.5} />
                  <rect x={243} y={110} width={22} height={11} rx={5.5} />
                  <rect x={64} y={141} width={28} height={112} rx={3} />
                  <circle cx={MOTOR.x + 3} cy={MOTOR.y + 4} r={MOTOR.r + 1} />
                  <circle cx={FLY.x + 3} cy={FLY.y + 4} r={FLY.r} />
                  <circle cx={GEAR_A.x + 2.5} cy={GEAR_A.y + 3.5} r={GEAR_A.r} />
                  <circle cx={GEAR_B.x + 2.5} cy={GEAR_B.y + 3.5} r={GEAR_B.r} />
                  <rect x={225} y={306} width={36} height={22} rx={3} />
                  <circle cx={PINCH.x + 2.5} cy={PINCH.y + 3.5} r={PINCH.r} />
                  <rect x={399} y={314} width={34} height={14} rx={3} />
                  <path d="M73 138 C73 116, 95 114, 115 114 L151 114 M83 138 C83 122, 99 120, 117 120 L151 120" fill="none" stroke="#000" strokeWidth={2.6} />
                </g>

                {/* top strip: IC, caps, crystal, flex */}
                <g>
                  <rect x={150} y={103} width={32} height={18} rx={1.5} fill="#121314" />
                  {Array.from({ length: 7 }).map((_, i) => (
                    <g key={i}>
                      <rect x={152.5 + i * 4.2} y={100.5} width={1.6} height={3} fill="#c9ced3" />
                      <rect x={152.5 + i * 4.2} y={120.5} width={1.6} height={3} fill="#c9ced3" />
                    </g>
                  ))}
                  <circle cx={154.5} cy={106.5} r={1} fill="#3a3c3e" />
                  <text x={166} y={114.5} fontSize={4} textAnchor="middle" fill="#9aa0a6" fontFamily="ui-monospace, monospace">
                    AMP-7
                  </text>
                  {/* electrolytic caps (top view) */}
                  {[
                    [206, 112, 8, "#1d3557"],
                    [226, 112, 5.5, "#2b2b2b"],
                  ].map(([x, y, r, col], i) => (
                    <g key={i}>
                      <circle cx={x as number} cy={y as number} r={r as number} fill={col as string} />
                      <circle cx={x as number} cy={y as number} r={(r as number) - 1.2} fill="none" stroke="#fff" strokeOpacity={0.18} />
                      <path
                        d={`M${(x as number) - (r as number) * 0.5} ${(y as number) - (r as number) * 0.4} l${(r as number) * 0.5} ${(r as number) * 0.4} l${(r as number) * 0.5} ${-(r as number) * 0.4}`}
                        stroke="#c0c6cc"
                        strokeOpacity={0.7}
                        strokeWidth={0.7}
                        fill="none"
                      />
                      <path
                        d={`M${x as number} ${(y as number) - (r as number)} A${r} ${r} 0 0 1 ${(x as number) + (r as number)} ${y}`}
                        stroke="#d7dde2"
                        strokeOpacity={0.6}
                        strokeWidth={1.4}
                        fill="none"
                      />
                    </g>
                  ))}
                  {/* crystal */}
                  <rect x={240} y={106} width={22} height={11} rx={5.5} fill={url("chromeBar")} />
                  <rect x={240} y={106} width={22} height={11} rx={5.5} fill="none" stroke="#000" strokeOpacity={0.3} strokeWidth={0.5} />
                  {/* smd resistors */}
                  {[272, 282, 292].map((x, i) => (
                    <g key={i}>
                      <rect x={x} y={109} width={7} height={4} fill="#1a1a1a" />
                      <rect x={x} y={109} width={1.6} height={4} fill="#d4d8dc" />
                      <rect x={x + 5.4} y={109} width={1.6} height={4} fill="#d4d8dc" />
                    </g>
                  ))}
                  {/* amber flex ribbon */}
                  <rect x={304} y={98} width={34} height={28} fill="#c9862a" opacity={0.82} />
                  {Array.from({ length: 9 }).map((_, i) => (
                    <rect key={i} x={307 + i * 3.4} y={98} width={1.2} height={28} fill="#f3c46c" opacity={0.55} />
                  ))}
                  <rect x={342} y={104} width={20} height={14} rx={1} fill="#121314" />
                  <rect x={344} y={106} width={16} height={10} rx={0.5} fill="none" stroke="#fff" strokeOpacity={0.08} />
                </g>

                {/* battery bay (left) */}
                <g>
                  <rect x={53} y={128} width={44} height={150} rx={4} fill="#000" opacity={0.25} />
                  <rect x={55} y={130} width={2} height={146} fill={c.casingRib} opacity={0.35} />
                  <rect x={93} y={130} width={2} height={146} fill={c.casingRib} opacity={0.35} />
                  {/* contact plate */}
                  <rect x={64} y={134} width={22} height={4} rx={1} fill={url("chromeBar")} />
                  {/* AA cell */}
                  <rect x={70.5} y={138} width={9} height={6} rx={1.4} fill={url("chromeBar")} />
                  <rect x={61} y={143} width={28} height={104} rx={3} fill={url("battery")} />
                  <rect x={61} y={143} width={28} height={22} rx={3} fill={url("chromeBar")} opacity={0.9} />
                  <rect x={61} y={161} width={28} height={4} fill="#000" opacity={0.35} />
                  <text
                    x={0}
                    y={0}
                    transform="translate(78 208) rotate(-90)"
                    fontSize={7}
                    fontWeight={700}
                    fill="#e8eaec"
                    opacity={0.85}
                    textAnchor="middle"
                    fontFamily="ui-sans-serif, system-ui, sans-serif"
                    letterSpacing={1.2}
                  >
                    1.5V · AA
                  </text>
                  <rect x={64} y={146} width={3} height={98} rx={1.5} fill="#fff" opacity={0.18} />
                  {/* spring */}
                  <path
                    d="M66 249 L84 252 L66 255 L84 258 L66 261 L84 264 L66 267 L84 270"
                    fill="none"
                    stroke="#d8dde2"
                    strokeWidth={1.6}
                    strokeLinejoin="round"
                  />
                  <rect x={63} y={270} width={24} height={4} rx={1} fill={url("chromeBar")} />
                  {/* wires */}
                  <path d="M70 134 C70 112, 92 110, 112 110 L148 110" fill="none" stroke="#b3261e" strokeWidth={2.2} strokeLinecap="round" />
                  <path d="M80 134 C80 118, 96 116, 114 116 L148 116" fill="none" stroke="#141414" strokeWidth={2.2} strokeLinecap="round" />
                  <path d="M70 134 C70 112, 92 110, 112 110 L148 110" fill="none" stroke="#fff" strokeOpacity={0.25} strokeWidth={0.6} />
                </g>

                {/* reverse-mechanism gears (bottom left) */}
                <g ref={refs.gearA}>
                  <path d={gearPath(GEAR_A.r, GEAR_A.t)} fill="#efece4" />
                  <circle r={GEAR_A.r - 5} fill="none" stroke="#000" strokeOpacity={0.12} />
                  <circle r={3} fill="#9da3a8" />
                  <rect x={-1} y={-GEAR_A.r + 4} width={2} height={5} fill="#000" opacity={0.18} />
                </g>
                <g ref={refs.gearB}>
                  <path d={gearPath(GEAR_B.r, GEAR_B.t)} fill="#e6e2d8" />
                  <circle r={2.2} fill="#9da3a8" />
                  <rect x={-0.8} y={-GEAR_B.r + 3} width={1.6} height={3} fill="#000" opacity={0.2} />
                </g>

                {/* motor (right, top) */}
                <g>
                  <rect x={389} y={120} width={6} height={6} fill={url("chromeBar")} />
                  <rect x={417} y={120} width={6} height={6} fill={url("chromeBar")} />
                  <circle cx={MOTOR.x} cy={MOTOR.y} r={MOTOR.r + 2} fill="#000" opacity={0.3} />
                  <circle cx={MOTOR.x} cy={MOTOR.y} r={MOTOR.r} fill={url("chrome")} />
                  <circle cx={MOTOR.x} cy={MOTOR.y} r={MOTOR.r - 5} fill="none" stroke="#000" strokeOpacity={0.25} />
                  <circle cx={MOTOR.x} cy={MOTOR.y} r={MOTOR.r - 9} fill="#2b2e31" />
                  <g ref={refs.pulley}>
                    <circle r={6} fill={url("brass")} />
                    <rect x={-1} y={-6} width={2} height={4} fill="#3b2a0a" opacity={0.7} />
                    <circle r={1.4} fill="#2b2e31" />
                  </g>
                </g>

                {/* drive belt */}
                <path
                  d={`M${MOTOR.x - 6} ${MOTOR.y} L${FLY.x - FLY.r} ${FLY.y} A${FLY.r} ${FLY.r} 0 0 0 ${FLY.x + FLY.r} ${FLY.y} L${MOTOR.x + 6} ${MOTOR.y} A6 6 0 0 0 ${MOTOR.x - 6} ${MOTOR.y} Z`}
                  fill="none"
                  stroke="#0b0b0b"
                  strokeWidth={2.4}
                  strokeLinejoin="round"
                />
                <path
                  ref={refs.belt}
                  d={`M${MOTOR.x - 6} ${MOTOR.y} L${FLY.x - FLY.r} ${FLY.y} A${FLY.r} ${FLY.r} 0 0 0 ${FLY.x + FLY.r} ${FLY.y} L${MOTOR.x + 6} ${MOTOR.y} A6 6 0 0 0 ${MOTOR.x - 6} ${MOTOR.y} Z`}
                  fill="none"
                  stroke="#5a5a5a"
                  strokeWidth={1}
                  strokeDasharray="1.5 6"
                />

                {/* flywheel */}
                <g ref={refs.fly}>
                  <circle r={FLY.r} fill={url("chrome")} />
                  <circle r={FLY.r - 2.5} fill="none" stroke="#000" strokeOpacity={0.22} strokeWidth={1} />
                  {[0, 120, 240].map((a) => (
                    <path
                      key={a}
                      transform={`rotate(${a})`}
                      d="M7 -6 A9 9 0 0 1 7 6 L19 12 A22 22 0 0 0 19 -12 Z"
                      fill="#1b2421"
                      opacity={0.85}
                    />
                  ))}
                  <circle r={6.5} fill="#8b9095" />
                  <circle r={2.4} fill="#e9ecef" />
                  <rect x={-0.8} y={-FLY.r + 1.5} width={1.6} height={3.5} fill="#000" opacity={0.35} />
                </g>

                {/* tape head + pinch roller (bottom centre) */}
                <g>
                  <rect x={222} y={302} width={36} height={22} rx={3} fill={url("chromeBar")} />
                  <rect x={222} y={302} width={36} height={22} rx={3} fill="none" stroke="#000" strokeOpacity={0.3} strokeWidth={0.6} />
                  <rect x={239.4} y={302} width={1.2} height={22} fill="#1a1a1a" />
                  <circle cx={227} cy={319} r={1.6} fill="#5d6268" />
                  <circle cx={253} cy={319} r={1.6} fill="#5d6268" />
                  <rect x={262} y={304} width={3} height={20} rx={1.5} fill={url("chromeBar")} />
                </g>
                <g ref={refs.pinch}>
                  <circle r={PINCH.r} fill="#121212" />
                  <circle r={PINCH.r - 1.2} fill="none" stroke="#2c2c2c" strokeWidth={1.2} />
                  <circle r={2.2} fill="#b8bdc2" />
                  <rect x={-0.6} y={-PINCH.r + 0.8} width={1.2} height={2.2} fill="#5a5a5a" />
                </g>

                {/* headphone jack (bottom right) */}
                <g>
                  <rect x={396} y={310} width={34} height={14} rx={3} fill="#151515" />
                  <rect x={400} y={312} width={26} height={10} rx={5} fill={url("chromeBar")} />
                  <circle cx={413} cy={317} r={2.6} fill="#0b0b0b" />
                </g>

                {/* screws */}
                {[
                  [56, 316],
                  [372, 316],
                  [430, 110],
                ].map(([x, y], i) => (
                  <g key={i}>
                    <circle cx={x} cy={y} r={4.6} fill={url("chrome")} />
                    <path d={`M${x - 2.4} ${y} H${x + 2.4} M${x} ${y - 2.4} V${y + 2.4}`} stroke="#2a2d30" strokeWidth={1.1} />
                  </g>
                ))}
              </g>
            )}

            {/* translucent casing over the internals */}
            <rect x={BX} y={BY} width={BW} height={BH} fill={url("casing")} />
            <rect x={BX} y={BY} width={BW} height={BH} filter={url("grain")} opacity={0.08} />
            <rect x={BX} y={BY} width={BW} height={BH} fill={url("ambient")} />
            <rect x={BX} y={BY} width={30} height={BH} fill={url("sideLight")} />
            <rect x={BX + BW - 26} y={BY} width={26} height={BH} fill={url("sideDark")} />
            {/* thick plastic walls read darker */}
            <path d={roundRect(BX + 3, BY + 3, BW - 6, BH - 6, BR - 3)} fill="none" stroke={c.casingDark} strokeOpacity={0.5} strokeWidth={6} />
            <path d={roundRect(BX + 7, BY + 7, BW - 14, BH - 14, BR - 6)} fill="none" stroke={c.casingLighter} strokeOpacity={0.18} strokeWidth={1} />
            {/* light gathering in the edges of the translucent plastic */}
            <path d={roundRect(BX + 2.5, BY + 2.5, BW - 5, BH - 5, BR - 2)} fill="none" stroke={c.casingLighter} strokeOpacity={0.5} strokeWidth={2.4} filter={url("glow")} />
            <rect x={BX + 24} y={BY + BH - 8} width={BW - 48} height={3.5} rx={1.75} fill={c.casingLighter} opacity={0.55} filter={url("glow")} />
            <rect x={BX + 3} y={BY + 40} width={2.5} height={BH - 70} rx={1.2} fill={c.casingLighter} opacity={0.6} filter={url("soft")} />
            {/* soft studio reflections on the shell */}
            <rect x={BX + 13} y={BY + 36} width={11} height={BH - 54} rx={5.5} fill="#fff" opacity={0.13} filter={url("glow")} />
            <rect x={BX + BW - 19} y={BY + 42} width={2} height={BH - 66} rx={1} fill="#fff" opacity={0.28} filter={url("soft")} />

            {/* --------------------------- top deck (metal) --------------------------- */}
            <rect x={BX} y={BY} width={BW} height={30} fill={url("metal")} />
            <rect x={BX} y={BY} width={BW} height={30} fill={url("brushed")} />
            <rect x={BX} y={BY} width={BW} height={1.1} fill="#fff" opacity={0.85} />
            <rect x={BX + 20} y={BY + 5} width={BW - 40} height={4} fill="#fff" opacity={0.22} filter={url("soft")} />
            <rect x={BX} y={BY} width={BW} height={30} filter={url("grainDark")} opacity={0.05} />
            <rect x={BX} y={BY + 29} width={BW} height={1.4} fill={c.metalDeep} />
            <rect x={BX} y={BY + 30.4} width={BW} height={2.6} fill="#000" opacity={0.18} />
            {/* key icons engraved on the deck */}
            {keys.map((k) => (
              <path
                key={k.m}
                d={k.icon}
                transform={`translate(${k.x + k.w / 2} ${BY + 15.7}) scale(0.95)`}
                fill="#fff"
                opacity={0.7}
              />
            ))}
            {keys.map((k) => (
              <path
                key={k.m}
                d={k.icon}
                transform={`translate(${k.x + k.w / 2} ${BY + 15}) scale(0.95)`}
                fill={k.m === "play" ? c.accentDark : c.metalInk}
                opacity={0.85}
              />
            ))}
            {/* LED */}
            <g>
              <circle cx={62} cy={BY + 15} r={3.2} fill="#2a0d07" />
              <circle cx={62} cy={BY + 15} r={2.4} fill={playing ? "#ff5a2e" : "#5a1f14"} style={{ transition: "fill 160ms" }} />
              <circle
                cx={62}
                cy={BY + 15}
                r={9}
                fill={url("led")}
                style={{ opacity: playing ? 0.9 : 0, transition: "opacity 200ms" }}
              />
              <text x={70} y={BY + 17} fontSize={5} fill={c.metalInk} fontFamily="ui-sans-serif, system-ui, sans-serif" letterSpacing={0.8}>
                PLAY
              </text>
            </g>
            {/* MIC */}
            <g>
              <circle cx={393} cy={BY + 15} r={1.6} fill={c.metalInk} />
              <text x={399} y={BY + 17} fontSize={6} fill={c.metalInk} fontFamily="ui-sans-serif, system-ui, sans-serif" letterSpacing={0.6}>
                MIC
              </text>
              {Array.from({ length: 4 }).map((_, i) => (
                <circle key={i} cx={420 + (i % 2) * 4} cy={BY + 12 + Math.floor(i / 2) * 4} r={0.9} fill={c.metalDeep} />
              ))}
            </g>

            {/* ----------------------------- door shadow ----------------------------- */}
            <path d={roundRect(DX + 1, DY + 3, DW, DH, 8)} fill="#000" opacity={0.3} filter={url("soft")} />
          </g>

          {/* ---------------------------- cassette (window) ---------------------------- */}
          <g clipPath={url("window")}>
            <rect x={WX} y={WY} width={WW} height={WH} fill="#0e0f10" />
            {/* clear smoke shell */}
            <path d={roundRect(116, 150, 248, 140, 10)} fill="#3a3c40" opacity={0.92} />
            {/* shell screws */}
            {[
              [150, 252],
              [330, 252],
              [240, 254],
            ].map(([x, y], i) => (
              <g key={i}>
                <circle cx={x} cy={y} r={3.2} fill="#9ea3a8" />
                <path d={`M${x - 1.8} ${y} H${x + 1.8} M${x} ${y - 1.8} V${y + 1.8}`} stroke="#3a3c40" strokeWidth={0.9} />
              </g>
            ))}
            {/* trapezoid of the cassette's lower edge */}
            <path d="M176 262 L184 246 H296 L304 262" fill="none" stroke="#000" strokeOpacity={0.45} strokeWidth={1.2} />
            <path d="M176 263 L184 247 H296 L304 263" fill="none" stroke="#fff" strokeOpacity={0.08} strokeWidth={0.8} />

            {/* paper label with a hole for the cassette window */}
            <path
              d={`${roundRect(126, 156, 228, 86, 5)} ${stadium(CWX - 4, CWY - 4, CWW + 8, CWH + 8)}`}
              fillRule="evenodd"
              fill={c.label}
            />
            <rect x={126} y={188.5} width={228} height={3.5} fill={c.accent} opacity={0.9} />
            <text x={176} y={186} fontSize={11} fontWeight={800} fill={c.labelInk} fontFamily="ui-sans-serif, system-ui, sans-serif">
              A
            </text>
            <text x={304} y={185} fontSize={6} fontWeight={700} fill={c.labelInk} textAnchor="end" fontFamily="ui-sans-serif, system-ui, sans-serif" letterSpacing={0.8}>
              C-60
            </text>
            <path d="M190 182.5 H292" stroke={c.labelDark} strokeWidth={0.6} />
            <text
              x={194}
              y={181}
              fontSize={6.6}
              fill={c.labelInk}
              opacity={0.75}
              fontStyle="italic"
              fontFamily="'Segoe Print','Bradley Hand','Marker Felt',cursive"
            >
              {tapeLabel}
            </text>
            <path d={`${stadium(CWX - 4, CWY - 4, CWW + 8, CWH + 8)}`} fill="none" stroke="#000" strokeOpacity={0.25} strokeWidth={0.8} />

            {/* inside the cassette window */}
            <g clipPath={url("cwindow")}>
              <rect x={CWX} y={CWY} width={CWW} height={CWH} fill="#121212" />
              <circle ref={refs.packL} cx={HUB_L} cy={CY} r={38} fill={url("tape")} />
              <circle ref={refs.packR} cx={HUB_R} cy={CY} r={38} fill={url("tape")} />
              {/* tape running between the packs at the bottom */}
              {[
                { ref: refs.reelL, x: HUB_L },
                { ref: refs.reelR, x: HUB_R },
              ].map((h, i) => (
                <g key={i} ref={h.ref}>
                  <circle r={13} fill="#f3f1ea" />
                  <circle r={13} fill="none" stroke="#000" strokeOpacity={0.15} />
                  <circle r={9.2} fill="#1b1b1b" />
                  {Array.from({ length: 6 }).map((_, t) => (
                    <rect key={t} x={-1.3} y={-9.6} width={2.6} height={3.4} fill="#f3f1ea" transform={`rotate(${t * 60})`} />
                  ))}
                  {/* player spindle */}
                  <circle r={4.8} fill="#4a4d50" />
                  {[0, 120, 240].map((a) => (
                    <rect key={a} x={-0.9} y={-6.4} width={1.8} height={3} fill="#6c7075" transform={`rotate(${a})`} />
                  ))}
                  <circle r={1.6} fill="#2a2c2e" />
                </g>
              ))}
              {/* window plastic + length scale */}
              <rect x={CWX} y={CWY} width={CWW} height={CWH} fill="#fff" opacity={0.05} />
              {Array.from({ length: 9 }).map((_, i) => (
                <rect key={i} x={208 + i * 8} y={CWY + 2} width={0.7} height={i % 2 === 0 ? 4 : 2.5} fill="#fff" opacity={0.45} />
              ))}
              <path d={`M${CWX + 20} ${CWY + 3} L${CWX + 56} ${CWY + 3} L${CWX + 36} ${CWY + CWH - 3} L${CWX + 4} ${CWY + CWH - 3} Z`} fill="#fff" opacity={0.06} />
            </g>
          </g>

          {/* --------------------------------- door --------------------------------- */}
          <path d={`${roundRect(DX, DY, DW, DH, 8)} ${stadium(WX, WY, WW, WH)}`} fillRule="evenodd" fill={url("door")} />
          <g clipPath={url("door")}>
            <rect x={DX} y={DY} width={DW} height={DH} filter={url("grainDark")} opacity={0.07} />
            <rect x={DX} y={DY} width={DW} height={DH} filter={url("grain")} opacity={0.08} />
            <rect x={DX} y={DY} width={DW} height={DH} fill={url("ambient")} />
            <rect x={DX} y={DY + DH - 10} width={DW} height={10} fill="#000" opacity={0.06} />
          </g>
          <path d={roundRect(DX + 0.5, DY + 0.5, DW - 1, DH - 1, 7.5)} fill="none" stroke="#fff" strokeOpacity={0.55} strokeWidth={1} />
          <path d={roundRect(DX, DY, DW, DH, 8)} fill="none" stroke={c.doorDeep} strokeOpacity={0.7} strokeWidth={0.8} />
          {/* window bevel */}
          <path d={stadium(WX - 3, WY - 3, WW + 6, WH + 6)} fill="none" stroke={c.doorDark} strokeWidth={3} />
          <path d={stadium(WX - 1, WY - 1, WW + 2, WH + 2)} fill="none" stroke={c.doorDeep} strokeWidth={1.6} />
          <path d={stadium(WX - 4.5, WY - 4.5, WW + 9, WH + 9)} fill="none" stroke="#fff" strokeOpacity={0.5} strokeWidth={0.8} />
          {/* window glass reflection */}
          <g clipPath={url("window")}>
            <rect x={WX} y={WY} width={WW} height={WH} fill="#fff" opacity={0.03} />
            <path d={`M${WX + 30} ${WY} L${WX + 78} ${WY} L${WX + 34} ${WY + WH} L${WX - 14} ${WY + WH} Z`} fill="#fff" opacity={0.08} />
            <path d={`M${WX + 88} ${WY} L${WX + 98} ${WY} L${WX + 54} ${WY + WH} L${WX + 44} ${WY + WH} Z`} fill="#fff" opacity={0.06} />
            <path d={stadium(WX, WY, WW, WH)} fill="none" stroke="#000" strokeOpacity={0.5} strokeWidth={6} filter={url("soft")} />
            <rect x={WX} y={WY - 2} width={WW} height={9} fill="#000" opacity={0.3} filter={url("soft")} />
          </g>
          {/* door print */}
          <g fill={c.doorInk} fontFamily="ui-sans-serif, system-ui, sans-serif">
            <text x={DX + 14} y={DY + 22} fontSize={6.4} letterSpacing={0.9}>
              WIRELESS STEREO
            </text>
            <text x={DX + 14} y={DY + 30.5} fontSize={6.4} letterSpacing={0.9}>
              PLAYER / RECORDER
            </text>
            <text
              x={DX + DW - 14}
              y={DY + 32}
              fontSize={22}
              fontWeight={800}
              textAnchor="end"
              letterSpacing={-0.5}
              fontFamily="ui-rounded, 'SF Pro Rounded', 'Nunito', system-ui, sans-serif"
            >
              {brandName}
            </text>
            <text x={DX + 14} y={DY + DH - 14} fontSize={5.6} letterSpacing={1.4} opacity={0.85}>
              AUTO REVERSE
            </text>
            <text x={DX + DW - 14} y={DY + DH - 14} fontSize={5.6} letterSpacing={1.4} textAnchor="end" opacity={0.85}>
              TYPE I · NORMAL
            </text>
          </g>
          {/* auto-reverse direction lamps */}
          <g transform={`translate(${DX + 72} ${DY + DH - 16})`}>
            <path d="M0 0 L5 -3 V3 Z" fill={playing && dir === -1 ? c.accent : c.doorDark} style={{ transition: "fill 200ms" }} />
            <path d="M14 0 L9 -3 V3 Z" fill={playing && dir === 1 ? c.accent : c.doorDark} style={{ transition: "fill 200ms" }} />
          </g>

          {/* --------------------------- global highlights --------------------------- */}
          <g clipPath={url("body")} style={{ pointerEvents: "none" }}>
            <rect x={BX} y={BY} width={BW} height={BH} fill={url("sheen")} />
          </g>
          <path d={bodyPath} fill="none" stroke={c.casingDeep} strokeWidth={1.4} />
          <path d={roundRect(BX + 1.2, BY + 1.2, BW - 2.4, BH - 2.4, BR - 1)} fill="none" stroke="#fff" strokeOpacity={0.28} strokeWidth={0.9} />
        </svg>
      </div>
      {children}
    </div>
  );
}

export default CassettePlayer;
