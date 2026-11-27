import * as React from "react"
import { motion, useMotionValue, useReducedMotion, useSpring, useTransform } from "motion/react"

/**
 * Watch: the Interests page's watches note. A dial that keeps the visitor's
 * time (the seconds hand steps eight times a second, as a mechanical movement
 * beats), and a click turns it over to an exhibition caseback where the
 * balance wheel swings, the escape wheel ticks and the train turns. Leans
 * toward the pointer like the knight. All drawn here, no images.
 */

const C = { ink: "#0B1640", navy: "#1E3A8A", cream: "#F4F1EA", amber: "#D97706", blued: "#2445A8", ruby: "#B3122E", gilt: "#C9A24A" }

function gear(cx: number, cy: number, r: number, teeth: number, depth = 3.2) {
  // a wheel outline with trapezoid teeth
  const pts: string[] = []
  const step = (Math.PI * 2) / teeth
  for (let i = 0; i < teeth; i++) {
    const a = i * step
    const p = (ang: number, rad: number) => `${(cx + Math.cos(ang) * rad).toFixed(2)},${(cy + Math.sin(ang) * rad).toFixed(2)}`
    pts.push(p(a, r - depth), p(a + step * 0.18, r), p(a + step * 0.5, r), p(a + step * 0.68, r - depth))
  }
  return "M" + pts.join("L") + "Z"
}

function Case({ uid, children }: { uid: string; children: React.ReactNode }) {
  return (
    <>
      {/* strap, lugs and crown */}
      <rect x="140" y="0" width="120" height="110" rx="10" fill={C.ink} />
      <rect x="140" y="370" width="120" height="110" rx="10" fill={C.ink} />
      <path d="M152 0 V100 M248 0 V100 M152 380 V480 M248 380 V480" stroke="#F4F1EA" strokeOpacity="0.35" strokeWidth="1.4" strokeDasharray="5 5" />
      <rect x="128" y="86" width="144" height="34" rx="12" fill={`url(#${uid}steel)`} />
      <rect x="128" y="360" width="144" height="34" rx="12" fill={`url(#${uid}steel)`} />
      <rect x="342" y="224" width="22" height="32" rx="5" fill={`url(#${uid}steel)`} />
      {Array.from({ length: 6 }, (_, i) => (
        <line key={i} x1="346" x2="360" y1={228 + i * 5} y2={228 + i * 5} stroke="#6B7280" strokeWidth="1" />
      ))}
      {/* case and bezel */}
      <circle cx="200" cy="240" r="152" fill={`url(#${uid}steel)`} />
      <circle cx="200" cy="240" r="152" fill="none" stroke="#7C8594" strokeWidth="1.5" />
      <circle cx="200" cy="240" r="140" fill={`url(#${uid}bezel)`} />
      {children}
      {/* the crystal's reflection */}
      <path d="M95 175 A120 120 0 0 1 230 118" fill="none" stroke="#FFFFFF" strokeOpacity="0.55" strokeWidth="7" strokeLinecap="round" />
      <path d="M300 300 A120 120 0 0 1 270 340" fill="none" stroke="#FFFFFF" strokeOpacity="0.25" strokeWidth="4" strokeLinecap="round" />
    </>
  )
}

function Defs({ uid }: { uid: string }) {
  return (
    <defs>
      <linearGradient id={uid + "steel"} x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stopColor="#F3F4F6" />
        <stop offset="0.45" stopColor="#B8BEC9" />
        <stop offset="0.7" stopColor="#E5E7EB" />
        <stop offset="1" stopColor="#8A93A3" />
      </linearGradient>
      <radialGradient id={uid + "bezel"} cx="0.4" cy="0.35" r="0.75">
        <stop offset="0.85" stopColor="#D1D5DB" />
        <stop offset="1" stopColor="#6B7280" />
      </radialGradient>
      <radialGradient id={uid + "dial"} cx="0.45" cy="0.4" r="0.7">
        <stop offset="0" stopColor="#FBF9F4" />
        <stop offset="1" stopColor="#E7E1D3" />
      </radialGradient>
      <radialGradient id={uid + "plate"} cx="0.4" cy="0.35" r="0.8">
        <stop offset="0" stopColor="#E8E9EC" />
        <stop offset="1" stopColor="#A7ADB8" />
      </radialGradient>
      <pattern id={uid + "geneva"} width="14" height="14" patternUnits="userSpaceOnUse" patternTransform="rotate(-30)">
        <rect width="14" height="7" fill="#FFFFFF" fillOpacity="0.16" />
      </pattern>
      <clipPath id={uid + "inner"}>
        <circle cx="200" cy="240" r="130" />
      </clipPath>
    </defs>
  )
}

