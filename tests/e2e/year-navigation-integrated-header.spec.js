// @ts-check
const { test, expect } = require('@playwright/test');

/**
 * E2E tests for Year Navigation with Integrated Header.
 * Tests REQ-1, REQ-2, US-1 - Redesigned header that integrates year navigation
 * with the title. Year appears only once in an integrated design: '← 2024 →'
 * as part of the page header, eliminating duplicate year displays.
 */

test.describe('Year Navigation with Integrated Header', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the main gallery page
    await page.goto('/');
    // Wait for the header to be visible
    await page.waitForSelector('[data-testid="year-navigation-header"]', { timeout: 10000 });
  });

  test.describe('Test Case 1: Load page without year parameter', () => {
    test('header displays integrated year navigation with year shown once', async ({ page }) => {
      // Load page without year parameter
      await page.goto('/');
      await page.waitForSelector('[data-testid="year-navigation-header"]');

      // Verify integrated header exists
      const header = page.locator('[data-testid="year-navigation-header"]');
      await expect(header).toBeVisible();

      // Verify year navigation is integrated (← YEAR →)
      const yearNavigation = page.locator('[data-testid="year-navigation-integrated"]');
      await expect(yearNavigation).toBeVisible();

      // Verify left arrow exists
      const prevButton = page.locator('[data-testid="prev-year-button"]');
      await expect(prevButton).toBeVisible();

      // Verify year is displayed
      const yearDisplay = page.locator('[data-testid="current-year-display"]');
      const currentYear = new Date().getFullYear();
      await expect(yearDisplay).toHaveText(currentYear.toString());

      // Verify right arrow exists
      const nextButton = page.locator('[data-testid="next-year-button"]');
      await expect(nextButton).toBeVisible();
    });

    test('year is NOT duplicated in a separate location', async ({ page }) => {
      await page.goto('/');
      await page.waitForSelector('[data-testid="year-navigation-header"]');

      const currentYear = new Date().getFullYear();

      // Get the page content text
      const pageText = await page.locator('body').textContent();

      // Count occurrences of the year in the header area
      // The year should appear exactly once (in the integrated navigation)
      const yearRegex = new RegExp(currentYear.toString(), 'g');
      const matches = pageText.match(yearRegex);

      // Year should appear exactly once in the visible content
      // (not in both navigation AND title)
      expect(matches.length).toBe(1);
    });
  });

  test.describe('Test Case 2: Click left arrow on 2026', () => {
    test('page navigates to 2025, URL changes to /2025, header updates', async ({ page }) => {
      // Start at current year (2026)
      const currentYear = new Date().getFullYear();
      await page.goto('/');
      await page.waitForSelector('[data-testid="year-navigation-header"]');

      // Verify we're at current year
      const yearDisplay = page.locator('[data-testid="current-year-display"]');
      await expect(yearDisplay).toHaveText(currentYear.toString());

      // Click left arrow button
      await page.click('[data-testid="prev-year-button"]');

      // Verify navigation to previous year
      await expect(yearDisplay).toHaveText((currentYear - 1).toString());

      // Verify URL updates to reflect the year path
      await expect(page).toHaveURL(new RegExp(`/${currentYear - 1}`));
    });
  });

  test.describe('Test Case 3: Click right arrow on 2025', () => {
    test('page navigates to 2026, URL changes to /2026, header updates', async ({ page }) => {
      // Navigate to 2025
      await page.goto('/2025');
      await page.waitForSelector('[data-testid="year-navigation-header"]');

      const yearDisplay = page.locator('[data-testid="current-year-display"]');
      await expect(yearDisplay).toHaveText('2025');

      // Click right arrow button
      await page.click('[data-testid="next-year-button"]');

      // Verify navigation to 2026
      const currentYear = new Date().getFullYear();
      await expect(yearDisplay).toHaveText(currentYear.toString());
      await expect(page).toHaveURL(new RegExp(`/${currentYear}`));
    });
  });

  test.describe('Test Case 4: Navigate to earliest year (2020)', () => {
    test('left arrow is disabled or visually hidden, right arrow is enabled', async ({ page }) => {
      // Navigate to earliest year
      await page.goto('/2020');
      await page.waitForSelector('[data-testid="year-navigation-header"]');

      const prevButton = page.locator('[data-testid="prev-year-button"]');
      const nextButton = page.locator('[data-testid="next-year-button"]');

      // Verify left arrow is disabled
      await expect(prevButton).toBeDisabled();

      // Verify right arrow is enabled
      await expect(nextButton).toBeEnabled();
    });
  });

  test.describe('Test Case 5: Navigate to latest year (2026)', () => {
    test('right arrow is disabled or visually hidden, left arrow is enabled', async ({ page }) => {
      // Navigate to current year (latest)
      const currentYear = new Date().getFullYear();
      await page.goto(`/${currentYear}`);
      await page.waitForSelector('[data-testid="year-navigation-header"]');

      const prevButton = page.locator('[data-testid="prev-year-button"]');
      const nextButton = page.locator('[data-testid="next-year-button"]');

      // Verify right arrow is disabled
      await expect(nextButton).toBeDisabled();

      // Verify left arrow is enabled
      await expect(prevButton).toBeEnabled();
    });
  });

  test.describe('Test Case 6: Header component renders (E2E validation)', () => {
    test('component displays left arrow, current year prominently, and right arrow in clean design', async ({ page }) => {
      await page.goto('/2024');
      await page.waitForSelector('[data-testid="year-navigation-header"]');

      // Verify header exists
      const header = page.locator('[data-testid="year-navigation-header"]');
      await expect(header).toBeVisible();

      // Verify integrated year navigation structure
      const yearNavigation = page.locator('[data-testid="year-navigation-integrated"]');
      await expect(yearNavigation).toBeVisible();

      // Verify left arrow (←) is present
      const prevButton = page.locator('[data-testid="prev-year-button"]');
      await expect(prevButton).toBeVisible();
      await expect(prevButton).toContainText('←');

      // Verify current year is prominently displayed
      const yearDisplay = page.locator('[data-testid="current-year-display"]');
      await expect(yearDisplay).toBeVisible();
      await expect(yearDisplay).toHaveText('2024');

      // Verify right arrow (→) is present
      const nextButton = page.locator('[data-testid="next-year-button"]');
      await expect(nextButton).toBeVisible();
      await expect(nextButton).toContainText('→');
    });
  });

  test.describe('Test Case 7: Verify no duplicate year display', () => {
    test('year appears only once in the UI (not in both navigation and title)', async ({ page }) => {
      await page.goto('/2024');
      await page.waitForSelector('[data-testid="year-navigation-header"]');

      // Get all text from the page
      const bodyText = await page.locator('body').textContent();

      // Count occurrences of "2024" in the page text
      const yearMatches = bodyText.match(/2024/g);

      // The year should appear exactly once (in the integrated navigation only)
      expect(yearMatches).not.toBeNull();
      expect(yearMatches.length).toBe(1);

      // Verify there's no separate pageTitle element showing the year
      // The year should only be in the year-navigation-integrated area
      const yearInIntegratedNav = page.locator('[data-testid="year-navigation-integrated"]');
      const yearText = await yearInIntegratedNav.locator('[data-testid="current-year-display"]').textContent();
      expect(yearText).toBe('2024');
    });
  });

  test.describe('URL State Persistence', () => {
    test('URL updates with year path when navigating via arrows', async ({ page }) => {
      await page.goto('/');
      await page.waitForSelector('[data-testid="year-navigation-header"]');

      const currentYear = new Date().getFullYear();

      // Click left arrow
      await page.click('[data-testid="prev-year-button"]');

      // Verify URL has updated
      await expect(page).toHaveURL(new RegExp(`/${currentYear - 1}`));
    });

    test('navigating directly to a year URL shows correct year in integrated header', async ({ page }) => {
      await page.goto('/2022');
      await page.waitForSelector('[data-testid="year-navigation-header"]');

      const yearDisplay = page.locator('[data-testid="current-year-display"]');
      await expect(yearDisplay).toHaveText('2022');
    });

    test('browser back button works with integrated header', async ({ page }) => {
      // Start at 2024
      await page.goto('/2024');
      await page.waitForSelector('[data-testid="year-navigation-header"]');

      // Navigate to 2023 via left arrow
      await page.click('[data-testid="prev-year-button"]');
      await expect(page).toHaveURL(/\/2023/);

      // Go back
      await page.goBack();

      // Verify we're back at 2024
      const yearDisplay = page.locator('[data-testid="current-year-display"]');
      await expect(yearDisplay).toHaveText('2024');
      await expect(page).toHaveURL(/\/2024/);
    });
  });

  test.describe('Keyboard Navigation', () => {
    test('can navigate using Enter key on left arrow button', async ({ page }) => {
      await page.goto('/2024');
      await page.waitForSelector('[data-testid="year-navigation-header"]');

      const prevButton = page.locator('[data-testid="prev-year-button"]');
      await prevButton.focus();
      await page.keyboard.press('Enter');

      const yearDisplay = page.locator('[data-testid="current-year-display"]');
      await expect(yearDisplay).toHaveText('2023');
    });

    test('can navigate using Enter key on right arrow button', async ({ page }) => {
      await page.goto('/2023');
      await page.waitForSelector('[data-testid="year-navigation-header"]');

      const nextButton = page.locator('[data-testid="next-year-button"]');
      await nextButton.focus();
      await page.keyboard.press('Enter');

      const yearDisplay = page.locator('[data-testid="current-year-display"]');
      await expect(yearDisplay).toHaveText('2024');
    });
  });

  test.describe('Accessibility', () => {
    test('arrow buttons have proper aria-labels', async ({ page }) => {
      await page.goto('/2024');
      await page.waitForSelector('[data-testid="year-navigation-header"]');

      const prevButton = page.locator('[data-testid="prev-year-button"]');
      const nextButton = page.locator('[data-testid="next-year-button"]');

      await expect(prevButton).toHaveAttribute('aria-label', 'Navigate to previous year 2023');
      await expect(nextButton).toHaveAttribute('aria-label', 'Navigate to next year 2025');
    });

    test('disabled buttons have aria-disabled attribute', async ({ page }) => {
      await page.goto('/2020');
      await page.waitForSelector('[data-testid="year-navigation-header"]');

      const prevButton = page.locator('[data-testid="prev-year-button"]');
      await expect(prevButton).toHaveAttribute('aria-disabled', 'true');
    });
  });

  test.describe('Disabled Buttons Behavior', () => {
    test('disabled left arrow does not respond to clicks at earliest year', async ({ page }) => {
      await page.goto('/2020');
      await page.waitForSelector('[data-testid="year-navigation-header"]');

      const yearDisplay = page.locator('[data-testid="current-year-display"]');
      await expect(yearDisplay).toHaveText('2020');

      // Try clicking disabled left arrow button
      await page.click('[data-testid="prev-year-button"]', { force: true });

      // Year should remain at 2020
      await expect(yearDisplay).toHaveText('2020');
      await expect(page).toHaveURL(/\/2020/);
    });

    test('disabled right arrow does not respond to clicks at latest year', async ({ page }) => {
      const currentYear = new Date().getFullYear();
      await page.goto(`/${currentYear}`);
      await page.waitForSelector('[data-testid="year-navigation-header"]');

      const yearDisplay = page.locator('[data-testid="current-year-display"]');
      await expect(yearDisplay).toHaveText(currentYear.toString());

      // Try clicking disabled right arrow button
      await page.click('[data-testid="next-year-button"]', { force: true });

      // Year should remain at current year
      await expect(yearDisplay).toHaveText(currentYear.toString());
    });
  });
});
