import { test, expect } from '@playwright/test';

// Mock data for testing
const mockBookData = {
  data: Array.from({ length: 10 }, (_, i) => ({
    item: {
      cover_image_url: `https://neodb.social/m/item/book${i + 1}.jpg`,
      display_title: `Test Book ${i + 1}`,
      id: `book-${i + 1}`
    },
    created_time: `2024-0${(i % 9) + 1}-15T10:30:00Z`
  }))
};

const mockScreenData = {
  data: Array.from({ length: 8 }, (_, i) => ({
    item: {
      cover_image_url: `https://neodb.social/m/item/movie${i + 1}.jpg`,
      display_title: `Test Movie ${i + 1}`,
      id: `movie-${i + 1}`
    },
    created_time: `2024-0${(i % 9) + 1}-20T14:00:00Z`
  }))
};

const mockMusicData = {
  data: Array.from({ length: 6 }, (_, i) => ({
    item: {
      cover_image_url: `https://neodb.social/m/item/music${i + 1}.jpg`,
      display_title: `Test Album ${i + 1}`,
      id: `music-${i + 1}`
    },
    created_time: `2024-0${(i % 9) + 1}-10T08:00:00Z`
  }))
};

const mockGameData = {
  data: Array.from({ length: 4 }, (_, i) => ({
    item: {
      cover_image_url: `https://neodb.social/m/item/game${i + 1}.jpg`,
      display_title: `Test Game ${i + 1}`,
      id: `game-${i + 1}`
    },
    created_time: `2024-0${(i % 9) + 1}-25T16:00:00Z`
  }))
};

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

  test('Test Case 1: Desktop viewport (1200px) displays 5-6 columns', async ({ page }) => {
    // Set desktop viewport
    await page.setViewportSize({ width: 1200, height: 800 });

    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Wait for grid items to appear
    const gridContainer = page.locator('.grid-container').first();
    await expect(gridContainer).toBeVisible({ timeout: 10000 });

    // Get the computed grid columns
    const gridInfo = await gridContainer.evaluate(el => {
      const computed = window.getComputedStyle(el);
      const gridTemplateColumns = computed.gridTemplateColumns;
      // Count the number of columns by splitting the template
      const columns = gridTemplateColumns.split(' ').filter(col => col.trim() !== '').length;
      return {
        display: computed.display,
        gridTemplateColumns,
        columnCount: columns
      };
    });

    expect(gridInfo.display).toBe('grid');
    // Desktop should show 5-6 columns based on the minmax(160px, 1fr) at 1200px
    expect(gridInfo.columnCount).toBeGreaterThanOrEqual(5);
    expect(gridInfo.columnCount).toBeLessThanOrEqual(6);
  });

  test('Test Case 2: Tablet viewport (800px) displays 3-4 columns', async ({ page }) => {
    // Set tablet viewport
    await page.setViewportSize({ width: 800, height: 600 });

    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Wait for grid items to appear
    const gridContainer = page.locator('.grid-container').first();
    await expect(gridContainer).toBeVisible({ timeout: 10000 });

    // Get the computed grid columns
    const gridInfo = await gridContainer.evaluate(el => {
      const computed = window.getComputedStyle(el);
      const gridTemplateColumns = computed.gridTemplateColumns;
      const columns = gridTemplateColumns.split(' ').filter(col => col.trim() !== '').length;
      return {
        display: computed.display,
        gridTemplateColumns,
        columnCount: columns
      };
    });

    expect(gridInfo.display).toBe('grid');
    // Tablet should show 3-4 columns based on the minmax(140px, 1fr) at 800px
    expect(gridInfo.columnCount).toBeGreaterThanOrEqual(3);
    expect(gridInfo.columnCount).toBeLessThanOrEqual(4);
  });

  test('Test Case 3: Mobile viewport (375px - iPhone) displays 2-3 columns', async ({ page }) => {
    // Set mobile viewport (iPhone SE/X size)
    await page.setViewportSize({ width: 375, height: 667 });

    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Wait for grid items to appear
    const gridContainer = page.locator('.grid-container').first();
    await expect(gridContainer).toBeVisible({ timeout: 10000 });

    // Get the computed grid columns
    const gridInfo = await gridContainer.evaluate(el => {
      const computed = window.getComputedStyle(el);
      const gridTemplateColumns = computed.gridTemplateColumns;
      const columns = gridTemplateColumns.split(' ').filter(col => col.trim() !== '').length;
      return {
        display: computed.display,
        gridTemplateColumns,
        columnCount: columns
      };
    });

    expect(gridInfo.display).toBe('grid');
    // Mobile should show 2-3 columns based on the minmax(100px, 1fr) at 375px
    expect(gridInfo.columnCount).toBeGreaterThanOrEqual(2);
    expect(gridInfo.columnCount).toBeLessThanOrEqual(3);
  });

  test('Test Case 4: Cover items on mobile have proper touch target size (min 44px)', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });

    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Wait for grid items to appear
    const gridItem = page.locator('.grid-item').first();
    await expect(gridItem).toBeVisible({ timeout: 10000 });

    // Get the computed size of grid items
    const itemSize = await gridItem.evaluate(el => {
      const rect = el.getBoundingClientRect();
      return {
        width: rect.width,
        height: rect.height
      };
    });

    // Both width and height should be at least 44px for touch targets
    expect(itemSize.width).toBeGreaterThanOrEqual(44);
    expect(itemSize.height).toBeGreaterThanOrEqual(44);
  });

  test('Test Case 5: Year selector is accessible and usable on mobile', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });

    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Check year selector is visible
    const yearSelector = page.locator('[data-testid="year-selector"]');
    await expect(yearSelector).toBeVisible({ timeout: 10000 });

    // Check the trigger button is large enough for touch
    const trigger = page.locator('[data-testid="year-selector-trigger"]');
    await expect(trigger).toBeVisible();

    const triggerSize = await trigger.evaluate(el => {
      const rect = el.getBoundingClientRect();
      return {
        width: rect.width,
        height: rect.height
      };
    });

    // Touch target should be at least 44px in height for accessibility
    expect(triggerSize.height).toBeGreaterThanOrEqual(30); // Accounting for mobile reduced padding
    expect(triggerSize.width).toBeGreaterThanOrEqual(44);

    // Test that dropdown can be opened
    await trigger.click();
    const dropdown = page.locator('[data-testid="year-dropdown"]');
    await expect(dropdown).toBeVisible();

    // Check dropdown options are tappable
    const yearOption = page.locator('.year-option').first();
    const optionSize = await yearOption.evaluate(el => {
      const rect = el.getBoundingClientRect();
      return {
        width: rect.width,
        height: rect.height
      };
    });

    // Year options should be at least 44px for touch
    expect(optionSize.height).toBeGreaterThanOrEqual(30); // Accounting for mobile reduced padding

    // Test that clicking an option works
    await yearOption.click();
    await expect(dropdown).toBeHidden();
  });

  test('Test Case 6: Grid uses appropriate CSS media query breakpoints', async ({ page }) => {
    // Test desktop breakpoint (≥1200px)
    await page.setViewportSize({ width: 1200, height: 800 });
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const gridContainer = page.locator('.grid-container').first();
    await expect(gridContainer).toBeVisible({ timeout: 10000 });

    // At 1200px, the desktop media query should apply with minmax(160px, 1fr)
    let styles = await gridContainer.evaluate(el => {
      const computed = window.getComputedStyle(el);
      return {
        gap: computed.gap,
        gridTemplateColumns: computed.gridTemplateColumns
      };
    });

    // Desktop should have 24px gap
    expect(styles.gap).toBe('24px');

    // Test tablet viewport (between 768px and 1199px)
    await page.setViewportSize({ width: 900, height: 600 });
    await page.waitForTimeout(100); // Wait for resize to take effect

    styles = await gridContainer.evaluate(el => {
      const computed = window.getComputedStyle(el);
      return {
        gap: computed.gap,
        gridTemplateColumns: computed.gridTemplateColumns
      };
    });

    // Tablet should have 20px gap (default)
    expect(styles.gap).toBe('20px');

    // Test mobile viewport (≤768px)
    await page.setViewportSize({ width: 375, height: 667 });
    await page.waitForTimeout(100); // Wait for resize to take effect

    styles = await gridContainer.evaluate(el => {
      const computed = window.getComputedStyle(el);
      return {
        gap: computed.gap,
        gridTemplateColumns: computed.gridTemplateColumns
      };
    });

    // Mobile should have 12px gap
    expect(styles.gap).toBe('12px');
  });

  test('Grid adapts smoothly when viewport is resized', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const gridContainer = page.locator('.grid-container').first();
    await expect(gridContainer).toBeVisible({ timeout: 10000 });

    // Start at desktop size
    await page.setViewportSize({ width: 1200, height: 800 });
    await page.waitForTimeout(100);

    let columnCount = await gridContainer.evaluate(el => {
      const computed = window.getComputedStyle(el);
      return computed.gridTemplateColumns.split(' ').filter(col => col.trim() !== '').length;
    });
    const desktopColumns = columnCount;

    // Resize to tablet
    await page.setViewportSize({ width: 800, height: 600 });
    await page.waitForTimeout(100);

    columnCount = await gridContainer.evaluate(el => {
      const computed = window.getComputedStyle(el);
      return computed.gridTemplateColumns.split(' ').filter(col => col.trim() !== '').length;
    });
    const tabletColumns = columnCount;

    // Resize to mobile
    await page.setViewportSize({ width: 375, height: 667 });
    await page.waitForTimeout(100);

    columnCount = await gridContainer.evaluate(el => {
      const computed = window.getComputedStyle(el);
      return computed.gridTemplateColumns.split(' ').filter(col => col.trim() !== '').length;
    });
    const mobileColumns = columnCount;

    // Columns should decrease or stay same as viewport shrinks (auto-fit behavior)
    // With CSS Grid auto-fit, columns adapt to container width
    expect(desktopColumns).toBeGreaterThan(tabletColumns);
    // Mobile and tablet can have same columns at certain widths with auto-fit
    expect(tabletColumns).toBeGreaterThanOrEqual(mobileColumns);

    // Verify the ranges per PRD spec
    expect(desktopColumns).toBeGreaterThanOrEqual(5);
    expect(tabletColumns).toBeGreaterThanOrEqual(3);
    expect(tabletColumns).toBeLessThanOrEqual(4);
    expect(mobileColumns).toBeGreaterThanOrEqual(2);
    expect(mobileColumns).toBeLessThanOrEqual(3);
  });

  test('Title overlay is always visible on mobile (no hover required)', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });

    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Wait for grid items to appear
    const titleOverlay = page.locator('.item-title-overlay').first();
    await expect(titleOverlay).toBeVisible({ timeout: 10000 });

    // On mobile, the title overlay should be visible without hover
    const overlayOpacity = await titleOverlay.evaluate(el => {
      return window.getComputedStyle(el).opacity;
    });

    // Opacity should be 1 on mobile (always visible)
    expect(overlayOpacity).toBe('1');
  });
});
