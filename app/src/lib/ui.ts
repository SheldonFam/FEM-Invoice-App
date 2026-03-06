/** Shared input className builder used across forms */
export function inputCx(hasError?: boolean) {
  return `w-full rounded-sm border bg-transparent px-5 py-4 text-sm font-bold text-ink outline-none transition-colors focus-visible:border-purple focus-visible:ring-2 focus-visible:ring-purple/25 dark:text-white ${
    hasError
      ? 'border-delete'
      : 'border-border hover:border-purple dark:border-border-dark'
  }`
}
