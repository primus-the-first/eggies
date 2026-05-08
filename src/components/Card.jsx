export default function Card({ children, className = '', onClick }) {
  return (
    <div
      onClick={onClick}
      className={`rounded-3xl p-4 ${onClick ? 'cursor-pointer active:scale-[0.98] transition-transform' : ''} ${className}`}
      style={{ background: 'var(--card-bg)', boxShadow: 'var(--shadow-card)' }}
    >
      {children}
    </div>
  )
}
