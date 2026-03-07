import { useEffect, useRef } from 'react'
import { btnCx } from '../lib/ui'

interface Props {
  invoiceId: string
  onConfirm: () => void
  onCancel: () => void
}

export default function DeleteModal({ invoiceId, onConfirm, onCancel }: Props) {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const onCancelRef = useRef(onCancel)
  useEffect(() => { onCancelRef.current = onCancel })

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return

    dialog.showModal()

    const handleClose = () => onCancelRef.current()
    dialog.addEventListener('close', handleClose)
    return () => dialog.removeEventListener('close', handleClose)
  }, [])

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby="delete-modal-title"
      aria-describedby="delete-modal-desc"
      onClick={e => { if (e.target === e.currentTarget) dialogRef.current?.close() }}
      className="fixed inset-0 m-auto h-fit w-[calc(100%-2rem)] max-w-120 rounded-lg bg-card p-12 backdrop:bg-black/50 dark:bg-card-dark"
    >
      <h2 id="delete-modal-title" className="text-xl font-bold text-ink dark:text-white">
        Confirm Deletion
      </h2>
      <p id="delete-modal-desc" className="mt-3 text-sm leading-relaxed text-muted">
        Are you sure you want to delete invoice #{invoiceId}? This action
        cannot be undone.
      </p>
      <div className="mt-8 flex items-center justify-end gap-2">
        <button
          type="button"
          onClick={() => dialogRef.current?.close()}
          className={btnCx.secondary}
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={onConfirm}
          className={btnCx.destructive}
        >
          Delete
        </button>
      </div>
    </dialog>
  )
}
