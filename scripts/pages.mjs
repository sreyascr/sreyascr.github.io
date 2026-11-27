// After `vite build`: writes one HTML file per route, so GitHub Pages serves every page with a 200 (not the
// 404 fallback) and each carries its own title, description and link-preview card. The React app takes over
// in the browser as before. Run from the project root: node scripts/pages.mjs
import fs from "node:fs"
import path from "node:path"

const SITE = "https://sreyascr.github.io"
const dist = path.resolve("dist")
const shell = fs.readFileSync(path.join(dist, "index.html"), "utf8")
const all = JSON.parse(fs.readFileSync("src/data/projects.json", "utf8"))
// Audible work is a card on /projects only: no page of its own
const projects = all.filter((p) => !p.context.startsWith("Audible"))
const NAME = "Shreyas Challiyil"

const esc = (s) => s.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;")

function page({ route, title, description, image = "/og/site.jpg" }) {
  const url = SITE + route
  let html = shell
    .replace(/<title>[^<]*<\/title>/, `<title>${esc(title)}</title>`)
    .replace(/<meta name="description" content="[^"]*"/, `<meta name="description" content="${esc(description)}"`)
    .replace(/<meta property="og:title" content="[^"]*"/, `<meta property="og:title" content="${esc(title)}"`)
    .replace(/<meta property="og:description" content="[^"]*"/, `<meta property="og:description" content="${esc(description)}"`)
    .replace(/<meta property="og:image" content="[^"]*"/, `<meta property="og:image" content="${SITE}${image}"`)
  html = html.replace(
    "</head>",
    `    <link rel="canonical" href="${url}" />\n    <meta property="og:url" content="${url}" />\n    <meta property="og:image:width" content="1200" />\n    <meta property="og:image:height" content="628" />\n  </head>`,
  )
  return html
}

function write(file, html) {
  const out = path.join(dist, file)
  fs.mkdirSync(path.dirname(out), { recursive: true })
  fs.writeFileSync(out, html)
}

const home = {
  title: `${NAME}, data engineer in Berlin`,
  description: shell.match(/<meta name="description" content="([^"]*)"/)[1],
}
write("index.html", page({ route: "/", ...home }))
write("404.html", page({ route: "/", ...home }))

const pages = [
  { file: "projects/index.html", route: "/projects", title: `${all.length} data engineering projects · ${NAME}`, description: "Data pipelines, retrieval services and data apps first, then validation, dashboards and experiment analysis: personal builds, tools made at Audible and university projects at OvGU." },
  { file: "about.html", route: "/about", title: `About · ${NAME}`, description: "Data engineer in Berlin: working student at Audible, M.Sc. Data and Knowledge Engineering at OvGU Magdeburg, and 2.5 years as a data analyst at Jio Platforms." },
  { file: "interests.html", route: "/interests", title: `Interests · ${NAME}`, description: "Tennis, watches and chess: three notes from outside data work in Berlin." },
  { file: "credits.html", route: "/credits", title: `Photo credits · ${NAME}`, description: "The photographs on this site and their licences." },
]
for (const p of pages) write(p.file, page(p))

// each project at /projects/<slug> (projects/<slug>.html); the old static URL /projects/<slug>.html lands on the
// same file and the app moves it to the clean path
for (const p of projects) {
  write(`projects/${p.slug}.html`, page({ route: `/projects/${p.slug}`, title: `${p.name} · ${NAME}`, description: p.oneLine, image: `/og/${p.slug}.jpg` }))
}

const urls = ["/", ...pages.map((p) => p.route), ...projects.map((p) => `/projects/${p.slug}`)]
write("sitemap.xml", `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.map((u) => `  <url><loc>${SITE}${u}</loc></url>`).join("\n")}\n</urlset>\n`)
write("robots.txt", `User-agent: *\nAllow: /\nSitemap: ${SITE}/sitemap.xml\n`)
console.log(`pages: ${urls.length} routes written, plus 404.html, sitemap.xml and robots.txt`)
