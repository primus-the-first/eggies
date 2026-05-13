import { useEffect, useState } from 'react'
import { format, isToday } from 'date-fns'
import { TrendingUp, Egg, AlertTriangle, CreditCard, Settings } from 'lucide-react'
import { useStore } from '../store/useStore'
import Card from '../components/Card'
import Badge from '../components/Badge'
import PriceSettings from '../components/PriceSettings'
import HeaderActions from '../components/HeaderActions'

export default function Dashboard() {
  const { sales, inventoryEntries, creditTransactions, creditCustomers, fetchAll, loading } = useStore()
  const [priceOpen, setPriceOpen] = useState(false)

  useEffect(() => { fetchAll() }, [])

  const todaySales = sales.filter(s => isToday(new Date(s.created_at)))
  const todayRevenue = todaySales.reduce((acc, s) => acc + Number(s.total), 0)
  const todayCash = todaySales.filter(s => s.payment_method === 'cash').reduce((acc, s) => acc + Number(s.total), 0)
  const todayMomo = todaySales.filter(s => s.payment_method === 'momo').reduce((acc, s) => acc + Number(s.total), 0)
  const todayEggsSold = todaySales.reduce((acc, s) => acc + Number(s.quantity), 0)

  const totalReceived = inventoryEntries.filter(e => e.type === 'received').reduce((a, e) => a + e.quantity, 0)
  const totalSold = sales.reduce((a, s) => a + Number(s.quantity), 0)
  const totalBroken = inventoryEntries.filter(e => e.type === 'broken' || e.type === 'discarded').reduce((a, e) => a + e.quantity, 0)
  const currentStock = totalReceived - totalSold - totalBroken

  const totalCredit = creditCustomers.reduce((acc, c) => {
    const txs = creditTransactions.filter(t => t.customer_id === c.id)
    const delivered = txs.filter(t => t.type === 'delivery').reduce((a, t) => a + Number(t.amount), 0)
    const paid = txs.filter(t => t.type === 'payment').reduce((a, t) => a + Number(t.amount), 0)
    return acc + (delivered - paid)
  }, 0)

  const cashPct = todayRevenue > 0 ? (todayCash / todayRevenue) * 100 : 0
  const momoPct = todayRevenue > 0 ? (todayMomo / todayRevenue) * 100 : 0

  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'

  return (
    <div className="flex flex-col pb-32">
      {/* Header */}
      <div
        className="px-5 pt-12 pb-8 relative"
        style={{ background: 'linear-gradient(160deg, #131210 0%, #1E1C19 100%)' }}
      >
        {/* Decorative circle */}
        <div
          className="absolute -top-12 -right-12 w-48 h-48 rounded-full opacity-10 pointer-events-none"
          style={{ background: 'radial-gradient(circle, #F59E0B, transparent)' }}
        />
        <div
          className="absolute top-6 right-8 w-20 h-20 rounded-full opacity-20 pointer-events-none"
          style={{ background: 'radial-gradient(circle, #F59E0B, transparent)' }}
        />

        <div className="flex items-start justify-between mb-6">
          <div>
            <p className="text-stone-400 text-sm font-inter mb-1">{format(new Date(), 'EEEE, MMMM d')}</p>
            <h1 className="text-white text-2xl font-bold font-jakarta">{greeting} 👋</h1>
          </div>
          <div className="flex items-center gap-2">
            <HeaderActions variant="dark" />
            <button
              onClick={() => setPriceOpen(true)}
              className="w-10 h-10 rounded-2xl flex items-center justify-center transition-colors active:bg-white/20"
              style={{ background: 'rgba(255,255,255,0.08)' }}
              aria-label="Edit prices"
            >
              <Settings size={18} color="#A8A29E" />
            </button>
          </div>
        </div>

        {/* Revenue card */}
        <div className="relative">
          <p className="text-stone-500 text-xs font-semibold uppercase tracking-widest font-jakarta mb-2">Today's Revenue</p>
          <div className="flex items-end gap-2 mb-4">
            <span
              className="text-5xl font-bold tabular-nums font-jakarta"
              style={{ color: '#F59E0B' }}
            >
              GH₵ {todayRevenue.toFixed(2)}
            </span>
          </div>

          {/* Payment split */}
          {todayRevenue > 0 && (
            <div className="flex flex-col gap-2">
              <div className="h-2 rounded-full overflow-hidden flex" style={{ background: '#2A2820' }}>
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{ width: `${cashPct}%`, background: '#10B981' }}
                />
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{ width: `${momoPct}%`, background: '#8B5CF6' }}
                />
              </div>
              <div className="flex gap-4">
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full" style={{ background: '#10B981' }} />
                  <span className="text-xs text-stone-400 font-inter">Cash GH₵ {todayCash.toFixed(2)}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full" style={{ background: '#8B5CF6' }} />
                  <span className="text-xs text-stone-400 font-inter">MoMo GH₵ {todayMomo.toFixed(2)}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Quick stats */}
      <div className="px-4 -mt-4 grid grid-cols-3 gap-3 relative z-10">
        <StatPill
          icon={<TrendingUp size={16} />}
          label="Sold"
          value={todayEggsSold}
          color="#F59E0B"
          bg="#FEF3C7"
        />
        <StatPill
          icon={<Egg size={16} />}
          label="In Stock"
          value={currentStock}
          color={currentStock < 20 ? '#F43F5E' : 'var(--text-primary)'}
          bg={currentStock < 20 ? '#FFF1F2' : '#F5F5F4'}
          warn={currentStock < 20}
        />
        <StatPill
          icon={<AlertTriangle size={16} />}
          label="Broken"
          value={totalBroken}
          color="#F43F5E"
          bg="#FFF1F2"
        />
      </div>

      {/* Outstanding credit */}
      {totalCredit > 0 && (
        <div className="px-4 mt-4">
          <div
            className="rounded-3xl px-5 py-4 flex items-center justify-between"
            style={{ background: 'linear-gradient(135deg, #7C3AED, #8B5CF6)', boxShadow: '0 4px 16px rgba(124,58,237,0.25)' }}
          >
            <div>
              <p className="text-violet-200 text-xs font-semibold uppercase tracking-widest font-jakarta">Outstanding Credit</p>
              <p className="text-white text-2xl font-bold font-jakarta tabular-nums mt-0.5">GH₵ {totalCredit.toFixed(2)}</p>
            </div>
            <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center">
              <CreditCard size={20} color="white" />
            </div>
          </div>
        </div>
      )}

      {/* Today's sales feed */}
      <div className="px-4 mt-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-bold text-stone-800 font-jakarta">Today's Sales</h2>
          <span className="text-xs text-stone-400 font-inter">{todaySales.length} transactions</span>
        </div>

        {loading && (
          <div className="flex flex-col gap-2">
            {[1,2,3].map(i => (
              <div key={i} className="bg-white rounded-3xl h-16 animate-pulse" style={{ boxShadow: 'var(--shadow-card)' }} />
            ))}
          </div>
        )}

        {!loading && todaySales.length === 0 && (
          <Card>
            <div className="flex flex-col items-center py-6 gap-2">
              <span className="text-4xl">🥚</span>
              <p className="text-stone-400 text-sm font-inter">No sales recorded yet today</p>
            </div>
          </Card>
        )}

        <div className="flex flex-col gap-2">
          {todaySales.map(sale => (
            <SaleRow key={sale.id} sale={sale} />
          ))}
        </div>
      </div>

      <PriceSettings open={priceOpen} onClose={() => setPriceOpen(false)} />
    </div>
  )
}

