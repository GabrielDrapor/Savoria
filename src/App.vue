<script>
import YearSelector from './components/YearSelector.vue';
import YearNavigationButtons from './components/YearNavigationButtons.vue';
import YearNavigationHeader from './components/YearNavigationHeader.vue';
import CategorySection from './components/CategorySection.vue';
import {
  getYearFromUrlWithFallback,
  updateUrlWithYear,
  getCurrentYear
} from './utils/yearUrl.js';
import {
  isYearCached,
  getCachedYearData,
  cacheYearData
} from './utils/yearCache.js';

export default {
  components: {
    YearSelector,
    YearNavigationButtons,
    YearNavigationHeader,
    CategorySection
  },
  data() {
    return {
      selectedYear: getCurrentYear(),
      isTransitioning: false,
      categoryItems: {
        book: [],
        screen: [],
        music: [],
        game: []
      },
      categoryLoading: {
        book: true,
        screen: true,
        music: true,
        game: true
      },
      categoryError: {
        book: false,
        screen: false,
        music: false,
        game: false
      },
      categories: {
        book: "I read",
        screen: "I watched",
        music: "I listened",
        game: "I played",
      },
      fetchTimeout: 10000 // 10 second timeout for API calls
    };
  },
  methods: {
    initializeYearFromUrl() {
      this.selectedYear = getYearFromUrlWithFallback(window.location.search, window.location.pathname);
    },
    handlePopState() {
      this.selectedYear = getYearFromUrlWithFallback(window.location.search, window.location.pathname);
      this.reloadItems();
    },
    async fetchWithTimeout(url, timeout, retries = 3) {
      let lastError;
      for (let attempt = 1; attempt <= retries; attempt++) {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeout);
        try {
          const response = await fetch(url, { signal: controller.signal });
          clearTimeout(timeoutId);
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          return response;
        } catch (error) {
          clearTimeout(timeoutId);
          lastError = error;
          if (attempt < retries) {
            await new Promise((r) => setTimeout(r, 400 * attempt));
          }
        }
      }
      throw lastError;
    },
    async getCompletedItems(type) {
      const baseUrl = process.env.NODE_ENV === 'development'
        ? "http://localhost:9527"
        : "";

      try {
        const req = await this.fetchWithTimeout(
          baseUrl + `/api/complete/${type}/${this.selectedYear}`,
          this.fetchTimeout
        );
        const resp_json = await req.json();
        return { data: resp_json.data, error: false };
      } catch (error) {
        console.error(`Error fetching ${type}:`, error);
        return { data: [], error: true };
      }
    },
    async getScreenItems() {
      const baseUrl = process.env.NODE_ENV === 'development'
        ? "http://localhost:9527"
        : "";

      try {
        const req = await this.fetchWithTimeout(
          baseUrl + `/api/complete/screen/${this.selectedYear}`,
          this.fetchTimeout
        );
        const resp_json = await req.json();
        return { data: resp_json.data, error: false };
      } catch (error) {
        console.error('Error fetching screen:', error);
        return { data: [], error: true };
      }
    },
    async reloadItems() {
      // Check if data for this year is already cached
      if (isYearCached(this.selectedYear)) {
        const cachedData = getCachedYearData(this.selectedYear);
        this.categoryItems = {
          book: [...cachedData.book],
          screen: [...cachedData.screen],
          music: [...cachedData.music],
          game: [...cachedData.game]
        };
        this.categoryLoading = {
          book: false,
          screen: false,
          music: false,
          game: false
        };
        this.categoryError = {
          book: false,
          screen: false,
          music: false,
          game: false
        };
        return;
      }

      // Set all categories to loading state and reset errors
      this.categoryLoading = {
        book: true,
        screen: true,
        music: true,
        game: true
      };
      this.categoryError = {
        book: false,
        screen: false,
        music: false,
        game: false
      };
      this.categoryItems = {
        book: [],
        screen: [],
        music: [],
        game: []
      };
      await this.getAllItems();
    },
    async getAllItems() {
      // Reset items and set loading state
      this.categoryLoading = {
        book: true,
        screen: true,
        music: true,
        game: true
      };
      this.categoryError = {
        book: false,
        screen: false,
        music: false,
        game: false
      };
      this.categoryItems = {
        book: [],
        screen: [],
        music: [],
        game: []
      };

      const types = ['book', 'music', 'game'];
      for (let type of types) {
        const result = await this.getCompletedItems(type);
        this.categoryItems[type] = result.data;
        this.categoryError[type] = result.error;
        this.categoryLoading[type] = false;
      }

      const screenResult = await this.getScreenItems();
      this.categoryItems.screen = screenResult.data;
      this.categoryError.screen = screenResult.error;
      this.categoryLoading.screen = false;

      // Only cache data if there were no errors
      const hasAnyError = Object.values(this.categoryError).some(e => e);
      if (!hasAnyError) {
        cacheYearData(this.selectedYear, this.categoryItems);
      }
    },
    async retryCategory(category) {
      // Set loading state for this category
      this.categoryLoading[category] = true;
      this.categoryError[category] = false;

      let result;
      if (category === 'screen') {
        result = await this.getScreenItems();
      } else {
        result = await this.getCompletedItems(category);
      }

      this.categoryItems[category] = result.data;
      this.categoryError[category] = result.error;
      this.categoryLoading[category] = false;
    },
    onYearChange(year) {
      this.selectedYear = year;
      updateUrlWithYear(year);
      this.isTransitioning = true;
      this.reloadItems();
    },
    onTransitionEnd() {
      this.isTransitioning = false;
    }
  },
  mounted() {
    this.initializeYearFromUrl();
    this.getAllItems();
    window.addEventListener('popstate', this.handlePopState);
  },
  beforeUnmount() {
    window.removeEventListener('popstate', this.handlePopState);
  }
};
</script>

