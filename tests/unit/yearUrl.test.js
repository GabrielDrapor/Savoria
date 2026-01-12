import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  parseYearFromUrl,
  isValidYear,
  getYearFromUrlWithFallback,
  buildUrlWithYear,
  getAvailableYears,
  getCurrentYear,
  EARLIEST_SUPPORTED_YEAR
} from '@/utils/yearUrl.js';

describe('yearUrl utilities', () => {
  describe('parseYearFromUrl', () => {
    it('should parse year 2023 from URL query parameter', () => {
      // Test case 6: Parse URL query parameter ?year=2023
      const result = parseYearFromUrl('?year=2023');
      expect(result).toBe(2023);
    });

    it('should return null when no year parameter exists', () => {
      const result = parseYearFromUrl('');
      expect(result).toBeNull();
    });

    it('should return null when year parameter is empty', () => {
      const result = parseYearFromUrl('?year=');
      expect(result).toBeNull();
    });

    it('should return null for invalid year value', () => {
      // Test case 4: Navigate to /?year=invalid
      const result = parseYearFromUrl('?year=invalid');
      expect(result).toBeNull();
    });

    it('should parse year 2024 from URL', () => {
      // Test case 3: Navigate to /?year=2024
      const result = parseYearFromUrl('?year=2024');
      expect(result).toBe(2024);
    });

    it('should parse out-of-range year 1999', () => {
      // Test case 5: Navigate to /?year=1999 - parsing should work, validation is separate
      const result = parseYearFromUrl('?year=1999');
      expect(result).toBe(1999);
    });
  });

  describe('isValidYear', () => {
    it('should return true for valid years', () => {
      expect(isValidYear(2023)).toBe(true);
      expect(isValidYear(2024)).toBe(true);
      expect(isValidYear(2020)).toBe(true);
    });

    it('should return false for years before 2020', () => {
      expect(isValidYear(2019)).toBe(false);
      expect(isValidYear(1999)).toBe(false);
    });

    it('should return false for future years', () => {
      const futureYear = getCurrentYear() + 1;
      expect(isValidYear(futureYear)).toBe(false);
    });

    it('should return false for non-integer values', () => {
      expect(isValidYear(2023.5)).toBe(false);
      expect(isValidYear(NaN)).toBe(false);
    });
  });

  describe('getYearFromUrlWithFallback', () => {
    const currentYear = getCurrentYear();

    it('should return 2023 for valid year parameter', () => {
      const result = getYearFromUrlWithFallback('?year=2023');
      expect(result).toBe(2023);
    });

    it('should return current year when no parameter exists', () => {
      const result = getYearFromUrlWithFallback('');
      expect(result).toBe(currentYear);
    });

    it('should fall back to current year for invalid parameter', () => {
      // Test case 4: Falls back to current year gracefully
      const result = getYearFromUrlWithFallback('?year=invalid');
      expect(result).toBe(currentYear);
    });

    it('should fall back to earliest year for out-of-range past year', () => {
      // Test case 5: Falls back to earliest supported year (2020) for year=1999
      const result = getYearFromUrlWithFallback('?year=1999');
      expect(result).toBe(EARLIEST_SUPPORTED_YEAR);
    });

    it('should fall back to current year for future years', () => {
      const result = getYearFromUrlWithFallback('?year=2099');
      expect(result).toBe(currentYear);
    });

    it('should handle year at boundary (2020)', () => {
      const result = getYearFromUrlWithFallback('?year=2020');
      expect(result).toBe(2020);
    });
  });

  describe('buildUrlWithYear', () => {
    it('should build URL with year parameter', () => {
      const result = buildUrlWithYear(2023);
      expect(result).toBe('?year=2023');
    });

    it('should preserve existing parameters', () => {
      const result = buildUrlWithYear(2023, '?foo=bar');
      expect(result).toContain('year=2023');
      expect(result).toContain('foo=bar');
    });

    it('should override existing year parameter', () => {
      const result = buildUrlWithYear(2024, '?year=2023');
      expect(result).toBe('?year=2024');
    });
  });

  describe('getAvailableYears', () => {
    it('should return array of years from current to 2020', () => {
      const years = getAvailableYears();
      const currentYear = getCurrentYear();

      expect(years[0]).toBe(currentYear);
      expect(years[years.length - 1]).toBe(EARLIEST_SUPPORTED_YEAR);
      expect(years.length).toBe(currentYear - EARLIEST_SUPPORTED_YEAR + 1);
    });

    it('should return years in descending order', () => {
      const years = getAvailableYears();
      for (let i = 0; i < years.length - 1; i++) {
        expect(years[i]).toBeGreaterThan(years[i + 1]);
      }
    });
  });
});
