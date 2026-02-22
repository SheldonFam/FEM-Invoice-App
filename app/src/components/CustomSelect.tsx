import { useEffect, useId, useRef, useState } from 'react'

interface Option {
  value: number
  label: string
}

interface Props {
  value: number
  onChange: (value: number) => void
  options: Option[]
  hasError?: boolean
  id?: string
}

export default function CustomSelect({ value, onChange, options, hasError, id: externalId }: Props) {
  const [isOpen, setIsOpen] = useState(false)
  const internalId = useId()
  const id = externalId ?? internalId
  const listboxId = `${id}-listbox`
  const ref = useRef<HTMLDivElement>(null)

  const selected = options.find(o => o.value === value)

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Escape') {
      setIsOpen(false)
    } else if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      setIsOpen(o => !o)
    } else if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault()
      if (!isOpen) {
        setIsOpen(true)
        return
      }
      const currentIdx = options.findIndex(o => o.value === value)
      const nextIdx = e.key === 'ArrowDown'
        ? Math.min(currentIdx + 1, options.length - 1)
        : Math.max(currentIdx - 1, 0)
      onChange(options[nextIdx].value)
    }
  }

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        id={id}
        role="combobox"
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        aria-controls={listboxId}
        onClick={() => setIsOpen(o => !o)}
        onKeyDown={handleKeyDown}
        className={`flex w-full cursor-pointer items-center justify-between rounded-sm border bg-transparent px-5 py-4 text-left text-sm font-bold text-ink outline-none transition-colors focus:border-purple dark:text-white ${
          hasError
            ? 'border-delete'
            : 'border-border hover:border-purple dark:border-border-dark'
        }`}
      >
        {selected?.label}
        <img
          src="/assets/icon-arrow-down.svg"
          alt=""
          width={11}
          height={7}
          className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {isOpen && (
        <ul
          id={listboxId}
          role="listbox"
          aria-activedescendant={`${id}-option-${value}`}
          className="absolute left-0 top-[calc(100%+16px)] z-10 w-full overflow-hidden rounded-lg bg-card py-2 shadow-[0_10px_20px_rgba(0,0,0,0.25)] dark:bg-input-dark"
        >
          {options.map((option, i) => (
            <li
              key={option.value}
              id={`${id}-option-${option.value}`}
              role="option"
              aria-selected={option.value === value}
              onClick={() => {
                onChange(option.value)
                setIsOpen(false)
              }}
              className={`cursor-pointer px-6 py-4 text-sm font-bold transition-colors hover:text-purple ${
                option.value === value
                  ? 'text-purple'
                  : 'text-ink dark:text-white'
              } ${i < options.length - 1 ? 'border-b border-border dark:border-border-dark' : ''}`}
            >
              {option.label}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
