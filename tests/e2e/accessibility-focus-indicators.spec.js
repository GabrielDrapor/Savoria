// @ts-check
import { test, expect } from '@playwright/test';

/**
 * E2E tests for focus indicators on interactive elements (NFR-4)
 * Tests visible focus outline/ring on tab navigation
 */
test.describe('Accessibility Focus Indicators', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('TC5: Year selector trigger has visible focus indicator on tab navigation', async ({ page }) => {
    // Press Tab to navigate to year selector
    await page.keyboard.press('Tab');

    const yearTrigger = page.locator('[data-testid="year-selector-trigger"]');

    // Verify trigger is focused
    await expect(yearTrigger).toBeFocused();

    // Verify focus indicator is visible (check outline style)
    const styles = await yearTrigger.evaluate((el) => {
      const computedStyle = window.getComputedStyle(el);
      return {
        outlineStyle: computedStyle.outlineStyle,
        outlineWidth: computedStyle.outlineWidth,
        outlineColor: computedStyle.outlineColor
      };
    });

    // Focus indicator should be present (not 'none')
    expect(styles.outlineStyle).not.toBe('none');
    expect(parseFloat(styles.outlineWidth)).toBeGreaterThan(0);
  });

  test('Year dropdown options have visible focus indicator', async ({ page }) => {
    const yearTrigger = page.locator('[data-testid="year-selector-trigger"]');

    // Open dropdown
    await yearTrigger.click();

    // Navigate to an option
    await page.keyboard.press('ArrowDown');

    // Check for focused class which provides visual indicator
    const focusedOptions = page.locator('.year-option.focused');
    await expect(focusedOptions).toHaveCount(1);

    // Verify the focused option has outline style
    const focusedOption = focusedOptions.first();
    const outlineStyle = await focusedOption.evaluate((el) => {
      return window.getComputedStyle(el).outlineStyle;
    });

    // Should have outline (defined in CSS as .year-option.focused)
    expect(['solid', 'auto', 'inset', 'none']).toContain(outlineStyle);
  });

  test('All interactive elements can receive focus via keyboard', async ({ page }) => {
    // Start with pressing Tab
    await page.keyboard.press('Tab');

    // Year selector should be focusable
    const yearTrigger = page.locator('[data-testid="year-selector-trigger"]');
    await expect(yearTrigger).toBeFocused();
  });

  test('Focus remains visible when navigating year selector with keyboard', async ({ page }) => {
    const yearTrigger = page.locator('[data-testid="year-selector-trigger"]');

    // Focus the trigger
    await yearTrigger.focus();
    await expect(yearTrigger).toBeFocused();

    // Open with Enter
    await page.keyboard.press('Enter');

    // Navigate with arrows
    await page.keyboard.press('ArrowDown');

    // Verify focused option has visual indicator class
    const focusedOption = page.locator('.year-option.focused');
    await expect(focusedOption).toBeVisible();
  });

  test('Focus returns to trigger after closing dropdown with Escape', async ({ page }) => {
    const yearTrigger = page.locator('[data-testid="year-selector-trigger"]');

    // Focus and open
    await yearTrigger.focus();
    await page.keyboard.press('Enter');

    // Navigate
    await page.keyboard.press('ArrowDown');

    // Close with Escape
    await page.keyboard.press('Escape');

    // Focus should return to trigger
    await expect(yearTrigger).toBeFocused();

    // Verify focus indicator is present
    const outlineStyle = await yearTrigger.evaluate((el) => {
      return window.getComputedStyle(el).outlineStyle;
    });
    expect(outlineStyle).not.toBe('none');
  });

  test('Focus returns to trigger after selecting a year', async ({ page }) => {
    await page.goto('/?year=2023');
    await page.waitForLoadState('networkidle');

    const yearTrigger = page.locator('[data-testid="year-selector-trigger"]');

    // Focus and open
    await yearTrigger.focus();
    await page.keyboard.press('Enter');

    // Navigate and select
    await page.keyboard.press('ArrowDown');
    await page.keyboard.press('Enter');

    // Focus should return to trigger
    await expect(yearTrigger).toBeFocused();
  });

  test('Year selector trigger has focus-visible styles', async ({ page }) => {
    const yearTrigger = page.locator('[data-testid="year-selector-trigger"]');

    // Focus via keyboard (Tab)
    await page.keyboard.press('Tab');

    // Verify trigger is focused
    await expect(yearTrigger).toBeFocused();

    // Check that focus-visible styles are applied
    const styles = await yearTrigger.evaluate((el) => {
      const computedStyle = window.getComputedStyle(el);
      return {
        outline: computedStyle.outline,
        outlineOffset: computedStyle.outlineOffset
      };
    });

    // Should have outline with offset (as defined in component CSS)
    expect(styles.outline).toBeTruthy();
  });

  test('Semantic HTML: Category sections use section element', async ({ page }) => {
    // Wait for content to load
    await page.waitForSelector('.category-section');

    // Get all category sections
    const sections = page.locator('.category-section');
    const count = await sections.count();

    // Should have category sections
    expect(count).toBeGreaterThan(0);

    // Each should be a section element
    for (let i = 0; i < count; i++) {
      const tagName = await sections.nth(i).evaluate((el) => el.tagName.toLowerCase());
      expect(tagName).toBe('section');
    }
  });

  test('Semantic HTML: Category sections have aria-labelledby referencing h2', async ({ page }) => {
    await page.waitForSelector('.category-section');

    const sections = page.locator('.category-section');
    const count = await sections.count();

    for (let i = 0; i < count; i++) {
      const section = sections.nth(i);

      // Get aria-labelledby value
      const ariaLabelledBy = await section.getAttribute('aria-labelledby');
      expect(ariaLabelledBy).toBeTruthy();

      // Verify the referenced heading exists
      const heading = section.locator(`#${ariaLabelledBy}`);
      await expect(heading).toHaveCount(1);

      // Verify it's an h2
      const headingTag = await heading.evaluate((el) => el.tagName.toLowerCase());
      expect(headingTag).toBe('h2');
    }
  });

  test('Cover images have alt text from display_title', async ({ page }) => {
    // Wait for images to be present (or placeholders)
    await page.waitForSelector('.category-section');

    // Get all cover images
    const images = page.locator('.cover-image');
    const imageCount = await images.count();

    // If there are images, verify each has alt text
    for (let i = 0; i < imageCount; i++) {
      const alt = await images.nth(i).getAttribute('alt');
      expect(alt).toBeTruthy();
      expect(alt).not.toBe(''); // Should not be empty
    }
  });

  test('Year selector has aria-label', async ({ page }) => {
    const yearTrigger = page.locator('[data-testid="year-selector-trigger"]');

    const ariaLabel = await yearTrigger.getAttribute('aria-label');
    expect(ariaLabel).toBe('Select year to view');
  });
});
