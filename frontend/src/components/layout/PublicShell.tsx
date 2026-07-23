import { useEffect } from "react"
import { useOutlet, useLocation } from "react-router-dom"
import { AnimatePresence, motion } from "motion/react"
import { useRestaurant } from "@/features/public-menu/RestaurantProvider"
import { SiteHeader } from "./SiteHeader"
import { SiteFooter } from "./SiteFooter"
import { Skeleton } from "@/components/ui/skeleton"
import { AmbientBackground } from "@/components/magic/ambient-background"

function pageTransitionKey(pathname: string) {
  const [section] = pathname.split("/").filter(Boolean)
  // Keep MenuPage mounted when switching categories — avoid refetch
  if (section === "menu") return "/menu"
  return pathname
}

export function PublicShell() {
  const { restaurant, loading, error } = useRestaurant()
  const location = useLocation()
  const outlet = useOutlet()
  const isHome = location.pathname === "/"
  const transitionKey = pageTransitionKey(location.pathname)

  useEffect(() => {
    // Prevent browser restore-scroll leaving a cream strip under the hero
    window.scrollTo({ top: 0, left: 0, behavior: "auto" })
  }, [transitionKey])

  if (loading) {
    return (
      <div className="relative min-h-screen space-y-4 p-4">
        <AmbientBackground />
        <Skeleton className="h-16 w-full rounded-2xl" />
        <Skeleton className="h-[70vh] w-full rounded-[2rem]" />
      </div>
    )
  }

  if (error || !restaurant) {
    return <div className="grid min-h-screen place-items-center p-6 text-center">{error || "Ресторан не найден"}</div>
  }

  return (
    <div className="relative flex min-h-screen flex-col">
      <AmbientBackground />
      <SiteHeader restaurant={restaurant} />
      <main className="relative flex-1">
        <AnimatePresence mode="wait">
          <motion.div
            key={transitionKey}
            initial={{ opacity: 0, y: isHome ? 0 : 14 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: isHome ? 0 : -10 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          >
            {outlet}
          </motion.div>
        </AnimatePresence>
      </main>
      <SiteFooter restaurant={restaurant} />
    </div>
  )
}
