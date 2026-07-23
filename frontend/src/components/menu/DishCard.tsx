import { Link } from "react-router-dom"
import { motion } from "motion/react"
import type { Dish } from "@/types"
import { formatPrice, mediaUrl } from "@/lib/utils"
import { SpotlightCard } from "@/components/magic/spotlight-card"

function primaryMedia(dish: Dish) {
  return dish.media.find((m) => m.is_primary) || dish.media[0]
}

export function DishCard({ dish, index = 0 }: { dish: Dish; index?: number }) {
  const media = primaryMedia(dish)
  const src = mediaUrl(media?.poster_url || media?.url)
  return (
    <motion.div
      initial={{ opacity: 0, y: 28, scale: 0.97 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ delay: index * 0.07, duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
    >
      <Link to={`/dish/${dish.slug}`} className="block">
        <SpotlightCard className="h-full">
          <div className="relative aspect-[4/5] overflow-hidden bg-muted">
            {media?.type === "video" && media.url ? (
              <video
                src={mediaUrl(media.url)}
                poster={mediaUrl(media.poster_url) || undefined}
                muted
                playsInline
                loop
                autoPlay
                preload="metadata"
                className="h-full w-full object-cover transition duration-700 ease-out group-hover:scale-110"
              />
            ) : src ? (
              <img src={src} alt={dish.name} className="h-full w-full object-cover transition duration-700 ease-out group-hover:scale-110" />
            ) : (
              <div className="grid h-full place-items-center text-muted-foreground">Нет фото</div>
            )}
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#1a1612]/80 via-transparent to-transparent opacity-80" />
            <div className="absolute inset-x-0 bottom-0 space-y-1 p-4 text-white">
              <div className="flex items-end justify-between gap-3">
                <h3 className="font-display text-2xl leading-tight tracking-tight">{dish.name}</h3>
                <p className="shrink-0 rounded-full bg-white/15 px-3 py-1 text-xs font-medium backdrop-blur-md ring-1 ring-white/20">
                  {formatPrice(dish.price, dish.currency)}
                </p>
              </div>
              {dish.description && <p className="line-clamp-2 text-sm text-white/70">{dish.description}</p>}
            </div>
          </div>
        </SpotlightCard>
      </Link>
    </motion.div>
  )
}
