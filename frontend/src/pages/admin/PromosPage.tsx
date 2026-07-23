import { useEffect, useState } from "react"
import { toast } from "sonner"
import { api } from "@/lib/api"
import type { Promotion } from "@/types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"

const empty = {
  title: "",
  description: "",
  image_url: "",
  video_url: "",
  is_active: true,
  sort_order: 0,
}

export function AdminPromosPage() {
  const [items, setItems] = useState<Promotion[]>([])
  const [form, setForm] = useState(empty)
  const [editingId, setEditingId] = useState<number | null>(null)

  const load = async () => setItems(await api.get<Promotion[]>("/api/v1/admin/promotions"))
  useEffect(() => { void load() }, [])

  const save = async () => {
    try {
      const body = {
        ...form,
        image_url: form.image_url || null,
        video_url: form.video_url || null,
      }
      if (editingId) await api.put(`/api/v1/admin/promotions/${editingId}`, body)
      else await api.post("/api/v1/admin/promotions", body)
      toast.success("Сохранено")
      setForm(empty)
      setEditingId(null)
      await load()
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Ошибка")
    }
  }

  const remove = async (id: number) => {
    if (!confirm("Удалить акцию?")) return
    await api.delete(`/api/v1/admin/promotions/${id}`)
    toast.success("Удалено")
    await load()
  }

  const uploadImage = async (file: File) => {
    const body = new FormData()
    body.append("file", file)
    const res = await api.post<{ url: string }>("/api/v1/admin/upload", body)
    setForm((f) => ({ ...f, image_url: res.url }))
    toast.success("Изображение загружено")
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-4xl">Акции</h1>
        <p className="text-muted-foreground">Промо-блоки на сайте</p>
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-4 rounded-3xl border border-border bg-card p-5">
          <h2 className="font-display text-2xl">{editingId ? "Редактирование" : "Новая акция"}</h2>
          <div className="space-y-2"><Label>Заголовок</Label><Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></div>
          <div className="space-y-2"><Label>Описание</Label><Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
          <div className="space-y-2"><Label>Картинка</Label>
            <Input type="file" accept="image/*" onChange={(e) => e.target.files?.[0] && void uploadImage(e.target.files[0])} />
            <Input className="mt-2" placeholder="URL" value={form.image_url} onChange={(e) => setForm({ ...form, image_url: e.target.value })} />
          </div>
          <div className="flex items-center justify-between"><Label>Активна</Label><Switch checked={form.is_active} onCheckedChange={(v) => setForm({ ...form, is_active: v })} /></div>
          <div className="flex gap-2">
            <Button onClick={() => void save()}>Сохранить</Button>
            {editingId && <Button variant="outline" onClick={() => { setEditingId(null); setForm(empty) }}>Отмена</Button>}
          </div>
        </div>
        <div className="space-y-3">
          {items.map((p) => (
            <div key={p.id} className="rounded-2xl border border-border bg-card p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-medium">{p.title}</p>
                  <p className="text-sm text-muted-foreground line-clamp-2">{p.description}</p>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => {
                    setEditingId(p.id)
                    setForm({
                      title: p.title,
                      description: p.description,
                      image_url: p.image_url || "",
                      video_url: p.video_url || "",
                      is_active: p.is_active,
                      sort_order: p.sort_order,
                    })
                  }}>Изм.</Button>
                  <Button size="sm" variant="destructive" onClick={() => void remove(p.id)}>Удал.</Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
