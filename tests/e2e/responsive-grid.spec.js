import { test, expect } from '@playwright/test';

// Mock data for testing - enough items to fill grid
const mockBookData = {
  data: Array.from({ length: 12 }, (_, i) => ({
    item: {
      cover_image_url: `https://neodb.social/m/item/book${i + 1}.jpg`,
      display_title: `Test Book ${i + 1}`,
      id: `book-${i + 1}`
    },
    created_time: `2024-0${(i % 9) + 1}-15T10:30:00Z`
  }))
};

const mockScreenData = {
  data: Array.from({ length: 10 }, (_, i) => ({
    item: {
      cover_image_url: `https://neodb.social/m/item/movie${i + 1}.jpg`,
      display_title: `Test Movie ${i + 1}`,
      id: `movie-${i + 1}`
    },
    created_time: `2024-0${(i % 9) + 1}-20T14:00:00Z`
  }))
};

const mockMusicData = {
  data: Array.from({ length: 8 }, (_, i) => ({
    item: {
      cover_image_url: `https://neodb.social/m/item/music${i + 1}.jpg`,
      display_title: `Test Album ${i + 1}`,
      id: `music-${i + 1}`
    },
    created_time: `2024-0${(i % 9) + 1}-10T08:00:00Z`
  }))
};

const mockGameData = {
  data: Array.from({ length: 6 }, (_, i) => ({
    item: {
      cover_image_url: `https://neodb.social/m/item/game${i + 1}.jpg`,
      display_title: `Test Game ${i + 1}`,
      id: `game-${i + 1}`
    },
    created_time: `2024-0${(i % 9) + 1}-25T16:00:00Z`
  }))
};

/**
 * Helper function to count columns in a grid container
 * Uses CSS computed grid-template-columns to count actual column tracks
 */
async function getColumnCount(gridContainer) {
  return await gridContainer.evaluate(el => {
    const computedStyle = window.getComputedStyle(el);
    const gridTemplateColumns = computedStyle.gridTemplateColumns;
    // Count the number of column tracks (separated by spaces)
    // e.g., "200px 200px 200px" = 3 columns
    if (!gridTemplateColumns || gridTemplateColumns === 'none') {
      return 0;
    }
    return gridTemplateColumns.split(/\s+/).filter(v => v.trim() !== '').length;
  });
}

