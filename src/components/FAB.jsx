import { Plus } from 'lucide-react'

export default function FAB({ onClick, label = 'Add' }) {
  return (
    <button
      onClick={onClick}
      aria-label={label}
      className="fixed bottom-24 right-5 z-40 w-14 h-14 rounded-2xl flex items-center justify-center active:scale-95 transition-transform"
      style={{
        background: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
        boxShadow: 'var(--shadow-fab)',
      }}
    >
      <Plus size={24} color="white" strokeWidth={2.5} />
    </button>
  )
}
