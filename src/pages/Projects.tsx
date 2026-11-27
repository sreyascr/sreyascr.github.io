import * as React from "react"
import { Mail } from "lucide-react"
import { ButtonLink, PageHero, ProjectCard, Reveal, SectionHead, Wrap } from "@/components/site"
import { DataFlow } from "@/components/data-flow"
import { GROUPS, MAILTO, PROFILE, projectBySlug, projects } from "@/lib/data"
import { FLOWS } from "@/lib/flows"

export default function Projects() {
  React.useEffect(() => {
    document.title = `${projects.length} data engineering projects · ${PROFILE.name}`
  }, [])
  return (
    <main id="main">
      <PageHero
        eyebrow={`${projects.length} projects`}
        title="Data engineering projects"
        lead="Data pipelines, retrieval services and data apps first, then the validation, dashboard and experiment work around them: six personal builds, six tools made at Audible and two university projects at OvGU."
      >
        <ButtonLink href={MAILTO} variant="amber">
          <Mail className="size-4" aria-hidden="true" /> Email Shreyas
        </ButtonLink>
        <ButtonLink href="#builds" variant="ghost-light">
          Jump to the builds
        </ButtonLink>
      </PageHero>

      {GROUPS.map((g, gi) => (
        <section key={g.key} id={g.key} className={gi % 2 ? "bg-secondary py-24" : "py-24"}>
          <Wrap>
            <SectionHead eyebrow={`${g.slugs.length} projects`} title={g.title} note={g.note} />
            {g.key === "builds" ? (
              // the data engineering builds: each card with its pipeline beside it
              <ul className="mt-12 space-y-6">
                {g.slugs.map((slug) => (
                  <Reveal as="li" key={slug} className="grid gap-6 lg:grid-cols-12">
                    <div className="lg:col-span-4">
                      <ProjectCard project={projectBySlug(slug)!} />
                    </div>
                    {FLOWS[slug] && <DataFlow flow={FLOWS[slug]} className="lg:col-span-8" compact />}
                  </Reveal>
                ))}
              </ul>
            ) : (
              <ul className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {g.slugs.map((slug, i) => (
                  <Reveal as="li" key={slug} delay={(i % 3) * 0.08}>
                    <ProjectCard project={projectBySlug(slug)!} />
                  </Reveal>
                ))}
              </ul>
            )}
          </Wrap>
        </section>
      ))}
    </main>
  )
}
