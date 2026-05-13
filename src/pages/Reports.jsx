import { useState, useEffect } from 'react'
import { format, isToday, isThisWeek, isThisMonth, startOfWeek, endOfWeek, parseISO, startOfDay, endOfDay } from 'date-fns'
import { Download, TrendingUp, Egg, AlertTriangle, Banknote, Smartphone } from 'lucide-react'
import { useStore } from '../store/useStore'
import { generatePDF } from '../lib/pdf'
import HeaderActions from '../components/HeaderActions'

const PERIODS = ['Daily', 'Weekly', 'Monthly', 'Custom']

export default function Reports() {
  const { sales, inventoryEntries, creditCustomers, creditTransactions, fetchAll } = useStore()
  const [period, setPeriod] = useState('Daily')
  const [generating, setGenerating] = useState(false)
  const todayStr = format(new Date(), 'yyyy-MM-dd')
  const [customStart, setCustomStart] = useState(todayStr)
  const [customEnd, setCustomEnd] = useState(todayStr)

  useEffect(() => { fetchAll() }, [])

  const now = new Date()

  const filterByPeriod = (items, dateKey = 'created_at') =>
    items.filter(item => {
      const d = new Date(item[dateKey])
      if (period === 'Daily')   return isToday(d)
      if (period === 'Weekly')  return isThisWeek(d, { weekStartsOn: 1 })
      if (period === 'Custom') {
        const from = startOfDay(parseISO(customStart))
        const to   = endOfDay(parseISO(customEnd))
        return d >= from && d <= to
      }
      return isThisMonth(d)
    })

  const periodSales     = filterByPeriod(sales)
  const periodInventory = filterByPeriod(inventoryEntries)

  const revenue      = periodSales.reduce((a, s) => a + Number(s.total), 0)
  const cashRevenue  = periodSales.filter(s => s.payment_method === 'cash').reduce((a, s) => a + Number(s.total), 0)
  const momoRevenue  = periodSales.filter(s => s.payment_method === 'momo').reduce((a, s) => a + Number(s.total), 0)
  const eggsSold     = periodSales.reduce((a, s) => a + Number(s.quantity), 0)
  const eggsReceived = periodInventory.filter(e => e.type === 'received').reduce((a, e) => a + e.quantity, 0)
  const eggsBroken   = periodInventory.filter(e => e.type === 'broken' || e.type === 'discarded').reduce((a, e) => a + e.quantity, 0)
  const cashPct      = revenue > 0 ? (cashRevenue / revenue) * 100 : 0

  const customLabel = customStart === customEnd
    ? format(parseISO(customStart), 'MMMM d, yyyy')
    : `${format(parseISO(customStart), 'MMM d')} – ${format(parseISO(customEnd), 'MMM d, yyyy')}`

  const periodLabel = {
    Daily:   format(now, 'MMMM d, yyyy'),
    Weekly:  `${format(startOfWeek(now, { weekStartsOn: 1 }), 'MMM d')} – ${format(endOfWeek(now, { weekStartsOn: 1 }), 'MMM d, yyyy')}`,
    Monthly: format(now, 'MMMM yyyy'),
    Custom:  customLabel,
  }[period]

  const topCreditors = creditCustomers
    .map(c => {
      const txs = creditTransactions.filter(t => t.customer_id === c.id)
      const balance =
        txs.filter(t => t.type === 'delivery').reduce((a, t) => a + Number(t.amount), 0) -
        txs.filter(t => t.type === 'payment').reduce((a, t) => a + Number(t.amount), 0)
      return { ...c, balance }
    })
    .filter(c => c.balance > 0)
    .sort((a, b) => b.balance - a.balance)
    .slice(0, 5)

  const handleDownload = async () => {
    setGenerating(true)
    await generatePDF({ period, periodLabel, revenue, cashRevenue, momoRevenue, eggsSold, eggsReceived, eggsBroken, sales: periodSales, topCreditors, cashPct })
    setGenerating(false)
  }

  return (
    <div className="flex flex-col gap-4 px-4 pt-12 pb-32">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-stone-900 font-jakarta">Reports</h1>
        <HeaderActions />
      </div>

      {/* Period selector */}
      <div className="flex gap-1 p-1 rounded-2xl" style={{ background: 'var(--tab-bg)' }}>
        {PERIODS.map(p => (
          <button
            key={p}
            onClick={() => setPeriod(p)}
            className={`flex-1 py-2 rounded-xl text-sm font-semibold font-jakarta transition-all duration-200
              ${period === p ? 'bg-white text-stone-900 shadow-sm' : 'text-stone-500'}`}
          >
            {p}
          </button>
        ))}
      </div>

      {period === 'Custom' && (
        <div className="flex gap-2 items-center">
          <div className="flex-1 flex flex-col gap-1">
            <label className="text-[10px] uppercase tracking-widest text-stone-400 font-inter pl-1">From</label>
            <input
              type="date"
              value={customStart}
              max={customEnd}
              onChange={e => setCustomStart(e.target.value)}
              className="w-full rounded-2xl border border-stone-200 bg-white px-4 py-2.5 text-sm font-jakarta text-stone-800 focus:outline-none focus:ring-2 focus:ring-amber-400"
            />
          </div>
          <div className="flex-1 flex flex-col gap-1">
            <label className="text-[10px] uppercase tracking-widest text-stone-400 font-inter pl-1">To</label>
            <input
              type="date"
              value={customEnd}
              min={customStart}
              max={todayStr}
              onChange={e => setCustomEnd(e.target.value)}
              className="w-full rounded-2xl border border-stone-200 bg-white px-4 py-2.5 text-sm font-jakarta text-stone-800 focus:outline-none focus:ring-2 focus:ring-amber-400"
            />
          </div>
        </div>
      )}

      <p className="text-xs text-stone-400 font-inter -mt-2 pl-1">{periodLabel}</p>

      {/* Revenue hero */}
      <div
        className="rounded-3xl p-5 text-white relative overflow-hidden"
        style={{
          background: 'linear-gradient(160deg, #131210, #1E1C19)',
          boxShadow: '0 4px 24px rgba(0,0,0,0.15)',
        }}
      >
        <div className="absolute -top-8 -right-8 w-36 h-36 rounded-full opacity-10"
          style={{ background: 'radial-gradient(circle, #F59E0B, transparent)' }} />
        <p className="text-stone-500 text-xs font-semibold uppercase tracking-widest font-jakarta mb-2">Revenue</p>
        <p className="text-5xl font-bold tabular-nums font-jakarta" style={{ color: '#F59E0B' }}>
          GH₵ {revenue.toFixed(2)}
        </p>

        {revenue > 0 && (
          <div className="mt-4 flex flex-col gap-2">
            <div className="h-1.5 rounded-full overflow-hidden flex" style={{ background: '#2A2820' }}>
              <div className="h-full rounded-full" style={{ width: `${cashPct}%`, background: '#10B981' }} />
              <div className="h-full rounded-full" style={{ width: `${100 - cashPct}%`, background: '#8B5CF6' }} />
            </div>
          </div>
        )}

        <div className="flex gap-5 mt-3">
          <MiniMetric icon={<Banknote size={12} />} label="Cash" value={`GH₵ ${cashRevenue.toFixed(2)}`} color="#10B981" />
          <MiniMetric icon={<Smartphone size={12} />} label="MoMo" value={`GH₵ ${momoRevenue.toFixed(2)}`} color="#8B5CF6" />
        </div>
      </div>

      {/* Egg stats */}
      <div className="grid grid-cols-3 gap-3">
        <StatCard icon={<TrendingUp size={15} />} label="Eggs Sold" value={eggsSold} color="#D97706" bg="#FEF3C7" />
        <StatCard icon={<Egg size={15} />} label="Received" value={eggsReceived} color="#3B82F6" bg="#EFF6FF" />
        <StatCard icon={<AlertTriangle size={15} />} label="Broken" value={eggsBroken} color="#F43F5E" bg="#FFF1F2" />
      </div>

      {/* Breakdown */}
      <div className="bg-white rounded-3xl p-5" style={{ boxShadow: 'var(--shadow-card)' }}>
        <p className="text-sm font-bold text-stone-800 font-jakarta mb-4">Breakdown</p>
        <div className="flex flex-col gap-0">
          <DataRow label="Transactions" value={periodSales.length} />
          <DataRow label="Avg. per sale" value={periodSales.length ? `GH₵ ${(revenue / periodSales.length).toFixed(2)}` : '—'} />
          <DataRow label="Cash %" value={revenue ? `${cashPct.toFixed(0)}%` : '—'} />
          <DataRow label="MoMo %" value={revenue ? `${(100 - cashPct).toFixed(0)}%` : '—'} />
        </div>
      </div>

      {/* Top creditors */}
      {topCreditors.length > 0 && (
        <div className="bg-white rounded-3xl p-5" style={{ boxShadow: 'var(--shadow-card)' }}>
          <p className="text-sm font-bold text-stone-800 font-jakarta mb-4">Outstanding Credit</p>
          <div className="flex flex-col gap-0">
            {topCreditors.map(c => (
              <DataRow key={c.id} label={c.name} value={`GH₵ ${c.balance.toFixed(2)}`} valueColor="#E11D48" />
            ))}
          </div>
        </div>
      )}

      {/* Download */}
      <button
        onClick={handleDownload}
        disabled={generating}
        className="w-full flex items-center justify-center gap-3 py-4 rounded-3xl font-bold text-sm font-jakarta transition-opacity disabled:opacity-60"
        style={{
          background: 'linear-gradient(135deg, #131210, #1E1C19)',
          color: '#F59E0B',
          boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
        }}
      >
        <Download size={18} />
        {generating ? 'Generating...' : 'Download PDF Report'}
      </button>
    </div>
  )
}

