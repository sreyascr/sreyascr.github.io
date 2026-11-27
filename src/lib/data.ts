import projectsJson from "@/data/projects.json"
import photosJson from "@/data/photos.json"
import toolsJson from "@/data/tools.json"

export type Credit = { by: string; licence: string; licenceUrl: string; page: string; source: string }
export type StackItem = { name: string; icon: string | null }
export type Project = {
  slug: string
  name: string
  title: string
  when: string
  context: string
  status: string
  oneLine: string
  teaser: string
  problem: string
  built: string[]
  results: string[]
  detail: string
  stack: StackItem[]
  cover: string
  coverAlt: string
  coverCredit: Credit | null
}
export type Tool = { name: string; kind: string; icon: string | null; abbr: string | null }
type PhotoRecord = Credit & { id: string; alt: string; files: string[]; thumb?: string }

export const TABLEAU_SALES =
  "https://public.tableau.com/app/profile/shreyas.challiyil.ravindran/viz/Shreyas_Challiyil_Submission_twbx/KPIS"

export const PROFILE = {
  name: "Shreyas Challiyil",
  first: "Shreyas",
  role: "Data engineer and analytics engineer",
  city: "Berlin",
  email: "shreyascr00@gmail.com",
  linkedin: "https://www.linkedin.com/in/shreyaschalliyil",
  chess: "https://www.chess.com/member/Srey_as",
}
export const MAILTO = "mailto:" + PROFILE.email

export const projects = projectsJson as Project[]
export const tools = toolsJson as Tool[]
const photoRecords = photosJson as PhotoRecord[]

export const projectBySlug = (slug: string) => projects.find((p) => p.slug === slug)

/** Work made at Audible shows as a card only, with no page of its own. */
export const hasPage = (slug: string) => !projectBySlug(slug)?.context.startsWith("Audible")

export const GROUPS: { key: string; title: string; note: string; slugs: string[] }[] = [
  {
    key: "builds",
    title: "Data engineering builds",
    note: "Pipelines, retrieval services and data apps made outside work, each with its own stack: two run on Databricks with Lakebase Postgres underneath.",
    slugs: ["weather-api", "rag-bot", "ticketing", "job-copilot", "blunderchess", "sales-dashboard"],
  },
  {
    key: "audible",
    title: "Made at Audible",
    note: "Six tools from my working-student role in Revenue and Marketing, from data validation to AI analysis on governed data, described without internal names or figures.",
    slugs: ["validator", "skill", "dashboards", "bayes", "frictionfinder", "chorus"],
  },
  {
    key: "university",
    title: "University projects at OvGU",
    note: "Team projects in the M.Sc. Data and Knowledge Engineering.",
    slugs: ["ais", "mic-forensics"],
  },
]

/** The twelve that ride the hero's helix, data engineering first; the first six land in its grid. */
export const HELIX_ORDER = [
  "ais", "validator", "weather-api", "rag-bot", "ticketing", "job-copilot",
  "dashboards", "sales-dashboard", "blunderchess", "skill", "bayes", "frictionfinder",
]

/** The poster cover of a project (with its name set in it), for cards and the hero. */
export const posterFile = (slug: string) => "covers/" + slug
/** The toned photograph alone, for a project page's own hero. The AIS page keeps its real cleaning map. */
export const photoFile = (p: Project) => (p.slug === "ais" ? p.cover : "covers/" + p.slug + "-photo")

/** Image sources for a photograph or a project cover, with the sizes on disk. */
export function img(file: string) {
  const base = "/img/" + file
  // covers are rendered at 1500 x 1000 with a 750 size beside
  if (file.startsWith("covers/")) return { src: base + ".webp", srcSet: `${base}-750.webp 750w, ${base}.webp 1500w` }
  // the AIS map has no 960 size; every other picture has 500, 960 and 1280
  if (file === "work-ais-elbe") return { src: base + ".webp", srcSet: `${base}-500.webp 500w, ${base}.webp 850w` }
  return { src: base + ".webp", srcSet: `${base}-500.webp 500w, ${base}-960.webp 960w, ${base}.webp 1280w` }
}

export const photo = (id: string) => photoRecords.find((p) => p.id === id)

/** Photographs used outside the project covers, by the place they sit. */
export const PAGE_PHOTOS = {
  magdeburg: { id: "f127222323", alt: "The Elbe in Magdeburg from above, with a lift bridge and green banks" },
  spree: { id: "f93736284", alt: "The Spree in Berlin-Mitte between stone embankments, a tour boat moored on the right" },
  mumbai: { id: "f149244153", alt: "The Mumbai skyline seen across the rocks at low tide from Carter Road, Bandra" },
  starlings: { id: "f138937860", alt: "A huge flock of starlings moving as one dark shape against a grey sky" },
  ovgu: { id: "f29155318", alt: "The steel letters of the Otto von Guericke University sign on the Magdeburg campus" },
  oberbaum: { id: "f30141750", alt: "The Oberbaum Bridge over the Spree in Berlin under a clear blue sky" },
  tennis: { id: "f83268763", alt: "An empty hard tennis court under a clear blue sky" },
  chess: { id: "f148042600", alt: "Wooden chess pieces on a board, seen close up" },
} as const

// the AIS cover's photograph (the AIS page itself shows the real cleaning map)
const SHIP: PhotoRecord = {
  id: "f50439748",
  alt: "A container ship on the river Elbe, bound for Hamburg",
  files: [],
  thumb: "covers/ais-photo",
  by: "Hummelhummel",
  licence: "CC BY-SA 3.0",
  licenceUrl: "https://creativecommons.org/licenses/by-sa/3.0",
  page: "https://commons.wikimedia.org/wiki/File:Container_ship_OOCL_Berlin_on_the_river_Elbe_with_the_port_of_destination_in_Hamburg_in_July_2016.jpg",
  source: "Wikimedia Commons",
}

/** Every photograph the site shows, for the credits page. */
export function usedPhotos() {
  const ids = new Set<string>([
    ...projects.filter((p) => p.cover.startsWith("photo-")).map((p) => p.cover.slice(6)),
    ...Object.values(PAGE_PHOTOS).map((p) => p.id),
  ])
  return [SHIP, ...[...ids].map((id) => photo(id)).filter((p): p is PhotoRecord => !!p)]
}

export const iconSrc = (icon: string | null) => (icon ? `/icons/${icon}.svg` : null)
