import { useState, useRef, useEffect } from "react";

export function useAsyncAction(
  action: () => Promise<unknown>,
  options?: {
    onError?: (err: Error) => void;
    onStart?: () => void;
    context?: string;
  },
): [() => Promise<void>, boolean] {
  const [isLoading, setIsLoading] = useState(false);
  const actionRef = useRef(action);
  actionRef.current = action;
  const optionsRef = useRef(options);
  optionsRef.current = options;

  const mountedRef = useRef(true);
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const wrapped = useState(() => async () => {
    setIsLoading(true);
    optionsRef.current?.onStart?.();
    try {
      await actionRef.current();
    } catch (err) {
      if (!mountedRef.current) return;
      const message = err instanceof Error ? err.message : String(err);
      const ctx = optionsRef.current?.context;
      optionsRef.current?.onError?.(
        new Error(ctx ? `Failed to ${ctx}: ${message}` : message),
      );
    } finally {
      if (mountedRef.current) setIsLoading(false);
    }
  })[0];

  return [wrapped, isLoading];
}
