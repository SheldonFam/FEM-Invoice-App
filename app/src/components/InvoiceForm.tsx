import { useEffect, useId, useRef } from 'react'
import { useForm, useFieldArray, useWatch, Controller, type Control } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import type { Invoice } from '../types/invoice'
import { draftSchema, pendingSchema, type InvoiceFormValues } from '../lib/schemas'
import { useInvoiceStore } from '../store/useInvoiceStore'
import { formatCurrency } from '../lib/utils'
import { inputCx, btnCx, getErrorMessage } from '../lib/ui'
import FormField from './FormField'
import CustomSelect from './CustomSelect'
import DatePicker from './DatePicker'
import SlidePanel from './SlidePanel'

const PAYMENT_TERMS_OPTIONS = [
  { value: 1, label: 'Net 1 Day' },
  { value: 7, label: 'Net 7 Days' },
  { value: 14, label: 'Net 14 Days' },
  { value: 30, label: 'Net 30 Days' },
]

interface Props {
  isOpen: boolean
  onClose: () => void
  mode: 'create' | 'edit'
  invoice?: Invoice
}

function getToday() {
  return new Date().toISOString().split('T')[0]
}

const emptyValues: InvoiceFormValues = {
  createdAt: '',
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

// Scoped per-row watch to avoid re-rendering the entire form on every keystroke
function ItemRow({ index, control, register, errors, remove }: {
  index: number
  control: Control<InvoiceFormValues>
  register: ReturnType<typeof useForm<InvoiceFormValues>>['register']
  errors: ReturnType<typeof useForm<InvoiceFormValues>>['formState']['errors']
  remove: (index: number) => void
}) {
  const item = useWatch({ control, name: `items.${index}` })
  const qty = Number(item?.quantity) || 0
  const price = Number(item?.price) || 0

  return (
    <div className="grid grid-cols-[64px_1fr_auto_auto] items-end gap-3 md:grid-cols-[1fr_64px_100px_80px_13px] md:items-center md:gap-x-4">
      {/* Item Name — full width on mobile, col 1 on desktop */}
      <div className="col-span-4 md:col-span-1">
        <label className="mb-2 block text-xs font-bold text-label md:hidden">Item Name</label>
        <input
          placeholder="Item name"
          aria-label="Item name"
          {...register(`items.${index}.name`)}
          className={inputCx(!!errors.items?.[index]?.name)}
        />
      </div>
      {/* Qty */}
      <div>
        <label className="mb-2 block text-xs font-bold text-label md:hidden">Qty.</label>
        <input
          type="number"
          min={0}
          aria-label="Quantity"
          {...register(`items.${index}.quantity`, { valueAsNumber: true })}
          className={inputCx(!!errors.items?.[index]?.quantity)}
        />
      </div>
      {/* Price */}
      <div>
        <label className="mb-2 block text-xs font-bold text-label md:hidden">Price</label>
        <input
          type="number"
          min={0}
          step="0.01"
          aria-label="Price"
          {...register(`items.${index}.price`, { valueAsNumber: true })}
          className={inputCx(!!errors.items?.[index]?.price)}
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
        onClick={() => remove(index)}
        aria-label={`Remove item ${index + 1}`}
        className="flex min-h-11 min-w-11 cursor-pointer items-center justify-center opacity-60 transition-opacity hover:opacity-100"
      >
        <img src="/assets/icon-delete.svg" alt="" width={13} height={16} />
      </button>
    </div>
  )
}

export default function InvoiceForm({ isOpen, onClose, mode, invoice }: Props) {
  const { addInvoice, updateInvoice } = useInvoiceStore()
  const submitMode = useRef<'draft' | 'pending'>('pending')
  const dateId = useId()
  const termsId = useId()

  const form = useForm<InvoiceFormValues>({
    resolver: (values, ctx, opts) =>
      zodResolver(submitMode.current === 'draft' ? draftSchema : pendingSchema)(values, ctx, opts),
    defaultValues: emptyValues,
  })

  const { fields, append, remove } = useFieldArray({ control: form.control, name: 'items' })
  const { errors, isSubmitting } = form.formState

  const { reset, handleSubmit, register } = form

  useEffect(() => {
    if (!isOpen) return
    reset(mode === 'edit' && invoice ? toFormValues(invoice) : { ...emptyValues, createdAt: getToday() })
  }, [isOpen, mode, invoice, reset])

  async function onSubmit(data: InvoiceFormValues) {
    try {
      if (mode === 'create') {
        await addInvoice(data, submitMode.current)
      } else if (invoice) {
        await updateInvoice(invoice.id, data)
      }
      onClose()
    } catch (err) {
      // RHF keeps isSubmitting=false after this; surface error via setError
      form.setError('root', {
        message: getErrorMessage(err),
      })
    }
  }

  function submit(mode: 'draft' | 'pending') {
    submitMode.current = mode
    handleSubmit(onSubmit)()
  }

  // Array-level items error (e.g. "an item must be added")
  const itemsError: string | undefined =
    errors.items?.root?.message ??
    (errors.items as { message?: string } | undefined)?.message

  return (
    <SlidePanel
      isOpen={isOpen}
      onClose={onClose}
      aria-label={mode === 'create' ? 'New Invoice' : `Edit invoice ${invoice?.id}`}
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
                <input {...register('senderAddress.street')} className={inputCx(!!errors.senderAddress?.street)} />
              </FormField>
              <div className="grid grid-cols-2 gap-6 md:grid-cols-3">
                <FormField label="City" error={errors.senderAddress?.city?.message}>
                  <input {...register('senderAddress.city')} className={inputCx(!!errors.senderAddress?.city)} />
                </FormField>
                <FormField label="Post Code" error={errors.senderAddress?.postCode?.message}>
                  <input {...register('senderAddress.postCode')} className={inputCx(!!errors.senderAddress?.postCode)} />
                </FormField>
                <div className="col-span-2 md:col-span-1">
                  <FormField label="Country" error={errors.senderAddress?.country?.message}>
                    <input {...register('senderAddress.country')} className={inputCx(!!errors.senderAddress?.country)} />
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
                <input {...register('clientName')} className={inputCx(!!errors.clientName)} />
              </FormField>
              <FormField label="Client's Email" error={errors.clientEmail?.message}>
                <input
                  type="email"
                  placeholder="e.g. email@example.com"
                  {...register('clientEmail')}
                  className={inputCx(!!errors.clientEmail)}
                />
              </FormField>
              <FormField label="Street Address" error={errors.clientAddress?.street?.message}>
                <input {...register('clientAddress.street')} className={inputCx(!!errors.clientAddress?.street)} />
              </FormField>
              <div className="grid grid-cols-2 gap-6 md:grid-cols-3">
                <FormField label="City" error={errors.clientAddress?.city?.message}>
                  <input {...register('clientAddress.city')} className={inputCx(!!errors.clientAddress?.city)} />
                </FormField>
                <FormField label="Post Code" error={errors.clientAddress?.postCode?.message}>
                  <input {...register('clientAddress.postCode')} className={inputCx(!!errors.clientAddress?.postCode)} />
                </FormField>
                <div className="col-span-2 md:col-span-1">
                  <FormField label="Country" error={errors.clientAddress?.country?.message}>
                    <input {...register('clientAddress.country')} className={inputCx(!!errors.clientAddress?.country)} />
                  </FormField>
                </div>
              </div>
            </div>
          </fieldset>

          {/* Dates + Terms + Description */}
          <div className="flex flex-col gap-6">
            <div className="grid grid-cols-2 gap-6">
              <FormField label="Invoice Date" error={errors.createdAt?.message} htmlFor={dateId}>
                <Controller
                  control={form.control}
                  name="createdAt"
                  render={({ field }) => (
                    <DatePicker
                      id={dateId}
                      value={field.value}
                      onChange={field.onChange}
                      hasError={!!errors.createdAt}
                    />
                  )}
                />
              </FormField>
              <FormField label="Payment Terms" error={errors.paymentTerms?.message} htmlFor={termsId}>
                <Controller
                  control={form.control}
                  name="paymentTerms"
                  render={({ field }) => (
                    <CustomSelect
                      id={termsId}
                      value={field.value}
                      onChange={field.onChange}
                      options={PAYMENT_TERMS_OPTIONS}
                      hasError={!!errors.paymentTerms}
                    />
                  )}
                />
              </FormField>
            </div>
            <FormField label="Project Description" error={errors.description?.message}>
              <input
                placeholder="e.g. Graphic Design Service"
                {...register('description')}
                className={inputCx(!!errors.description)}
              />
            </FormField>
          </div>

          {/* Item List */}
          <div>
            <h3 className="mb-4 text-lg font-bold text-muted">Item List</h3>

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
              {fields.map((field, i) => (
                <ItemRow
                  key={field.id}
                  index={i}
                  control={form.control}
                  register={register}
                  errors={errors}
                  remove={remove}
                />
              ))}
            </div>

            <button
              type="button"
              onClick={() => append({ name: '', quantity: 1, price: 0 })}
              className="mt-5 w-full cursor-pointer rounded-full bg-surface py-4 text-sm font-bold text-label transition-colors hover:bg-border dark:bg-input-dark dark:text-fog dark:hover:bg-sidebar"
            >
              + Add New Item
            </button>

            {itemsError && (
              <p role="alert" className="mt-3 text-sm text-delete">{itemsError}</p>
            )}
          </div>
        </div>
      </div>

      {/* Fixed footer */}
      {errors.root && (
        <p role="alert" className="shrink-0 px-6 pt-4 text-sm font-bold text-delete md:px-14">
          {errors.root.message}
        </p>
      )}
      <div className={`shrink-0 flex items-center gap-2 px-6 py-8 shadow-[0_-8px_24px_rgba(0,0,0,0.08)] dark:shadow-[0_-8px_24px_rgba(0,0,0,0.3)] md:px-14 ${
        mode === 'create' ? 'justify-between' : 'justify-end'
      }`}>
        {mode === 'create' ? (
          <>
            <button
              type="button"
              onClick={onClose}
              className={btnCx.secondary}
            >
              Discard
            </button>
            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={isSubmitting}
                onClick={() => submit('draft')}
                className="cursor-pointer rounded-full bg-sidebar px-6 py-4 text-sm font-bold text-fog transition-colors hover:bg-ink disabled:opacity-60 dark:bg-input-dark dark:text-fog dark:hover:bg-sidebar"
              >
                {isSubmitting && submitMode.current === 'draft' ? 'Saving…' : 'Save as Draft'}
              </button>
              <button
                type="button"
                disabled={isSubmitting}
                onClick={() => submit('pending')}
                className={`${btnCx.primary} disabled:opacity-60`}
              >
                {isSubmitting && submitMode.current === 'pending' ? 'Saving…' : 'Save & Send'}
              </button>
            </div>
          </>
        ) : (
          <>
            <button
              type="button"
              onClick={onClose}
              className={btnCx.secondary}
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={isSubmitting}
              onClick={() => submit('pending')}
              className={`${btnCx.primary} disabled:opacity-60`}
            >
              {isSubmitting ? 'Saving…' : 'Save Changes'}
            </button>
          </>
        )}
      </div>
    </SlidePanel>
  )
}
