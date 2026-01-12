<script>
export default {
  name: 'CategorySection',
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
    showEmptyState() {
      return !this.isLoading && !this.hasItems;
    },
    showLoadingState() {
      return this.isLoading && !this.hasItems;
    }
  },
  methods: {
    handleTouchStart(index) {
      // Toggle the active state for touch devices
      if (this.activeItemIndex === index) {
        this.activeItemIndex = null;
      } else {
        this.activeItemIndex = index;
      }
    },
    isItemActive(index) {
      return this.activeItemIndex === index;
    }
  }
};
</script>

<template>
  <div class="category-section" :data-category="category">
    <h2 class="category-title">{{ title }}</h2>

    <!-- Loading state -->
    <div v-if="showLoadingState" class="grid-container loading-grid" data-testid="loading-grid">
      <div v-for="n in 8" :key="n" class="loading-item">
        <div class="loading-shimmer"></div>
      </div>
    </div>

    <!-- Empty state -->
    <div v-else-if="showEmptyState" class="empty-state" data-testid="empty-state">
      <p class="empty-message">Nothing recorded this year</p>
    </div>

    <!-- Grid with items -->
    <div v-else class="grid-container" data-testid="grid-container">
      <div
        v-for="(item, index) in items"
        :key="`${category}-${index}`"
        class="grid-item"
        :class="{ 'touch-active': isItemActive(index) }"
        data-testid="grid-item"
        @touchstart.passive="handleTouchStart(index)"
      >
        <img
          class="cover-img"
          :src="item.item.cover_image_url"
          :alt="item.item.display_title"
          loading="lazy"
        />
        <div class="item-title-overlay" data-testid="title-overlay">
          <span class="item-title">{{ item.item.display_title }}</span>
        </div>
      </div>
    </div>
  </div>
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
  aspect-ratio: 3/4;
  position: relative;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  border-radius: 8px;
  overflow: hidden;
}

.grid-item:hover {
  transform: scale(1.05);
  z-index: 10;
}

.cover-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5);
  transition: box-shadow 0.3s ease;
  background: rgba(0, 0, 0, 0.2);
}

.grid-item:hover .cover-img {
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.7);
}

.item-title-overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: linear-gradient(transparent, rgba(0, 0, 0, 0.8));
  padding: 2rem 0.5rem 0.5rem;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.grid-item:hover .item-title-overlay,
.grid-item.touch-active .item-title-overlay {
  opacity: 1;
}

/* Touch active state applies hover-like effects */
.grid-item.touch-active {
  transform: scale(1.05);
  z-index: 10;
}

.grid-item.touch-active .cover-img {
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.7);
}

.item-title {
  color: #fff;
  font-size: 0.85em;
  font-weight: 400;
  display: block;
  text-align: center;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-family: 'Space Grotesk', 'Helvetica Neue', 'SimHei', 'STHeiti';
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

  .item-title-overlay {
    opacity: 1;
    background: linear-gradient(transparent 30%, rgba(0, 0, 0, 0.8));
  }
}

@media (prefers-reduced-motion: reduce) {
  .grid-item:hover {
    transform: none;
  }

  .loading-shimmer {
    animation: none;
  }
}
</style>
