import { create } from 'zustand'
import { api } from '../lib/api'
import { fromApiInvoice, toApiCreateBody, toApiUpdateBody, type ApiInvoice } from '../lib/mappers'
import type { Invoice, InvoiceFormValues, InvoiceStatus, PaginatedResponse } from '../types/invoice'

interface InvoiceStore {
  invoices: Invoice[]
  filters: InvoiceStatus[]
  isLoading: boolean

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
  sendEmail: (id: string) => Promise<void>

  // UI state
  toggleFilter: (status: InvoiceStatus) => void
  setPage: (newOffset: number) => void
}

let fetchController: AbortController | null = null

export const useInvoiceStore = create<InvoiceStore>()((set, get) => ({
  invoices: [],
  filters: [],
  isLoading: false,
  total: 0,
  limit: 20,
  offset: 0,

  fetchInvoices: async () => {
    // Cancel any in-flight fetch to avoid stale responses from rapid filter/page changes
    fetchController?.abort()
    fetchController = new AbortController()
    const { signal } = fetchController

    set({ isLoading: true })
    try {
      const { filters, limit, offset } = get()
      const params = new URLSearchParams()
      if (filters.length > 0) params.set('status', filters.join(','))
      params.set('limit', String(limit))
      params.set('offset', String(offset))
      const query = `?${params.toString()}`
      const data = await api.get<PaginatedResponse<ApiInvoice>>(`/invoices${query}`, signal)
      if (signal.aborted) return
      set({
        invoices: data.items.map(fromApiInvoice),
        total: data.total,
        limit: data.limit,
        offset: data.offset,
        isLoading: false,
      })
    } catch (err) {
      if (signal.aborted) return
      set({ isLoading: false })
      throw err
    }
  },

  fetchInvoice: async (id) => {
    set({ isLoading: true })
    try {
      const data = await api.get<ApiInvoice>(`/invoices/${id}`)
      const invoice = fromApiInvoice(data)
      set(state => ({
        isLoading: false,
        invoices: state.invoices.some(inv => inv.id === id)
          ? state.invoices.map(inv => inv.id === id ? invoice : inv)
          : [invoice, ...state.invoices],
      }))
    } catch (err) {
      set({ isLoading: false })
      throw err
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

  sendEmail: async (id) => {
    await api.post(`/invoices/${id}/send-email`)
  },

  toggleFilter: (status) => {
    set(state => ({
      offset: 0,
      filters: state.filters.includes(status)
        ? state.filters.filter(f => f !== status)
        : [...state.filters, status],
    }))
    get().fetchInvoices().catch(() => {})
  },

  setPage: (newOffset) => {
    set({ offset: newOffset })
    get().fetchInvoices().catch(() => {})
  },
}))
