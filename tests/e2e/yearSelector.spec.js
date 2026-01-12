// @ts-check
import { test, expect } from '@playwright/test';

test.describe('Year Selector Navigation', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the gallery page
    await page.goto('/');
  });

  test('TC1: Load page without year parameter - Current year (2026) is displayed by default', async ({ page }) => {
    // Wait for page to load
    await page.waitForLoadState('networkidle');

    // Verify year selector shows current year
    const selectedYear = page.locator('[data-testid="selected-year"]');
    await expect(selectedYear).toBeVisible();

    // Get current year dynamically
    const currentYear = new Date().getFullYear();
    await expect(selectedYear).toHaveText(currentYear.toString());

    // Verify page title shows current year
    const pageTitle = page.locator('.pageTitle');
    await expect(pageTitle).toContainText(`In ${currentYear},`);
  });

  test('TC2: Click on year selector component - Dropdown opens showing years from 2020 to current year', async ({ page }) => {
    await page.waitForLoadState('networkidle');

    // Click on year selector
    const yearTrigger = page.locator('[data-testid="year-selector-trigger"]');
    await yearTrigger.click();

    // Verify dropdown is visible
    const yearDropdown = page.locator('[data-testid="year-dropdown"]');
    await expect(yearDropdown).toBeVisible();

    // Verify dropdown contains years from 2020 to current year
    const currentYear = new Date().getFullYear();

    // Check for 2020 (start year)
    const year2020Option = page.locator('[data-testid="year-option-2020"]');
    await expect(year2020Option).toBeVisible();
    await expect(year2020Option).toHaveText('2020');

    // Check for current year
    const currentYearOption = page.locator(`[data-testid="year-option-${currentYear}"]`);
    await expect(currentYearOption).toBeVisible();
    await expect(currentYearOption).toHaveText(currentYear.toString());

    // Verify all years in between are present
    for (let year = 2020; year <= currentYear; year++) {
      const yearOption = page.locator(`[data-testid="year-option-${year}"]`);
      await expect(yearOption).toBeVisible();
    }
  });

  test('TC3: Select year 2023 from dropdown - Gallery updates to show 2023 media consumption data', async ({ page }) => {
    await page.waitForLoadState('networkidle');

    // Open year selector
    const yearTrigger = page.locator('[data-testid="year-selector-trigger"]');
    await yearTrigger.click();

    // Select 2023
    const year2023Option = page.locator('[data-testid="year-option-2023"]');
    await year2023Option.click();

    // Verify selected year is updated to 2023
    const selectedYear = page.locator('[data-testid="selected-year"]');
    await expect(selectedYear).toHaveText('2023');

    // Verify page title updates
    const pageTitle = page.locator('.pageTitle');
    await expect(pageTitle).toContainText('In 2023,');

    // Verify URL is updated with year parameter
    await expect(page).toHaveURL(/year=2023/);

    // Verify dropdown closes after selection
    const yearDropdown = page.locator('[data-testid="year-dropdown"]');
    await expect(yearDropdown).not.toBeVisible();
  });

  test('Year selector maintains selection after page interaction', async ({ page }) => {
    await page.waitForLoadState('networkidle');

    // Select a different year
    const yearTrigger = page.locator('[data-testid="year-selector-trigger"]');
    await yearTrigger.click();

    const year2022Option = page.locator('[data-testid="year-option-2022"]');
    await year2022Option.click();

    // Wait for data to load
    await page.waitForLoadState('networkidle');

    // Verify year is still 2022
    const selectedYear = page.locator('[data-testid="selected-year"]');
    await expect(selectedYear).toHaveText('2022');
  });

  test('URL with year parameter loads correct year on page load', async ({ page }) => {
    // Navigate directly with year parameter
    await page.goto('/?year=2024');
    await page.waitForLoadState('networkidle');

    // Verify year selector shows 2024
    const selectedYear = page.locator('[data-testid="selected-year"]');
    await expect(selectedYear).toHaveText('2024');

    // Verify page title shows 2024
    const pageTitle = page.locator('.pageTitle');
    await expect(pageTitle).toContainText('In 2024,');
  });

  test('Year selector dropdown closes when clicking outside', async ({ page }) => {
    await page.waitForLoadState('networkidle');

    // Open dropdown
    const yearTrigger = page.locator('[data-testid="year-selector-trigger"]');
    await yearTrigger.click();

    // Verify dropdown is open
    const yearDropdown = page.locator('[data-testid="year-dropdown"]');
    await expect(yearDropdown).toBeVisible();

    // Click outside
    await page.locator('body').click({ position: { x: 10, y: 10 } });

    // Verify dropdown closes
    await expect(yearDropdown).not.toBeVisible();
  });

  test('Year selector has proper accessibility attributes', async ({ page }) => {
    await page.waitForLoadState('networkidle');

    const yearTrigger = page.locator('[data-testid="year-selector-trigger"]');

    // Check aria attributes when closed
    await expect(yearTrigger).toHaveAttribute('aria-expanded', 'false');
    await expect(yearTrigger).toHaveAttribute('aria-haspopup', 'listbox');

    // Open dropdown
    await yearTrigger.click();

    // Check aria attributes when open
    await expect(yearTrigger).toHaveAttribute('aria-expanded', 'true');

    // Check dropdown accessibility
    const yearDropdown = page.locator('[data-testid="year-dropdown"]');
    await expect(yearDropdown).toHaveAttribute('role', 'listbox');

    // Check year option accessibility
    const yearOption = page.locator('[data-testid="year-option-2023"]');
    await expect(yearOption).toHaveAttribute('role', 'option');
  });
});
