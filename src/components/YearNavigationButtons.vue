<script>
/**
 * YearNavigationButtons component for navigating between years with Previous/Next buttons.
 * Provides navigation between years with boundary behavior (REQ-1, REQ-2, US-1).
 * Displays '← Previous year' button, current year, and 'Next year →' button.
 */
export default {
  name: 'YearNavigationButtons',
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
  <div class="year-navigation-buttons" data-testid="year-navigation-buttons">
    <button
      class="nav-button prev-button"
      :class="{ 'disabled': !canGoPrevious }"
      :disabled="!canGoPrevious"
      @click="goToPreviousYear"
      @keydown="handleKeydown($event, 'previous')"
      :aria-label="`Navigate to previous year ${previousYear}`"
      :aria-disabled="!canGoPrevious"
      data-testid="prev-year-button"
    >
      ← Previous year
    </button>

    <span class="current-year" data-testid="current-year-display">
      {{ selectedYear }}
    </span>

    <button
      class="nav-button next-button"
      :class="{ 'disabled': !canGoNext }"
      :disabled="!canGoNext"
      @click="goToNextYear"
      @keydown="handleKeydown($event, 'next')"
      :aria-label="`Navigate to next year ${nextYear}`"
      :aria-disabled="!canGoNext"
      data-testid="next-year-button"
    >
      Next year →
    </button>
  </div>
</template>

<style scoped>
.year-navigation-buttons {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 24px;
  font-family: 'Space Grotesk', 'Helvetica Neue', 'SimHei', 'STHeiti';
}

.nav-button {
  display: flex;
  align-items: center;
  padding: 12px 20px;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  color: #f3f3f3;
  font-size: 1em;
  font-weight: 400;
  cursor: pointer;
  transition: all 0.2s ease;
  font-family: inherit;
}

.nav-button:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.15);
  border-color: rgba(255, 255, 255, 0.3);
}

.nav-button:focus {
  outline: 2px solid rgba(255, 255, 255, 0.6);
  outline-offset: 2px;
}

.nav-button:focus:not(:focus-visible) {
  outline: none;
}

.nav-button:focus-visible {
  outline: 2px solid rgba(255, 255, 255, 0.6);
  outline-offset: 2px;
}

.nav-button:disabled,
.nav-button.disabled {
  opacity: 0.4;
  cursor: not-allowed;
  background: rgba(255, 255, 255, 0.05);
  border-color: rgba(255, 255, 255, 0.1);
}

.current-year {
  font-size: 1.5em;
  font-weight: 700;
  color: #f3f3f3;
  min-width: 80px;
  text-align: center;
}

@media (max-width: 768px) {
  .year-navigation-buttons {
    gap: 12px;
    flex-wrap: wrap;
  }

  .nav-button {
    padding: 10px 14px;
    font-size: 0.9em;
    min-height: 44px; /* WCAG touch target minimum */
  }

  .current-year {
    font-size: 1.3em;
    width: 100%;
    order: -1;
    margin-bottom: 8px;
  }
}
</style>
