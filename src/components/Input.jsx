export default function Input({ label, error, hint, className = '', ...props }) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label className="text-xs font-semibold text-stone-500 uppercase tracking-widest font-jakarta">
          {label}
        </label>
      )}
      <input
        className={`
          w-full bg-stone-100 rounded-2xl px-4 py-3.5 text-stone-900 text-base font-inter
          border-2 border-transparent outline-none
          focus:border-amber-400 focus:bg-white transition-all duration-200
          placeholder:text-stone-300 tabular-nums
          ${error ? 'border-rose-400 bg-rose-50 focus:border-rose-400' : ''}
          ${className}
        `}
        {...props}
      />
      {hint && !error && <span className="text-xs text-stone-400 pl-1">{hint}</span>}
      {error && <span className="text-xs text-rose-500 font-medium pl-1">{error}</span>}
    </div>
  )
}
