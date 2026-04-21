<script>
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
    currentYear() {
      return new Date().getFullYear();
    },
    canGoPrevious() {
      return this.selectedYear > this.startYear;
    },
    canGoNext() {
      return this.selectedYear < this.currentYear;
    },
    previousYear() {
      return this.selectedYear - 1;
    },
    nextYear() {
      return this.selectedYear + 1;
    }
  },
  methods: {
    goToPreviousYear() {
      if (this.canGoPrevious) {
        this.$emit('update:selectedYear', this.previousYear);
      }
    },
    goToNextYear() {
      if (this.canGoNext) {
        this.$emit('update:selectedYear', this.nextYear);
      }
    },
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
    <div class="header-content" data-testid="year-navigation-integrated">
      <button
        class="nav-arrow"
        :class="{ 'disabled': !canGoPrevious }"
        :disabled="!canGoPrevious"
        @click="goToPreviousYear"
        @keydown="handleKeydown($event, 'previous')"
        :aria-label="`Navigate to previous year ${previousYear}`"
        :aria-disabled="!canGoPrevious"
        data-testid="prev-year-button"
      >←</button>

      <h1 class="page-title"><span class="title-prefix">In</span> <span class="current-year" data-testid="current-year-display">{{ selectedYear }}</span><span class="title-suffix">,</span></h1>

      <button
        class="nav-arrow"
        :class="{ 'disabled': !canGoNext }"
        :disabled="!canGoNext"
        @click="goToNextYear"
        @keydown="handleKeydown($event, 'next')"
        :aria-label="`Navigate to next year ${nextYear}`"
        :aria-disabled="!canGoNext"
        data-testid="next-year-button"
      >→</button>
    </div>
  </header>
</template>

<style scoped>
.year-navigation-header {
  display: flex;
  justify-content: center;
  padding: 3rem 1.5rem 0.5rem;
  position: relative;
  z-index: 10;
}

.header-content {
  display: inline-flex;
  align-items: baseline;
  gap: 0.75rem;
}

.page-title {
  color: #f3f3f3;
  font-size: 3.5em;
  font-weight: 300;
  margin: 0;
  font-family: 'Space Grotesk', 'Helvetica Neue', 'SimHei', 'STHeiti';
  letter-spacing: -0.02em;
  opacity: 0.92;
  line-height: 1.1;
  white-space: nowrap;
}

.title-prefix,
.title-suffix,
.current-year {
  color: #f3f3f3;
}

.current-year {
  font-variant-numeric: tabular-nums;
}

.nav-arrow {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: none;
  color: #f3f3f3;
  opacity: 0.3;
  font-size: 1.6em;
  font-weight: 300;
  line-height: 1;
  cursor: pointer;
  padding: 0.25em 0.4em;
  font-family: inherit;
  transition: opacity 0.2s ease;
  align-self: center;
}

.nav-arrow:hover:not(:disabled) {
  opacity: 0.85;
}

.nav-arrow:focus-visible {
  outline: 1px solid rgba(255, 255, 255, 0.4);
  outline-offset: 4px;
  border-radius: 2px;
  opacity: 0.85;
}

.nav-arrow:focus:not(:focus-visible) {
  outline: none;
}

.nav-arrow:disabled,
.nav-arrow.disabled {
  opacity: 0.1;
  cursor: not-allowed;
}

@media (max-width: 768px) {
  .year-navigation-header {
    padding: 2rem 1rem 0.25rem;
  }

  .page-title {
    font-size: 2.25em;
  }

  .nav-arrow {
    font-size: 1.25em;
    min-width: 44px;
    min-height: 44px;
  }
}

@media (prefers-reduced-motion: reduce) {
  .nav-arrow {
    transition: none;
  }
}
</style>
