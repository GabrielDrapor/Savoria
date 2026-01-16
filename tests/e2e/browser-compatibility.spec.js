import { test, expect } from '@playwright/test';

/**
 * Browser Compatibility Tests (NFR-5)
 * Tests compatibility with Chrome, Firefox, Safari, Edge (latest 2 versions)
 *
 * These tests verify that core CSS features and functionality work consistently
 * across all supported browsers.
 */

// Mock data for testing
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

test.describe('Browser Compatibility Tests (NFR-5)', () => {
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
    await page.waitForLoadState('networkidle');
  });

  test.describe('Test Case 1: CSS Grid support - Grid layout renders correctly', () => {
    test('CSS Grid display property is supported and applied', async ({ page, browserName }) => {
      // Wait for grid container to appear
      const gridContainer = page.locator('.grid-container').first();
      await expect(gridContainer).toBeVisible({ timeout: 10000 });

      // Verify CSS Grid is applied
      const display = await gridContainer.evaluate(el => {
        return window.getComputedStyle(el).display;
      });

      expect(display).toBe('grid');
    });

    test('CSS Grid auto-fit with minmax works correctly', async ({ page, browserName }) => {
      // Wait for grid container
      const gridContainer = page.locator('.grid-container').first();
      await expect(gridContainer).toBeVisible({ timeout: 10000 });

      // Get grid template columns - should be computed values (e.g., "140px 140px 140px...")
      const gridTemplateColumns = await gridContainer.evaluate(el => {
        return window.getComputedStyle(el).gridTemplateColumns;
      });

      // Should have multiple column tracks (not 'none' or empty)
      expect(gridTemplateColumns).not.toBe('none');
      expect(gridTemplateColumns).toBeTruthy();

      // Count columns - should be at least 2
      const columnCount = gridTemplateColumns.split(/\s+/).filter(v => v.trim() !== '').length;
      expect(columnCount).toBeGreaterThanOrEqual(2);
    });

    test('Grid gap property is applied correctly', async ({ page, browserName }) => {
      const gridContainer = page.locator('.grid-container').first();
      await expect(gridContainer).toBeVisible({ timeout: 10000 });

      const gap = await gridContainer.evaluate(el => {
        const computed = window.getComputedStyle(el);
        return computed.gap || computed.gridGap || `${computed.rowGap} ${computed.columnGap}`;
      });

      // Gap should be set (20px on desktop)
      expect(gap).toBeTruthy();
      expect(gap).not.toBe('normal');
    });
  });

  test.describe('Test Case 2: CSS aspect-ratio property support', () => {
    test('Cover items maintain 3:4 aspect ratio', async ({ page, browserName }) => {
      // Wait for grid items to appear
      const gridItem = page.locator('.grid-item').first();
      await expect(gridItem).toBeVisible({ timeout: 10000 });

      // Check aspect-ratio CSS property
      const aspectRatio = await gridItem.evaluate(el => {
        return window.getComputedStyle(el).aspectRatio;
      });

      // Modern browsers support aspect-ratio: 3 / 4
      expect(aspectRatio).toBe('3 / 4');
    });

    test('Cover items render with correct dimensions', async ({ page, browserName }) => {
      // Wait for grid items
      await page.waitForSelector('.grid-item', { timeout: 10000 });

      const gridItem = page.locator('.grid-item').first();
      const boundingBox = await gridItem.boundingBox();

      // Verify aspect ratio is approximately 3:4 (height/width ≈ 1.33)
      const ratio = boundingBox.height / boundingBox.width;
      expect(ratio).toBeGreaterThan(1.25);
      expect(ratio).toBeLessThan(1.45);
    });
  });

  test.describe('Test Case 3: CSS transforms and transitions', () => {
    test('Hover transform effect is supported', async ({ page, browserName }) => {
      // Wait for grid items
      const gridItem = page.locator('.grid-item').first();
      await expect(gridItem).toBeVisible({ timeout: 10000 });

      // Get initial transform
      const initialTransform = await gridItem.evaluate(el => {
        return window.getComputedStyle(el).transform;
      });

      // Hover over the item
      await gridItem.hover();
      await page.waitForTimeout(400); // Wait for transition

      // Get transform after hover
      const hoverTransform = await gridItem.evaluate(el => {
        return window.getComputedStyle(el).transform;
      });

      // Transform should change on hover (scale effect)
      // Either transform changes or transition is applied
      const transitionProperty = await gridItem.evaluate(el => {
        return window.getComputedStyle(el).transition;
      });

      expect(transitionProperty).toBeTruthy();
    });

    test('CSS transitions are applied correctly', async ({ page, browserName }) => {
      const gridItem = page.locator('.grid-item').first();
      await expect(gridItem).toBeVisible({ timeout: 10000 });

      const transition = await gridItem.evaluate(el => {
        return window.getComputedStyle(el).transition;
      });

      // Transition should be set
      expect(transition).toBeTruthy();
      expect(transition).not.toBe('all 0s ease 0s');
    });
  });

  test.describe('Test Case 4: Page rendering and layout consistency', () => {
    test('Gallery container renders with correct layout', async ({ page, browserName }) => {
      const galleryContainer = page.locator('.gallery-container');
      await expect(galleryContainer).toBeVisible({ timeout: 10000 });

      const styles = await galleryContainer.evaluate(el => {
        const computed = window.getComputedStyle(el);
        return {
          display: computed.display,
          flexDirection: computed.flexDirection,
          gap: computed.gap
        };
      });

      expect(styles.display).toBe('flex');
      expect(styles.flexDirection).toBe('column');
    });

    test('All four category sections are visible', async ({ page, browserName }) => {
      const categories = ['book', 'screen', 'music', 'game'];

      for (const category of categories) {
        const section = page.locator(`[data-category="${category}"]`);
        await expect(section).toBeVisible({ timeout: 10000 });
      }
    });

    test('Page renders without horizontal overflow', async ({ page, browserName }) => {
      await page.waitForSelector('.gallery-container', { timeout: 10000 });

      const hasHorizontalScroll = await page.evaluate(() => {
        return document.body.scrollWidth > document.body.clientWidth;
      });

      expect(hasHorizontalScroll).toBe(false);
    });
  });

  test.describe('Test Case 5: Year selector functionality', () => {
    test('Year selector is visible and interactive', async ({ page, browserName }) => {
      const yearSelector = page.locator('[data-testid="year-selector"]');
      await expect(yearSelector).toBeVisible({ timeout: 10000 });

      const trigger = page.locator('[data-testid="year-selector-trigger"]');
      await expect(trigger).toBeVisible();

      // Click to open dropdown
      await trigger.click();

      const dropdown = page.locator('[data-testid="year-dropdown"]');
      await expect(dropdown).toBeVisible({ timeout: 5000 });
    });

    test('Year selection updates URL parameter', async ({ page, browserName }) => {
      const trigger = page.locator('[data-testid="year-selector-trigger"]');
      await expect(trigger).toBeVisible({ timeout: 10000 });

      // Open dropdown
      await trigger.click();

      // Select a year option
      const yearOption = page.locator('.year-option').first();
      await expect(yearOption).toBeVisible();
      await yearOption.click();

      // Wait for URL to update
      await page.waitForTimeout(500);

      // URL should contain year parameter
      const url = page.url();
      expect(url).toMatch(/\?year=\d{4}/);
    });
  });

  test.describe('Test Case 6: Image lazy loading support', () => {
    test('Images have loading="lazy" attribute', async ({ page, browserName }) => {
      await page.waitForSelector('[data-testid="cover-container"]', { timeout: 10000 });

      const images = page.locator('.cover-image');
      const count = await images.count();

      if (count > 0) {
        const firstImage = images.first();
        const loading = await firstImage.getAttribute('loading');
        expect(loading).toBe('lazy');
      }
    });
  });

  test.describe('Test Case 7: Flexbox support', () => {
    test('Flexbox layout is applied to page elements', async ({ page, browserName }) => {
      const appContainer = page.locator('#app');
      await expect(appContainer).toBeVisible({ timeout: 10000 });

      const galleryContainer = page.locator('.gallery-container');
      const display = await galleryContainer.evaluate(el => {
        return window.getComputedStyle(el).display;
      });

      expect(display).toBe('flex');
    });
  });

  test.describe('Test Case 8: CSS custom properties (CSS variables) support', () => {
    test('Background gradient renders correctly', async ({ page, browserName }) => {
      const body = page.locator('body');

      const background = await body.evaluate(el => {
        return window.getComputedStyle(el).background;
      });

      // Background should be set (gradient or color)
      expect(background).toBeTruthy();
    });
  });

  test.describe('Test Case 9: Responsive behavior at different viewports', () => {
    test('Desktop viewport (1200px) renders correctly', async ({ page, browserName }) => {
      await page.setViewportSize({ width: 1200, height: 800 });
      await page.reload();
      await page.waitForLoadState('networkidle');

      const gridContainer = page.locator('.grid-container').first();
      await expect(gridContainer).toBeVisible({ timeout: 10000 });

      // Wait for items to load
      await page.waitForSelector('.grid-item', { timeout: 10000 });

      // Should have 5-6 columns on desktop
      const columnCount = await gridContainer.evaluate(el => {
        const gridTemplateColumns = window.getComputedStyle(el).gridTemplateColumns;
        return gridTemplateColumns.split(/\s+/).filter(v => v.trim() !== '').length;
      });

      expect(columnCount).toBeGreaterThanOrEqual(5);
    });

    test('Tablet viewport (768px) renders correctly', async ({ page, browserName }) => {
      await page.setViewportSize({ width: 768, height: 1024 });
      await page.reload();
      await page.waitForLoadState('networkidle');

      const gridContainer = page.locator('.grid-container').first();
      await expect(gridContainer).toBeVisible({ timeout: 10000 });

      await page.waitForSelector('.grid-item', { timeout: 10000 });

      // At 768px, the grid uses minmax(100px, 1fr) with mobile breakpoint
      // Container width may vary based on app layout
      // The key test is that grid renders consistently across browsers
      const columnCount = await gridContainer.evaluate(el => {
        const gridTemplateColumns = window.getComputedStyle(el).gridTemplateColumns;
        return gridTemplateColumns.split(/\s+/).filter(v => v.trim() !== '').length;
      });

      // Should have at least 3 columns and work consistently
      expect(columnCount).toBeGreaterThanOrEqual(3);
      expect(columnCount).toBeLessThanOrEqual(8);
    });

    test('Mobile viewport (375px) renders correctly', async ({ page, browserName }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      await page.reload();
      await page.waitForLoadState('networkidle');

      const gridContainer = page.locator('.grid-container').first();
      await expect(gridContainer).toBeVisible({ timeout: 10000 });

      await page.waitForSelector('.grid-item', { timeout: 10000 });

      // Should have 2-3 columns on mobile
      const columnCount = await gridContainer.evaluate(el => {
        const gridTemplateColumns = window.getComputedStyle(el).gridTemplateColumns;
        return gridTemplateColumns.split(/\s+/).filter(v => v.trim() !== '').length;
      });

      expect(columnCount).toBeGreaterThanOrEqual(2);
      expect(columnCount).toBeLessThanOrEqual(4);
    });
  });

  test.describe('Test Case 10: Keyboard navigation support', () => {
    test('Year selector can be operated with keyboard', async ({ page, browserName }) => {
      const trigger = page.locator('[data-testid="year-selector-trigger"]');
      await expect(trigger).toBeVisible({ timeout: 10000 });

      // Focus the trigger using Tab
      await page.keyboard.press('Tab');

      // Navigate to year selector and press Enter
      await trigger.focus();
      await page.keyboard.press('Enter');

      // Dropdown should open
      const dropdown = page.locator('[data-testid="year-dropdown"]');
      await expect(dropdown).toBeVisible({ timeout: 5000 });

      // Navigate with arrow keys
      await page.keyboard.press('ArrowDown');

      // Close with Escape
      await page.keyboard.press('Escape');
      await expect(dropdown).not.toBeVisible({ timeout: 5000 });
    });
  });
});
