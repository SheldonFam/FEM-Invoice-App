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
  id: string            // e.g. "INV-0001"
  createdAt: string     // ISO date string "YYYY-MM-DD"
  paymentDue: string    // ISO date string "YYYY-MM-DD"
  description: string
  paymentTerms: PaymentTerms
  clientName: string
  clientEmail: string
  status: InvoiceStatus
  senderAddress: Address
  clientAddress: Address
  items: InvoiceItem[]
  subtotal: number      // sum of item totals before tax
  taxRate: number       // percentage e.g. 10 = 10%
  taxAmount: number     // derived: subtotal * taxRate / 100
  total: number         // subtotal + taxAmount
  isOverdue: boolean    // paymentDue < today && status !== 'paid'
}

// What RHF manages — excludes derived/server fields
// Source of truth is the Zod schema in src/lib/schemas.ts
export type { InvoiceFormValues } from '../lib/schemas'
