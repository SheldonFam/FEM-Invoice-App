import type { Invoice } from '../types/invoice'
import { formatDate, formatCurrency } from '../lib/utils'

interface Props {
  invoice: Invoice
}

export default function InvoiceDetailCard({ invoice }: Props) {
  return (
    <div className="mt-6 rounded-md bg-card p-12 shadow-sm dark:bg-card-dark">
      {/* Top: ID/description + sender address */}
      <div className="flex items-start justify-between">
        <div>
          <p className="font-bold text-ink dark:text-white">
            <span className="text-label">#</span>
            {invoice.id}
          </p>
          <p className="mt-2 text-sm text-label">{invoice.description}</p>
        </div>
        <address className="text-right text-sm not-italic leading-loose text-label">
          <p>{invoice.senderAddress.street}</p>
          <p>{invoice.senderAddress.city}</p>
          <p>{invoice.senderAddress.postCode}</p>
          <p>{invoice.senderAddress.country}</p>
        </address>
      </div>

      {/* Middle: dates / bill to / sent to */}
      <div className="mt-10 flex justify-between gap-4">
        {/* Dates */}
        <div className="flex flex-col gap-8">
          <div>
            <p className="text-sm text-label">Invoice Date</p>
            <p className="mt-3 font-bold text-ink dark:text-white">
              {formatDate(invoice.createdAt)}
            </p>
          </div>
          <div>
            <p className="text-sm text-label">Payment Due</p>
            <p className="mt-3 font-bold text-ink dark:text-white">
              {formatDate(invoice.paymentDue)}
            </p>
          </div>
        </div>

        {/* Bill To */}
        <div>
          <p className="text-sm text-label">Bill To</p>
          <p className="mt-3 font-bold text-ink dark:text-white">
            {invoice.clientName}
          </p>
          <address className="mt-2 text-sm not-italic leading-loose text-label">
            <p>{invoice.clientAddress.street}</p>
            <p>{invoice.clientAddress.city}</p>
            <p>{invoice.clientAddress.postCode}</p>
            <p>{invoice.clientAddress.country}</p>
          </address>
        </div>

        {/* Sent To */}
        <div>
          <p className="text-sm text-label">Sent to</p>
          <p className="mt-3 font-bold text-ink dark:text-white">
            {invoice.clientEmail || "—"}
          </p>
        </div>
      </div>

      {/* Item table */}
      <div className="mt-10 overflow-hidden rounded-lg">
        <table className="w-full bg-surface dark:bg-input-dark">
          <thead>
            <tr>
              <th className="px-8 pt-8 pb-4 text-left text-sm font-normal text-label">Item Name</th>
              <th className="pt-8 pb-4 text-right text-sm font-normal text-label w-[60px]">QTY.</th>
              <th className="pt-8 pb-4 text-right text-sm font-normal text-label w-[100px]">Price</th>
              <th className="px-8 pt-8 pb-4 text-right text-sm font-normal text-label w-[100px]">Total</th>
            </tr>
          </thead>
          <tbody>
            {invoice.items.map((item, i) => (
              <tr key={i}>
                <td className="px-8 py-4 text-sm font-bold text-ink dark:text-white">
                  {item.name}
                </td>
                <td className="py-4 text-right text-sm font-bold text-label">
                  {item.quantity}
                </td>
                <td className="py-4 text-right text-sm font-bold text-label">
                  {formatCurrency(item.price)}
                </td>
                <td className="px-8 py-4 text-right text-sm font-bold text-ink dark:text-white">
                  {formatCurrency(item.total)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Totals footer */}
        <div className="bg-sidebar px-8 py-6">
          {invoice.taxRate > 0 && (
            <div className="mb-3 flex items-center justify-between">
              <span className="text-sm text-fog">Subtotal</span>
              <span className="text-sm font-bold text-white">
                {formatCurrency(invoice.subtotal)}
              </span>
            </div>
          )}
          {invoice.taxRate > 0 && (
            <div className="mb-3 flex items-center justify-between">
              <span className="text-sm text-fog">
                Tax ({invoice.taxRate}%)
              </span>
              <span className="text-sm font-bold text-white">
                {formatCurrency(invoice.taxAmount)}
              </span>
            </div>
          )}
          <div className="flex items-center justify-between">
            <span className="text-sm text-fog">Amount Due</span>
            <span className="text-xl font-bold text-white">
              {formatCurrency(invoice.total)}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
