import * as React from "react"
import { Link, NavLink } from "react-router-dom"
import { AnimatePresence, motion } from "motion/react"
import { ArrowRight, ArrowUpRight, Mail, Menu, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { MAILTO, PROFILE, hasPage, iconSrc, img, posterFile, type Project, type StackItem } from "@/lib/data"

const EASE = [0.2, 0.75, 0.2, 1] as const
const YEAR = new Date().getFullYear()

export const NAV = [
  { to: "/projects", label: "Projects" },
  { to: "/about", label: "About" },
  { to: "/interests", label: "Interests" },
]

/* ------------------------------------------------------------------ layout */

export function Wrap({ className, children }: { className?: string; children: React.ReactNode }) {
  return <div className={cn("mx-auto w-full max-w-7xl px-5 sm:px-8", className)}>{children}</div>
}

/** Fades and lifts its content in once, when it scrolls into view. */
export function Reveal({
  children,
  delay = 0,
  className,
  as = "div",
}: {
  children: React.ReactNode
  delay?: number
  className?: string
  as?: "div" | "li" | "section"
}) {
  const C = motion[as]
  return (
    <C
      className={className}
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "0px 0px -10% 0px" }}
      transition={{ duration: 0.6, ease: EASE, delay }}
    >
      {children}
    </C>
  )
}

/* ------------------------------------------------------------------ header */

export function SiteHeader({ hiddenUntil }: { hiddenUntil?: React.RefObject<HTMLElement | null> }) {
  const [open, setOpen] = React.useState(false)
  const [shown, setShown] = React.useState(!hiddenUntil)

  // on the home page the hero carries its own nav, so this bar waits until the hero has gone
  React.useEffect(() => {
    if (!hiddenUntil?.current) return
    const el = hiddenUntil.current
    const io = new IntersectionObserver(([e]) => setShown(!e.isIntersecting && e.boundingClientRect.top < 0), {
      threshold: 0,
    })
    io.observe(el)
    return () => io.disconnect()
  }, [hiddenUntil])

  return (
    <AnimatePresence>
      {shown && (
        <motion.header
          key="hdr"
          initial={hiddenUntil ? { y: -72 } : false}
          animate={{ y: 0 }}
          exit={{ y: -72 }}
          transition={{ duration: 0.35, ease: EASE }}
          className="fixed inset-x-0 top-0 z-50 border-b border-white/10 bg-field/95 text-field-foreground backdrop-blur"
        >
          <Wrap className="flex h-16 items-center justify-between gap-6">
            <Link to="/" className="eyebrow rounded-sm hover:opacity-75" onClick={() => setOpen(false)}>
              {PROFILE.name}
            </Link>
            <nav aria-label="Main" className="hidden items-center gap-1 md:flex">
              {NAV.map((n) => (
                <NavLink
                  key={n.to}
                  to={n.to}
                  className={({ isActive }) =>
                    cn("eyebrow rounded-md px-3 py-2.5 transition-colors hover:bg-white/10", isActive && "bg-white/15")
                  }
                >
                  {n.label}
                </NavLink>
              ))}
            </nav>
            <div className="flex items-center gap-2">
              <a
                href={MAILTO}
                className="eyebrow hidden items-center gap-2 rounded-md bg-amber px-4 py-2.5 text-black transition-transform hover:-translate-y-0.5 sm:inline-flex"
              >
                <Mail className="size-4" aria-hidden="true" /> Email me
              </a>
              <button
                type="button"
                className="inline-flex size-11 items-center justify-center rounded-md hover:bg-white/10 md:hidden"
                aria-expanded={open}
                aria-controls="mobile-nav"
                aria-label={open ? "Close menu" : "Open menu"}
                onClick={() => setOpen((o) => !o)}
              >
                {open ? <X className="size-5" /> : <Menu className="size-5" />}
              </button>
            </div>
          </Wrap>
          <AnimatePresence>
            {open && (
              <motion.nav
                id="mobile-nav"
                aria-label="Mobile"
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.25 }}
                className="overflow-hidden border-t border-white/10 md:hidden"
              >
                <Wrap className="flex flex-col py-3">
                  {[{ to: "/", label: "Home" }, ...NAV].map((n) => (
                    <NavLink key={n.to} to={n.to} onClick={() => setOpen(false)} className="display py-3 text-3xl">
                      {n.label}
                    </NavLink>
                  ))}
                  <a href={MAILTO} className="display py-3 text-3xl text-amber">
                    Email me
                  </a>
                </Wrap>
              </motion.nav>
            )}
          </AnimatePresence>
        </motion.header>
      )}
    </AnimatePresence>
  )
}

