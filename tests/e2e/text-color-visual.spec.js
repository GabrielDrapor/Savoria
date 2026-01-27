/**
 * Text Color Visual - E2E Tests
 *
 * End-to-end visual verification tests using Playwright to confirm
 * that text displays as solid white in real browser environments.
 *
 * Covers:
 * - NFR-2: Cross-browser compatibility (Chromium, Firefox)
 * - NFR-3: Responsive behavior at 768px breakpoint
 * - Visual regression: No gradient visible
 *
 * Test approach:
 * - Navigate to the app and locate YearNavigationHeader
 * - Use getComputedStyle via page.evaluate to verify colors
 * - Test at different viewport widths (mobile, desktop)
 */

import { test, expect } from '@playwright/test';

/**
 * NFR-3: Responsive behavior at 768px breakpoint tests
 * Verifies responsive styles continue to function correctly after color change
 */
test.describe('NFR-3: Responsive behavior at 768px breakpoint', () => {
  test('TC1: @media (max-width: 768px) applies font-size: 3.5em to .page-title', async ({ page }) => {
    // Set mobile viewport width below breakpoint (767px)
    await page.setViewportSize({ width: 767, height: 800 });
    await page.goto('/');

    // Wait for the page title element
    const pageTitle = page.locator('.page-title');
    await expect(pageTitle).toBeVisible();

    // Verify font-size is 3.5em (converted to pixels: 3.5 * 16 = 56px at root level)
    const fontSize = await pageTitle.evaluate((el) => {
      return window.getComputedStyle(el).fontSize;
    });

    // 3.5em with default root font-size of 16px = 56px
    // Allow some tolerance for browser rounding
    const fontSizePx = parseFloat(fontSize);
    expect(fontSizePx).toBeGreaterThanOrEqual(54);
    expect(fontSizePx).toBeLessThanOrEqual(58);
  });

  test('TC2: Text displays in white at mobile viewport (767px)', async ({ page }) => {
    // Set mobile viewport width below breakpoint
    await page.setViewportSize({ width: 767, height: 800 });
    await page.goto('/');

    // Wait for the page title element
    const pageTitle = page.locator('.page-title');
    await expect(pageTitle).toBeVisible();

    // Verify color is white (rgb(255, 255, 255) or equivalent)
    const color = await pageTitle.evaluate((el) => {
      return window.getComputedStyle(el).color;
    });

    // White should be rgb(255, 255, 255)
    expect(color).toBe('rgb(255, 255, 255)');

    // Also verify the current year display is white
    const currentYear = page.locator('.current-year');
    await expect(currentYear).toBeVisible();

    const yearColor = await currentYear.evaluate((el) => {
      return window.getComputedStyle(el).color;
    });
    expect(yearColor).toBe('rgb(255, 255, 255)');
  });

  test('TC3: Text displays in white at desktop viewport (1024px) with full font-size (5.5em)', async ({ page }) => {
    // Set desktop viewport width above breakpoint
    await page.setViewportSize({ width: 1024, height: 800 });
    await page.goto('/');

    // Wait for the page title element
    const pageTitle = page.locator('.page-title');
    await expect(pageTitle).toBeVisible();

    // Verify color is white at desktop size
    const color = await pageTitle.evaluate((el) => {
      return window.getComputedStyle(el).color;
    });
    expect(color).toBe('rgb(255, 255, 255)');

    // Verify font-size is 5.5em (converted to pixels: 5.5 * 16 = 88px at root level)
    const fontSize = await pageTitle.evaluate((el) => {
      return window.getComputedStyle(el).fontSize;
    });

    // 5.5em with default root font-size of 16px = 88px
    // Allow some tolerance for browser rounding
    const fontSizePx = parseFloat(fontSize);
    expect(fontSizePx).toBeGreaterThanOrEqual(86);
    expect(fontSizePx).toBeLessThanOrEqual(90);
  });

  test('margin is reduced at mobile viewport (767px)', async ({ page }) => {
    // Set mobile viewport width below breakpoint
    await page.setViewportSize({ width: 767, height: 800 });
    await page.goto('/');

    // Wait for the page title element
    const pageTitle = page.locator('.page-title');
    await expect(pageTitle).toBeVisible();

    // Verify margin is 1.5rem 0 (1.5 * 16 = 24px at root level)
    const marginTop = await pageTitle.evaluate((el) => {
      return window.getComputedStyle(el).marginTop;
    });
    const marginBottom = await pageTitle.evaluate((el) => {
      return window.getComputedStyle(el).marginBottom;
    });

    const marginTopPx = parseFloat(marginTop);
    const marginBottomPx = parseFloat(marginBottom);

    // 1.5rem with default root font-size of 16px = 24px
    expect(marginTopPx).toBeGreaterThanOrEqual(22);
    expect(marginTopPx).toBeLessThanOrEqual(26);
    expect(marginBottomPx).toBeGreaterThanOrEqual(22);
    expect(marginBottomPx).toBeLessThanOrEqual(26);
  });

  test('title-prefix and title-suffix display in white at all viewport sizes', async ({ page }) => {
    // Test at mobile viewport
    await page.setViewportSize({ width: 767, height: 800 });
    await page.goto('/');

    const titlePrefix = page.locator('.title-prefix');
    const titleSuffix = page.locator('.title-suffix');

    await expect(titlePrefix).toBeVisible();
    await expect(titleSuffix).toBeVisible();

    // Verify mobile colors
    const prefixColorMobile = await titlePrefix.evaluate((el) => {
      return window.getComputedStyle(el).color;
    });
    const suffixColorMobile = await titleSuffix.evaluate((el) => {
      return window.getComputedStyle(el).color;
    });

    expect(prefixColorMobile).toBe('rgb(255, 255, 255)');
    expect(suffixColorMobile).toBe('rgb(255, 255, 255)');

    // Test at desktop viewport
    await page.setViewportSize({ width: 1024, height: 800 });
    await page.waitForTimeout(100); // Allow styles to recompute

    const prefixColorDesktop = await titlePrefix.evaluate((el) => {
      return window.getComputedStyle(el).color;
    });
    const suffixColorDesktop = await titleSuffix.evaluate((el) => {
      return window.getComputedStyle(el).color;
    });

    expect(prefixColorDesktop).toBe('rgb(255, 255, 255)');
    expect(suffixColorDesktop).toBe('rgb(255, 255, 255)');
  });
});
