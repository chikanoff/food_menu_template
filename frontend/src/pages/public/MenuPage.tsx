import { useEffect, useMemo, useState } from "react"
import { useParams } from "react-router-dom"
import { api } from "@/lib/api"
import type { Category, Dish } from "@/types"
import { CategoryNav } from "@/components/menu/CategoryNav"
import { DishCard } from "@/components/menu/DishCard"
import { Skeleton } from "@/components/ui/skeleton"
import { BlurFade } from "@/components/magic/blur-fade"
import { TextReveal } from "@/components/magic/text-reveal"

type MenuCategory = Category & { dishes: Dish[] }

export function MenuPage() {
  const { category: categorySlug } = useParams()
  const [menu, setMenu] = useState<MenuCategory[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)
    void api
      .get<MenuCategory[]>("/api/v1/menu")
      .then((data) => {
        if (!cancelled) setMenu(data)
      })
      .catch((e) => {
        if (!cancelled) setError(e instanceof Error ? e.message : "Ошибка загрузки")
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "auto" })
  }, [categorySlug])

  const categories = useMemo(
    () => menu.map(({ dishes: _dishes, ...c }) => c),
    [menu]
  )

  const activeCategory = useMemo(
    () => (categorySlug ? menu.find((c) => c.slug === categorySlug) : undefined),
    [menu, categorySlug]
  )

  const dishes = useMemo(() => {
    if (categorySlug) return activeCategory?.dishes ?? []
    return menu.flatMap((c) => c.dishes)
  }, [menu, categorySlug, activeCategory])

  const title = categorySlug ? (activeCategory?.name ?? "Меню") : "Меню"

  return (
    <div className="mx-auto max-w-6xl px-4 pb-20">
      <CategoryNav categories={categories} activeSlug={categorySlug} />
      <div className="py-10">
        <BlurFade>
          <p className="eyebrow text-muted-foreground">Каталог</p>
        </BlurFade>
        <TextReveal key={title} text={title} className="mt-2 font-display text-5xl md:text-6xl" delay={0.05} />
      </div>
      {loading ? (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="aspect-[4/5] w-full rounded-[1.75rem]" />
          ))}
        </div>
      ) : error ? (
        <p className="text-destructive">{error}</p>
      ) : categorySlug && !activeCategory ? (
        <p className="text-muted-foreground">Категория не найдена.</p>
      ) : dishes.length === 0 ? (
        <p className="text-muted-foreground">Пока нет блюд в этой категории.</p>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {dishes.map((d, i) => (
            <DishCard key={d.id} dish={d} index={i} />
          ))}
        </div>
      )}
    </div>
  )
}
