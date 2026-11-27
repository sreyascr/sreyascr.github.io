import * as React from "react"
import { motion } from "motion/react"
import { Check } from "lucide-react"
import { CassettePlayer } from "@/components/ui/translucent-cassette-player"
import { SectionHead, Wrap } from "@/components/site"

/**
 * The Microphone forensics page's tape: press play on the cassette and it plays
 * a test tape built from the protocol's own steps, synthesised in the browser
 * (Web Audio, no files). Beside it, where the project stands. When the
 * recording rounds are done, real headset recordings replace the synthesised
 * sounds and the next stages light up.
 */

type Segment = { key: string; title: string; note: string; seconds: number; play: (ctx: AudioContext, out: AudioNode, t: number, d: number) => void }

const SEGMENTS: Segment[] = [
  {
    key: "click",
    title: "Start click",
    note: "Every recording opens on one click, so all files can be lined up to the same sample.",
    seconds: 2,
    play: (ctx, out, t) => {
      const len = Math.floor(ctx.sampleRate * 0.012)
      const buf = ctx.createBuffer(1, len, ctx.sampleRate)
      const ch = buf.getChannelData(0)
      for (let i = 0; i < len; i++) ch[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 3)
      const s = ctx.createBufferSource()
      s.buffer = buf
      const g = ctx.createGain()
      g.gain.value = 0.9
      s.connect(g).connect(out)
      s.start(t + 0.4)
    },
  },
  {
    key: "sweep",
    title: "Frequency sweep",
    note: "A tone rising from low to high: each headset colours it a little differently.",
    seconds: 5,
    play: (ctx, out, t, d) => {
      const o = ctx.createOscillator()
      const g = ctx.createGain()
      o.frequency.setValueAtTime(80, t)
      o.frequency.exponentialRampToValueAtTime(9000, t + d - 0.3)
      g.gain.setValueAtTime(0.0001, t)
      g.gain.exponentialRampToValueAtTime(0.12, t + 0.2)
      g.gain.setValueAtTime(0.12, t + d - 0.5)
      g.gain.exponentialRampToValueAtTime(0.0001, t + d - 0.2)
      o.connect(g).connect(out)
      o.start(t)
      o.stop(t + d)
    },
  },
  {
    key: "noise",
    title: "Broadband noise",
    note: "Equal energy across the band, so the shape a microphone adds stands out.",
    seconds: 4,
    play: (ctx, out, t, d) => {
      const len = Math.floor(ctx.sampleRate * d)
      const buf = ctx.createBuffer(1, len, ctx.sampleRate)
      const ch = buf.getChannelData(0)
      // a pinkish noise (Paul Kellet's filter), easier on the ear than white
      let b0 = 0, b1 = 0, b2 = 0
      for (let i = 0; i < len; i++) {
        const w = Math.random() * 2 - 1
        b0 = 0.99765 * b0 + w * 0.099046
        b1 = 0.963 * b1 + w * 0.2965164
        b2 = 0.57 * b2 + w * 1.0526913
        ch[i] = (b0 + b1 + b2 + w * 0.1848) * 0.11
      }
      const s = ctx.createBufferSource()
      s.buffer = buf
      const g = ctx.createGain()
      g.gain.setValueAtTime(0.0001, t)
      g.gain.exponentialRampToValueAtTime(0.5, t + 0.3)
      g.gain.setValueAtTime(0.5, t + d - 0.4)
      g.gain.exponentialRampToValueAtTime(0.0001, t + d - 0.05)
      s.connect(g).connect(out)
      s.start(t)
    },
  },
  {
    key: "quiet",
    title: "Room quiet",
    note: "No signal at all: what remains is the headset's own hiss, kept as a separate set.",
    seconds: 4,
    play: (ctx, out, t, d) => {
      const len = Math.floor(ctx.sampleRate * d)
      const buf = ctx.createBuffer(1, len, ctx.sampleRate)
      const ch = buf.getChannelData(0)
      for (let i = 0; i < len; i++) ch[i] = (Math.random() * 2 - 1) * 0.012
      const s = ctx.createBufferSource()
      s.buffer = buf
      s.connect(out)
      s.start(t)
    },
  },
]

const STAGES = [
  { title: "Recording protocol", note: "Drafted for 30 USB headsets of 10 models", done: true },
  { title: "Recording round 1", note: "10 headsets", done: false },
  { title: "Recording round 2", note: "10 headsets", done: false },
  { title: "Recording round 3", note: "10 headsets", done: false },
  { title: "Features and pre-processing", note: "SoX, LAME, Python, librosa", done: false },
  { title: "Classifier", note: "Tested on held-out sessions and unseen units", done: false },
]

