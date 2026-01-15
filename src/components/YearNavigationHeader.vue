<script>
/**
 * YearNavigationHeader component - Integrated header with year navigation.
 * Implements REQ-1, REQ-2, US-1 - Year navigation with integrated design.
 * Displays '← Year →' format with title text, eliminating duplicate year displays.
 */
export default {
  name: 'YearNavigationHeader',
  props: {
    selectedYear: {
      type: Number,
      required: true
    },
    startYear: {
      type: Number,
      default: 2020
    }
  },
  emits: ['update:selectedYear'],
  computed: {
    /**
     * Get the current year for boundary calculation.
     * @returns {number} Current year
     */
    currentYear() {
      return new Date().getFullYear();
    },
    /**
     * Check if we can navigate to the previous year.
     * @returns {boolean} True if previous year button should be enabled
     */
    canGoPrevious() {
      return this.selectedYear > this.startYear;
    },
    /**
     * Check if we can navigate to the next year.
     * @returns {boolean} True if next year button should be enabled
     */
    canGoNext() {
      return this.selectedYear < this.currentYear;
    },
    /**
     * Get the previous year value.
     * @returns {number} Previous year
     */
    previousYear() {
      return this.selectedYear - 1;
    },
    /**
     * Get the next year value.
     * @returns {number} Next year
     */
    nextYear() {
      return this.selectedYear + 1;
    }
  },
  methods: {
    /**
     * Navigate to the previous year.
     */
    goToPreviousYear() {
      if (this.canGoPrevious) {
        this.$emit('update:selectedYear', this.previousYear);
      }
    },
    /**
     * Navigate to the next year.
     */
    goToNextYear() {
      if (this.canGoNext) {
        this.$emit('update:selectedYear', this.nextYear);
      }
    },
    /**
     * Handle keyboard navigation for accessibility.
     * @param {KeyboardEvent} event
     * @param {string} direction - 'previous' or 'next'
     */
    handleKeydown(event, direction) {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        if (direction === 'previous') {
          this.goToPreviousYear();
        } else {
          this.goToNextYear();
        }
      }
    }
  }
};
</script>

<template>
  <header class="year-navigation-header" data-testid="year-navigation-header">
    <div class="header-content">
      <h1 class="page-title">
        <span class="title-prefix">In</span>
        <span class="year-navigation" data-testid="year-navigation-integrated">
          <button
            class="nav-arrow prev-arrow"
            :class="{ 'disabled': !canGoPrevious }"
            :disabled="!canGoPrevious"
            @click="goToPreviousYear"
            @keydown="handleKeydown($event, 'previous')"
            :aria-label="`Navigate to previous year ${previousYear}`"
            :aria-disabled="!canGoPrevious"
            data-testid="prev-year-button"
          >
            <span class="arrow-icon">←</span>
          </button>
          <span class="current-year" data-testid="current-year-display">
            {{ selectedYear }}
          </span>
          <button
            class="nav-arrow next-arrow"
            :class="{ 'disabled': !canGoNext }"
            :disabled="!canGoNext"
            @click="goToNextYear"
            @keydown="handleKeydown($event, 'next')"
            :aria-label="`Navigate to next year ${nextYear}`"
            :aria-disabled="!canGoNext"
            data-testid="next-year-button"
          >
            <span class="arrow-icon">→</span>
          </button>
        </span>
        <span class="title-suffix">,</span>
      </h1>
    </div>
  </header>
</template>

<style scoped>
.year-navigation-header {
  display: flex;
  justify-content: center;
  padding: 20px;
  position: relative;
  z-index: 10;
}

.header-content {
  text-align: center;
}

.page-title {
  color: #f3f3f3;
  font-size: 5.5em;
  font-weight: 300;
  margin: 2rem 0;
  font-family: 'Space Grotesk', 'Helvetica Neue', 'SimHei', 'STHeiti';
  letter-spacing: -0.03em;
  background: linear-gradient(to right, #fff, #c4c4ff);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-wrap: wrap;
  gap: 0.2em;
}

.title-prefix,
.title-suffix {
  background: inherit;
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
}

.year-navigation {
  display: inline-flex;
  align-items: center;
  gap: 0.15em;
  /* Reset gradient for interactive elements */
  background: none;
  -webkit-text-fill-color: initial;
}

.nav-arrow {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 1.2em;
  height: 1.2em;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  color: #f3f3f3;
  font-size: 0.5em;
  cursor: pointer;
  transition: all 0.2s ease;
  font-family: inherit;
  padding: 0;
}

.arrow-icon {
  line-height: 1;
  font-weight: 400;
}

.nav-arrow:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.2);
  border-color: rgba(255, 255, 255, 0.4);
  transform: scale(1.1);
}

.nav-arrow:focus {
  outline: 2px solid rgba(255, 255, 255, 0.6);
  outline-offset: 2px;
}

.nav-arrow:focus:not(:focus-visible) {
  outline: none;
}

.nav-arrow:focus-visible {
  outline: 2px solid rgba(255, 255, 255, 0.6);
  outline-offset: 2px;
}

.nav-arrow:disabled,
.nav-arrow.disabled {
  opacity: 0.3;
  cursor: not-allowed;
  background: rgba(255, 255, 255, 0.05);
  border-color: rgba(255, 255, 255, 0.1);
}

.current-year {
  font-size: 1em;
  font-weight: 500;
  color: #f3f3f3;
  min-width: 2.5em;
  text-align: center;
  background: linear-gradient(to right, #fff, #c4c4ff);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
}

@media (max-width: 768px) {
  .page-title {
    font-size: 3.5em;
    margin: 1.5rem 0;
  }

  .nav-arrow {
    width: 1.4em;
    height: 1.4em;
    font-size: 0.45em;
    min-width: 44px;
    min-height: 44px;
  }

  .year-navigation {
    gap: 0.1em;
  }
}

/* Respect prefers-reduced-motion (NFR-6) */
@media (prefers-reduced-motion: reduce) {
  .nav-arrow {
    transition: none;
  }

  .nav-arrow:hover:not(:disabled) {
    transform: none;
  }
}
</style>
