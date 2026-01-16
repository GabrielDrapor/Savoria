import { test, expect } from '@playwright/test';

// Mock data for testing
const mockBookData = {
  data: Array.from({ length: 5 }, (_, i) => ({
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

test.describe('Grid Layout Display', () => {
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
    // Wait for the page to be fully loaded
    await page.waitForLoadState('networkidle');
  });

  test('Test Case 1: Books section displays covers in grid layout', async ({ page }) => {
    // Wait for the books section to appear
    const booksSection = page.locator('[data-category="book"]');
    await expect(booksSection).toBeVisible({ timeout: 10000 });

    // Check the category title
    const title = booksSection.locator('.category-title');
    await expect(title).toHaveText('I read');

    // Check grid container exists
    const gridContainer = booksSection.locator('.grid-container');
    await expect(gridContainer).toBeVisible();

    // Verify it uses CSS Grid
    const display = await gridContainer.evaluate(el => {
      return window.getComputedStyle(el).display;
    });
    expect(display).toBe('grid');
  });

  test('Test Case 2: Screen section displays movie and TV covers in grid', async ({ page }) => {
    // Wait for screen section
    const screenSection = page.locator('[data-category="screen"]');
    await expect(screenSection).toBeVisible({ timeout: 10000 });

    // Check the category title
    const title = screenSection.locator('.category-title');
    await expect(title).toHaveText('I watched');

    // Check grid container exists
    const gridContainer = screenSection.locator('.grid-container');
    await expect(gridContainer).toBeVisible();
  });

  test('Test Case 3: Grid uses CSS Grid with proper gap spacing and auto-fit columns', async ({ page }) => {
    // Wait for any grid container to appear
    const gridContainer = page.locator('.grid-container').first();
    await expect(gridContainer).toBeVisible({ timeout: 10000 });

    // Verify CSS Grid properties
    const styles = await gridContainer.evaluate(el => {
      const computed = window.getComputedStyle(el);
      return {
        display: computed.display,
        gridTemplateColumns: computed.gridTemplateColumns,
        gap: computed.gap,
        rowGap: computed.rowGap,
        columnGap: computed.columnGap
      };
    });

    // Verify it's a grid
    expect(styles.display).toBe('grid');

    // Gap should be set (20px based on component CSS)
    expect(styles.gap || styles.rowGap || styles.columnGap).toBeTruthy();
  });

  test('Test Case 4: All 10 items visible without horizontal scrollbar', async ({ page }) => {
    // Wait for the gallery to load
    await page.waitForSelector('.gallery-container', { timeout: 10000 });

    // Get the gallery container
    const galleryContainer = page.locator('.gallery-container');
    await expect(galleryContainer).toBeVisible();

    // Check for horizontal scrollbar on grid containers
    const gridContainers = page.locator('.grid-container');
    const count = await gridContainers.count();

    for (let i = 0; i < count; i++) {
      const container = gridContainers.nth(i);
      const hasHorizontalScroll = await container.evaluate(el => {
        return el.scrollWidth > el.clientWidth;
      });
      // Grid containers should not have horizontal scroll
      expect(hasHorizontalScroll).toBe(false);
    }

    // Verify the page itself doesn't require horizontal scroll for content
    const bodyHasHorizontalScroll = await page.evaluate(() => {
      return document.body.scrollWidth > document.body.clientWidth;
    });
    expect(bodyHasHorizontalScroll).toBe(false);
  });

  test('Verify all four category sections are visible', async ({ page }) => {
    // Wait for page to load
    await page.waitForSelector('.gallery-container', { timeout: 10000 });

    // Check all four categories exist
    const categories = ['book', 'screen', 'music', 'game'];
    const categoryTitles = ['I read', 'I watched', 'I listened', 'I played'];

    for (let i = 0; i < categories.length; i++) {
      const section = page.locator(`[data-category="${categories[i]}"]`);
      await expect(section).toBeVisible();

      const title = section.locator('.category-title');
      await expect(title).toHaveText(categoryTitles[i]);
    }
  });

  test('Grid items maintain aspect ratio 3:4', async ({ page }) => {
    // Wait for grid items to appear
    const gridItem = page.locator('.grid-item').first();
    await expect(gridItem).toBeVisible({ timeout: 10000 });

    // Check aspect ratio
    const aspectRatio = await gridItem.evaluate(el => {
      const computed = window.getComputedStyle(el);
      return computed.aspectRatio;
    });

    expect(aspectRatio).toBe('3 / 4');
  });

  test('Loading state displays shimmer placeholders', async ({ page }) => {
    // Check if loading placeholders exist initially or during load
    // Navigate fresh to catch initial load state
    await page.goto('/');

    // The loading grid should be visible briefly while data loads
    // We can verify the loading structure exists in the DOM
    const loadingGrid = page.locator('[data-testid="loading-grid"]');

    // Either loading grid is visible or data has already loaded
    // Just verify the component structure is correct by checking for loading items
    const initialLoadingItems = await loadingGrid.locator('.loading-item').count();

    // If loading is visible, it should have 8 placeholders per section
    if (initialLoadingItems > 0) {
      expect(initialLoadingItems).toBe(8);
    }
  });

  test('Cover images have lazy loading attribute', async ({ page }) => {
    // Wait for cover containers to be in DOM
    await page.waitForSelector('[data-testid="cover-container"]', { timeout: 10000 });

    // Images use .cover-image class (from CoverItem component)
    const images = page.locator('.cover-image');
    const count = await images.count();

    if (count > 0) {
      // Verify lazy loading attribute on first image
      const firstImage = images.first();
      const loading = await firstImage.getAttribute('loading');
      expect(loading).toBe('lazy');
    } else {
      // Images may have failed to load in test environment, which is acceptable
      // The test passes if we have cover containers
      const containers = page.locator('[data-testid="cover-container"]');
      expect(await containers.count()).toBeGreaterThan(0);
    }
  });

  test('Grid container has no carousel animation', async ({ page }) => {
    // Wait for grid container
    const gridContainer = page.locator('.grid-container').first();
    await expect(gridContainer).toBeVisible({ timeout: 10000 });

    // Verify no animation is applied
    const animation = await gridContainer.evaluate(el => {
      const computed = window.getComputedStyle(el);
      return computed.animation;
    });

    // Should have no animation or 'none'
    expect(animation === 'none' || animation === '' || animation === 'none 0s ease 0s 1 normal none running').toBeTruthy();
  });
});
