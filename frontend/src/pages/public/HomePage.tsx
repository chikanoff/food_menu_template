import { Link } from "react-router-dom"
import { useEffect, useState } from "react"
import { ArrowRight } from "lucide-react"
import { motion } from "motion/react"
import { api } from "@/lib/api"
import type { Dish, Promotion } from "@/types"
import { useRestaurant } from "@/features/public-menu/RestaurantProvider"
import { Button } from "@/components/ui/button"
import { BlurFade } from "@/components/magic/blur-fade"
import { TextReveal } from "@/components/magic/text-reveal"
import { DishCard } from "@/components/menu/DishCard"
import { PromoBanner } from "@/components/menu/PromoBanner"
import { mediaUrl } from "@/lib/utils"

export function HomePage() {
  const { restaurant } = useRestaurant()
  const [featured, setFeatured] = useState<Dish[]>([])
  const [promos, setPromos] = useState<Promotion[]>([])

  useEffect(() => {
    void api.get<Dish[]>("/api/v1/dishes?featured=true").then(setFeatured).catch(() => setFeatured([]))
    void api.get<Promotion[]>("/api/v1/promotions").then(setPromos).catch(() => setPromos([]))
  }, [])

  if (!restaurant) return null

  return (
    <div>
      <section className="relative isolate min-h-[92vh] overflow-hidden">
        <div className="absolute inset-0">
          {restaurant.cover_url ? (
            <motion.img
              src={mediaUrl(restaurant.cover_url)}
              alt=""
              className="h-full w-full object-cover"
              initial={{ scale: 1.12 }}
              animate={{ scale: 1 }}
              transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1] }}
            />
          ) : (
            <div className="h-full w-full bg-[radial-gradient(circle_at_18%_20%,color-mix(in_oklab,var(--color-accent)_40%,transparent),transparent_42%),radial-gradient(circle_at_85%_15%,rgba(255,255,255,0.12),transparent_35%),linear-gradient(165deg,#1a1612_0%,#2c2620_48%,#171310_100%)]" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-[#1a1612] via-[#1a1612]/60 to-[#1a1612]/20" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_20%,rgba(26,22,18,0.45)_100%)]" />
          <motion.div
            aria-hidden
            className="absolute -left-10 top-1/4 h-64 w-64 rounded-full bg-accent/25 blur-3xl"
            animate={{ opacity: [0.35, 0.7, 0.35], scale: [1, 1.15, 1] }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          />
        </div>

        <div className="relative mx-auto flex min-h-[92vh] max-w-6xl flex-col justify-end px-4 pb-20 pt-28 text-white">
          <BlurFade>
            <p className="eyebrow mb-4 text-white/65">Видео-меню</p>
          </BlurFade>
          <TextReveal text={restaurant.name} className="max-w-4xl font-display text-5xl leading-[0.92] md:text-7xl lg:text-8xl" />
          <BlurFade delay={0.28}>
            <p className="mt-6 max-w-xl text-base leading-relaxed text-white/75 md:text-lg">{restaurant.description}</p>
          </BlurFade>
          <BlurFade delay={0.38}>
            <div className="mt-9 flex flex-wrap gap-3">
              <Button asChild variant="accent" size="lg" className="shadow-[0_18px_40px_-18px_color-mix(in_oklab,var(--color-accent)_80%,transparent)]">
                <Link to="/menu">
                  Смотреть меню <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="border-white/25 bg-white/5 text-white backdrop-blur-md hover:bg-white/12">
                <Link to="/contacts">Контакты</Link>
              </Button>
            </div>
          </BlurFade>
        </div>
      </section>

      {featured.length > 0 && (
        <section className="relative mx-auto max-w-6xl px-4 py-20">
          <BlurFade>
            <div className="mb-10 flex items-end justify-between gap-4">
              <div>
                <p className="eyebrow text-muted-foreground">Избранное</p>
                <h2 className="mt-2 font-display text-4xl md:text-5xl">
                  Блюда <span className="font-display-italic text-accent">вечера</span>
                </h2>
              </div>
              <Link to="/menu" className="text-sm font-medium text-muted-foreground transition hover:text-foreground">
                Всё меню →
              </Link>
            </div>
          </BlurFade>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {featured.map((d, i) => (
              <DishCard key={d.id} dish={d} index={i} />
            ))}
          </div>
        </section>
      )}

      {promos[0] && (
        <section className="mx-auto max-w-6xl px-4 pb-20">
          <BlurFade>
            <PromoBanner promo={promos[0]} />
          </BlurFade>
        </section>
      )}
    </div>
  )
}
