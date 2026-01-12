/**
 * URL State Persistence utilities for year selection
 * Supports parsing, validation, and updating of year in URL query parameters
 */

const EARLIEST_SUPPORTED_YEAR = 2020;

/**
 * Get the current year
 * @returns {number} Current year
 */
export function getCurrentYear() {
  return new Date().getFullYear();
}

/**
 * Parse year from URL query parameter
 * @param {string} search - URL search string (e.g., "?year=2023")
 * @returns {number|null} Parsed year as integer or null if not present/invalid
 */
export function parseYearFromUrl(search) {
  const params = new URLSearchParams(search);
  const yearParam = params.get('year');

  if (yearParam === null) {
    return null;
  }

  const parsed = parseInt(yearParam, 10);

  if (isNaN(parsed)) {
    return null;
  }

  return parsed;
}

/**
 * Validate if a year is within the supported range
 * @param {number} year - Year to validate
 * @returns {boolean} True if year is valid
 */
export function isValidYear(year) {
  const currentYear = getCurrentYear();
  return Number.isInteger(year) && year >= EARLIEST_SUPPORTED_YEAR && year <= currentYear;
}

/**
 * Get the year to display, with fallback logic for invalid values
 * @param {string} search - URL search string
 * @returns {number} Valid year to display
 */
export function getYearFromUrlWithFallback(search) {
  const parsed = parseYearFromUrl(search);
  const currentYear = getCurrentYear();

  // No year parameter - use current year
  if (parsed === null) {
    return currentYear;
  }

  // Invalid (non-numeric) - use current year
  if (!Number.isInteger(parsed)) {
    return currentYear;
  }

  // Year too old - fall back to earliest supported year
  if (parsed < EARLIEST_SUPPORTED_YEAR) {
    return EARLIEST_SUPPORTED_YEAR;
  }

  // Year in the future - fall back to current year
  if (parsed > currentYear) {
    return currentYear;
  }

  return parsed;
}

/**
 * Build URL with year query parameter
 * @param {number} year - Year to encode in URL
 * @param {string} currentSearch - Current URL search string
 * @returns {string} New URL search string
 */
export function buildUrlWithYear(year, currentSearch = '') {
  const params = new URLSearchParams(currentSearch);
  params.set('year', year.toString());
  return '?' + params.toString();
}

/**
 * Update the browser URL with the selected year without page reload
 * @param {number} year - Year to set in URL
 */
export function updateUrlWithYear(year) {
  const newSearch = buildUrlWithYear(year, window.location.search);
  const newUrl = window.location.pathname + newSearch;
  window.history.pushState({ year }, '', newUrl);
}

/**
 * Get available years for selection
 * @returns {number[]} Array of years from earliest to current
 */
export function getAvailableYears() {
  const currentYear = getCurrentYear();
  const years = [];
  for (let year = currentYear; year >= EARLIEST_SUPPORTED_YEAR; year--) {
    years.push(year);
  }
  return years;
}

export { EARLIEST_SUPPORTED_YEAR };
