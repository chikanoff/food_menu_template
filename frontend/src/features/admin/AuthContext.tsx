import { createContext, useContext, useMemo, useState } from "react"
import { api, getToken, setToken } from "@/lib/api"

type AuthCtx = {
  token: string | null
  login: (username: string, password: string) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthCtx | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setTok] = useState<string | null>(() => getToken())

  const value = useMemo<AuthCtx>(
    () => ({
      token,
      login: async (username, password) => {
        const res = await api.post<{ access_token: string }>("/api/v1/admin/auth/login", { username, password })
        setToken(res.access_token)
        setTok(res.access_token)
      },
      logout: () => {
        setToken(null)
        setTok(null)
      },
    }),
    [token]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error("useAuth outside provider")
  return ctx
}
