import { create } from 'zustand'
import { supabase } from '../lib/supabase'

export const useStore = create((set, get) => ({
  sales: [],
  creditCustomers: [],
  creditTransactions: [],
  inventoryEntries: [],
  prices: [],
  loading: false,

  // ─── Sales ────────────────────────────────────────────────────────────
  fetchSales: async () => {
    const { data } = await supabase
      .from('sales')
      .select('*')
      .order('created_at', { ascending: false })
    if (data) set({ sales: data })
  },

  addSale: async (sale) => {
    const { data, error } = await supabase
      .from('sales')
      .insert([sale])
      .select()
      .single()
    if (!error && data) set((s) => ({ sales: [data, ...s.sales] }))
    return { data, error }
  },

  // ─── Prices ───────────────────────────────────────────────────────────
  fetchPrices: async () => {
    const { data } = await supabase.from('prices').select('*').order('size')
    if (data) set({ prices: data })
  },

  updatePrice: async (size, amount) => {
    const { data, error } = await supabase
      .from('prices')
      .update({ amount: Number(amount), updated_at: new Date().toISOString() })
      .eq('size', size)
      .select()
      .single()
    if (!error && data) {
      set((s) => ({ prices: s.prices.map(p => p.size === size ? data : p) }))
    }
    return { data, error }
  },

  // ─── Credit Customers ─────────────────────────────────────────────────
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

  // ─── Credit Transactions ──────────────────────────────────────────────
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

  // ─── Inventory ────────────────────────────────────────────────────────
  fetchInventory: async () => {
    const { data } = await supabase
      .from('inventory_entries')
      .select('*')
      .order('created_at', { ascending: false })
    if (data) set({ inventoryEntries: data })
  },

  addInventoryEntry: async (entry) => {
    const { data, error } = await supabase
      .from('inventory_entries')
      .insert([entry])
      .select()
      .single()
    if (!error && data) set((s) => ({ inventoryEntries: [data, ...s.inventoryEntries] }))
    return { data, error }
  },

  // ─── Bootstrap ───────────────────────────────────────────────────────
  fetchAll: async () => {
    set({ loading: true })
    await Promise.all([
      get().fetchSales(),
      get().fetchCreditCustomers(),
      get().fetchCreditTransactions(),
      get().fetchInventory(),
      get().fetchPrices(),
    ])
    set({ loading: false })
  },
}))