/* ------------------------------------------------------------------ footer */

export function SiteFooter() {
  return (
    <footer className="bg-ink text-field-foreground">
      <Wrap className="grid gap-12 py-16 md:grid-cols-12">
        <div className="md:col-span-7">
          <p className="eyebrow text-white/70">Open to data engineering and analytics-engineering roles</p>
          <p className="display mt-4 text-5xl sm:text-7xl">Let's talk data.</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <ButtonLink href={MAILTO} variant="amber">
              <Mail className="size-4" aria-hidden="true" /> {PROFILE.email}
            </ButtonLink>
            <ButtonLink href={PROFILE.linkedin} variant="ghost-light" external>
              Message on LinkedIn <ArrowUpRight className="size-4" aria-hidden="true" />
            </ButtonLink>
          </div>
        </div>
        <nav aria-label="Footer" className="grid grid-cols-2 gap-8 md:col-span-5 md:justify-self-end">
          <div>
            <p className="eyebrow text-white/60">Pages</p>
            <ul className="mt-4 space-y-3">
              {[{ to: "/", label: "Home" }, ...NAV].map((n) => (
                <li key={n.to}>
                  <Link to={n.to} className="hover:underline">
                    {n.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="eyebrow text-white/60">Elsewhere</p>
            <ul className="mt-4 space-y-3">
              <li>
                <a href={PROFILE.linkedin} className="hover:underline" target="_blank" rel="noreferrer">
                  LinkedIn
                </a>
              </li>
              <li>
                <a href={PROFILE.chess} className="hover:underline" target="_blank" rel="noreferrer">
                  chess.com
                </a>
              </li>
              <li>
                <Link to="/credits" className="hover:underline">
                  Photo credits
                </Link>
              </li>
            </ul>
          </div>
        </nav>
      </Wrap>
      <Wrap className="flex flex-col justify-between gap-2 border-t border-white/10 py-6 text-sm text-white/60 sm:flex-row">
        <p>© {YEAR} {PROFILE.name}, Berlin</p>
        <p>
          Photographs via Wikimedia Commons, <Link to="/credits" className="underline">credited here</Link>
        </p>
      </Wrap>
    </footer>
  )
}

/* ------------------------------------------------------------------ pieces */

const BUTTON = {
  amber: "bg-amber text-black hover:-translate-y-0.5",
  primary: "bg-primary text-primary-foreground hover:-translate-y-0.5",
  "ghost-light": "border border-white/35 text-white hover:bg-white/10",
  outline: "border border-primary/30 text-primary hover:bg-primary/5",
}

export function ButtonLink({
  href,
  to,
  variant = "primary",
  external,
  children,
  className,
}: {
  href?: string
  to?: string
  variant?: keyof typeof BUTTON
  external?: boolean
  children: React.ReactNode
  className?: string
}) {
  const cls = cn(
    "inline-flex min-h-11 items-center gap-2 rounded-md px-5 py-3 text-sm font-semibold transition-all duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-current",
    BUTTON[variant],
    className,
  )
  if (to)
    return (
      <Link to={to} className={cls}>
        {children}
      </Link>
    )
  return (
    <a href={href} className={cls} {...(external ? { target: "_blank", rel: "noreferrer" } : {})}>
      {children}
    </a>
  )
}

/** A responsive photograph or cover, with its box reserved. */
export function Picture({
  file,
  alt,
  className,
  sizes = "(min-width: 1024px) 50vw, 100vw",
  eager,
}: {
  file: string
  alt: string
  className?: string
  sizes?: string
  eager?: boolean
}) {
  const s = img(file)
  return (
    <img
      src={s.src}
      srcSet={s.srcSet}
      sizes={sizes}
      alt={alt}
      loading={eager ? "eager" : "lazy"}
      decoding="async"
      className={cn("size-full object-cover", className)}
    />
  )
}

/** The coloured band that opens every inner page. */
export function PageHero({
  eyebrow,
  title,
  lead,
  children,
  media,
}: {
  eyebrow?: React.ReactNode
  title: React.ReactNode
  lead?: React.ReactNode
  children?: React.ReactNode
  media?: React.ReactNode
}) {
  return (
    <section className="relative overflow-hidden bg-field pt-16 text-field-foreground">
      <Wrap className={cn("grid items-end gap-10 py-16 sm:py-24", media && "lg:grid-cols-12")}>
        <div className={cn(media && "lg:col-span-7")}>
          {eyebrow && (
            <motion.p
              className="eyebrow text-white/75"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: EASE }}
            >
              {eyebrow}
            </motion.p>
          )}
          <motion.h1
            className="display mt-5 text-[clamp(2.75rem,7vw,6.5rem)]"
            initial={{ opacity: 0, y: 28, filter: "blur(10px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{ duration: 0.7, ease: EASE, delay: 0.05 }}
          >
            {title}
          </motion.h1>
          {lead && (
            <motion.p
              className="mt-6 max-w-2xl text-lg leading-relaxed text-white/85 sm:text-xl"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: EASE, delay: 0.2 }}
            >
              {lead}
            </motion.p>
          )}
          {children && (
            <motion.div
              className="mt-8 flex flex-wrap gap-3"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: EASE, delay: 0.3 }}
            >
              {children}
            </motion.div>
          )}
        </div>
        {media && (
          <motion.div
            className="aspect-[3/2] overflow-hidden rounded-lg lg:col-span-5"
            initial={{ opacity: 0, clipPath: "inset(0 0 100% 0)" }}
            animate={{ opacity: 1, clipPath: "inset(0 0 0% 0)" }}
            transition={{ duration: 0.9, ease: EASE, delay: 0.2 }}
          >
            {media}
          </motion.div>
        )}
      </Wrap>
    </section>
  )
}

