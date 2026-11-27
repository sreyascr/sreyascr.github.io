import * as React from "react"
import { PageHero, Picture, Wrap } from "@/components/site"
import { PROFILE, usedPhotos } from "@/lib/data"

export default function Credits() {
  React.useEffect(() => {
    document.title = `Photo credits · ${PROFILE.name}`
  }, [])
  const photos = usedPhotos()
  return (
    <main id="main">
      <PageHero
        eyebrow="Credits"
        title="Photographs on this site"
        lead={`${photos.length} photographs from Wikimedia Commons, each under the licence named beside it. Some are cropped, and the project covers set them in two colours.`}
      />
      <section className="py-20">
        <Wrap>
          <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {photos.map((p) => (
              <li key={p.id} className="overflow-hidden rounded-lg border border-border bg-card">
                <div className="aspect-[3/2]">
                  <Picture file={p.thumb ?? "photo-" + p.id} alt="" sizes="(min-width: 1024px) 33vw, 50vw" />
                </div>
                <div className="p-5 text-sm leading-relaxed text-muted-foreground">
                  <p className="font-semibold text-ink">{p.alt}</p>
                  <p className="mt-1">
                    By {p.by},{" "}
                    <a href={p.licenceUrl} className="underline" target="_blank" rel="noreferrer">
                      {p.licence}
                    </a>
                    , via{" "}
                    <a href={p.page} className="underline" target="_blank" rel="noreferrer">
                      {p.source}
                    </a>
                  </p>
                </div>
              </li>
            ))}
          </ul>
          <p className="mt-12 max-w-3xl text-sm leading-relaxed text-muted-foreground">
            The chess knight in the home page hero is Colin M.L. Burnett's piece (
            <a className="underline" href="https://commons.wikimedia.org/wiki/File:Chess_nlt45.svg" target="_blank" rel="noreferrer">
              Chess_nlt45.svg
            </a>
            , GFDL, BSD and GPL), with a new fill and shading.
          </p>
        </Wrap>
      </section>
    </main>
  )
}
