import { lazy, Suspense, useEffect } from 'react'
import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom'
import Sidebar from './components/Sidebar'
import ProtectedRoute from './components/ProtectedRoute'
import { useThemeStore } from './store/useThemeStore'
import { useAuthStore } from './store/useAuthStore'
import { AUTH_SESSION_EXPIRED_EVENT } from './lib/api'

/** Listens for session-expired events from the API layer and redirects to login */
function AuthRedirectListener() {
  const navigate = useNavigate()
  const logout = useAuthStore((s) => s.logout)

  useEffect(() => {
    const handler = () => {
      logout()
      navigate('/login', { replace: true })
    }
    window.addEventListener(AUTH_SESSION_EXPIRED_EVENT, handler)
    return () => window.removeEventListener(AUTH_SESSION_EXPIRED_EVENT, handler)
  }, [navigate, logout])

  return null
}

const InvoiceListPage = lazy(() => import('./pages/InvoiceListPage'))
const InvoiceDetailPage = lazy(() => import('./pages/InvoiceDetailPage'))
const LoginPage = lazy(() => import('./pages/LoginPage'))
const RegisterPage = lazy(() => import('./pages/RegisterPage'))

export default function App() {
  const isDark = useThemeStore(state => state.isDark)

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDark)
  }, [isDark])

  return (
    <BrowserRouter>
      <AuthRedirectListener />
      <Suspense fallback={<div className="flex min-h-screen items-center justify-center text-muted">Loading…</div>}>
      <Routes>
        {/* Public routes — no sidebar */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Protected routes — with sidebar */}
        <Route
          element={
            <div className="flex min-h-screen">
              <Sidebar />
              <main id="main-content" className="flex-1 pt-[72px] md:pt-0 md:ml-[103px]">
                <ProtectedRoute />
              </main>
            </div>
          }
        >
          <Route path="/" element={<InvoiceListPage />} />
          <Route path="/:id" element={<InvoiceDetailPage />} />
        </Route>
      </Routes>
      </Suspense>
    </BrowserRouter>
  )
}
