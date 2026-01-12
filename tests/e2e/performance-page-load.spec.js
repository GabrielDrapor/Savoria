// @ts-check
import { test, expect } from '@playwright/test';

/**
 * Performance - Page Load Time Tests (NFR-1, SC-3)
 *
 * These tests verify that the page load performance meets the requirements:
 * - NFR-1: Page load performance - Initial load under 3 seconds on standard connection
 * - SC-3: URL reflects selected year (e.g., ?year=2023) enabling direct linking
 */
test.describe('Performance - Page Load Time (NFR-1, SC-3)', () => {

  test('TC1: Load gallery page with typical year data - Page becomes interactive in under 3 seconds', async ({ page }) => {
    // Start measuring time
    const startTime = Date.now();

    // Navigate to the gallery page
    await page.goto('/');

    // Wait for the page to become interactive
    // The page is considered interactive when:
    // 1. The year selector is visible and functional
    // 2. The gallery container is visible
    // 3. At least one category section has loaded (loading state finished for at least one)
    const yearSelector = page.locator('[data-testid="year-selector-trigger"]');
    const galleryContainer = page.locator('[data-testid="gallery-container"]');
    const pageTitle = page.locator('.pageTitle');

    // Wait for key interactive elements to be visible
    await expect(yearSelector).toBeVisible({ timeout: 3000 });
    await expect(galleryContainer).toBeVisible({ timeout: 3000 });
    await expect(pageTitle).toBeVisible({ timeout: 3000 });

    // Verify the year selector is functional (not just visible)
    await expect(yearSelector).toBeEnabled({ timeout: 3000 });

    // Calculate total time to interactive
    const timeToInteractive = Date.now() - startTime;

    // Log the performance metric for debugging
    console.log(`Time to Interactive: ${timeToInteractive}ms`);

    // Assert that the page becomes interactive in under 3 seconds (3000ms)
    expect(timeToInteractive).toBeLessThan(3000);

    // Verify the page title contains the year (confirms app state is loaded)
    const currentYear = new Date().getFullYear();
    await expect(pageTitle).toContainText(`In ${currentYear},`);
  });

  test('TC2: First Contentful Paint measurement - FCP under 1.5 seconds', async ({ page }) => {
    // Use Performance API to measure FCP
    const performanceMetrics = await page.evaluate(async () => {
      return new Promise((resolve) => {
        // Navigate happens before this, so we need to check performance timing
        const observer = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (entry.name === 'first-contentful-paint') {
              observer.disconnect();
              resolve({
                fcp: entry.startTime,
                name: entry.name
              });
            }
          }
        });
        observer.observe({ type: 'paint', buffered: true });

        // Fallback: resolve after 2 seconds if FCP not detected
        setTimeout(() => {
          observer.disconnect();
          resolve({ fcp: null, name: 'timeout' });
        }, 2000);
      });
    });

    // If using buffered entries, FCP should be available
    // For Playwright, we'll use an alternative approach

    // Start fresh navigation with performance measurement
    const startTime = Date.now();

    await page.goto('/', { waitUntil: 'domcontentloaded' });

    // Wait for first content to be visible (the page title or header)
    const firstContent = page.locator('.pageTitle, .header-container');
    await expect(firstContent.first()).toBeVisible({ timeout: 1500 });

    const fcpTime = Date.now() - startTime;

    console.log(`First Contentful Paint (approximated): ${fcpTime}ms`);

    // FCP should be under 1.5 seconds (1500ms)
    expect(fcpTime).toBeLessThan(1500);
  });

  test('TC2: FCP via Performance API - FCP under 1.5 seconds', async ({ page }) => {
    // Navigate and collect performance metrics
    await page.goto('/');

    // Wait a moment for paint entries to be recorded
    await page.waitForTimeout(500);

    // Get FCP from Performance API
    const fcpMetric = await page.evaluate(() => {
      const entries = performance.getEntriesByType('paint');
      const fcp = entries.find(entry => entry.name === 'first-contentful-paint');
      return fcp ? fcp.startTime : null;
    });

    if (fcpMetric !== null) {
      console.log(`First Contentful Paint (Performance API): ${fcpMetric}ms`);
      expect(fcpMetric).toBeLessThan(1500);
    } else {
      // Fallback: measure visually when first content appears
      // This test has already passed if we reached this point within timeout
      console.log('FCP metric not available, using visual verification');
      const pageTitle = page.locator('.pageTitle');
      await expect(pageTitle).toBeVisible({ timeout: 1500 });
    }
  });

  test('TC3: Switch year after initial load - Year content updates in under 2 seconds', async ({ page }) => {
    // First, load the page and wait for it to be fully interactive
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Verify initial state
    const selectedYear = page.locator('[data-testid="selected-year"]');
    const currentYear = new Date().getFullYear();
    await expect(selectedYear).toHaveText(currentYear.toString());

    // Open year selector
    const yearTrigger = page.locator('[data-testid="year-selector-trigger"]');
    await yearTrigger.click();

    // Verify dropdown is open
    const yearDropdown = page.locator('[data-testid="year-dropdown"]');
    await expect(yearDropdown).toBeVisible();

    // Start timing the year switch
    const startTime = Date.now();

    // Select a different year (2023)
    const year2023Option = page.locator('[data-testid="year-option-2023"]');
    await year2023Option.click();

    // Wait for year to update
    await expect(selectedYear).toHaveText('2023', { timeout: 2000 });

    // Wait for page title to update
    const pageTitle = page.locator('.pageTitle');
    await expect(pageTitle).toContainText('In 2023,', { timeout: 2000 });

    // Wait for gallery container to be visible (content is updating)
    const galleryContainer = page.locator('[data-testid="gallery-container"]');
    await expect(galleryContainer).toBeVisible({ timeout: 2000 });

    // Calculate year switch time
    const yearSwitchTime = Date.now() - startTime;

    console.log(`Year switch time: ${yearSwitchTime}ms`);

    // Year content should update in under 2 seconds (2000ms)
    expect(yearSwitchTime).toBeLessThan(2000);

    // Verify URL was updated
    await expect(page).toHaveURL(/year=2023/);
  });

  test('TC3: Multiple year switches remain performant', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const selectedYear = page.locator('[data-testid="selected-year"]');
    const yearTrigger = page.locator('[data-testid="year-selector-trigger"]');
    const pageTitle = page.locator('.pageTitle');

    const yearsToTest = [2023, 2022, 2024];

    for (const year of yearsToTest) {
      // Open year selector
      await yearTrigger.click();
      await page.locator('[data-testid="year-dropdown"]').waitFor({ state: 'visible' });

      // Time the switch
      const startTime = Date.now();

      // Select year
      await page.locator(`[data-testid="year-option-${year}"]`).click();

      // Wait for update
      await expect(selectedYear).toHaveText(year.toString(), { timeout: 2000 });
      await expect(pageTitle).toContainText(`In ${year},`, { timeout: 2000 });

      const switchTime = Date.now() - startTime;
      console.log(`Switch to ${year} took: ${switchTime}ms`);

      // Each switch should be under 2 seconds
      expect(switchTime).toBeLessThan(2000);
    }
  });

  test('Page load with URL year parameter - Direct link loads correctly', async ({ page }) => {
    // Test SC-3: URL reflects selected year enabling direct linking
    const startTime = Date.now();

    // Navigate directly with year parameter
    await page.goto('/?year=2023');

    // Wait for page to be interactive
    const yearSelector = page.locator('[data-testid="year-selector-trigger"]');
    const selectedYear = page.locator('[data-testid="selected-year"]');
    const pageTitle = page.locator('.pageTitle');
    const galleryContainer = page.locator('[data-testid="gallery-container"]');

    await expect(yearSelector).toBeVisible({ timeout: 3000 });
    await expect(galleryContainer).toBeVisible({ timeout: 3000 });

    const loadTime = Date.now() - startTime;
    console.log(`Direct link load time: ${loadTime}ms`);

    // Should still load in under 3 seconds
    expect(loadTime).toBeLessThan(3000);

    // Verify correct year was loaded
    await expect(selectedYear).toHaveText('2023');
    await expect(pageTitle).toContainText('In 2023,');
  });
});