function useTestTape() {
  const ctxRef = React.useRef<AudioContext | null>(null)
  const gainRef = React.useRef<GainNode | null>(null)
  const timer = React.useRef<number | null>(null)
  const [seg, setSeg] = React.useState(-1)

  const stop = React.useCallback(() => {
    if (timer.current != null) window.clearTimeout(timer.current)
    timer.current = null
    const g = gainRef.current
    const ctx = ctxRef.current
    if (g && ctx) {
      // fade out, then drop the whole chain so nothing keeps sounding
      g.gain.setTargetAtTime(0, ctx.currentTime, 0.04)
      const old = g
      window.setTimeout(() => old.disconnect(), 300)
    }
    gainRef.current = null
    setSeg(-1)
  }, [])

  const start = React.useCallback(() => {
    const Ctx = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
    if (!Ctx) return
    const ctx = ctxRef.current ?? new Ctx()
    ctxRef.current = ctx
    if (ctx.state === "suspended") void ctx.resume()
    const g = ctx.createGain()
    g.gain.value = 0.8
    g.connect(ctx.destination)
    gainRef.current = g
    const run = (i: number) => {
      if (gainRef.current !== g) return
      const s = SEGMENTS[i % SEGMENTS.length]
      setSeg(i % SEGMENTS.length)
      s.play(ctx, g, ctx.currentTime + 0.02, s.seconds)
      timer.current = window.setTimeout(() => run(i + 1), s.seconds * 1000)
    }
    run(0)
  }, [])

  React.useEffect(() => () => {
    stop()
    ctxRef.current?.close().catch(() => {})
  }, [stop])

  return { seg, start, stop }
}

export default function MicTape() {
  const { seg, start, stop } = useTestTape()
  const [size, setSize] = React.useState(520)
  const box = React.useRef<HTMLDivElement | null>(null)

  React.useEffect(() => {
    if (!box.current) return
    const ro = new ResizeObserver(([e]) => setSize(Math.min(560, Math.floor(e.contentRect.width))))
    ro.observe(box.current)
    return () => ro.disconnect()
  }, [])

  return (
    <section className="py-24">
      <Wrap>
        <SectionHead
          eyebrow="The test tape"
          title="Press play on the protocol"
          note="Click the player for an illustration of a recording session: the start click the files are aligned on, two test signals, and the quiet part kept as its own set. The sounds are synthesised in your browser for now; real headset recordings replace them as the rounds are done."
        />
        <div className="mt-12 grid items-start gap-12 lg:grid-cols-12">
          <div ref={box} className="lg:col-span-7">
            <div className="overflow-hidden rounded-lg bg-secondary">
              <CassettePlayer
                size={size}
                casingColor="#1E40AF"
                casingOpacity={0.5}
                accentColor="#D97706"
                cassetteLabelColor="#F8FAFC"
                backgroundColor="#E9EEF6"
                brandName="OvGU"
                tapeLabel="test tape — round 0"
                initialProgress={0.15}
                onPlayingChange={(on) => (on ? start() : stop())}
              />
            </div>
          </div>

          <div className="space-y-10 lg:col-span-5">
            <div>
              <p className="eyebrow text-muted-foreground">On the tape</p>
              <ol className="mt-4 space-y-2" aria-live="polite">
                {SEGMENTS.map((s, i) => (
                  <li
                    key={s.key}
                    className={
                      "relative overflow-hidden rounded-md border p-4 transition-colors " +
                      (seg === i ? "border-primary bg-card" : "border-border bg-transparent")
                    }
                    aria-current={seg === i ? "true" : undefined}
                  >
                    {seg === i && (
                      <motion.span
                        key={"bar" + i + "-" + seg}
                        aria-hidden="true"
                        className="absolute inset-y-0 left-0 bg-amber/15"
                        initial={{ width: "0%" }}
                        animate={{ width: "100%" }}
                        transition={{ duration: s.seconds, ease: "linear" }}
                      />
                    )}
                    <div className="relative flex items-baseline justify-between gap-4">
                      <span className="font-semibold text-ink">
                        {String(i + 1).padStart(2, "0")} · {s.title}
                      </span>
                      <span className="eyebrow text-muted-foreground">{s.seconds}s</span>
                    </div>
                    <p className="relative mt-1 text-sm leading-relaxed text-muted-foreground">{s.note}</p>
                  </li>
                ))}
              </ol>
            </div>

            <div>
              <p className="eyebrow text-muted-foreground">Where the project is</p>
              <ol className="mt-4 border-l-2 border-border">
                {STAGES.map((s, i) => (
                  <li key={s.title} className="relative pb-5 pl-6 last:pb-0">
                    <span
                      className={
                        "absolute -left-[9px] top-0.5 inline-flex size-4 items-center justify-center rounded-full border-2 " +
                        (s.done ? "border-primary bg-primary text-white" : i === 1 ? "border-amber bg-background" : "border-border bg-background")
                      }
                      aria-hidden="true"
                    >
                      {s.done && <Check className="size-2.5" />}
                    </span>
                    <p className={"font-semibold " + (s.done ? "text-ink" : "text-muted-foreground")}>
                      {s.title}
                      {i === 1 && <span className="eyebrow ml-2 text-[#B45309]">Next</span>}
                    </p>
                    <p className="text-sm text-muted-foreground">{s.note}</p>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </div>
      </Wrap>
    </section>
  )
}
