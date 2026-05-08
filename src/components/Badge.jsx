const variants = {
  cash:     'bg-emerald-50 text-emerald-600 ring-1 ring-emerald-100',
  momo:     'bg-violet-50 text-violet-600 ring-1 ring-violet-100',
  credit:   'bg-amber-50 text-amber-700 ring-1 ring-amber-100',
  broken:   'bg-rose-50 text-rose-600 ring-1 ring-rose-100',
  received: 'bg-blue-50 text-blue-500 ring-1 ring-blue-100',
  payment:  'bg-emerald-50 text-emerald-600 ring-1 ring-emerald-100',
  delivery: 'bg-amber-50 text-amber-700 ring-1 ring-amber-100',
  small:    'bg-stone-100 text-stone-600 ring-1 ring-stone-200',
  large:    'bg-amber-50 text-amber-700 ring-1 ring-amber-100',
}

export default function Badge({ type, label }) {
  return (
    <span className={`inline-flex items-center text-[11px] font-semibold px-2.5 py-1 rounded-full tracking-wide ${variants[type] ?? 'bg-stone-100 text-stone-500'}`}>
      {label}
    </span>
  )
}
