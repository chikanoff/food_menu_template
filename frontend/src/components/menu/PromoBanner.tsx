import { motion } from "motion/react"
import type { Promotion } from "@/types"
import { SpotlightCard } from "@/components/magic/spotlight-card"
import { mediaUrl } from "@/lib/utils"

export function PromoBanner({ promo }: { promo: Promotion }) {
  return (
    <SpotlightCard>
      <div className="grid md:grid-cols-2">
        <div className="relative aspect-[16/11] overflow-hidden bg-muted md:aspect-auto md:min-h-72">
          {promo.image_url ? (
            <motion.img
              src={mediaUrl(promo.image_url)}
              alt=""
              className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
              initial={{ scale: 1.06 }}
              whileInView={{ scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 1 }}
            />
          ) : (
            <div className="grid h-full place-items-center bg-gradient-to-br from-primary to-[#3a322a] text-white/70">Акция</div>
          )}
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-transparent to-card/10 md:bg-gradient-to-l" />
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
