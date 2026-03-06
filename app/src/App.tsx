import { lazy, Suspense, useEffect } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Sidebar from './components/Sidebar'
import ProtectedRoute from './components/ProtectedRoute'
import { useThemeStore } from './store/useThemeStore'

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
              <main className="flex-1 pt-[72px] md:pt-0 md:ml-[103px]">
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
