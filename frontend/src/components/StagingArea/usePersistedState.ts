import { useState } from 'react';

export function usePersistedState<T>(key: string, defaultValue: T): [T, (v: T) => void] {
  const [state, setState] = useState<T>(() => {
    try {
      const stored = localStorage.getItem(key);
      return stored !== null ? (JSON.parse(stored) as T) : defaultValue;
    } catch {
      return defaultValue;
    }
  });

  function setPersistedState(value: T) {
    setState(value);
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {}
  }

  return [state, setPersistedState];
}
