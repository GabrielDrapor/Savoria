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

/**
 * Scenario 7: Visual regression - No gradient visible
 * Verifies that no gradient effect is visible on any text element in the
 * YearNavigationHeader component. The text should appear as uniform solid white.
 *
 * Test approach:
 * - Check computed styles to verify no gradient-related properties are applied
 * - Verify -webkit-text-fill-color is not 'transparent' (gradient technique)
 * - Verify background-clip is not 'text' (gradient technique)
 * - Verify color is solid white throughout all text elements
 */
test.describe('Scenario 7: Visual regression - No gradient visible', () => {
  test('TC1: The word "In" (title-prefix) displays in uniform white color with no gradient', async ({ page }) => {
    await page.setViewportSize({ width: 1200, height: 800 });
    await page.goto('/');

    const titlePrefix = page.locator('.title-prefix');
    await expect(titlePrefix).toBeVisible();

    // Verify the text content is "In"
    await expect(titlePrefix).toHaveText('In');

    // Check computed styles to verify no gradient technique is applied
    const styles = await titlePrefix.evaluate((el) => {
      const computed = window.getComputedStyle(el);
      return {
        color: computed.color,
        backgroundColor: computed.backgroundColor,
        backgroundImage: computed.backgroundImage,
        backgroundClip: computed.backgroundClip,
        webkitBackgroundClip: computed.webkitBackgroundClip,
        webkitTextFillColor: computed.webkitTextFillColor
      };
    });

    // Verify solid white color (rgb(255, 255, 255))
    expect(styles.color).toBe('rgb(255, 255, 255)');

    // Verify no gradient background image
    expect(styles.backgroundImage).toBe('none');

    // Verify background-clip is NOT 'text' (gradient technique)
    expect(styles.backgroundClip).not.toBe('text');
    expect(styles.webkitBackgroundClip).not.toBe('text');

    // Verify -webkit-text-fill-color is NOT 'transparent' (gradient technique)
    // It should be either 'rgb(255, 255, 255)' or 'initial' or match the color
    expect(styles.webkitTextFillColor).not.toBe('transparent');
  });

  test('TC2: The year number (current-year) displays in uniform white color with no gradient', async ({ page }) => {
    await page.setViewportSize({ width: 1200, height: 800 });
    await page.goto('/');

    const currentYear = page.locator('.current-year');
    await expect(currentYear).toBeVisible();

    // Verify the text content is a year (4 digit number)
    const yearText = await currentYear.textContent();
    expect(yearText?.trim()).toMatch(/^\d{4}$/);

    // Check computed styles to verify no gradient technique is applied
    const styles = await currentYear.evaluate((el) => {
      const computed = window.getComputedStyle(el);
      return {
        color: computed.color,
        backgroundColor: computed.backgroundColor,
        backgroundImage: computed.backgroundImage,
        backgroundClip: computed.backgroundClip,
        webkitBackgroundClip: computed.webkitBackgroundClip,
        webkitTextFillColor: computed.webkitTextFillColor
      };
    });

    // Verify solid white color (rgb(255, 255, 255))
    expect(styles.color).toBe('rgb(255, 255, 255)');

    // Verify no gradient background image
    expect(styles.backgroundImage).toBe('none');

    // Verify background-clip is NOT 'text' (gradient technique)
    expect(styles.backgroundClip).not.toBe('text');
    expect(styles.webkitBackgroundClip).not.toBe('text');

    // Verify -webkit-text-fill-color is NOT 'transparent' (gradient technique)
    expect(styles.webkitTextFillColor).not.toBe('transparent');
  });

  test('TC3: The comma suffix (title-suffix) displays in uniform white color with no gradient', async ({ page }) => {
    await page.setViewportSize({ width: 1200, height: 800 });
    await page.goto('/');

    const titleSuffix = page.locator('.title-suffix');
    await expect(titleSuffix).toBeVisible();

    // Verify the text content is a comma
    await expect(titleSuffix).toHaveText(',');

    // Check computed styles to verify no gradient technique is applied
    const styles = await titleSuffix.evaluate((el) => {
      const computed = window.getComputedStyle(el);
      return {
        color: computed.color,
        backgroundColor: computed.backgroundColor,
        backgroundImage: computed.backgroundImage,
        backgroundClip: computed.backgroundClip,
        webkitBackgroundClip: computed.webkitBackgroundClip,
        webkitTextFillColor: computed.webkitTextFillColor
      };
    });

    // Verify solid white color (rgb(255, 255, 255))
    expect(styles.color).toBe('rgb(255, 255, 255)');

    // Verify no gradient background image
    expect(styles.backgroundImage).toBe('none');

    // Verify background-clip is NOT 'text' (gradient technique)
    expect(styles.backgroundClip).not.toBe('text');
    expect(styles.webkitBackgroundClip).not.toBe('text');

    // Verify -webkit-text-fill-color is NOT 'transparent' (gradient technique)
    expect(styles.webkitTextFillColor).not.toBe('transparent');
  });

  test('All header text elements have consistent white color (no gradient variation)', async ({ page }) => {
    await page.setViewportSize({ width: 1200, height: 800 });
    await page.goto('/');

    // Wait for all elements to be visible
    const titlePrefix = page.locator('.title-prefix');
    const currentYear = page.locator('.current-year');
    const titleSuffix = page.locator('.title-suffix');
    const pageTitle = page.locator('.page-title');

    await expect(titlePrefix).toBeVisible();
    await expect(currentYear).toBeVisible();
    await expect(titleSuffix).toBeVisible();
    await expect(pageTitle).toBeVisible();

    // Get all colors and verify they are the same white
    const colors = await page.evaluate(() => {
      const getColor = (selector) => {
        const el = document.querySelector(selector);
        return el ? window.getComputedStyle(el).color : null;
      };
      return {
        pageTitle: getColor('.page-title'),
        titlePrefix: getColor('.title-prefix'),
        currentYear: getColor('.current-year'),
        titleSuffix: getColor('.title-suffix')
      };
    });

    // All elements should have the same white color
    const white = 'rgb(255, 255, 255)';
    expect(colors.pageTitle).toBe(white);
    expect(colors.titlePrefix).toBe(white);
    expect(colors.currentYear).toBe(white);
    expect(colors.titleSuffix).toBe(white);

    // Additional check: verify no gradient-related properties on page-title
    const pageTitleStyles = await pageTitle.evaluate((el) => {
      const computed = window.getComputedStyle(el);
      return {
        backgroundImage: computed.backgroundImage,
        backgroundClip: computed.backgroundClip,
        webkitTextFillColor: computed.webkitTextFillColor
      };
    });

    expect(pageTitleStyles.backgroundImage).toBe('none');
    expect(pageTitleStyles.backgroundClip).not.toBe('text');
    expect(pageTitleStyles.webkitTextFillColor).not.toBe('transparent');
  });

  test('Page title CSS does not contain gradient-related properties after change', async ({ page }) => {
    await page.setViewportSize({ width: 1200, height: 800 });
    await page.goto('/');

    // Verify page loads and header is present
    const header = page.locator('[data-testid="year-navigation-header"]');
    await expect(header).toBeVisible();

    // Check all relevant elements for absence of gradient styling
    const elementsToCheck = ['.page-title', '.title-prefix', '.title-suffix', '.current-year'];

    for (const selector of elementsToCheck) {
      const element = page.locator(selector);
      await expect(element).toBeVisible();

      const hasGradient = await element.evaluate((el) => {
        const computed = window.getComputedStyle(el);
        const backgroundImage = computed.backgroundImage;
        const backgroundClip = computed.backgroundClip;
        const webkitBackgroundClip = computed.webkitBackgroundClip;
        const webkitTextFillColor = computed.webkitTextFillColor;

        // Check for gradient indicators
        const hasLinearGradient = backgroundImage.includes('linear-gradient');
        const hasTextClip = backgroundClip === 'text' || webkitBackgroundClip === 'text';
        const hasTransparentFill = webkitTextFillColor === 'transparent';

        return hasLinearGradient || hasTextClip || hasTransparentFill;
      });

      // No element should have gradient styling
      expect(hasGradient).toBe(false);
    }
  });
});
