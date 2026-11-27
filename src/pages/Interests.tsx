import * as React from "react"
import { ArrowUpRight, Mail } from "lucide-react"
import { ChessKnight } from "@/components/chess-knight"
import { Watch } from "@/components/watch"
import { ButtonLink, PageHero, Picture, Reveal, Wrap } from "@/components/site"
import { MAILTO, PAGE_PHOTOS, PROFILE } from "@/lib/data"

export default function Interests() {
  React.useEffect(() => {
    document.title = `Interests · ${PROFILE.name}`
  }, [])
  return (
    <main id="main">
      <PageHero
        eyebrow="Away from data"
        title="Tennis, watches and chess"
        lead="Three things I follow away from data work in Berlin. I play chess on chess.com, and I used to be a hardcore gamer."
        media={<Picture file={"photo-" + PAGE_PHOTOS.oberbaum.id} alt={PAGE_PHOTOS.oberbaum.alt} eager />}
      >
        <ButtonLink href={MAILTO} variant="amber">
          <Mail className="size-4" aria-hidden="true" /> Email Shreyas
        </ButtonLink>
        <ButtonLink href="#notes" variant="ghost-light">
          Read the 3 notes
        </ButtonLink>
      </PageHero>

      <section id="notes" className="scroll-mt-16 py-24">
        <Wrap className="space-y-24">
          <Note n="01" kicker="Tennis" title="Winning by losing points better" photo={PAGE_PHOTOS.tennis}>
            <p>Roger Federer won almost 80% of his 1,526 singles matches, but only 54% of the points in them.</p>
            <blockquote className="mt-6 border-l-4 border-amber pl-6 text-2xl font-semibold leading-snug text-ink">
              “When you lose every second point, on average, you learn not to dwell on every shot.”
            </blockquote>
            <p className="mt-3 text-sm">Roger Federer, Dartmouth, 9 June 2024</p>
            <ButtonLink
              href="https://home.dartmouth.edu/news/2024/06/2024-commencement-address-roger-federer"
              variant="outline"
              external
              className="mt-6"
            >
              Read Federer's speech <ArrowUpRight className="size-4" aria-hidden="true" />
            </ButtonLink>
          </Note>

          <Note
            n="02"
            kicker="Watches"
            title="The first user interface"
            flip
            media={
              <div className="mx-auto w-full max-w-[22rem]">
                <Watch />
              </div>
            }
          >
            <p>
              Mechanical complications as the original user interface, and what makes a dial readable. This one keeps your time; click it to turn it over and watch the movement run.
            </p>
          </Note>

          <Note
            n="03"
            kicker="Chess"
            title="Chess as Srey_as"
            media={
              <div className="aspect-[4/5] w-full max-w-sm overflow-hidden rounded-lg">
                <ChessKnight />
              </div>
            }
          >
            <p>
              The knight is my favourite piece, the only one that jumps; click it to make a move. I
              play on chess.com, and built{" "}
              <a href="/projects/blunderchess" className="font-semibold text-primary underline underline-offset-4">
                BlunderChess
              </a>{" "}
              to train against Stockfish.
            </p>
            <ButtonLink href={PROFILE.chess} variant="primary" external className="mt-6">
              Add me on chess.com <ArrowUpRight className="size-4" aria-hidden="true" />
            </ButtonLink>
          </Note>
        </Wrap>
      </section>
    </main>
  )
}

function Note({
  n,
  kicker,
  title,
  photo,
  media,
  flip,
  children,
}: {
  n: string
  kicker: string
  title: string
  photo?: { id: string; alt: string }
  media?: React.ReactNode
  flip?: boolean
  children: React.ReactNode
}) {
  return (
    <article className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
      <Reveal className={flip ? "lg:order-2" : ""}>
        {media ?? (
          <div className="aspect-[4/3] overflow-hidden rounded-lg">
            <Picture file={"photo-" + photo!.id} alt={photo!.alt} />
          </div>
        )}
      </Reveal>
      <Reveal delay={0.1}>
        <p className="eyebrow text-muted-foreground">
          {n} · {kicker}
        </p>
        <h2 className="display mt-4 text-5xl text-ink sm:text-6xl">{title}</h2>
        <div className="mt-6 text-lg leading-relaxed text-muted-foreground">{children}</div>
      </Reveal>
    </article>
  )
}
