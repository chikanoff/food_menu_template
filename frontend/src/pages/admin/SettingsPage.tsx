import { useEffect, useState } from "react"
import { toast } from "sonner"
import { api } from "@/lib/api"
import type { Restaurant } from "@/types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"

export function SettingsPage() {
  const [form, setForm] = useState<Restaurant | null>(null)

  useEffect(() => {
    void api.get<Restaurant>("/api/v1/admin/settings").then(setForm)
  }, [])

  if (!form) return <p>Загрузка...</p>

  const save = async () => {
    try {
      const updated = await api.put<Restaurant>("/api/v1/admin/settings", form)
      setForm(updated)
      toast.success("Настройки сохранены")
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Ошибка")
    }
  }

  const upload = async (field: "logo_url" | "cover_url", file: File) => {
    const body = new FormData()
    body.append("file", file)
    const res = await api.post<{ url: string }>("/api/v1/admin/upload", body)
    setForm({ ...form, [field]: res.url })
    toast.success("Файл загружен")
  }

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <div>
        <h1 className="font-display text-4xl">Настройки</h1>
        <p className="text-muted-foreground">Ресторан и оформление</p>
      </div>
      <div className="space-y-4 rounded-3xl border border-border bg-card p-6">
        <div className="space-y-2"><Label>Название</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
        <div className="space-y-2"><Label>Описание</Label><Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2"><Label>Телефон</Label><Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></div>
          <div className="space-y-2"><Label>Часы работы</Label><Input value={form.working_hours} onChange={(e) => setForm({ ...form, working_hours: e.target.value })} /></div>
        </div>
        <div className="space-y-2"><Label>Адрес</Label><Input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} /></div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2"><Label>Primary color</Label><Input type="color" value={form.primary_color} onChange={(e) => setForm({ ...form, primary_color: e.target.value })} /></div>
          <div className="space-y-2"><Label>Accent color</Label><Input type="color" value={form.accent_color} onChange={(e) => setForm({ ...form, accent_color: e.target.value })} /></div>
        </div>
        <div className="space-y-2"><Label>Логотип</Label>
          <Input type="file" accept="image/*" onChange={(e) => e.target.files?.[0] && void upload("logo_url", e.target.files[0])} />
          <Input className="mt-2" value={form.logo_url || ""} onChange={(e) => setForm({ ...form, logo_url: e.target.value })} />
        </div>
        <div className="space-y-2"><Label>Обложка</Label>
          <Input type="file" accept="image/*" onChange={(e) => e.target.files?.[0] && void upload("cover_url", e.target.files[0])} />
          <Input className="mt-2" value={form.cover_url || ""} onChange={(e) => setForm({ ...form, cover_url: e.target.value })} />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2"><Label>WhatsApp</Label><Input value={form.whatsapp_url || ""} onChange={(e) => setForm({ ...form, whatsapp_url: e.target.value })} /></div>
          <div className="space-y-2"><Label>Telegram</Label><Input value={form.telegram_url || ""} onChange={(e) => setForm({ ...form, telegram_url: e.target.value })} /></div>
          <div className="space-y-2"><Label>Instagram</Label><Input value={form.instagram_url || ""} onChange={(e) => setForm({ ...form, instagram_url: e.target.value })} /></div>
          <div className="space-y-2"><Label>Карта</Label><Input value={form.map_url || ""} onChange={(e) => setForm({ ...form, map_url: e.target.value })} /></div>
        </div>
        <div className="flex items-center justify-between"><Label>Опубликовано</Label><Switch checked={form.is_published} onCheckedChange={(v) => setForm({ ...form, is_published: v })} /></div>
        <Button onClick={() => void save()}>Сохранить настройки</Button>
      </div>
    </div>
  )
}
