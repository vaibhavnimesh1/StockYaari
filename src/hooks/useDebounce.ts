import { useEffect, useState } from 'react';

/**
 * Custom hook to debounce any rapidly changing value (e.g. search input).
 *
 * @param value The raw input value
 * @param delay The delay in milliseconds (default 500ms)
 */
export function useDebounce<T>(value: T, delay = 500): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}
