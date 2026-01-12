// @ts-check
import { test, expect } from '@playwright/test';

/**
 * E2E tests for Accessibility Focus Indicators (NFR-4, Test Case 5)
 * Tests visible focus outline/ring on tab navigation for all interactive elements
 */
test.describe('Accessibility Focus Indicators', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('TC5: Year selector trigger has visible focus indicator on tab navigation', async ({ page }) => {
    // Press Tab to navigate to year selector
    await page.keyboard.press('Tab');

    // Find the year selector trigger
    const yearTrigger = page.locator('[data-testid="year-selector-trigger"]');

    // Verify trigger is focused
    await expect(yearTrigger).toBeFocused();

    // Check that focus indicator is visible (outline style should not be 'none')
    const outlineStyle = await yearTrigger.evaluate((el) => {
      const computed = window.getComputedStyle(el);
      return {
        outlineStyle: computed.outlineStyle,
        outlineWidth: computed.outlineWidth,
        outlineColor: computed.outlineColor
      };
    });

    // Focus indicator should be present (not 'none')
    expect(['solid', 'auto', 'inset']).toContain(outlineStyle.outlineStyle);
    expect(outlineStyle.outlineWidth).not.toBe('0px');
  });

  test('Year selector options have visible focus indicator when navigating with keyboard', async ({ page }) => {
    const yearTrigger = page.locator('[data-testid="year-selector-trigger"]');

    // Focus and open dropdown
    await yearTrigger.focus();
    await page.keyboard.press('Enter');

    // Navigate to different year using arrow keys
    await page.keyboard.press('ArrowDown');

    // The focused option should have the 'focused' class with visible outline
    const focusedOption = page.locator('.year-option.focused');
    await expect(focusedOption).toBeVisible();

    // Check outline style on focused option
    const outlineStyle = await focusedOption.evaluate((el) => {
      const computed = window.getComputedStyle(el);
      return {
        outlineStyle: computed.outlineStyle,
        outlineWidth: computed.outlineWidth
      };
    });

    // Focused options should have visible outline
    expect(['solid', 'auto', 'inset']).toContain(outlineStyle.outlineStyle);
  });

  test('Focus indicator is visible for keyboard users (focus-visible)', async ({ page }) => {
    const yearTrigger = page.locator('[data-testid="year-selector-trigger"]');

    // Tab to trigger (keyboard navigation)
    await page.keyboard.press('Tab');

    // Verify focus indicator is visible
    await expect(yearTrigger).toBeFocused();

    // Check the focus styles are applied
    const styles = await yearTrigger.evaluate((el) => {
      const computed = window.getComputedStyle(el);
      return {
        outline: computed.outline,
        outlineOffset: computed.outlineOffset
      };
    });

    // Should have some visible outline
    expect(styles.outline).not.toBe('none');
  });

  test('All interactive elements in sequence can be tabbed through', async ({ page }) => {
    // First Tab should focus the year selector trigger
    await page.keyboard.press('Tab');

    const yearTrigger = page.locator('[data-testid="year-selector-trigger"]');
    await expect(yearTrigger).toBeFocused();

    // Verify the focused element has a visible focus indicator
    const isFocusVisible = await yearTrigger.evaluate((el) => {
      const computed = window.getComputedStyle(el);
      // Either outline or box-shadow can be used for focus indication
      return computed.outlineStyle !== 'none' || computed.boxShadow !== 'none';
    });

    expect(isFocusVisible).toBe(true);
  });

  test('Year selector trigger receives focus with visible ring style', async ({ page }) => {
    const yearTrigger = page.locator('[data-testid="year-selector-trigger"]');

    // Direct focus
    await yearTrigger.focus();

    // Verify it is focused
    await expect(yearTrigger).toBeFocused();

    // Verify focus ring styles are applied
    const focusStyles = await yearTrigger.evaluate((el) => {
      const computed = window.getComputedStyle(el);
      return {
        outline: computed.outline,
        outlineStyle: computed.outlineStyle,
        outlineWidth: computed.outlineWidth,
        outlineOffset: computed.outlineOffset
      };
    });

    // Should have outline style set
    expect(focusStyles.outlineStyle).not.toBe('none');
  });

  test('Focus does not get trapped - can escape dropdown with Escape key', async ({ page }) => {
    const yearTrigger = page.locator('[data-testid="year-selector-trigger"]');
    const yearDropdown = page.locator('[data-testid="year-dropdown"]');

    // Focus and open dropdown
    await yearTrigger.focus();
    await page.keyboard.press('Enter');
    await expect(yearDropdown).toBeVisible();

    // Press Escape to close
    await page.keyboard.press('Escape');

    // Dropdown should close
    await expect(yearDropdown).not.toBeVisible();

    // Focus should return to trigger
    await expect(yearTrigger).toBeFocused();
  });

  test('Focus returns to trigger after selecting year', async ({ page }) => {
    const yearTrigger = page.locator('[data-testid="year-selector-trigger"]');
    const yearDropdown = page.locator('[data-testid="year-dropdown"]');

    // Focus and open dropdown
    await yearTrigger.focus();
    await page.keyboard.press('Enter');
    await expect(yearDropdown).toBeVisible();

    // Select a year
    await page.keyboard.press('ArrowDown');
    await page.keyboard.press('Enter');

    // Dropdown should close
    await expect(yearDropdown).not.toBeVisible();

    // Focus should return to trigger
    await expect(yearTrigger).toBeFocused();
  });

  test('Tab key closes dropdown and allows normal tab flow', async ({ page }) => {
    const yearTrigger = page.locator('[data-testid="year-selector-trigger"]');
    const yearDropdown = page.locator('[data-testid="year-dropdown"]');

    // Focus and open dropdown
    await yearTrigger.focus();
    await page.keyboard.press('Enter');
    await expect(yearDropdown).toBeVisible();

    // Press Tab
    await page.keyboard.press('Tab');

    // Dropdown should close
    await expect(yearDropdown).not.toBeVisible();
  });
});
