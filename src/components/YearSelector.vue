<script>
/**
 * YearSelector component for navigating between years.
 * Allows users to switch between years without URL manipulation (REQ-1, US-1).
 */
export default {
  name: 'YearSelector',
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
  data() {
    return {
      isOpen: false
    };
  },
  computed: {
    /**
     * Calculate the available year range from startYear to current year.
     * @returns {number[]} Array of years from startYear to current year
     */
    availableYears() {
      return this.getYearRange(this.startYear, new Date().getFullYear());
    }
  },
  methods: {
    /**
     * Generate an array of years from start to end (inclusive).
     * @param {number} start - Start year
     * @param {number} end - End year (current year)
     * @returns {number[]} Array of years
     */
    getYearRange(start, end) {
      const years = [];
      for (let year = start; year <= end; year++) {
        years.push(year);
      }
      return years;
    },
    toggleDropdown() {
      this.isOpen = !this.isOpen;
    },
    selectYear(year) {
      this.$emit('update:selectedYear', year);
      this.isOpen = false;
    },
    handleClickOutside(event) {
      const dropdown = this.$refs.dropdown;
      if (dropdown && !dropdown.contains(event.target)) {
        this.isOpen = false;
      }
    },
    handleKeydown(event) {
      if (event.key === 'Escape') {
        this.isOpen = false;
        this.$refs.trigger?.focus();
      }
    }
  },
  mounted() {
    document.addEventListener('click', this.handleClickOutside);
    document.addEventListener('keydown', this.handleKeydown);
  },
  beforeUnmount() {
    document.removeEventListener('click', this.handleClickOutside);
    document.removeEventListener('keydown', this.handleKeydown);
  }
};
</script>

<template>
  <div class="year-selector" ref="dropdown" data-testid="year-selector">
    <button
      ref="trigger"
      class="year-selector-trigger"
      :class="{ 'is-open': isOpen }"
      @click.stop="toggleDropdown"
      :aria-expanded="isOpen"
      aria-haspopup="listbox"
      data-testid="year-selector-trigger"
    >
      <span class="selected-year" data-testid="selected-year">{{ selectedYear }}</span>
      <span class="dropdown-arrow" :class="{ 'rotated': isOpen }">▼</span>
    </button>

    <ul
      v-show="isOpen"
      class="year-dropdown"
      role="listbox"
      :aria-label="'Select year'"
      data-testid="year-dropdown"
    >
      <li
        v-for="year in availableYears"
        :key="year"
        class="year-option"
        :class="{ 'selected': year === selectedYear }"
        role="option"
        :aria-selected="year === selectedYear"
        @click="selectYear(year)"
        :data-testid="`year-option-${year}`"
      >
        {{ year }}
      </li>
    </ul>
  </div>
</template>

<style scoped>
.year-selector {
  position: relative;
  display: inline-block;
  font-family: 'Space Grotesk', 'Helvetica Neue', 'SimHei', 'STHeiti';
}

.year-selector-trigger {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  color: #f3f3f3;
  font-size: 1.2em;
  font-weight: 400;
  cursor: pointer;
  transition: all 0.2s ease;
}

.year-selector-trigger:hover {
  background: rgba(255, 255, 255, 0.15);
  border-color: rgba(255, 255, 255, 0.3);
}

.year-selector-trigger.is-open {
  background: rgba(255, 255, 255, 0.2);
  border-color: rgba(255, 255, 255, 0.4);
}

.selected-year {
  font-weight: 700;
}

.dropdown-arrow {
  font-size: 0.7em;
  transition: transform 0.2s ease;
}

.dropdown-arrow.rotated {
  transform: rotate(180deg);
}

.year-dropdown {
  position: absolute;
  top: calc(100% + 4px);
  left: 0;
  min-width: 100%;
  max-height: 240px;
  overflow-y: auto;
  margin: 0;
  padding: 4px 0;
  background: rgba(15, 16, 51, 0.95);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);
  list-style: none;
  z-index: 100;
}

.year-dropdown::-webkit-scrollbar {
  width: 6px;
}

.year-dropdown::-webkit-scrollbar-track {
  background: transparent;
}

.year-dropdown::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.2);
  border-radius: 3px;
}

.year-option {
  padding: 10px 16px;
  color: #f3f3f3;
  cursor: pointer;
  transition: background 0.15s ease;
}

.year-option:hover {
  background: rgba(255, 255, 255, 0.1);
}

.year-option.selected {
  background: rgba(255, 255, 255, 0.15);
  font-weight: 700;
}

@media (max-width: 768px) {
  .year-selector-trigger {
    padding: 10px 16px;
    font-size: 1em;
    min-height: 44px; /* WCAG touch target minimum */
  }

  .year-dropdown {
    max-height: 200px;
  }

  .year-option {
    padding: 12px 16px;
    min-height: 44px; /* WCAG touch target minimum */
  }
}
</style>
