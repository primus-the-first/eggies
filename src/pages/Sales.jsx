import { useState, useEffect } from 'react'
import { format, isToday, isThisWeek } from 'date-fns'
import { Banknote, Smartphone, ChevronRight } from 'lucide-react'
import { useStore } from '../store/useStore'
import Card from '../components/Card'
import Badge from '../components/Badge'
import FAB from '../components/FAB'
import Sheet from '../components/Sheet'
import Input from '../components/Input'
import Button from '../components/Button'

const FILTERS = ['Today', 'This Week', 'All']


export default function Sales() {
  const { sales, fetchSales, addSale, prices, fetchPrices } = useStore()

  const [sheetOpen, setSheetOpen] = useState(false)
  const [filter, setFilter] = useState('Today')

  useEffect(() => { fetchSales(); fetchPrices() }, [])

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
        <h1 className="text-2xl font-bold text-stone-900 font-jakarta">Sales</h1>
        <span className="text-xs font-inter px-3 py-1.5 rounded-full" style={{ background: 'var(--card-bg)', color: 'var(--text-muted)', boxShadow: 'var(--shadow-card)' }}>
          {filtered.length} records
        </span>
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
      <AddSaleSheet open={sheetOpen} onClose={() => setSheetOpen(false)} onSave={addSale} prices={prices} />
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
  const sizeLabel = sale.size ? (sale.size === 'small' ? 'Small' : 'Large') : null
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
            {sale.quantity} eggs
            {sizeLabel && <span className="text-stone-400 font-normal text-xs"> · {sizeLabel}</span>}
          </p>
          <p className="text-xs text-stone-400 font-inter mt-0.5">
            {format(new Date(sale.created_at), 'MMM d · h:mm a')}
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

function AddSaleSheet({ open, onClose, onSave, prices }) {
  const [size, setSize] = useState('small')
  const [qty, setQty] = useState('')
  const [method, setMethod] = useState('cash')
  const [note, setNote] = useState('')
  const [saving, setSaving] = useState(false)
  const [qtyError, setQtyError] = useState('')

  const priceObj = prices.find(p => p.size === size)
  const price = priceObj?.amount ?? (size === 'small' ? 50 : 55)

  const reset = () => { setSize('small'); setQty(''); setMethod('cash'); setNote(''); setQtyError('') }
  const handleClose = () => { reset(); onClose() }

  const handleSave = async () => {
    if (!qty || isNaN(qty) || Number(qty) <= 0) { setQtyError('Enter a valid quantity'); return }
    setSaving(true)
    const { error } = await onSave({
      quantity: Number(qty),
      price_per_egg: price,
      total: Number(qty) * price,
      payment_method: method,
      size,
      note: note.trim() || null,
    })
    setSaving(false)
    if (!error) handleClose()
  }

  return (
    <Sheet open={open} onClose={handleClose} title="Record Sale">
      <div className="flex flex-col gap-5">

        {/* Egg size */}
        <div>
          <p className="text-xs font-semibold text-stone-500 uppercase tracking-widest font-jakarta mb-3">Egg Size</p>
          <div className="flex gap-3">
            {(prices.length > 0
              ? prices
              : [{ size: 'small', label: 'Small', amount: 50 }, { size: 'large', label: 'Large', amount: 55 }]
            ).map(p => (
              <button
                key={p.size}
                onClick={() => setSize(p.size)}
                className="flex-1 py-4 rounded-2xl font-jakarta transition-all duration-200 flex flex-col items-center gap-1"
                style={size === p.size ? {
                  background: 'linear-gradient(135deg, #F59E0B, #D97706)',
                  boxShadow: '0 4px 14px rgba(217,119,6,0.3)',
                  color: 'white',
                } : { background: 'var(--card-subtle)', color: 'var(--text-secondary)' }}
              >
                <span className="text-base font-bold">{p.label}</span>
                <span className="text-xs font-medium" style={{ color: size === p.size ? 'rgba(255,255,255,0.7)' : '#A8A29E' }}>
                  GH₵ {p.amount}
                </span>
              </button>
            ))}
          </div>
        </div>

        <Input
          label="Number of Crates"
          type="number"
          inputMode="numeric"
          placeholder="0"
          value={qty}
          onChange={e => { setQty(e.target.value); setQtyError('') }}
          error={qtyError}
        />

        {/* Total preview */}
        {qty && !isNaN(qty) && Number(qty) > 0 && (
          <div
            className="rounded-2xl px-5 py-4 flex justify-between items-center"
            style={{ background: 'linear-gradient(135deg, #FEF3C7, #FDE68A)' }}
          >
            <span className="text-sm text-amber-800 font-semibold font-jakarta">Total</span>
            <span className="text-2xl font-bold text-amber-700 tabular-nums font-jakarta">
              GH₵ {(Number(qty) * price).toFixed(2)}
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
