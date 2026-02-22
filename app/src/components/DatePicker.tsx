import { useEffect, useRef, useState } from 'react'

interface Props {
  value: string // YYYY-MM-DD
  onChange: (value: string) => void
  hasError?: boolean
  id?: string
}

const MONTH_NAMES = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
]

function formatDisplay(dateStr: string) {
  if (!dateStr) return ''
  const d = new Date(dateStr + 'T00:00:00')
  return `${d.getDate()} ${MONTH_NAMES[d.getMonth()]} ${d.getFullYear()}`
}

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate()
}

function getFirstDayOfWeek(year: number, month: number) {
  return new Date(year, month, 1).getDay()
}

function toDateString(year: number, month: number, day: number) {
  return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
}

function parseDate(value: string) {
  if (!value) return new Date()
  return new Date(value + 'T00:00:00')
}

export default function DatePicker({ value, onChange, hasError, id }: Props) {
  const [isOpen, setIsOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  const initial = parseDate(value)
  const [viewYear, setViewYear] = useState(initial.getFullYear())
  const [viewMonth, setViewMonth] = useState(initial.getMonth())

  function toggleOpen() {
    setIsOpen(prev => {
      if (!prev && value) {
        // Sync calendar view to current value when opening
        const d = parseDate(value)
        setViewYear(d.getFullYear())
        setViewMonth(d.getMonth())
      }
      return !prev
    })
  }

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
      if (e.key === 'Escape') setIsOpen(false)
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [isOpen])

  function prevMonth() {
    if (viewMonth === 0) {
      setViewMonth(11)
      setViewYear(y => y - 1)
    } else {
      setViewMonth(m => m - 1)
    }
  }

  function nextMonth() {
    if (viewMonth === 11) {
      setViewMonth(0)
      setViewYear(y => y + 1)
    } else {
      setViewMonth(m => m + 1)
    }
  }

  function selectDay(day: number) {
    onChange(toDateString(viewYear, viewMonth, day))
    setIsOpen(false)
  }

  // Build calendar grid
  const daysInMonth = getDaysInMonth(viewYear, viewMonth)
  const firstDay = getFirstDayOfWeek(viewYear, viewMonth)
  const daysInPrevMonth = getDaysInMonth(viewYear, viewMonth === 0 ? 11 : viewMonth - 1)

  const selectedDate = value ? new Date(value + 'T00:00:00') : null
  const isSelectedDay = (day: number) =>
    selectedDate !== null &&
    selectedDate.getFullYear() === viewYear &&
    selectedDate.getMonth() === viewMonth &&
    selectedDate.getDate() === day

  // Leading days from previous month
  const leadingDays: number[] = []
  for (let i = firstDay - 1; i >= 0; i--) {
    leadingDays.push(daysInPrevMonth - i)
  }

  // Trailing days to fill last row
  const totalCells = leadingDays.length + daysInMonth
  const trailingCount = totalCells % 7 === 0 ? 0 : 7 - (totalCells % 7)
  const trailingDays: number[] = []
  for (let i = 1; i <= trailingCount; i++) {
    trailingDays.push(i)
  }

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        id={id}
        onClick={toggleOpen}
        aria-label={value ? `Selected date: ${formatDisplay(value)}. Click to change` : 'Choose a date'}
        className={`flex w-full cursor-pointer items-center justify-between rounded-sm border bg-transparent px-5 py-4 text-left text-sm font-bold text-ink outline-none transition-colors focus:border-purple dark:text-white ${
          hasError
            ? 'border-delete'
            : 'border-border hover:border-purple dark:border-border-dark'
        }`}
      >
        {value ? formatDisplay(value) : 'Select date'}
        <img src="/assets/icon-calendar.svg" alt="" width={16} height={16} aria-hidden="true" />
      </button>

      {isOpen && (
        <div
          role="dialog"
          aria-label="Choose date"
          className="absolute left-0 top-[calc(100%+8px)] z-10 w-full min-w-60 rounded-lg bg-card px-5 py-6 shadow-[0_10px_20px_rgba(0,0,0,0.25)] dark:bg-input-dark"
        >
          {/* Month navigation */}
          <div className="mb-8 flex items-center justify-between px-1">
            <button
              type="button"
              onClick={prevMonth}
              aria-label="Previous month"
              className="cursor-pointer p-1 text-purple transition-colors hover:text-purple-light"
            >
              <img src="/assets/icon-arrow-left.svg" alt="" width={7} height={10} />
            </button>
            <span className="text-sm font-bold text-ink dark:text-white">
              {MONTH_NAMES[viewMonth]} {viewYear}
            </span>
            <button
              type="button"
              onClick={nextMonth}
              aria-label="Next month"
              className="cursor-pointer p-1 text-purple transition-colors hover:text-purple-light"
            >
              <img src="/assets/icon-arrow-right.svg" alt="" width={7} height={10} />
            </button>
          </div>

          {/* Day grid */}
          <div className="grid grid-cols-7 place-items-center gap-y-4">
            {/* Leading days (previous month) */}
            {leadingDays.map((day, i) => (
              <span key={`prev-${i}`} className="text-sm font-bold text-muted/30">{day}</span>
            ))}

            {/* Current month days */}
            {Array.from({ length: daysInMonth }, (_, i) => i + 1).map(day => (
              <button
                key={day}
                type="button"
                onClick={() => selectDay(day)}
                className={`cursor-pointer text-sm font-bold transition-colors ${
                  isSelectedDay(day)
                    ? 'text-purple'
                    : 'text-ink hover:text-purple dark:text-white dark:hover:text-purple'
                }`}
              >
                {day}
              </button>
            ))}

            {/* Trailing days (next month) */}
            {trailingDays.map((day, i) => (
              <span key={`next-${i}`} className="text-sm font-bold text-muted/30">{day}</span>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
