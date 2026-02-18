import { useEffect, useRef } from 'react'
import { useForm, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import type { Invoice } from '../types/invoice'
import { draftSchema, pendingSchema, type InvoiceFormValues } from '../lib/schemas'
import { useInvoiceStore } from '../store/useInvoiceStore'
import { formatCurrency } from '../lib/utils'
import FormField from './FormField'

interface Props {
  isOpen: boolean
  onClose: () => void
  mode: 'create' | 'edit'
  invoice?: Invoice
}

const today = new Date().toISOString().split('T')[0]

const emptyValues: InvoiceFormValues = {
  createdAt: today,
  description: '',
  paymentTerms: 30,
  clientName: '',
  clientEmail: '',
  senderAddress: { street: '', city: '', postCode: '', country: '' },
  clientAddress: { street: '', city: '', postCode: '', country: '' },
  items: [],
}

function toFormValues(invoice: Invoice): InvoiceFormValues {
  return {
    createdAt: invoice.createdAt,
    description: invoice.description,
    paymentTerms: invoice.paymentTerms,
    clientName: invoice.clientName,
    clientEmail: invoice.clientEmail,
    senderAddress: { ...invoice.senderAddress },
    clientAddress: { ...invoice.clientAddress },
    items: invoice.items.map(({ name, quantity, price }) => ({ name, quantity, price })),
  }
}

export default function InvoiceForm({ isOpen, onClose, mode, invoice }: Props) {
  const { addInvoice, updateInvoice } = useInvoiceStore()
  const submitMode = useRef<'draft' | 'pending'>('pending')

  const form = useForm<InvoiceFormValues>({
    resolver: (values, ctx, opts) =>
      zodResolver(submitMode.current === 'draft' ? draftSchema : pendingSchema)(values, ctx, opts),
    defaultValues: emptyValues,
  })

  const { fields, append, remove } = useFieldArray({ control: form.control, name: 'items' })
  const watchedItems = form.watch('items')
  const { errors, isSubmitting } = form.formState

  const { reset, handleSubmit, register } = form

  useEffect(() => {
    if (!isOpen) return
    reset(mode === 'edit' && invoice ? toFormValues(invoice) : emptyValues)
  }, [isOpen, mode, invoice, reset])

  useEffect(() => {
    if (!isOpen) return
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [isOpen, onClose])

  function onSubmit(data: InvoiceFormValues) {
    if (mode === 'create') {
      addInvoice(data, submitMode.current)
    } else if (invoice) {
      updateInvoice(invoice.id, data)
    }
    onClose()
  }

  function submit(mode: 'draft' | 'pending') {
    submitMode.current = mode
    handleSubmit(onSubmit)()
  }

  // Shared input className
  function cx(hasError?: boolean) {
    return `w-full rounded-sm border bg-transparent px-5 py-4 text-sm font-bold text-ink outline-none transition-colors focus:border-purple dark:text-white ${
      hasError
        ? 'border-delete'
        : 'border-border hover:border-purple dark:border-border-dark'
    }`
  }

  // Array-level items error (e.g. "an item must be added")
  const itemsError: string | undefined =
    errors.items?.root?.message ??
    (errors.items as { message?: string } | undefined)?.message

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50"
          aria-hidden="true"
          onClick={onClose}
        />
      )}

      {/* Drawer */}
      <aside
        role="dialog"
        aria-modal="true"
        aria-label={mode === 'create' ? 'New Invoice' : `Edit invoice ${invoice?.id}`}
        className={`fixed top-0 left-0 z-40 flex h-screen w-full flex-col bg-card transition-transform duration-300 ease-in-out dark:bg-card-dark md:left-[103px] md:w-[616px] ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto px-6 pt-8 pb-8 md:px-14 md:pt-14">
          {/* Mobile back button */}
          <button
            type="button"
            onClick={onClose}
            className="mb-6 inline-flex items-center gap-6 text-sm font-bold text-ink transition-colors hover:text-muted dark:text-white dark:hover:text-muted md:hidden"
          >
            <img src="/assets/icon-arrow-left.svg" alt="" width={7} height={10} />
            Go back
          </button>

          {/* Title */}
          <h2 className="text-xl font-bold text-ink dark:text-white">
            {mode === 'create' ? 'New Invoice' : (
              <>Edit <span className="text-muted">#</span>{invoice?.id}</>
            )}
          </h2>

          <div className="mt-10 flex flex-col gap-10">
            {/* Bill From */}
            <fieldset>
              <legend className="mb-6 text-sm font-bold text-purple">Bill From</legend>
              <div className="flex flex-col gap-6">
                <FormField label="Street Address" error={errors.senderAddress?.street?.message}>
                  <input {...register('senderAddress.street')} className={cx(!!errors.senderAddress?.street)} />
                </FormField>
                <div className="grid grid-cols-2 gap-6 md:grid-cols-3">
                  <FormField label="City" error={errors.senderAddress?.city?.message}>
                    <input {...register('senderAddress.city')} className={cx(!!errors.senderAddress?.city)} />
                  </FormField>
                  <FormField label="Post Code" error={errors.senderAddress?.postCode?.message}>
                    <input {...register('senderAddress.postCode')} className={cx(!!errors.senderAddress?.postCode)} />
                  </FormField>
                  <div className="col-span-2 md:col-span-1">
                    <FormField label="Country" error={errors.senderAddress?.country?.message}>
                      <input {...register('senderAddress.country')} className={cx(!!errors.senderAddress?.country)} />
                    </FormField>
                  </div>
                </div>
              </div>
            </fieldset>

            {/* Bill To */}
            <fieldset>
              <legend className="mb-6 text-sm font-bold text-purple">Bill To</legend>
              <div className="flex flex-col gap-6">
                <FormField label="Client's Name" error={errors.clientName?.message}>
                  <input {...register('clientName')} className={cx(!!errors.clientName)} />
                </FormField>
                <FormField label="Client's Email" error={errors.clientEmail?.message}>
                  <input
                    type="email"
                    placeholder="e.g. email@example.com"
                    {...register('clientEmail')}
                    className={cx(!!errors.clientEmail)}
                  />
                </FormField>
                <FormField label="Street Address" error={errors.clientAddress?.street?.message}>
                  <input {...register('clientAddress.street')} className={cx(!!errors.clientAddress?.street)} />
                </FormField>
                <div className="grid grid-cols-2 gap-6 md:grid-cols-3">
                  <FormField label="City" error={errors.clientAddress?.city?.message}>
                    <input {...register('clientAddress.city')} className={cx(!!errors.clientAddress?.city)} />
                  </FormField>
                  <FormField label="Post Code" error={errors.clientAddress?.postCode?.message}>
                    <input {...register('clientAddress.postCode')} className={cx(!!errors.clientAddress?.postCode)} />
                  </FormField>
                  <div className="col-span-2 md:col-span-1">
                    <FormField label="Country" error={errors.clientAddress?.country?.message}>
                      <input {...register('clientAddress.country')} className={cx(!!errors.clientAddress?.country)} />
                    </FormField>
                  </div>
                </div>
              </div>
            </fieldset>

            {/* Dates + Terms + Description */}
            <div className="flex flex-col gap-6">
              <div className="grid grid-cols-2 gap-6">
                <FormField label="Invoice Date" error={errors.createdAt?.message}>
                  <input type="date" {...register('createdAt')} className={cx(!!errors.createdAt)} />
                </FormField>
                <FormField label="Payment Terms" error={errors.paymentTerms?.message}>
                  <select
                    {...register('paymentTerms', { valueAsNumber: true })}
                    className={cx(!!errors.paymentTerms)}
                  >
                    <option value={1}>Net 1 Day</option>
                    <option value={7}>Net 7 Days</option>
                    <option value={14}>Net 14 Days</option>
                    <option value={30}>Net 30 Days</option>
                  </select>
                </FormField>
              </div>
              <FormField label="Project Description" error={errors.description?.message}>
                <input
                  placeholder="e.g. Graphic Design Service"
                  {...register('description')}
                  className={cx(!!errors.description)}
                />
              </FormField>
            </div>

            {/* Item List */}
            <div>
              <h3 className="mb-4 text-lg font-bold text-[#777F98]">Item List</h3>

              {fields.length > 0 && (
                <div className="mb-3 hidden grid-cols-[1fr_64px_100px_80px_13px] items-center gap-x-4 md:grid">
                  <span className="text-sm text-label">Item Name</span>
                  <span className="text-sm text-label">Qty.</span>
                  <span className="text-sm text-label">Price</span>
                  <span className="text-sm text-label">Total</span>
                  <span />
                </div>
              )}

              <div className="flex flex-col gap-4">
                {fields.map((field, i) => {
                  const qty = Number(watchedItems?.[i]?.quantity) || 0
                  const price = Number(watchedItems?.[i]?.price) || 0

                  return (
                    <div key={field.id} className="grid grid-cols-[64px_1fr_auto_auto] items-end gap-3 md:grid-cols-[1fr_64px_100px_80px_13px] md:items-center md:gap-x-4">
                      {/* Item Name — full width on mobile, col 1 on desktop */}
                      <div className="col-span-4 md:col-span-1">
                        <label className="mb-2 block text-xs font-bold text-label md:hidden">Item Name</label>
                        <input
                          placeholder="Item name"
                          {...register(`items.${i}.name`)}
                          className={cx(!!errors.items?.[i]?.name)}
                        />
                      </div>
                      {/* Qty */}
                      <div>
                        <label className="mb-2 block text-xs font-bold text-label md:hidden">Qty.</label>
                        <input
                          type="number"
                          min={0}
                          {...register(`items.${i}.quantity`, { valueAsNumber: true })}
                          className={cx(!!errors.items?.[i]?.quantity)}
                        />
                      </div>
                      {/* Price */}
                      <div>
                        <label className="mb-2 block text-xs font-bold text-label md:hidden">Price</label>
                        <input
                          type="number"
                          min={0}
                          step="0.01"
                          {...register(`items.${i}.price`, { valueAsNumber: true })}
                          className={cx(!!errors.items?.[i]?.price)}
                        />
                      </div>
                      {/* Total */}
                      <div>
                        <span className="mb-2 block text-xs font-bold text-label md:hidden">Total</span>
                        <span className="block py-4 text-sm font-bold text-muted">
                          {formatCurrency(qty * price)}
                        </span>
                      </div>
                      {/* Delete */}
                      <button
                        type="button"
                        onClick={() => remove(i)}
                        aria-label="Remove item"
                        className="mb-[14px] cursor-pointer opacity-60 transition-opacity hover:opacity-100 md:mb-0"
                      >
                        <img src="/assets/icon-delete.svg" alt="" width={13} height={16} />
                      </button>
                    </div>
                  )
                })}
              </div>

              <button
                type="button"
                onClick={() => append({ name: '', quantity: 1, price: 0 })}
                className="mt-5 w-full cursor-pointer rounded-full bg-surface py-4 text-sm font-bold text-label transition-colors hover:bg-border dark:bg-input-dark dark:text-fog dark:hover:bg-sidebar"
              >
                + Add New Item
              </button>

              {itemsError && (
                <p className="mt-3 text-sm text-delete">{itemsError}</p>
              )}
            </div>
          </div>
        </div>

        {/* Fixed footer */}
        <div className={`shrink-0 flex items-center gap-2 px-6 py-8 shadow-[0_-8px_24px_rgba(0,0,0,0.08)] dark:shadow-[0_-8px_24px_rgba(0,0,0,0.3)] md:px-14 ${
          mode === 'create' ? 'justify-between' : 'justify-end'
        }`}>
          {mode === 'create' ? (
            <>
              <button
                type="button"
                onClick={onClose}
                className="cursor-pointer rounded-full bg-surface px-6 py-4 text-sm font-bold text-label transition-colors hover:bg-border dark:bg-input-dark dark:text-fog dark:hover:bg-sidebar"
              >
                Discard
              </button>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => submit('draft')}
                  className="cursor-pointer rounded-full bg-body px-6 py-4 text-sm font-bold text-muted transition-colors hover:bg-ink dark:bg-input-dark dark:text-fog dark:hover:bg-sidebar"
                >
                  Save as Draft
                </button>
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => submit('pending')}
                  className="cursor-pointer rounded-full bg-purple px-6 py-4 text-sm font-bold text-white transition-colors hover:bg-purple-light"
                >
                  Save &amp; Send
                </button>
              </div>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={onClose}
                className="cursor-pointer rounded-full bg-surface px-6 py-4 text-sm font-bold text-label transition-colors hover:bg-border dark:bg-input-dark dark:text-fog dark:hover:bg-sidebar"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isSubmitting}
                onClick={() => submit('pending')}
                className="cursor-pointer rounded-full bg-purple px-6 py-4 text-sm font-bold text-white transition-colors hover:bg-purple-light"
              >
                Save Changes
              </button>
            </>
          )}
        </div>
      </aside>
    </>
  )
}
