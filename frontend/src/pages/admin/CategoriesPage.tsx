import { useEffect, useState } from "react"
import { toast } from "sonner"
import { api } from "@/lib/api"
import type { Category } from "@/types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"

const empty = { name: "", slug: "", description: "", sort_order: 0, is_active: true }

export function CategoriesPage() {
  const [items, setItems] = useState<Category[]>([])
  const [form, setForm] = useState(empty)
  const [editingId, setEditingId] = useState<number | null>(null)

  const load = async () => setItems(await api.get<Category[]>("/api/v1/admin/categories"))
  useEffect(() => { void load() }, [])

  const save = async () => {
    try {
      if (editingId) await api.put(`/api/v1/admin/categories/${editingId}`, form)
      else await api.post("/api/v1/admin/categories", form)
      toast.success("Сохранено")
      setForm(empty)
      setEditingId(null)
      await load()
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Ошибка")
    }
  }

  const remove = async (id: number) => {
    if (!confirm("Удалить категорию и её блюда?")) return
    await api.delete(`/api/v1/admin/categories/${id}`)
    toast.success("Удалено")
    await load()
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-4xl">Категории</h1>
        <p className="text-muted-foreground">Структура меню</p>
      </div>
      <div className="grid gap-6 lg:grid-cols-[1fr_1.2fr]">
        <div className="space-y-4 rounded-3xl border border-border bg-card p-5">
          <h2 className="font-display text-2xl">{editingId ? "Редактирование" : "Новая категория"}</h2>
          <div className="space-y-2"><Label>Название</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value, slug: editingId ? form.slug : e.target.value.toLowerCase().replace(/\s+/g, "-") })} /></div>
          <div className="space-y-2"><Label>Slug</Label><Input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} /></div>
          <div className="space-y-2"><Label>Описание</Label><Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
          <div className="space-y-2"><Label>Порядок</Label><Input type="number" value={form.sort_order} onChange={(e) => setForm({ ...form, sort_order: Number(e.target.value) })} /></div>
          <div className="flex items-center justify-between"><Label>Активна</Label><Switch checked={form.is_active} onCheckedChange={(v) => setForm({ ...form, is_active: v })} /></div>
          <div className="flex gap-2">
            <Button onClick={() => void save()}>Сохранить</Button>
            {editingId && <Button variant="outline" onClick={() => { setEditingId(null); setForm(empty) }}>Отмена</Button>}
          </div>
        </div>
        <div className="space-y-3">
          {items.map((c) => (
            <div key={c.id} className="flex items-center justify-between gap-3 rounded-2xl border border-border bg-card p-4">
              <div>
                <p className="font-medium">{c.name}</p>
                <p className="text-sm text-muted-foreground">/{c.slug} · порядок {c.sort_order} · {c.is_active ? "активна" : "скрыта"}</p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => { setEditingId(c.id); setForm({ name: c.name, slug: c.slug, description: c.description, sort_order: c.sort_order, is_active: c.is_active }) }}>Изм.</Button>
                <Button variant="destructive" size="sm" onClick={() => void remove(c.id)}>Удал.</Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
