import { useState, useEffect } from 'react'
import { format, isToday, isThisWeek } from 'date-fns'
import { Banknote, Smartphone } from 'lucide-react'
import { useStore } from '../store/useStore'
import Card from '../components/Card'
import Badge from '../components/Badge'
import FAB from '../components/FAB'
import Sheet from '../components/Sheet'
import Input from '../components/Input'
import Button from '../components/Button'
import HeaderActions from '../components/HeaderActions'

const FILTERS = ['Today', 'This Week', 'All']
const EGGS_PER_CRATE = 30


export default function Sales() {
  const { sales, fetchSales, addSale } = useStore()

  const [sheetOpen, setSheetOpen] = useState(false)
  const [filter, setFilter] = useState('Today')

  useEffect(() => { fetchSales() }, [])

  const filtered = sales.filter(s => {
    const d = new Date(s.created_at)
    if (filter === 'Today') return isToday(d)
    if (filter === 'This Week') return isThisWeek(d, { weekStartsOn: 1 })
    return true
  })

  const totalRevenue = filtered.reduce((a, s) => a + Number(s.total), 0)
  const totalCash = filtered.filter(s => s.payment_method === 'cash').reduce((a, s) => a + Number(s.total), 0)
  const totalMomo = filtered.filter(s => s.payment_method === 'momo').reduce((a, s) => a + Number(s.total), 0)
  const cashPct = totalRevenue > 0 ? (totalCash / totalRevenue) * 100 : 0

  return (
    <div className="flex flex-col gap-4 px-4 pt-12 pb-32">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-bold text-stone-900 font-jakarta">Sales</h1>
          <span className="text-xs font-inter px-3 py-1.5 rounded-full" style={{ background: 'var(--card-bg)', color: 'var(--text-muted)', boxShadow: 'var(--shadow-card)' }}>
            {filtered.length}
          </span>
        </div>
        <HeaderActions />
      </div>

      {/* Filter tabs */}
      <div
        className="flex gap-1 p-1 rounded-2xl"
        style={{ background: 'var(--tab-bg)' }}
      >
        {FILTERS.map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`flex-1 py-2 rounded-xl text-sm font-semibold font-jakarta transition-all duration-200
              ${filter === f ? 'bg-white text-stone-900 shadow-sm' : 'text-stone-500'}`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Summary card */}
      <div
        className="rounded-3xl p-5 text-white"
        style={{ background: 'linear-gradient(160deg, #131210 0%, #1E1C19 100%)', boxShadow: '0 4px 24px rgba(0,0,0,0.15)' }}
      >
        <p className="text-stone-500 text-xs font-semibold uppercase tracking-widest font-jakarta mb-1">Total Revenue</p>
        <p className="text-4xl font-bold tabular-nums font-jakarta" style={{ color: '#F59E0B' }}>
          GH₵ {totalRevenue.toFixed(2)}
        </p>

        {/* Progress bar */}
        {totalRevenue > 0 && (
          <div className="mt-4 flex flex-col gap-2">
            <div className="h-1.5 rounded-full overflow-hidden flex" style={{ background: '#2A2820' }}>
              <div className="h-full transition-all duration-500 rounded-full" style={{ width: `${cashPct}%`, background: '#10B981' }} />
              <div className="h-full transition-all duration-500 rounded-full" style={{ width: `${100 - cashPct}%`, background: '#8B5CF6' }} />
            </div>
          </div>
        )}

        <div className="flex gap-5 mt-3">
          <Metric label="Cash" value={`GH₵ ${totalCash.toFixed(2)}`} color="#10B981" icon={<Banknote size={12} />} />
          <Metric label="MoMo" value={`GH₵ ${totalMomo.toFixed(2)}`} color="#8B5CF6" icon={<Smartphone size={12} />} />
          <Metric label="Txns" value={filtered.length} color="#78716C" />
        </div>
      </div>

      {/* Sales list */}
      {filtered.length === 0 ? (
        <Card>
          <div className="flex flex-col items-center py-8 gap-3">
            <span className="text-5xl">🥚</span>
            <p className="text-stone-400 text-sm font-inter">No sales for this period</p>
          </div>
        </Card>
      ) : (
        <div className="flex flex-col gap-2">
          {filtered.map(sale => <SaleItem key={sale.id} sale={sale} />)}
        </div>
      )}

      <FAB onClick={() => setSheetOpen(true)} label="Record sale" />
      <AddSaleSheet open={sheetOpen} onClose={() => setSheetOpen(false)} onSave={addSale} />
    </div>
  )
}

