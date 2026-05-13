import { useState, useEffect } from 'react'
import { format } from 'date-fns'
import { PackagePlus, EggOff, Trash2 } from 'lucide-react'
import { useStore } from '../store/useStore'
import Card from '../components/Card'
import FAB from '../components/FAB'
import Sheet from '../components/Sheet'
import Input from '../components/Input'
import Button from '../components/Button'
import HeaderActions from '../components/HeaderActions'

const ENTRY_TYPES = [
  { value: 'received',  label: 'Received',  icon: PackagePlus, color: '#3B82F6', bg: '#EFF6FF' },
  { value: 'broken',    label: 'Broken',    icon: EggOff,      color: '#F43F5E', bg: '#FFF1F2' },
  { value: 'discarded', label: 'Discarded', icon: Trash2,      color: '#F43F5E', bg: '#FFF1F2' },
]

export default function Inventory() {
  const { inventoryEntries, sales, fetchInventory, addInventoryEntry, prices, fetchPrices } = useStore()
  const [sheetOpen, setSheetOpen] = useState(false)

  useEffect(() => { fetchInventory(); fetchPrices() }, [])

  const totalReceived  = inventoryEntries.filter(e => e.type === 'received').reduce((a, e) => a + e.quantity, 0)
  const totalSold      = sales.reduce((a, s) => a + Number(s.quantity), 0)
  const totalBroken    = inventoryEntries.filter(e => e.type === 'broken').reduce((a, e) => a + e.quantity, 0)
  const totalDiscarded = inventoryEntries.filter(e => e.type === 'discarded').reduce((a, e) => a + e.quantity, 0)
  const currentStock   = totalReceived - totalSold - totalBroken - totalDiscarded

  const lowStock = currentStock < 20
  const usedPct = totalReceived > 0 ? Math.min(((totalSold + totalBroken + totalDiscarded) / totalReceived) * 100, 100) : 0

  return (
    <div className="flex flex-col gap-4 px-4 pt-12 pb-32">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-stone-900 font-jakarta">Stock</h1>
        <HeaderActions />
      </div>

      {/* Hero stock card */}
      <div
        className="rounded-3xl p-6 text-white relative overflow-hidden"
        style={{
          background: lowStock
            ? 'linear-gradient(135deg, #E11D48, #F43F5E)'
            : 'linear-gradient(160deg, #131210, #1E1C19)',
          boxShadow: lowStock
            ? '0 8px 24px rgba(225,29,72,0.30)'
            : '0 4px 24px rgba(0,0,0,0.15)',
        }}
      >
        <div className="absolute -bottom-6 -right-6 w-32 h-32 rounded-full opacity-10"
          style={{ background: 'radial-gradient(circle, white, transparent)' }} />

        <p className="text-xs font-semibold uppercase tracking-widest font-jakarta mb-2"
          style={{ color: lowStock ? 'rgba(255,255,255,0.6)' : '#78716C' }}>
          {lowStock ? '⚠️ Low Stock' : 'Current Stock'}
        </p>
        <p className="text-6xl font-bold tabular-nums font-jakarta" style={{ color: lowStock ? 'white' : '#F59E0B' }}>
          {currentStock}
        </p>
        <p className="text-sm mt-1 font-inter" style={{ color: lowStock ? 'rgba(255,255,255,0.7)' : '#57534E' }}>
          eggs available
        </p>

        {/* Usage bar */}
        {totalReceived > 0 && (
          <div className="mt-5">
            <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.15)' }}>
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{ width: `${usedPct}%`, background: lowStock ? 'white' : '#F59E0B' }}
              />
            </div>
            <p className="text-xs mt-1.5 font-inter" style={{ color: lowStock ? 'rgba(255,255,255,0.5)' : '#78716C' }}>
              {usedPct.toFixed(0)}% of stock used
            </p>
          </div>
        )}
      </div>

      {/* Current prices pill row */}
      {prices.length > 0 && (
        <div className="flex gap-3">
          {prices.map(p => (
            <div
              key={p.size}
              className="flex-1 rounded-2xl px-4 py-3 flex items-center justify-between"
              style={{ background: 'var(--card-bg)', boxShadow: 'var(--shadow-card)' }}
            >
              <span className="text-xs font-semibold text-stone-500 uppercase tracking-wide font-jakarta capitalize">
                {p.label}
              </span>
              <span className="text-base font-bold tabular-nums font-jakarta" style={{ color: '#D97706' }}>
                GH₵ {Number(p.amount).toFixed(2)}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Breakdown grid */}
      <div className="grid grid-cols-3 gap-3">
        <MiniStat label="Received" value={totalReceived} color="#3B82F6" bg="#EFF6FF" />
        <MiniStat label="Sold"     value={totalSold}     color="#D97706" bg="#FEF3C7" />
        <MiniStat label="Broken"   value={totalBroken + totalDiscarded} color="#F43F5E" bg="#FFF1F2" />
      </div>

      {/* Log */}
      <div>
        <h2 className="text-base font-bold text-stone-800 font-jakarta mb-3">Log</h2>
        {inventoryEntries.length === 0 ? (
          <Card>
            <div className="flex flex-col items-center py-8 gap-3">
              <span className="text-4xl">📦</span>
              <p className="text-stone-400 text-sm font-inter">No stock entries yet</p>
            </div>
          </Card>
        ) : (
          <div className="flex flex-col gap-2">
            {inventoryEntries.map(entry => <EntryItem key={entry.id} entry={entry} />)}
          </div>
        )}
      </div>

      <FAB onClick={() => setSheetOpen(true)} label="Add stock entry" />
      <AddEntrySheet
        open={sheetOpen}
        onClose={() => setSheetOpen(false)}
        onSave={addInventoryEntry}
        prices={prices}
      />
    </div>
  )
}

function MiniStat({ label, value, color, bg }) {
  return (
    <div className="rounded-3xl p-4 flex flex-col gap-1" style={{ background: 'var(--card-bg)', boxShadow: 'var(--shadow-card)' }}>
      <div className="w-7 h-7 rounded-xl mb-1" style={{ background: bg }} />
      <p className="text-xl font-bold font-jakarta tabular-nums" style={{ color }}>{value}</p>
      <p className="text-[11px] text-stone-400 font-inter">{label}</p>
    </div>
  )
}

function EntryItem({ entry }) {
  const typeInfo = ENTRY_TYPES.find(t => t.value === entry.type) ?? ENTRY_TYPES[0]
  const Icon = typeInfo.icon
  const sizeLabel = entry.size === 'small' ? 'Small' : entry.size === 'large' ? 'Large' : null
  return (
    <div className="bg-white rounded-3xl px-4 py-3.5 flex items-center justify-between" style={{ boxShadow: 'var(--shadow-card)' }}>
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0"
          style={{ background: typeInfo.bg }}>
          <Icon size={17} color={typeInfo.color} />
        </div>
        <div>
          <p className="text-sm font-semibold text-stone-900 font-jakarta">
            {entry.quantity} crates
            {sizeLabel && <span className="text-stone-400 font-normal"> · {sizeLabel}</span>}
            <span className="text-stone-400 font-normal"> · </span>
            <span className="capitalize font-normal text-stone-500">{entry.type}</span>
          </p>
          <p className="text-xs text-stone-400 font-inter mt-0.5">
            {format(new Date(entry.created_at), 'MMM d · h:mm a')}
            {entry.price_per_crate ? ` · GH₵${Number(entry.price_per_crate).toFixed(2)}/crate` : ''}
            {entry.note ? ` · ${entry.note}` : ''}
          </p>
        </div>
      </div>
      {entry.price_per_crate && (
        <p className="text-sm font-bold tabular-nums font-jakarta text-stone-700">
          GH₵ {(Number(entry.quantity) * Number(entry.price_per_crate)).toFixed(2)}
        </p>
      )}
    </div>
  )
}

function AddEntrySheet({ open, onClose, onSave, prices }) {
  const { updatePrice } = useStore()
  const [type, setType]           = useState('received')
  const [size, setSize]           = useState('small')
  const [qty, setQty]             = useState('')
  const [priceInput, setPriceInput] = useState('')
  const [note, setNote]           = useState('')
  const [saving, setSaving]       = useState(false)
  const [errors, setErrors]       = useState({})

  // Pre-fill price field when size changes or prices load
  const currentPrice = prices.find(p => p.size === size)?.amount ?? ''
  const displayPrice = priceInput !== '' ? priceInput : (currentPrice !== '' ? String(currentPrice) : '')

  const handleSizeChange = (s) => {
    setSize(s)
    // auto-fill with current stored price for that size
    const p = prices.find(pr => pr.size === s)?.amount
    setPriceInput(p != null ? String(p) : '')
  }

  const reset = () => {
    setType('received'); setSize('small'); setQty('')
    setPriceInput(''); setNote(''); setErrors({})
  }
  const handleClose = () => { reset(); onClose() }

  const handleSave = async () => {
    const e = {}
    if (!qty || isNaN(qty) || Number(qty) <= 0) e.qty = 'Enter a valid quantity'
    if (type === 'received') {
      if (!displayPrice || isNaN(displayPrice) || Number(displayPrice) <= 0) e.price = 'Enter the price per crate'
    }
    if (Object.keys(e).length) { setErrors(e); return }

    setSaving(true)

    const entryPayload = {
      type,
      quantity: Number(qty),
      note: note.trim() || null,
      ...(type === 'received' ? {
        size,
        price_per_crate: Number(displayPrice),
      } : {}),
    }

    const { error: saveErr } = await onSave(entryPayload)

    // If received, also update the live price for that size
    if (!saveErr && type === 'received') {
      await updatePrice(size, Number(displayPrice))
    }

    setSaving(false)
    if (!saveErr) handleClose()
  }

  return (
    <Sheet open={open} onClose={handleClose} title="Update Stock">
      <div className="flex flex-col gap-5">

        {/* Entry type */}
        <div>
          <p className="text-xs font-semibold text-stone-500 uppercase tracking-widest font-jakarta mb-3">Entry Type</p>
          <div className="flex flex-col gap-2">
            {ENTRY_TYPES.map(({ value, label, icon: Icon, color, bg }) => (
              <button
                key={value}
                onClick={() => setType(value)}
                className="w-full py-3.5 px-4 rounded-2xl font-semibold text-sm text-left font-jakarta transition-all duration-200 flex items-center gap-3"
                style={type === value
                  ? { background: bg, color, boxShadow: `0 0 0 2px ${color}30` }
                  : { background: 'var(--card-subtle)', color: 'var(--text-secondary)' }
                }
              >
                <Icon size={16} />
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Size picker — only for received */}
        {type === 'received' && (
          <div>
            <p className="text-xs font-semibold text-stone-500 uppercase tracking-widest font-jakarta mb-3">Egg Size</p>
            <div className="flex gap-3">
              {[
                { s: 'small', l: 'Small' },
                { s: 'large', l: 'Large' },
              ].map(({ s, l }) => (
                <button
                  key={s}
                  onClick={() => handleSizeChange(s)}
                  className="flex-1 py-4 rounded-2xl font-jakarta transition-all duration-200 flex flex-col items-center gap-1"
                  style={size === s ? {
                    background: 'linear-gradient(135deg, #F59E0B, #D97706)',
                    boxShadow: '0 4px 14px rgba(217,119,6,0.3)',
                    color: 'white',
                  } : { background: 'var(--card-subtle)', color: 'var(--text-secondary)' }}
                >
                  <span className="text-base font-bold">{l}</span>
                  {prices.find(p => p.size === s) && (
                    <span
                      className="text-xs font-medium"
                      style={{ color: size === s ? 'rgba(255,255,255,0.7)' : '#A8A29E' }}
                    >
                      GH₵ {Number(prices.find(p => p.size === s).amount).toFixed(2)}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Quantity */}
        <Input
          label={type === 'received' ? 'Number of Crates' : 'Quantity (eggs)'}
          type="number"
          inputMode="numeric"
          placeholder="0"
          value={qty}
          onChange={e => { setQty(e.target.value); setErrors(v => ({ ...v, qty: '' })) }}
          error={errors.qty}
        />

        {/* Price — only for received */}
        {type === 'received' && (
          <>
            <Input
              label="Price per Crate (GH₵)"
              type="number"
              inputMode="decimal"
              placeholder={currentPrice ? String(currentPrice) : '0.00'}
              value={displayPrice}
              onChange={e => { setPriceInput(e.target.value); setErrors(v => ({ ...v, price: '' })) }}
              error={errors.price}
            />

            {/* Total cost preview */}
            {qty && !isNaN(qty) && Number(qty) > 0 && displayPrice && !isNaN(displayPrice) && Number(displayPrice) > 0 && (
              <div
                className="rounded-2xl px-5 py-4 flex justify-between items-center"
                style={{ background: 'linear-gradient(135deg, #EFF6FF, #DBEAFE)' }}
              >
                <div>
                  <p className="text-xs text-blue-700 font-semibold font-jakarta">Total Stock Value</p>
                  <p className="text-xs text-blue-500 font-inter mt-0.5">{qty} crates × GH₵{displayPrice}</p>
                </div>
                <span className="text-2xl font-bold text-blue-700 tabular-nums font-jakarta">
                  GH₵ {(Number(qty) * Number(displayPrice)).toFixed(2)}
                </span>
              </div>
            )}

            <div
              className="rounded-2xl px-4 py-3 flex items-start gap-3"
              style={{ background: '#FFFBEB' }}
            >
              <span className="text-base mt-0.5">💡</span>
              <p className="text-xs text-amber-700 font-inter leading-relaxed">
                Saving this entry will also update the <strong>live price</strong> for {size} eggs, applying it to new sales and credit deliveries.
              </p>
            </div>
          </>
        )}

        <Input
          label="Note (optional)"
          placeholder={type === 'received' ? 'e.g. Morning delivery' : 'e.g. Cracked during packing'}
          value={note}
          onChange={e => setNote(e.target.value)}
        />

        <Button onClick={handleSave} disabled={saving} fullWidth>
          {saving ? 'Saving…' : 'Save Entry'}
        </Button>
      </div>
    </Sheet>
  )
}
