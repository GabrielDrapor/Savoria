import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { mount } from '@vue/test-utils';
import YearNavigationButtons from '@/components/YearNavigationButtons.vue';

describe('YearNavigationButtons', () => {
  // Mock the current year to 2026 for consistent testing
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-06-15T12:00:00'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('Rendering', () => {
    it('renders the component with all required elements', () => {
      const wrapper = mount(YearNavigationButtons, {
        props: { selectedYear: 2024 }
      });

      expect(wrapper.find('[data-testid="year-navigation-buttons"]').exists()).toBe(true);
      expect(wrapper.find('[data-testid="prev-year-button"]').exists()).toBe(true);
      expect(wrapper.find('[data-testid="current-year-display"]').exists()).toBe(true);
      expect(wrapper.find('[data-testid="next-year-button"]').exists()).toBe(true);
    });

    it('displays "← Previous year" button text', () => {
      const wrapper = mount(YearNavigationButtons, {
        props: { selectedYear: 2024 }
      });

      const prevButton = wrapper.find('[data-testid="prev-year-button"]');
      expect(prevButton.text()).toBe('← Previous year');
    });

    it('displays "Next year →" button text', () => {
      const wrapper = mount(YearNavigationButtons, {
        props: { selectedYear: 2024 }
      });

      const nextButton = wrapper.find('[data-testid="next-year-button"]');
      expect(nextButton.text()).toBe('Next year →');
    });

    it('displays the selected year between navigation buttons', () => {
      const wrapper = mount(YearNavigationButtons, {
        props: { selectedYear: 2024 }
      });

      const yearDisplay = wrapper.find('[data-testid="current-year-display"]');
      expect(yearDisplay.text()).toBe('2024');
    });

    it('displays current year (2026) by default when passed', () => {
      const wrapper = mount(YearNavigationButtons, {
        props: { selectedYear: 2026 }
      });

      const yearDisplay = wrapper.find('[data-testid="current-year-display"]');
      expect(yearDisplay.text()).toBe('2026');
    });
  });

  describe('Year Navigation - Previous Year', () => {
    it('emits update:selectedYear with previous year when clicking Previous year button', async () => {
      const wrapper = mount(YearNavigationButtons, {
        props: { selectedYear: 2024 }
      });

      await wrapper.find('[data-testid="prev-year-button"]').trigger('click');

      expect(wrapper.emitted('update:selectedYear')).toBeTruthy();
      expect(wrapper.emitted('update:selectedYear')[0]).toEqual([2023]);
    });

    it('navigates from 2026 to 2025 when clicking Previous year', async () => {
      const wrapper = mount(YearNavigationButtons, {
        props: { selectedYear: 2026 }
      });

      await wrapper.find('[data-testid="prev-year-button"]').trigger('click');

      expect(wrapper.emitted('update:selectedYear')[0]).toEqual([2025]);
    });

    it('does not emit when clicking Previous year at earliest year (2020)', async () => {
      const wrapper = mount(YearNavigationButtons, {
        props: { selectedYear: 2020, startYear: 2020 }
      });

      await wrapper.find('[data-testid="prev-year-button"]').trigger('click');

      expect(wrapper.emitted('update:selectedYear')).toBeFalsy();
    });
  });

  describe('Year Navigation - Next Year', () => {
    it('emits update:selectedYear with next year when clicking Next year button', async () => {
      const wrapper = mount(YearNavigationButtons, {
        props: { selectedYear: 2024 }
      });

      await wrapper.find('[data-testid="next-year-button"]').trigger('click');

      expect(wrapper.emitted('update:selectedYear')).toBeTruthy();
      expect(wrapper.emitted('update:selectedYear')[0]).toEqual([2025]);
    });

    it('navigates from 2025 to 2026 when clicking Next year', async () => {
      const wrapper = mount(YearNavigationButtons, {
        props: { selectedYear: 2025 }
      });

      await wrapper.find('[data-testid="next-year-button"]').trigger('click');

      expect(wrapper.emitted('update:selectedYear')[0]).toEqual([2026]);
    });

    it('does not emit when clicking Next year at latest year (2026)', async () => {
      const wrapper = mount(YearNavigationButtons, {
        props: { selectedYear: 2026 }
      });

      await wrapper.find('[data-testid="next-year-button"]').trigger('click');

      expect(wrapper.emitted('update:selectedYear')).toBeFalsy();
    });
  });

  describe('Boundary Behavior', () => {
    it('disables Previous year button at earliest year (2020)', () => {
      const wrapper = mount(YearNavigationButtons, {
        props: { selectedYear: 2020, startYear: 2020 }
      });

      const prevButton = wrapper.find('[data-testid="prev-year-button"]');
      expect(prevButton.attributes('disabled')).toBeDefined();
      expect(prevButton.classes()).toContain('disabled');
    });

    it('enables Next year button at earliest year (2020)', () => {
      const wrapper = mount(YearNavigationButtons, {
        props: { selectedYear: 2020, startYear: 2020 }
      });

      const nextButton = wrapper.find('[data-testid="next-year-button"]');
      expect(nextButton.attributes('disabled')).toBeUndefined();
      expect(nextButton.classes()).not.toContain('disabled');
    });

    it('disables Next year button at latest year (2026)', () => {
      const wrapper = mount(YearNavigationButtons, {
        props: { selectedYear: 2026 }
      });

      const nextButton = wrapper.find('[data-testid="next-year-button"]');
      expect(nextButton.attributes('disabled')).toBeDefined();
      expect(nextButton.classes()).toContain('disabled');
    });

    it('enables Previous year button at latest year (2026)', () => {
      const wrapper = mount(YearNavigationButtons, {
        props: { selectedYear: 2026 }
      });

      const prevButton = wrapper.find('[data-testid="prev-year-button"]');
      expect(prevButton.attributes('disabled')).toBeUndefined();
      expect(prevButton.classes()).not.toContain('disabled');
    });

    it('both buttons enabled for middle years', () => {
      const wrapper = mount(YearNavigationButtons, {
        props: { selectedYear: 2023 }
      });

      const prevButton = wrapper.find('[data-testid="prev-year-button"]');
      const nextButton = wrapper.find('[data-testid="next-year-button"]');

      expect(prevButton.attributes('disabled')).toBeUndefined();
      expect(nextButton.attributes('disabled')).toBeUndefined();
    });
  });

  describe('Year Range Calculation', () => {
    it('uses default startYear of 2020', () => {
      const wrapper = mount(YearNavigationButtons, {
        props: { selectedYear: 2020 }
      });

      const prevButton = wrapper.find('[data-testid="prev-year-button"]');
      expect(prevButton.attributes('disabled')).toBeDefined();
    });

    it('respects custom startYear prop', () => {
      const wrapper = mount(YearNavigationButtons, {
        props: { selectedYear: 2022, startYear: 2022 }
      });

      const prevButton = wrapper.find('[data-testid="prev-year-button"]');
      expect(prevButton.attributes('disabled')).toBeDefined();
    });

    it('navigates within range [2020-2026]', () => {
      const wrapper = mount(YearNavigationButtons, {
        props: { selectedYear: 2023, startYear: 2020 }
      });

      // Can go to previous (2022) and next (2024)
      expect(wrapper.vm.canGoPrevious).toBe(true);
      expect(wrapper.vm.canGoNext).toBe(true);
      expect(wrapper.vm.previousYear).toBe(2022);
      expect(wrapper.vm.nextYear).toBe(2024);
    });
  });

  describe('Accessibility', () => {
    it('has proper aria-label on Previous year button', () => {
      const wrapper = mount(YearNavigationButtons, {
        props: { selectedYear: 2024 }
      });

      const prevButton = wrapper.find('[data-testid="prev-year-button"]');
      expect(prevButton.attributes('aria-label')).toBe('Navigate to previous year 2023');
    });

    it('has proper aria-label on Next year button', () => {
      const wrapper = mount(YearNavigationButtons, {
        props: { selectedYear: 2024 }
      });

      const nextButton = wrapper.find('[data-testid="next-year-button"]');
      expect(nextButton.attributes('aria-label')).toBe('Navigate to next year 2025');
    });

    it('has aria-disabled attribute on disabled buttons', () => {
      const wrapper = mount(YearNavigationButtons, {
        props: { selectedYear: 2020, startYear: 2020 }
      });

      const prevButton = wrapper.find('[data-testid="prev-year-button"]');
      expect(prevButton.attributes('aria-disabled')).toBe('true');
    });
  });

  describe('Keyboard Navigation', () => {
    it('triggers Previous year on Enter key', async () => {
      const wrapper = mount(YearNavigationButtons, {
        props: { selectedYear: 2024 }
      });

      await wrapper.find('[data-testid="prev-year-button"]').trigger('keydown', { key: 'Enter' });

      expect(wrapper.emitted('update:selectedYear')).toBeTruthy();
      expect(wrapper.emitted('update:selectedYear')[0]).toEqual([2023]);
    });

    it('triggers Next year on Enter key', async () => {
      const wrapper = mount(YearNavigationButtons, {
        props: { selectedYear: 2024 }
      });

      await wrapper.find('[data-testid="next-year-button"]').trigger('keydown', { key: 'Enter' });

      expect(wrapper.emitted('update:selectedYear')).toBeTruthy();
      expect(wrapper.emitted('update:selectedYear')[0]).toEqual([2025]);
    });

    it('triggers Previous year on Space key', async () => {
      const wrapper = mount(YearNavigationButtons, {
        props: { selectedYear: 2024 }
      });

      await wrapper.find('[data-testid="prev-year-button"]').trigger('keydown', { key: ' ' });

      expect(wrapper.emitted('update:selectedYear')).toBeTruthy();
      expect(wrapper.emitted('update:selectedYear')[0]).toEqual([2023]);
    });

    it('triggers Next year on Space key', async () => {
      const wrapper = mount(YearNavigationButtons, {
        props: { selectedYear: 2024 }
      });

      await wrapper.find('[data-testid="next-year-button"]').trigger('keydown', { key: ' ' });

      expect(wrapper.emitted('update:selectedYear')).toBeTruthy();
      expect(wrapper.emitted('update:selectedYear')[0]).toEqual([2025]);
    });
  });

  describe('Computed Properties', () => {
    it('calculates previousYear correctly', () => {
      const wrapper = mount(YearNavigationButtons, {
        props: { selectedYear: 2024 }
      });

      expect(wrapper.vm.previousYear).toBe(2023);
    });

    it('calculates nextYear correctly', () => {
      const wrapper = mount(YearNavigationButtons, {
        props: { selectedYear: 2024 }
      });

      expect(wrapper.vm.nextYear).toBe(2025);
    });

    it('calculates canGoPrevious correctly', () => {
      const wrapper = mount(YearNavigationButtons, {
        props: { selectedYear: 2021, startYear: 2020 }
      });

      expect(wrapper.vm.canGoPrevious).toBe(true);
    });

    it('calculates canGoNext correctly', () => {
      const wrapper = mount(YearNavigationButtons, {
        props: { selectedYear: 2025 }
      });

      expect(wrapper.vm.canGoNext).toBe(true);
    });
  });
});