function Metric({ label, value, color, icon }) {
  return (
    <div>
      <div className="flex items-center gap-1 mb-0.5">
        {icon && <span style={{ color }}>{icon}</span>}
        <p className="text-[10px] text-stone-500 font-inter uppercase tracking-wider">{label}</p>
      </div>
      <p className="text-sm font-bold font-jakarta tabular-nums" style={{ color }}>{value}</p>
    </div>
  )
}

function SaleItem({ sale }) {
  const isCrates = sale.size && sale.quantity % EGGS_PER_CRATE === 0 && sale.quantity >= EGGS_PER_CRATE
  const crates = sale.quantity / EGGS_PER_CRATE
  const qtyLabel = isCrates
    ? `${crates} crate${crates !== 1 ? 's' : ''} (${sale.quantity} eggs)`
    : `${sale.quantity} egg${sale.quantity !== 1 ? 's' : ''}`

  return (
    <div
      className="bg-white rounded-3xl px-4 py-3.5 flex items-center justify-between"
      style={{ boxShadow: 'var(--shadow-card)' }}
    >
      <div className="flex items-center gap-3">
        <div
          className="w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0"
          style={{ background: sale.payment_method === 'momo' ? '#F5F3FF' : '#ECFDF5' }}
        >
          {sale.payment_method === 'momo'
            ? <Smartphone size={18} color="#8B5CF6" />
            : <Banknote size={18} color="#10B981" />
          }
        </div>
        <div>
          <p className="text-sm font-semibold text-stone-900 font-jakarta">
            {qtyLabel}
          </p>
          <p className="text-xs text-stone-400 font-inter mt-0.5">
            {format(new Date(sale.created_at), 'MMM d · h:mm a')}
            {sale.size ? ` · ${sale.size.charAt(0).toUpperCase() + sale.size.slice(1)}` : ''}
            {sale.note ? ` · ${sale.note}` : ''}
          </p>
        </div>
      </div>
      <div className="flex flex-col items-end gap-1.5">
        <p className="text-sm font-bold tabular-nums font-jakarta">GH₵ {Number(sale.total).toFixed(2)}</p>
        <Badge type={sale.payment_method} label={sale.payment_method === 'momo' ? 'MoMo' : 'Cash'} />
      </div>
    </div>
  )
}

