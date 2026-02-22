import { useId, useRef, useState, useEffect } from 'react'
import { useInvoiceStore } from '../store/useInvoiceStore'
import type { InvoiceStatus } from '../types/invoice'

const STATUSES: InvoiceStatus[] = ['draft', 'pending', 'paid']

export default function FilterDropdown() {
  const [isOpen, setIsOpen] = useState(false)
  const { filters, toggleFilter } = useInvoiceStore()
  const ref = useRef<HTMLDivElement>(null)
  const id = useId()
  const listboxId = `${id}-listbox`

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  useEffect(() => {
    if (!isOpen) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false)
      }
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [isOpen])

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(o => !o)}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        aria-controls={isOpen ? listboxId : undefined}
        className="flex cursor-pointer items-center gap-3 font-bold text-ink transition-colors hover:text-label dark:text-white dark:hover:text-label"
      >
        <span className="hidden md:inline">Filter by status</span>
        <span className="md:hidden">Filter</span>
        <img
          src="/assets/icon-arrow-down.svg"
          alt=""
          width={11}
          height={7}
          className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {isOpen && (
        <div
          id={listboxId}
          role="group"
          aria-label="Filter by status"
          className="absolute left-1/2 top-[calc(100%+24px)] z-10 -translate-x-1/2 rounded-lg bg-card p-6 shadow-[0_10px_20px_rgba(0,0,0,0.25)] dark:bg-input-dark"
        >
          <ul className="flex flex-col gap-4">
            {STATUSES.map(status => {
              const checked = filters.includes(status)
              const checkboxId = `${id}-${status}`
              return (
                <li key={status}>
                  <label htmlFor={checkboxId} className="flex cursor-pointer items-center gap-4">
                    <span className="relative flex h-4 w-4 items-center justify-center">
                      <input
                        id={checkboxId}
                        type="checkbox"
                        checked={checked}
                        onChange={() => toggleFilter(status)}
                        className="peer sr-only"
                      />
                      <span
                        aria-hidden="true"
                        className={`absolute inset-0 rounded-sm transition-colors ${
                          checked
                            ? 'bg-purple'
                            : 'border border-fog bg-transparent peer-hover:border-purple peer-focus-visible:border-purple dark:border-label'
                        }`}
                      >
                        {checked && (
                          <img
                            src="/assets/icon-check.svg"
                            alt=""
                            width={10}
                            height={8}
                            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
                          />
                        )}
                      </span>
                    </span>
                    <span className="text-sm font-bold capitalize text-ink dark:text-white">
                      {status}
                    </span>
                  </label>
                </li>
              )
            })}
          </ul>
        </div>
      )}
    </div>
  )
}
