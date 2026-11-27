import * as React from "react"
import { AnimatePresence, motion, useAnimate, useMotionValue, useReducedMotion, useSpring, useTransform } from "motion/react"

/**
 * ChessKnight: the hero's portrait slot. An ivory knight (Colin M.L. Burnett's
 * piece, BSD licence) standing on a dark board. It turns toward the pointer in
 * 3D; a click (or Enter / Space) makes a knight's move: the L lights up in
 * amber, the piece hops and faces its new way, and the move is written in
 * chess notation in the corner.
 */

const COLS = 4
const ROWS = 5
const FILES = "abcd"
const MOVES: [number, number][] = [
  [1, -2], [-1, -2], [2, -1], [-2, -1], [1, 2], [-1, 2], [2, 1], [-2, 1],
]

// Cburnett's white knight (Wikimedia Commons, Chess_nlt45.svg), 45 x 45
const BODY = "M 22,10 C 32.5,11 38.5,18 38,39 L 15,39 C 15,30 25,32.5 23,18"
const HEAD =
  "M 24,18 C 24.38,20.91 18.45,25.37 16,27 C 13,29 13.18,31.34 11,31 C 9.958,30.06 12.41,27.96 11,28 " +
  "C 10,28 11.19,29.23 10,30 C 9,30 5.997,31 6,26 C 6,24 12,14 12,14 C 12,14 13.89,12.1 14,10.5 " +
  "C 13.27,9.506 13.5,8.5 13.5,7.5 C 14.5,6.5 16.5,10 16.5,10 L 18.5,10 C 18.5,10 19.28,8.008 21,7 C 22,7 22,10 22,10"

export interface ChessKnightProps {
  className?: string
}

const sq = (x: number, y: number) => FILES[x] + (ROWS - y)

