import type { Promotion } from "@/types"
import { SpotlightCard } from "@/components/magic/spotlight-card"
import { mediaUrl } from "@/lib/utils"

export function PromoBanner({ promo }: { promo: Promotion }) {
  return (
    <SpotlightCard>
      <div className="grid md:grid-cols-2">
        <div className="relative aspect-[16/11] overflow-hidden bg-muted md:aspect-auto md:min-h-72">
          {promo.image_url ? (
            <img
              src={mediaUrl(promo.image_url)}
              alt=""
              className="h-full w-full object-cover"
              loading="lazy"
              decoding="async"
            />
          ) : (
            <div className="grid h-full place-items-center bg-gradient-to-br from-primary to-[#3a322a] text-white/70">Акция</div>
          )}
        </div>
        <div className="flex flex-col justify-center gap-4 p-6 md:p-10">
          <p className="eyebrow text-muted-foreground">Акция</p>
          <h3 className="font-display text-3xl leading-tight md:text-4xl">{promo.title}</h3>
          <p className="max-w-prose leading-relaxed text-muted-foreground">{promo.description}</p>
        </div>
      </div>
    </SpotlightCard>
  )
}