<template>
  <YearNavigationHeader
    :selected-year="selectedYear"
    @update:selected-year="onYearChange"
  />

  <Transition
    name="fade"
    mode="out-in"
    @after-enter="onTransitionEnd"
    @after-leave="onTransitionEnd"
  >
    <div
      class="gallery-container"
      data-testid="gallery-container"
      :key="selectedYear"
    >
      <CategorySection
        v-for="(items, category) in categoryItems"
        :key="category"
        :title="categories[category]"
        :items="items"
        :category="category"
        :is-loading="categoryLoading[category]"
        :is-error="categoryError[category]"
        @retry="retryCategory"
      />
    </div>
  </Transition>

  <footer class="site-footer">
    <a
      class="github-link"
      href="https://github.com/GabrielDrapor/Savoria"
      target="_blank"
      rel="noopener noreferrer"
      aria-label="View source on GitHub"
    >
      <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">
        <path fill="currentColor" d="M12 .5C5.73.5.5 5.73.5 12c0 5.08 3.29 9.39 7.86 10.91.57.1.78-.25.78-.55 0-.27-.01-.99-.02-1.95-3.2.7-3.87-1.54-3.87-1.54-.52-1.33-1.28-1.68-1.28-1.68-1.04-.71.08-.7.08-.7 1.15.08 1.76 1.18 1.76 1.18 1.03 1.76 2.7 1.25 3.36.96.1-.74.4-1.25.73-1.54-2.55-.29-5.24-1.27-5.24-5.67 0-1.25.45-2.28 1.18-3.08-.12-.29-.51-1.46.11-3.04 0 0 .96-.31 3.15 1.18.91-.25 1.89-.38 2.86-.38.97 0 1.95.13 2.86.38 2.18-1.49 3.14-1.18 3.14-1.18.62 1.58.23 2.75.11 3.04.73.8 1.18 1.83 1.18 3.08 0 4.41-2.69 5.38-5.25 5.66.41.36.78 1.06.78 2.14 0 1.54-.01 2.78-.01 3.16 0 .31.2.66.79.55C20.21 21.38 23.5 17.08 23.5 12 23.5 5.73 18.27.5 12 .5z"/>
      </svg>
    </a>
  </footer>
</template>

<style>
.gallery-container {
  display: flex;
  flex-direction: column;
  gap: 40px;
  padding: 20px 0;
  width: 100%;
}

.site-footer {
  display: flex;
  justify-content: center;
  padding: 3rem 1rem 2rem;
}

.github-link {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: #f3f3f3;
  opacity: 0.35;
  transition: opacity 0.2s ease;
  padding: 0.5rem;
}

.github-link:hover,
.github-link:focus-visible {
  opacity: 0.85;
}

.github-link:focus-visible {
  outline: 1px solid rgba(255, 255, 255, 0.4);
  outline-offset: 4px;
  border-radius: 2px;
}

@media only screen and (max-width: 768px) {
  .gallery-container {
    gap: 30px;
  }
}

/* Vue transition classes for fade effect (REQ-7) */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* Respect prefers-reduced-motion (NFR-6) */
@media (prefers-reduced-motion: reduce) {
  .fade-enter-active,
  .fade-leave-active {
    transition: none;
  }

  .fade-enter-from,
  .fade-leave-to {
    opacity: 1;
  }
}
</style>
