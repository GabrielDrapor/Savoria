<script>
import YearSelector from './components/YearSelector.vue';
import CategorySection from './components/CategorySection.vue';
import {
  getYearFromUrlWithFallback,
  updateUrlWithYear,
  getCurrentYear
} from './utils/yearUrl.js';

export default {
  components: {
    YearSelector,
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
      categories: {
        book: "I read",
        screen: "I watched",
        music: "I listened",
        game: "I played",
      }
    };
  },
  methods: {
    initializeYearFromUrl() {
      this.selectedYear = getYearFromUrlWithFallback(window.location.search);
    },
    handlePopState() {
      this.selectedYear = getYearFromUrlWithFallback(window.location.search);
      this.reloadItems();
    },
    async getCompletedItems(type) {
      const baseUrl = process.env.NODE_ENV === 'development'
        ? "http://localhost:9527"
        : "";
      const req = await fetch(baseUrl + `/api/complete/${type}/${this.selectedYear}`);
      const resp_json = await req.json();
      return resp_json.data;
    },
    async getScreenItems() {
      const baseUrl = process.env.NODE_ENV === 'development'
        ? "http://localhost:9527"
        : "";
      const req = await fetch(baseUrl + `/api/complete/screen/${this.selectedYear}`);
      const resp_json = await req.json();
      return resp_json.data;
    },
    async reloadItems() {
      // Set all categories to loading state
      this.categoryLoading = {
        book: true,
        screen: true,
        music: true,
        game: true
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
      this.categoryItems = {
        book: [],
        screen: [],
        music: [],
        game: []
      };

      const types = ['book', 'music', 'game'];
      for (let type of types) {
        const items = await this.getCompletedItems(type);
        this.categoryItems[type] = items;
        this.categoryLoading[type] = false;
      }

      const screenItems = await this.getScreenItems();
      this.categoryItems.screen = screenItems;
      this.categoryLoading.screen = false;
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
    <YearSelector
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
