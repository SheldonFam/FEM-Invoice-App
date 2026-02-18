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
      className="flex items-center gap-5 rounded-md border border-transparent bg-card px-8 py-6 shadow-sm transition-colors hover:border-purple dark:bg-card-dark"
    >
      {/* ID */}
      <span className="w-[80px] font-bold text-ink dark:text-white">
        <span className="text-label">#</span>{invoice.id}
      </span>

      {/* Due date */}
      <span className="w-[130px] text-sm text-muted">
        Due {formatDate(invoice.paymentDue)}
      </span>

      {/* Client name */}
      <span className="flex-1 text-sm text-muted dark:text-fog">
        {invoice.clientName}
      </span>

      {/* Amount */}
      <span className="w-[130px] text-right text-base font-bold text-ink dark:text-white">
        {formatCurrency(invoice.total)}
      </span>

      {/* Status */}
      <div className="w-[110px] flex justify-center">
        <StatusBadge status={invoice.status} />
      </div>

      {/* Chevron */}
      <img src="/assets/icon-arrow-right.svg" alt="" width={7} height={10} />
    </Link>
  )
}
