import { useEffect, useState } from "react"
import { Link, useParams } from "react-router-dom"
import { ArrowLeft } from "lucide-react"
import { api } from "@/lib/api"
import type { Dish } from "@/types"
import { formatPrice, mediaUrl } from "@/lib/utils"
import { getPrimaryMedia } from "@/lib/media"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { BlurFade } from "@/components/magic/blur-fade"
import { DishVideoPlayer } from "@/components/menu/DishVideoPlayer"

export function DishPage() {
  const { slug } = useParams()
  const [dish, setDish] = useState<Dish | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!slug) return
    void api
      .get<Dish>(`/api/v1/dishes/${slug}`)
      .then(setDish)
      .catch((e) => setError(e instanceof Error ? e.message : "Не найдено"))
  }, [slug])

  if (error) return <div className="p-8 text-center">{error}</div>
  if (!dish) {
    return (
      <div className="mx-auto max-w-4xl space-y-4 px-4 py-8">
        <Skeleton className="aspect-video w-full rounded-[2rem]" />
        <Skeleton className="h-10 w-2/3" />
      </div>
    )
  }

  const primary = getPrimaryMedia(dish)
  // Gallery: never mount extra <video> — posters/photos only
  const gallery = dish.media.filter((m) => m.id !== primary?.id)

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <BlurFade>
        <Link to="/menu" className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground transition hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> Назад к меню
        </Link>
      </BlurFade>
      <div className="overflow-hidden rounded-[2rem] border border-border/80 bg-card/80 shadow-[0_40px_100px_-50px_rgba(26,22,18,0.55)]">
        <div className="relative aspect-[16/11] bg-muted">
          {primary?.type === "video" ? (
            <DishVideoPlayer src={primary.url} poster={primary.poster_url} />
          ) : primary ? (
            <img
              src={mediaUrl(primary.url)}
              alt={dish.name}
              className="h-full w-full object-cover"
              decoding="async"
              fetchPriority="high"
            />
          ) : null}
        </div>
        <div className="space-y-6 p-6 md:p-9">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h1 className="font-display text-4xl md:text-5xl">{dish.name}</h1>
              <div className="mt-4 flex flex-wrap gap-2">
                {dish.weight_g ? <Badge variant="accent">{dish.weight_g} г</Badge> : null}
                {dish.calories ? <Badge variant="outline">{dish.calories} ккал</Badge> : null}
              </div>
            </div>
            <p className="font-display text-4xl text-accent">{formatPrice(dish.price, dish.currency)}</p>
          </div>
          {dish.description && (
            <p className="max-w-prose text-lg leading-relaxed text-muted-foreground">{dish.description}</p>
          )}
          {dish.composition && (
            <div className="rounded-2xl bg-muted/50 p-4 ring-1 ring-border/60">
              <p className="eyebrow text-muted-foreground">Состав</p>
              <p className="mt-2 leading-relaxed">{dish.composition}</p>
            </div>
          )}
          {gallery.length > 0 && (
            <div className="grid grid-cols-3 gap-3 pt-2">
              {gallery.map((m) => {
                const thumb = m.type === "video" ? mediaUrl(m.poster_url) || "" : mediaUrl(m.url)
                return (
                  <div key={m.id} className="aspect-square overflow-hidden rounded-2xl bg-muted ring-1 ring-border/50">
                    {thumb ? (
                      <img src={thumb} alt="" className="h-full w-full object-cover" loading="lazy" decoding="async" />
                    ) : (
                      <div className="grid h-full place-items-center text-xs text-muted-foreground">Видео</div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
