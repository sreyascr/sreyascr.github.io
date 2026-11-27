import * as React from "react"
import { AnimatePresence, motion } from "motion/react"
import { ArrowUpRight } from "lucide-react"
import { ButtonLink, Picture, SectionHead, Wrap } from "@/components/site"
import { TABLEAU_SALES } from "@/lib/data"

const VIEWS = [
  { file: "work-sales-kpi", title: "KPIs and sales performance", alt: "KPI tiles above monthly sales lines for the Consumer, Corporate and Home Office segments" },
  { file: "work-sales-profit", title: "Profit by category and sub-category", alt: "Profit bars by product category and sub-category, with Tables in loss" },
  { file: "work-sales-segments", title: "Customer segmentation", alt: "A scatter plot of customers by sales and profit, the high-value customers picked out" },
  { file: "work-sales-geo", title: "Profit by state", alt: "A map of US states shaded by profit, California highest and Texas in loss" },
  { file: "work-sales-returns", title: "Return rates", alt: "Return rates by category and sub-category" },
  { file: "work-sales-shipping", title: "Shipping modes", alt: "Orders by shipping mode across categories and sub-categories" },
]

/** The six views of the Tableau case study: pick a tab, the screenshot changes. */
export default function SalesGallery() {
  const [i, setI] = React.useState(0)
  const v = VIEWS[i]
  return (
    <section className="py-24">
      <Wrap>
        <div className="flex flex-wrap items-end justify-between gap-6">
          <SectionHead eyebrow="The dashboard" title="Six linked views" />
          <ButtonLink href={TABLEAU_SALES} external>
            Open it on Tableau Public <ArrowUpRight className="size-4" aria-hidden="true" />
          </ButtonLink>
        </div>
        <div role="tablist" aria-label="Dashboard views" className="mt-10 flex flex-wrap gap-2">
          {VIEWS.map((x, k) => (
            <button
              key={x.file}
              role="tab"
              type="button"
              id={`view-tab-${k}`}
              aria-selected={k === i}
              aria-controls="view-panel"
              onClick={() => setI(k)}
              className={
                "min-h-11 rounded-md px-4 text-sm font-semibold transition-colors " +
                (k === i ? "bg-primary text-primary-foreground" : "bg-secondary text-ink hover:bg-border")
              }
            >
              {x.title}
            </button>
          ))}
        </div>
        <div
          id="view-panel"
          role="tabpanel"
          aria-labelledby={`view-tab-${i}`}
          className="relative mt-6 aspect-video overflow-hidden rounded-lg border border-border bg-white"
        >
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={v.file}
              className="absolute inset-0"
              initial={{ opacity: 0, scale: 1.01 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
            >
              <Picture file={v.file} alt={v.alt} className="object-contain" sizes="(min-width: 1280px) 1216px, 100vw" />
            </motion.div>
          </AnimatePresence>
        </div>
        <p className="mt-3 text-sm text-muted-foreground">Screenshots of my Tableau workbook; the live version is interactive.</p>
      </Wrap>
    </section>
  )
}
