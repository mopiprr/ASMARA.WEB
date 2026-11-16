import { useEffect, useState } from 'react';

/**
 * Delays updating a value until the specified duration has elapsed without changes.
 */
export function useDebouncedValue<T>(value: T, delayMs = 350): T {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedValue(value);
    }, delayMs);

    return () => {
      window.clearTimeout(timer);
    };
  }, [value, delayMs]);

  return debouncedValue;
}
