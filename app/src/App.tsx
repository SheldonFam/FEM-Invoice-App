import { useEffect } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Sidebar from './components/Sidebar'
import ProtectedRoute from './components/ProtectedRoute'
import InvoiceListPage from './pages/InvoiceListPage'
import InvoiceDetailPage from './pages/InvoiceDetailPage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import { useThemeStore } from './store/useThemeStore'

export default function App() {
  const isDark = useThemeStore(state => state.isDark)

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDark)
  }, [isDark])

  return (
    <BrowserRouter>
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
    </BrowserRouter>
  )
}