const hand = (len: number, w: number, tail: number) => `M200 ${240 + tail} L${200 - w} 240 L200 ${240 - len} L${200 + w} 240 Z`

function Dial({ uid, hourRef, minRef, secRef, day }: { uid: string; hourRef: React.Ref<SVGGElement>; minRef: React.Ref<SVGGElement>; secRef: React.Ref<SVGGElement>; day: number }) {
  return (
    <Case uid={uid}>
      <circle cx="200" cy="240" r="132" fill={`url(#${uid}dial)`} />
      {/* minute track and hour batons */}
      {Array.from({ length: 60 }, (_, i) => {
        const a = (i * Math.PI) / 30
        const r1 = i % 5 ? 124 : 120
        return (
          <line key={i} x1={200 + Math.sin(a) * r1} y1={240 - Math.cos(a) * r1} x2={200 + Math.sin(a) * 128} y2={240 - Math.cos(a) * 128} stroke={C.ink} strokeWidth={i % 5 ? 1 : 2} />
        )
      })}
      {Array.from({ length: 12 }, (_, i) => {
        if (i === 3) return null // the date window sits at 3
        const a = (i * Math.PI) / 6
        const off = i === 0 ? [-5, 5] : [0]
        return off.map((o) => (
          <rect
            key={i + "-" + o}
            x={196 + o}
            y={124}
            width={8}
            height={i === 0 ? 26 : 22}
            rx={1.5}
            fill={C.navy}
            transform={`rotate(${(a * 180) / Math.PI} 200 240)`}
          />
        ))
      })}
      <text x="200" y="182" textAnchor="middle" fontFamily="Anton, Impact, sans-serif" fontSize="20" letterSpacing="3" fill={C.ink}>
        BERLIN
      </text>
      <text x="200" y="306" textAnchor="middle" fontFamily="'Inter Tight', sans-serif" fontSize="10" fontWeight="700" letterSpacing="3" fill={C.amber}>
        AUTOMATIC
      </text>
      <text x="200" y="320" textAnchor="middle" fontFamily="'Inter Tight', sans-serif" fontSize="8" fontWeight="600" letterSpacing="2" fill={C.navy} fillOpacity="0.7">
        25 JEWELS
      </text>
      {/* date window */}
      <rect x="282" y="229" width="34" height="22" rx="2" fill="#FFFFFF" stroke={C.ink} strokeWidth="1.5" />
      <text x="299" y="245" textAnchor="middle" fontFamily="'Inter Tight', sans-serif" fontSize="14" fontWeight="700" fill={C.ink}>
        {day}
      </text>
      {/* hands */}
      <g ref={hourRef}>
        <path d={hand(72, 7, 14)} fill={C.ink} />
        <path d={hand(64, 2.2, 0)} fill="#FFFFFF" fillOpacity="0.35" />
      </g>
      <g ref={minRef}>
        <path d={hand(110, 5.5, 16)} fill={C.ink} />
        <path d={hand(100, 1.6, 0)} fill="#FFFFFF" fillOpacity="0.35" />
      </g>
      <g ref={secRef}>
        <line x1="200" y1="270" x2="200" y2="114" stroke={C.amber} strokeWidth="1.8" />
        <circle cx="200" cy="262" r="5" fill={C.amber} />
      </g>
      <circle cx="200" cy="240" r="6" fill={C.ink} />
      <circle cx="200" cy="240" r="2.2" fill={C.amber} />
    </Case>
  )
}

