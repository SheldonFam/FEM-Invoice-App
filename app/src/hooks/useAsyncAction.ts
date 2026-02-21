import { useState, useRef } from 'react'

export function useAsyncAction(
  action: () => Promise<unknown>,
  options?: { onError?: (err: Error) => void; onStart?: () => void }
): [() => Promise<void>, boolean] {
  const [isLoading, setIsLoading] = useState(false)
  const actionRef = useRef(action)
  actionRef.current = action
  const optionsRef = useRef(options)
  optionsRef.current = options

  const wrapped = useState(() => async () => {
    setIsLoading(true)
    optionsRef.current?.onStart?.()
    try {
      await actionRef.current()
    } catch (err) {
      optionsRef.current?.onError?.(err instanceof Error ? err : new Error(String(err)))
    } finally {
      setIsLoading(false)
    }
  })[0]

  return [wrapped, isLoading]
}
