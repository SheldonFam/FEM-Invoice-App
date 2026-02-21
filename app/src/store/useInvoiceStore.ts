import { create } from 'zustand'
import { api } from '../lib/api'
import { fromApiInvoice, toApiCreateBody, toApiUpdateBody, type ApiInvoice } from '../lib/mappers'
import type { Invoice, InvoiceFormValues, InvoiceStatus, PaginatedResponse } from '../types/invoice'

interface InvoiceStore {
  invoices: Invoice[]
  filters: InvoiceStatus[]
  isLoading: boolean
  error: string | null

  // Pagination
  total: number
  limit: number
  offset: number

  // Data fetching
  fetchInvoices: () => Promise<void>
  fetchInvoice: (id: string) => Promise<void>

  // CRUD
  addInvoice: (values: InvoiceFormValues, submitMode: 'draft' | 'pending') => Promise<void>
  updateInvoice: (id: string, values: InvoiceFormValues) => Promise<void>
  deleteInvoice: (id: string) => Promise<void>

  // Status actions
  markAsPaid: (id: string) => Promise<void>
  duplicateInvoice: (id: string) => Promise<Invoice>

  // UI state
  toggleFilter: (status: InvoiceStatus) => void
  setPage: (newOffset: number) => void
}

export const useInvoiceStore = create<InvoiceStore>()((set, get) => ({
  invoices: [],
  filters: [],
  isLoading: false,
  error: null,
  total: 0,
  limit: 20,
  offset: 0,

  fetchInvoices: async () => {
    set({ isLoading: true, error: null })
    try {
      const { filters, limit, offset } = get()
      const params = new URLSearchParams()
      if (filters.length > 0) params.set('status', filters.join(','))
      params.set('limit', String(limit))
      params.set('offset', String(offset))
      const query = `?${params.toString()}`
      const data = await api.get<PaginatedResponse<ApiInvoice>>(`/invoices${query}`)
      set({
        invoices: data.items.map(fromApiInvoice),
        total: data.total,
        limit: data.limit,
        offset: data.offset,
        isLoading: false,
      })
    } catch (err) {
      set({ error: err instanceof Error ? err.message : 'Failed to load invoices', isLoading: false })
    }
  },

  fetchInvoice: async (id) => {
    set({ isLoading: true, error: null })
    try {
      const data = await api.get<ApiInvoice>(`/invoices/${id}`)
      const invoice = fromApiInvoice(data)
      set(state => ({
        isLoading: false,
        // Upsert into the invoices array
        invoices: state.invoices.some(inv => inv.id === id)
          ? state.invoices.map(inv => inv.id === id ? invoice : inv)
          : [invoice, ...state.invoices],
      }))
    } catch (err) {
      set({ error: err instanceof Error ? err.message : 'Invoice not found', isLoading: false })
    }
  },

  addInvoice: async (values, submitMode) => {
    const body = toApiCreateBody(values, submitMode)
    const data = await api.post<ApiInvoice>('/invoices', body)
    const invoice = fromApiInvoice(data)
    set(state => ({ invoices: [invoice, ...state.invoices] }))
  },

  updateInvoice: async (id, values) => {
    const body = toApiUpdateBody(values)
    const data = await api.put<ApiInvoice>(`/invoices/${id}`, body)
    const updated = fromApiInvoice(data)
    set(state => ({
      invoices: state.invoices.map(inv => inv.id === id ? updated : inv),
    }))
  },

  deleteInvoice: async (id) => {
    await api.delete(`/invoices/${id}`)
    set(state => ({ invoices: state.invoices.filter(inv => inv.id !== id) }))
  },

  markAsPaid: async (id) => {
    const data = await api.patch<ApiInvoice>(`/invoices/${id}/mark-paid`)
    const updated = fromApiInvoice(data)
    set(state => ({
      invoices: state.invoices.map(inv => inv.id === id ? updated : inv),
    }))
  },

  duplicateInvoice: async (id) => {
    const data = await api.post<ApiInvoice>(`/invoices/${id}/duplicate`)
    const invoice = fromApiInvoice(data)
    set(state => ({ invoices: [invoice, ...state.invoices] }))
    return invoice
  },

  toggleFilter: (status) => {
    set(state => ({
      offset: 0,
      filters: state.filters.includes(status)
        ? state.filters.filter(f => f !== status)
        : [...state.filters, status],
    }))
    get().fetchInvoices()
  },

  setPage: (newOffset) => {
    set({ offset: newOffset })
    get().fetchInvoices()
  },
}))
