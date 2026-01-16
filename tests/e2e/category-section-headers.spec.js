import { test, expect } from '@playwright/test';

/**
 * Scenario 15: Category Section Headers - E2E Tests
 *
 * Tests that category sections display correct headers and appear in the correct order:
 * 1. Books - "I read"
 * 2. Screen - "I watched"
 * 3. Music - "I listened"
 * 4. Games - "I played"
 */

// Mock data for testing
const mockBookData = {
  data: [
    {
      item: {
        cover_image_url: 'https://neodb.social/m/item/book1.jpg',
        display_title: 'Test Book 1',
        id: 'book-1'
      },
      created_time: '2024-01-15T10:30:00Z'
    }
  ]
};

const mockScreenData = {
  data: [
    {
      item: {
        cover_image_url: 'https://neodb.social/m/item/movie1.jpg',
        display_title: 'Test Movie 1',
        id: 'movie-1'
      },
      created_time: '2024-02-20T14:00:00Z'
    }
  ]
};

const mockMusicData = {
  data: [
    {
      item: {
        cover_image_url: 'https://neodb.social/m/item/music1.jpg',
        display_title: 'Test Album 1',
        id: 'music-1'
      },
      created_time: '2024-03-10T08:00:00Z'
    }
  ]
};

const mockGameData = {
  data: [
    {
      item: {
        cover_image_url: 'https://neodb.social/m/item/game1.jpg',
        display_title: 'Test Game 1',
        id: 'game-1'
      },
      created_time: '2024-04-25T16:00:00Z'
    }
  ]
};

test.describe('Category Section Headers and Order', () => {
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

  test('Test Case 1: Books section header displays "I read"', async ({ page }) => {
    // Wait for the books section to appear
    const booksSection = page.locator('[data-category="book"]');
    await expect(booksSection).toBeVisible({ timeout: 10000 });

    // Check the category title
    const title = booksSection.locator('.category-title');
    await expect(title).toBeVisible();
    await expect(title).toHaveText('I read');

    // Verify the header id attribute
    await expect(title).toHaveAttribute('id', 'book-title');
  });

  test('Test Case 2: Screen section header displays "I watched"', async ({ page }) => {
    // Wait for the screen section to appear
    const screenSection = page.locator('[data-category="screen"]');
    await expect(screenSection).toBeVisible({ timeout: 10000 });

    // Check the category title
    const title = screenSection.locator('.category-title');
    await expect(title).toBeVisible();
    await expect(title).toHaveText('I watched');

    // Verify the header id attribute
    await expect(title).toHaveAttribute('id', 'screen-title');
  });

  test('Test Case 3: Music section header displays "I listened"', async ({ page }) => {
    // Wait for the music section to appear
    const musicSection = page.locator('[data-category="music"]');
    await expect(musicSection).toBeVisible({ timeout: 10000 });

    // Check the category title
    const title = musicSection.locator('.category-title');
    await expect(title).toBeVisible();
    await expect(title).toHaveText('I listened');

    // Verify the header id attribute
    await expect(title).toHaveAttribute('id', 'music-title');
  });

  test('Test Case 4: Games section header displays "I played"', async ({ page }) => {
    // Wait for the games section to appear
    const gamesSection = page.locator('[data-category="game"]');
    await expect(gamesSection).toBeVisible({ timeout: 10000 });

    // Check the category title
    const title = gamesSection.locator('.category-title');
    await expect(title).toBeVisible();
    await expect(title).toHaveText('I played');

    // Verify the header id attribute
    await expect(title).toHaveAttribute('id', 'game-title');
  });

  test('Test Case 5: Category sections appear in correct order (Books, Screen, Music, Games)', async ({ page }) => {
    // Wait for all sections to be visible
    await page.waitForSelector('[data-category="book"]', { timeout: 10000 });
    await page.waitForSelector('[data-category="screen"]', { timeout: 10000 });
    await page.waitForSelector('[data-category="music"]', { timeout: 10000 });
    await page.waitForSelector('[data-category="game"]', { timeout: 10000 });

    // Get all category sections in DOM order
    const sections = await page.locator('.category-section').all();

    // Verify we have exactly 4 sections
    expect(sections.length).toBe(4);

    // Get the data-category attribute for each section in DOM order
    const sectionOrder = [];
    for (const section of sections) {
      const category = await section.getAttribute('data-category');
      sectionOrder.push(category);
    }

    // Expected order: book, screen, music, game
    expect(sectionOrder).toEqual(['book', 'screen', 'music', 'game']);
  });

  test('Test Case 5 (alternative): Verify visual order by comparing Y positions', async ({ page }) => {
    // Wait for all sections to be visible
    await page.waitForSelector('.gallery-container', { timeout: 10000 });

    // Get bounding box positions for each section
    const bookSection = await page.locator('[data-category="book"]').boundingBox();
    const screenSection = await page.locator('[data-category="screen"]').boundingBox();
    const musicSection = await page.locator('[data-category="music"]').boundingBox();
    const gameSection = await page.locator('[data-category="game"]').boundingBox();

    // Verify all sections exist
    expect(bookSection).not.toBeNull();
    expect(screenSection).not.toBeNull();
    expect(musicSection).not.toBeNull();
    expect(gameSection).not.toBeNull();

    // Verify Y positions are in ascending order (book < screen < music < game)
    expect(bookSection.y).toBeLessThan(screenSection.y);
    expect(screenSection.y).toBeLessThan(musicSection.y);
    expect(musicSection.y).toBeLessThan(gameSection.y);
  });

  test('All category headers have correct ARIA labelling', async ({ page }) => {
    // Wait for page to load
    await page.waitForSelector('.gallery-container', { timeout: 10000 });

    const categories = [
      { category: 'book', expectedLabel: 'book-title' },
      { category: 'screen', expectedLabel: 'screen-title' },
      { category: 'music', expectedLabel: 'music-title' },
      { category: 'game', expectedLabel: 'game-title' }
    ];

    for (const { category, expectedLabel } of categories) {
      const section = page.locator(`[data-category="${category}"]`);
      await expect(section).toHaveAttribute('aria-labelledby', expectedLabel);
    }
  });

  test('All category headers are h2 elements', async ({ page }) => {
    // Wait for page to load
    await page.waitForSelector('.gallery-container', { timeout: 10000 });

    const categories = ['book', 'screen', 'music', 'game'];

    for (const category of categories) {
      const header = page.locator(`[data-category="${category}"] h2.category-title`);
      await expect(header).toBeVisible();
    }
  });
});