function AddSaleSheet({ open, onClose, onSave }) {
  const [unit, setUnit] = useState('crates')
  const [size, setSize] = useState('small')
  const [qty, setQty] = useState('')
  const [price, setPrice] = useState('')
  const [method, setMethod] = useState('cash')
  const [note, setNote] = useState('')
  const [saving, setSaving] = useState(false)
  const [qtyError, setQtyError] = useState('')
  const [priceError, setPriceError] = useState('')

  const q = Number(qty)
  const p = Number(price)
  const hasPreview = qty && !isNaN(qty) && q > 0 && price && !isNaN(price) && p > 0
  const total = hasPreview ? (unit === 'crates' ? q * p : p) : null

  const handleUnitChange = (u) => {
    setUnit(u); setSize('small'); setQty(''); setPrice('')
    setQtyError(''); setPriceError('')
  }

  const reset = () => {
    setUnit('crates'); setSize('small'); setQty(''); setPrice('')
    setMethod('cash'); setNote(''); setQtyError(''); setPriceError('')
  }
  const handleClose = () => { reset(); onClose() }

  const handleSave = async () => {
    let valid = true
    if (!qty || isNaN(qty) || q <= 0) { setQtyError('Enter a valid quantity'); valid = false }
    if (!price || isNaN(price) || p <= 0) { setPriceError('Enter a valid price'); valid = false }
    if (!valid) return

    const savedTotal = unit === 'crates' ? q * p : p
    const savedQty = unit === 'crates' ? q * EGGS_PER_CRATE : q

    setSaving(true)
    const { error } = await onSave({
      quantity: savedQty,
      price_per_egg: savedTotal / savedQty,
      total: savedTotal,
      payment_method: method,
      size: unit === 'crates' ? size : null,
      note: note.trim() || null,
    })
    setSaving(false)
    if (!error) handleClose()
  }

  return (
    <Sheet open={open} onClose={handleClose} title="Record Sale">
      <div className="flex flex-col gap-5">

        {/* Sell by */}
        <div>
          <p className="text-xs font-semibold text-stone-500 uppercase tracking-widest font-jakarta mb-3">Sell By</p>
          <div className="flex gap-3">
            {[
              { v: 'crates', l: '📦 Crates' },
              { v: 'eggs',   l: '🥚 Individual Eggs' },
            ].map(({ v, l }) => (
              <button
                key={v}
                onClick={() => handleUnitChange(v)}
                className="flex-1 py-3.5 rounded-2xl font-semibold text-sm font-jakarta transition-all duration-200"
                style={unit === v
                  ? { background: 'linear-gradient(135deg, #F59E0B, #D97706)', color: 'white', boxShadow: '0 4px 14px rgba(217,119,6,0.3)' }
                  : { background: 'var(--card-subtle)', color: 'var(--text-secondary)' }
                }
              >{l}</button>
            ))}
          </div>
        </div>

        {/* Egg size — crates only, labels only */}
        {unit === 'crates' && (
          <div>
            <p className="text-xs font-semibold text-stone-500 uppercase tracking-widest font-jakarta mb-3">Egg Size</p>
            <div className="flex gap-3">
              {[{ v: 'small', l: 'Small' }, { v: 'large', l: 'Large' }].map(({ v, l }) => (
                <button
                  key={v}
                  onClick={() => setSize(v)}
                  className="flex-1 py-3.5 rounded-2xl font-semibold text-sm font-jakarta transition-all duration-200"
                  style={size === v
                    ? { background: 'linear-gradient(135deg, #F59E0B, #D97706)', color: 'white', boxShadow: '0 4px 14px rgba(217,119,6,0.3)' }
                    : { background: 'var(--card-subtle)', color: 'var(--text-secondary)' }
                  }
                >{l}</button>
              ))}
            </div>
          </div>
        )}

        <Input
          label={unit === 'crates' ? 'Number of Crates' : 'Number of Eggs'}
          type="number"
          inputMode="numeric"
          placeholder="0"
          value={qty}
          onChange={e => { setQty(e.target.value); setQtyError('') }}
          error={qtyError}
        />

        <Input
          label={unit === 'crates' ? 'Price per Crate (GH₵)' : 'Price (GH₵)'}
          type="number"
          inputMode="decimal"
          placeholder="0.00"
          value={price}
          onChange={e => { setPrice(e.target.value); setPriceError('') }}
          error={priceError}
        />

        {/* Total preview */}
        {total !== null && (
          <div
            className="rounded-2xl px-5 py-4 flex justify-between items-center"
            style={{ background: 'linear-gradient(135deg, #FEF3C7, #FDE68A)' }}
          >
            <div>
              <span className="text-sm text-amber-800 font-semibold font-jakarta">Total</span>
              {unit === 'crates' && (
                <p className="text-xs text-amber-700 font-inter mt-0.5">{Number(qty) * EGGS_PER_CRATE} eggs · {size}</p>
              )}
            </div>
            <span className="text-2xl font-bold text-amber-700 tabular-nums font-jakarta">
              GH₵ {total.toFixed(2)}
            </span>
          </div>
        )}

        {/* Payment method */}
        <div>
          <p className="text-xs font-semibold text-stone-500 uppercase tracking-widest font-jakarta mb-3">Payment</p>
          <div className="flex gap-3">
            <PaymentToggle
              active={method === 'cash'}
              onClick={() => setMethod('cash')}
              icon={<Banknote size={18} />}
              label="Cash"
              activeColor="#10B981"
              activeBg="#ECFDF5"
            />
            <PaymentToggle
              active={method === 'momo'}
              onClick={() => setMethod('momo')}
              icon={<Smartphone size={18} />}
              label="MoMo"
              activeColor="#8B5CF6"
              activeBg="#F5F3FF"
            />
          </div>
        </div>

        <Input
          label="Note (optional)"
          placeholder="e.g. Morning market"
          value={note}
          onChange={e => setNote(e.target.value)}
        />

        <Button onClick={handleSave} disabled={saving} fullWidth>
          {saving ? 'Saving...' : 'Save Sale'}
        </Button>
      </div>
    </Sheet>
  )
}

function PaymentToggle({ active, onClick, icon, label, activeColor, activeBg }) {
  return (
    <button
      onClick={onClick}
      className="flex-1 py-3.5 rounded-2xl font-semibold text-sm font-jakarta transition-all duration-200 flex items-center justify-center gap-2"
      style={active
        ? { background: activeBg, color: activeColor, boxShadow: `0 0 0 2px ${activeColor}30` }
        : { background: 'var(--card-subtle)', color: 'var(--text-secondary)' }
      }
    >
      {icon}
      {label}
    </button>
  )
}
