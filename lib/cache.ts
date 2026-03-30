const CACHE_TTL_MS = 6 * 60 * 60 * 1000 // 6 hours

interface CacheEntry<T> {
  data: T
  expiresAt: number
}

const store = new Map<string, CacheEntry<unknown>>()

export function cacheGet<T>(key: string): T | null {
  const entry = store.get(key)
  if (!entry) return null
  if (Date.now() > entry.expiresAt) { store.delete(key); return null }
  return entry.data as T
}

export function cacheSet<T>(key: string, data: T, ttl = CACHE_TTL_MS): void {
  store.set(key, { data, expiresAt: Date.now() + ttl })
}
