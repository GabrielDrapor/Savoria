import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  getAvailableYears,
  getCurrentYear,
  parseYearFromUrl,
  updateUrlWithYear,
  getYearFromUrlWithFallback,
  isValidYear,
  EARLIEST_SUPPORTED_YEAR
} from '../../src/utils/yearUrl.js';

describe('yearUrl utilities', () => {
  describe('getAvailableYears', () => {
    it('returns array from current year down to 2020', () => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date('2026-01-12'));

      const result = getAvailableYears();
      // Returns years in descending order
      expect(result).toEqual([2026, 2025, 2024, 2023, 2022, 2021, 2020]);

      vi.useRealTimers();
    });

    it('returns array [2020, 2021, 2022, 2023, 2024, 2025, 2026] when sorted ascending', () => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date('2026-01-12'));

      const result = getAvailableYears().sort((a, b) => a - b);
      expect(result).toEqual([2020, 2021, 2022, 2023, 2024, 2025, 2026]);

      vi.useRealTimers();
    });
  });

  describe('getCurrentYear', () => {
    it('returns the current year', () => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date('2026-01-12'));

      const result = getCurrentYear();
      expect(result).toBe(2026);

      vi.useRealTimers();
    });
  });

  describe('parseYearFromUrl', () => {
    it('returns null when no year parameter is present', () => {
      const result = parseYearFromUrl('');
      expect(result).toBeNull();
    });

    it('returns null when year parameter key exists but has no value', () => {
      const result = parseYearFromUrl('?year=');
      expect(result).toBeNull();
    });

    it('returns parsed year when valid year parameter is present', () => {
      const result = parseYearFromUrl('?year=2023');
      expect(result).toBe(2023);
    });

    it('returns null when year is not a valid number', () => {
      const result = parseYearFromUrl('?year=abc');
      expect(result).toBeNull();
    });

    it('handles multiple query parameters', () => {
      const result = parseYearFromUrl('?foo=bar&year=2024&baz=qux');
      expect(result).toBe(2024);
    });
  });

  describe('isValidYear', () => {
    beforeEach(() => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date('2026-01-12'));
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('returns true for years within valid range', () => {
      expect(isValidYear(2020)).toBe(true);
      expect(isValidYear(2023)).toBe(true);
      expect(isValidYear(2026)).toBe(true);
    });

    it('returns false for years before 2020', () => {
      expect(isValidYear(2019)).toBe(false);
      expect(isValidYear(2000)).toBe(false);
    });

    it('returns false for years in the future', () => {
      expect(isValidYear(2027)).toBe(false);
      expect(isValidYear(2030)).toBe(false);
    });

    it('returns false for non-integer values', () => {
      expect(isValidYear(2023.5)).toBe(false);
      expect(isValidYear(NaN)).toBe(false);
    });
  });

  describe('getYearFromUrlWithFallback', () => {
    beforeEach(() => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date('2026-01-12'));
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('returns current year when no year parameter is present', () => {
      const result = getYearFromUrlWithFallback('');
      expect(result).toBe(2026);
    });

    it('returns parsed year when valid year parameter is present', () => {
      const result = getYearFromUrlWithFallback('?year=2023');
      expect(result).toBe(2023);
    });

    it('returns earliest supported year when year is too old', () => {
      const result = getYearFromUrlWithFallback('?year=2019');
      expect(result).toBe(EARLIEST_SUPPORTED_YEAR);
    });

    it('returns current year when year is in the future', () => {
      const result = getYearFromUrlWithFallback('?year=2030');
      expect(result).toBe(2026);
    });

    it('returns current year when year is invalid', () => {
      const result = getYearFromUrlWithFallback('?year=abc');
      expect(result).toBe(2026);
    });
  });

  describe('updateUrlWithYear', () => {
    let pushStateSpy;

    beforeEach(() => {
      // Mock window.location and history
      delete window.location;
      window.location = {
        href: 'http://localhost:5173/',
        search: '',
        origin: 'http://localhost:5173',
        pathname: '/'
      };

      pushStateSpy = vi.spyOn(window.history, 'pushState').mockImplementation(() => {});
    });

    afterEach(() => {
      pushStateSpy.mockRestore();
    });

    it('updates URL with year parameter', () => {
      updateUrlWithYear(2023);

      expect(pushStateSpy).toHaveBeenCalledTimes(1);
      expect(pushStateSpy).toHaveBeenCalledWith(
        { year: 2023 },
        '',
        expect.stringContaining('year=2023')
      );
    });
  });

  describe('EARLIEST_SUPPORTED_YEAR constant', () => {
    it('is set to 2020', () => {
      expect(EARLIEST_SUPPORTED_YEAR).toBe(2020);
    });
  });
});
