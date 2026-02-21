import { useEffect } from 'react'
import { useInvoiceStore } from '../store/useInvoiceStore'
import InvoiceCard from '../components/InvoiceCard'
import FilterDropdown from '../components/FilterDropdown'
import EmptyState from '../components/EmptyState'
import InvoiceForm from '../components/InvoiceForm'
import { useState } from 'react'

export default function InvoiceListPage() {
  const { invoices, isLoading, fetchInvoices, total, limit, offset, setPage } = useInvoiceStore()
  const [isFormOpen, setIsFormOpen] = useState(false)

  // Initial load
  useEffect(() => {
    fetchInvoices()
  }, [])  // eslint-disable-line react-hooks/exhaustive-deps

  const currentPage = Math.floor(offset / limit) + 1
  const totalPages = Math.ceil(total / limit)
  const showingFrom = total === 0 ? 0 : offset + 1
  const showingTo = Math.min(offset + limit, total)

  return (
    <div className="mx-auto max-w-[730px] px-6 py-8 md:py-[72px]">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-ink dark:text-white md:text-2xl">Invoices</h1>
          <p className="mt-1 text-sm text-muted">
            <span className="hidden md:inline">
              {total === 0 ? 'No invoices' : `There are ${total} total invoices`}
            </span>
            <span className="md:hidden">
              {total === 0 ? 'No invoices' : `${total} invoices`}
            </span>
          </p>
        </div>

        <div className="flex items-center gap-5 md:gap-10">
          <FilterDropdown />

          <button
            onClick={() => setIsFormOpen(true)}
            className="flex cursor-pointer items-center gap-2 rounded-full bg-purple py-2 pl-2 pr-4 text-white transition-colors hover:bg-purple-light md:gap-4 md:pr-6"
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white">
              <img src="/assets/icon-plus.svg" alt="" width={11} height={11} />
            </span>
            <span className="text-sm font-bold">
              <span className="hidden md:inline">New Invoice</span>
              <span className="md:hidden">New</span>
            </span>
          </button>
        </div>
      </div>

      {/* List */}
      <div className="mt-16 flex flex-col gap-4">
        {isLoading ? (
          <div className="flex flex-col gap-4">
            {[1, 2, 3].map(i => (
              <div
                key={i}
                className="h-[72px] animate-pulse rounded-md bg-card dark:bg-card-dark md:h-[72px]"
              />
            ))}
          </div>
        ) : invoices.length === 0 ? (
          <EmptyState />
        ) : (
          invoices.map(inv => <InvoiceCard key={inv.id} invoice={inv} />)
        )}
      </div>

      {/* Pagination */}
      {!isLoading && total > limit && (
        <div className="mt-8 flex items-center justify-between">
          <p className="text-sm text-muted">
            Showing {showingFrom}–{showingTo} of {total}
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setPage(offset - limit)}
              disabled={offset === 0}
              className="rounded-full bg-card px-4 py-2 text-sm font-bold text-ink transition-colors hover:bg-purple hover:text-white disabled:cursor-not-allowed disabled:opacity-40 dark:bg-card-dark dark:text-white dark:hover:bg-purple"
            >
              Previous
            </button>
            <button
              onClick={() => setPage(offset + limit)}
              disabled={currentPage >= totalPages}
              className="rounded-full bg-card px-4 py-2 text-sm font-bold text-ink transition-colors hover:bg-purple hover:text-white disabled:cursor-not-allowed disabled:opacity-40 dark:bg-card-dark dark:text-white dark:hover:bg-purple"
            >
              Next
            </button>
          </div>
        </div>
      )}

      <InvoiceForm
        mode="create"
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
      />
    </div>
  )
}
