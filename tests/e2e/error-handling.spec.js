import { test, expect } from '@playwright/test';

/**
 * Error Handling - API Failures Tests
 * Scenario: Test graceful error handling when API requests fail
 *
 * Test cases:
 * 1. All API endpoints return 500 error - Error message displayed to user
 * 2. Books API fails, others succeed - Books section shows error, other categories display normally
 * 3. Network timeout on API request - Loading state eventually shows timeout error
 * 4. Retry button on error state - User can retry failed request
 */

// Mock data for successful API responses
const mockBookData = {
  data: [
    {
      item: {
        cover_image_url: 'https://neodb.social/m/item/book1.jpg.200x200_q85_autocrop_crop-scale.jpg',
        display_title: 'Test Book 2024',
        id: 'book-1'
      },
      created_time: '2024-06-15T10:30:00Z'
    }
  ]
};

const mockScreenData = {
  data: [
    {
      item: {
        cover_image_url: 'https://neodb.social/m/item/movie1.jpg.200x200_q85_autocrop_crop-scale.jpg',
        display_title: 'Test Movie 2024',
        id: 'movie-1'
      },
      created_time: '2024-07-10T18:00:00Z'
    }
  ]
};

const mockMusicData = {
  data: [
    {
      item: {
        cover_image_url: 'https://neodb.social/m/item/album1.jpg.200x200_q85_autocrop_crop-scale.jpg',
        display_title: 'Test Album 2024',
        id: 'album-1'
      },
      created_time: '2024-05-05T12:00:00Z'
    }
  ]
};

const mockGameData = {
  data: [
    {
      item: {
        cover_image_url: 'https://neodb.social/m/item/game1.jpg.200x200_q85_autocrop_crop-scale.jpg',
        display_title: 'Test Game 2024',
        id: 'game-1'
      },
      created_time: '2024-08-20T20:00:00Z'
    }
  ]
};

