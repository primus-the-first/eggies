import { NavLink } from 'react-router-dom'
import { Home, DollarSign, CreditCard, Package, FileText } from 'lucide-react'

const tabs = [
  { to: '/',          label: 'Home',    Icon: Home },
  { to: '/sales',     label: 'Sales',   Icon: DollarSign },
  { to: '/credit',    label: 'Credit',  Icon: CreditCard },
  { to: '/inventory', label: 'Stock',   Icon: Package },
  { to: '/reports',   label: 'Reports', Icon: FileText },
]

export default function BottomNav() {
  return (
    <nav
      className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[480px] z-30 px-4 pb-4 pt-2"
      style={{ background: 'linear-gradient(to top, var(--page-bg) 60%, transparent)' }}
    >
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
