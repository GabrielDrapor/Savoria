import { test, expect } from '@playwright/test';

// Empty data responses for testing empty states
const emptyData = { data: [] };

// Mock data for partial responses (some categories have data, others don't)
const mockBookData = {
  data: Array.from({ length: 3 }, (_, i) => ({
    item: {
      cover_image_url: `https://neodb.social/m/item/book${i + 1}.jpg`,
      display_title: `Test Book ${i + 1}`,
      id: `book-${i + 1}`
    },
    created_time: `2024-0${i + 1}-15T10:30:00Z`
  }))
};

const mockScreenData = {
  data: Array.from({ length: 2 }, (_, i) => ({
    item: {
      cover_image_url: `https://neodb.social/m/item/movie${i + 1}.jpg`,
      display_title: `Test Movie ${i + 1}`,
      id: `movie-${i + 1}`
    },
    created_time: `2024-0${i + 1}-20T14:00:00Z`
  }))
};

test.describe('Empty State Handling (REQ-8, US-5)', () => {
  test('Test Case 1: Books section shows empty message when no books data', async ({ page }) => {
    // Mock API responses - books empty, others have data
    await page.route('**/api/complete/book/**', route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(emptyData)
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
        body: JSON.stringify(emptyData)
      });
    });

    await page.route('**/api/complete/game/**', route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(emptyData)
      });
    });

    // Navigate to the gallery page
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Wait for the books section to appear
    const booksSection = page.locator('[data-category="book"]');
    await expect(booksSection).toBeVisible({ timeout: 10000 });

    // Check that the books section shows empty state
    const emptyState = booksSection.locator('[data-testid="empty-state"]');
    await expect(emptyState).toBeVisible();

    // Verify the empty message text
    const emptyMessage = booksSection.locator('.empty-message');
    await expect(emptyMessage).toHaveText('Nothing recorded this year');

    // Verify the section is still visible (not hidden)
    const categoryTitle = booksSection.locator('.category-title');
    await expect(categoryTitle).toBeVisible();
    await expect(categoryTitle).toHaveText('I read');
  });

  test('Test Case 3: All four sections visible with empty state messages when all categories empty', async ({ page }) => {
    // Mock all API responses as empty
    await page.route('**/api/complete/book/**', route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(emptyData)
      });
    });

    await page.route('**/api/complete/screen/**', route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(emptyData)
      });
    });

    await page.route('**/api/complete/music/**', route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(emptyData)
      });
    });

    await page.route('**/api/complete/game/**', route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(emptyData)
      });
    });

    // Navigate to the gallery page
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Check all four categories are visible with empty states
    const categories = ['book', 'screen', 'music', 'game'];
    const categoryTitles = ['I read', 'I watched', 'I listened', 'I played'];

    for (let i = 0; i < categories.length; i++) {
      const section = page.locator(`[data-category="${categories[i]}"]`);
      await expect(section).toBeVisible({ timeout: 10000 });

      // Verify section title is visible
      const title = section.locator('.category-title');
      await expect(title).toBeVisible();
      await expect(title).toHaveText(categoryTitles[i]);

      // Verify empty state is shown
      const emptyState = section.locator('[data-testid="empty-state"]');
      await expect(emptyState).toBeVisible();

      // Verify empty message
      const emptyMessage = section.locator('.empty-message');
      await expect(emptyMessage).toHaveText('Nothing recorded this year');
    }
  });

  test('Test Case 4: Empty state message has muted text and is centered', async ({ page }) => {
    // Mock all API responses as empty
    await page.route('**/api/complete/**', route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(emptyData)
      });
    });

    // Navigate to the gallery page
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Wait for the books section to appear
    const booksSection = page.locator('[data-category="book"]');
    await expect(booksSection).toBeVisible({ timeout: 10000 });

    // Get the empty state element
    const emptyState = booksSection.locator('.empty-state');
    await expect(emptyState).toBeVisible();

    // Verify centering via CSS
    const emptyStateStyles = await emptyState.evaluate(el => {
      const computed = window.getComputedStyle(el);
      return {
        display: computed.display,
        justifyContent: computed.justifyContent,
        alignItems: computed.alignItems
      };
    });

    // Should be flex with centering
    expect(emptyStateStyles.display).toBe('flex');
    expect(emptyStateStyles.justifyContent).toBe('center');
    expect(emptyStateStyles.alignItems).toBe('center');

    // Verify muted text color on the message
    const emptyMessage = booksSection.locator('.empty-message');
    await expect(emptyMessage).toBeVisible();

    const messageStyles = await emptyMessage.evaluate(el => {
      const computed = window.getComputedStyle(el);
      return {
        textAlign: computed.textAlign,
        color: computed.color
      };
    });

    // Should have centered text
    expect(messageStyles.textAlign).toBe('center');

    // Color should be muted (rgba(255, 255, 255, 0.5) or similar)
    // The color value will be in rgb/rgba format
    expect(messageStyles.color).toMatch(/rgba?\(255,\s*255,\s*255/);
  });

  test('Section with data shows grid, empty section shows empty state message', async ({ page }) => {
    // Mock API - books have data, music is empty
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
        body: JSON.stringify(emptyData)
      });
    });

    await page.route('**/api/complete/game/**', route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(emptyData)
      });
    });

    // Navigate to the gallery page
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Verify books section has grid with items
    const booksSection = page.locator('[data-category="book"]');
    await expect(booksSection).toBeVisible({ timeout: 10000 });
    const booksGrid = booksSection.locator('[data-testid="items-grid-book"]');
    await expect(booksGrid).toBeVisible();
    const bookItems = booksSection.locator('[data-testid="cover-item"]');
    expect(await bookItems.count()).toBe(3);

    // Verify music section shows empty state
    const musicSection = page.locator('[data-category="music"]');
    await expect(musicSection).toBeVisible();
    const musicEmptyState = musicSection.locator('[data-testid="empty-state"]');
    await expect(musicEmptyState).toBeVisible();
    const musicEmptyMessage = musicSection.locator('.empty-message');
    await expect(musicEmptyMessage).toHaveText('Nothing recorded this year');
  });

  test('Empty state does not show loading shimmer', async ({ page }) => {
    // Mock all API responses as empty
    await page.route('**/api/complete/**', route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(emptyData)
      });
    });

    // Navigate to the gallery page
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Wait for the books section to appear
    const booksSection = page.locator('[data-category="book"]');
    await expect(booksSection).toBeVisible({ timeout: 10000 });

    // Verify empty state is shown, not loading state
    const emptyState = booksSection.locator('[data-testid="empty-state"]');
    await expect(emptyState).toBeVisible();

    // Loading grid should not be visible
    const loadingGrid = booksSection.locator('[data-testid="loading-grid"]');
    await expect(loadingGrid).not.toBeVisible();
  });
});