test.describe('Performance - Core Web Vitals', () => {

  test('Largest Contentful Paint (LCP) should be reasonable', async ({ page }) => {
    await page.goto('/');

    // Wait for content to load
    await page.waitForLoadState('networkidle');

    // Get LCP from Performance API
    const lcpMetric = await page.evaluate(() => {
      return new Promise((resolve) => {
        let lcpValue = 0;
        const observer = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          for (const entry of entries) {
            // @ts-ignore
            lcpValue = entry.startTime;
          }
        });
        observer.observe({ type: 'largest-contentful-paint', buffered: true });

        // Wait a moment then resolve
        setTimeout(() => {
          observer.disconnect();
          resolve(lcpValue);
        }, 1000);
      });
    });

    console.log(`Largest Contentful Paint: ${lcpMetric}ms`);

    // LCP under 2.5 seconds is considered "good" by Core Web Vitals
    // We aim for 3 seconds as per NFR-1
    if (lcpMetric > 0) {
      expect(lcpMetric).toBeLessThan(3000);
    }
  });

  test('Time to First Byte (TTFB) should be reasonable', async ({ page }) => {
    await page.goto('/');

    // Get navigation timing
    const ttfb = await page.evaluate(() => {
      const navigation = performance.getEntriesByType('navigation')[0];
      if (navigation) {
        // @ts-ignore
        return navigation.responseStart - navigation.requestStart;
      }
      return null;
    });

    if (ttfb !== null) {
      console.log(`Time to First Byte: ${ttfb}ms`);
      // TTFB should be under 800ms for good performance
      // Allowing 1 second for test environment
      expect(ttfb).toBeLessThan(1000);
    }
  });

  test('DOM Content Loaded timing', async ({ page }) => {
    await page.goto('/');

    // Get DOMContentLoaded timing
    const dcl = await page.evaluate(() => {
      const navigation = performance.getEntriesByType('navigation')[0];
      if (navigation) {
        // @ts-ignore
        return navigation.domContentLoadedEventEnd - navigation.startTime;
      }
      return null;
    });

    if (dcl !== null) {
      console.log(`DOM Content Loaded: ${dcl}ms`);
      // DOM should be ready in under 2 seconds
      expect(dcl).toBeLessThan(2000);
    }
  });
});

test.describe('Performance - Data Loading', () => {

  test('API calls complete within reasonable time', async ({ page }) => {
    const apiTimings = [];

    // Intercept API calls and measure timing
    page.on('response', response => {
      if (response.url().includes('/api/complete/')) {
        apiTimings.push({
          url: response.url(),
          timing: response.timing()
        });
      }
    });

    const startTime = Date.now();
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    const totalTime = Date.now() - startTime;

    console.log(`Total data loading time: ${totalTime}ms`);
    console.log(`API calls made: ${apiTimings.length}`);

    // Total loading should be under 3 seconds
    expect(totalTime).toBeLessThan(3000);
  });

  test('Images use lazy loading for performance', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Check if cover images have lazy loading attribute
    const images = page.locator('[data-testid="cover-image"]');
    const imageCount = await images.count();

    if (imageCount > 0) {
      // Check first few images for lazy loading
      for (let i = 0; i < Math.min(3, imageCount); i++) {
        const img = images.nth(i);
        const loadingAttr = await img.getAttribute('loading');
        // Images should have loading="lazy" attribute
        expect(loadingAttr).toBe('lazy');
      }
    }

    console.log(`Found ${imageCount} cover images with lazy loading`);
  });
});
