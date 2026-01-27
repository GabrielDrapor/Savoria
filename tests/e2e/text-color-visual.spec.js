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
 * - Optionally capture screenshots for visual comparison
 */

import { test, expect } from '@playwright/test';
import { readFileSync } from 'fs';
import { resolve } from 'path';

// Mock data for API responses
const mockBookData = {
  data: Array.from({ length: 6 }, (_, i) => ({
    item: {
      cover_image_url: `https://neodb.social/m/item/book${i + 1}.jpg`,
      display_title: `Test Book ${i + 1}`,
      id: `book-${i + 1}`
    },
    created_time: `2024-0${i + 1}-15T10:30:00Z`
  }))
};

const mockScreenData = {
  data: Array.from({ length: 4 }, (_, i) => ({
    item: {
      cover_image_url: `https://neodb.social/m/item/movie${i + 1}.jpg`,
      display_title: `Test Movie ${i + 1}`,
      id: `movie-${i + 1}`
    },
    created_time: `2024-0${i + 1}-20T14:00:00Z`
  }))
};

const mockMusicData = {
  data: Array.from({ length: 3 }, (_, i) => ({
    item: {
      cover_image_url: `https://neodb.social/m/item/music${i + 1}.jpg`,
      display_title: `Test Album ${i + 1}`,
      id: `music-${i + 1}`
    },
    created_time: `2024-0${i + 1}-10T08:00:00Z`
  }))
};

const mockGameData = {
  data: Array.from({ length: 2 }, (_, i) => ({
    item: {
      cover_image_url: `https://neodb.social/m/item/game${i + 1}.jpg`,
      display_title: `Test Game ${i + 1}`,
      id: `game-${i + 1}`
    },
    created_time: `2024-0${i + 1}-25T16:00:00Z`
  }))
};

/**
 * Helper function to normalize color to RGB format
 * Converts various color formats (hex, rgb, rgba) to rgb(r, g, b)
 */
function normalizeColorToRGB(color) {
  // Handle rgb/rgba formats
  if (color.startsWith('rgb')) {
    const match = color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
    if (match) {
      return `rgb(${match[1]}, ${match[2]}, ${match[3]})`;
    }
  }
  // Handle hex formats
  if (color.startsWith('#')) {
    let hex = color.slice(1);
    if (hex.length === 3) {
      hex = hex.split('').map(c => c + c).join('');
    }
    const r = parseInt(hex.slice(0, 2), 16);
    const g = parseInt(hex.slice(2, 4), 16);
    const b = parseInt(hex.slice(4, 6), 16);
    return `rgb(${r}, ${g}, ${b})`;
  }
  // Handle named colors
  if (color === 'white') {
    return 'rgb(255, 255, 255)';
  }
  return color;
}

/**
 * Check if a color is white (rgb(255, 255, 255))
 */
function isWhiteColor(color) {
  const normalized = normalizeColorToRGB(color);
  return normalized === 'rgb(255, 255, 255)';
}

/**
 * NFR-2: Cross-browser color compatibility
 *
 * Verify that the solid white color displays correctly across different browsers.
 * The test cases verify:
 * 1. No vendor-prefixed gradient properties remain (-webkit-background-clip: text)
 * 2. No -webkit-text-fill-color: transparent
 * 3. Text renders as white (#ffffff) in Chromium
 * 4. Text renders as white (#ffffff) in Firefox
 */
