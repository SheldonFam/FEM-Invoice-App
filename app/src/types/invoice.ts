export type InvoiceStatus = 'draft' | 'pending' | 'paid'

export type PaymentTerms = 1 | 7 | 14 | 30

export interface Address {
  street: string
  city: string
  postCode: string
  country: string
}

export interface InvoiceItem {
  name: string
  quantity: number
  price: number
  total: number // derived: quantity * price
}

export interface Invoice {
  id: string          // 2 uppercase letters + 4 digits e.g. "RT3080"
  createdAt: string   // ISO date string "YYYY-MM-DD"
  paymentDue: string  // ISO date string "YYYY-MM-DD" — derived from createdAt + paymentTerms
  description: string
  paymentTerms: PaymentTerms
  clientName: string
  clientEmail: string
  status: InvoiceStatus
  senderAddress: Address
  clientAddress: Address
  items: InvoiceItem[]
  total: number       // derived: sum of item totals
}

// What RHF manages — excludes derived fields (id, paymentDue, item totals, invoice total)
// Source of truth is the Zod schema in src/lib/schemas.ts
export type { InvoiceFormValues } from '../lib/schemas'
