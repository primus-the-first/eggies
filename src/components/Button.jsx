const variants = {
  primary: {
    class: 'text-white font-semibold active:opacity-90 transition-opacity disabled:opacity-50',
    style: { background: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)', boxShadow: '0 4px 14px rgba(217,119,6,0.35)' },
  },
  secondary: {
    class: 'font-semibold transition-colors',
    style: { background: 'var(--card-subtle)', color: 'var(--text-primary)' },
  },
  dark: {
    class: 'bg-zinc-900 text-white font-semibold active:bg-zinc-800 transition-colors',
    style: {},
  },
  danger: {
    class: 'bg-rose-500 text-white font-semibold active:bg-rose-600 transition-colors',
    style: {},
  },
  ghost: {
    class: 'text-amber-600 font-semibold active:bg-amber-50 transition-colors',
    style: {},
  },
}

export default function Button({ children, variant = 'primary', className = '', fullWidth = false, ...props }) {
  const v = variants[variant]
  return (
    <button
      className={`
        flex items-center justify-center gap-2 rounded-2xl px-5 py-3.5 text-sm
        select-none cursor-pointer font-jakarta
        ${v.class}
        ${fullWidth ? 'w-full' : ''}
        ${className}
      `}
      style={v.style}
      {...props}
    >
      {children}
    </button>
  )
}
