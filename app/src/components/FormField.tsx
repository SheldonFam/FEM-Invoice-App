interface Props {
  label: string
  error?: string
  children: React.ReactNode
}

export default function FormField({ label, error, children }: Props) {
  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <span className={`text-sm ${error ? 'text-delete' : 'text-label dark:text-fog'}`}>
          {label}
        </span>
        {error && (
          <span className="text-sm text-delete">{error}</span>
        )}
      </div>
      {children}
    </div>
  )
}
