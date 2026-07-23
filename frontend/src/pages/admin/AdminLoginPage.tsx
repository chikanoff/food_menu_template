import { useState } from "react"
import { Navigate, useNavigate } from "react-router-dom"
import { toast } from "sonner"
import { useAuth } from "@/features/admin/AuthContext"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export function AdminLoginPage() {
  const { token, login } = useAuth()
  const navigate = useNavigate()
  const [username, setUsername] = useState("admin")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)

  if (token) return <Navigate to="/admin" replace />

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      await login(username, password)
      toast.success("Вход выполнен")
      navigate("/admin")
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Ошибка входа")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="grid min-h-screen place-items-center bg-[radial-gradient(circle_at_top,#c4a57433,transparent_45%),#f7f3ee] px-4">
      <form onSubmit={onSubmit} className="w-full max-w-md space-y-5 rounded-[2rem] border border-border bg-card p-8 shadow-xl">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">VideoMenu</p>
          <h1 className="font-display text-3xl">Админ-панель</h1>
        </div>
        <div className="space-y-2">
          <Label htmlFor="username">Логин</Label>
          <Input id="username" value={username} onChange={(e) => setUsername(e.target.value)} autoComplete="username" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Пароль</Label>
          <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" />
        </div>
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Вход..." : "Войти"}
        </Button>
      </form>
    </div>
  )
}
