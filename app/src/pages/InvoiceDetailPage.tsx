import { Fragment, useState } from 'react'
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom'
import { useInvoiceStore } from '../store/useInvoiceStore'
import StatusBadge from '../components/StatusBadge'
import DeleteModal from '../components/DeleteModal'
import InvoiceForm from '../components/InvoiceForm'
import { formatDate, formatCurrency } from '../lib/utils'

export default function InvoiceDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { invoices, markAsPaid, deleteInvoice } = useInvoiceStore()

  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)

  const invoice = invoices.find(inv => inv.id === id)
  if (!invoice) return <Navigate to="/" replace />

  function handleDelete() {
    deleteInvoice(invoice!.id)
    navigate('/')
  }

  const actionButtons = (
    <>
      <button
        onClick={() => setIsEditOpen(true)}
        className="cursor-pointer rounded-full bg-surface px-6 py-4 text-sm font-bold text-label transition-colors hover:bg-border dark:bg-input-dark dark:text-fog dark:hover:bg-sidebar"
      >
        Edit
      </button>
      <button
        onClick={() => setIsDeleteOpen(true)}
        className="cursor-pointer rounded-full bg-delete px-6 py-4 text-sm font-bold text-white transition-colors hover:bg-delete-hover"
      >
        Delete
      </button>
      {invoice.status === 'pending' && (
        <button
          onClick={() => markAsPaid(invoice.id)}
          className="cursor-pointer rounded-full bg-purple px-6 py-4 text-sm font-bold text-white transition-colors hover:bg-purple-light"
        >
          Mark as Paid
        </button>
      )}
    </>
  )

  return (
    <div className="mx-auto max-w-[730px] px-6 py-8 pb-28 md:py-[72px] md:pb-[72px]">
      {/* Go back */}
      <Link
        to="/"
        className="inline-flex items-center gap-6 text-sm font-bold text-ink transition-colors hover:text-muted dark:text-white dark:hover:text-muted"
      >
        <img src="/assets/icon-arrow-left.svg" alt="" width={7} height={10} />
        Go back
      </Link>

      {/* Action bar */}
      <div className="mt-8 flex items-center justify-between rounded-md bg-card px-8 py-5 shadow-sm dark:bg-card-dark">
        <div className="flex items-center gap-4">
          <span className="text-sm text-muted">Status</span>
          <StatusBadge status={invoice.status} />
        </div>
        {/* Desktop action buttons */}
        <div className="hidden items-center gap-2 md:flex">
          {actionButtons}
        </div>
      </div>

      {/* Detail card */}
      <div className="mt-6 rounded-md bg-card p-12 shadow-sm dark:bg-card-dark">
        {/* Top: ID/description + sender address */}
        <div className="flex items-start justify-between">
          <div>
            <p className="font-bold text-ink dark:text-white">
              <span className="text-label">#</span>{invoice.id}
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
              {invoice.clientEmail || '—'}
            </p>
          </div>
        </div>

        {/* Item table */}
        <div className="mt-10 overflow-hidden rounded-lg">
          <div className="bg-surface p-8 dark:bg-input-dark">
            {/* Header */}
            <div className="grid grid-cols-[1fr_60px_100px_100px] gap-x-4">
              <span className="text-sm text-label">Item Name</span>
              <span className="text-right text-sm text-label">QTY.</span>
              <span className="text-right text-sm text-label">Price</span>
              <span className="text-right text-sm text-label">Total</span>
            </div>

            {/* Rows */}
            {invoice.items.map((item, i) => (
              <Fragment key={i}>
                <div className="mt-8 grid grid-cols-[1fr_60px_100px_100px] items-center gap-x-4">
                  <span className="text-sm font-bold text-ink dark:text-white">
                    {item.name}
                  </span>
                  <span className="text-right text-sm font-bold text-label">
                    {item.quantity}
                  </span>
                  <span className="text-right text-sm font-bold text-label">
                    {formatCurrency(item.price)}
                  </span>
                  <span className="text-right text-sm font-bold text-ink dark:text-white">
                    {formatCurrency(item.total)}
                  </span>
                </div>
              </Fragment>
            ))}
          </div>

          {/* Amount Due */}
          <div className="flex items-center justify-between bg-[#1E2139] px-8 py-6">
            <span className="text-sm text-fog">Amount Due</span>
            <span className="text-xl font-bold text-white">
              {formatCurrency(invoice.total)}
            </span>
          </div>
        </div>
      </div>

      {/* Mobile action footer */}
      <div className="fixed bottom-0 left-0 right-0 flex items-center justify-end gap-2 bg-card px-6 py-5 shadow-[0_-4px_12px_rgba(0,0,0,0.08)] dark:bg-card-dark md:hidden">
        {actionButtons}
      </div>

      {/* Delete modal */}
      {isDeleteOpen && (
        <DeleteModal
          invoiceId={invoice.id}
          onConfirm={handleDelete}
          onCancel={() => setIsDeleteOpen(false)}
        />
      )}

      <InvoiceForm
        mode="edit"
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        invoice={invoice}
      />
    </div>
  )
}
