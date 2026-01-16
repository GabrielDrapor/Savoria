import { test, expect } from '@playwright/test';

test.describe('URL State Persistence', () => {
  test.describe('Test Case 1: Select year via year selector', () => {
    test('URL updates to include ?year=2023 when year is selected', async ({ page }) => {
      // Navigate to the app with current year (no year parameter)
      await page.goto('/');
      await page.waitForLoadState('networkidle');

      // Click on year selector trigger to open dropdown
      const yearTrigger = page.locator('[data-testid="year-selector-trigger"]');
      await yearTrigger.click();

      // Select 2023 from the dropdown
      const year2023Option = page.locator('[data-testid="year-option-2023"]');
      await year2023Option.click();

      // Verify URL updates to include ?year=2023
      await expect(page).toHaveURL(/\?year=2023/);
    });
  });

  test.describe('Test Case 2: Direct navigation to year', () => {
    test('Page loads with 2023 data when navigating to /?year=2023', async ({ page }) => {
      // Navigate directly to URL with year parameter
      await page.goto('/?year=2023');
      await page.waitForLoadState('networkidle');

      // Verify the page title shows 2023
      const pageTitle = page.locator('.pageTitle');
      await expect(pageTitle).toContainText('2023');

      // Verify the year selector shows 2023 as selected
      const selectedYear = page.locator('[data-testid="selected-year"]');
      await expect(selectedYear).toHaveText('2023');
    });
  });

  test.describe('Test Case 3: Year selector reflects URL parameter', () => {
    test('Year selector shows 2024 as selected when navigating to /?year=2024', async ({ page }) => {
      // Navigate directly to URL with year=2024
      await page.goto('/?year=2024');
      await page.waitForLoadState('networkidle');

      // Verify year selector shows 2024 as selected
      const selectedYear = page.locator('[data-testid="selected-year"]');
      await expect(selectedYear).toHaveText('2024');

      // Verify the page title shows 2024
      const pageTitle = page.locator('.pageTitle');
      await expect(pageTitle).toContainText('2024');
    });
  });

  test.describe('Test Case 4: Invalid year handling', () => {
    test('Falls back to current year gracefully for invalid year parameter', async ({ page }) => {
      // Navigate to URL with invalid year parameter
      await page.goto('/?year=invalid');
      await page.waitForLoadState('networkidle');

      const currentYear = new Date().getFullYear().toString();

      // Verify the page falls back to current year
      const pageTitle = page.locator('.pageTitle');
      await expect(pageTitle).toContainText(currentYear);

      // Verify the year selector shows current year
      const selectedYear = page.locator('[data-testid="selected-year"]');
      await expect(selectedYear).toHaveText(currentYear);
    });
  });

  test.describe('Test Case 5: Out of range year handling', () => {
    test('Falls back to earliest supported year (2020) for year=1999', async ({ page }) => {
      // Navigate to URL with out-of-range year (before earliest supported)
      await page.goto('/?year=1999');
      await page.waitForLoadState('networkidle');

      // Verify the page falls back to earliest supported year (2020)
      const pageTitle = page.locator('.pageTitle');
      await expect(pageTitle).toContainText('2020');

      // Verify the year selector shows 2020
      const selectedYear = page.locator('[data-testid="selected-year"]');
      await expect(selectedYear).toHaveText('2020');
    });
  });

  test.describe('URL state synchronization', () => {
    test('Changing year updates URL without page reload', async ({ page }) => {
      // Navigate to the app
      await page.goto('/');
      await page.waitForLoadState('networkidle');

      // Track page load events
      let reloaded = false;
      page.on('load', () => {
        reloaded = true;
      });

      // Click on year selector trigger to open dropdown
      const yearTrigger = page.locator('[data-testid="year-selector-trigger"]');
      await yearTrigger.click();

      // Select 2023 from the dropdown
      const year2023Option = page.locator('[data-testid="year-option-2023"]');
      await year2023Option.click();

      // Wait a bit to ensure no reload happens
      await page.waitForTimeout(500);

      // Verify URL changed without reload
      await expect(page).toHaveURL(/\?year=2023/);
      expect(reloaded).toBe(false);
    });

    test('Browser back button preserves year state', async ({ page }) => {
      // Navigate to current year first
      await page.goto('/');
      await page.waitForLoadState('networkidle');

      const yearTrigger = page.locator('[data-testid="year-selector-trigger"]');

      // Select 2023
      await yearTrigger.click();
      await page.locator('[data-testid="year-option-2023"]').click();
      await expect(page).toHaveURL(/\?year=2023/);

      // Select 2022
      await yearTrigger.click();
      await page.locator('[data-testid="year-option-2022"]').click();
      await expect(page).toHaveURL(/\?year=2022/);

      // Go back in browser history
      await page.goBack();

      // Verify URL and selector show 2023
      await expect(page).toHaveURL(/\?year=2023/);
      const selectedYear = page.locator('[data-testid="selected-year"]');
      await expect(selectedYear).toHaveText('2023');
    });
  });
});
