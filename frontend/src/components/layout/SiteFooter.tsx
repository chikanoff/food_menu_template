import { Link } from "react-router-dom"
import type { Restaurant } from "@/types"

export function SiteFooter({ restaurant }: { restaurant: Restaurant }) {
  return (
    <footer className="relative mt-auto overflow-hidden border-t border-white/10 bg-[#1a1612] text-[#f5f0e8]">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_0%,color-mix(in_oklab,var(--color-accent)_25%,transparent),transparent_45%)]" />
      <div className="relative mx-auto flex max-w-6xl flex-col gap-6 px-4 py-12 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="eyebrow text-white/45">VideoMenu</p>
          <p className="mt-2 font-display text-4xl tracking-tight">{restaurant.name}</p>
          <p className="mt-2 max-w-md text-sm leading-relaxed text-white/55">{restaurant.address}</p>
        </div>
        <div className="space-y-2 text-sm text-white/70">
          <p>{restaurant.working_hours}</p>
          <a href={`tel:${restaurant.phone}`} className="block transition hover:text-accent">{restaurant.phone}</a>
          <Link to="/menu" className="inline-block pt-2 text-accent transition hover:opacity-80">Смотреть меню →</Link>
        </div>
      </div>
    </footer>
  )
}
