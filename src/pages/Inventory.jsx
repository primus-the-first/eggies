import { useState, useEffect } from 'react'
import { format } from 'date-fns'
import { PackagePlus, EggOff, Trash2 } from 'lucide-react'
import { useStore } from '../store/useStore'
import Card from '../components/Card'
import FAB from '../components/FAB'
import Sheet from '../components/Sheet'
import Input from '../components/Input'
import Button from '../components/Button'

const ENTRY_TYPES = [
  { value: 'received',  label: 'Received',  icon: PackagePlus, color: '#3B82F6', bg: '#EFF6FF' },
  { value: 'broken',    label: 'Broken',    icon: EggOff,      color: '#F43F5E', bg: '#FFF1F2' },
  { value: 'discarded', label: 'Discarded', icon: Trash2,      color: '#F43F5E', bg: '#FFF1F2' },
]

export default function Inventory() {
  const { inventoryEntries, sales, fetchInventory, addInventoryEntry } = useStore()
  const [sheetOpen, setSheetOpen] = useState(false)

  useEffect(() => { fetchInventory() }, [])

  const totalReceived  = inventoryEntries.filter(e => e.type === 'received').reduce((a, e) => a + e.quantity, 0)
  const totalSold      = sales.reduce((a, s) => a + Number(s.quantity), 0)
  const totalBroken    = inventoryEntries.filter(e => e.type === 'broken').reduce((a, e) => a + e.quantity, 0)
  const totalDiscarded = inventoryEntries.filter(e => e.type === 'discarded').reduce((a, e) => a + e.quantity, 0)
  const currentStock   = totalReceived - totalSold - totalBroken - totalDiscarded

  const lowStock = currentStock < 20

  const usedPct = totalReceived > 0 ? Math.min(((totalSold + totalBroken + totalDiscarded) / totalReceived) * 100, 100) : 0

  return (
    <div className="flex flex-col gap-4 px-4 pt-12 pb-32">
      <h1 className="text-2xl font-bold text-stone-900 font-jakarta">Stock</h1>

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
                style={{
                  width: `${usedPct}%`,
                  background: lowStock ? 'white' : '#F59E0B',
                }}
              />
            </div>
            <p className="text-xs mt-1.5 font-inter" style={{ color: lowStock ? 'rgba(255,255,255,0.5)' : '#78716C' }}>
              {usedPct.toFixed(0)}% of stock used
            </p>
          </div>
        )}
      </div>

      {/* Breakdown grid */}
      <div className="grid grid-cols-3 gap-3">
        <MiniStat label="Received" value={totalReceived} color="#3B82F6" bg="#EFF6FF" />
        <MiniStat label="Sold" value={totalSold} color="#D97706" bg="#FEF3C7" />
        <MiniStat label="Broken" value={totalBroken + totalDiscarded} color="#F43F5E" bg="#FFF1F2" />
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
      <AddEntrySheet open={sheetOpen} onClose={() => setSheetOpen(false)} onSave={addInventoryEntry} />
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
  return (
    <div className="bg-white rounded-3xl px-4 py-3.5 flex items-center justify-between" style={{ boxShadow: 'var(--shadow-card)' }}>
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0"
          style={{ background: typeInfo.bg }}>
          <Icon size={17} color={typeInfo.color} />
        </div>
        <div>
          <p className="text-sm font-semibold text-stone-900 font-jakarta">
            {entry.quantity} egg crates ·<span className="capitalize font-normal text-stone-500">{entry.type}</span>
          </p>
          <p className="text-xs text-stone-400 font-inter mt-0.5">
            {format(new Date(entry.created_at), 'MMM d · h:mm a')}
            {entry.note ? ` · ${entry.note}` : ''}
          </p>
        </div>
      </div>
    </div>
  )
}

function AddEntrySheet({ open, onClose, onSave }) {
  const [type, setType] = useState('received')
  const [qty, setQty] = useState('')
  const [note, setNote] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const reset = () => { setType('received'); setQty(''); setNote(''); setError('') }
  const handleClose = () => { reset(); onClose() }

  const handleSave = async () => {
    if (!qty || isNaN(qty) || Number(qty) <= 0) { setError('Enter a valid quantity'); return }
    setSaving(true)
    const { error: err } = await onSave({ type, quantity: Number(qty), note: note.trim() || null })
    setSaving(false)
    if (!err) handleClose()
  }

  return (
    <Sheet open={open} onClose={handleClose} title="Update Stock">
      <div className="flex flex-col gap-5">
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

        <Input
          label="Quantity"
          type="number"
          inputMode="numeric"
          placeholder="Number of eggs"
          value={qty}
          onChange={e => { setQty(e.target.value); setError('') }}
          error={error}
        />

        <Input
          label="Note (optional)"
          placeholder="e.g. Morning delivery"
          value={note}
          onChange={e => setNote(e.target.value)}
        />

        <Button onClick={handleSave} disabled={saving} fullWidth>
          {saving ? 'Saving...' : 'Save Entry'}
        </Button>
      </div>
    </Sheet>
  )
}
