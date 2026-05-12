import { NavLink } from 'react-router-dom'
import { Home, DollarSign, CreditCard, Package, FileText, ShieldCheck, LogOut, Sun, Moon } from 'lucide-react'
import { useStore } from '../store/useStore'
import { useTheme } from '../lib/useTheme'

const SELLER_TABS = [
  { to: '/sales',     label: 'Sales',   Icon: DollarSign },
  { to: '/credit',    label: 'Credit',  Icon: CreditCard },
  { to: '/inventory', label: 'Stock',   Icon: Package },
  { to: '/reports',   label: 'Reports', Icon: FileText },
]

const ADMIN_TABS = [
  { to: '/',          label: 'Home',    Icon: Home },
  { to: '/sales',     label: 'Sales',   Icon: DollarSign },
  { to: '/credit',    label: 'Credit',  Icon: CreditCard },
  { to: '/inventory', label: 'Stock',   Icon: Package },
  { to: '/reports',   label: 'Reports', Icon: FileText },
  { to: '/audit',     label: 'Audit',   Icon: ShieldCheck },
]

export default function BottomNav() {
  const { profile, signOut } = useStore()
  const { dark, toggle } = useTheme()
  const isAdmin = profile?.role === 'super_admin'
  const tabs = isAdmin ? ADMIN_TABS : SELLER_TABS

  return (
    <nav
      className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[480px] z-30 px-4 pb-4 pt-2"
      style={{ background: 'linear-gradient(to top, var(--page-bg) 60%, transparent)' }}
    >
      {/* User identity chip */}
      <div className="flex items-center justify-between mb-2 px-1">
        <div className="flex items-center gap-2">
          <div
            className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold font-jakarta flex-shrink-0"
            style={{
              background: isAdmin
                ? 'linear-gradient(135deg, #7C3AED, #8B5CF6)'
                : 'linear-gradient(135deg, #F59E0B, #D97706)',
              color: 'white',
            }}
          >
            {profile?.name?.charAt(0)?.toUpperCase() ?? '?'}
          </div>
          <span className="text-xs font-semibold font-jakarta" style={{ color: '#78716C' }}>
            {profile?.name ?? 'User'}
          </span>
          {isAdmin && (
            <span
              className="text-[9px] font-bold px-1.5 py-0.5 rounded-full font-jakarta"
              style={{ background: '#EDE9FE', color: '#7C3AED' }}
            >
              ADMIN
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {/* Theme toggle */}
          <button
            onClick={toggle}
            className="w-9 h-9 rounded-xl flex items-center justify-center transition-all active:scale-95"
            style={{ background: '#F5F4F2' }}
            aria-label="Toggle theme"
          >
            {dark ? <Sun size={15} color="#78716C" /> : <Moon size={15} color="#78716C" />}
          </button>
          {/* Sign out */}
          <button
            onClick={signOut}
            className="flex items-center gap-2 px-4 py-2 rounded-xl transition-all active:scale-95"
            style={{ background: '#F5F4F2' }}
          >
            <LogOut size={14} color="#78716C" />
            <span className="text-xs font-semibold text-stone-500 font-jakarta">Sign out</span>
          </button>
        </div>
      </div>

      {/* Tab bar */}
      <div
        className="flex items-center rounded-2xl px-2 py-2"
        style={{
          background: '#131210',
          boxShadow: '0 4px 24px rgba(0,0,0,0.18), 0 1px 4px rgba(0,0,0,0.12)',
        }}
      >
        {tabs.map(({ to, label, Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              `flex-1 flex flex-col items-center justify-center gap-1 py-2 px-1 rounded-xl transition-all duration-200
               ${isActive ? 'bg-amber-500/15' : ''}`
            }
          >
            {({ isActive }) => (
              <>
                <Icon
                  size={20}
                  strokeWidth={isActive ? 2.5 : 1.8}
                  color={isActive ? '#F59E0B' : '#78716C'}
                />
                <span
                  className="text-[10px] font-semibold font-jakarta tracking-wide"
                  style={{ color: isActive ? '#F59E0B' : '#57534E' }}
                >
                  {label}
                </span>
              </>
            )}
          </NavLink>
        ))}
      </div>
      <div style={{ height: 'env(safe-area-inset-bottom)' }} />
    </nav>
  )
}