export function ChessKnight({ className }: ChessKnightProps) {
  const reduce = useReducedMotion()
  const uid = React.useId().replace(/[^a-zA-Z0-9]/g, "")
  const [scope, animate] = useAnimate()
  const [pos, setPos] = React.useState<[number, number]>([1, 3])
  const [trail, setTrail] = React.useState<[number, number][]>([])
  const [facing, setFacing] = React.useState<1 | -1>(1)
  const [last, setLast] = React.useState<string | null>(null)
  const [moves, setMoves] = React.useState(0)
  const busy = React.useRef(false)

  // pointer: the piece turns toward it, the light moves with it
  const px = useMotionValue(0)
  const py = useMotionValue(0)
  const sx = useSpring(px, { stiffness: 180, damping: 20 })
  const sy = useSpring(py, { stiffness: 180, damping: 20 })
  const rotateY = useTransform(sx, [-0.5, 0.5], [-28, 28])
  const rotateX = useTransform(sy, [-0.5, 0.5], [10, -10])
  const glowX = useTransform(sx, [-0.5, 0.5], [20, 80])
  const glowY = useTransform(sy, [-0.5, 0.5], [15, 70])
  const glow = useTransform(
    [glowX, glowY],
    ([x, y]) => `radial-gradient(120% 90% at ${x}% ${y}%, rgba(255,214,150,0.28), rgba(255,214,150,0) 55%)`,
  )

  const onMove = (e: React.PointerEvent<HTMLButtonElement>) => {
    if (reduce || e.pointerType === "touch") return
    const r = e.currentTarget.getBoundingClientRect()
    px.set((e.clientX - r.left) / r.width - 0.5)
    py.set((e.clientY - r.top) / r.height - 0.5)
  }
  const onLeave = () => {
    px.set(0)
    py.set(0)
  }

  const hop = async () => {
    if (busy.current) return
    busy.current = true
    const legal = MOVES.filter(([dx, dy]) => {
      const x = pos[0] + dx
      const y = pos[1] + dy
      return x >= 0 && x < COLS && y >= 0 && y < ROWS
    })
    const [dx, dy] = legal[Math.floor(Math.random() * legal.length)]
    const longX = Math.abs(dx) === 2
    const mid: [number, number] = longX ? [pos[0] + Math.sign(dx), pos[1]] : [pos[0], pos[1] + Math.sign(dy)]
    const corner: [number, number] = longX ? [pos[0] + dx, pos[1]] : [pos[0], pos[1] + dy]
    const to: [number, number] = [pos[0] + dx, pos[1] + dy]
    setTrail([pos, mid, corner, to])
    const face: 1 | -1 = dx < 0 ? 1 : -1
    if (!reduce) {
      await animate(
        "[data-piece]",
        { y: ["0%", "-16%", "2%", "0%"], scaleY: [1, 1.06, 0.92, 1], rotate: [0, -6 * face, 3 * face, 0] },
        { duration: 0.6, ease: [0.3, 0.7, 0.3, 1], times: [0, 0.45, 0.8, 1] },
      )
    }
    setFacing(face)
    setPos(to)
    setLast("N" + sq(to[0], to[1]))
    setMoves((m) => m + 1)
    window.setTimeout(() => setTrail([]), 900)
    busy.current = false
  }

  return (
    <button
      ref={scope}
      type="button"
      onPointerMove={onMove}
      onPointerLeave={onLeave}
      onClick={hop}
      aria-label={`A chess knight, my favourite piece. Press to make a knight's move.${last ? ` Last move ${last}, ${moves} so far.` : ""}`}
      title="My favourite piece. Click it to make a move."
      className={
        "group relative block size-full cursor-pointer overflow-hidden bg-[#0B1A4A] outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#F59E0B] " +
        (className ?? "")
      }
      style={{ perspective: 600 }}
    >
      {/* the board: hairline squares, the knight's L in amber */}
      <svg aria-hidden="true" className="absolute inset-0 size-full" viewBox={`0 0 ${COLS * 10} ${ROWS * 10}`} preserveAspectRatio="none">
        {Array.from({ length: COLS * ROWS }, (_, i) => {
          const x = i % COLS
          const y = Math.floor(i / COLS)
          const k = trail.findIndex(([a, b]) => a === x && b === y)
          return (
            <motion.rect
              key={i}
              x={x * 10}
              y={y * 10}
              width={10}
              height={10}
              initial={false}
              animate={{
                fill: k >= 0 ? (k === trail.length - 1 ? "#F59E0B" : "#D97706") : (x + y) % 2 ? "#12266A" : "#0B1A4A",
                fillOpacity: k >= 0 ? (k === trail.length - 1 ? 0.85 : 0.45) : 1,
              }}
              transition={{ duration: k >= 0 ? 0.14 : 0.5, delay: k >= 0 ? k * 0.1 : 0 }}
            />
          )
        })}
        {Array.from({ length: COLS - 1 }, (_, i) => (
          <line key={"v" + i} x1={(i + 1) * 10} y1={0} x2={(i + 1) * 10} y2={ROWS * 10} stroke="#FFFFFF" strokeOpacity={0.07} strokeWidth={0.15} />
        ))}
        {Array.from({ length: ROWS - 1 }, (_, i) => (
          <line key={"h" + i} x1={0} y1={(i + 1) * 10} x2={COLS * 10} y2={(i + 1) * 10} stroke="#FFFFFF" strokeOpacity={0.07} strokeWidth={0.15} />
        ))}
      </svg>

      {/* warm light that follows the pointer, and a shadow pooled at the foot */}
      <motion.span aria-hidden="true" className="pointer-events-none absolute inset-0" style={{ background: glow }} />
      <span aria-hidden="true" className="pointer-events-none absolute inset-0 bg-[radial-gradient(90%_60%_at_50%_100%,rgba(0,0,0,0.45),transparent_70%)]" />

      {/* the piece */}
      <motion.span
        aria-hidden="true"
        className="absolute inset-x-0 bottom-[7%] mx-auto block h-[76%] w-[86%]"
        style={{ rotateY, rotateX, transformStyle: "preserve-3d" }}
      >
        <motion.span data-piece="" className="block size-full" style={{ transformOrigin: "50% 100%" }}>
          <motion.svg
            viewBox="2 4 42 39"
            className="size-full overflow-visible drop-shadow-[0_10px_14px_rgba(0,0,0,0.5)]"
            animate={{ scaleX: facing }}
            transition={{ duration: reduce ? 0 : 0.35, ease: [0.2, 0.75, 0.2, 1] }}
          >
            <defs>
              <linearGradient id={uid + "iv"} x1="0" y1="0" x2="1" y2="1">
                <stop offset="0" stopColor="#FFFDF7" />
                <stop offset="0.55" stopColor="#F1EADB" />
                <stop offset="1" stopColor="#CFC4AE" />
              </linearGradient>
              <linearGradient id={uid + "sh"} x1="0" y1="0" x2="1" y2="0">
                <stop offset="0.55" stopColor="#000" stopOpacity="0" />
                <stop offset="1" stopColor="#1E3A8A" stopOpacity="0.28" />
              </linearGradient>
            </defs>
            <ellipse cx="26.5" cy="39.6" rx="13.5" ry="1.6" fill="#000" fillOpacity="0.35" />
            <g stroke="#0B1640" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round">
              <path d={BODY} fill={`url(#${uid}iv)`} />
              <path d={HEAD} fill={`url(#${uid}iv)`} />
            </g>
            {/* shade on the back of the neck, and highlights down the face and the mane */}
            <path d={BODY} fill={`url(#${uid}sh)`} />
            <path d="M 13.2,12.6 C 11.6,15.8 9.2,20.4 7.6,24.2" fill="none" stroke="#FFFFFF" strokeOpacity="0.85" strokeWidth="0.9" strokeLinecap="round" />
            <path d="M 24.8,13.2 C 29.6,15.4 33.6,20.6 35.2,30" fill="none" stroke="#FFFFFF" strokeOpacity="0.5" strokeWidth="0.8" strokeLinecap="round" />
            <circle cx="9" cy="25.5" r="0.6" fill="#0B1640" />
            <ellipse cx="14.5" cy="15.5" rx="0.55" ry="1.5" transform="matrix(0.866,0.5,-0.5,0.866,9.693,-5.173)" fill="#0B1640" />
          </motion.svg>
        </motion.span>
      </motion.span>

      {/* the last move, in notation */}
      <AnimatePresence>
        {last && (
          <motion.span
            key={last + moves}
            aria-hidden="true"
            className="absolute left-[7%] top-[5%] font-mono text-[clamp(9px,1.1vw,14px)] font-semibold tracking-wide text-[#F59E0B]"
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            {moves}. {last}
          </motion.span>
        )}
      </AnimatePresence>
    </button>
  )
}
