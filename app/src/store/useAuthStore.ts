import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { api, setTokens, clearTokens } from '../lib/api'
import type { Token } from '../types/invoice'

export interface AuthUser {
  id: string
  email: string
  name: string
  created_at: string
}

interface AuthStore {
  token: string | null
  refreshToken: string | null
  user: AuthUser | null
  login: (email: string, password: string) => Promise<void>
  register: (name: string, email: string, password: string) => Promise<void>
  logout: () => void
}

async function fetchTokenAndUser(email: string, password: string) {
  const data = await api.post<Token>(
    '/auth/login',
    { email, password }
  )
  setTokens(data.access_token, data.refresh_token)
  const user = await api.get<AuthUser>('/users/me')
  return { token: data.access_token, refreshToken: data.refresh_token, user }
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      token: null,
      refreshToken: null,
      user: null,

      login: async (email, password) => {
        const { token, refreshToken, user } = await fetchTokenAndUser(email, password)
        set({ token, refreshToken, user })
      },

      register: async (name, email, password) => {
        // Register returns user object only — no token
        await api.post('/auth/register', { name, email, password })
        // Follow up with login to get the token
        const { token, refreshToken, user } = await fetchTokenAndUser(email, password)
        set({ token, refreshToken, user })
      },

      logout: () => {
        clearTokens()
        set({ token: null, refreshToken: null, user: null })
      },
    }),
    {
      name: 'auth-store',
      partialize: (state) => ({ token: state.token, refreshToken: state.refreshToken, user: state.user }),
      onRehydrateStorage: () => (state) => {
        // Keep localStorage in sync when store rehydrates from sessionStorage
        if (state?.token) {
          localStorage.setItem('access_token', state.token)
        }
        if (state?.refreshToken) {
          localStorage.setItem('refresh_token', state.refreshToken)
        }
      },
    }
  )
)
