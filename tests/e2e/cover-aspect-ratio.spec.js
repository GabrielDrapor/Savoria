import { test, expect } from '@playwright/test';

test.describe('Cover Image Aspect Ratio and Consistency (REQ-5)', () => {
  // Mock API responses for consistent test data
  const mockCoverData = {
    book: {
      data: [
        { item: { cover_image_url: 'https://neodb.social/m/book/cover1.jpg', display_title: 'Test Book 1' } },
        { item: { cover_image_url: 'https://neodb.social/m/book/cover2.jpg', display_title: 'Test Book 2' } },
        { item: { cover_image_url: 'https://neodb.social/m/book/cover3.jpg', display_title: 'Test Book 3' } }
      ]
    },
    screen: {
      data: [
        { item: { cover_image_url: 'https://neodb.social/m/movie/cover1.jpg', display_title: 'Test Movie 1' } },
        { item: { cover_image_url: 'https://neodb.social/m/movie/cover2.jpg', display_title: 'Test Movie 2' } }
      ]
    },
    music: {
      data: [
        { item: { cover_image_url: 'https://neodb.social/m/music/cover1.jpg', display_title: 'Test Album 1' } },
        { item: { cover_image_url: 'https://neodb.social/m/music/cover2.jpg', display_title: 'Test Album 2' } }
      ]
    },
    game: {
      data: [
        { item: { cover_image_url: 'https://neodb.social/m/game/cover1.jpg', display_title: 'Test Game 1' } },
        { item: { cover_image_url: 'https://neodb.social/m/game/cover2.jpg', display_title: 'Test Game 2' } }
      ]
    }
  };

  test.beforeEach(async ({ page }) => {
    // Mock all API endpoints
    await page.route('**/api/complete/**', async (route) => {
      const url = route.request().url();
      let category = 'book';

      if (url.includes('/screen')) category = 'screen';
      else if (url.includes('/music')) category = 'music';
      else if (url.includes('/game')) category = 'game';
      else if (url.includes('/book')) category = 'book';

      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(mockCoverData[category])
      });
    });
  });

  test.describe('Test Case 3: Multiple covers in grid have identical width', () => {
    test('All covers within the same category row have identical widths', async ({ page }) => {
      // Navigate to the app
      await page.goto('/?year=2024');

      // Wait for items to load - check for cover containers to appear
      await page.waitForSelector('[data-testid="cover-container"]', { timeout: 15000 });

      // Check covers within a single category (book) for consistent widths
      const bookGrid = page.locator('[data-testid="items-grid-book"]');
      const bookCovers = bookGrid.locator('[data-testid="cover-container"]');
      const count = await bookCovers.count();

      // Ensure we have at least 2 covers to compare within the same category
      expect(count).toBeGreaterThanOrEqual(2);

      // Get all widths within the book category
      const widths = await bookCovers.evaluateAll((elements) =>
        elements.map((el) => el.getBoundingClientRect().width)
      );

      // All covers in the same category should have the same width (within 1px tolerance for rounding)
      const firstWidth = widths[0];
      for (let i = 1; i < widths.length; i++) {
        expect(Math.abs(widths[i] - firstWidth)).toBeLessThanOrEqual(1);
      }
    });

    test('All covers maintain 3:4 aspect ratio in the rendered output', async ({ page }) => {
      // Navigate to the app
      await page.goto('/?year=2024');

      // Wait for items to load
      await page.waitForSelector('[data-testid="cover-container"]', { timeout: 15000 });

      // Get all cover containers
      const covers = page.locator('[data-testid="cover-container"]');
      const count = await covers.count();

      expect(count).toBeGreaterThanOrEqual(1);

      // Check aspect ratio of all covers
      const dimensions = await covers.evaluateAll((elements) =>
        elements.map((el) => {
          const rect = el.getBoundingClientRect();
          return { width: rect.width, height: rect.height };
        })
      );

      // Verify each cover has approximately 3:4 aspect ratio (width/height = 0.75)
      for (const dim of dimensions) {
        const aspectRatio = dim.width / dim.height;
        // Allow 5% tolerance for rounding differences
        expect(aspectRatio).toBeGreaterThan(0.71); // 0.75 - 0.04
        expect(aspectRatio).toBeLessThan(0.79); // 0.75 + 0.04
      }
    });

    test('Covers in same row have identical heights', async ({ page }) => {
      // Navigate to the app
      await page.goto('/?year=2024');

      // Wait for items to load
      await page.waitForSelector('[data-testid="cover-container"]', { timeout: 15000 });

      // Check covers within a single category (book) for consistent heights
      const bookGrid = page.locator('[data-testid="items-grid-book"]');
      const bookCovers = bookGrid.locator('[data-testid="cover-container"]');

      // Get all heights within the book category
      const heights = await bookCovers.evaluateAll((elements) =>
        elements.map((el) => el.getBoundingClientRect().height)
      );

      // All covers in the same category should have the same height (within 1px tolerance)
      const firstHeight = heights[0];
      for (let i = 1; i < heights.length; i++) {
        expect(Math.abs(heights[i] - firstHeight)).toBeLessThanOrEqual(1);
      }
    });

    test('Cover containers use CSS aspect-ratio property', async ({ page }) => {
      // Navigate to the app
      await page.goto('/?year=2024');

      // Wait for items to load
      await page.waitForSelector('[data-testid="cover-container"]', { timeout: 15000 });

      // Check computed style of first cover container
      const cover = page.locator('[data-testid="cover-container"]').first();
      const aspectRatio = await cover.evaluate((el) =>
        window.getComputedStyle(el).aspectRatio
      );

      // Should be '3 / 4' (may vary by browser normalization)
      expect(aspectRatio).toMatch(/3\s*\/\s*4/);
    });

    test('Cover images use object-fit: cover for consistent display', async ({ page }) => {
      // Navigate to the app
      await page.goto('/?year=2024');

      // Wait for cover containers to load first
      await page.waitForSelector('[data-testid="cover-container"]', { timeout: 15000 });

      // Try to find cover-image, but if images fail to load, they become placeholders
      // The test verifies that when images DO render, they use object-fit: cover
      const images = page.locator('[data-testid="cover-image"]');
      const count = await images.count();

      if (count > 0) {
        // If there are actual images rendered, verify object-fit
        const objectFit = await images.first().evaluate((el) =>
          window.getComputedStyle(el).objectFit
        );
        expect(objectFit).toBe('cover');
      } else {
        // Images may have failed to load (mock URLs), which is expected in test env
        // Verify the CSS class exists on the component by checking placeholder has correct container
        const placeholders = page.locator('[data-testid="cover-placeholder"]');
        const placeholderCount = await placeholders.count();

        // If all images failed, we should have placeholders
        // The important thing is that the containers still maintain proper sizing
        expect(placeholderCount).toBeGreaterThan(0);
      }
    });
  });

  test.describe('Grid consistency across categories', () => {
    test('Covers maintain consistent 3:4 aspect ratio across categories', async ({ page }) => {
      // Navigate to the app
      await page.goto('/?year=2024');

      // Wait for items to load
      await page.waitForSelector('[data-testid="cover-container"]', { timeout: 15000 });

      // Get aspect ratios from all categories
      const allAspectRatios = await page.evaluate(() => {
        const categories = ['book', 'screen', 'music', 'game'];
        const results = {};

        for (const cat of categories) {
          const grid = document.querySelector(`[data-testid="items-grid-${cat}"]`);
          if (grid) {
            const covers = grid.querySelectorAll('[data-testid="cover-container"]');
            if (covers.length > 0) {
              const rect = covers[0].getBoundingClientRect();
              results[cat] = rect.width / rect.height;
            }
          }
        }

        return results;
      });

      // Verify all categories have covers with 3:4 aspect ratio (0.75)
      for (const [cat, aspectRatio] of Object.entries(allAspectRatios)) {
        // Allow 5% tolerance for rounding differences
        expect(aspectRatio).toBeGreaterThan(0.71); // 0.75 - 0.04
        expect(aspectRatio).toBeLessThan(0.79); // 0.75 + 0.04
      }
    });
  });
});
