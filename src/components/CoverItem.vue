<script>
export default {
  name: 'CoverItem',
  props: {
    coverImageUrl: {
      type: String,
      default: ''
    },
    displayTitle: {
      type: String,
      default: 'Untitled'
    }
  },
  data() {
    return {
      imageError: false,
      touchActive: false
    };
  },
  computed: {
    showPlaceholder() {
      return !this.coverImageUrl || this.imageError;
    }
  },
  methods: {
    handleImageError() {
      this.imageError = true;
    },
    handleTouchStart() {
      this.touchActive = !this.touchActive;
      // Emit event so parent can deactivate other items
      this.$emit('touch-activate', this.touchActive);
    },
    deactivate() {
      this.touchActive = false;
    }
  },
  watch: {
    coverImageUrl() {
      this.imageError = false;
    }
  }
};
</script>

<template>
  <div
    class="cover-item"
    :class="{ 'touch-active': touchActive }"
    data-testid="cover-item"
    @touchstart="handleTouchStart"
  >
    <div class="cover-container" data-testid="cover-container">
      <!-- Placeholder for missing or failed images -->
      <div
        v-if="showPlaceholder"
        class="cover-placeholder"
        data-testid="cover-placeholder"
        :aria-label="displayTitle"
        title=""
      >
        <svg
          class="placeholder-icon"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" stroke-width="1.5"/>
          <circle cx="8.5" cy="8.5" r="1.5" fill="currentColor"/>
          <path d="M6 16L9 13L12 16L15 12L18 16" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </div>
      <!-- Actual cover image -->
      <img
        v-else
        class="cover-image"
        data-testid="cover-image"
        :src="coverImageUrl"
        :alt="displayTitle"
        title=""
        loading="lazy"
        @error="handleImageError"
      />
    </div>
  </div>
</template>

<style scoped>
.cover-item {
  aspect-ratio: 3 / 4;
  position: relative;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  border-radius: 8px;
  overflow: hidden;
}

.cover-item:hover {
  transform: scale(1.05);
  z-index: 10;
}

.cover-container {
  width: 100%;
  height: 100%;
  aspect-ratio: 3 / 4;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5);
  transition: box-shadow 0.3s ease;
  background: rgba(0, 0, 0, 0.2);
}

.cover-item:hover .cover-container {
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.7);
}

.cover-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.cover-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.05);
}

.placeholder-icon {
  width: 40%;
  height: 40%;
  color: rgba(255, 255, 255, 0.3);
}

.cover-item.touch-active {
  transform: scale(1.05);
  z-index: 10;
}

.cover-item.touch-active .cover-container {
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.7);
}

@media only screen and (max-width: 768px) {
  .cover-item:hover {
    transform: none;
  }
}

@media (prefers-reduced-motion: reduce) {
  .cover-item:hover {
    transform: none;
  }

  .cover-container {
    transition: none;
  }
}
</style>
