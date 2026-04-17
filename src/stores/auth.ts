import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface AuthUser {
  id: number
  name: string
  role: 'STUDENT' | 'RECRUITER' | 'ADMIN'
}

interface AuthStore {
  user: AuthUser | null
  setUser: (user: AuthUser | null) => void
  logout: () => Promise<void>
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      user: null,
      setUser: (user) => set({ user }),
      logout: async () => {
        await fetch('/api/auth/logout', { method: 'POST' })
        set({ user: null })
        window.location.href = '/login'
      },
    }),
    { name: 'auth-store' }
  )
)