function MiniMetric({ icon, label, value, color }) {
  return (
    <div>
      <div className="flex items-center gap-1 mb-0.5" style={{ color }}>
        {icon}
        <p className="text-[10px] uppercase tracking-wider font-inter" style={{ color: '#57534E' }}>{label}</p>
      </div>
      <p className="text-sm font-bold tabular-nums font-jakarta" style={{ color }}>{value}</p>
    </div>
  )
}

function StatCard({ icon, label, value, color, bg }) {
  return (
    <div className="bg-white rounded-3xl p-3.5 flex flex-col gap-1" style={{ boxShadow: 'var(--shadow-card)' }}>
      <div className="w-7 h-7 rounded-xl flex items-center justify-center" style={{ background: bg, color }}>
        {icon}
      </div>
      <p className="text-xl font-bold tabular-nums font-jakarta mt-1" style={{ color }}>{value}</p>
      <p className="text-[11px] text-stone-400 font-inter">{label}</p>
    </div>
  )
}

function DataRow({ label, value, valueColor }) {
  return (
    <div className="flex justify-between items-center py-3 border-b border-stone-100 last:border-0">
      <span className="text-sm text-stone-500 font-inter">{label}</span>
      <span className="text-sm font-semibold tabular-nums font-jakarta" style={{ color: valueColor ?? 'var(--text-primary)' }}>{value}</span>
    </div>
  )
}
