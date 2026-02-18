import { useEffect } from 'react'

interface Props {
  invoiceId: string
  onConfirm: () => void
  onCancel: () => void
}

export default function DeleteModal({ invoiceId, onConfirm, onCancel }: Props) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCancel()
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [onCancel])

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      onClick={onCancel}
    >
      <div
        className="mx-4 w-full max-w-[480px] rounded-lg bg-card p-12 dark:bg-card-dark"
        onClick={e => e.stopPropagation()}
      >
        <h2 className="text-xl font-bold text-ink dark:text-white">
          Confirm Deletion
        </h2>
        <p className="mt-3 text-sm leading-relaxed text-muted">
          Are you sure you want to delete invoice #{invoiceId}? This action
          cannot be undone.
        </p>
        <div className="mt-8 flex items-center justify-end gap-2">
          <button
            onClick={onCancel}
            className="cursor-pointer rounded-full bg-surface px-6 py-4 text-sm font-bold text-muted transition-colors hover:bg-border dark:bg-input-dark dark:text-fog dark:hover:bg-sidebar"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="cursor-pointer rounded-full bg-delete px-6 py-4 text-sm font-bold text-white transition-colors hover:bg-delete-hover"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  )
}
