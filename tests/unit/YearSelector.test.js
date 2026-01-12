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
  });
});
