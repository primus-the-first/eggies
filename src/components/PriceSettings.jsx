import { useState } from 'react'
import { CheckCircle2 } from 'lucide-react'
import { useStore } from '../store/useStore'
import Sheet from './Sheet'
import Button from './Button'

export default function PriceSettings({ open, onClose }) {
  const { prices, updatePrice } = useStore()
  const [values, setValues] = useState({})
  const [saving, setSaving] = useState(null)
  const [saved, setSaved] = useState(null)

  const getVal = (size) =>
    values[size] !== undefined ? values[size] : (prices.find(p => p.size === size)?.amount ?? '')

  const handleSave = async (size) => {
    const amount = getVal(size)
    if (!amount || isNaN(amount) || Number(amount) <= 0) return
    setSaving(size)
    await updatePrice(size, amount)
    setSaving(null)
    setSaved(size)
    setTimeout(() => setSaved(null), 2000)
  }

  return (
    <Sheet open={open} onClose={onClose} title="Egg Prices">
      <div className="flex flex-col gap-6">
        <p className="text-sm text-stone-400 font-inter -mt-1">
          Update prices here and they'll apply immediately to all new sales and credit deliveries.
        </p>

        {['small', 'large'].map(size => {
          const label = size === 'small' ? 'Small Eggs' : 'Large Eggs'
          const isSaved = saved === size
          const isSaving = saving === size

          return (
            <div key={size} className="flex flex-col gap-2">
              <label className="text-xs font-semibold text-stone-500 uppercase tracking-widest font-jakarta">
                {label}
              </label>
              <div className="flex gap-2 items-center">
                <div className="flex-1 relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400 text-sm font-inter">GH₵</span>
                  <input
                    type="number"
                    inputMode="decimal"
                    className="w-full bg-stone-100 rounded-2xl pl-12 pr-4 py-3.5 text-stone-900 text-base font-jakarta font-semibold border-2 border-transparent outline-none focus:border-amber-400 focus:bg-white transition-all tabular-nums"
                    value={getVal(size)}
                    onChange={e => setValues(v => ({ ...v, [size]: e.target.value }))}
                  />
                </div>
                <button
                  onClick={() => handleSave(size)}
                  disabled={isSaving}
                  className="h-[52px] px-5 rounded-2xl font-semibold text-sm font-jakarta flex items-center gap-2 transition-all"
                  style={isSaved
                    ? { background: '#ECFDF5', color: '#059669' }
                    : { background: 'linear-gradient(135deg, #F59E0B, #D97706)', color: 'white', boxShadow: '0 4px 14px rgba(217,119,6,0.3)' }
                  }
                >
                  {isSaved ? <><CheckCircle2 size={16} /> Saved</> : isSaving ? 'Saving...' : 'Save'}
                </button>
              </div>
            </div>
          )
        })}
      </div>
    </Sheet>
  )
}
