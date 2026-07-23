import { createContext, useContext, useEffect, useMemo, useState } from "react"
import { api } from "@/lib/api"
import type { Restaurant } from "@/types"

type Ctx = {
  restaurant: Restaurant | null
  loading: boolean
  error: string | null
  refresh: () => Promise<void>
}

const RestaurantContext = createContext<Ctx | null>(null)

function applyTheme(r: Restaurant) {
  const root = document.documentElement
  root.style.setProperty("--brand-primary", r.primary_color)
  root.style.setProperty("--brand-accent", r.accent_color)
  document.title = r.name
}

export function RestaurantProvider({ children }: { children: React.ReactNode }) {
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const refresh = async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await api.get<Restaurant>("/api/v1/restaurant")
      setRestaurant(data)
      applyTheme(data)
    } catch (e) {
      setError(e instanceof Error ? e.message : "Ошибка загрузки")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void refresh()
  }, [])

  const value = useMemo(() => ({ restaurant, loading, error, refresh }), [restaurant, loading, error])
  return <RestaurantContext.Provider value={value}>{children}</RestaurantContext.Provider>
}

export function useRestaurant() {
  const ctx = useContext(RestaurantContext)
  if (!ctx) throw new Error("useRestaurant must be used within RestaurantProvider")
  return ctx
}
