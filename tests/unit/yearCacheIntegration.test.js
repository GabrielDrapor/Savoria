import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';
import App from '@/App.vue';
import { clearYearCache, isYearCached, getCachedYearData } from '@/utils/yearCache.js';

// Mock the fetch API
global.fetch = vi.fn();

// Mock yearUrl utilities
vi.mock('@/utils/yearUrl.js', async () => {
  const actual = await vi.importActual('@/utils/yearUrl.js');
  return {
    ...actual,
    updateUrlWithYear: vi.fn(),
    getYearFromUrlWithFallback: vi.fn(() => 2024)
  };
});

describe('App.vue caching integration', () => {
  // Track fetch calls for verification
  let fetchCallCount;

  const mockApiResponse = (year) => ({
    ok: true,
    json: () => Promise.resolve({
      data: [
        {
          item: {
            id: `item-${year}`,
            display_title: `Item from ${year}`,
            cover_image_url: `https://example.com/${year}.jpg`
          },
          created_time: `${year}-06-15T10:30:00Z`
        }
      ]
    })
  });

  beforeEach(() => {
    // Clear cache before each test
    clearYearCache();
    fetchCallCount = 0;

    // Reset and setup fetch mock
    global.fetch.mockReset();
    global.fetch.mockImplementation((url) => {
      fetchCallCount++;
      const year = url.match(/\/(\d{4})$/)?.[1] || '2024';
      return Promise.resolve(mockApiResponse(year));
    });

    // Mock window.location.search
    Object.defineProperty(window, 'location', {
      value: { search: '?year=2024', pathname: '/' },
      writable: true
    });

    // Mock history.pushState
    window.history.pushState = vi.fn();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    clearYearCache();
  });

  describe('Test Case 1: Load year 2024 data - data stored in cache', () => {
    it('should cache data after initial fetch', async () => {
      const wrapper = mount(App, {
        global: {
          stubs: {
            YearSelector: true,
            CategorySection: true
          }
        }
      });

      // Wait for all API calls to complete
      await flushPromises();

      // Verify data is cached
      expect(isYearCached(2024)).toBe(true);

      const cachedData = getCachedYearData(2024);
      expect(cachedData).not.toBeNull();
      expect(cachedData.book).toBeDefined();
      expect(cachedData.screen).toBeDefined();
      expect(cachedData.music).toBeDefined();
      expect(cachedData.game).toBeDefined();

      wrapper.unmount();
    });
  });

  describe('Test Case 2: Switch back to previously loaded year - no API call', () => {
    it('should use cached data when switching back to previously loaded year', async () => {
      const wrapper = mount(App, {
        global: {
          stubs: {
            YearSelector: true,
            CategorySection: true
          }
        }
      });

      // Wait for initial load
      await flushPromises();

      // Record initial fetch count (should be 4: book, music, game, screen)
      const initialFetchCount = fetchCallCount;
      expect(initialFetchCount).toBe(4);

      // Clear fetch count for next operations
      fetchCallCount = 0;

      // Simulate switching to 2023
      wrapper.vm.selectedYear = 2023;
      await wrapper.vm.reloadItems();
      await flushPromises();

      // Should have made 4 new API calls for 2023
      expect(fetchCallCount).toBe(4);
      expect(isYearCached(2023)).toBe(true);

      // Clear fetch count again
      fetchCallCount = 0;

      // Switch back to 2024 (should use cache)
      wrapper.vm.selectedYear = 2024;
      await wrapper.vm.reloadItems();
      await flushPromises();

      // No API calls should be made - data from cache
      expect(fetchCallCount).toBe(0);

      wrapper.unmount();
    });

    it('should still display correct data from cache', async () => {
      const wrapper = mount(App, {
        global: {
          stubs: {
            YearSelector: true,
            CategorySection: true
          }
        }
      });

      // Wait for initial load
      await flushPromises();

      // Verify 2024 data is cached and correct
      const cached2024 = getCachedYearData(2024);
      expect(cached2024.book[0].item.display_title).toContain('2024');

      // Switch to 2023
      wrapper.vm.selectedYear = 2023;
      await wrapper.vm.reloadItems();
      await flushPromises();

      // Switch back to 2024
      wrapper.vm.selectedYear = 2024;
      await wrapper.vm.reloadItems();
      await flushPromises();

      // Verify component data matches cached data
      expect(wrapper.vm.categoryItems.book[0].item.display_title).toContain('2024');

      wrapper.unmount();
    });
  });

  describe('Test Case 3: Cache check returns true for already fetched year', () => {
    it('should correctly identify cached vs non-cached years', async () => {
      // Before any mounting, nothing should be cached
      expect(isYearCached(2024)).toBe(false);
      expect(isYearCached(2023)).toBe(false);

      const wrapper = mount(App, {
        global: {
          stubs: {
            YearSelector: true,
            CategorySection: true
          }
        }
      });

      // Wait for initial load of 2024
      await flushPromises();

      // 2024 should now be cached, 2023 should not
      expect(isYearCached(2024)).toBe(true);
      expect(isYearCached(2023)).toBe(false);

      // Load 2023
      wrapper.vm.selectedYear = 2023;
      await wrapper.vm.reloadItems();
      await flushPromises();

      // Both years should now be cached
      expect(isYearCached(2024)).toBe(true);
      expect(isYearCached(2023)).toBe(true);

      wrapper.unmount();
    });
  });

  describe('Loading state behavior with cache', () => {
    it('should immediately set loading to false when using cached data', async () => {
      const wrapper = mount(App, {
        global: {
          stubs: {
            YearSelector: true,
            CategorySection: true
          }
        }
      });

      // Wait for initial load
      await flushPromises();

      // All loading states should be false
      expect(wrapper.vm.categoryLoading.book).toBe(false);
      expect(wrapper.vm.categoryLoading.screen).toBe(false);
      expect(wrapper.vm.categoryLoading.music).toBe(false);
      expect(wrapper.vm.categoryLoading.game).toBe(false);

      // Load 2023 (will fetch from API)
      wrapper.vm.selectedYear = 2023;
      await wrapper.vm.reloadItems();
      await flushPromises();

      // Switch back to 2024 (from cache)
      wrapper.vm.selectedYear = 2024;

      // Call reloadItems - with cache, it should return immediately
      const reloadPromise = wrapper.vm.reloadItems();

      // Loading should already be set to false (cache hit is synchronous)
      expect(wrapper.vm.categoryLoading.book).toBe(false);
      expect(wrapper.vm.categoryLoading.screen).toBe(false);
      expect(wrapper.vm.categoryLoading.music).toBe(false);
      expect(wrapper.vm.categoryLoading.game).toBe(false);

      await reloadPromise;

      wrapper.unmount();
    });
  });

  describe('Multiple year switching', () => {
    it('should cache all visited years', async () => {
      const wrapper = mount(App, {
        global: {
          stubs: {
            YearSelector: true,
            CategorySection: true
          }
        }
      });

      // Wait for initial load (2024)
      await flushPromises();
      expect(isYearCached(2024)).toBe(true);

      // Visit 2023
      wrapper.vm.selectedYear = 2023;
      await wrapper.vm.reloadItems();
      await flushPromises();
      expect(isYearCached(2023)).toBe(true);

      // Visit 2022
      wrapper.vm.selectedYear = 2022;
      await wrapper.vm.reloadItems();
      await flushPromises();
      expect(isYearCached(2022)).toBe(true);

      // All three years should be cached
      expect(isYearCached(2024)).toBe(true);
      expect(isYearCached(2023)).toBe(true);
      expect(isYearCached(2022)).toBe(true);

      wrapper.unmount();
    });

    it('should not re-fetch any previously visited year', async () => {
      const wrapper = mount(App, {
        global: {
          stubs: {
            YearSelector: true,
            CategorySection: true
          }
        }
      });

      // Initial load (4 fetches for 2024)
      await flushPromises();
      expect(fetchCallCount).toBe(4);

      // Visit 2023 (4 more fetches)
      fetchCallCount = 0;
      wrapper.vm.selectedYear = 2023;
      await wrapper.vm.reloadItems();
      await flushPromises();
      expect(fetchCallCount).toBe(4);

      // Visit 2022 (4 more fetches)
      fetchCallCount = 0;
      wrapper.vm.selectedYear = 2022;
      await wrapper.vm.reloadItems();
      await flushPromises();
      expect(fetchCallCount).toBe(4);

      // Go back to 2024 (no fetches)
      fetchCallCount = 0;
      wrapper.vm.selectedYear = 2024;
      await wrapper.vm.reloadItems();
      await flushPromises();
      expect(fetchCallCount).toBe(0);

      // Go to 2023 (no fetches)
      fetchCallCount = 0;
      wrapper.vm.selectedYear = 2023;
      await wrapper.vm.reloadItems();
      await flushPromises();
      expect(fetchCallCount).toBe(0);

      // Go to 2022 (no fetches)
      fetchCallCount = 0;
      wrapper.vm.selectedYear = 2022;
      await wrapper.vm.reloadItems();
      await flushPromises();
      expect(fetchCallCount).toBe(0);

      wrapper.unmount();
    });
  });
});
