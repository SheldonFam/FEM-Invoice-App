import { useCallback, useEffect, useRef, useState } from 'react'
import { formatDate } from '../lib/utils'
import { useClickOutside } from '../hooks/useClickOutside'
import { useEscapeKey } from '../hooks/useEscapeKey'
import { inputCx } from '../lib/ui'

interface Props {
  value: string // YYYY-MM-DD
  onChange: (value: string) => void
  hasError?: boolean
  id?: string
}

const monthFormatter = new Intl.DateTimeFormat('en-GB', { month: 'short' })
const SHORT_MONTHS = Array.from({ length: 12 }, (_, i) => monthFormatter.format(new Date(2000, i)))
const longFormatter = new Intl.DateTimeFormat('en-GB', { month: 'long' })
const LONG_MONTHS = Array.from({ length: 12 }, (_, i) => longFormatter.format(new Date(2000, i)))
const WEEKDAY_ABBR = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']
const WEEKDAY_FULL = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

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
  const gridRef = useRef<HTMLTableElement>(null)
  const [focusedDay, setFocusedDay] = useState<number | null>(null)

  const initial = parseDate(value)
  const [viewYear, setViewYear] = useState(initial.getFullYear())
  const [viewMonth, setViewMonth] = useState(initial.getMonth())

  function toggleOpen() {
    setIsOpen(prev => {
      if (!prev) {
        // Sync calendar view to current value when opening
        const d = value ? parseDate(value) : new Date()
        setViewYear(d.getFullYear())
        setViewMonth(d.getMonth())
        setFocusedDay(value ? d.getDate() : new Date().getDate())
      }
      return !prev
    })
  }

  // Focus the active day button when the dialog opens or focusedDay changes
  useEffect(() => {
    if (!isOpen || focusedDay === null) return
    const btn = gridRef.current?.querySelector<HTMLButtonElement>(`[data-day="${focusedDay}"]`)
    btn?.focus()
  }, [isOpen, focusedDay, viewMonth, viewYear])

  const close = useCallback(() => setIsOpen(false), [])
  useClickOutside(ref, close)
  useEscapeKey(isOpen, close)

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

  function handleGridKeyDown(e: React.KeyboardEvent) {
    if (focusedDay === null) return
    const daysInCurrent = getDaysInMonth(viewYear, viewMonth)
    let next = focusedDay

    switch (e.key) {
      case 'ArrowRight':
        e.preventDefault()
        if (focusedDay >= daysInCurrent) { nextMonth(); setFocusedDay(1) } else { next = focusedDay + 1 }
        break
      case 'ArrowLeft':
        e.preventDefault()
        if (focusedDay <= 1) { prevMonth(); setFocusedDay(getDaysInMonth(viewYear, viewMonth === 0 ? 11 : viewMonth - 1)) } else { next = focusedDay - 1 }
        break
      case 'ArrowDown':
        e.preventDefault()
        if (focusedDay + 7 > daysInCurrent) { nextMonth(); setFocusedDay(Math.min(focusedDay + 7 - daysInCurrent, getDaysInMonth(viewYear, viewMonth === 11 ? 0 : viewMonth + 1))) } else { next = focusedDay + 7 }
        break
      case 'ArrowUp':
        e.preventDefault()
        if (focusedDay - 7 < 1) { const prevDays = getDaysInMonth(viewYear, viewMonth === 0 ? 11 : viewMonth - 1); prevMonth(); setFocusedDay(prevDays + (focusedDay - 7)) } else { next = focusedDay - 7 }
        break
      case 'Home':
        e.preventDefault()
        next = 1
        break
      case 'End':
        e.preventDefault()
        next = daysInCurrent
        break
      case 'Enter':
      case ' ':
        e.preventDefault()
        selectDay(focusedDay)
        return
      default:
        return
    }
    if (next !== focusedDay) setFocusedDay(next)
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
        aria-label={value ? `Selected date: ${formatDate(value)}. Click to change` : 'Choose a date'}
        className={`flex cursor-pointer items-center justify-between text-left ${inputCx(hasError)}`}
      >
        {value ? formatDate(value) : 'Select date'}
        <img src="/assets/icon-calendar.svg" alt="" width={16} height={16} aria-hidden="true" />
      </button>

      {isOpen && (
        <div
          role="dialog"
          aria-label="Choose date"
          className="absolute left-0 top-[calc(100%+8px)] z-10 w-full min-w-64 rounded-lg bg-card px-4 py-5 shadow-[0_10px_20px_rgba(0,0,0,0.25)] dark:bg-input-dark"
        >
          {/* Month navigation */}
          <div className="mb-4 flex items-center justify-between px-1">
            <button
              type="button"
              onClick={prevMonth}
              aria-label="Previous month"
              className="cursor-pointer p-1 text-purple transition-colors hover:text-purple-light"
            >
              <img src="/assets/icon-arrow-left.svg" alt="" width={7} height={10} />
            </button>
            <span className="text-sm font-bold text-ink dark:text-white">
              {SHORT_MONTHS[viewMonth]} {viewYear}
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
          <table ref={gridRef} role="grid" aria-label={`${LONG_MONTHS[viewMonth]} ${viewYear}`} onKeyDown={handleGridKeyDown} className="w-full table-fixed">
            <thead>
              <tr>
                {WEEKDAY_ABBR.map((abbr, i) => (
                  <th key={abbr} scope="col" className="pb-4 text-center text-xs font-bold text-muted">
                    <abbr title={WEEKDAY_FULL[i]} className="no-underline">{abbr}</abbr>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {(() => {
                const allCells: React.ReactNode[] = []
                // Leading days
                leadingDays.forEach((day, i) => {
                  allCells.push(
                    <td key={`prev-${i}`} role="gridcell" className="text-center">
                      <span aria-hidden="true" className="py-2 text-sm font-bold text-muted/30">{day}</span>
                    </td>
                  )
                })
                // Current month days
                for (let day = 1; day <= daysInMonth; day++) {
                  const selected = isSelectedDay(day)
                  const focused = focusedDay === day
                  allCells.push(
                    <td key={day} role="gridcell" className="text-center">
                      <button
                        type="button"
                        data-day={day}
                        tabIndex={focused ? 0 : -1}
                        onClick={() => selectDay(day)}
                        aria-label={`${day} ${LONG_MONTHS[viewMonth]} ${viewYear}`}
                        aria-selected={selected}
                        className={`inline-flex h-9 w-full cursor-pointer items-center justify-center rounded-full text-sm font-bold transition-colors focus-visible:ring-2 focus-visible:ring-purple/50 ${
                          selected
                            ? 'bg-purple text-white'
                            : 'text-ink hover:text-purple dark:text-white dark:hover:text-purple'
                        }`}
                      >
                        {day}
                      </button>
                    </td>
                  )
                }
                // Trailing days
                trailingDays.forEach((day, i) => {
                  allCells.push(
                    <td key={`next-${i}`} role="gridcell" className="text-center">
                      <span aria-hidden="true" className="py-2 text-sm font-bold text-muted/30">{day}</span>
                    </td>
                  )
                })
                // Chunk into rows of 7
                const rows: React.ReactNode[][] = []
                for (let i = 0; i < allCells.length; i += 7) {
                  rows.push(allCells.slice(i, i + 7))
                }
                return rows.map((row, i) => <tr key={i}>{row}</tr>)
              })()}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
