import { ArrowRight } from "lucide-react"
import { ButtonLink, PageHero } from "@/components/site"

export default function NotFound() {
  return (
    <main id="main">
      <PageHero eyebrow="404" title="This page has moved, or never was" lead="The projects and everything else are one click away.">
        <ButtonLink to="/" variant="amber">
          Go home <ArrowRight className="size-4" aria-hidden="true" />
        </ButtonLink>
        <ButtonLink to="/projects" variant="ghost-light">
          See the projects
        </ButtonLink>
      </PageHero>
    </main>
  )
}
