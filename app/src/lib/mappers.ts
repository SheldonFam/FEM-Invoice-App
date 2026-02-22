import type { Invoice, InvoiceItem } from "../types/invoice";
import type { InvoiceFormValues } from "./schemas";

// ── Raw API shapes ─────────────────────────────────────────────────────────────

interface ApiAddress {
  street: string;
  city: string;
  post_code: string;
  country: string;
}

export interface ApiInvoice {
  id: string;
  created_at: string;
  payment_due: string;
  description: string;
  payment_terms: number;
  client_name: string;
  client_email: string;
  status: string;
  sender_address: ApiAddress;
  client_address: ApiAddress;
  items: Array<{
    id?: string;
    name: string;
    quantity: number;
    price: string | number;
    total: string | number;
  }>;
  subtotal: string | number;
  tax_rate: string | number;
  tax_amount: string | number;
  total: string | number;
  is_overdue: boolean;
}

// ── API response → Frontend Invoice ───────────────────────────────────────────

export function fromApiInvoice(data: ApiInvoice): Invoice {
  return {
    id: data.id,
    createdAt: data.created_at,
    paymentDue: data.payment_due,
    description: data.description,
    paymentTerms: data.payment_terms as Invoice["paymentTerms"],
    clientName: data.client_name,
    clientEmail: data.client_email,
    status: data.status as Invoice["status"],
    senderAddress: {
      street: data.sender_address.street,
      city: data.sender_address.city,
      postCode: data.sender_address.post_code,
      country: data.sender_address.country,
    },
    clientAddress: {
      street: data.client_address.street,
      city: data.client_address.city,
      postCode: data.client_address.post_code,
      country: data.client_address.country,
    },
    items: data.items.map(
      (item): InvoiceItem => ({
        name: item.name,
        quantity: item.quantity,
        price: Number(item.price),
        total: Number(item.total),
      }),
    ),
    subtotal: Number(data.subtotal),
    taxRate: Number(data.tax_rate),
    taxAmount: Number(data.tax_amount),
    total: Number(data.total),
    isOverdue: data.is_overdue,
  };
}

// ── Frontend form values → API create body ─────────────────────────────────────

export function toApiCreateBody(
  values: InvoiceFormValues,
  submitMode: "draft" | "pending",
) {
  return {
    created_at: values.createdAt,
    description: values.description,
    payment_terms: values.paymentTerms,
    client_name: values.clientName,
    client_email: values.clientEmail,
    sender_address: {
      street: values.senderAddress.street,
      city: values.senderAddress.city,
      post_code: values.senderAddress.postCode,
      country: values.senderAddress.country,
    },
    client_address: {
      street: values.clientAddress.street,
      city: values.clientAddress.city,
      post_code: values.clientAddress.postCode,
      country: values.clientAddress.country,
    },
    items: values.items.map((item) => ({
      name: item.name,
      quantity: item.quantity,
      price: item.price,
    })),
    submit_mode: submitMode,
  };
}

// ── Frontend form values → API update body ─────────────────────────────────────

export function toApiUpdateBody(values: InvoiceFormValues) {
  const { ...rest } = toApiCreateBody(values, "pending");
  return rest;
}
