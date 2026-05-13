import { useState, useEffect } from 'react'
import { format } from 'date-fns'
import { Building2, User, CheckCircle2, AlertCircle, Package } from 'lucide-react'
import { useStore } from '../store/useStore'
import Card from '../components/Card'
import FAB from '../components/FAB'
import Sheet from '../components/Sheet'
import Input from '../components/Input'
import Button from '../components/Button'
import HeaderActions from '../components/HeaderActions'

const AVATAR_COLORS = [
  { bg: '#FEF3C7', color: '#D97706' },
  { bg: '#EDE9FE', color: '#7C3AED' },
  { bg: '#ECFDF5', color: '#059669' },
  { bg: '#EFF6FF', color: '#2563EB' },
  { bg: '#FFF1F2', color: '#E11D48' },
]

function avatarColor(name) {
  const i = name.charCodeAt(0) % AVATAR_COLORS.length
  return AVATAR_COLORS[i]
}

export default function Credit() {
  const { creditCustomers, creditTransactions, fetchCreditCustomers, fetchCreditTransactions, addCreditCustomer, addCreditTransaction } = useStore()
  const [addCustomerOpen, setAddCustomerOpen] = useState(false)
  const [selectedCustomer, setSelectedCustomer] = useState(null)

  useEffect(() => {
    fetchCreditCustomers()
    fetchCreditTransactions()
  }, [])

  const getBalance = (customerId) => {
    const txs = creditTransactions.filter(t => t.customer_id === customerId)
    const delivered = txs.filter(t => t.type === 'delivery').reduce((a, t) => a + Number(t.amount), 0)
    const paid = txs.filter(t => t.type === 'payment').reduce((a, t) => a + Number(t.amount), 0)
    return delivered - paid
  }

  const getLastCreditDate = (customerId) => {
    const deliveries = creditTransactions
      .filter(t => t.customer_id === customerId && t.type === 'delivery')
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    return deliveries.length > 0 ? new Date(deliveries[0].created_at) : null
  }

  const totalOutstanding = creditCustomers.reduce((a, c) => a + getBalance(c.id), 0)
  const debtorCount = creditCustomers.filter(c => getBalance(c.id) > 0).length

  const sortedCustomers = [...creditCustomers].sort((a, b) => {
    const ba = getBalance(a.id)
    const bb = getBalance(b.id)
    if (bb > 0 && ba <= 0) return 1
    if (ba > 0 && bb <= 0) return -1
    return bb - ba
  })

  return (
    <div className="flex flex-col gap-4 px-4 pt-12 pb-32">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-stone-900 font-jakarta">Credit</h1>
        <HeaderActions />
      </div>

      {/* Outstanding banner */}
      {totalOutstanding > 0 && (
        <div
          className="rounded-3xl p-5 relative overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, #7C3AED, #8B5CF6)',
            boxShadow: '0 8px 24px rgba(124,58,237,0.28)',
          }}
        >
          <div className="absolute -bottom-4 -right-4 w-24 h-24 rounded-full opacity-15"
            style={{ background: 'radial-gradient(circle, white, transparent)' }} />
          <p className="text-violet-200 text-xs font-semibold uppercase tracking-widest font-jakarta">Outstanding</p>
          <p className="text-white text-4xl font-bold tabular-nums font-jakarta mt-1">GH₵ {totalOutstanding.toFixed(2)}</p>
          <p className="text-violet-300 text-sm font-inter mt-1">{debtorCount} customer{debtorCount !== 1 ? 's' : ''} owe</p>
        </div>
      )}

      {/* Customer list */}
      {creditCustomers.length === 0 ? (
        <Card>
          <div className="flex flex-col items-center py-8 gap-3">
            <span className="text-4xl">💳</span>
            <p className="text-stone-400 text-sm font-inter">No credit customers yet</p>
            <Button variant="secondary" onClick={() => setAddCustomerOpen(true)}>Add first customer</Button>
          </div>
        </Card>
      ) : (
        <div className="flex flex-col gap-2">
          {sortedCustomers.map(customer => {
            const balance = getBalance(customer.id)
            const lastCreditDate = getLastCreditDate(customer.id)
            const av = avatarColor(customer.name)
            return (
              <button
                key={customer.id}
                onClick={() => setSelectedCustomer(customer)}
                className="bg-white rounded-3xl px-4 py-3.5 flex items-center justify-between w-full text-left active:scale-[0.98] transition-transform"
                style={{ boxShadow: 'var(--shadow-card)' }}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-11 h-11 rounded-2xl flex items-center justify-center text-base font-bold font-jakarta flex-shrink-0"
                    style={{ background: av.bg, color: av.color }}
                  >
                    {customer.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-stone-900 font-jakarta">{customer.name}</p>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      {customer.type === 'business'
                        ? <Building2 size={11} color="#78716C" />
                        : <User size={11} color="#78716C" />
                      }
                      <p className="text-xs text-stone-400 font-inter capitalize">{customer.type}</p>
                      {customer.phone && <p className="text-xs text-stone-400 font-inter">· {customer.phone}</p>}
                    </div>
                    {lastCreditDate && (
                      <p className="text-[10px] text-stone-400 font-inter mt-0.5">
                        Credit: {format(lastCreditDate, 'MMM d, yyyy')}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {balance > 0
                    ? <div className="text-right">
                        <p className="text-sm font-bold text-rose-500 tabular-nums font-jakarta">GH₵ {balance.toFixed(2)}</p>
                        <p className="text-[10px] text-stone-400">owes</p>
                      </div>
                    : <div className="flex items-center gap-1">
                        <CheckCircle2 size={14} color="#10B981" />
                        <span className="text-xs text-emerald-600 font-semibold font-jakarta">Paid</span>
                      </div>
                  }
                </div>
              </button>
            )
          })}
        </div>
      )}

      <FAB onClick={() => setAddCustomerOpen(true)} label="Add customer" />

      <AddCustomerSheet open={addCustomerOpen} onClose={() => setAddCustomerOpen(false)} onSave={addCreditCustomer} onSaveTx={addCreditTransaction} />

      {selectedCustomer && (
        <CustomerSheet
          customer={selectedCustomer}
          onClose={() => setSelectedCustomer(null)}
          balance={getBalance(selectedCustomer.id)}
          transactions={creditTransactions.filter(t => t.customer_id === selectedCustomer.id)}
        />
      )}
    </div>
  )
}

