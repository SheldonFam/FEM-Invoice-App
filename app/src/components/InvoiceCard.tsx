import { Link } from 'react-router-dom'
import type { Invoice } from '../types/invoice'
import { formatDate, formatCurrency } from '../lib/utils'
import StatusBadge from './StatusBadge'

interface Props {
  invoice: Invoice
}

export default function InvoiceCard({ invoice }: Props) {
  return (
    <Link
      to={`/${invoice.id}`}
      className="block rounded-md border border-transparent bg-card px-6 py-6 shadow-sm transition-colors hover:border-purple dark:bg-card-dark md:px-8"
    >
      {/* Mobile layout */}
      <div className="md:hidden">
        <div className="flex items-center justify-between">
          <span className="font-bold text-ink dark:text-white">
            <span className="text-label">#</span>{invoice.id}
          </span>
          <span className="text-sm text-muted dark:text-fog">{invoice.clientName}</span>
        </div>
        <div className="mt-6 flex items-end justify-between">
          <div>
            <p className="text-sm text-muted">Due {formatDate(invoice.paymentDue)}</p>
            <p className="mt-2 font-bold text-ink dark:text-white">
              {formatCurrency(invoice.total)}
            </p>
          </div>
          <StatusBadge status={invoice.status} />
        </div>
      </div>

      {/* Desktop layout */}
      <div className="hidden md:flex md:items-center md:gap-5">
        <span className="w-20 font-bold text-ink dark:text-white">
          <span className="text-label">#</span>{invoice.id}
        </span>
        <span className="w-32 text-sm text-muted">
          Due {formatDate(invoice.paymentDue)}
        </span>
        <span className="flex-1 text-sm text-muted dark:text-fog">
          {invoice.clientName}
        </span>
        <span className="w-32 text-right text-base font-bold text-ink dark:text-white">
          {formatCurrency(invoice.total)}
        </span>
        <div className="flex w-28 justify-center">
          <StatusBadge status={invoice.status} />
        </div>
        <img src="/assets/icon-arrow-right.svg" alt="" width={7} height={10} />
      </div>
    </Link>
  )
}
