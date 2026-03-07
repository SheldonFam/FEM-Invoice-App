import { useState, useRef, useCallback } from "react";
import { getErrorMessage } from "../lib/ui";

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
  actionRef.current = action;
  optionsRef.current = options;

  const execute = useCallback(async () => {
    setIsLoading(true);
    optionsRef.current?.onStart?.();
    try {
      await actionRef.current();
    } catch (err) {
      const message = getErrorMessage(err, String(err));
      const ctx = optionsRef.current?.context;
      const wrapped = new Error(ctx ? `Failed to ${ctx}: ${message}` : message);
      if (optionsRef.current?.onError) {
        optionsRef.current.onError(wrapped);
      } else {
        throw wrapped;
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  return [execute, isLoading];
}
