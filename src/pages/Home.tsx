import * as React from "react"
import { Link, useNavigate } from "react-router-dom"
import { ArrowRight, ArrowUpRight, Mail } from "lucide-react"
import HelixRibbonHero from "@/components/ui/helix-ribbon-hero"
import { ChessKnight } from "@/components/chess-knight"
import { ButtonLink, Reveal, SectionHead, SiteHeader, Wrap } from "@/components/site"
import { HELIX_ORDER, MAILTO, PROFILE, hasPage, projectBySlug, projects } from "@/lib/data"

const ribbon = HELIX_ORDER.map((slug) => {
  const p = projectBySlug(slug)!
  return { src: `/img/covers/${slug}.webp`, title: p.name, href: hasPage(slug) ? `/projects/${slug}` : undefined }
})

const WORK = [
  { title: "Pipelines and ETL", body: "Airflow, AWS Glue, Lambda and Spark, from raw files to tables.", tag: "Python" },
  { title: "Data modelling", body: "dbt models on Redshift, PostgreSQL and Snowflake.", tag: "SQL" },
  { title: "Data quality and validation", body: "Reconciling sources against ground truth before anyone builds on them.", tag: "SQL" },
  { title: "Retrieval and AI tools", body: "Embeddings in Qdrant and pgvector, agents on governed data.", tag: "LLMs" },
  { title: "Dashboards and experiments", body: "Tableau, Power BI and Adobe CJA; A/B tests, Bayesian against frequentist.", tag: "Tableau" },
]

const RESULTS = [
  { figure: "9.7M", label: "Of 18.3M ship positions kept by the cleaning pipeline", slug: "ais" },
  { figure: "5 h → 10 min", label: "Monthly data reconciliation, automated", slug: "validator" },
  { figure: "10M+", label: "Research-paper records behind a retrieval service", slug: "rag-bot" },
  { figure: "3 APIs", label: "Job APIs ingested, matched and ranked by an LLM agent", slug: "job-copilot" },
]

const FAQ = [
  {
    q: "Which data roles are you looking for?",
    a: "Data engineering and analytics engineering first, then BI and data analyst roles: working-student jobs and internships now, graduate roles from 2028.",
  },
  {
    q: "Where can you work outside Berlin?",
    a: "As a working student, within two hours of Magdeburg, such as Leipzig or Hannover. Internships anywhere in Germany, and remote roles.",
  },
  { q: "How many hours a week?", a: "About 20 hours a week in the semester; full time in the March to April break." },
  {
    q: "Which of your 6 languages are fluent?",
    a: "English at C2, Hindi and Malayalam as native languages, some Marathi and Japanese, and German at A2 to B1.",
  },
]