test.describe('NFR-2: Cross-browser color compatibility', () => {
  test.beforeEach(async ({ page }) => {
    // Mock API responses
    await page.route('**/api/complete/book/**', route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(mockBookData)
      });
    });

    await page.route('**/api/complete/screen/**', route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(mockScreenData)
      });
    });

    await page.route('**/api/complete/music/**', route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(mockMusicData)
      });
    });

    await page.route('**/api/complete/game/**', route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(mockGameData)
      });
    });

    // Navigate to the gallery page
    await page.goto('/');
    // Wait for the page to be ready (domcontentloaded is more reliable than networkidle)
    await page.waitForLoadState('domcontentloaded');
  });

  test.describe('Test Case 1: No -webkit-background-clip: text in component CSS', () => {
    test('should not have -webkit-background-clip: text applied to text elements', async ({ page, browserName }) => {
      // Wait for the header to be visible
      const header = page.locator('[data-testid="year-navigation-header"]');
      await expect(header).toBeVisible({ timeout: 10000 });

      // Check that -webkit-background-clip is not 'text' for any text elements
      const pageTitle = page.locator('.page-title');
      await expect(pageTitle).toBeVisible();

      const backgroundClip = await pageTitle.evaluate(el => {
        const computed = window.getComputedStyle(el);
        // Check both prefixed and unprefixed versions
        return {
          webkitBackgroundClip: computed.webkitBackgroundClip || computed.getPropertyValue('-webkit-background-clip'),
          backgroundClip: computed.backgroundClip
        };
      });

      // Should not be 'text' - standard values are 'border-box', 'padding-box', or 'content-box'
      expect(backgroundClip.webkitBackgroundClip).not.toBe('text');
      expect(backgroundClip.backgroundClip).not.toBe('text');
    });

    test('should not have -webkit-background-clip: text in .current-year', async ({ page, browserName }) => {
      const currentYear = page.locator('[data-testid="current-year-display"]');
      await expect(currentYear).toBeVisible({ timeout: 10000 });

      const backgroundClip = await currentYear.evaluate(el => {
        const computed = window.getComputedStyle(el);
        return {
          webkitBackgroundClip: computed.webkitBackgroundClip || computed.getPropertyValue('-webkit-background-clip'),
          backgroundClip: computed.backgroundClip
        };
      });

      expect(backgroundClip.webkitBackgroundClip).not.toBe('text');
      expect(backgroundClip.backgroundClip).not.toBe('text');
    });
  });

  test.describe('Test Case 2: No -webkit-text-fill-color: transparent', () => {
    test('should not have -webkit-text-fill-color: transparent on .page-title', async ({ page, browserName }) => {
      const pageTitle = page.locator('.page-title');
      await expect(pageTitle).toBeVisible({ timeout: 10000 });

      const textFillColor = await pageTitle.evaluate(el => {
        const computed = window.getComputedStyle(el);
        return computed.webkitTextFillColor || computed.getPropertyValue('-webkit-text-fill-color');
      });

      // Should not be 'transparent'
      expect(textFillColor).not.toBe('transparent');
    });

    test('should not have -webkit-text-fill-color: transparent on .current-year', async ({ page, browserName }) => {
      const currentYear = page.locator('[data-testid="current-year-display"]');
      await expect(currentYear).toBeVisible({ timeout: 10000 });

      const textFillColor = await currentYear.evaluate(el => {
        const computed = window.getComputedStyle(el);
        return computed.webkitTextFillColor || computed.getPropertyValue('-webkit-text-fill-color');
      });

      expect(textFillColor).not.toBe('transparent');
    });

    test('should not have -webkit-text-fill-color: transparent on .title-prefix', async ({ page, browserName }) => {
      const titlePrefix = page.locator('.title-prefix');
      await expect(titlePrefix).toBeVisible({ timeout: 10000 });

      const textFillColor = await titlePrefix.evaluate(el => {
        const computed = window.getComputedStyle(el);
        return computed.webkitTextFillColor || computed.getPropertyValue('-webkit-text-fill-color');
      });

      expect(textFillColor).not.toBe('transparent');
    });
  });

  test.describe('Test Case 3: Chromium browser text color verification', () => {
    test('should render .page-title in white (#ffffff) in Chromium', async ({ page, browserName }) => {
      // This test runs in the chromium project
      test.skip(browserName !== 'chromium', 'This test is for Chromium only');

      const pageTitle = page.locator('.page-title');
      await expect(pageTitle).toBeVisible({ timeout: 10000 });

      const color = await pageTitle.evaluate(el => {
        return window.getComputedStyle(el).color;
      });

      // Color should be white: rgb(255, 255, 255)
      expect(isWhiteColor(color)).toBe(true);
    });

    test('should render .current-year in white (#ffffff) in Chromium', async ({ page, browserName }) => {
      test.skip(browserName !== 'chromium', 'This test is for Chromium only');

      const currentYear = page.locator('[data-testid="current-year-display"]');
      await expect(currentYear).toBeVisible({ timeout: 10000 });

      const color = await currentYear.evaluate(el => {
        return window.getComputedStyle(el).color;
      });

      expect(isWhiteColor(color)).toBe(true);
    });

    test('should render .title-prefix in white (#ffffff) in Chromium', async ({ page, browserName }) => {
      test.skip(browserName !== 'chromium', 'This test is for Chromium only');

      const titlePrefix = page.locator('.title-prefix');
      await expect(titlePrefix).toBeVisible({ timeout: 10000 });

      const color = await titlePrefix.evaluate(el => {
        return window.getComputedStyle(el).color;
      });

      expect(isWhiteColor(color)).toBe(true);
    });

    test('should render .title-suffix in white (#ffffff) in Chromium', async ({ page, browserName }) => {
      test.skip(browserName !== 'chromium', 'This test is for Chromium only');

      const titleSuffix = page.locator('.title-suffix');
      await expect(titleSuffix).toBeVisible({ timeout: 10000 });

      const color = await titleSuffix.evaluate(el => {
        return window.getComputedStyle(el).color;
      });

      expect(isWhiteColor(color)).toBe(true);
    });
  });

  test.describe('Test Case 4: Firefox browser text color verification', () => {
    test('should render .page-title in white (#ffffff) in Firefox', async ({ page, browserName }) => {
      test.skip(browserName !== 'firefox', 'This test is for Firefox only');

      const pageTitle = page.locator('.page-title');
      await expect(pageTitle).toBeVisible({ timeout: 10000 });

      const color = await pageTitle.evaluate(el => {
        return window.getComputedStyle(el).color;
      });

      expect(isWhiteColor(color)).toBe(true);
    });

    test('should render .current-year in white (#ffffff) in Firefox', async ({ page, browserName }) => {
      test.skip(browserName !== 'firefox', 'This test is for Firefox only');

      const currentYear = page.locator('[data-testid="current-year-display"]');
      await expect(currentYear).toBeVisible({ timeout: 10000 });

      const color = await currentYear.evaluate(el => {
        return window.getComputedStyle(el).color;
      });

      expect(isWhiteColor(color)).toBe(true);
    });

    test('should render .title-prefix in white (#ffffff) in Firefox', async ({ page, browserName }) => {
      test.skip(browserName !== 'firefox', 'This test is for Firefox only');

      const titlePrefix = page.locator('.title-prefix');
      await expect(titlePrefix).toBeVisible({ timeout: 10000 });

      const color = await titlePrefix.evaluate(el => {
        return window.getComputedStyle(el).color;
      });

      expect(isWhiteColor(color)).toBe(true);
    });

    test('should render .title-suffix in white (#ffffff) in Firefox', async ({ page, browserName }) => {
      test.skip(browserName !== 'firefox', 'This test is for Firefox only');

      const titleSuffix = page.locator('.title-suffix');
      await expect(titleSuffix).toBeVisible({ timeout: 10000 });

      const color = await titleSuffix.evaluate(el => {
        return window.getComputedStyle(el).color;
      });

      expect(isWhiteColor(color)).toBe(true);
    });
  });

  test.describe('Cross-browser consistency verification', () => {
    test('all header text elements should display in white color', async ({ page, browserName }) => {
      // This test runs on all configured browsers to ensure consistency
      const header = page.locator('[data-testid="year-navigation-header"]');
      await expect(header).toBeVisible({ timeout: 10000 });

      // Verify all text elements have white color
      const elements = [
        { selector: '.page-title', name: 'page-title' },
        { selector: '.title-prefix', name: 'title-prefix' },
        { selector: '.title-suffix', name: 'title-suffix' },
        { selector: '[data-testid="current-year-display"]', name: 'current-year' }
      ];

      for (const { selector, name } of elements) {
        const element = page.locator(selector);
        await expect(element).toBeVisible();

        const color = await element.evaluate(el => {
          return window.getComputedStyle(el).color;
        });

        expect(isWhiteColor(color), `${name} should be white in ${browserName}`).toBe(true);
      }
    });

    test('standard color property should be used (not vendor-prefixed)', async ({ page, browserName }) => {
      const pageTitle = page.locator('.page-title');
      await expect(pageTitle).toBeVisible({ timeout: 10000 });

      // Verify that standard color property is being used
      const styles = await pageTitle.evaluate(el => {
        const computed = window.getComputedStyle(el);
        return {
          color: computed.color,
          webkitTextFillColor: computed.webkitTextFillColor || computed.getPropertyValue('-webkit-text-fill-color'),
          backgroundClip: computed.backgroundClip
        };
      });

      // Color should be set to white
      expect(isWhiteColor(styles.color)).toBe(true);

      // -webkit-text-fill-color should NOT be 'transparent'
      // (it may be 'currentcolor' or the same as the text color, which is fine)
      expect(styles.webkitTextFillColor).not.toBe('transparent');

      // background-clip should not be 'text'
      expect(styles.backgroundClip).not.toBe('text');
    });
  });
});

