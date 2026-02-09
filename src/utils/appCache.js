// src/utils/appCache.js

const cache = new Map();

/**
 * Get cached value if not expired
 */
export const getCache = (key) => {
  const entry = cache.get(key);
  if (!entry) return null;

  const { value, expiresAt } = entry;

  if (Date.now() > expiresAt) {
    cache.delete(key);
    return null;
  }

  return value;
};

/**
 * Set cache with TTL
 */
export const setCache = (key, value, ttlMs) => {
  cache.set(key, {
    value,
    expiresAt: Date.now() + ttlMs,
  });
};

/**
 * Clear cache (single key or all)
 */
export const clearCache = (key) => {
  if (key) {
    cache.delete(key);
  } else {
    cache.clear();
  }
};