export default function Home() {
  const navigate = useNavigate()
  const heroRef = React.useRef<HTMLDivElement | null>(null)

  React.useEffect(() => {
    document.title = `${PROFILE.name}, data engineer in Berlin`
  }, [])

  return (
    <>
      <SiteHeader hiddenUntil={heroRef} />
      <div ref={heroRef}>
        <HelixRibbonHero
          greeting="Hey, I'm"
          name="Shreyas"
          portraitNode={<ChessKnight />}
          portraitBackground="#0B1A4A"
          projects={ribbon}
          brand={PROFILE.name}
          links={[
            { label: "Projects", href: "/projects" },
            { label: "About", href: "/about" },
            { label: "Interests", href: "/interests" },
          ]}
          cta={{ label: "Email me", href: MAILTO }}
          count={`( ${projects.length} data projects )`}
          bio="Shreyas is a data engineer in Berlin, building pipelines, data models and validation tools at Audible and in an M.Sc. at OvGU."
          scrollHint="Scroll for projects"
          background="var(--field)"
          foreground="var(--field-foreground)"
          fontHref={null}
          onProjectClick={(p, e) => {
            if (!p.href) return
            e.preventDefault()
            navigate(p.href)
          }}
        />
      </div>

      <main id="main">
        {/* after the grid: a clear way on to all of them */}
        <section className="bg-field pb-20 text-field-foreground">
          <Wrap className="flex flex-col items-start justify-between gap-6 border-t border-white/15 pt-10 sm:flex-row sm:items-center">
            <p className="max-w-xl text-lg text-white/85">
              Pipelines, retrieval services and data apps first: six of {projects.length}. Each has its own page: the problem, what I built, and what it changed.
            </p>
            <ButtonLink to="/projects" variant="amber">
              See all {projects.length} projects <ArrowRight className="size-4" aria-hidden="true" />
            </ButtonLink>
          </Wrap>
        </section>

        <section className="py-24 sm:py-32">
          <Wrap>
            <SectionHead eyebrow="Results" title="What the work changed" />
            <ul className="mt-14 grid gap-px overflow-hidden rounded-lg border border-border bg-border sm:grid-cols-2 lg:grid-cols-4">
              {RESULTS.map((r, i) => (
                <Reveal as="li" key={r.slug} delay={i * 0.08} className="bg-card">
                  {hasPage(r.slug) ? (
                    <Link
                      to={`/projects/${r.slug}`}
                      className="group flex h-full flex-col gap-4 p-7 transition-colors hover:bg-secondary focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-primary"
                    >
                      <span className="display whitespace-nowrap text-[clamp(2.25rem,3.6vw,3rem)] text-primary">{r.figure}</span>
                      <span className="leading-relaxed text-muted-foreground">{r.label}</span>
                      <span className="mt-auto inline-flex items-center gap-2 text-sm font-semibold text-primary">
                        {projectBySlug(r.slug)!.name}
                        <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" aria-hidden="true" />
                      </span>
                    </Link>
                  ) : (
                    <div className="flex h-full flex-col gap-4 p-7">
                      <span className="display whitespace-nowrap text-[clamp(2.25rem,3.6vw,3rem)] text-primary">{r.figure}</span>
                      <span className="leading-relaxed text-muted-foreground">{r.label}</span>
                      <span className="mt-auto text-sm font-semibold text-ink">{projectBySlug(r.slug)!.name}, Audible</span>
                    </div>
                  )}
                </Reveal>
              ))}
            </ul>
          </Wrap>
        </section>

        <section className="bg-secondary py-24 sm:py-32">
          <Wrap className="grid gap-14 lg:grid-cols-12">
            <div className="lg:col-span-5">
              <SectionHead
                eyebrow="Toolkit"
                title="What I engineer in data"
                note="From raw files to tested tables, and on to the dashboard people open. Python and SQL at the centre."
              />
              <Reveal delay={0.1} className="mt-8">
                <ButtonLink to="/about" variant="outline">
                  The full 36-tool stack <ArrowRight className="size-4" aria-hidden="true" />
                </ButtonLink>
              </Reveal>
            </div>
            <ol className="divide-y divide-primary/15 border-y border-primary/15 lg:col-span-7">
              {WORK.map((w, i) => (
                <Reveal as="li" key={w.title} delay={i * 0.06} className="grid grid-cols-[3rem_1fr_auto] items-baseline gap-4 py-6">
                  <span className="eyebrow text-muted-foreground">{String(i + 1).padStart(2, "0")}</span>
                  <div>
                    <h3 className="text-xl font-bold text-ink">{w.title}</h3>
                    <p className="mt-1 text-muted-foreground">{w.body}</p>
                  </div>
                  <span className="eyebrow rounded bg-card px-2.5 py-1.5 text-ink">{w.tag}</span>
                </Reveal>
              ))}
            </ol>
          </Wrap>
        </section>

        <section className="py-24 sm:py-32">
          <Wrap>
            <SectionHead eyebrow="For recruiters" title="Roles, hours and languages" />
            <dl className="mt-14 grid gap-x-12 gap-y-10 md:grid-cols-2">
              {FAQ.map((f, i) => (
                <Reveal key={f.q} delay={i * 0.06} className="border-t-2 border-primary pt-6">
                  <dt className="text-xl font-bold text-ink">{f.q}</dt>
                  <dd className="mt-3 text-lg leading-relaxed text-muted-foreground">{f.a}</dd>
                </Reveal>
              ))}
            </dl>
            <Reveal className="mt-14 flex flex-wrap gap-3">
              <ButtonLink href={MAILTO}>
                <Mail className="size-4" aria-hidden="true" /> Email Shreyas
              </ButtonLink>
              <ButtonLink href={PROFILE.linkedin} variant="outline" external>
                Message on LinkedIn <ArrowUpRight className="size-4" aria-hidden="true" />
              </ButtonLink>
            </Reveal>
          </Wrap>
        </section>
      </main>
    </>
  )
}
