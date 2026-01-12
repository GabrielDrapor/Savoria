<script>
import YearSelector from './components/YearSelector.vue';
import YearNavigationButtons from './components/YearNavigationButtons.vue';
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
    async fetchWithTimeout(url, timeout) {
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
        throw error;
      }
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
  <div class="header-container">
    <YearNavigationButtons
      :selected-year="selectedYear"
      @update:selected-year="onYearChange"
    />
  </div>
  <h1 class="pageTitle">In {{ selectedYear }},</h1>

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
</template>

<style>
.header-container {
  display: flex;
  justify-content: center;
  padding: 20px;
  position: relative;
  z-index: 10;
}

.pageTitle {
  color: #f3f3f3;
  font-size: 5.5em;
  font-weight: 300;
  margin: 2rem 0 2rem;
  font-family: 'Space Grotesk', 'Helvetica Neue', 'SimHei', 'STHeiti';
  letter-spacing: -0.03em;
  background: linear-gradient(to right, #fff, #c4c4ff);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  position: relative;
  z-index: 2;
  text-align: center;
  width: 100%;
}

.gallery-container {
  display: flex;
  flex-direction: column;
  gap: 40px;
  padding: 20px 0;
  width: 100%;
}

@media only screen and (max-width: 768px) {
  .pageTitle {
    font-size: 3.5em;
    margin: 1.5rem 0 1.5rem;
  }

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
