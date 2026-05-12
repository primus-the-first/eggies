import { useState, useEffect } from 'react'
import { format } from 'date-fns'
import { ShieldCheck, User, Clock, Tag } from 'lucide-react'
import { useStore } from '../store/useStore'
import Card from '../components/Card'

const ACTION_META = {
  price_updated:   { color: '#D97706', bg: '#FEF3C7', label: 'Price Updated' },
  stock_received:  { color: '#3B82F6', bg: '#EFF6FF', label: 'Stock Received' },
  sale_recorded:   { color: '#10B981', bg: '#ECFDF5', label: 'Sale Recorded' },
  stock_broken:    { color: '#F43F5E', bg: '#FFF1F2', label: 'Stock Broken' },
  stock_discarded: { color: '#F43F5E', bg: '#FFF1F2', label: 'Stock Discarded' },
}

export default function AuditLog() {
  const { auditLogs, fetchAuditLogs } = useStore()
  const [filter, setFilter] = useState('all')

  useEffect(() => { fetchAuditLogs() }, [])

  const actions = ['all', ...Object.keys(ACTION_META)]

  const filtered = filter === 'all'
    ? auditLogs
    : auditLogs.filter(l => l.action === filter)

  return (
    <div className="flex flex-col gap-4 px-4 pt-12 pb-32">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div
          className="w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0"
          style={{ background: 'linear-gradient(135deg, #7C3AED, #8B5CF6)', boxShadow: '0 4px 14px rgba(124,58,237,0.3)' }}
        >
          <ShieldCheck size={18} color="white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-stone-900 font-jakarta">Audit Log</h1>
          <p className="text-xs text-stone-400 font-inter">{filtered.length} events</p>
        </div>
      </div>

      {/* Filter chips */}
      <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1" style={{ scrollbarWidth: 'none' }}>
        {actions.map(a => {
          const meta = ACTION_META[a]
          const isActive = filter === a
          return (
            <button
              key={a}
              onClick={() => setFilter(a)}
              className="flex-shrink-0 px-3.5 py-1.5 rounded-full text-xs font-semibold font-jakarta transition-all"
              style={isActive
                ? { background: meta?.bg ?? '#131210', color: meta?.color ?? 'white', boxShadow: `0 0 0 1.5px ${meta?.color ?? '#131210'}40` }
                : { background: '#F5F4F2', color: '#78716C' }
              }
            >
              {meta?.label ?? 'All'}
            </button>
          )
        })}
      </div>

      {/* Log list */}
      {filtered.length === 0 ? (
        <Card>
          <div className="flex flex-col items-center py-10 gap-3">
            <ShieldCheck size={36} color="#D1D5DB" />
            <p className="text-stone-400 text-sm font-inter">No audit events yet</p>
          </div>
        </Card>
      ) : (
        <div className="flex flex-col gap-2">
          {filtered.map(log => {
            const meta = ACTION_META[log.action] ?? { color: '#78716C', bg: '#F5F4F2', label: log.action }
            return (
              <div
                key={log.id}
                className="bg-white rounded-3xl px-4 py-4 flex flex-col gap-2"
                style={{ boxShadow: 'var(--shadow-card)' }}
              >
                {/* Top row */}
                <div className="flex items-center justify-between">
                  <span
                    className="text-xs font-bold px-2.5 py-1 rounded-full font-jakarta"
                    style={{ background: meta.bg, color: meta.color }}
                  >
                    {meta.label}
                  </span>
                  <div className="flex items-center gap-1 text-stone-400">
                    <Clock size={11} />
                    <span className="text-[10px] font-inter">
                      {format(new Date(log.created_at), 'MMM d · h:mm a')}
                    </span>
                  </div>
                </div>

                {/* Actor */}
                <div className="flex items-center gap-1.5">
                  <User size={12} color="#A8A29E" />
                  <span className="text-xs font-semibold text-stone-600 font-jakarta">{log.actor_name}</span>
                </div>

                {/* Details */}
                {log.details && (
                  <div
                    className="rounded-xl px-3 py-2 flex flex-col gap-1"
                    style={{ background: '#FAFAF9' }}
                  >
                    {Object.entries(log.details).map(([k, v]) => (
                      <div key={k} className="flex items-center gap-1.5">
                        <Tag size={10} color="#D1D5DB" />
                        <span className="text-[11px] text-stone-400 font-inter capitalize">{k.replace(/_/g, ' ')}:</span>
                        <span className="text-[11px] font-semibold text-stone-700 font-jakarta">{String(v)}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
