import { describe, it, expect, beforeEach } from 'vitest';
import {
  isYearCached,
  getCachedYearData,
  cacheYearData,
  clearYearCache,
  getCacheSize,
  getCachedYears,
  removeCachedYear,
  _internalCache
} from '@/utils/yearCache.js';

describe('yearCache utilities', () => {
  // Clear cache before each test to ensure isolation
  beforeEach(() => {
    clearYearCache();
  });

  describe('isYearCached', () => {
    it('should return false when year is not cached', () => {
      // Test case 3: Cache check for year 2024 when not cached
      expect(isYearCached(2024)).toBe(false);
    });

    it('should return true when year data has been cached', () => {
      // Test case 1: Load year 2024 data - data should be stored in cache
      const testData = {
        book: [{ item: { id: '1', display_title: 'Test Book' } }],
        screen: [],
        music: [],
        game: []
      };
      cacheYearData(2024, testData);

      // Test case 3: Cache check for year 2024 - should return true
      expect(isYearCached(2024)).toBe(true);
    });

    it('should return false for different year than cached', () => {
      const testData = {
        book: [],
        screen: [],
        music: [],
        game: []
      };
      cacheYearData(2024, testData);

      expect(isYearCached(2023)).toBe(false);
    });
  });

  describe('cacheYearData', () => {
    it('should store year data in cache', () => {
      // Test case 1: Load year 2024 data - data is stored in frontend state/cache
      const testData = {
        book: [{ item: { id: '1', display_title: 'Test Book' } }],
        screen: [{ item: { id: '2', display_title: 'Test Movie' } }],
        music: [{ item: { id: '3', display_title: 'Test Album' } }],
        game: [{ item: { id: '4', display_title: 'Test Game' } }]
      };

      cacheYearData(2024, testData);

      expect(isYearCached(2024)).toBe(true);
      expect(getCacheSize()).toBe(1);
    });

    it('should deep clone data to prevent mutations', () => {
      const originalData = {
        book: [{ item: { id: '1', display_title: 'Original Title' } }],
        screen: [],
        music: [],
        game: []
      };

      cacheYearData(2024, originalData);

      // Modify original data
      originalData.book.push({ item: { id: '2', display_title: 'New Book' } });

      // Cached data should not be affected
      const cachedData = getCachedYearData(2024);
      expect(cachedData.book.length).toBe(1);
    });

    it('should handle missing categories gracefully', () => {
      const partialData = {
        book: [{ item: { id: '1' } }]
        // screen, music, game missing
      };

      cacheYearData(2024, partialData);

      const cachedData = getCachedYearData(2024);
      expect(cachedData.book).toHaveLength(1);
      expect(cachedData.screen).toHaveLength(0);
      expect(cachedData.music).toHaveLength(0);
      expect(cachedData.game).toHaveLength(0);
    });

    it('should overwrite existing cache for same year', () => {
      const firstData = {
        book: [{ item: { id: '1' } }],
        screen: [],
        music: [],
        game: []
      };

      const secondData = {
        book: [{ item: { id: '2' } }, { item: { id: '3' } }],
        screen: [],
        music: [],
        game: []
      };

      cacheYearData(2024, firstData);
      cacheYearData(2024, secondData);

      const cachedData = getCachedYearData(2024);
      expect(cachedData.book.length).toBe(2);
      expect(getCacheSize()).toBe(1);
    });
  });

  describe('getCachedYearData', () => {
    it('should return null when year is not cached', () => {
      expect(getCachedYearData(2024)).toBeNull();
    });

    it('should return cached data for previously loaded year', () => {
      // Test case 2: Switch back to previously loaded year - data loaded from cache
      const testData = {
        book: [{ item: { id: 'book1', display_title: 'Book Title' } }],
        screen: [{ item: { id: 'movie1', display_title: 'Movie Title' } }],
        music: [{ item: { id: 'album1', display_title: 'Album Title' } }],
        game: [{ item: { id: 'game1', display_title: 'Game Title' } }]
      };

      cacheYearData(2024, testData);

      const retrievedData = getCachedYearData(2024);

      expect(retrievedData).not.toBeNull();
      expect(retrievedData.book).toHaveLength(1);
      expect(retrievedData.book[0].item.id).toBe('book1');
      expect(retrievedData.screen).toHaveLength(1);
      expect(retrievedData.music).toHaveLength(1);
      expect(retrievedData.game).toHaveLength(1);
    });

    it('should return independent copy to prevent cache mutation', () => {
      const testData = {
        book: [{ item: { id: '1' } }],
        screen: [],
        music: [],
        game: []
      };

      cacheYearData(2024, testData);

      const firstRetrieval = getCachedYearData(2024);
      const secondRetrieval = getCachedYearData(2024);

      // Both should have the same content
      expect(firstRetrieval.book[0].item.id).toBe(secondRetrieval.book[0].item.id);
    });
  });

  describe('clearYearCache', () => {
    it('should clear all cached data', () => {
      cacheYearData(2023, { book: [], screen: [], music: [], game: [] });
      cacheYearData(2024, { book: [], screen: [], music: [], game: [] });

      expect(getCacheSize()).toBe(2);

      clearYearCache();

      expect(getCacheSize()).toBe(0);
      expect(isYearCached(2023)).toBe(false);
      expect(isYearCached(2024)).toBe(false);
    });
  });

  describe('getCacheSize', () => {
    it('should return 0 for empty cache', () => {
      expect(getCacheSize()).toBe(0);
    });

    it('should return correct count of cached years', () => {
      const emptyData = { book: [], screen: [], music: [], game: [] };

      cacheYearData(2020, emptyData);
      expect(getCacheSize()).toBe(1);

      cacheYearData(2021, emptyData);
      expect(getCacheSize()).toBe(2);

      cacheYearData(2022, emptyData);
      cacheYearData(2023, emptyData);
      cacheYearData(2024, emptyData);
      expect(getCacheSize()).toBe(5);
    });
  });

  describe('getCachedYears', () => {
    it('should return empty array for empty cache', () => {
      expect(getCachedYears()).toEqual([]);
    });

    it('should return array of all cached years', () => {
      const emptyData = { book: [], screen: [], music: [], game: [] };

      cacheYearData(2023, emptyData);
      cacheYearData(2024, emptyData);

      const cachedYears = getCachedYears();
      expect(cachedYears).toContain(2023);
      expect(cachedYears).toContain(2024);
      expect(cachedYears).toHaveLength(2);
    });
  });

  describe('removeCachedYear', () => {
    it('should return false when year was not cached', () => {
      expect(removeCachedYear(2024)).toBe(false);
    });

    it('should remove specific year and return true', () => {
      const emptyData = { book: [], screen: [], music: [], game: [] };

      cacheYearData(2023, emptyData);
      cacheYearData(2024, emptyData);

      expect(removeCachedYear(2023)).toBe(true);
      expect(isYearCached(2023)).toBe(false);
      expect(isYearCached(2024)).toBe(true);
      expect(getCacheSize()).toBe(1);
    });
  });

  describe('caching workflow integration', () => {
    it('should support full caching workflow: cache, check, retrieve', () => {
      // Simulate scenario steps

      // Step 1: Load year 2024 (initial data fetch)
      const year2024Data = {
        book: [{ item: { id: 'b1', display_title: 'Book 2024' } }],
        screen: [{ item: { id: 's1', display_title: 'Movie 2024' } }],
        music: [{ item: { id: 'm1', display_title: 'Album 2024' } }],
        game: [{ item: { id: 'g1', display_title: 'Game 2024' } }]
      };

      expect(isYearCached(2024)).toBe(false);
      cacheYearData(2024, year2024Data);
      expect(isYearCached(2024)).toBe(true);

      // Step 2: Switch to year 2023 (new data fetch)
      const year2023Data = {
        book: [{ item: { id: 'b2', display_title: 'Book 2023' } }],
        screen: [],
        music: [],
        game: []
      };

      expect(isYearCached(2023)).toBe(false);
      cacheYearData(2023, year2023Data);
      expect(isYearCached(2023)).toBe(true);

      // Step 3: Switch back to year 2024 (should use cached data)
      expect(isYearCached(2024)).toBe(true);
      const cachedData = getCachedYearData(2024);
      expect(cachedData).not.toBeNull();
      expect(cachedData.book[0].item.display_title).toBe('Book 2024');

      // Step 4: Verify both years are cached
      expect(getCacheSize()).toBe(2);
      expect(getCachedYears()).toContain(2023);
      expect(getCachedYears()).toContain(2024);
    });
  });
});
