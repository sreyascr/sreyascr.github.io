import * as React from "react"
import { Navigate, Route, Routes, useLocation, useNavigate } from "react-router-dom"
import { MotionConfig } from "motion/react"
import { SiteFooter, SiteHeader } from "@/components/site"
import Home from "@/pages/Home"
import NotFound from "@/pages/NotFound"

// Home ships in the first bundle; the other pages load when first visited
const Projects = React.lazy(() => import("@/pages/Projects"))
const ProjectPage = React.lazy(() => import("@/pages/ProjectPage"))
const About = React.lazy(() => import("@/pages/About"))
const Interests = React.lazy(() => import("@/pages/Interests"))
const Credits = React.lazy(() => import("@/pages/Credits"))

/** Plain same-site <a href="/…"> links (the hero's nav, links in copy) go through the router. */
function useLinkInterception() {
  const navigate = useNavigate()
  React.useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return
      const a = (e.target as Element | null)?.closest?.("a")
      if (!a || a.target || a.hasAttribute("download")) return
      const href = a.getAttribute("href")
      if (!href || !href.startsWith("/") || href.startsWith("//")) return
      e.preventDefault()
      navigate(href)
    }
    document.addEventListener("click", onClick)
    return () => document.removeEventListener("click", onClick)
  }, [navigate])
}

/** New page: start at the top, or at the #section the link names. */
function useScrollOnRoute() {
  const { pathname, hash } = useLocation()
  React.useEffect(() => {
    if (hash) {
      document.getElementById(hash.slice(1))?.scrollIntoView()
      return
    }
    window.scrollTo(0, 0)
  }, [pathname, hash])
}

/** Links to the old static pages (about.html, projects/ais.html) keep working. */
function LegacyRedirect() {
  const { pathname, hash } = useLocation()
  const clean = pathname.replace(/\/index\.html$/, "/").replace(/\.html$/, "")
  return <Navigate to={clean + hash} replace />
}

export default function App() {
  useLinkInterception()
  useScrollOnRoute()
  const { pathname } = useLocation()
  const isHome = pathname === "/"
  return (
    <MotionConfig reducedMotion="user">
      <a
        href="#main"
        className="sr-only z-[60] rounded-md bg-amber px-4 py-3 font-semibold text-black focus:not-sr-only focus:fixed focus:left-4 focus:top-4"
      >
        Skip to content
      </a>
      {!isHome && <SiteHeader />}
      <React.Suspense fallback={<div className="min-h-svh bg-field" />}>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/projects" element={<Projects />} />
        <Route path="/projects/:slug" element={<ProjectPage />} />
        <Route path="/about" element={<About />} />
        <Route path="/interests" element={<Interests />} />
        <Route path="/credits" element={<Credits />} />
        <Route path="*" element={<RouteFallback />} />
      </Routes>
      </React.Suspense>
      <SiteFooter />
    </MotionConfig>
  )
}

function RouteFallback() {
  const { pathname } = useLocation()
  return pathname.endsWith(".html") ? <LegacyRedirect /> : <NotFound />
}
