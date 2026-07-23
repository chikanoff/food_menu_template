import { useEffect, useState } from "react"
import { api } from "@/lib/api"
import type { Promotion } from "@/types"
import { PromoBanner } from "@/components/menu/PromoBanner"
import { BlurFade } from "@/components/magic/blur-fade"
import { TextReveal } from "@/components/magic/text-reveal"

export function PromosPage() {
  const [promos, setPromos] = useState<Promotion[]>([])
  useEffect(() => {
    void api.get<Promotion[]>("/api/v1/promotions").then(setPromos)
  }, [])

  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <BlurFade>
        <p className="eyebrow text-muted-foreground">Специально для вас</p>
      </BlurFade>
      <TextReveal text="Акции" className="mb-10 mt-2 font-display text-5xl md:text-6xl" />
      <div className="space-y-6">
        {promos.length === 0 ? (
          <p className="text-muted-foreground">Сейчас активных акций нет.</p>
        ) : (
          promos.map((p, i) => (
            <BlurFade key={p.id} delay={i * 0.08}>
              <PromoBanner promo={p} />
            </BlurFade>
          ))
        )}
      </div>
    </div>
  )
}
