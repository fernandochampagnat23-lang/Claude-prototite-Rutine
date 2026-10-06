import { useEffect, useState } from 'react';

/** Hora actual que se actualiza cada `interval` ms mientras `active` sea verdadero. */
export function useNow(active: boolean, interval = 200): number {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    if (!active) return;
    setNow(Date.now());
    const id = window.setInterval(() => setNow(Date.now()), interval);
    return () => window.clearInterval(id);
  }, [active, interval]);
  return now;
}
