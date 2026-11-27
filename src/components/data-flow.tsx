import * as React from "react"
import { cn } from "@/lib/utils"
import { iconSrc } from "@/lib/data"
import type { Flow } from "@/lib/flows"

/**
 * DataFlow: a build's pipeline, stage by stage. A packet runs along each link
 * in turn and every stage lights as it arrives, on one 5 s loop shared by all
 * diagrams. The loop only runs while the diagram is on screen, and not at all
 * under reduced motion. Below md the stages stack and the links go vertical.
 */

const LOOP = 5 // seconds
const HOP = 0.7 // seconds from one stage to the next

const CSS = `
@keyframes df-lit { 0% { box-shadow: 0 0 0 0 rgba(217,119,6,0); border-color: var(--border) }
  4% { box-shadow: 0 0 0 4px rgba(217,119,6,.22); border-color: #D97706 }
  16% { box-shadow: 0 0 0 0 rgba(217,119,6,0); border-color: var(--border) } 100% { border-color: var(--border) } }
@keyframes df-run-x { 0% { left: 0; opacity: 0 } 1% { opacity: 1 } 12% { left: calc(100% - 8px); opacity: 1 } 14%, 100% { left: calc(100% - 8px); opacity: 0 } }
@keyframes df-run-y { 0% { top: 0; opacity: 0 } 1% { opacity: 1 } 12% { top: calc(100% - 8px); opacity: 1 } 14%, 100% { top: calc(100% - 8px); opacity: 0 } }
.df[data-on="false"] * { animation-play-state: paused !important }
@media (prefers-reduced-motion: reduce) { .df * { animation: none !important } }
`

export function DataFlow({ flow, className, compact }: { flow: Flow; className?: string; compact?: boolean }) {
  const ref = React.useRef<HTMLDivElement | null>(null)
  const [on, setOn] = React.useState(false)
  React.useEffect(() => {
    if (!ref.current) return
    const io = new IntersectionObserver(([e]) => setOn(e.isIntersecting), { threshold: 0.2 })
    io.observe(ref.current)
    return () => io.disconnect()
  }, [])
  const n = flow.stages.length

  return (
    <div
      ref={ref}
      data-on={on}
      className={cn("df flex h-full flex-col rounded-lg border border-border bg-card p-6", className)}
      role="img"
      aria-label={`How the data flows: ${flow.stages.map((s) => `${s.step}, ${s.label} (${s.note})`).join("; then ")}.`}
    >
      <style>{CSS}</style>
      <div aria-hidden="true">
        <p className="eyebrow text-muted-foreground">How the data flows</p>
        <p className={cn("mt-2 font-bold text-ink", compact ? "text-lg" : "text-xl")}>{flow.title}</p>
      </div>
      <ol aria-hidden="true" className="mt-6 flex flex-1 flex-col items-stretch md:flex-row md:items-center">
        {flow.stages.map((s, i) => (
          <React.Fragment key={s.step}>
            <li
              className="flex min-w-0 flex-1 items-start gap-3 self-stretch rounded-md border border-border bg-background p-3 md:max-h-56 md:flex-col md:gap-2 md:self-center md:[height:100%]"
              style={{ animation: `df-lit ${LOOP}s ${i * HOP}s infinite` }}
            >
              <span className="inline-flex size-9 shrink-0 items-center justify-center rounded-md bg-secondary">
                <img src={iconSrc(s.icon)!} alt="" width={20} height={20} className="size-5" />
              </span>
              <span className="min-w-0">
                <span className="eyebrow block text-[11px] text-[#B45309]">{s.step}</span>
                <span className="mt-1 block text-sm font-semibold leading-snug text-ink">{s.label}</span>
                <span className="mt-1 block text-xs leading-snug text-muted-foreground">{s.note}</span>
              </span>
            </li>
            {i < n - 1 && (
              <li className="relative mx-auto h-6 w-px shrink-0 bg-primary/25 md:mx-0 md:h-px md:w-6" aria-hidden="true">
                <span
                  className="absolute left-1/2 size-2 -translate-x-1/2 rounded-full bg-amber md:hidden"
                  style={{ animation: `df-run-y ${LOOP}s ${i * HOP + 0.1}s infinite` }}
                />
                <span
                  className="absolute top-1/2 hidden size-2 -translate-y-1/2 rounded-full bg-amber md:block"
                  style={{ animation: `df-run-x ${LOOP}s ${i * HOP + 0.1}s infinite` }}
                />
              </li>
            )}
          </React.Fragment>
        ))}
      </ol>
    </div>
  )
}
