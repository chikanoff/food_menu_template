import { Link, NavLink } from "react-router-dom"
import { Menu, X } from "lucide-react"
import { useState } from "react"
import { AnimatePresence, motion } from "motion/react"
import type { Restaurant } from "@/types"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

const links = [
  { to: "/menu", label: "Меню" },
  { to: "/promos", label: "Акции" },
  { to: "/contacts", label: "Контакты" },
]

export function SiteHeader({ restaurant }: { restaurant: Restaurant }) {
  const [open, setOpen] = useState(false)
  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-[#1a1612]/80 text-[#f7f2ea] backdrop-blur-md">
      <div className="mx-auto flex h-[4.25rem] max-w-6xl items-center justify-between px-4">
        <Link to="/" className="group flex items-center gap-3">
          {restaurant.logo_url ? (
            <img src={restaurant.logo_url} alt="" className="h-10 w-10 rounded-full object-cover ring-1 ring-white/20 transition group-hover:ring-accent/60" />
          ) : (
            <span className="grid h-10 w-10 place-items-center rounded-full bg-accent text-sm text-accent-foreground shadow-[0_0_24px_color-mix(in_oklab,var(--color-accent)_45%,transparent)]">
              VM
            </span>
          )}
          <span className="font-display text-2xl tracking-tight transition group-hover:text-accent">{restaurant.name}</span>
        </Link>
        <nav className="hidden items-center gap-1 md:flex">
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              className={({ isActive }) =>
                cn(
                  "relative rounded-full px-4 py-2 text-sm font-medium transition",
                  isActive ? "text-white" : "text-white/65 hover:text-white"
                )
              }
            >
              {({ isActive }) => (
                <>
                  {isActive && (
                    <motion.span
                      layoutId="nav-pill"
                      className="absolute inset-0 rounded-full bg-white/10 ring-1 ring-white/15"
                      transition={{ type: "spring", stiffness: 380, damping: 30 }}
                    />
                  )}
                  <span className="relative">{l.label}</span>
                </>
              )}
            </NavLink>
          ))}
        </nav>
        <Button variant="ghost" size="icon" className="text-white hover:bg-white/10 md:hidden" onClick={() => setOpen((v) => !v)} aria-label="Меню">
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
      </div>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden border-t border-white/10 md:hidden"
          >
            <div className="flex flex-col gap-1 px-4 py-3">
              {links.map((l, i) => (
                <motion.div key={l.to} initial={{ x: -12, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: i * 0.05 }}>
                  <Link to={l.to} onClick={() => setOpen(false)} className="block rounded-xl px-3 py-3 text-white/85 hover:bg-white/10">
                    {l.label}
                  </Link>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}
