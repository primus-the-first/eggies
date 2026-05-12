import { create } from 'zustand'
import { supabase } from '../lib/supabase'

const SESSION_KEY = 'eggies_profile'

// ─── helpers ──────────────────────────────────────────────────────────────────

async function writeAudit({ actorId, actorName, action, details = {} }) {
  await supabase.from('audit_logs').insert([{
    actor_id:   actorId,
    actor_name: actorName,
    action,
    details,
  }])
}

// ─── store ────────────────────────────────────────────────────────────────────

export const useStore = create((set, get) => ({
  // ── Auth ──────────────────────────────────────────────────────────────────
  profile:   null,   // { id, name, role, ... }
  authReady: false,
  loginError: '',

  initAuth: () => {
    try {
      const stored = localStorage.getItem(SESSION_KEY)
      if (stored) set({ profile: JSON.parse(stored) })
    } catch (_) {}
    set({ authReady: true })
  },

  login: async (name, password) => {
    set({ loginError: '' })
    if (!name.trim() || !password.trim()) {
      set({ loginError: 'Enter your name and password' })
      return false
    }
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('name', name.trim())
      .eq('password', password)
      .single()

    if (error || !data) {
      set({ loginError: 'Invalid name or password' })
      return false
    }

    localStorage.setItem(SESSION_KEY, JSON.stringify(data))
    set({ profile: data, loginError: '' })
    return true
  },

  signOut: () => {
    localStorage.removeItem(SESSION_KEY)
    set({ profile: null })
  },

  // ── Data ──────────────────────────────────────────────────────────────────
  sales: [],
  creditCustomers: [],
  creditTransactions: [],
  inventoryEntries: [],
  prices: [],
  priceHistory: [],
  auditLogs: [],
  loading: false,

  // ─── Sales ────────────────────────────────────────────────────────────────
  fetchSales: async () => {
    const { data } = await supabase
      .from('sales')
      .select('*')
      .order('created_at', { ascending: false })
    if (data) set({ sales: data })
  },

  addSale: async (sale) => {
    const { profile } = get()
    const { data, error } = await supabase
      .from('sales')
      .insert([sale])
      .select()
      .single()
    if (!error && data) {
      set((s) => ({ sales: [data, ...s.sales] }))
      await writeAudit({
        actorId:   profile?.id,
        actorName: profile?.name ?? 'Unknown',
        action:    'sale_recorded',
        details: {
          quantity:       sale.quantity,
          size:           sale.size ?? '—',
          total:          `GH₵ ${Number(sale.total).toFixed(2)}`,
          payment_method: sale.payment_method,
        },
      })
    }
    return { data, error }
  },

  // ─── Prices ───────────────────────────────────────────────────────────────
  fetchPrices: async () => {
    const { data } = await supabase.from('prices').select('*').order('size')
    if (data) set({ prices: data })
  },

  fetchPriceHistory: async () => {
    const { data } = await supabase
      .from('price_history')
      .select('*')
      .order('changed_at', { ascending: false })
    if (data) set({ priceHistory: data })
  },

  updatePrice: async (size, amount) => {
    const { profile } = get()
    const numAmount = Number(amount)
    const prev = get().prices.find(p => p.size === size)?.amount

    const { data, error } = await supabase
      .from('prices')
      .update({ amount: numAmount, updated_at: new Date().toISOString() })
      .eq('size', size)
      .select()
      .single()

    if (!error && data) {
      set((s) => ({ prices: s.prices.map(p => p.size === size ? data : p) }))
      const { data: histRow } = await supabase
        .from('price_history')
        .insert([{ size, amount: numAmount }])
        .select()
        .single()
      if (histRow) set((s) => ({ priceHistory: [histRow, ...s.priceHistory] }))
      await writeAudit({
        actorId:   profile?.id,
        actorName: profile?.name ?? 'Unknown',
        action:    'price_updated',
        details: {
          size,
          old_price: prev != null ? `GH₵ ${Number(prev).toFixed(2)}` : '—',
          new_price: `GH₵ ${numAmount.toFixed(2)}`,
        },
      })
    }
    return { data, error }
  },

  // ─── Credit Customers ─────────────────────────────────────────────────────
  fetchCreditCustomers: async () => {
    const { data } = await supabase
      .from('credit_customers')
      .select('*')
      .order('name')
    if (data) set({ creditCustomers: data })
  },

  addCreditCustomer: async (customer) => {
    const { data, error } = await supabase
      .from('credit_customers')
      .insert([customer])
      .select()
      .single()
    if (!error && data) set((s) => ({ creditCustomers: [...s.creditCustomers, data] }))
    return { data, error }
  },

  // ─── Credit Transactions ──────────────────────────────────────────────────
  fetchCreditTransactions: async () => {
    const { data } = await supabase
      .from('credit_transactions')
      .select('*')
      .order('created_at', { ascending: false })
    if (data) set({ creditTransactions: data })
  },

  addCreditTransaction: async (tx) => {
    const { data, error } = await supabase
      .from('credit_transactions')
      .insert([tx])
      .select()
      .single()
    if (!error && data) set((s) => ({ creditTransactions: [data, ...s.creditTransactions] }))
    return { data, error }
  },

  // ─── Inventory ────────────────────────────────────────────────────────────
  fetchInventory: async () => {
    const { data } = await supabase
      .from('inventory_entries')
      .select('*')
      .order('created_at', { ascending: false })
    if (data) set({ inventoryEntries: data })
  },

  addInventoryEntry: async (entry) => {
    const { profile } = get()
    const { data, error } = await supabase
      .from('inventory_entries')
      .insert([entry])
      .select()
      .single()
    if (!error && data) {
      set((s) => ({ inventoryEntries: [data, ...s.inventoryEntries] }))
      const action = entry.type === 'received' ? 'stock_received'
        : entry.type === 'broken' ? 'stock_broken'
        : 'stock_discarded'
      const details = { quantity: entry.quantity, type: entry.type }
      if (entry.size)            details.size = entry.size
      if (entry.price_per_crate) details.price_per_crate = `GH₵ ${Number(entry.price_per_crate).toFixed(2)}`
      if (entry.note)            details.note = entry.note
      await writeAudit({
        actorId:   profile?.id,
        actorName: profile?.name ?? 'Unknown',
        action,
        details,
      })
    }
    return { data, error }
  },

  // ─── Audit Logs ───────────────────────────────────────────────────────────
  fetchAuditLogs: async () => {
    const { data } = await supabase
      .from('audit_logs')
      .select('*')
      .order('created_at', { ascending: false })
    if (data) set({ auditLogs: data })
  },

  // ─── Bootstrap ────────────────────────────────────────────────────────────
  fetchAll: async () => {
    set({ loading: true })
    const { profile } = get()
    const isAdmin = profile?.role === 'super_admin'
    await Promise.all([
      get().fetchSales(),
      get().fetchCreditCustomers(),
      get().fetchCreditTransactions(),
      get().fetchInventory(),
      get().fetchPrices(),
      get().fetchPriceHistory(),
      ...(isAdmin ? [get().fetchAuditLogs()] : []),
    ])
    set({ loading: false })
  },
}))
