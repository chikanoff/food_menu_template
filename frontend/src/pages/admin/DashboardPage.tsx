import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { api } from "@/lib/api"
import type { DashboardStats } from "@/types"
import { Button } from "@/components/ui/button"

export function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  useEffect(() => {
    void api.get<DashboardStats>("/api/v1/admin/dashboard").then(setStats)
  }, [])

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-4xl">Обзор</h1>
        <p className="text-muted-foreground">Управление контентом видео-меню</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Категории", value: stats?.categories ?? "—" },
          { label: "Блюда", value: stats?.dishes ?? "—" },
          { label: "Акции", value: stats?.promotions ?? "—" },
          { label: "Публикация", value: stats?.is_published ? "Онлайн" : "Скрыто" },
        ].map((c) => (
          <div key={c.label} className="rounded-3xl border border-border bg-card p-5">
            <p className="text-sm text-muted-foreground">{c.label}</p>
            <p className="mt-2 font-display text-3xl">{c.value}</p>
          </div>
        ))}
      </div>
      <div className="flex flex-wrap gap-3">
        <Button asChild><Link to="/admin/dishes">Добавить блюдо</Link></Button>
        <Button asChild variant="outline"><Link to="/admin/categories">Категории</Link></Button>
        <Button asChild variant="outline"><Link to="/admin/promos">Акции</Link></Button>
      </div>
    </div>
  )
}