function Movement({ uid, running }: { uid: string; running: boolean }) {
  const st = (dur: string, more = "") =>
    ({
      transformBox: "fill-box",
      transformOrigin: "center",
      animation: `${dur}${more}`,
      animationPlayState: running ? "running" : "paused",
    }) as React.CSSProperties
  const jewel = (x: number, y: number, r = 3.2) => (
    <g key={x + "," + y}>
      <circle cx={x} cy={y} r={r + 1.6} fill="#E5E7EB" />
      <circle cx={x} cy={y} r={r} fill={C.ruby} />
      <circle cx={x - r * 0.35} cy={y - r * 0.35} r={r * 0.35} fill="#FFFFFF" fillOpacity="0.7" />
    </g>
  )
  const screw = (x: number, y: number, a: number) => (
    <g key={"s" + x + y}>
      <circle cx={x} cy={y} r="5" fill={C.blued} />
      <line x1={x - 4} y1={y} x2={x + 4} y2={y} stroke="#0B1640" strokeWidth="1.4" transform={`rotate(${a} ${x} ${y})`} />
    </g>
  )
  return (
    <Case uid={uid}>
      <circle cx="200" cy="240" r="132" fill="#1F2937" />
      <g clipPath={`url(#${uid}inner)`}>
        <circle cx="200" cy="240" r="130" fill={`url(#${uid}plate)`} />
        <circle cx="200" cy="240" r="130" fill={`url(#${uid}geneva)`} />
        {/* the train: centre, third and fourth wheels, escape wheel */}
        <path d={gear(232, 186, 36, 40)} fill={C.gilt} stroke="#8A6D2A" strokeWidth="0.8" style={st("wt-spin 30s linear infinite")} />
        <path d={gear(166, 176, 26, 30)} fill={C.gilt} stroke="#8A6D2A" strokeWidth="0.8" style={st("wt-spin 12s linear infinite reverse")} />
        <path d={gear(262, 262, 20, 24)} fill={C.gilt} stroke="#8A6D2A" strokeWidth="0.8" style={st("wt-spin 6s linear infinite")} />
        <path d={gear(232, 300, 15, 15, 4.5)} fill="#D8DCE3" stroke="#6B7280" strokeWidth="0.8" style={st("wt-spin 3.75s steps(30) infinite reverse")} />
        {/* slim bridges over the train, each carrying its wheels' jewels */}
        <path d="M112 150 Q190 132 300 176 L292 196 Q190 156 118 172 Z" fill="#C9CDD5" stroke="#8A93A3" strokeWidth="1" />
        <path d="M112 150 Q190 132 300 176 L292 196 Q190 156 118 172 Z" fill={`url(#${uid}geneva)`} />
        <path d="M244 254 Q286 262 318 304 L304 318 Q276 284 238 272 Z" fill="#C9CDD5" stroke="#8A93A3" strokeWidth="1" />
        {/* balance cock and the balance wheel with its hairspring */}
        <path d="M80 330 Q120 250 175 282 L160 312 Q120 300 102 352 Z" fill="#C9CDD5" stroke="#8A93A3" strokeWidth="1" />
        <g style={st("wt-swing 0.42s ease-in-out infinite alternate")}>
          <circle cx="142" cy="318" r="40" fill="none" stroke={C.gilt} strokeWidth="6" />
          {[0, 120, 240].map((a) => (
            <line key={a} x1="142" y1="318" x2={142 + Math.cos((a * Math.PI) / 180) * 38} y2={318 + Math.sin((a * Math.PI) / 180) * 38} stroke={C.gilt} strokeWidth="3" />
          ))}
          {Array.from({ length: 8 }, (_, i) => (
            <circle key={i} cx={142 + Math.cos((i * Math.PI) / 4) * 40} cy={318 + Math.sin((i * Math.PI) / 4) * 40} r="2" fill="#8A6D2A" />
          ))}
        </g>
        <path
          d={Array.from({ length: 90 }, (_, i) => {
            const t = i / 89
            const a = t * Math.PI * 9
            const r = 3 + t * 22
            return (i ? "L" : "M") + (142 + Math.cos(a) * r).toFixed(1) + " " + (318 + Math.sin(a) * r).toFixed(1)
          }).join(" ")}
          fill="none"
          stroke="#3B4A6B"
          strokeWidth="0.8"
          style={st("wt-breathe 0.42s ease-in-out infinite alternate")}
        />
        {jewel(142, 318, 3.6)}
        {jewel(232, 170)}
        {jewel(166, 158)}
        {jewel(262, 262)}
        {jewel(232, 300)}
        {jewel(200, 240, 4)}
        {screw(124, 160, 20)}
        {screw(288, 184, -40)}
        {screw(306, 306, 60)}
        {screw(96, 336, 10)}
        <text x="234" y="338" textAnchor="middle" fontFamily="'Inter Tight', sans-serif" fontSize="9" fontWeight="700" letterSpacing="2.5" fill="#4B5563">
          25 JEWELS
        </text>
      </g>
      <circle cx="200" cy="240" r="132" fill="none" stroke="#9CA3AF" strokeWidth="3" />
    </Case>
  )
}

