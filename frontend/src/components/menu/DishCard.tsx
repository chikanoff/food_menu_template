import { Link } from "react-router-dom"
import { Play } from "lucide-react"
import type { Dish } from "@/types"
import { formatPrice, cn } from "@/lib/utils"
import { getDishCover } from "@/lib/media"
import { SpotlightCard } from "@/components/magic/spotlight-card"

export function DishCard({ dish, index = 0 }: { dish: Dish; index?: number }) {
  const { src, hasVideo } = getDishCover(dish)

  return (
    <article
      className="dish-card"
      style={{
        contentVisibility: "auto",
        containIntrinsicSize: "0 400px",
      }}
    >
      <Link to={`/dish/${dish.slug}`} className="block">
        <SpotlightCard className="h-full">
          <div className="relative aspect-[4/5] overflow-hidden bg-muted">
            {src ? (
              <img
                src={src}
                alt={dish.name}
                loading={index < 4 ? "eager" : "lazy"}
                decoding="async"
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                className="h-full w-full object-cover transition duration-500 ease-out group-hover:scale-[1.03]"
              />
            ) : (
              <div className="grid h-full place-items-center text-muted-foreground">Нет фото</div>
            )}

            {hasVideo && (
              <span
                className={cn(
                  "absolute right-3 top-3 inline-flex items-center gap-1 rounded-full",
                  "bg-black/45 px-2.5 py-1 text-[11px] font-medium text-white backdrop-blur-sm ring-1 ring-white/20"
                )}
              >
                <Play className="h-3 w-3 fill-current" />
                Видео
              </span>
            )}

            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#1a1612]/85 via-[#1a1612]/15 to-transparent" />
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
    </article>
  )
}
