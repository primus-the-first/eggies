import { Sun, Moon, LogOut } from 'lucide-react'
import { useTheme } from '../lib/useTheme'
import { useStore } from '../store/useStore'

/**
 * Theme toggle + sign-out buttons for page headers.
 * `variant="dark"` → white/muted icons (for dark hero headers like Dashboard)
 * `variant="light"` → stone icons on a light pill bg (default)
 */
export default function HeaderActions({ variant = 'light' }) {
  const { dark, toggle } = useTheme()
  const { signOut } = useStore()

  const isDark = variant === 'dark'

  const btnStyle = isDark
    ? { background: 'rgba(255,255,255,0.08)' }
    : { background: '#F5F4F2' }

  const iconColor = isDark ? '#A8A29E' : '#78716C'

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={toggle}
        className="w-9 h-9 rounded-2xl flex items-center justify-center transition-all active:scale-95 active:bg-white/20"
        style={btnStyle}
        aria-label="Toggle theme"
      >
        {dark ? <Sun size={16} color={iconColor} /> : <Moon size={16} color={iconColor} />}
      </button>
      <button
        onClick={signOut}
        className="w-9 h-9 rounded-2xl flex items-center justify-center transition-all active:scale-95"
        style={btnStyle}
        aria-label="Sign out"
      >
        <LogOut size={16} color={iconColor} />
      </button>
    </div>
  )
}
