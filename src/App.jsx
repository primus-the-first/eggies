import { useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useStore } from './store/useStore'
import BottomNav from './components/BottomNav'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Sales from './pages/Sales'
import Credit from './pages/Credit'
import Inventory from './pages/Inventory'
import Reports from './pages/Reports'
import AuditLog from './pages/AuditLog'

export default function App() {
  const { profile, authReady, initAuth, fetchAll } = useStore()

  useEffect(() => { initAuth() }, [])

  // Once profile is loaded, fetch all data
  useEffect(() => {
    if (profile) fetchAll()
  }, [profile?.id])

  // Wait until auth is resolved
  if (!authReady) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ background: '#131210' }}
      >
        <div className="flex flex-col items-center gap-3">
          <div
            className="w-12 h-12 rounded-2xl animate-pulse"
            style={{ background: 'linear-gradient(135deg, #F59E0B, #D97706)' }}
          />
          <p className="text-stone-500 text-sm font-inter">Loading…</p>
        </div>
      </div>
    )
  }

  // Not logged in → show login
  if (!profile) return <Login />

  const isAdmin = profile?.role === 'super_admin'

  return (
    <BrowserRouter>
      <div className="flex flex-col flex-1 relative">
        <main className="flex-1 overflow-y-auto">
          <Routes>
            {/* Seller + Admin */}
            <Route path="/sales"     element={<Sales />} />
            <Route path="/inventory" element={<Inventory />} />
            <Route path="/reports"   element={<Reports />} />
            <Route path="/credit"    element={<Credit />} />

            {/* Admin only */}
            {isAdmin && <Route path="/"      element={<Dashboard />} />}
            {isAdmin && <Route path="/audit" element={<AuditLog />} />}

            {/* Default redirect based on role */}
            <Route path="*" element={<Navigate to={isAdmin ? '/' : '/sales'} replace />} />
          </Routes>
        </main>
        <BottomNav />
      </div>
    </BrowserRouter>
  )
}
