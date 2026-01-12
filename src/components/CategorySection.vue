<script>
import CoverItem from './CoverItem.vue';

export default {
  name: 'CategorySection',
  components: {
    CoverItem
  },
  props: {
    title: {
      type: String,
      required: true
    },
    items: {
      type: Array,
      default: () => []
    },
    category: {
      type: String,
      required: true
    },
    isLoading: {
      type: Boolean,
      default: false
    },
    isError: {
      type: Boolean,
      default: false
    },
    errorMessage: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      activeItemIndex: null
    };
  },
  computed: {
    hasItems() {
      return this.items && this.items.length > 0;
    },
    showErrorState() {
      return !this.isLoading && this.isError;
    },
    showEmptyState() {
      return !this.isLoading && !this.isError && !this.hasItems;
    },
    showLoadingState() {
      return this.isLoading && !this.hasItems;
    }
  },
  methods: {
    handleTouchActivate(index, isActive) {
      if (isActive) {
        // Deactivate previously active item
        if (this.activeItemIndex !== null && this.activeItemIndex !== index) {
          const prevItem = this.$refs[`coverItem-${this.activeItemIndex}`];
          if (prevItem && prevItem[0]) {
            prevItem[0].deactivate();
          }
        }
        this.activeItemIndex = index;
      } else {
        if (this.activeItemIndex === index) {
          this.activeItemIndex = null;
        }
      }
    },
    handleRetry() {
      this.$emit('retry', this.category);
    }
  }
};
</script>

<template>
  <section class="category-section" :data-category="category" :aria-labelledby="`${category}-title`">
    <h2 :id="`${category}-title`" class="category-title">{{ title }}</h2>

    <!-- Loading state -->
    <div v-if="showLoadingState" class="grid-container loading-grid" data-testid="loading-grid">
      <div v-for="n in 8" :key="n" class="loading-item">
        <div class="loading-shimmer"></div>
      </div>
    </div>

    <!-- Error state -->
    <div v-else-if="showErrorState" class="error-state" data-testid="error-state">
      <p class="error-message">Something went wrong. Please try again.</p>
      <button
        class="retry-button"
        data-testid="retry-button"
        @click="handleRetry"
        aria-label="Retry loading content"
      >
        Try Again
      </button>
    </div>

    <!-- Empty state -->
    <div v-else-if="showEmptyState" class="empty-state" data-testid="empty-state">
      <p class="empty-message">Nothing recorded this year</p>
    </div>

    <!-- Grid with items -->
    <div v-else class="grid-container" :data-testid="'items-grid-' + category">
      <CoverItem
        v-for="(item, index) in items"
        :key="`${category}-${index}`"
        :ref="`coverItem-${index}`"
        :cover-image-url="item.item.cover_image_url"
        :display-title="item.item.display_title"
        class="grid-item"
        @touch-activate="(isActive) => handleTouchActivate(index, isActive)"
      />
    </div>
  </section>
</template>

<style scoped>
.category-section {
  position: relative;
  padding: 2rem 0;
}

.category-title {
  color: #f3f3f3;
  font-size: 2.5em;
  font-weight: 300;
  margin-bottom: 1.5rem;
  opacity: 0.8;
  text-align: center;
  width: 100%;
  position: relative;
  padding: 0;
  font-family: 'Space Grotesk', 'Helvetica Neue', 'SimHei', 'STHeiti';
}

.grid-container {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: 20px;
  width: 100%;
  max-width: 100%;
}

.grid-item {
  /* CoverItem component handles internal styling */
}

/* Empty state */
.empty-state {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 150px;
  width: 100%;
}

.empty-message {
  color: rgba(255, 255, 255, 0.5);
  font-size: 1.1em;
  font-weight: 300;
  text-align: center;
  font-family: 'Space Grotesk', 'Helvetica Neue', 'SimHei', 'STHeiti';
  margin: 0;
  padding: 2rem;
}

/* Error state */
.error-state {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  min-height: 150px;
  width: 100%;
  gap: 1rem;
}

.error-message {
  color: rgba(255, 180, 180, 0.8);
  font-size: 1.1em;
  font-weight: 300;
  text-align: center;
  font-family: 'Space Grotesk', 'Helvetica Neue', 'SimHei', 'STHeiti';
  margin: 0;
  padding: 1rem 2rem;
}

.retry-button {
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: rgba(255, 255, 255, 0.8);
  padding: 0.75rem 1.5rem;
  font-size: 0.95em;
  font-weight: 400;
  font-family: 'Space Grotesk', 'Helvetica Neue', 'SimHei', 'STHeiti';
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.retry-button:hover {
  background: rgba(255, 255, 255, 0.15);
  border-color: rgba(255, 255, 255, 0.3);
  color: rgba(255, 255, 255, 0.95);
}

.retry-button:focus {
  outline: 2px solid rgba(255, 255, 255, 0.5);
  outline-offset: 2px;
}

.retry-button:active {
  background: rgba(255, 255, 255, 0.2);
  transform: scale(0.98);
}

/* Loading state */
.loading-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: 20px;
}

.loading-item {
  aspect-ratio: 3/4;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  position: relative;
  overflow: hidden;
}

.loading-shimmer {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(
    90deg,
    rgba(255, 255, 255, 0) 0%,
    rgba(255, 255, 255, 0.05) 50%,
    rgba(255, 255, 255, 0) 100%
  );
  animation: shimmer 2s infinite;
}

@keyframes shimmer {
  0% {
    transform: translateX(-100%);
  }
  100% {
    transform: translateX(100%);
  }
}

/* Responsive breakpoints */
/* Desktop: 5-6 columns on viewport > 1024px (NFR-2, US-6) */
@media only screen and (min-width: 1025px) {
  .grid-container {
    grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
    gap: 20px;
  }
}

/* Tablet: 3-4 columns on viewport 768px-1024px (NFR-2, US-6) */
@media only screen and (min-width: 769px) and (max-width: 1024px) {
  .grid-container {
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
    gap: 16px;
  }
}

/* Mobile: 2-3 columns on viewport < 768px (NFR-2, US-6) */
@media only screen and (max-width: 768px) {
  .category-title {
    font-size: 2em;
    margin-bottom: 1.2rem;
  }

  .grid-container {
    grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
    gap: 12px;
  }
}

@media (prefers-reduced-motion: reduce) {
  .loading-shimmer {
    animation: none;
  }
}
</style>
