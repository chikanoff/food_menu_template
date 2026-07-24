import { Link } from "react-router-dom"
import { motion } from "motion/react"
import type { Category } from "@/types"
import { cn } from "@/lib/utils"

export function CategoryNav({ categories, activeSlug }: { categories: Category[]; activeSlug?: string }) {
  return (
    <div className="sticky top-[4.25rem] z-30 -mx-4 overflow-x-auto border-b border-border/50 bg-background/90 px-4 py-3 backdrop-blur-sm">
      <div className="mx-auto flex max-w-6xl gap-2">
        {[
          { slug: undefined as string | undefined, name: "Все", to: "/menu" },
          ...categories.map((c) => ({ slug: c.slug, name: c.name, to: `/menu/${c.slug}` })),
        ].map((c, i) => {
          const active = activeSlug === c.slug || (!activeSlug && !c.slug)
          return (
            <motion.div key={c.to} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
              <Link
                to={c.to}
                className={cn(
                  "relative inline-flex shrink-0 items-center rounded-full px-4 py-2 text-sm font-medium transition",
                  active ? "text-primary-foreground" : "bg-card/70 text-muted-foreground ring-1 ring-border/70 hover:text-foreground"
                )}
              >
                {active && (
                  <motion.span
                    layoutId="category-pill"
                    className="absolute inset-0 rounded-full bg-primary shadow-[0_10px_30px_-12px_rgba(26,22,18,0.7)]"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
                <span className="relative">{c.name}</span>
              </Link>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}
