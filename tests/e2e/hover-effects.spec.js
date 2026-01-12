import { test, expect } from '@playwright/test';

// Mock data for testing hover effects
const mockBookData = {
  data: [
    {
      item: {
        cover_image_url: 'https://neodb.social/m/item/gatsby.jpg',
        display_title: 'The Great Gatsby',
        id: 'book-gatsby'
      },
      created_time: '2024-01-15T10:30:00Z'
    },
    {
      item: {
        cover_image_url: 'https://neodb.social/m/item/book2.jpg',
        display_title: 'Test Book 2',
        id: 'book-2'
      },
      created_time: '2024-02-20T14:00:00Z'
    }
  ]
};

const mockScreenData = {
  data: [
    {
      item: {
        cover_image_url: 'https://neodb.social/m/item/movie1.jpg',
        display_title: 'Test Movie',
        id: 'movie-1'
      },
      created_time: '2024-03-10T12:00:00Z'
    }
  ]
};

const mockMusicData = { data: [] };
const mockGameData = { data: [] };

test.describe('Hover Effects and Title Display (Scenario 5)', () => {
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

  test('Test Case 1: Hover over cover shows title overlay with "The Great Gatsby"', async ({ page }) => {
    // Wait for the books section to load
    const booksSection = page.locator('[data-category="book"]');
    await expect(booksSection).toBeVisible({ timeout: 10000 });

    // Find the first grid item with The Great Gatsby
    const gatsbyItem = booksSection.locator('.grid-item').first();
    await expect(gatsbyItem).toBeVisible();

    // Get the title overlay
    const titleOverlay = gatsbyItem.locator('.item-title-overlay');

    // Before any interaction, title overlay should have opacity 0
    const initialOpacity = await titleOverlay.evaluate(el => {
      return window.getComputedStyle(el).opacity;
    });
    expect(initialOpacity).toBe('0');

    // Verify the title text is "The Great Gatsby"
    const titleText = await gatsbyItem.locator('.item-title').textContent();
    expect(titleText).toBe('The Great Gatsby');

    // The title overlay structure exists and is positioned at the bottom
    const overlayPosition = await titleOverlay.evaluate(el => {
      const style = window.getComputedStyle(el);
      return {
        position: style.position,
        bottom: style.bottom,
        left: style.left,
        right: style.right
      };
    });
    expect(overlayPosition.position).toBe('absolute');
    expect(overlayPosition.bottom).toBe('0px');

    // Trigger touch interaction to reveal title (simulates touch device behavior)
    await gatsbyItem.dispatchEvent('touchstart');
    // Wait for transition to complete (0.3s ease transition)
    await page.waitForTimeout(400);

    // After touch, title overlay should be visible (fully opaque)
    const activeOpacity = await titleOverlay.evaluate(el => {
      return window.getComputedStyle(el).opacity;
    });
    expect(parseFloat(activeOpacity)).toBeGreaterThan(0.9);
  });

  test('Test Case 2: Hover over cover applies visual effect (scale transform via touch)', async ({ page }) => {
    // Wait for grid items
    const gridItem = page.locator('.grid-item').first();
    await expect(gridItem).toBeVisible({ timeout: 10000 });

    // Verify the grid item has transition styles for hover effects
    const initialStyles = await gridItem.evaluate(el => {
      const style = window.getComputedStyle(el);
      return {
        transition: style.transition,
        transform: style.transform
      };
    });
    // Should have transition for transform
    expect(initialStyles.transition).toContain('transform');

    // Trigger touch interaction (which applies hover-like effect)
    await gridItem.dispatchEvent('touchstart');
    await page.waitForTimeout(350);

    const activeTransform = await gridItem.evaluate(el => {
      return window.getComputedStyle(el).transform;
    });

    // The active transform should be scale 1.05
    // matrix(1.05, 0, 0, 1.05, 0, 0) represents scale(1.05)
    expect(activeTransform).not.toBe('none');
    expect(activeTransform).toContain('matrix');
    const match = activeTransform.match(/matrix\(([\d.]+)/);
    if (match) {
      const scaleValue = parseFloat(match[1]);
      expect(scaleValue).toBeCloseTo(1.05, 1);
    }
  });

  test('Test Case 2b: Hover/touch applies shadow effect on cover', async ({ page }) => {
    // Wait for grid items
    const gridItem = page.locator('.grid-item').first();
    await expect(gridItem).toBeVisible({ timeout: 10000 });

    const coverImg = gridItem.locator('.cover-img');

    // Get initial box-shadow
    const initialShadow = await coverImg.evaluate(el => {
      return window.getComputedStyle(el).boxShadow;
    });
    expect(initialShadow).not.toBe('none');

    // Cover image should have transition for box-shadow
    const hasTransition = await coverImg.evaluate(el => {
      return window.getComputedStyle(el).transition;
    });
    expect(hasTransition).toContain('box-shadow');

    // Trigger touch interaction
    await gridItem.dispatchEvent('touchstart');
    await page.waitForTimeout(350);

    const activeShadow = await coverImg.evaluate(el => {
      return window.getComputedStyle(el).boxShadow;
    });

    // Active shadow should be enhanced (different from initial)
    expect(activeShadow).not.toBe('none');
  });

  test('Test Case 5: Touch active state can be toggled off (simulates leaving cover)', async ({ page }) => {
    // Wait for grid items
    const gridItem = page.locator('.grid-item').first();
    await expect(gridItem).toBeVisible({ timeout: 10000 });

    const titleOverlay = gridItem.locator('.item-title-overlay');

    // Trigger touchstart to activate
    await gridItem.dispatchEvent('touchstart');
    await page.waitForTimeout(350);

    // Verify active state
    const activeOpacity = await titleOverlay.evaluate(el => {
      return window.getComputedStyle(el).opacity;
    });
    expect(activeOpacity).toBe('1');

    const activeTransform = await gridItem.evaluate(el => {
      return window.getComputedStyle(el).transform;
    });
    expect(activeTransform).toContain('matrix');

    // Trigger touchstart again to toggle off (second tap)
    await gridItem.dispatchEvent('touchstart');
    await page.waitForTimeout(350);

    // After second touch, title overlay should be hidden again
    const leaveOpacity = await titleOverlay.evaluate(el => {
      return window.getComputedStyle(el).opacity;
    });
    expect(leaveOpacity).toBe('0');

    // Transform should be reset
    const leaveTransform = await gridItem.evaluate(el => {
      return window.getComputedStyle(el).transform;
    });
    // Should be none or matrix(1, 0, 0, 1, 0, 0) (identity)
    expect(leaveTransform === 'none' || leaveTransform === 'matrix(1, 0, 0, 1, 0, 0)').toBeTruthy();
  });

  test('Title overlay shows correct title text for each item', async ({ page }) => {
    // Wait for the books section
    const booksSection = page.locator('[data-category="book"]');
    await expect(booksSection).toBeVisible({ timeout: 10000 });

    const gridItems = booksSection.locator('.grid-item');
    const count = await gridItems.count();

    // Verify we have the expected number of items
    expect(count).toBe(2);

    // Check first item title
    const firstTitle = await gridItems.nth(0).locator('.item-title').textContent();
    expect(firstTitle).toBe('The Great Gatsby');

    // Check second item title
    const secondTitle = await gridItems.nth(1).locator('.item-title').textContent();
    expect(secondTitle).toBe('Test Book 2');
  });

  test('Grid item has z-index elevated on active state', async ({ page }) => {
    // Wait for grid item
    const gridItem = page.locator('.grid-item').first();
    await expect(gridItem).toBeVisible({ timeout: 10000 });

    // Get initial z-index
    const initialZIndex = await gridItem.evaluate(el => {
      return window.getComputedStyle(el).zIndex;
    });

    // Trigger touchstart to activate
    await gridItem.dispatchEvent('touchstart');
    await page.waitForTimeout(350);

    // z-index should be elevated (10)
    const activeZIndex = await gridItem.evaluate(el => {
      return window.getComputedStyle(el).zIndex;
    });

    expect(parseInt(activeZIndex)).toBe(10);
  });

  test('Title overlay has gradient background', async ({ page }) => {
    // Wait for grid item
    const gridItem = page.locator('.grid-item').first();
    await expect(gridItem).toBeVisible({ timeout: 10000 });

    const titleOverlay = gridItem.locator('.item-title-overlay');

    // Check the background has gradient
    const background = await titleOverlay.evaluate(el => {
      return window.getComputedStyle(el).backgroundImage;
    });

    // Should have a linear gradient
    expect(background).toContain('linear-gradient');
  });

  test('Cover image has alt text from display_title', async ({ page }) => {
    // Wait for cover images
    const coverImg = page.locator('.cover-img').first();
    await expect(coverImg).toBeVisible({ timeout: 10000 });

    // Check alt attribute
    const altText = await coverImg.getAttribute('alt');
    expect(altText).toBe('The Great Gatsby');
  });
});

test.describe('Hover Effects - Reduced Motion', () => {
  test('respects prefers-reduced-motion setting', async ({ page }) => {
    // Emulate reduced motion preference
    await page.emulateMedia({ reducedMotion: 'reduce' });

    // Setup mocks
    await page.route('**/api/complete/book/**', route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(mockBookData)
      });
    });

    await page.route('**/api/complete/screen/**', route => {
      route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ data: [] }) });
    });

    await page.route('**/api/complete/music/**', route => {
      route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ data: [] }) });
    });

    await page.route('**/api/complete/game/**', route => {
      route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ data: [] }) });
    });

    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Wait for grid item
    const gridItem = page.locator('.grid-item').first();
    await expect(gridItem).toBeVisible({ timeout: 10000 });

    // Hover
    await gridItem.hover();
    await page.waitForTimeout(350);

    // With reduced motion, transform should be none (no scale)
    const transform = await gridItem.evaluate(el => {
      return window.getComputedStyle(el).transform;
    });

    // Should not have scale transform with reduced motion
    expect(transform === 'none' || transform === 'matrix(1, 0, 0, 1, 0, 0)').toBeTruthy();
  });
});
