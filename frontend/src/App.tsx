import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom"
import { Toaster } from "sonner"
import { RestaurantProvider } from "@/features/public-menu/RestaurantProvider"
import { AuthProvider } from "@/features/admin/AuthContext"
import { PublicShell } from "@/components/layout/PublicShell"
import { HomePage } from "@/pages/public/HomePage"
import { MenuPage } from "@/pages/public/MenuPage"
import { DishPage } from "@/pages/public/DishPage"
import { PromosPage } from "@/pages/public/PromosPage"
import { ContactsPage } from "@/pages/public/ContactsPage"
import { AdminLoginPage } from "@/pages/admin/AdminLoginPage"
import { AdminShell } from "@/pages/admin/AdminShell"
import { DashboardPage } from "@/pages/admin/DashboardPage"
import { CategoriesPage } from "@/pages/admin/CategoriesPage"
import { DishesPage } from "@/pages/admin/DishesPage"
import { AdminPromosPage } from "@/pages/admin/PromosPage"
import { SettingsPage } from "@/pages/admin/SettingsPage"

export default function App() {
  return (
    <AuthProvider>
      <RestaurantProvider>
        <BrowserRouter>
          <Routes>
            <Route element={<PublicShell />}>
              <Route path="/" element={<HomePage />} />
              <Route path="/menu/:category?" element={<MenuPage />} />
              <Route path="/dish/:slug" element={<DishPage />} />
              <Route path="/promos" element={<PromosPage />} />
              <Route path="/contacts" element={<ContactsPage />} />
            </Route>
            <Route path="/admin/login" element={<AdminLoginPage />} />
            <Route path="/admin" element={<AdminShell />}>
              <Route index element={<DashboardPage />} />
              <Route path="categories" element={<CategoriesPage />} />
              <Route path="dishes" element={<DishesPage />} />
              <Route path="promos" element={<AdminPromosPage />} />
              <Route path="settings" element={<SettingsPage />} />
            </Route>
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
        <Toaster richColors position="top-center" />
      </RestaurantProvider>
    </AuthProvider>
  )
}
