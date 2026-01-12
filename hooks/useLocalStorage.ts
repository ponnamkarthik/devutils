import { useState, useEffect, Dispatch, SetStateAction } from 'react';

/**
 * A custom hook that syncs state to localStorage.
 * Includes a debounce mechanism to prevent excessive writes during rapid typing.
 */
export function useLocalStorage<T>(key: string, initialValue: T): [T, Dispatch<SetStateAction<T>>] {
  // Lazy initialization to read from storage once
  const [state, setState] = useState<T>(() => {
    try {
      if (typeof window === 'undefined') {
        return initialValue;
      }
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.warn(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  useEffect(() => {
    // Debounce writes to localStorage to avoid performance hits on keystrokes
    const handler = setTimeout(() => {
      try {
        if (typeof window !== 'undefined') {
          window.localStorage.setItem(key, JSON.stringify(state));
        }
      } catch (error) {
        console.warn(`Error setting localStorage key "${key}":`, error);
      }
    }, 500); // 500ms debounce

    return () => {
      clearTimeout(handler);
    };
  }, [key, state]);

  return [state, setState];
}