function StatPill({ icon, label, value, color, bg, warn }) {
  return (
    <div
      className="rounded-3xl p-3 flex flex-col gap-1"
      style={{ background: 'var(--card-bg)', boxShadow: 'var(--shadow-card)' }}
    >
      <div
        className="w-7 h-7 rounded-xl flex items-center justify-center"
        style={{ background: bg, color }}
      >
        {icon}
      </div>
      <p className="text-xl font-bold font-jakarta tabular-nums mt-0.5" style={{ color: warn ? '#F43F5E' : 'var(--text-primary)' }}>
        {value}
      </p>
      <p className="text-[11px] text-stone-400 font-inter">{label}</p>
    </div>
  )
}

function SaleRow({ sale }) {
  return (
    <div
      className="bg-white rounded-3xl px-4 py-3 flex items-center justify-between"
      style={{ boxShadow: 'var(--shadow-card)' }}
    >
      <div className="flex items-center gap-3">
        <div
          className="w-10 h-10 rounded-2xl flex items-center justify-center text-base"
          style={{ background: '#FEF3C7' }}
        >
          🥚
        </div>
        <div>
          <p className="text-sm font-semibold text-stone-900 font-jakarta">
            {sale.quantity} eggs
            {sale.size ? <span className="text-stone-400 font-normal"> · {sale.size === 'small' ? 'Sm' : 'Lg'}</span> : ''}
          </p>
          <p className="text-xs text-stone-400 font-inter mt-0.5">
            {format(new Date(sale.created_at), 'h:mm a')}
            {sale.note ? ` · ${sale.note}` : ''}
          </p>
        </div>
      </div>
      <div className="flex flex-col items-end gap-1.5">
        <p className="text-sm font-bold tabular-nums text-stone-900 font-jakarta">GH₵ {Number(sale.total).toFixed(2)}</p>
        <Badge type={sale.payment_method} label={sale.payment_method === 'momo' ? 'MoMo' : 'Cash'} />
      </div>
    </div>
  )
}