test.describe('Responsive Grid on Mobile (NFR-2, US-6)', () => {
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
  });

  test('Test Case 1: Grid displays 5-6 columns on desktop (1200px viewport)', async ({ page }) => {
    // Set desktop viewport
    await page.setViewportSize({ width: 1200, height: 800 });

    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Wait for grid items to appear
    const gridContainer = page.locator('.grid-container').first();
    await expect(gridContainer).toBeVisible({ timeout: 10000 });

    // Wait for actual items to be rendered (not loading state)
    await page.waitForSelector('.grid-item', { timeout: 10000 });

    // Get column count
    const columnCount = await getColumnCount(gridContainer);

    // Desktop should show 5-6 columns
    expect(columnCount).toBeGreaterThanOrEqual(5);
    expect(columnCount).toBeLessThanOrEqual(6);
  });

  test('Test Case 2: Grid displays 3-4 columns on tablet (800px viewport)', async ({ page }) => {
    // Set tablet viewport
    await page.setViewportSize({ width: 800, height: 1024 });

    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Wait for grid items to appear
    const gridContainer = page.locator('.grid-container').first();
    await expect(gridContainer).toBeVisible({ timeout: 10000 });

    // Wait for actual items to be rendered
    await page.waitForSelector('.grid-item', { timeout: 10000 });

    // Get column count
    const columnCount = await getColumnCount(gridContainer);

    // Tablet should show 3-4 columns
    expect(columnCount).toBeGreaterThanOrEqual(3);
    expect(columnCount).toBeLessThanOrEqual(4);
  });

  test('Test Case 3: Grid displays 2-3 columns on mobile (375px iPhone viewport)', async ({ page }) => {
    // Set mobile viewport (iPhone)
    await page.setViewportSize({ width: 375, height: 667 });

    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Wait for grid items to appear
    const gridContainer = page.locator('.grid-container').first();
    await expect(gridContainer).toBeVisible({ timeout: 10000 });

    // Wait for actual items to be rendered
    await page.waitForSelector('.grid-item', { timeout: 10000 });

    // Get column count
    const columnCount = await getColumnCount(gridContainer);

    // Mobile should show 2-3 columns
    expect(columnCount).toBeGreaterThanOrEqual(2);
    expect(columnCount).toBeLessThanOrEqual(3);
  });

  test('Test Case 4: Cover items on mobile remain properly sized and tappable (min 44px touch target)', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });

    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Wait for grid items to appear
    await page.waitForSelector('.grid-item', { timeout: 10000 });

    // Get the first grid item
    const gridItem = page.locator('.grid-item').first();
    await expect(gridItem).toBeVisible();

    // Get the bounding box of the grid item
    const boundingBox = await gridItem.boundingBox();

    // Verify minimum touch target size (44px x 44px per WCAG guidelines)
    expect(boundingBox.width).toBeGreaterThanOrEqual(44);
    expect(boundingBox.height).toBeGreaterThanOrEqual(44);

    // Verify items are properly sized (not too small or stretched)
    // With 3:4 aspect ratio, height should be roughly 1.33x width
    const aspectRatio = boundingBox.height / boundingBox.width;
    expect(aspectRatio).toBeGreaterThan(1.2);
    expect(aspectRatio).toBeLessThan(1.5);
  });

  test('Test Case 5: Year selector is accessible and usable on mobile viewport', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });

    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Year selector should be visible
    const yearSelector = page.locator('[data-testid="year-selector"]');
    await expect(yearSelector).toBeVisible({ timeout: 10000 });

    // Year selector trigger should be clickable
    const trigger = page.locator('[data-testid="year-selector-trigger"]');
    await expect(trigger).toBeVisible();

    // Get trigger bounding box and verify touch target size
    const triggerBox = await trigger.boundingBox();
    expect(triggerBox.width).toBeGreaterThanOrEqual(44);
    expect(triggerBox.height).toBeGreaterThanOrEqual(44);

    // Click the trigger to open dropdown
    await trigger.click();

    // Dropdown should be visible
    const dropdown = page.locator('[data-testid="year-dropdown"]');
    await expect(dropdown).toBeVisible({ timeout: 5000 });

    // Year options should have adequate touch target size
    const yearOption = page.locator('.year-option').first();
    await expect(yearOption).toBeVisible();

    const optionBox = await yearOption.boundingBox();
    expect(optionBox.height).toBeGreaterThanOrEqual(30); // Minimum tappable height

    // Select a year to verify functionality
    await yearOption.click();

    // Dropdown should close after selection
    await expect(dropdown).not.toBeVisible({ timeout: 5000 });
  });

  test('Grid CSS uses appropriate media queries for responsive breakpoints', async ({ page }) => {
    // Test at different viewports and verify CSS changes

    // Desktop (1200px)
    await page.setViewportSize({ width: 1200, height: 800 });
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.waitForSelector('.grid-container', { timeout: 10000 });

    const desktopStyles = await page.locator('.grid-container').first().evaluate(el => {
      const computed = window.getComputedStyle(el);
      return {
        display: computed.display,
        gridTemplateColumns: computed.gridTemplateColumns,
        gap: computed.gap
      };
    });

    expect(desktopStyles.display).toBe('grid');
    // At 1200px (> 1024px), should use minmax(140px, 1fr) breakpoint with 20px gap
    expect(desktopStyles.gap).toMatch(/20px/);

    // Mobile (375px)
    await page.setViewportSize({ width: 375, height: 667 });
    await page.waitForTimeout(300); // Allow CSS to recalculate

    const mobileStyles = await page.locator('.grid-container').first().evaluate(el => {
      const computed = window.getComputedStyle(el);
      return {
        display: computed.display,
        gridTemplateColumns: computed.gridTemplateColumns,
        gap: computed.gap
      };
    });

    expect(mobileStyles.display).toBe('grid');
    // At 375px (below 768px), should use minmax(100px, 1fr) breakpoint with 12px gap
    expect(mobileStyles.gap).toMatch(/12px/);
  });

  test('Title overlays are always visible on mobile', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });

    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Wait for grid items
    await page.waitForSelector('.grid-item', { timeout: 10000 });

    // Check title overlay opacity on mobile (should be 1, always visible)
    const titleOverlay = page.locator('.item-title-overlay').first();
    await expect(titleOverlay).toBeVisible();

    const opacity = await titleOverlay.evaluate(el => {
      return window.getComputedStyle(el).opacity;
    });

    expect(opacity).toBe('1');
  });

  test('Page layout adapts properly on mobile viewport', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });

    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Check that page title font size is reduced on mobile
    const pageTitle = page.locator('.pageTitle');
    await expect(pageTitle).toBeVisible({ timeout: 10000 });

    const titleFontSize = await pageTitle.evaluate(el => {
      return window.getComputedStyle(el).fontSize;
    });

    // On mobile, font-size should be 3.5em (roughly 56px at default 16px base)
    const fontSizeValue = parseFloat(titleFontSize);
    expect(fontSizeValue).toBeLessThan(90); // Less than desktop 5.5em

    // Gallery container should have reduced gap on mobile
    const galleryContainer = page.locator('.gallery-container');
    await expect(galleryContainer).toBeVisible();

    const containerGap = await galleryContainer.evaluate(el => {
      return window.getComputedStyle(el).gap;
    });

    expect(containerGap).toMatch(/30px/);
  });

  test('No horizontal overflow on mobile viewport', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });

    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Wait for content to load
    await page.waitForSelector('.grid-container', { timeout: 10000 });

    // Check for horizontal overflow
    const hasHorizontalScroll = await page.evaluate(() => {
      return document.body.scrollWidth > document.body.clientWidth;
    });

    expect(hasHorizontalScroll).toBe(false);
  });
});