export function Watch({ className }: { className?: string }) {
  const reduce = useReducedMotion()
  const uid = "w" + React.useId().replace(/[^a-zA-Z0-9]/g, "")
  const [back, setBack] = React.useState(false)
  const [day, setDay] = React.useState(() => new Date().getDate())
  const hourRef = React.useRef<SVGGElement | null>(null)
  const minRef = React.useRef<SVGGElement | null>(null)
  const secRef = React.useRef<SVGGElement | null>(null)
  const box = React.useRef<HTMLButtonElement | null>(null)
  const [visible, setVisible] = React.useState(false)

  // tilt toward the pointer
  const px = useMotionValue(0)
  const py = useMotionValue(0)
  const sx = useSpring(px, { stiffness: 160, damping: 20 })
  const sy = useSpring(py, { stiffness: 160, damping: 20 })
  const tiltY = useTransform(sx, [-0.5, 0.5], [-14, 14])
  const tiltX = useTransform(sy, [-0.5, 0.5], [10, -10])

  React.useEffect(() => {
    if (!box.current) return
    const io = new IntersectionObserver(([e]) => setVisible(e.isIntersecting))
    io.observe(box.current)
    return () => io.disconnect()
  }, [])

  // the hands: eight beats a second, the way a 28,800 vph movement steps
  React.useEffect(() => {
    if (!visible) return
    let raf = 0
    const set = (el: SVGGElement | null, deg: number) => el?.setAttribute("transform", `rotate(${deg.toFixed(2)} 200 240)`)
    const tick = () => {
      const d = new Date()
      const s = d.getSeconds() + (reduce ? 0 : Math.floor(d.getMilliseconds() / 125) / 8)
      const m = d.getMinutes() + s / 60
      const h = (d.getHours() % 12) + m / 60
      set(secRef.current, s * 6)
      set(minRef.current, m * 6)
      set(hourRef.current, h * 30)
      if (d.getDate() !== day) setDay(d.getDate())
      raf = requestAnimationFrame(tick)
    }
    tick()
    return () => cancelAnimationFrame(raf)
  }, [visible, reduce, day])

  const onMove = (e: React.PointerEvent<HTMLButtonElement>) => {
    if (reduce || e.pointerType === "touch") return
    const r = e.currentTarget.getBoundingClientRect()
    px.set((e.clientX - r.left) / r.width - 0.5)
    py.set((e.clientY - r.top) / r.height - 0.5)
  }

  const face = "absolute inset-0 [backface-visibility:hidden] [-webkit-backface-visibility:hidden]"
  return (
    <button
      ref={box}
      type="button"
      onClick={() => setBack((b) => !b)}
      onPointerMove={onMove}
      onPointerLeave={() => {
        px.set(0)
        py.set(0)
      }}
      aria-pressed={back}
      aria-label={back ? "A mechanical watch, turned over to show its movement. Press to turn it back to the dial." : "A mechanical watch showing your current time. Press to turn it over and see the movement."}
      title={back ? "Click to turn it back" : "Click to turn it over"}
      className={"relative block w-full cursor-pointer rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-4 " + (className ?? "")}
      style={{ perspective: 1200, aspectRatio: "400 / 480" }}
    >
      <style>{`
        @keyframes wt-spin { to { transform: rotate(360deg) } }
        @keyframes wt-swing { from { transform: rotate(-150deg) } to { transform: rotate(150deg) } }
        @keyframes wt-breathe { from { transform: rotate(-30deg) scale(0.97) } to { transform: rotate(30deg) scale(1.03) } }
        @media (prefers-reduced-motion: reduce) { .wt-movement * { animation: none !important } }
      `}</style>
      <motion.div className="absolute inset-0" style={{ rotateX: tiltX, rotateY: tiltY, transformStyle: "preserve-3d" }}>
        <motion.div
          className="absolute inset-0"
          style={{ transformStyle: "preserve-3d" }}
          animate={{ rotateY: back ? 180 : 0 }}
          transition={reduce ? { duration: 0 } : { type: "spring", stiffness: 70, damping: 14 }}
        >
          <svg className={face + " size-full drop-shadow-[0_24px_30px_rgba(11,22,64,0.35)]"} viewBox="0 0 400 480" aria-hidden="true">
            <Defs uid={uid} />
            <Dial uid={uid} hourRef={hourRef} minRef={minRef} secRef={secRef} day={day} />
          </svg>
          <svg className={face + " wt-movement size-full drop-shadow-[0_24px_30px_rgba(11,22,64,0.35)]"} style={{ transform: "rotateY(180deg)" }} viewBox="0 0 400 480" aria-hidden="true">
            <Defs uid={uid + "b"} />
            <Movement uid={uid + "b"} running={back && visible} />
          </svg>
        </motion.div>
      </motion.div>
    </button>
  )
}