/**
 * Unit-style CSS parsing tests (run via Playwright for additional verification)
 * These complement the Vitest unit tests by verifying the component CSS
 * is parsed correctly in a real browser environment.
 */
test.describe('Component CSS verification in browser', () => {
  test('should verify no gradient-related CSS properties in component', async ({ page }) => {
    // Read the component source file
    const componentPath = resolve(process.cwd(), 'src/components/YearNavigationHeader.vue');
    const componentSource = readFileSync(componentPath, 'utf-8');

    // Extract style section
    const styleMatch = componentSource.match(/<style[^>]*>([\s\S]*?)<\/style>/);
    expect(styleMatch).toBeTruthy();
    const styleContent = styleMatch[1];

    // Verify no gradient-related properties for text elements
    // These properties should NOT be present for text styling
    const gradientTextPatterns = [
      /\.page-title[^}]*-webkit-background-clip:\s*text/,
      /\.page-title[^}]*-webkit-text-fill-color:\s*transparent/,
      /\.current-year[^}]*-webkit-background-clip:\s*text/,
      /\.current-year[^}]*-webkit-text-fill-color:\s*transparent/,
      /\.title-prefix[^}]*-webkit-background-clip:\s*text/,
      /\.title-prefix[^}]*-webkit-text-fill-color:\s*transparent/,
      /\.title-suffix[^}]*-webkit-background-clip:\s*text/,
      /\.title-suffix[^}]*-webkit-text-fill-color:\s*transparent/
    ];

    for (const pattern of gradientTextPatterns) {
      expect(styleContent).not.toMatch(pattern);
    }

    // Verify color: #fff is used
    expect(styleContent).toMatch(/\.page-title[^}]*color:\s*#fff/);
    expect(styleContent).toMatch(/\.current-year[^}]*color:\s*#fff/);
  });
});

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
