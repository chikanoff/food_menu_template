import { useEffect, useState } from "react"
import { Link, useParams } from "react-router-dom"
import { ArrowLeft } from "lucide-react"
import { motion } from "motion/react"
import { api } from "@/lib/api"
import type { Dish } from "@/types"
import { formatPrice, mediaUrl } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { BlurFade } from "@/components/magic/blur-fade"
import { TextReveal } from "@/components/magic/text-reveal"

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

  const primary = dish.media.find((m) => m.is_primary) || dish.media[0]
  const gallery = dish.media.filter((m) => m.id !== primary?.id)

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <BlurFade>
        <Link to="/menu" className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground transition hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> Назад к меню
        </Link>
      </BlurFade>
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
        className="overflow-hidden rounded-[2rem] border border-border/80 bg-card/80 shadow-[0_40px_100px_-50px_rgba(26,22,18,0.55)] backdrop-blur-md"
      >
        <div className="relative aspect-[16/11] bg-muted">
          {primary?.type === "video" ? (
            <video
              src={mediaUrl(primary.url)}
              poster={mediaUrl(primary.poster_url) || undefined}
              controls
              playsInline
              muted
              autoPlay
              loop
              preload="metadata"
              className="h-full w-full object-cover"
            />
          ) : primary ? (
            <motion.img
              src={mediaUrl(primary.url)}
              alt={dish.name}
              className="h-full w-full object-cover"
              initial={{ scale: 1.08 }}
              animate={{ scale: 1 }}
              transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
            />
          ) : null}
        </div>
        <div className="space-y-6 p-6 md:p-9">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <TextReveal text={dish.name} className="font-display text-4xl md:text-5xl" />
              <div className="mt-4 flex flex-wrap gap-2">
                {dish.weight_g ? <Badge variant="accent">{dish.weight_g} г</Badge> : null}
                {dish.calories ? <Badge variant="outline">{dish.calories} ккал</Badge> : null}
              </div>
            </div>
            <BlurFade delay={0.2}>
              <p className="font-display text-4xl text-accent">{formatPrice(dish.price, dish.currency)}</p>
            </BlurFade>
          </div>
          {dish.description && (
            <BlurFade delay={0.12}>
              <p className="max-w-prose text-lg leading-relaxed text-muted-foreground">{dish.description}</p>
            </BlurFade>
          )}
          {dish.composition && (
            <BlurFade delay={0.18}>
              <div className="rounded-2xl bg-muted/50 p-4 ring-1 ring-border/60">
                <p className="eyebrow text-muted-foreground">Состав</p>
                <p className="mt-2 leading-relaxed">{dish.composition}</p>
              </div>
            </BlurFade>
          )}
          {gallery.length > 0 && (
            <div className="grid grid-cols-3 gap-3 pt-2">
              {gallery.map((m, i) => (
                <motion.div
                  key={m.id}
                  initial={{ opacity: 0, y: 12 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.06 }}
                  className="aspect-square overflow-hidden rounded-2xl bg-muted ring-1 ring-border/50"
                >
                  {m.type === "video" ? (
                    <video src={mediaUrl(m.url)} className="h-full w-full object-cover" muted playsInline />
                  ) : (
                    <img src={mediaUrl(m.url)} alt="" className="h-full w-full object-cover transition duration-500 hover:scale-105" />
                  )}
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </motion.div>
    </div>
  )
}
