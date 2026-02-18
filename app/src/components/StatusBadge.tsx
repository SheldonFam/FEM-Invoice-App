import type { InvoiceStatus } from '../types/invoice'

interface Props {
  status: InvoiceStatus
}

const config: Record<InvoiceStatus, {
  label: string
  dot: string
  text: string
  bg: string
}> = {
  paid: {
    label: 'Paid',
    dot: 'bg-paid',
    text: 'text-paid',
    bg: 'bg-paid-bg dark:bg-paid-bg-dark',
  },
  pending: {
    label: 'Pending',
    dot: 'bg-pending',
    text: 'text-pending',
    bg: 'bg-pending-bg dark:bg-pending-bg-dark',
  },
  draft: {
    label: 'Draft',
    dot: 'bg-draft dark:bg-draft-dark',
    text: 'text-draft dark:text-draft-dark',
    bg: 'bg-draft-bg dark:bg-draft-bg-dark',
  },
}

export default function StatusBadge({ status }: Props) {
  const { label, dot, text, bg } = config[status]
  return (
    <div className={`inline-flex min-w-[104px] items-center justify-center gap-2 rounded-full px-4 py-3 ${bg}`}>
      <span className={`h-2 w-2 rounded-full ${dot}`} />
      <span className={`text-sm font-bold ${text}`}>{label}</span>
    </div>
  )
}
