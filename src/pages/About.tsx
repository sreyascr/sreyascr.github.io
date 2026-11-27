import * as React from "react"
import { Mail } from "lucide-react"
import { ButtonLink, PageHero, Picture, Reveal, SectionHead, Wrap } from "@/components/site"
import { MAILTO, PAGE_PHOTOS, PROFILE, iconSrc, tools } from "@/lib/data"

// the About page shows the 36 tools in six families, each tool with its own role underneath
const FAMILIES: { title: string; kinds: string[] }[] = [
  { title: "Cloud and pipelines", kinds: ["Serverless", "ETL", "Query", "Events", "Orchestration", "Models", "PySpark", "Pipelines"] },
  { title: "Warehouses and databases", kinds: ["Warehouse", "Database", "Vector database", "Lakehouse", "Storage"] },
  { title: "Languages", kinds: ["Language"] },
  { title: "Dashboards and analytics", kinds: ["Dashboards", "Web analytics", "Tagging"] },
  { title: "Machine learning and AI", kinds: ["Machine learning", "Embeddings"] },
  { title: "Apps, delivery and tracking", kinds: ["APIs", "Apps", "CI/CD", "Version control", "Tracking"] },
]

const EXPERIENCE = [
  {
    org: "Audible",
    place: "Berlin",
    role: "Working student, Revenue and Marketing",
    when: "Since Dec 2025",
    body: "An experiment validator that cut the monthly audit from 5 hours to 10 minutes, Tableau dashboards on Redshift, and Adobe CJA reports for four markets.",
    photo: PAGE_PHOTOS.spree,
  },
  {
    org: "Jio Platforms",
    place: "Mumbai",
    role: "Data analyst",
    when: "2022 to 2025",
    body: "SQL on data from 3M+ daily users and 2M survey responses; regional analysis behind a 15% rise in engagement, and project turnaround cut by 20%.",
    photo: PAGE_PHOTOS.mumbai,
  },
]

const EDUCATION = [
  { title: "M.Sc. Data and Knowledge Engineering", body: "Otto von Guericke University Magdeburg: machine learning, knowledge graphs, Spark.", when: "2025 to 2028" },
  { title: "AWS Data Engineer Associate", body: "Studying for the exam now.", when: "In progress" },
  { title: "B.Eng. Computer Science", body: "Mumbai University.", when: "2018 to 2022" },
  { title: "Google Advanced Data Analytics", body: "Statistics, Python and data science courses.", when: "2024 to 2025" },
  { title: "Jio Spotlight Award", body: "For work in the Jio analytics team.", when: "Jio" },
]

// this semester, data engineering modules first. OVGU's module catalogue could not be reached when this was
// written, so the descriptions sum up each subject's standard content rather than quoting the catalogue.
const NOW = [
  { title: "Cloud DevOps Technologies", body: "Containers, CI/CD pipelines and infrastructure as code: building, shipping and running software in the cloud." },
  { title: "Transaction Processing", body: "Serialisability, locking and MVCC, logging and recovery, and transactions across distributed databases." },
  { title: "Advanced Database Models", body: "Data models beyond the relational table: object-relational, semi-structured and graph data, and how to query them." },
  { title: "Data Mining", body: "Finding patterns in large data sets: frequent itemsets and association rules, clustering, classification, and how to evaluate them." },
  { title: "Human-Centred Artificial Intelligence", body: "Designing AI around the people who use it: explainability, trust, fairness and keeping humans in the loop." },
  { title: "Swarm Intelligence", body: "How simple local rules make flocks and swarms move as one, and particle swarm optimisation." },
  { title: "AMS Lab Project", body: "Multi-Ship Scenario Generation, a team project; I prepare the AIS ship-track data.", to: "/projects/ais" },
]

const DONE = [
  { title: "Distributed Data Management", body: "Storing and querying data spread across many machines." },
  { title: "AI-based Decision Support II", body: "Neural networks: backpropagation, gradient descent, CNNs and LSTMs." },
]