test.describe('Error Handling - API Failures', () => {

  test.describe('Test Case 1: All API endpoints return 500 error', () => {
    test('displays error message to user when all API calls fail with 500', async ({ page }) => {
      // Mock all API endpoints to return 500 error
      await page.route('**/api/complete/**', route => {
        route.fulfill({
          status: 500,
          contentType: 'application/json',
          body: JSON.stringify({ error: 'Internal Server Error' })
        });
      });

      await page.goto('/?year=2024');

      // Wait for page to process the errors
      await page.waitForTimeout(2000);

      // Page should not be blank - gallery structure should exist
      const galleryContainer = page.locator('.gallery-container');
      await expect(galleryContainer).toBeVisible({ timeout: 10000 });

      // All category sections should show error state
      const categories = ['book', 'screen', 'music', 'game'];
      for (const category of categories) {
        const section = page.locator(`[data-category="${category}"]`);
        await expect(section).toBeVisible();

        // Each section should show an error state or error message
        const errorState = section.locator('[data-testid="error-state"]');
        await expect(errorState).toBeVisible();

        // Error message should be meaningful to the user
        const errorMessage = section.locator('.error-message');
        await expect(errorMessage).toBeVisible();
        await expect(errorMessage).not.toBeEmpty();
      }
    });

    test('error state has user-friendly message when server returns 500', async ({ page }) => {
      await page.route('**/api/complete/**', route => {
        route.fulfill({
          status: 500,
          contentType: 'application/json',
          body: JSON.stringify({ error: 'Internal Server Error' })
        });
      });

      await page.goto('/?year=2024');
      await page.waitForTimeout(2000);

      // Check that error message is meaningful (not technical jargon)
      const errorMessages = page.locator('.error-message');
      const firstErrorText = await errorMessages.first().textContent();

      // Should not show raw technical error
      expect(firstErrorText).not.toContain('Internal Server Error');
      expect(firstErrorText).not.toContain('500');

      // Should have user-friendly messaging
      expect(firstErrorText.length).toBeGreaterThan(0);
    });
  });

  test.describe('Test Case 2: Books API fails, others succeed', () => {
    test('books section shows error while other categories display normally', async ({ page }) => {
      // Mock book API to fail
      await page.route('**/api/complete/book/**', route => {
        route.fulfill({
          status: 500,
          contentType: 'application/json',
          body: JSON.stringify({ error: 'Server Error' })
        });
      });

      // Mock other APIs to succeed
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

      await page.goto('/?year=2024');
      await page.waitForLoadState('networkidle');

      // Books section should show error state
      const booksSection = page.locator('[data-category="book"]');
      await expect(booksSection).toBeVisible({ timeout: 10000 });
      const bookErrorState = booksSection.locator('[data-testid="error-state"]');
      await expect(bookErrorState).toBeVisible();

      // Screen section should have items (API succeeded)
      const screenSection = page.locator('[data-category="screen"]');
      await expect(screenSection).toBeVisible();
      const screenGrid = screenSection.locator('[data-testid="items-grid-screen"]');
      await expect(screenGrid).toBeVisible();
      const screenItems = screenSection.locator('[data-testid="cover-item"]');
      await expect(screenItems.first()).toBeVisible();

      // Music section should have items
      const musicSection = page.locator('[data-category="music"]');
      await expect(musicSection).toBeVisible();
      const musicGrid = musicSection.locator('[data-testid="items-grid-music"]');
      await expect(musicGrid).toBeVisible();

      // Game section should have items
      const gameSection = page.locator('[data-category="game"]');
      await expect(gameSection).toBeVisible();
      const gameGrid = gameSection.locator('[data-testid="items-grid-game"]');
      await expect(gameGrid).toBeVisible();
    });

    test('partial failure allows user to still browse successful categories', async ({ page }) => {
      // Mock screen API to fail, others succeed
      await page.route('**/api/complete/book/**', route => {
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(mockBookData)
        });
      });

      await page.route('**/api/complete/screen/**', route => {
        route.fulfill({
          status: 500,
          contentType: 'application/json',
          body: JSON.stringify({ error: 'Server Error' })
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

      await page.goto('/?year=2024');
      await page.waitForLoadState('networkidle');

      // Screen section should show error
      const screenSection = page.locator('[data-category="screen"]');
      const screenErrorState = screenSection.locator('[data-testid="error-state"]');
      await expect(screenErrorState).toBeVisible();

      // Book section should show items (can hover, interact)
      const booksSection = page.locator('[data-category="book"]');
      const bookCover = booksSection.locator('[data-testid="cover-item"]').first();
      await expect(bookCover).toBeVisible();

      // User can hover over book cover
      await bookCover.hover();
      const titleOverlay = bookCover.locator('.item-title-overlay');
      const hoverOpacity = await titleOverlay.evaluate(el => {
        return window.getComputedStyle(el).opacity;
      });
      expect(hoverOpacity).toBe('1');
    });
  });

  test.describe('Test Case 3: Network timeout on API request', () => {
    test('loading state eventually shows timeout error', async ({ page }) => {
      // Mock API to simulate timeout by never responding
      await page.route('**/api/complete/**', async route => {
        // Delay for a very long time to simulate timeout
        await new Promise(resolve => setTimeout(resolve, 30000));
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ data: [] })
        });
      });

      await page.goto('/?year=2024');

      // Initially should show loading state
      const booksSection = page.locator('[data-category="book"]');
      await expect(booksSection).toBeVisible({ timeout: 5000 });

      const loadingGrid = booksSection.locator('[data-testid="loading-grid"]');
      await expect(loadingGrid).toBeVisible({ timeout: 5000 });

      // Wait for timeout to trigger (should be less than the route delay)
      // The app should have a timeout mechanism (e.g., 10 seconds)
      await page.waitForTimeout(12000);

      // After timeout, should show error state instead of infinite loading
      const errorState = booksSection.locator('[data-testid="error-state"]');
      await expect(errorState).toBeVisible({ timeout: 5000 });
    });

    test('network error shows error state without crashing', async ({ page }) => {
      // Mock API to abort (network error)
      await page.route('**/api/complete/**', route => {
        route.abort('failed');
      });

      await page.goto('/?year=2024');
      await page.waitForTimeout(2000);

      // Page should not crash - gallery structure should exist
      const galleryContainer = page.locator('.gallery-container');
      await expect(galleryContainer).toBeVisible({ timeout: 10000 });

      // Should show error states for all categories
      const categories = ['book', 'screen', 'music', 'game'];
      for (const category of categories) {
        const section = page.locator(`[data-category="${category}"]`);
        await expect(section).toBeVisible();

        const errorState = section.locator('[data-testid="error-state"]');
        await expect(errorState).toBeVisible();
      }
    });
  });

  test.describe('Test Case 4: Retry button on error state', () => {
    test('user can retry failed request using retry button', async ({ page }) => {
      let requestCount = 0;

      // First request fails, second succeeds
      await page.route('**/api/complete/book/**', route => {
        requestCount++;
        if (requestCount === 1) {
          route.fulfill({
            status: 500,
            contentType: 'application/json',
            body: JSON.stringify({ error: 'Server Error' })
          });
        } else {
          route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify(mockBookData)
          });
        }
      });

      // Other APIs succeed
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

      await page.goto('/?year=2024');
      await page.waitForLoadState('networkidle');

      // Books section should show error state
      const booksSection = page.locator('[data-category="book"]');
      const errorState = booksSection.locator('[data-testid="error-state"]');
      await expect(errorState).toBeVisible({ timeout: 10000 });

      // Find and click retry button
      const retryButton = booksSection.locator('[data-testid="retry-button"]');
      await expect(retryButton).toBeVisible();
      await retryButton.click();

      // Wait for retry to complete
      await page.waitForTimeout(1000);

      // After retry, should show items (second request succeeds)
      const itemsGrid = booksSection.locator('[data-testid="items-grid-book"]');
      await expect(itemsGrid).toBeVisible({ timeout: 10000 });

      // Verify item is displayed
      const bookCover = booksSection.locator('[data-testid="cover-item"]').first();
      await expect(bookCover).toBeVisible();
    });

    test('retry button is keyboard accessible', async ({ page }) => {
      await page.route('**/api/complete/**', route => {
        route.fulfill({
          status: 500,
          contentType: 'application/json',
          body: JSON.stringify({ error: 'Server Error' })
        });
      });

      await page.goto('/?year=2024');
      await page.waitForTimeout(2000);

      const booksSection = page.locator('[data-category="book"]');
      const retryButton = booksSection.locator('[data-testid="retry-button"]');
      await expect(retryButton).toBeVisible();

      // Tab to retry button and verify it can receive focus
      await retryButton.focus();
      await expect(retryButton).toBeFocused();

      // Should be activatable via keyboard (Enter key)
      await page.keyboard.press('Enter');

      // Button should have been activated (loading state or retry triggered)
      // We verify by checking that the page doesn't crash and button remains accessible
      await expect(booksSection).toBeVisible();
    });

    test('retry shows loading state while retrying', async ({ page }) => {
      let requestCount = 0;

      await page.route('**/api/complete/book/**', async route => {
        requestCount++;
        if (requestCount === 1) {
          route.fulfill({
            status: 500,
            contentType: 'application/json',
            body: JSON.stringify({ error: 'Server Error' })
          });
        } else {
          // Delay second request to observe loading state
          await new Promise(resolve => setTimeout(resolve, 1000));
          route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify(mockBookData)
          });
        }
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

      await page.goto('/?year=2024');
      await page.waitForLoadState('networkidle');

      // Books section should show error state
      const booksSection = page.locator('[data-category="book"]');
      const retryButton = booksSection.locator('[data-testid="retry-button"]');
      await expect(retryButton).toBeVisible({ timeout: 10000 });

      // Click retry
      await retryButton.click();

      // Should show loading state during retry
      const loadingGrid = booksSection.locator('[data-testid="loading-grid"]');
      await expect(loadingGrid).toBeVisible({ timeout: 2000 });

      // Wait for retry to complete
      await page.waitForTimeout(2000);

      // Should show items after successful retry
      const itemsGrid = booksSection.locator('[data-testid="items-grid-book"]');
      await expect(itemsGrid).toBeVisible({ timeout: 10000 });
    });
  });

  test.describe('Error state UI requirements', () => {
    test('error state is visually distinct from empty state', async ({ page }) => {
      // For one category, simulate error
      await page.route('**/api/complete/book/**', route => {
        route.fulfill({
          status: 500,
          contentType: 'application/json',
          body: JSON.stringify({ error: 'Server Error' })
        });
      });

      // For another category, return empty array (empty state)
      await page.route('**/api/complete/screen/**', route => {
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ data: [] })
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

      await page.goto('/?year=2024');
      await page.waitForLoadState('networkidle');

      // Books section should have error state (with retry button)
      const booksSection = page.locator('[data-category="book"]');
      const bookErrorState = booksSection.locator('[data-testid="error-state"]');
      await expect(bookErrorState).toBeVisible();
      const bookRetryButton = booksSection.locator('[data-testid="retry-button"]');
      await expect(bookRetryButton).toBeVisible();

      // Screen section should have empty state (no retry button)
      const screenSection = page.locator('[data-category="screen"]');
      const screenEmptyState = screenSection.locator('[data-testid="empty-state"]');
      await expect(screenEmptyState).toBeVisible();
      const screenRetryButton = screenSection.locator('[data-testid="retry-button"]');
      await expect(screenRetryButton).not.toBeVisible();
    });

    test('category title remains visible when in error state', async ({ page }) => {
      await page.route('**/api/complete/**', route => {
        route.fulfill({
          status: 500,
          contentType: 'application/json',
          body: JSON.stringify({ error: 'Server Error' })
        });
      });

      await page.goto('/?year=2024');
      await page.waitForTimeout(2000);

      // All category titles should still be visible
      const categories = [
        { key: 'book', title: 'I read' },
        { key: 'screen', title: 'I watched' },
        { key: 'music', title: 'I listened' },
        { key: 'game', title: 'I played' }
      ];

      for (const { key, title } of categories) {
        const section = page.locator(`[data-category="${key}"]`);
        const categoryTitle = section.locator('.category-title');
        await expect(categoryTitle).toBeVisible();
        await expect(categoryTitle).toHaveText(title);
      }
    });
  });
});
