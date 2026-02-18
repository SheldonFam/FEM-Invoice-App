import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Invoice, InvoiceFormValues, InvoiceStatus, PaymentTerms } from '../types/invoice'
import seedData from '../data.json'

function generateId(): string {
  const letters = Array.from({ length: 2 }, () =>
    String.fromCharCode(65 + Math.floor(Math.random() * 26))
  ).join('')
  const digits = String(Math.floor(Math.random() * 10000)).padStart(4, '0')
  return letters + digits
}

function computePaymentDue(createdAt: string, paymentTerms: PaymentTerms): string {
  const date = new Date(createdAt)
  date.setDate(date.getDate() + paymentTerms)
  return date.toISOString().split('T')[0]
}

function deriveItemTotals(values: InvoiceFormValues): Pick<Invoice, 'items' | 'total'> {
  const items = values.items.map(item => ({
    ...item,
    total: item.quantity * item.price,
  }))
  return { items, total: items.reduce((sum, item) => sum + item.total, 0) }
}

interface InvoiceStore {
  invoices: Invoice[]
  filters: InvoiceStatus[]
  addInvoice: (values: InvoiceFormValues, status: 'draft' | 'pending') => void
  updateInvoice: (id: string, values: InvoiceFormValues) => void
  deleteInvoice: (id: string) => void
  markAsPaid: (id: string) => void
  toggleFilter: (status: InvoiceStatus) => void
}

export const useInvoiceStore = create<InvoiceStore>()(
  persist(
    (set) => ({
      invoices: seedData as Invoice[],
      filters: [],

      addInvoice: (values, status) => {
        const invoice: Invoice = {
          ...values,
          ...deriveItemTotals(values),
          id: generateId(),
          paymentDue: computePaymentDue(values.createdAt, values.paymentTerms),
          status,
        }
        set(state => ({ invoices: [invoice, ...state.invoices] }))
      },

      updateInvoice: (id, values) => {
        set(state => ({
          invoices: state.invoices.map(inv =>
            inv.id !== id ? inv : {
              ...inv,
              ...values,
              ...deriveItemTotals(values),
              paymentDue: computePaymentDue(values.createdAt, values.paymentTerms),
              // spec: editing a draft promotes it to pending
              status: inv.status === 'draft' ? 'pending' : inv.status,
            }
          ),
        }))
      },

      deleteInvoice: (id) => {
        set(state => ({ invoices: state.invoices.filter(inv => inv.id !== id) }))
      },

      markAsPaid: (id) => {
        set(state => ({
          invoices: state.invoices.map(inv =>
            inv.id === id ? { ...inv, status: 'paid' } : inv
          ),
        }))
      },

      toggleFilter: (status) => {
        set(state => ({
          filters: state.filters.includes(status)
            ? state.filters.filter(f => f !== status)
            : [...state.filters, status],
        }))
      },
    }),
    {
      name: 'invoice-store',
      // filters are ephemeral — only persist the invoice data
      partialize: (state) => ({ invoices: state.invoices }),
    }
  )
)
