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
      this.categoryItems = {
        book: [],
        screen: [],
        music: [],
        game: []
      };
      await this.getAllItems();
    },
    async getAllItems() {
      // Reset items to trigger loading state
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
      }

      const screenItems = await this.getScreenItems();
      this.categoryItems.screen = screenItems;
    },
    onYearChange(year) {
      this.selectedYear = year;
      updateUrlWithYear(year);
      this.reloadItems();
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
</style>
