import { MapPin, Phone, Clock, Instagram, Send } from "lucide-react"
import { motion } from "motion/react"
import { useRestaurant } from "@/features/public-menu/RestaurantProvider"
import { BlurFade } from "@/components/magic/blur-fade"
import { TextReveal } from "@/components/magic/text-reveal"
import { Button } from "@/components/ui/button"

export function ContactsPage() {
  const { restaurant } = useRestaurant()
  if (!restaurant) return null

  const rows = [
    { icon: MapPin, label: "Адрес", value: restaurant.address },
    { icon: Phone, label: "Телефон", value: restaurant.phone, href: `tel:${restaurant.phone}` },
    { icon: Clock, label: "Часы работы", value: restaurant.working_hours },
  ]

  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <BlurFade>
        <p className="eyebrow text-muted-foreground">Как нас найти</p>
      </BlurFade>
      <TextReveal text="Контакты" className="mb-10 mt-2 font-display text-5xl md:text-6xl" />
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
        className="space-y-5 rounded-[2rem] border border-border/80 bg-card/75 p-6 shadow-[0_30px_80px_-48px_rgba(26,22,18,0.5)] backdrop-blur-md md:p-9"
      >
        {rows.map((row, i) => (
          <motion.div
            key={row.label}
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 + i * 0.07 }}
            className="flex gap-4 rounded-2xl bg-muted/40 p-4 ring-1 ring-border/50"
          >
            <row.icon className="mt-1 h-5 w-5 text-accent" />
            <div>
              <p className="eyebrow text-muted-foreground">{row.label}</p>
              {"href" in row && row.href ? (
                <a href={row.href} className="mt-1 block text-lg transition hover:text-accent">{row.value}</a>
              ) : (
                <p className="mt-1 text-lg">{row.value}</p>
              )}
            </div>
          </motion.div>
        ))}
        <div className="flex flex-wrap gap-3 pt-2">
          {restaurant.whatsapp_url && <Button asChild variant="accent"><a href={restaurant.whatsapp_url} target="_blank" rel="noreferrer">WhatsApp</a></Button>}
          {restaurant.telegram_url && <Button asChild variant="outline"><a href={restaurant.telegram_url} target="_blank" rel="noreferrer"><Send className="h-4 w-4" /> Telegram</a></Button>}
          {restaurant.instagram_url && <Button asChild variant="outline"><a href={restaurant.instagram_url} target="_blank" rel="noreferrer"><Instagram className="h-4 w-4" /> Instagram</a></Button>}
          {restaurant.map_url && <Button asChild variant="ghost"><a href={restaurant.map_url} target="_blank" rel="noreferrer">На карте</a></Button>}
        </div>
      </motion.div>
    </div>
  )
}
