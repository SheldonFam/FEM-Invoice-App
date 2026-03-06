import { useState, useRef, useEffect, useCallback } from "react";

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
  const optionsRef = useRef(options);

  useEffect(() => {
    actionRef.current = action;
    optionsRef.current = options;
  });

  const execute = useCallback(async () => {
    setIsLoading(true);
    optionsRef.current?.onStart?.();
    try {
      await actionRef.current();
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      const ctx = optionsRef.current?.context;
      optionsRef.current?.onError?.(
        new Error(ctx ? `Failed to ${ctx}: ${message}` : message),
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  return [execute, isLoading];
}