export default function About() {
  React.useEffect(() => {
    document.title = `About · ${PROFILE.name}`
  }, [])
  return (
    <main id="main">
      <PageHero
        eyebrow="About"
        title={`${PROFILE.name}, data engineer in Berlin`}
        lead="I build pipelines, data models and validation tools: as a working student at Audible, in the M.Sc. Data and Knowledge Engineering at OvGU Magdeburg, and before that in 2.5 years as a data analyst at Jio Platforms in Mumbai."
        media={<Picture file={"photo-" + PAGE_PHOTOS.magdeburg.id} alt={PAGE_PHOTOS.magdeburg.alt} eager />}
      >
        <ButtonLink href={MAILTO} variant="amber">
          <Mail className="size-4" aria-hidden="true" /> Email Shreyas
        </ButtonLink>
        <ButtonLink href="#experience" variant="ghost-light">
          See the experience
        </ButtonLink>
      </PageHero>

      <section className="py-24 sm:py-32">
        <Wrap>
          <Reveal className="mx-auto max-w-4xl text-center">
            <p className="eyebrow text-muted-foreground">How I work with data</p>
            <p className="mt-6 text-3xl font-semibold leading-snug text-ink sm:text-4xl">
              I like problems where the answer is not obvious until it is checked against{" "}
              <span className="bg-amber/25 px-1">ground truth</span>. So I build the tool, and then I prove the tool is right.
            </p>
          </Reveal>
        </Wrap>
      </section>

      <section id="experience" className="scroll-mt-16 bg-secondary py-24">
        <Wrap>
          <SectionHead eyebrow="Data experience" title="Two employers, 3.5 years" />
          <div className="mt-12 grid gap-6 md:grid-cols-2">
            {EXPERIENCE.map((e, i) => (
              <Reveal key={e.org} delay={i * 0.1} className="overflow-hidden rounded-lg border border-border bg-card">
                <div className="aspect-[2/1] overflow-hidden">
                  <Picture file={"photo-" + e.photo.id} alt={e.photo.alt} sizes="(min-width: 768px) 50vw, 100vw" />
                </div>
                <div className="p-7">
                  <p className="eyebrow text-muted-foreground">
                    {e.place} · {e.when}
                  </p>
                  <h3 className="display mt-3 text-4xl text-ink">{e.org}</h3>
                  <p className="mt-1 font-semibold text-primary">{e.role}</p>
                  <p className="mt-4 text-lg leading-relaxed text-muted-foreground">{e.body}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </Wrap>
      </section>

      <section className="py-24">
        <Wrap>
          <SectionHead
            eyebrow={`${tools.length} tools`}
            title="The full data stack"
            note="From Audible, Jio, the M.Sc. and my projects. Pipelines and warehouses first; Python and SQL at the centre of both."
          />
          <div className="mt-12 grid gap-x-10 gap-y-12 md:grid-cols-2 xl:grid-cols-3">
            {FAMILIES.map((f, i) => (
              <Reveal key={f.title} delay={(i % 3) * 0.06} className="border-t-2 border-primary pt-5">
                <h3 className="eyebrow text-ink">{f.title}</h3>
                <ul className="mt-5 grid grid-cols-2 gap-x-4 gap-y-4">
                  {tools
                    .filter((t) => f.kinds.includes(t.kind))
                    .map((t) => (
                      <li key={t.name} className="flex items-center gap-3">
                        <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-md border border-border bg-card text-xs font-bold text-ink">
                          {t.icon ? <img src={iconSrc(t.icon)!} alt="" width={22} height={22} className="size-[22px]" /> : t.abbr}
                        </span>
                        <span className="min-w-0">
                          <span className="block font-semibold leading-tight text-ink">{t.name}</span>
                          <span className="block text-sm text-muted-foreground">{t.kind}</span>
                        </span>
                      </li>
                    ))}
                </ul>
              </Reveal>
            ))}
          </div>
        </Wrap>
      </section>

      <section className="bg-field py-24 text-field-foreground">
        <Wrap>
          <Reveal className="max-w-3xl">
            <p className="eyebrow text-white/70">Education and certificates</p>
            <h2 className="display mt-3 text-[clamp(2.25rem,5vw,4rem)]">Where I learned it</h2>
          </Reveal>
          <ul className="mt-12 divide-y divide-white/15 border-y border-white/15">
            {EDUCATION.map((e, i) => (
              <Reveal as="li" key={e.title} delay={i * 0.05} className="grid gap-2 py-6 md:grid-cols-[1fr_1.2fr_10rem] md:items-baseline md:gap-8">
                <h3 className="text-xl font-bold">{e.title}</h3>
                <p className="text-white/80">{e.body}</p>
                <p className="eyebrow text-amber md:text-right">{e.when}</p>
              </Reveal>
            ))}
          </ul>
        </Wrap>
      </section>

      <section className="py-24">
        <Wrap className="grid gap-14 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <SectionHead
              eyebrow="This semester, winter 2026/27"
              title="What I study in the M.Sc."
              note="Coursework at OvGU, not my own research."
            />
            <Reveal className="mt-8 aspect-[3/2] overflow-hidden rounded-lg">
              <Picture file={"photo-" + PAGE_PHOTOS.starlings.id} alt={PAGE_PHOTOS.starlings.alt} />
            </Reveal>
          </div>
          <div className="space-y-12 lg:col-span-7">
            <ModuleList items={NOW} />
            <div>
              <h3 className="eyebrow text-muted-foreground">Modules completed, 2025 to 2026</h3>
              <ModuleList items={DONE} className="mt-4" />
            </div>
          </div>
        </Wrap>
      </section>
    </main>
  )
}

function ModuleList({ items, className }: { items: { title: string; body: string; to?: string }[]; className?: string }) {
  return (
    <ul className={"grid gap-4 sm:grid-cols-2 " + (className ?? "")}>
      {items.map((m, i) => (
        <Reveal as="li" key={m.title} delay={(i % 2) * 0.06} className="rounded-lg border border-border bg-card p-5">
          <h4 className="font-bold text-ink">
            {m.to ? (
              <a href={m.to} className="underline decoration-amber decoration-2 underline-offset-4 hover:text-primary">
                {m.title}
              </a>
            ) : (
              m.title
            )}
          </h4>
          <p className="mt-2 leading-relaxed text-muted-foreground">{m.body}</p>
        </Reveal>
      ))}
    </ul>
  )
}
