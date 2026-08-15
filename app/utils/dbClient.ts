/**
 * Utility for persisting data to the database (and caching in localStorage)
 */

export async function fetchDbCollection<T>(key: string, localStorageKey: string, fallback: T): Promise<T> {
  try {
    // 1. Try to fetch from persistent server Database
    const res = await fetch(`/api/db?key=${key}`, { cache: 'no-store' });
    if (res.ok) {
      const json = await res.json();
      if (json.success && json.data !== null && json.data !== undefined) {
        // Update localStorage cache
        try {
          localStorage.setItem(localStorageKey, JSON.stringify(json.data));
        } catch {}
        return json.data as T;
      }
    }
  } catch (e) {
    console.warn(`[DB Client] Server fetch failed for ${key}, falling back to localStorage:`, e);
  }

  // 2. Fallback to localStorage
  try {
    const cached = localStorage.getItem(localStorageKey);
    if (cached) {
      return JSON.parse(cached) as T;
    }
  } catch (e) {}

  // 3. Fallback to default initial data
  return fallback;
}

export async function saveDbCollection<T>(key: string, localStorageKey: string, data: T): Promise<boolean> {
  // Always save to localStorage immediately for instant UI responsiveness
  try {
    localStorage.setItem(localStorageKey, JSON.stringify(data));
    window.dispatchEvent(new StorageEvent('storage', { key: localStorageKey }));
    window.dispatchEvent(new CustomEvent('db-updated', { detail: { key, localStorageKey } }));
  } catch (e) {}

  // Save to persistent server Database
  try {
    const res = await fetch('/api/db', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ key, data }),
    });
    if (res.ok) {
      const json = await res.json();
      return json.success;
    }
  } catch (e) {
    console.error(`[DB Client] Server save failed for ${key}:`, e);
  }

  return false;
}
