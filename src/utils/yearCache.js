/**
 * Year Data Cache utilities for frontend state caching
 * Caches year data to avoid re-fetching when switching back to a previously loaded year
 */

/**
 * In-memory cache for year data
 * Structure: { [year]: { book: [], screen: [], music: [], game: [] } }
 */
const yearDataCache = new Map();

/**
 * Check if year data is already cached
 * @param {number} year - Year to check
 * @returns {boolean} True if year data is in cache
 */
export function isYearCached(year) {
  return yearDataCache.has(year);
}

/**
 * Get cached data for a year
 * @param {number} year - Year to get data for
 * @returns {Object|null} Cached category data or null if not cached
 */
export function getCachedYearData(year) {
  return yearDataCache.get(year) || null;
}

/**
 * Store year data in cache
 * @param {number} year - Year to cache data for
 * @param {Object} categoryItems - Object with category data { book: [], screen: [], music: [], game: [] }
 */
export function cacheYearData(year, categoryItems) {
  // Deep clone the data to prevent mutations from affecting the cache
  const clonedData = {
    book: [...(categoryItems.book || [])],
    screen: [...(categoryItems.screen || [])],
    music: [...(categoryItems.music || [])],
    game: [...(categoryItems.game || [])]
  };
  yearDataCache.set(year, clonedData);
}

/**
 * Clear all cached year data
 * Useful for testing or when data needs to be refreshed
 */
export function clearYearCache() {
  yearDataCache.clear();
}

/**
 * Get the number of years currently cached
 * @returns {number} Number of cached years
 */
export function getCacheSize() {
  return yearDataCache.size;
}

/**
 * Get all cached years
 * @returns {number[]} Array of cached years
 */
export function getCachedYears() {
  return Array.from(yearDataCache.keys());
}

/**
 * Remove a specific year from the cache
 * @param {number} year - Year to remove from cache
 * @returns {boolean} True if year was removed, false if it wasn't in cache
 */
export function removeCachedYear(year) {
  return yearDataCache.delete(year);
}

// Export the Map for testing purposes (not recommended for production use)
export { yearDataCache as _internalCache };
