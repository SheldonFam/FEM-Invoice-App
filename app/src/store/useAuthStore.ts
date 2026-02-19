import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { api } from '../lib/api'

export interface AuthUser {
  id: string
  email: string
  name: string
  created_at: string
}

interface AuthStore {
  token: string | null
  user: AuthUser | null
  login: (email: string, password: string) => Promise<void>
  register: (name: string, email: string, password: string) => Promise<void>
  logout: () => void
}

async function fetchTokenAndUser(email: string, password: string) {
  const data = await api.post<{ access_token: string; token_type: string }>(
    '/auth/login',
    { email, password }
  )
  localStorage.setItem('access_token', data.access_token)
  const user = await api.get<AuthUser>('/users/me')
  return { token: data.access_token, user }
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      token: null,
      user: null,

      login: async (email, password) => {
        const { token, user } = await fetchTokenAndUser(email, password)
        set({ token, user })
      },

      register: async (name, email, password) => {
        // Register returns user object only — no token
        await api.post('/auth/register', { name, email, password })
        // Follow up with login to get the token
        const { token, user } = await fetchTokenAndUser(email, password)
        set({ token, user })
      },

      logout: () => {
        localStorage.removeItem('access_token')
        set({ token: null, user: null })
      },
    }),
    {
      name: 'auth-store',
      partialize: (state) => ({ token: state.token, user: state.user }),
      onRehydrateStorage: () => (state) => {
        // Keep localStorage in sync when store rehydrates from sessionStorage
        if (state?.token) {
          localStorage.setItem('access_token', state.token)
        }
      },
    }
  )
)
