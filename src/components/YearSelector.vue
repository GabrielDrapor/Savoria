<script>
/**
 * YearSelector component for navigating between years.
 * Allows users to switch between years without URL manipulation (REQ-1, US-1).
 * Supports keyboard navigation (NFR-3, NFR-4, US-7).
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
      isOpen: false,
      focusedIndex: -1
    };
  },
  computed: {
    /**
     * Calculate the available year range from startYear to current year.
     * @returns {number[]} Array of years from startYear to current year
     */
    availableYears() {
      return this.getYearRange(this.startYear, new Date().getFullYear());
    },
    /**
     * Get the currently focused year based on focusedIndex.
     * @returns {number|null} The focused year or null if none
     */
    focusedYear() {
      return this.focusedIndex >= 0 ? this.availableYears[this.focusedIndex] : null;
    }
  },
  watch: {
    isOpen(newVal) {
      if (newVal) {
        // When opening, focus on currently selected year
        const selectedIndex = this.availableYears.indexOf(this.selectedYear);
        this.focusedIndex = selectedIndex >= 0 ? selectedIndex : 0;
        this.$nextTick(() => {
          this.scrollToFocusedOption();
        });
      } else {
        this.focusedIndex = -1;
      }
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
    openDropdown() {
      if (!this.isOpen) {
        this.isOpen = true;
      }
    },
    closeDropdown() {
      if (this.isOpen) {
        this.isOpen = false;
        this.$refs.trigger?.focus();
      }
    },
    selectYear(year) {
      this.$emit('update:selectedYear', year);
      this.isOpen = false;
      this.$refs.trigger?.focus();
    },
    selectFocusedYear() {
      if (this.focusedIndex >= 0 && this.focusedIndex < this.availableYears.length) {
        this.selectYear(this.availableYears[this.focusedIndex]);
      }
    },
    handleClickOutside(event) {
      const dropdown = this.$refs.dropdown;
      if (dropdown && !dropdown.contains(event.target)) {
        this.isOpen = false;
      }
    },
    /**
     * Handle keyboard events on the trigger button (combobox).
     * @param {KeyboardEvent} event
     */
    handleTriggerKeydown(event) {
      switch (event.key) {
        case 'Enter':
        case ' ':
          event.preventDefault();
          if (this.isOpen) {
            this.selectFocusedYear();
          } else {
            this.openDropdown();
          }
          break;
        case 'ArrowDown':
          event.preventDefault();
          if (!this.isOpen) {
            this.openDropdown();
          } else {
            this.moveFocus(1);
          }
          break;
        case 'ArrowUp':
          event.preventDefault();
          if (!this.isOpen) {
            this.openDropdown();
          } else {
            this.moveFocus(-1);
          }
          break;
        case 'Escape':
          if (this.isOpen) {
            event.preventDefault();
            this.closeDropdown();
          }
          break;
        case 'Home':
          if (this.isOpen) {
            event.preventDefault();
            this.focusedIndex = 0;
            this.scrollToFocusedOption();
          }
          break;
        case 'End':
          if (this.isOpen) {
            event.preventDefault();
            this.focusedIndex = this.availableYears.length - 1;
            this.scrollToFocusedOption();
          }
          break;
        case 'Tab':
          // Close dropdown on Tab to allow normal tab navigation
          if (this.isOpen) {
            this.isOpen = false;
          }
          break;
      }
    },
    /**
     * Handle global keydown events (for Escape when dropdown is open).
     * @param {KeyboardEvent} event
     */
    handleGlobalKeydown(event) {
      if (event.key === 'Escape' && this.isOpen) {
        this.closeDropdown();
      }
    },
    /**
     * Move focus up or down in the dropdown list.
     * @param {number} direction - 1 for down, -1 for up
     */
    moveFocus(direction) {
      const newIndex = this.focusedIndex + direction;
      if (newIndex >= 0 && newIndex < this.availableYears.length) {
        this.focusedIndex = newIndex;
        this.scrollToFocusedOption();
      }
    },
    /**
     * Scroll the focused option into view within the dropdown.
     */
    scrollToFocusedOption() {
      this.$nextTick(() => {
        const focusedOption = this.$refs[`option-${this.focusedIndex}`]?.[0];
        if (focusedOption && typeof focusedOption.scrollIntoView === 'function') {
          focusedOption.scrollIntoView({ block: 'nearest' });
        }
      });
    },
    /**
     * Handle mouse enter on year option to update focus.
     * @param {number} index - Index of the hovered option
     */
    handleOptionMouseEnter(index) {
      this.focusedIndex = index;
    }
  },
  mounted() {
    document.addEventListener('click', this.handleClickOutside);
    document.addEventListener('keydown', this.handleGlobalKeydown);
  },
  beforeUnmount() {
    document.removeEventListener('click', this.handleClickOutside);
    document.removeEventListener('keydown', this.handleGlobalKeydown);
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
      @keydown="handleTriggerKeydown"
      role="combobox"
      :aria-expanded="isOpen"
      aria-haspopup="listbox"
      :aria-activedescendant="focusedYear ? `year-option-id-${focusedYear}` : undefined"
      aria-controls="year-listbox"
      data-testid="year-selector-trigger"
    >
      <span class="selected-year" data-testid="selected-year">{{ selectedYear }}</span>
      <span class="dropdown-arrow" :class="{ 'rotated': isOpen }" aria-hidden="true">▼</span>
    </button>

    <ul
      v-show="isOpen"
      id="year-listbox"
      class="year-dropdown"
      role="listbox"
      aria-label="Select year"
      data-testid="year-dropdown"
    >
      <li
        v-for="(year, index) in availableYears"
        :key="year"
        :ref="`option-${index}`"
        :id="`year-option-id-${year}`"
        class="year-option"
        :class="{
          'selected': year === selectedYear,
          'focused': index === focusedIndex
        }"
        role="option"
        :aria-selected="year === selectedYear"
        @click="selectYear(year)"
        @mouseenter="handleOptionMouseEnter(index)"
        :data-testid="`year-option-${year}`"
        :tabindex="-1"
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

.year-option:hover,
.year-option.focused {
  background: rgba(255, 255, 255, 0.1);
}

.year-option.focused {
  outline: 2px solid rgba(255, 255, 255, 0.5);
  outline-offset: -2px;
}

.year-option.selected {
  background: rgba(255, 255, 255, 0.15);
  font-weight: 700;
}

/* Visible focus indicator for trigger button */
.year-selector-trigger:focus {
  outline: 2px solid rgba(255, 255, 255, 0.6);
  outline-offset: 2px;
}

.year-selector-trigger:focus:not(:focus-visible) {
  outline: none;
}

.year-selector-trigger:focus-visible {
  outline: 2px solid rgba(255, 255, 255, 0.6);
  outline-offset: 2px;
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
