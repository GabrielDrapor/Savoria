import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { mount } from '@vue/test-utils';
import YearSelector from '../../src/components/YearSelector.vue';

describe('YearSelector', () => {
  let wrapper;

  beforeEach(() => {
    // Mock current year as 2026
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-01-12'));
  });

  afterEach(() => {
    vi.useRealTimers();
    if (wrapper) {
      wrapper.unmount();
    }
  });

  describe('rendering', () => {
    it('displays currently selected year with visual indicator', () => {
      wrapper = mount(YearSelector, {
        props: {
          selectedYear: 2026
        }
      });

      const selectedYear = wrapper.find('[data-testid="selected-year"]');
      expect(selectedYear.exists()).toBe(true);
      expect(selectedYear.text()).toBe('2026');
    });

    it('renders with default startYear of 2020', () => {
      wrapper = mount(YearSelector, {
        props: {
          selectedYear: 2026
        }
      });

      expect(wrapper.vm.startYear).toBe(2020);
    });

    it('uses custom startYear prop when provided', () => {
      wrapper = mount(YearSelector, {
        props: {
          selectedYear: 2026,
          startYear: 2022
        }
      });

      expect(wrapper.vm.startYear).toBe(2022);
    });

    it('has dropdown arrow indicator', () => {
      wrapper = mount(YearSelector, {
        props: {
          selectedYear: 2026
        }
      });

      const arrow = wrapper.find('.dropdown-arrow');
      expect(arrow.exists()).toBe(true);
      expect(arrow.text()).toContain('▼');
    });
  });

  describe('dropdown behavior', () => {
    it('dropdown is closed by default', () => {
      wrapper = mount(YearSelector, {
        props: {
          selectedYear: 2026
        }
      });

      // Check internal state instead of DOM visibility (v-show doesn't work well in happy-dom)
      expect(wrapper.vm.isOpen).toBe(false);
    });

    it('opens dropdown when trigger is clicked', async () => {
      wrapper = mount(YearSelector, {
        props: {
          selectedYear: 2026
        }
      });

      const trigger = wrapper.find('[data-testid="year-selector-trigger"]');
      await trigger.trigger('click');

      expect(wrapper.vm.isOpen).toBe(true);
    });

    it('closes dropdown when clicking on a year option', async () => {
      wrapper = mount(YearSelector, {
        props: {
          selectedYear: 2026
        }
      });

      // Open dropdown
      const trigger = wrapper.find('[data-testid="year-selector-trigger"]');
      await trigger.trigger('click');
      expect(wrapper.vm.isOpen).toBe(true);

      // Click on year 2023
      const yearOption = wrapper.find('[data-testid="year-option-2023"]');
      await yearOption.trigger('click');

      expect(wrapper.vm.isOpen).toBe(false);
    });
  });

  describe('year range calculation', () => {
    it('computes availableYears from 2020 to current year (2026)', () => {
      wrapper = mount(YearSelector, {
        props: {
          selectedYear: 2026
        }
      });

      expect(wrapper.vm.availableYears).toEqual([2020, 2021, 2022, 2023, 2024, 2025, 2026]);
    });

    it('computes availableYears with custom startYear', () => {
      wrapper = mount(YearSelector, {
        props: {
          selectedYear: 2026,
          startYear: 2023
        }
      });

      expect(wrapper.vm.availableYears).toEqual([2023, 2024, 2025, 2026]);
    });

    it('getYearRange method returns correct array', () => {
      wrapper = mount(YearSelector, {
        props: {
          selectedYear: 2026
        }
      });

      const result = wrapper.vm.getYearRange(2020, 2026);
      expect(result).toEqual([2020, 2021, 2022, 2023, 2024, 2025, 2026]);
    });
  });

  describe('year selection', () => {
    it('displays all available years in dropdown', async () => {
      wrapper = mount(YearSelector, {
        props: {
          selectedYear: 2026
        }
      });

      // Open dropdown
      const trigger = wrapper.find('[data-testid="year-selector-trigger"]');
      await trigger.trigger('click');

      const yearOptions = wrapper.findAll('.year-option');
      expect(yearOptions.length).toBe(7); // 2020-2026

      const years = yearOptions.map(opt => opt.text());
      expect(years).toContain('2020');
      expect(years).toContain('2023');
      expect(years).toContain('2026');
    });

    it('emits update:selectedYear event when year is selected', async () => {
      wrapper = mount(YearSelector, {
        props: {
          selectedYear: 2026
        }
      });

      // Open dropdown
      const trigger = wrapper.find('[data-testid="year-selector-trigger"]');
      await trigger.trigger('click');

      // Select year 2023
      const yearOption = wrapper.find('[data-testid="year-option-2023"]');
      await yearOption.trigger('click');

      expect(wrapper.emitted('update:selectedYear')).toBeTruthy();
      expect(wrapper.emitted('update:selectedYear')[0]).toEqual([2023]);
    });

    it('highlights the currently selected year', async () => {
      wrapper = mount(YearSelector, {
        props: {
          selectedYear: 2023
        }
      });

      // Open dropdown
      const trigger = wrapper.find('[data-testid="year-selector-trigger"]');
      await trigger.trigger('click');

      const selectedOption = wrapper.find('[data-testid="year-option-2023"]');
      expect(selectedOption.classes()).toContain('selected');
    });
  });

  describe('accessibility', () => {
    it('has correct aria attributes on trigger button', () => {
      wrapper = mount(YearSelector, {
        props: {
          selectedYear: 2026
        }
      });

      const trigger = wrapper.find('[data-testid="year-selector-trigger"]');
      expect(trigger.attributes('aria-expanded')).toBe('false');
      expect(trigger.attributes('aria-haspopup')).toBe('listbox');
    });

    it('updates aria-expanded when dropdown opens', async () => {
      wrapper = mount(YearSelector, {
        props: {
          selectedYear: 2026
        }
      });

      const trigger = wrapper.find('[data-testid="year-selector-trigger"]');
      await trigger.trigger('click');

      expect(trigger.attributes('aria-expanded')).toBe('true');
    });

    it('dropdown has listbox role', async () => {
      wrapper = mount(YearSelector, {
        props: {
          selectedYear: 2026
        }
      });

      const dropdown = wrapper.find('[data-testid="year-dropdown"]');
      expect(dropdown.attributes('role')).toBe('listbox');
    });

    it('year options have option role', async () => {
      wrapper = mount(YearSelector, {
        props: {
          selectedYear: 2026
        }
      });

      // Open dropdown
      const trigger = wrapper.find('[data-testid="year-selector-trigger"]');
      await trigger.trigger('click');

      const yearOption = wrapper.find('[data-testid="year-option-2023"]');
      expect(yearOption.attributes('role')).toBe('option');
    });

    it('selected year option has aria-selected true', async () => {
      wrapper = mount(YearSelector, {
        props: {
          selectedYear: 2023
        }
      });

      // Open dropdown
      const trigger = wrapper.find('[data-testid="year-selector-trigger"]');
      await trigger.trigger('click');

      const selectedOption = wrapper.find('[data-testid="year-option-2023"]');
      expect(selectedOption.attributes('aria-selected')).toBe('true');

      const unselectedOption = wrapper.find('[data-testid="year-option-2024"]');
      expect(unselectedOption.attributes('aria-selected')).toBe('false');
    });

    it('trigger has role="combobox" attribute (NFR-3, NFR-4, US-7)', () => {
      wrapper = mount(YearSelector, {
        props: {
          selectedYear: 2026
        }
      });

      const trigger = wrapper.find('[data-testid="year-selector-trigger"]');
      expect(trigger.attributes('role')).toBe('combobox');
    });

    it('trigger has aria-controls pointing to listbox', () => {
      wrapper = mount(YearSelector, {
        props: {
          selectedYear: 2026
        }
      });

      const trigger = wrapper.find('[data-testid="year-selector-trigger"]');
      expect(trigger.attributes('aria-controls')).toBe('year-listbox');
    });

    it('dropdown has matching id for aria-controls', () => {
      wrapper = mount(YearSelector, {
        props: {
          selectedYear: 2026
        }
      });

      const dropdown = wrapper.find('[data-testid="year-dropdown"]');
      expect(dropdown.attributes('id')).toBe('year-listbox');
    });

    it('year options have unique ids for aria-activedescendant', async () => {
      wrapper = mount(YearSelector, {
        props: {
          selectedYear: 2023
        }
      });

      // Open dropdown
      const trigger = wrapper.find('[data-testid="year-selector-trigger"]');
      await trigger.trigger('click');

      const year2023Option = wrapper.find('[data-testid="year-option-2023"]');
      expect(year2023Option.attributes('id')).toBe('year-option-id-2023');

      const year2024Option = wrapper.find('[data-testid="year-option-2024"]');
      expect(year2024Option.attributes('id')).toBe('year-option-id-2024');
    });

    it('trigger has aria-activedescendant pointing to focused option when dropdown is open', async () => {
      wrapper = mount(YearSelector, {
        props: {
          selectedYear: 2023
        }
      });

      const trigger = wrapper.find('[data-testid="year-selector-trigger"]');
      await trigger.trigger('click');

      // After opening, focused option should be the selected year
      expect(trigger.attributes('aria-activedescendant')).toBe('year-option-id-2023');
    });
  });

  describe('keyboard navigation', () => {
    it('opens dropdown when Enter is pressed on trigger', async () => {
      wrapper = mount(YearSelector, {
        props: {
          selectedYear: 2026
        }
      });

      const trigger = wrapper.find('[data-testid="year-selector-trigger"]');
      await trigger.trigger('keydown', { key: 'Enter' });

      expect(wrapper.vm.isOpen).toBe(true);
    });

    it('opens dropdown when Space is pressed on trigger', async () => {
      wrapper = mount(YearSelector, {
        props: {
          selectedYear: 2026
        }
      });

      const trigger = wrapper.find('[data-testid="year-selector-trigger"]');
      await trigger.trigger('keydown', { key: ' ' });

      expect(wrapper.vm.isOpen).toBe(true);
    });

    it('opens dropdown when ArrowDown is pressed on closed trigger', async () => {
      wrapper = mount(YearSelector, {
        props: {
          selectedYear: 2026
        }
      });

      const trigger = wrapper.find('[data-testid="year-selector-trigger"]');
      await trigger.trigger('keydown', { key: 'ArrowDown' });

      expect(wrapper.vm.isOpen).toBe(true);
    });

    it('opens dropdown when ArrowUp is pressed on closed trigger', async () => {
      wrapper = mount(YearSelector, {
        props: {
          selectedYear: 2026
        }
      });

      const trigger = wrapper.find('[data-testid="year-selector-trigger"]');
      await trigger.trigger('keydown', { key: 'ArrowUp' });

      expect(wrapper.vm.isOpen).toBe(true);
    });

    it('moves focus down when ArrowDown is pressed in open dropdown', async () => {
      wrapper = mount(YearSelector, {
        props: {
          selectedYear: 2023
        }
      });

      // Open dropdown
      const trigger = wrapper.find('[data-testid="year-selector-trigger"]');
      await trigger.trigger('click');

      // Initial focus should be on 2023 (index 3 in array [2020,2021,2022,2023,2024,2025,2026])
      expect(wrapper.vm.focusedIndex).toBe(3);
      expect(wrapper.vm.focusedYear).toBe(2023);

      // Press ArrowDown
      await trigger.trigger('keydown', { key: 'ArrowDown' });

      // Focus should move to 2024 (index 4)
      expect(wrapper.vm.focusedIndex).toBe(4);
      expect(wrapper.vm.focusedYear).toBe(2024);
    });

    it('moves focus up when ArrowUp is pressed in open dropdown', async () => {
      wrapper = mount(YearSelector, {
        props: {
          selectedYear: 2023
        }
      });

      // Open dropdown
      const trigger = wrapper.find('[data-testid="year-selector-trigger"]');
      await trigger.trigger('click');

      // Initial focus should be on 2023 (index 3)
      expect(wrapper.vm.focusedIndex).toBe(3);

      // Press ArrowUp
      await trigger.trigger('keydown', { key: 'ArrowUp' });

      // Focus should move to 2022 (index 2)
      expect(wrapper.vm.focusedIndex).toBe(2);
      expect(wrapper.vm.focusedYear).toBe(2022);
    });

    it('does not move focus past first option on ArrowUp', async () => {
      wrapper = mount(YearSelector, {
        props: {
          selectedYear: 2020
        }
      });

      const trigger = wrapper.find('[data-testid="year-selector-trigger"]');
      await trigger.trigger('click');

      // Focus should be on 2020 (index 0)
      expect(wrapper.vm.focusedIndex).toBe(0);

      // Press ArrowUp - should stay at 0
      await trigger.trigger('keydown', { key: 'ArrowUp' });

      expect(wrapper.vm.focusedIndex).toBe(0);
    });

    it('does not move focus past last option on ArrowDown', async () => {
      wrapper = mount(YearSelector, {
        props: {
          selectedYear: 2026
        }
      });

      const trigger = wrapper.find('[data-testid="year-selector-trigger"]');
      await trigger.trigger('click');

      // Focus should be on 2026 (index 6)
      expect(wrapper.vm.focusedIndex).toBe(6);

      // Press ArrowDown - should stay at 6
      await trigger.trigger('keydown', { key: 'ArrowDown' });

      expect(wrapper.vm.focusedIndex).toBe(6);
    });

    it('selects focused year and closes dropdown when Enter is pressed', async () => {
      wrapper = mount(YearSelector, {
        props: {
          selectedYear: 2023
        }
      });

      // Open dropdown
      const trigger = wrapper.find('[data-testid="year-selector-trigger"]');
      await trigger.trigger('click');

      // Navigate to 2024
      await trigger.trigger('keydown', { key: 'ArrowDown' });
      expect(wrapper.vm.focusedYear).toBe(2024);

      // Press Enter to select
      await trigger.trigger('keydown', { key: 'Enter' });

      // Check year was emitted and dropdown closed
      expect(wrapper.emitted('update:selectedYear')).toBeTruthy();
      expect(wrapper.emitted('update:selectedYear')[0]).toEqual([2024]);
      expect(wrapper.vm.isOpen).toBe(false);
    });

    it('closes dropdown without selection when Escape is pressed', async () => {
      wrapper = mount(YearSelector, {
        props: {
          selectedYear: 2023
        }
      });

      // Open dropdown
      const trigger = wrapper.find('[data-testid="year-selector-trigger"]');
      await trigger.trigger('click');
      expect(wrapper.vm.isOpen).toBe(true);

      // Navigate to a different year
      await trigger.trigger('keydown', { key: 'ArrowDown' });

      // Press Escape
      await trigger.trigger('keydown', { key: 'Escape' });

      // Dropdown should close
      expect(wrapper.vm.isOpen).toBe(false);

      // No selection event should be emitted
      expect(wrapper.emitted('update:selectedYear')).toBeFalsy();
    });

    it('jumps to first option on Home key', async () => {
      wrapper = mount(YearSelector, {
        props: {
          selectedYear: 2024
        }
      });

      const trigger = wrapper.find('[data-testid="year-selector-trigger"]');
      await trigger.trigger('click');

      // Press Home
      await trigger.trigger('keydown', { key: 'Home' });

      expect(wrapper.vm.focusedIndex).toBe(0);
      expect(wrapper.vm.focusedYear).toBe(2020);
    });

    it('jumps to last option on End key', async () => {
      wrapper = mount(YearSelector, {
        props: {
          selectedYear: 2020
        }
      });

      const trigger = wrapper.find('[data-testid="year-selector-trigger"]');
      await trigger.trigger('click');

      // Press End
      await trigger.trigger('keydown', { key: 'End' });

      expect(wrapper.vm.focusedIndex).toBe(6);
      expect(wrapper.vm.focusedYear).toBe(2026);
    });

    it('closes dropdown on Tab key', async () => {
      wrapper = mount(YearSelector, {
        props: {
          selectedYear: 2023
        }
      });

      const trigger = wrapper.find('[data-testid="year-selector-trigger"]');
      await trigger.trigger('click');
      expect(wrapper.vm.isOpen).toBe(true);

      // Press Tab
      await trigger.trigger('keydown', { key: 'Tab' });

      expect(wrapper.vm.isOpen).toBe(false);
    });

    it('adds focused class to currently focused option', async () => {
      wrapper = mount(YearSelector, {
        props: {
          selectedYear: 2023
        }
      });

      const trigger = wrapper.find('[data-testid="year-selector-trigger"]');
      await trigger.trigger('click');

      // Initial focus on 2023
      const focusedOption = wrapper.find('[data-testid="year-option-2023"]');
      expect(focusedOption.classes()).toContain('focused');

      // Move to 2024
      await trigger.trigger('keydown', { key: 'ArrowDown' });

      const newFocusedOption = wrapper.find('[data-testid="year-option-2024"]');
      expect(newFocusedOption.classes()).toContain('focused');

      // 2023 should no longer have focused class
      expect(focusedOption.classes()).not.toContain('focused');
    });

    it('updates focusedIndex on mouse enter', async () => {
      wrapper = mount(YearSelector, {
        props: {
          selectedYear: 2023
        }
      });

      const trigger = wrapper.find('[data-testid="year-selector-trigger"]');
      await trigger.trigger('click');

      // Initial focus on 2023 (index 3)
      expect(wrapper.vm.focusedIndex).toBe(3);

      // Mouse enter on 2020
      const year2020Option = wrapper.find('[data-testid="year-option-2020"]');
      await year2020Option.trigger('mouseenter');

      expect(wrapper.vm.focusedIndex).toBe(0);
    });
  });
});
