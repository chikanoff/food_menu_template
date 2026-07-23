import { useEffect, useState } from "react"
import { toast } from "sonner"
import { api } from "@/lib/api"
import type { Category, Dish, DishMedia } from "@/types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"

type Form = {
  category_id: number
  name: string
  slug: string
  description: string
  composition: string
  price: number
  currency: string
  weight_g: number | ""
  calories: number | ""
  is_available: boolean
  is_featured: boolean
  sort_order: number
}

const emptyForm = (categoryId = 0): Form => ({
  category_id: categoryId,
  name: "",
  slug: "",
  description: "",
  composition: "",
  price: 0,
  currency: "₽",
  weight_g: "",
  calories: "",
  is_available: true,
  is_featured: false,
  sort_order: 0,
})

export function DishesPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [dishes, setDishes] = useState<Dish[]>([])
  const [filter, setFilter] = useState<number | "all">("all")
  const [form, setForm] = useState<Form>(emptyForm())
  const [editingId, setEditingId] = useState<number | null>(null)
  const [mediaUrl, setMediaUrl] = useState("")
  const [mediaType, setMediaType] = useState<"photo" | "video">("photo")

  const load = async () => {
    const cats = await api.get<Category[]>("/api/v1/admin/categories")
    setCategories(cats)
    const path = filter === "all" ? "/api/v1/admin/dishes" : `/api/v1/admin/dishes?category_id=${filter}`
    setDishes(await api.get<Dish[]>(path))
    if (!form.category_id && cats[0]) setForm((f) => ({ ...f, category_id: cats[0].id }))
  }

  useEffect(() => { void load() }, [filter])

  const payload = () => ({
    ...form,
    weight_g: form.weight_g === "" ? null : Number(form.weight_g),
    calories: form.calories === "" ? null : Number(form.calories),
  })

  const save = async () => {
    try {
      if (editingId) await api.put(`/api/v1/admin/dishes/${editingId}`, payload())
      else await api.post("/api/v1/admin/dishes", payload())
      toast.success("Блюдо сохранено")
      setEditingId(null)
      setForm(emptyForm(form.category_id))
      await load()
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Ошибка")
    }
  }

  const remove = async (id: number) => {
    if (!confirm("Удалить блюдо?")) return
    await api.delete(`/api/v1/admin/dishes/${id}`)
    toast.success("Удалено")
    await load()
  }

  const upload = async (file: File) => {
    const body = new FormData()
    body.append("file", file)
    const res = await api.post<{ url: string }>("/api/v1/admin/upload", body)
    setMediaUrl(res.url)
    setMediaType(file.type.startsWith("video/") ? "video" : "photo")
    toast.success("Файл загружен")
  }

  const attachMedia = async () => {
    if (!editingId || !mediaUrl) return
    await api.post(`/api/v1/admin/dishes/${editingId}/media`, {
      type: mediaType,
      url: mediaUrl,
      is_primary: true,
      sort_order: 0,
    })
    toast.success("Медиа добавлено")
    setMediaUrl("")
    await load()
  }

  const removeMedia = async (id: number) => {
    await api.delete(`/api/v1/admin/media/${id}`)
    toast.success("Медиа удалено")
    await load()
  }

  const editing = editingId ? dishes.find((d) => d.id === editingId) : null

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-4xl">Блюда</h1>
          <p className="text-muted-foreground">Контент и медиа</p>
        </div>
        <select className="h-11 rounded-xl border border-border bg-card px-3" value={filter} onChange={(e) => setFilter(e.target.value === "all" ? "all" : Number(e.target.value))}>
          <option value="all">Все категории</option>
          {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_1.1fr]">
        <div className="space-y-4 rounded-3xl border border-border bg-card p-5">
          <h2 className="font-display text-2xl">{editingId ? "Редактирование" : "Новое блюдо"}</h2>
          <div className="space-y-2"><Label>Категория</Label>
            <select className="h-11 w-full rounded-xl border border-border bg-card px-3" value={form.category_id} onChange={(e) => setForm({ ...form, category_id: Number(e.target.value) })}>
              {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div className="space-y-2"><Label>Название</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value, slug: editingId ? form.slug : e.target.value.toLowerCase().replace(/[^a-zа-я0-9]+/gi, "-") })} /></div>
          <div className="space-y-2"><Label>Slug</Label><Input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} /></div>
          <div className="space-y-2"><Label>Описание</Label><Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
          <div className="space-y-2"><Label>Состав</Label><Textarea value={form.composition} onChange={(e) => setForm({ ...form, composition: e.target.value })} /></div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2"><Label>Цена</Label><Input type="number" value={form.price} onChange={(e) => setForm({ ...form, price: Number(e.target.value) })} /></div>
            <div className="space-y-2"><Label>Валюта</Label><Input value={form.currency} onChange={(e) => setForm({ ...form, currency: e.target.value })} /></div>
            <div className="space-y-2"><Label>Вес, г</Label><Input type="number" value={form.weight_g} onChange={(e) => setForm({ ...form, weight_g: e.target.value === "" ? "" : Number(e.target.value) })} /></div>
            <div className="space-y-2"><Label>Ккал</Label><Input type="number" value={form.calories} onChange={(e) => setForm({ ...form, calories: e.target.value === "" ? "" : Number(e.target.value) })} /></div>
          </div>
          <div className="flex items-center justify-between"><Label>Доступно</Label><Switch checked={form.is_available} onCheckedChange={(v) => setForm({ ...form, is_available: v })} /></div>
          <div className="flex items-center justify-between"><Label>В избранном</Label><Switch checked={form.is_featured} onCheckedChange={(v) => setForm({ ...form, is_featured: v })} /></div>
          <div className="flex gap-2">
            <Button onClick={() => void save()}>Сохранить</Button>
            {editingId && <Button variant="outline" onClick={() => { setEditingId(null); setForm(emptyForm(form.category_id)) }}>Отмена</Button>}
          </div>

          {editingId && (
            <div className="space-y-3 border-t border-border pt-4">
              <h3 className="font-medium">Медиа</h3>
              <Input type="file" accept="image/*,video/mp4,video/webm" onChange={(e) => e.target.files?.[0] && void upload(e.target.files[0])} />
              <div className="flex gap-2">
                <Input placeholder="URL медиа" value={mediaUrl} onChange={(e) => setMediaUrl(e.target.value)} />
                <Button type="button" onClick={() => void attachMedia()}>Добавить</Button>
              </div>
              <div className="space-y-2">
                {(editing?.media || []).map((m: DishMedia) => (
                  <div key={m.id} className="flex items-center justify-between rounded-xl bg-muted px-3 py-2 text-sm">
                    <span>{m.type} · {m.is_primary ? "primary" : "extra"}</span>
                    <Button size="sm" variant="destructive" onClick={() => void removeMedia(m.id)}>Удал.</Button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="space-y-3">
          {dishes.map((d) => (
            <div key={d.id} className="rounded-2xl border border-border bg-card p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-medium">{d.name}</p>
                  <p className="text-sm text-muted-foreground">{d.price} {d.currency} · /{d.slug}</p>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => {
                    setEditingId(d.id)
                    setForm({
                      category_id: d.category_id,
                      name: d.name,
                      slug: d.slug,
                      description: d.description,
                      composition: d.composition,
                      price: Number(d.price),
                      currency: d.currency,
                      weight_g: d.weight_g ?? "",
                      calories: d.calories ?? "",
                      is_available: d.is_available,
                      is_featured: d.is_featured,
                      sort_order: d.sort_order,
                    })
                  }}>Изм.</Button>
                  <Button size="sm" variant="destructive" onClick={() => void remove(d.id)}>Удал.</Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
