import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { mount } from '@vue/test-utils';
import YearNavigationHeader from '@/components/YearNavigationHeader.vue';

/**
 * Unit tests for YearNavigationHeader component.
 * Tests the integrated header design that displays year navigation (← Year →)
 * within the page title, eliminating duplicate year displays.
 * Implements REQ-1, REQ-2, US-1.
 */
describe('YearNavigationHeader', () => {
  // Mock the current year to 2026 for consistent testing
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-06-15T12:00:00'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('Rendering - Test Case 6: Header component renders', () => {
    it('renders the component with all required elements', () => {
      const wrapper = mount(YearNavigationHeader, {
        props: { selectedYear: 2024 }
      });

      expect(wrapper.find('[data-testid="year-navigation-header"]').exists()).toBe(true);
      expect(wrapper.find('[data-testid="year-navigation-integrated"]').exists()).toBe(true);
      expect(wrapper.find('[data-testid="prev-year-button"]').exists()).toBe(true);
      expect(wrapper.find('[data-testid="current-year-display"]').exists()).toBe(true);
      expect(wrapper.find('[data-testid="next-year-button"]').exists()).toBe(true);
    });

    it('displays left arrow, current year prominently, and right arrow in integrated design', () => {
      const wrapper = mount(YearNavigationHeader, {
        props: { selectedYear: 2024 }
      });

      const prevButton = wrapper.find('[data-testid="prev-year-button"]');
      const yearDisplay = wrapper.find('[data-testid="current-year-display"]');
      const nextButton = wrapper.find('[data-testid="next-year-button"]');

      // Verify left arrow (←) button exists
      expect(prevButton.text()).toContain('←');
      // Verify year is displayed prominently
      expect(yearDisplay.text()).toBe('2024');
      // Verify right arrow (→) button exists
      expect(nextButton.text()).toContain('→');
    });

    it('displays year within the title context (In YEAR,)', () => {
      const wrapper = mount(YearNavigationHeader, {
        props: { selectedYear: 2024 }
      });

      const pageTitle = wrapper.find('.page-title');
      expect(pageTitle.exists()).toBe(true);

      // Verify "In" prefix is present
      const titlePrefix = wrapper.find('.title-prefix');
      expect(titlePrefix.text()).toBe('In');

      // Verify comma suffix is present
      const titleSuffix = wrapper.find('.title-suffix');
      expect(titleSuffix.text()).toBe(',');
    });

    it('displays year only once in the integrated design (no duplicate)', () => {
      const wrapper = mount(YearNavigationHeader, {
        props: { selectedYear: 2024 }
      });

      // Get all text content
      const fullText = wrapper.text();

      // Count occurrences of the year
      const yearRegex = /2024/g;
      const matches = fullText.match(yearRegex);

      // Year should appear exactly once
      expect(matches).not.toBeNull();
      expect(matches.length).toBe(1);
    });

    it('displays current year (2026) by default when passed', () => {
      const wrapper = mount(YearNavigationHeader, {
        props: { selectedYear: 2026 }
      });

      const yearDisplay = wrapper.find('[data-testid="current-year-display"]');
      expect(yearDisplay.text()).toBe('2026');
    });
  });

  describe('Year Navigation - Previous Year', () => {
    it('emits update:selectedYear with previous year when clicking left arrow', async () => {
      const wrapper = mount(YearNavigationHeader, {
        props: { selectedYear: 2024 }
      });

      await wrapper.find('[data-testid="prev-year-button"]').trigger('click');

      expect(wrapper.emitted('update:selectedYear')).toBeTruthy();
      expect(wrapper.emitted('update:selectedYear')[0]).toEqual([2023]);
    });

    it('navigates from 2026 to 2025 when clicking left arrow', async () => {
      const wrapper = mount(YearNavigationHeader, {
        props: { selectedYear: 2026 }
      });

      await wrapper.find('[data-testid="prev-year-button"]').trigger('click');

      expect(wrapper.emitted('update:selectedYear')[0]).toEqual([2025]);
    });

    it('does not emit when clicking left arrow at earliest year (2020)', async () => {
      const wrapper = mount(YearNavigationHeader, {
        props: { selectedYear: 2020, startYear: 2020 }
      });

      await wrapper.find('[data-testid="prev-year-button"]').trigger('click');

      expect(wrapper.emitted('update:selectedYear')).toBeFalsy();
    });
  });

  describe('Year Navigation - Next Year', () => {
    it('emits update:selectedYear with next year when clicking right arrow', async () => {
      const wrapper = mount(YearNavigationHeader, {
        props: { selectedYear: 2024 }
      });

      await wrapper.find('[data-testid="next-year-button"]').trigger('click');

      expect(wrapper.emitted('update:selectedYear')).toBeTruthy();
      expect(wrapper.emitted('update:selectedYear')[0]).toEqual([2025]);
    });

    it('navigates from 2025 to 2026 when clicking right arrow', async () => {
      const wrapper = mount(YearNavigationHeader, {
        props: { selectedYear: 2025 }
      });

      await wrapper.find('[data-testid="next-year-button"]').trigger('click');

      expect(wrapper.emitted('update:selectedYear')[0]).toEqual([2026]);
    });

    it('does not emit when clicking right arrow at latest year (2026)', async () => {
      const wrapper = mount(YearNavigationHeader, {
        props: { selectedYear: 2026 }
      });

      await wrapper.find('[data-testid="next-year-button"]').trigger('click');

      expect(wrapper.emitted('update:selectedYear')).toBeFalsy();
    });
  });

  describe('Boundary Behavior - Test Cases 4 & 5', () => {
    it('disables left arrow at earliest year (2020)', () => {
      const wrapper = mount(YearNavigationHeader, {
        props: { selectedYear: 2020, startYear: 2020 }
      });

      const prevButton = wrapper.find('[data-testid="prev-year-button"]');
      expect(prevButton.attributes('disabled')).toBeDefined();
      expect(prevButton.classes()).toContain('disabled');
    });

    it('enables right arrow at earliest year (2020)', () => {
      const wrapper = mount(YearNavigationHeader, {
        props: { selectedYear: 2020, startYear: 2020 }
      });

      const nextButton = wrapper.find('[data-testid="next-year-button"]');
      expect(nextButton.attributes('disabled')).toBeUndefined();
      expect(nextButton.classes()).not.toContain('disabled');
    });

    it('disables right arrow at latest year (2026)', () => {
      const wrapper = mount(YearNavigationHeader, {
        props: { selectedYear: 2026 }
      });

      const nextButton = wrapper.find('[data-testid="next-year-button"]');
      expect(nextButton.attributes('disabled')).toBeDefined();
      expect(nextButton.classes()).toContain('disabled');
    });

    it('enables left arrow at latest year (2026)', () => {
      const wrapper = mount(YearNavigationHeader, {
        props: { selectedYear: 2026 }
      });

      const prevButton = wrapper.find('[data-testid="prev-year-button"]');
      expect(prevButton.attributes('disabled')).toBeUndefined();
      expect(prevButton.classes()).not.toContain('disabled');
    });

    it('both arrows enabled for middle years', () => {
      const wrapper = mount(YearNavigationHeader, {
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
      const wrapper = mount(YearNavigationHeader, {
        props: { selectedYear: 2020 }
      });

      const prevButton = wrapper.find('[data-testid="prev-year-button"]');
      expect(prevButton.attributes('disabled')).toBeDefined();
    });

    it('respects custom startYear prop', () => {
      const wrapper = mount(YearNavigationHeader, {
        props: { selectedYear: 2022, startYear: 2022 }
      });

      const prevButton = wrapper.find('[data-testid="prev-year-button"]');
      expect(prevButton.attributes('disabled')).toBeDefined();
    });

    it('navigates within range [2020-2026]', () => {
      const wrapper = mount(YearNavigationHeader, {
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
    it('has proper aria-label on left arrow button', () => {
      const wrapper = mount(YearNavigationHeader, {
        props: { selectedYear: 2024 }
      });

      const prevButton = wrapper.find('[data-testid="prev-year-button"]');
      expect(prevButton.attributes('aria-label')).toBe('Navigate to previous year 2023');
    });

    it('has proper aria-label on right arrow button', () => {
      const wrapper = mount(YearNavigationHeader, {
        props: { selectedYear: 2024 }
      });

      const nextButton = wrapper.find('[data-testid="next-year-button"]');
      expect(nextButton.attributes('aria-label')).toBe('Navigate to next year 2025');
    });

    it('has aria-disabled attribute on disabled buttons', () => {
      const wrapper = mount(YearNavigationHeader, {
        props: { selectedYear: 2020, startYear: 2020 }
      });

      const prevButton = wrapper.find('[data-testid="prev-year-button"]');
      expect(prevButton.attributes('aria-disabled')).toBe('true');
    });
  });

  describe('Keyboard Navigation', () => {
    it('triggers previous year on Enter key', async () => {
      const wrapper = mount(YearNavigationHeader, {
        props: { selectedYear: 2024 }
      });

      await wrapper.find('[data-testid="prev-year-button"]').trigger('keydown', { key: 'Enter' });

      expect(wrapper.emitted('update:selectedYear')).toBeTruthy();
      expect(wrapper.emitted('update:selectedYear')[0]).toEqual([2023]);
    });

    it('triggers next year on Enter key', async () => {
      const wrapper = mount(YearNavigationHeader, {
        props: { selectedYear: 2024 }
      });

      await wrapper.find('[data-testid="next-year-button"]').trigger('keydown', { key: 'Enter' });

      expect(wrapper.emitted('update:selectedYear')).toBeTruthy();
      expect(wrapper.emitted('update:selectedYear')[0]).toEqual([2025]);
    });

    it('triggers previous year on Space key', async () => {
      const wrapper = mount(YearNavigationHeader, {
        props: { selectedYear: 2024 }
      });

      await wrapper.find('[data-testid="prev-year-button"]').trigger('keydown', { key: ' ' });

      expect(wrapper.emitted('update:selectedYear')).toBeTruthy();
      expect(wrapper.emitted('update:selectedYear')[0]).toEqual([2023]);
    });

    it('triggers next year on Space key', async () => {
      const wrapper = mount(YearNavigationHeader, {
        props: { selectedYear: 2024 }
      });

      await wrapper.find('[data-testid="next-year-button"]').trigger('keydown', { key: ' ' });

      expect(wrapper.emitted('update:selectedYear')).toBeTruthy();
      expect(wrapper.emitted('update:selectedYear')[0]).toEqual([2025]);
    });
  });

  describe('Computed Properties', () => {
    it('calculates previousYear correctly', () => {
      const wrapper = mount(YearNavigationHeader, {
        props: { selectedYear: 2024 }
      });

      expect(wrapper.vm.previousYear).toBe(2023);
    });

    it('calculates nextYear correctly', () => {
      const wrapper = mount(YearNavigationHeader, {
        props: { selectedYear: 2024 }
      });

      expect(wrapper.vm.nextYear).toBe(2025);
    });

    it('calculates canGoPrevious correctly', () => {
      const wrapper = mount(YearNavigationHeader, {
        props: { selectedYear: 2021, startYear: 2020 }
      });

      expect(wrapper.vm.canGoPrevious).toBe(true);
    });

    it('calculates canGoNext correctly', () => {
      const wrapper = mount(YearNavigationHeader, {
        props: { selectedYear: 2025 }
      });

      expect(wrapper.vm.canGoNext).toBe(true);
    });
  });
});
