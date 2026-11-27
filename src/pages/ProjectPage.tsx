import * as React from "react"
import { Link, Navigate, useParams } from "react-router-dom"
import { ArrowLeft, ArrowRight, Check, Mail } from "lucide-react"
import { ButtonLink, PageHero, Picture, Reveal, SectionHead, ToolChip, Wrap } from "@/components/site"
import { GROUPS, MAILTO, PROFILE, hasPage, photoFile, projectBySlug, projects, type Project } from "@/lib/data"
import NotFound from "@/pages/NotFound"
import { DataFlow } from "@/components/data-flow"
import { FLOWS } from "@/lib/flows"

// pages that carry a component of their own below the write-up
const EXTRAS: Record<string, React.LazyExoticComponent<React.ComponentType>> = {
  "sales-dashboard": React.lazy(() => import("@/components/sales-gallery")),
  "mic-forensics": React.lazy(() => import("@/components/mic-tape")),
}

export default function ProjectPage() {
  const { slug } = useParams()
  // "next project" follows the projects page: data engineering builds first
  const order = GROUPS.flatMap((g) => g.slugs).filter(hasPage)
  const i = order.indexOf(slug ?? "")
  const p = i >= 0 ? projectBySlug(order[i]) : undefined
  React.useEffect(() => {
    if (p) document.title = `${p.name} · ${PROFILE.name}`
  }, [p])
  // links to the old static pages (/projects/ais.html) move to the clean path
  if (slug?.endsWith(".html")) return <Navigate to={`/projects/${slug.slice(0, -5)}`} replace />
  // Audible work has a card on the projects page but no page of its own
  if (slug && projectBySlug(slug) && !hasPage(slug)) return <Navigate to="/projects#audible" replace />
  if (!p) return <NotFound />
  const next = projectBySlug(order[(i + 1) % order.length])!
  const Extra = EXTRAS[p.slug]

  return (
    <main id="main">
      <PageHero
        eyebrow={`${p.context}${p.when ? " · " + p.when : ""}`}
        title={p.title}
        lead={p.oneLine}
        media={<Picture file={photoFile(p)} alt={p.coverAlt} eager sizes="(min-width: 1024px) 40vw, 100vw" />}
      >
        <span className="eyebrow inline-flex min-h-11 items-center rounded-md bg-white/12 px-4 text-white">
          {p.status}
        </span>
        <ButtonLink to="/projects" variant="ghost-light">
          <ArrowLeft className="size-4" aria-hidden="true" /> All {projects.length} projects
        </ButtonLink>
      </PageHero>

      {p.problem && (
        <section className="py-24">
          <Wrap className="grid gap-10 lg:grid-cols-12">
            <div className="lg:col-span-4">
              <SectionHead eyebrow="The problem" title="Why it was needed" />
            </div>
            <Reveal className="lg:col-span-8">
              <p className="text-xl leading-relaxed text-ink sm:text-2xl sm:leading-relaxed">{p.problem}</p>
            </Reveal>
          </Wrap>
        </section>
      )}

      {FLOWS[p.slug] && (
        <section className="pb-24">
          <Wrap>
            <Reveal>
              <DataFlow flow={FLOWS[p.slug]} />
            </Reveal>
          </Wrap>
        </section>
      )}

      <section className="bg-secondary py-24">
        <Wrap className="grid gap-14 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <SectionHead eyebrow="What I built" title={`Inside ${p.name}`} />
            <ol className="mt-10 space-y-6">
              {p.built.map((b, k) => (
                <Reveal as="li" key={k} delay={k * 0.05} className="grid grid-cols-[2.5rem_1fr] gap-4">
                  <span className="display text-3xl text-primary/40">{String(k + 1).padStart(2, "0")}</span>
                  <p className="text-lg leading-relaxed text-ink">{b}</p>
                </Reveal>
              ))}
            </ol>
          </div>
          <div className="lg:col-span-5">
            <Reveal className="rounded-lg bg-field p-8 text-field-foreground lg:sticky lg:top-24">
              <p className="eyebrow text-white/70">Results</p>
              <ul className="mt-6 space-y-5">
                {p.results.map((r, k) => (
                  <li key={k} className="grid grid-cols-[1.75rem_1fr] gap-3">
                    <span className="mt-1 inline-flex size-6 items-center justify-center rounded-full bg-amber text-black">
                      <Check className="size-3.5" aria-hidden="true" />
                    </span>
                    <span className="text-lg leading-relaxed">{r}</span>
                  </li>
                ))}
              </ul>
              <p className="eyebrow mt-10 text-white/70">Stack</p>
              <div className="mt-4 flex flex-wrap gap-2">
                {p.stack.map((s) => (
                  <ToolChip key={s.name} item={s} />
                ))}
              </div>
            </Reveal>
          </div>
        </Wrap>
      </section>

      {Extra && (
        <React.Suspense fallback={<div className="h-96" />}>
          <Extra />
        </React.Suspense>
      )}

      {p.detail && (
        <section className="py-24">
          <Wrap>
            <Reveal className="mx-auto max-w-4xl border-l-4 border-amber pl-8">
              <p className="eyebrow text-muted-foreground">One detail</p>
              <p className="mt-5 text-2xl leading-relaxed text-ink sm:text-3xl sm:leading-snug">{p.detail}</p>
            </Reveal>
          </Wrap>
        </section>
      )}

      <NextProject next={next} />
      <Wrap className="pb-16">
        <div className="flex flex-wrap items-center justify-between gap-4 border-t border-border pt-8">
          <ButtonLink href={MAILTO}>
            <Mail className="size-4" aria-hidden="true" /> Ask me about this project
          </ButtonLink>
          {p.coverCredit && (
            <p className="text-sm text-muted-foreground">
              Cover photograph by {p.coverCredit.by}, {p.coverCredit.licence}, via{" "}
              <a className="underline" href={p.coverCredit.page} target="_blank" rel="noreferrer">
                {p.coverCredit.source}
              </a>
            </p>
          )}
        </div>
      </Wrap>
    </main>
  )
}

function NextProject({ next }: { next: Project }) {
  return (
    <section className="pb-16">
      <Wrap>
        <Reveal>
          <Link
            to={`/projects/${next.slug}`}
            className="group grid overflow-hidden rounded-lg bg-ink text-field-foreground focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary md:grid-cols-2"
          >
            <div className="flex flex-col justify-between gap-8 p-8 sm:p-12">
              <p className="eyebrow text-white/65">Next project · {next.context}</p>
              <div>
                <p className="display text-4xl sm:text-6xl">{next.name}</p>
                <p className="mt-4 max-w-md text-white/80">{next.teaser}</p>
              </div>
              <span className="inline-flex items-center gap-2 font-semibold text-amber">
                Read the next project
                <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" aria-hidden="true" />
              </span>
            </div>
            <div className="aspect-[3/2] overflow-hidden md:aspect-auto">
              <Picture
                file={photoFile(next)}
                alt=""
                sizes="(min-width: 768px) 50vw, 100vw"
                className="transition-transform duration-700 group-hover:scale-105"
              />
            </div>
          </Link>
        </Reveal>
      </Wrap>
    </section>
  )
}
