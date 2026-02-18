import { useState } from 'react'
import { useInvoiceStore } from '../store/useInvoiceStore'
import InvoiceCard from '../components/InvoiceCard'
import FilterDropdown from '../components/FilterDropdown'
import EmptyState from '../components/EmptyState'
import InvoiceForm from '../components/InvoiceForm'

export default function InvoiceListPage() {
  const { invoices, filters } = useInvoiceStore()
  const [isFormOpen, setIsFormOpen] = useState(false)

  const filtered = filters.length === 0
    ? invoices
    : invoices.filter(inv => filters.includes(inv.status))

  const subtitle = filtered.length === 0
    ? 'No invoices'
    : `There are ${filtered.length} total invoices`

  return (
    <div className="mx-auto max-w-[730px] px-6 py-[72px]">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-ink dark:text-white">Invoices</h1>
          <p className="mt-1 text-sm text-muted">{subtitle}</p>
        </div>

        <div className="flex items-center gap-10">
          <FilterDropdown />

          <button
            onClick={() => setIsFormOpen(true)}
            className="flex cursor-pointer items-center gap-4 rounded-full bg-purple py-2 pl-2 pr-6 text-white transition-colors hover:bg-purple-light"
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white">
              <img src="/assets/icon-plus.svg" alt="" width={11} height={11} />
            </span>
            <span className="text-sm font-bold">New Invoice</span>
          </button>
        </div>
      </div>

      {/* List */}
      <div className="mt-16 flex flex-col gap-4">
        {filtered.length === 0
          ? <EmptyState />
          : filtered.map(inv => <InvoiceCard key={inv.id} invoice={inv} />)
        }
      </div>

      <InvoiceForm
        mode="create"
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
      />
    </div>
  )
}
