import { cloneElement, isValidElement, useId } from 'react'

interface Props {
  label: string
  error?: string
  htmlFor?: string
  children: React.ReactNode
}

export default function FormField({ label, error, htmlFor, children }: Props) {
  const autoId = useId()
  const id = htmlFor ?? autoId
  const errorId = `${id}-error`

  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <label
          htmlFor={id}
          className={`text-sm ${error ? 'text-delete' : 'text-label dark:text-fog'}`}
        >
          {label}
        </label>
        {error && (
          <span id={errorId} className="text-sm text-delete" role="alert">
            {error}
          </span>
        )}
      </div>
      {!htmlFor && isValidElement(children)
        ? cloneElement(children, {
            id,
            'aria-invalid': error ? true : undefined,
            'aria-describedby': error ? errorId : undefined,
          } as React.HTMLAttributes<HTMLElement>)
        : children}
    </div>
  )
}
