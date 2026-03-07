/** Extract a human-readable error message from an unknown thrown value */
export function getErrorMessage(err: unknown, fallback = 'Something went wrong'): string {
  return err instanceof Error ? err.message : fallback
}

/** Shared input className builder used across forms */
export function inputCx(hasError?: boolean) {
  return `w-full rounded-sm border bg-transparent px-5 py-4 text-sm font-bold text-ink outline-none transition-colors focus-visible:border-purple focus-visible:ring-2 focus-visible:ring-purple/25 dark:text-white ${
    hasError
      ? 'border-delete'
      : 'border-border hover:border-purple dark:border-border-dark'
  }`
}

const btnBase = 'cursor-pointer rounded-full px-6 py-4 text-sm font-bold transition-colors'

export const btnCx = {
  primary: `${btnBase} bg-purple text-white hover:bg-purple-light`,
  secondary: `${btnBase} bg-surface text-label hover:bg-border dark:bg-input-dark dark:text-fog dark:hover:bg-sidebar`,
  destructive: `${btnBase} bg-delete text-white hover:bg-delete-hover`,
} as const
