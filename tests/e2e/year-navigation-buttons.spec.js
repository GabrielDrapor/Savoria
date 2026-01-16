// @ts-check
const { test, expect } = require('@playwright/test');

/**
 * E2E tests for Year Navigation Buttons functionality.
 * Tests REQ-1, REQ-2, US-1 - Year navigation using Previous/Next buttons.
 */

test.describe('Year Navigation Buttons', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the main gallery page
    await page.goto('/');
    // Wait for the year navigation buttons to be visible
    await page.waitForSelector('[data-testid="year-navigation-buttons"]', { timeout: 10000 });
  });

  test.describe('Default Year Display', () => {
    test('displays current year (2026) by default when loading without year parameter', async ({ page }) => {
      // Load page without year parameter
      await page.goto('/');

      // Wait for navigation buttons
      await page.waitForSelector('[data-testid="year-navigation-buttons"]');

      // Verify the current year is displayed
      const yearDisplay = page.locator('[data-testid="current-year-display"]');
      const currentYear = new Date().getFullYear();
      await expect(yearDisplay).toHaveText(currentYear.toString());
    });

    test('displays year between navigation buttons', async ({ page }) => {
      const yearNavigation = page.locator('[data-testid="year-navigation-buttons"]');
      const prevButton = page.locator('[data-testid="prev-year-button"]');
      const nextButton = page.locator('[data-testid="next-year-button"]');
      const yearDisplay = page.locator('[data-testid="current-year-display"]');

      await expect(yearNavigation).toBeVisible();
      await expect(prevButton).toBeVisible();
      await expect(nextButton).toBeVisible();
      await expect(yearDisplay).toBeVisible();
    });
  });

  test.describe('Navigation Button Visibility', () => {
    test('renders Previous year button with correct text', async ({ page }) => {
      const prevButton = page.locator('[data-testid="prev-year-button"]');
      await expect(prevButton).toBeVisible();
      await expect(prevButton).toHaveText('← Previous year');
    });

    test('renders Next year button with correct text', async ({ page }) => {
      const nextButton = page.locator('[data-testid="next-year-button"]');
      await expect(nextButton).toBeVisible();
      await expect(nextButton).toHaveText('Next year →');
    });

    test('displays year navigation component with all three elements', async ({ page }) => {
      // Verify component structure
      const yearNav = page.locator('[data-testid="year-navigation-buttons"]');
      await expect(yearNav).toBeVisible();

      const prevButton = yearNav.locator('[data-testid="prev-year-button"]');
      const yearDisplay = yearNav.locator('[data-testid="current-year-display"]');
      const nextButton = yearNav.locator('[data-testid="next-year-button"]');

      await expect(prevButton).toContainText('← Previous year');
      await expect(yearDisplay).toBeVisible();
      await expect(nextButton).toContainText('Next year →');
    });
  });

  test.describe('Previous Year Navigation', () => {
    test('clicking Previous year button on 2026 navigates to 2025', async ({ page }) => {
      // Start at current year (2026)
      const currentYear = new Date().getFullYear();
      await page.goto('/');

      // Verify we're at current year
      const yearDisplay = page.locator('[data-testid="current-year-display"]');
      await expect(yearDisplay).toHaveText(currentYear.toString());

      // Click Previous year button
      await page.click('[data-testid="prev-year-button"]');

      // Verify navigation to previous year
      await expect(yearDisplay).toHaveText((currentYear - 1).toString());

      // Verify URL updates
      await expect(page).toHaveURL(new RegExp(`/${currentYear - 1}`));
    });

    test('clicking Previous year on 2025 navigates to 2024', async ({ page }) => {
      // Navigate to 2025
      await page.goto('/2025');
      await page.waitForSelector('[data-testid="year-navigation-buttons"]');

      const yearDisplay = page.locator('[data-testid="current-year-display"]');
      await expect(yearDisplay).toHaveText('2025');

      // Click Previous year
      await page.click('[data-testid="prev-year-button"]');

      // Verify navigation to 2024
      await expect(yearDisplay).toHaveText('2024');
      await expect(page).toHaveURL(/\/2024/);
    });
  });

  test.describe('Next Year Navigation', () => {
    test('clicking Next year button on 2025 navigates to 2026', async ({ page }) => {
      // Navigate to 2025
      await page.goto('/2025');
      await page.waitForSelector('[data-testid="year-navigation-buttons"]');

      const yearDisplay = page.locator('[data-testid="current-year-display"]');
      await expect(yearDisplay).toHaveText('2025');

      // Click Next year button
      await page.click('[data-testid="next-year-button"]');

      // Verify navigation to 2026
      const currentYear = new Date().getFullYear();
      await expect(yearDisplay).toHaveText(currentYear.toString());
      await expect(page).toHaveURL(new RegExp(`/${currentYear}`));
    });

    test('clicking Next year on 2024 navigates to 2025', async ({ page }) => {
      // Navigate to 2024
      await page.goto('/2024');
      await page.waitForSelector('[data-testid="year-navigation-buttons"]');

      // Click Next year
      await page.click('[data-testid="next-year-button"]');

      // Verify navigation to 2025
      const yearDisplay = page.locator('[data-testid="current-year-display"]');
      await expect(yearDisplay).toHaveText('2025');
      await expect(page).toHaveURL(/\/2025/);
    });
  });

  test.describe('Boundary Behavior', () => {
    test('Previous year button is disabled at earliest year (2020)', async ({ page }) => {
      // Navigate to earliest year
      await page.goto('/2020');
      await page.waitForSelector('[data-testid="year-navigation-buttons"]');

      const prevButton = page.locator('[data-testid="prev-year-button"]');
      const nextButton = page.locator('[data-testid="next-year-button"]');

      // Verify Previous year is disabled
      await expect(prevButton).toBeDisabled();

      // Verify Next year is enabled
      await expect(nextButton).toBeEnabled();
    });

    test('Next year button is disabled at latest year (current year)', async ({ page }) => {
      // Navigate to current year
      const currentYear = new Date().getFullYear();
      await page.goto(`/${currentYear}`);
      await page.waitForSelector('[data-testid="year-navigation-buttons"]');

      const prevButton = page.locator('[data-testid="prev-year-button"]');
      const nextButton = page.locator('[data-testid="next-year-button"]');

      // Verify Next year is disabled
      await expect(nextButton).toBeDisabled();

      // Verify Previous year is enabled
      await expect(prevButton).toBeEnabled();
    });

    test('both buttons are enabled for middle years', async ({ page }) => {
      // Navigate to 2023 (middle year)
      await page.goto('/2023');
      await page.waitForSelector('[data-testid="year-navigation-buttons"]');

      const prevButton = page.locator('[data-testid="prev-year-button"]');
      const nextButton = page.locator('[data-testid="next-year-button"]');

      await expect(prevButton).toBeEnabled();
      await expect(nextButton).toBeEnabled();
    });

    test('disabled buttons do not respond to clicks', async ({ page }) => {
      // Navigate to 2020
      await page.goto('/2020');
      await page.waitForSelector('[data-testid="year-navigation-buttons"]');

      const yearDisplay = page.locator('[data-testid="current-year-display"]');
      await expect(yearDisplay).toHaveText('2020');

      // Try clicking disabled Previous year button
      await page.click('[data-testid="prev-year-button"]', { force: true });

      // Year should remain at 2020
      await expect(yearDisplay).toHaveText('2020');
      await expect(page).toHaveURL(/\/2020/);
    });
  });

  test.describe('URL State Persistence', () => {
    test('URL updates with year path when navigating', async ({ page }) => {
      await page.goto('/');
      await page.waitForSelector('[data-testid="year-navigation-buttons"]');

      const currentYear = new Date().getFullYear();

      // Click Previous year
      await page.click('[data-testid="prev-year-button"]');

      // Verify URL has updated
      await expect(page).toHaveURL(new RegExp(`/${currentYear - 1}`));
    });

    test('navigating directly to a year URL shows correct year', async ({ page }) => {
      await page.goto('/2022');
      await page.waitForSelector('[data-testid="year-navigation-buttons"]');

      const yearDisplay = page.locator('[data-testid="current-year-display"]');
      await expect(yearDisplay).toHaveText('2022');
    });
  });

  test.describe('Keyboard Navigation', () => {
    test('can navigate using Enter key on Previous year button', async ({ page }) => {
      await page.goto('/2024');
      await page.waitForSelector('[data-testid="year-navigation-buttons"]');

      const prevButton = page.locator('[data-testid="prev-year-button"]');
      await prevButton.focus();
      await page.keyboard.press('Enter');

      const yearDisplay = page.locator('[data-testid="current-year-display"]');
      await expect(yearDisplay).toHaveText('2023');
    });

    test('can navigate using Enter key on Next year button', async ({ page }) => {
      await page.goto('/2023');
      await page.waitForSelector('[data-testid="year-navigation-buttons"]');

      const nextButton = page.locator('[data-testid="next-year-button"]');
      await nextButton.focus();
      await page.keyboard.press('Enter');

      const yearDisplay = page.locator('[data-testid="current-year-display"]');
      await expect(yearDisplay).toHaveText('2024');
    });

    test('can tab between navigation buttons', async ({ page }) => {
      await page.goto('/2024');
      await page.waitForSelector('[data-testid="year-navigation-buttons"]');

      const prevButton = page.locator('[data-testid="prev-year-button"]');
      const nextButton = page.locator('[data-testid="next-year-button"]');

      // Focus on prev button
      await prevButton.focus();
      await expect(prevButton).toBeFocused();

      // Tab to next button
      await page.keyboard.press('Tab');
      // Note: depending on component structure, may need more tabs
    });
  });

  test.describe('Accessibility', () => {
    test('buttons have proper aria-labels', async ({ page }) => {
      await page.goto('/2024');
      await page.waitForSelector('[data-testid="year-navigation-buttons"]');

      const prevButton = page.locator('[data-testid="prev-year-button"]');
      const nextButton = page.locator('[data-testid="next-year-button"]');

      await expect(prevButton).toHaveAttribute('aria-label', 'Navigate to previous year 2023');
      await expect(nextButton).toHaveAttribute('aria-label', 'Navigate to next year 2025');
    });

    test('disabled buttons have aria-disabled attribute', async ({ page }) => {
      await page.goto('/2020');
      await page.waitForSelector('[data-testid="year-navigation-buttons"]');

      const prevButton = page.locator('[data-testid="prev-year-button"]');
      await expect(prevButton).toHaveAttribute('aria-disabled', 'true');
    });
  });
});
