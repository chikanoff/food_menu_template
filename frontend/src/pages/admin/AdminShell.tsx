import { Link, NavLink, Navigate, Outlet } from "react-router-dom"
import { LayoutDashboard, Layers, UtensilsCrossed, Megaphone, Settings, LogOut } from "lucide-react"
import { useAuth } from "@/features/admin/AuthContext"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

const links = [
  { to: "/admin", label: "Обзор", icon: LayoutDashboard, end: true },
  { to: "/admin/categories", label: "Категории", icon: Layers },
  { to: "/admin/dishes", label: "Блюда", icon: UtensilsCrossed },
  { to: "/admin/promos", label: "Акции", icon: Megaphone },
  { to: "/admin/settings", label: "Настройки", icon: Settings },
]

export function AdminShell() {
  const { token, logout } = useAuth()
  if (!token) return <Navigate to="/admin/login" replace />

  return (
    <div className="min-h-screen md:grid md:grid-cols-[260px_1fr]">
      <aside className="border-b border-border bg-[#1c1917] text-[#f5f0e8] md:border-b-0 md:border-r">
        <div className="flex items-center justify-between px-5 py-5 md:block">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-white/50">CMS</p>
            <p className="font-display text-2xl">VideoMenu</p>
          </div>
          <Button variant="ghost" size="icon" className="text-white hover:bg-white/10 md:mt-6" onClick={logout} aria-label="Выйти">
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
        <nav className="flex gap-1 overflow-x-auto px-3 pb-4 md:flex-col">
          {links.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-2 rounded-xl px-3 py-2 text-sm whitespace-nowrap transition",
                  isActive ? "bg-white/15 text-white" : "text-white/65 hover:bg-white/10 hover:text-white"
                )
              }
            >
              <Icon className="h-4 w-4" />
              {label}
            </NavLink>
          ))}
          <Link to="/" className="mt-2 rounded-xl px-3 py-2 text-sm text-white/50 hover:text-white md:mt-6">
            Открыть сайт
          </Link>
        </nav>
      </aside>
      <div className="p-4 md:p-8">
        <Outlet />
      </div>
    </div>
  )
}
