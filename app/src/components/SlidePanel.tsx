import { useEffect, useRef, useState, type ReactNode } from 'react'

interface Props {
  isOpen: boolean
  onClose: () => void
  'aria-label': string
  children: ReactNode
}

export default function SlidePanel({ isOpen, onClose, 'aria-label': ariaLabel, children }: Props) {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const [animateIn, setAnimateIn] = useState(false)

  // Show the dialog when isOpen becomes true
  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog || !isOpen) return

    if (!dialog.open) dialog.showModal()
    // Double rAF ensures the browser paints the off-screen state before animating in
    requestAnimationFrame(() => {
      requestAnimationFrame(() => setAnimateIn(true))
    })

    return () => { setAnimateIn(false) }
  }, [isOpen])

  const isVisible = isOpen && animateIn

  // After slide-out transition completes, actually close the dialog
  function handleTransitionEnd(e: React.TransitionEvent) {
    if (e.target === dialogRef.current && !isOpen && dialogRef.current?.open) {
      dialogRef.current.close()
    }
  }

  // Native Escape fires cancel event — route through onClose so parent state stays in sync
  function handleCancel(e: React.SyntheticEvent) {
    e.preventDefault()
    onClose()
  }

  return (
    <dialog
      ref={dialogRef}
      onCancel={handleCancel}
      onTransitionEnd={handleTransitionEnd}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
      aria-label={ariaLabel}
      className={`fixed inset-0 m-0 flex h-screen max-h-screen w-full max-w-none flex-col bg-card p-0 transition-transform duration-300 ease-in-out dark:bg-card-dark md:left-[103px] md:w-[616px] backdrop:bg-black/50 ${
        isVisible ? 'translate-x-0' : '-translate-x-full'
      }`}
    >
      {children}
    </dialog>
  )
}