export function SectionHead({ eyebrow, title, note }: { eyebrow?: string; title: React.ReactNode; note?: React.ReactNode }) {
  return (
    <Reveal className="max-w-3xl">
      {eyebrow && <p className="eyebrow text-muted-foreground">{eyebrow}</p>}
      <h2 className="display mt-3 text-[clamp(2.25rem,5vw,4rem)] text-ink">{title}</h2>
      {note && <p className="mt-4 text-lg leading-relaxed text-muted-foreground">{note}</p>}
    </Reveal>
  )
}

export function ToolChip({ item }: { item: StackItem }) {
  const src = iconSrc(item.icon)
  return (
    <span className="inline-flex items-center gap-2 rounded-md border border-border bg-card px-3 py-2 text-sm font-medium text-ink">
      {src && <img src={src} alt="" width={18} height={18} className="size-[18px]" />}
      {item.name}
    </span>
  )
}

export function ProjectCard({ project }: { project: Project }) {
  const linked = hasPage(project.slug)
  const body = (
    <>
      <div className="relative aspect-[3/2] overflow-hidden bg-muted">
        <Picture
          file={posterFile(project.slug)}
          alt=""
          sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
          className="transition-transform duration-500 ease-out group-hover:scale-[1.04]"
        />
      </div>
      <div className="flex flex-1 flex-col gap-3 p-5">
        <p className="eyebrow text-muted-foreground">
          {project.context}
          {project.when ? " · " + project.when : ""}
        </p>
        <h3 className="text-xl font-bold leading-snug text-ink">{project.name}</h3>
        <p className="leading-relaxed text-muted-foreground">{project.teaser}</p>
        {linked && (
          <span className="mt-auto inline-flex items-center gap-2 pt-2 text-sm font-semibold text-primary">
            Read the project
            <ArrowRight className="size-4 transition-transform duration-200 group-hover:translate-x-1" aria-hidden="true" />
          </span>
        )}
      </div>
    </>
  )
  const cls = "group flex h-full flex-col overflow-hidden rounded-lg border border-border bg-card"
  if (!linked) return <div className={cls}>{body}</div>
  return (
    <Link
      to={`/projects/${project.slug}`}
      className={
        cls +
        " transition-shadow duration-300 hover:shadow-[0_18px_40px_-20px_rgba(30,58,138,0.45)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary"
      }
    >
      {body}
    </Link>
  )
}
