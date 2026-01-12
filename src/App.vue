<script>
import {
  getYearFromUrlWithFallback,
  updateUrlWithYear,
  getAvailableYears,
  getCurrentYear
} from './utils/yearUrl.js';
import CategorySection from './components/CategorySection.vue';

export default {
  components: {
    CategorySection
  },
  data() {
    return {
      categoryItems: {
        book: [],
        screen: [],
        music: [],
        game: []
      },
      categories: {
        book: "I read",
        screen: "I watched",
        music: "I listened",
        game: "I played",
      },
      selectedYear: getCurrentYear(),
      availableYears: getAvailableYears()
    };
  },
  methods: {
    initializeYearFromUrl() {
      this.selectedYear = getYearFromUrlWithFallback(window.location.search);
    },
    onYearChange(event) {
      const year = parseInt(event.target.value, 10);
      this.selectedYear = year;
      updateUrlWithYear(year);
      this.reloadItems();
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
      this.categoryItems = {
        book: [],
        screen: [],
        music: [],
        game: []
      };
      await this.getAllItems();
    },
    async getAllItems() {
      const types = ['book', 'music', 'game'];
      for (let type of types) {
        const items = await this.getCompletedItems(type);
        this.categoryItems[type] = items;
      }

      const screenItems = await this.getScreenItems();
      this.categoryItems.screen = screenItems;
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
  <div class="yearSelectorContainer">
    <select
      data-testid="year-selector"
      class="yearSelector"
      :value="selectedYear"
      @change="onYearChange"
      aria-label="Select year"
    >
      <option v-for="year in availableYears" :key="year" :value="year">
        {{ year }}
      </option>
    </select>
  </div>
  <h1 class="pageTitle">In {{ selectedYear }},</h1>

  <div class="gallery-container" data-testid="gallery-container">
    <CategorySection
      v-for="(items, category) in categoryItems"
      :key="category"
      :title="categories[category]"
      :items="items"
      :category="category"
    />
  </div>
</template>

<style>
.yearSelectorContainer {
  display: flex;
  justify-content: center;
  margin: 20px 0 0 0;
  z-index: 10;
  position: relative;
}

.yearSelector {
  padding: 8px 24px 8px 16px;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 20px;
  color: #f3f3f3;
  font-family: 'Space Grotesk', 'Helvetica Neue', 'SimHei', 'STHeiti';
  font-size: 1em;
  cursor: pointer;
  transition: background 0.2s ease, border-color 0.2s ease;
  appearance: none;
  -webkit-appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23f3f3f3' d='M6 8L1 3h10z'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 12px center;
}

.yearSelector:hover {
  background-color: rgba(255, 255, 255, 0.2);
  border-color: rgba(255, 255, 255, 0.3);
}

.yearSelector:focus {
  outline: none;
  border-color: rgba(255, 255, 255, 0.5);
  box-shadow: 0 0 0 2px rgba(255, 255, 255, 0.1);
}

.yearSelector option {
  background: #1a1a2e;
  color: #f3f3f3;
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
</style>