function CustomerSheet({ customer, onClose, balance, transactions }) {
  const { addCreditTransaction } = useStore()
  const [txSheet, setTxSheet] = useState(false) // false | true | 'pay'
  const av = avatarColor(customer.name)

  return (
    <>
      <Sheet open={true} onClose={onClose} title="">
        <div className="flex flex-col gap-5 -mt-2">
          {/* Customer hero */}
          <div className="flex items-center gap-4">
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center text-xl font-bold font-jakarta flex-shrink-0"
              style={{ background: av.bg, color: av.color }}
            >
              {customer.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <h2 className="text-xl font-bold text-stone-900 font-jakarta">{customer.name}</h2>
              <p className="text-sm text-stone-400 font-inter capitalize">{customer.type}{customer.phone ? ` · ${customer.phone}` : ''}</p>
            </div>
          </div>

          {/* Balance */}
          <div
            className="rounded-2xl p-4 flex items-center justify-between"
            style={{ background: balance > 0 ? '#FFF1F2' : '#ECFDF5' }}
          >
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest font-jakarta" style={{ color: balance > 0 ? '#F43F5E' : '#059669' }}>
                Balance
              </p>
              <p className="text-3xl font-bold tabular-nums font-jakarta mt-0.5" style={{ color: balance > 0 ? '#E11D48' : '#10B981' }}>
                {balance > 0 ? `GH₵ ${balance.toFixed(2)}` : 'All Clear'}
              </p>
            </div>
            {balance > 0
              ? <AlertCircle size={28} color="#F43F5E" />
              : <CheckCircle2 size={28} color="#10B981" />
            }
          </div>

          <div className="flex gap-3">
            <Button onClick={() => setTxSheet(true)} fullWidth>+ Add Transaction</Button>
            {balance > 0 && (
              <Button
                onClick={() => setTxSheet('pay')}
                variant="secondary"
                fullWidth
              >
                Pay in Full
              </Button>
            )}
          </div>

          {/* History */}
          <div>
            <p className="text-sm font-bold text-stone-700 font-jakarta mb-3">History</p>
            {transactions.length === 0 ? (
              <p className="text-stone-400 text-sm text-center py-4 font-inter">No transactions yet</p>
            ) : (
              <div className="flex flex-col gap-0">
                {transactions.map(tx => (
                  <div key={tx.id} className="flex items-center justify-between py-3 border-b border-stone-100 last:border-0">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span
                          className="text-xs font-semibold px-2.5 py-1 rounded-full font-jakarta"
                          style={tx.type === 'payment'
                            ? { background: '#ECFDF5', color: '#059669' }
                            : { background: '#FEF3C7', color: '#D97706' }
                          }
                        >
                          {tx.type === 'delivery' ? 'Delivery' : 'Payment'}
                        </span>
                        {tx.crates && (
                          <span className="flex items-center gap-1 text-xs text-stone-500 font-inter">
                            <Package size={11} /> {tx.crates} crate{tx.crates !== 1 ? 's' : ''}
                            {tx.size ? ` · ${tx.size}` : ''}
                            {tx.price_per_crate ? ` @ GH₵${Number(tx.price_per_crate).toFixed(2)}` : ''}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-stone-400 font-inter mt-1">
                        {format(new Date(tx.created_at), 'MMM d, yyyy · h:mm a')}
                        {tx.note ? ` · ${tx.note}` : ''}
                      </p>
                    </div>
                    <p
                      className="text-sm font-bold tabular-nums font-jakarta"
                      style={{ color: tx.type === 'payment' ? '#10B981' : '#E11D48' }}
                    >
                      {tx.type === 'payment' ? '+' : '-'}GH₵ {Number(tx.amount).toFixed(2)}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </Sheet>

      {txSheet && (
        <AddTransactionSheet
          open={!!txSheet}
          prefillPayment={txSheet === 'pay' ? balance : null}
          onClose={() => setTxSheet(false)}
          customerId={customer.id}
          onSave={addCreditTransaction}
        />
      )}
    </>
  )
}

function AddTransactionSheet({ open, onClose, customerId, onSave, prefillPayment }) {
  const { prices } = useStore()
  const [type, setType] = useState(prefillPayment ? 'payment' : 'delivery')
  const [size, setSize] = useState('small')
  const [crates, setCrates] = useState('')
  const [pricePerCrate, setPricePerCrate] = useState('')
  const [amount, setAmount] = useState(prefillPayment ? String(prefillPayment.toFixed(2)) : '')
  const [note, setNote] = useState('')
  const [saving, setSaving] = useState(false)
  const [errors, setErrors] = useState({})

  const currentPrice = prices.find(p => p.size === size)?.amount ?? (size === 'small' ? 50 : 55)

  // When size changes, update the price per crate field
  const handleSizeChange = (s) => {
    setSize(s)
    const p = prices.find(pr => pr.size === s)?.amount ?? (s === 'small' ? 50 : 55)
    setPricePerCrate(String(p))
  }

  // Auto-calculate total when crates or pricePerCrate changes
  const derivedTotal = crates && pricePerCrate && !isNaN(crates) && !isNaN(pricePerCrate)
    ? (Number(crates) * Number(pricePerCrate)).toFixed(2)
    : ''

  const reset = () => {
    setType('delivery'); setSize('small'); setCrates(''); setPricePerCrate('')
    setAmount(''); setNote(''); setErrors({})
  }
  const handleClose = () => { reset(); onClose() }

  const handleSave = async () => {
    const e = {}
    if (type === 'delivery') {
      if (!crates || isNaN(crates) || Number(crates) <= 0) e.crates = 'Enter number of crates'
      if (!pricePerCrate || isNaN(pricePerCrate) || Number(pricePerCrate) <= 0) e.price = 'Enter price per crate'
    } else {
      if (!amount || isNaN(amount) || Number(amount) <= 0) e.amount = 'Enter a valid amount'
    }
    if (Object.keys(e).length) { setErrors(e); return }

    setSaving(true)
    const finalAmount = type === 'delivery' ? Number(derivedTotal) : Number(amount)
    const { error } = await onSave({
      customer_id: customerId,
      type,
      crates: type === 'delivery' ? Number(crates) : null,
      price_per_crate: type === 'delivery' ? Number(pricePerCrate) : null,
      size: type === 'delivery' ? size : null,
      quantity: type === 'delivery' ? Number(crates) * 30 : null,
      amount: finalAmount,
      note: note.trim() || null,
    })
    setSaving(false)
    if (!error) handleClose()
  }

  return (
    <Sheet open={open} onClose={handleClose} title="Add Transaction">
      <div className="flex flex-col gap-5">
        {/* Type */}
        <div>
          <p className="text-xs font-semibold text-stone-500 uppercase tracking-widest font-jakarta mb-3">Type</p>
          <div className="flex gap-3">
            {[
              { v: 'delivery', l: '🥚 Delivery', activeColor: '#D97706', activeBg: '#FEF3C7' },
              { v: 'payment',  l: '💵 Payment',  activeColor: '#059669', activeBg: '#ECFDF5' },
            ].map(({ v, l, activeColor, activeBg }) => (
              <button key={v} onClick={() => setType(v)}
                className="flex-1 py-3.5 rounded-2xl font-semibold text-sm font-jakarta transition-all duration-200"
                style={type === v
                  ? { background: activeBg, color: activeColor, boxShadow: `0 0 0 2px ${activeColor}30` }
                  : { background: 'var(--card-subtle)', color: 'var(--text-secondary)' }
                }
              >{l}</button>
            ))}
          </div>
        </div>

        {type === 'delivery' ? (
          <>
            {/* Egg size */}
            <div>
              <p className="text-xs font-semibold text-stone-500 uppercase tracking-widest font-jakarta mb-3">Egg Size</p>
              <div className="flex gap-3">
                {(prices.length > 0
                  ? prices
                  : [{ size: 'small', label: 'Small', amount: 50 }, { size: 'large', label: 'Large', amount: 55 }]
                ).map(p => (
                  <button key={p.size} onClick={() => handleSizeChange(p.size)}
                    className="flex-1 py-3.5 rounded-2xl font-jakarta transition-all duration-200 flex flex-col items-center gap-0.5"
                    style={size === p.size
                      ? { background: 'linear-gradient(135deg, #F59E0B, #D97706)', color: 'white', boxShadow: '0 4px 14px rgba(217,119,6,0.3)' }
                      : { background: 'var(--card-subtle)', color: 'var(--text-secondary)' }
                    }
                  >
                    <span className="text-sm font-bold">{p.label}</span>
                    <span className="text-xs" style={{ color: size === p.size ? 'rgba(255,255,255,0.7)' : '#A8A29E' }}>GH₵ {p.amount}</span>
                  </button>
                ))}
              </div>
            </div>

            <Input label="Number of Crates" type="number" inputMode="numeric" placeholder="e.g. 2"
              value={crates} onChange={e => { setCrates(e.target.value); setErrors({}) }} error={errors.crates} />

            <Input label="Price per Crate (GH₵)" type="number" inputMode="decimal" placeholder={String(currentPrice)}
              value={pricePerCrate} onChange={e => { setPricePerCrate(e.target.value); setErrors({}) }} error={errors.price} />

            {derivedTotal && (
              <div className="rounded-2xl px-5 py-4 flex justify-between items-center"
                style={{ background: 'linear-gradient(135deg, #FEF3C7, #FDE68A)' }}>
                <div>
                  <p className="text-xs text-amber-700 font-semibold font-jakarta">Total Owed</p>
                  <p className="text-xs text-amber-600 font-inter mt-0.5">{crates} crate{Number(crates) !== 1 ? 's' : ''} × GH₵{pricePerCrate}</p>
                </div>
                <span className="text-2xl font-bold text-amber-700 tabular-nums font-jakarta">GH₵ {derivedTotal}</span>
              </div>
            )}
          </>
        ) : (
          <Input label="Amount (GH₵)" type="number" inputMode="decimal" placeholder="0.00"
            value={amount} onChange={e => { setAmount(e.target.value); setErrors({}) }} error={errors.amount} />
        )}

        <Input label="Note (optional)" placeholder={type === 'delivery' ? 'e.g. Monday delivery' : 'e.g. Partial payment'}
          value={note} onChange={e => setNote(e.target.value)} />

        <Button onClick={handleSave} disabled={saving} fullWidth>
          {saving ? 'Saving...' : type === 'delivery' ? 'Record Delivery' : 'Record Payment'}
        </Button>
      </div>
    </Sheet>
  )
}

function AddCustomerSheet({ open, onClose, onSave, onSaveTx }) {
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [customerType, setCustomerType] = useState('individual')
  const [status, setStatus] = useState('owing')
  const [amount, setAmount] = useState('')
  const [saving, setSaving] = useState(false)
  const [errors, setErrors] = useState({})

  const reset = () => {
    setName(''); setPhone(''); setCustomerType('individual')
    setStatus('owing'); setAmount(''); setErrors({})
  }
  const handleClose = () => { reset(); onClose() }

  const handleSave = async () => {
    const e = {}
    if (!name.trim()) e.name = 'Name is required'
    if (status === 'owing' && (!amount || isNaN(amount) || Number(amount) <= 0)) e.amount = 'Enter amount owed'
    if (Object.keys(e).length) { setErrors(e); return }

    setSaving(true)
    const { data: customer, error: custErr } = await onSave({ name: name.trim(), phone: phone.trim() || null, type: customerType })
    if (custErr) { setSaving(false); return }

    if (status === 'owing') {
      await onSaveTx({
        customer_id: customer.id,
        type: 'delivery',
        amount: Number(amount),
        crates: null,
        price_per_crate: null,
        size: null,
        quantity: null,
        note: null,
      })
    }

    setSaving(false)
    handleClose()
  }

  return (
    <Sheet open={open} onClose={handleClose} title="New Customer">
      <div className="flex flex-col gap-5">
        {/* Customer type */}
        <div>
          <p className="text-xs font-semibold text-stone-500 uppercase tracking-widest font-jakarta mb-3">Customer Type</p>
          <div className="flex gap-3">
            {[
              { v: 'individual', l: '👤 Individual' },
              { v: 'business',   l: '🏢 Business' },
            ].map(({ v, l }) => (
              <button
                key={v}
                onClick={() => setCustomerType(v)}
                className="flex-1 py-3.5 rounded-2xl font-semibold text-sm font-jakarta transition-all duration-200"
                style={customerType === v
                  ? { background: '#FEF3C7', color: '#D97706', boxShadow: '0 0 0 2px rgba(217,119,6,0.2)' }
                  : { background: 'var(--card-subtle)', color: 'var(--text-secondary)' }
                }
              >
                {l}
              </button>
            ))}
          </div>
        </div>

        <Input label="Name" placeholder="Customer or business name"
          value={name} onChange={e => { setName(e.target.value); setErrors({}) }} error={errors.name} />

        <Input label="Phone (optional)" type="tel" placeholder="024 000 0000"
          value={phone} onChange={e => setPhone(e.target.value)} />

        {/* Credit status */}
        <div>
          <p className="text-xs font-semibold text-stone-500 uppercase tracking-widest font-jakarta mb-3">Credit Status</p>
          <div className="flex gap-3">
            {[
              { v: 'owing', l: '🔴 Owing' },
              { v: 'paid',  l: '✅ Paid' },
            ].map(({ v, l }) => (
              <button
                key={v}
                onClick={() => { setStatus(v); setErrors({}) }}
                className="flex-1 py-3.5 rounded-2xl font-semibold text-sm font-jakarta transition-all duration-200"
                style={status === v
                  ? v === 'owing'
                    ? { background: '#FFF1F2', color: '#E11D48', boxShadow: '0 0 0 2px rgba(225,29,72,0.2)' }
                    : { background: '#ECFDF5', color: '#059669', boxShadow: '0 0 0 2px rgba(5,150,105,0.2)' }
                  : { background: 'var(--card-subtle)', color: 'var(--text-secondary)' }
                }
              >
                {l}
              </button>
            ))}
          </div>
        </div>

        {status === 'owing' && (
          <Input
            label="Amount Owed (GH₵)"
            type="number"
            inputMode="decimal"
            placeholder="0.00"
            value={amount}
            onChange={e => { setAmount(e.target.value); setErrors({}) }}
            error={errors.amount}
          />
        )}

        <Button onClick={handleSave} disabled={saving} fullWidth>
          {saving ? 'Saving...' : 'Add Customer'}
        </Button>
      </div>
    </Sheet>
  )
}
