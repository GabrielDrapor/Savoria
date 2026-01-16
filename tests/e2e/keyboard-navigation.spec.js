// @ts-check
import { test, expect } from '@playwright/test';

/**
 * E2E tests for keyboard navigation support (NFR-3, NFR-4, US-7)
 * Tests the year selector component's keyboard accessibility
 */
test.describe('Keyboard Navigation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('TC1: Tab to year selector - Year selector receives focus with visible focus indicator', async ({ page }) => {
    // Press Tab to navigate to year selector
    await page.keyboard.press('Tab');

    // Find the year selector trigger
    const yearTrigger = page.locator('[data-testid="year-selector-trigger"]');

    // Verify trigger is focused
    await expect(yearTrigger).toBeFocused();

    // Verify focus indicator is visible (check outline or similar style)
    // The component has :focus-visible styles
    const outlineStyle = await yearTrigger.evaluate((el) => {
      return window.getComputedStyle(el).outlineStyle;
    });
    // Focus indicator should be present (not 'none')
    expect(['solid', 'auto', 'inset']).toContain(outlineStyle);
  });

  test('TC2: Press Enter on focused year selector - Year dropdown opens', async ({ page }) => {
    const yearTrigger = page.locator('[data-testid="year-selector-trigger"]');
    const yearDropdown = page.locator('[data-testid="year-dropdown"]');

    // Focus the trigger
    await yearTrigger.focus();

    // Press Enter to open dropdown
    await page.keyboard.press('Enter');

    // Verify dropdown is visible
    await expect(yearDropdown).toBeVisible();

    // Verify aria-expanded is true
    await expect(yearTrigger).toHaveAttribute('aria-expanded', 'true');
  });

  test('TC2b: Press Space on focused year selector - Year dropdown opens', async ({ page }) => {
    const yearTrigger = page.locator('[data-testid="year-selector-trigger"]');
    const yearDropdown = page.locator('[data-testid="year-dropdown"]');

    // Focus the trigger
    await yearTrigger.focus();

    // Press Space to open dropdown
    await page.keyboard.press('Space');

    // Verify dropdown is visible
    await expect(yearDropdown).toBeVisible();

    // Verify aria-expanded is true
    await expect(yearTrigger).toHaveAttribute('aria-expanded', 'true');
  });

  test('TC3: Press Down Arrow in open dropdown - Focus moves to next year option', async ({ page }) => {
    // Start at year 2023 for predictable testing
    await page.goto('/?year=2023');
    await page.waitForLoadState('networkidle');

    const yearTrigger = page.locator('[data-testid="year-selector-trigger"]');

    // Focus and open dropdown
    await yearTrigger.focus();
    await page.keyboard.press('Enter');

    // Verify 2023 is initially focused (via focused class)
    const year2023Option = page.locator('[data-testid="year-option-2023"]');
    await expect(year2023Option).toHaveClass(/focused/);

    // Press ArrowDown
    await page.keyboard.press('ArrowDown');

    // Verify 2024 is now focused
    const year2024Option = page.locator('[data-testid="year-option-2024"]');
    await expect(year2024Option).toHaveClass(/focused/);

    // 2023 should no longer be focused
    await expect(year2023Option).not.toHaveClass(/focused/);
  });

  test('TC3b: Press Up Arrow in open dropdown - Focus moves to previous year option', async ({ page }) => {
    // Start at year 2023
    await page.goto('/?year=2023');
    await page.waitForLoadState('networkidle');

    const yearTrigger = page.locator('[data-testid="year-selector-trigger"]');

    // Focus and open dropdown
    await yearTrigger.focus();
    await page.keyboard.press('Enter');

    // Press ArrowUp
    await page.keyboard.press('ArrowUp');

    // Verify 2022 is now focused
    const year2022Option = page.locator('[data-testid="year-option-2022"]');
    await expect(year2022Option).toHaveClass(/focused/);
  });

  test('TC4: Press Enter on highlighted year option - Year is selected, dropdown closes, page updates', async ({ page }) => {
    // Start at current year
    const currentYear = new Date().getFullYear();

    const yearTrigger = page.locator('[data-testid="year-selector-trigger"]');
    const yearDropdown = page.locator('[data-testid="year-dropdown"]');

    // Focus and open dropdown
    await yearTrigger.focus();
    await page.keyboard.press('Enter');
    await expect(yearDropdown).toBeVisible();

    // Navigate to 2023 using Home then Down arrows
    await page.keyboard.press('Home'); // Go to 2020
    await page.keyboard.press('ArrowDown'); // 2021
    await page.keyboard.press('ArrowDown'); // 2022
    await page.keyboard.press('ArrowDown'); // 2023

    // Verify 2023 is focused
    const year2023Option = page.locator('[data-testid="year-option-2023"]');
    await expect(year2023Option).toHaveClass(/focused/);

    // Press Enter to select
    await page.keyboard.press('Enter');

    // Verify dropdown closes
    await expect(yearDropdown).not.toBeVisible();

    // Verify year is updated in the selector
    const selectedYear = page.locator('[data-testid="selected-year"]');
    await expect(selectedYear).toHaveText('2023');

    // Verify URL is updated
    await expect(page).toHaveURL(/year=2023/);

    // Verify page title updates
    const pageTitle = page.locator('.pageTitle');
    await expect(pageTitle).toContainText('In 2023,');
  });

  test('TC5: Press Escape in open dropdown - Dropdown closes without selection change', async ({ page }) => {
    const yearTrigger = page.locator('[data-testid="year-selector-trigger"]');
    const yearDropdown = page.locator('[data-testid="year-dropdown"]');
    const selectedYear = page.locator('[data-testid="selected-year"]');

    // Get initial year
    const initialYear = await selectedYear.textContent();

    // Open dropdown
    await yearTrigger.focus();
    await page.keyboard.press('Enter');
    await expect(yearDropdown).toBeVisible();

    // Navigate to a different year
    await page.keyboard.press('ArrowDown');
    await page.keyboard.press('ArrowDown');

    // Press Escape
    await page.keyboard.press('Escape');

    // Verify dropdown closes
    await expect(yearDropdown).not.toBeVisible();

    // Verify selected year hasn't changed
    await expect(selectedYear).toHaveText(initialYear);

    // Verify focus returns to trigger
    await expect(yearTrigger).toBeFocused();
  });

  test('TC6: Year selector component ARIA attributes - Has role="combobox", aria-expanded, aria-haspopup attributes', async ({ page }) => {
    const yearTrigger = page.locator('[data-testid="year-selector-trigger"]');
    const yearDropdown = page.locator('[data-testid="year-dropdown"]');

    // Verify combobox role
    await expect(yearTrigger).toHaveAttribute('role', 'combobox');

    // Verify aria-haspopup
    await expect(yearTrigger).toHaveAttribute('aria-haspopup', 'listbox');

    // Verify aria-expanded is false when closed
    await expect(yearTrigger).toHaveAttribute('aria-expanded', 'false');

    // Verify aria-controls
    await expect(yearTrigger).toHaveAttribute('aria-controls', 'year-listbox');

    // Open dropdown
    await yearTrigger.click();

    // Verify aria-expanded is true when open
    await expect(yearTrigger).toHaveAttribute('aria-expanded', 'true');

    // Verify dropdown has listbox role
    await expect(yearDropdown).toHaveAttribute('role', 'listbox');

    // Verify dropdown has matching id
    await expect(yearDropdown).toHaveAttribute('id', 'year-listbox');

    // Verify year options have option role
    const yearOption = page.locator('[data-testid="year-option-2023"]');
    await expect(yearOption).toHaveAttribute('role', 'option');
  });

  test('ArrowDown opens dropdown when it is closed', async ({ page }) => {
    const yearTrigger = page.locator('[data-testid="year-selector-trigger"]');
    const yearDropdown = page.locator('[data-testid="year-dropdown"]');

    // Focus the trigger
    await yearTrigger.focus();

    // Verify dropdown is closed
    await expect(yearDropdown).not.toBeVisible();

    // Press ArrowDown
    await page.keyboard.press('ArrowDown');

    // Verify dropdown opens
    await expect(yearDropdown).toBeVisible();
  });

  test('Home key jumps to first year option', async ({ page }) => {
    // Start at 2024 (middle of the range)
    await page.goto('/?year=2024');
    await page.waitForLoadState('networkidle');

    const yearTrigger = page.locator('[data-testid="year-selector-trigger"]');

    // Open dropdown
    await yearTrigger.focus();
    await page.keyboard.press('Enter');

    // Press Home
    await page.keyboard.press('Home');

    // Verify 2020 is focused
    const year2020Option = page.locator('[data-testid="year-option-2020"]');
    await expect(year2020Option).toHaveClass(/focused/);
  });

  test('End key jumps to last year option', async ({ page }) => {
    // Start at 2020
    await page.goto('/?year=2020');
    await page.waitForLoadState('networkidle');

    const yearTrigger = page.locator('[data-testid="year-selector-trigger"]');
    const currentYear = new Date().getFullYear();

    // Open dropdown
    await yearTrigger.focus();
    await page.keyboard.press('Enter');

    // Press End
    await page.keyboard.press('End');

    // Verify current year (last) is focused
    const currentYearOption = page.locator(`[data-testid="year-option-${currentYear}"]`);
    await expect(currentYearOption).toHaveClass(/focused/);
  });

  test('Tab key closes dropdown and moves focus to next element', async ({ page }) => {
    const yearTrigger = page.locator('[data-testid="year-selector-trigger"]');
    const yearDropdown = page.locator('[data-testid="year-dropdown"]');

    // Open dropdown
    await yearTrigger.focus();
    await page.keyboard.press('Enter');
    await expect(yearDropdown).toBeVisible();

    // Press Tab
    await page.keyboard.press('Tab');

    // Verify dropdown closes
    await expect(yearDropdown).not.toBeVisible();
  });

  test('aria-activedescendant updates when navigating options', async ({ page }) => {
    await page.goto('/?year=2023');
    await page.waitForLoadState('networkidle');

    const yearTrigger = page.locator('[data-testid="year-selector-trigger"]');

    // Open dropdown
    await yearTrigger.focus();
    await page.keyboard.press('Enter');

    // Verify initial aria-activedescendant points to 2023
    await expect(yearTrigger).toHaveAttribute('aria-activedescendant', 'year-option-id-2023');

    // Navigate down
    await page.keyboard.press('ArrowDown');

    // Verify aria-activedescendant updates to 2024
    await expect(yearTrigger).toHaveAttribute('aria-activedescendant', 'year-option-id-2024');
  });

  test('Selected option has aria-selected true', async ({ page }) => {
    await page.goto('/?year=2023');
    await page.waitForLoadState('networkidle');

    const yearTrigger = page.locator('[data-testid="year-selector-trigger"]');

    // Open dropdown
    await yearTrigger.click();

    // Verify 2023 has aria-selected true
    const year2023Option = page.locator('[data-testid="year-option-2023"]');
    await expect(year2023Option).toHaveAttribute('aria-selected', 'true');

    // Verify other years have aria-selected false
    const year2024Option = page.locator('[data-testid="year-option-2024"]');
    await expect(year2024Option).toHaveAttribute('aria-selected', 'false');
  });
});
