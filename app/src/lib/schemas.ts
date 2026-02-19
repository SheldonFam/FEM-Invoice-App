import { z } from 'zod'

// ─── Building blocks ──────────────────────────────────────────────────────────

const paymentTermsSchema = z.union([
  z.literal(1),
  z.literal(7),
  z.literal(14),
  z.literal(30),
])

const addressSchema = z.object({
  street: z.string(),
  city: z.string(),
  postCode: z.string(),
  country: z.string(),
})

const strictAddressSchema = z.object({
  street: z.string().min(1, "can't be empty"),
  city: z.string().min(1, "can't be empty"),
  postCode: z.string().min(1, "can't be empty"),
  country: z.string().min(1, "can't be empty"),
})

const itemSchema = z.object({
  name: z.string(),
  quantity: z.number().min(0),
  price: z.number().min(0),
})

const strictItemSchema = z.object({
  name: z.string().min(1, "can't be empty"),
  quantity: z.number().min(1, 'must be at least 1'),
  price: z.number().min(0, "can't be negative"),
})

// ─── Draft ────────────────────────────────────────────────────────────────────
// All fields optional at runtime — user can leave anything blank

export const draftSchema = z.object({
  createdAt: z.string(),
  description: z.string(),
  paymentTerms: paymentTermsSchema,
  clientName: z.string(),
  clientEmail: z.string(),
  senderAddress: addressSchema,
  clientAddress: addressSchema,
  items: z.array(itemSchema),
})

// ─── Pending / Save Changes ───────────────────────────────────────────────────
// All fields required — used for "Save & Send" and editing any invoice

export const pendingSchema = z.object({
  createdAt: z.string().min(1, "can't be empty"),
  description: z.string().min(1, "can't be empty"),
  paymentTerms: paymentTermsSchema,
  clientName: z.string().min(1, "can't be empty"),
  clientEmail: z.string().min(1, "can't be empty").email('must be a valid email'),
  senderAddress: strictAddressSchema,
  clientAddress: strictAddressSchema,
  items: z.array(strictItemSchema).min(1, 'an item must be added'),
})

// ─── Auth ─────────────────────────────────────────────────────────────────────

export const loginSchema = z.object({
  email: z.string().min(1, "can't be empty").email('must be a valid email'),
  password: z.string().min(8, 'must be at least 8 characters'),
})

export const registerSchema = z.object({
  name: z.string().min(1, "can't be empty"),
  email: z.string().min(1, "can't be empty").email('must be a valid email'),
  password: z.string().min(8, 'must be at least 8 characters'),
  confirmPassword: z.string().min(1, "can't be empty"),
}).refine(data => data.password === data.confirmPassword, {
  message: 'passwords do not match',
  path: ['confirmPassword'],
})

// ─── Inferred types ───────────────────────────────────────────────────────────
// Both infer the same TS shape — strictness is runtime only

export type InvoiceFormValues = z.infer<typeof pendingSchema>
export type LoginFormValues = z.infer<typeof loginSchema>
export type RegisterFormValues = z.infer<typeof registerSchema>
