import { useEffect } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Sidebar from './components/Sidebar'
import InvoiceListPage from './pages/InvoiceListPage'
import InvoiceDetailPage from './pages/InvoiceDetailPage'
import { useThemeStore } from './store/useThemeStore'

export default function App() {
  const isDark = useThemeStore(state => state.isDark)

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDark)
  }, [isDark])

  return (
    <BrowserRouter>
      <div className="flex min-h-screen">
        <Sidebar />
        <main className="ml-[103px] flex-1">
          <Routes>
            <Route path="/" element={<InvoiceListPage />} />
            <Route path="/:id" element={<InvoiceDetailPage />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  )
}
