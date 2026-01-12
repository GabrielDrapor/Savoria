import { test, expect } from '@playwright/test';

/**
 * API Integration Tests
 * Scenario: Test integration with NEODB API via Flask backend endpoints
 *
 * Test cases:
 * 1. Fetch books for year 2024 - Calls /api/complete/book/2024 endpoint
 * 2. Fetch screen content for year 2024 - Calls /api/complete/screen/2024 endpoint
 * 3. Fetch music for year 2024 - Calls /api/complete/music/2024 endpoint
 * 4. Fetch games for year 2024 - Calls /api/complete/game/2024 endpoint
 * 5. API returns item with cover_image_url - Cover image is rendered with correct URL
 * 6. API returns item with display_title - Title is shown on hover/alt text
 * 7. API request fails - Error state displayed gracefully
 */

// Mock data for API responses
const mockBookData = {
  data: [
    {
      item: {
        cover_image_url: 'https://neodb.social/m/item/book1.jpg.200x200_q85_autocrop_crop-scale.jpg',
        display_title: 'Test Book 2024',
        id: 'book-1'
      },
      created_time: '2024-06-15T10:30:00Z'
    },
    {
      item: {
        cover_image_url: 'https://neodb.social/m/item/book2.jpg.200x200_q85_autocrop_crop-scale.jpg',
        display_title: 'Another Book 2024',
        id: 'book-2'
      },
      created_time: '2024-03-20T14:00:00Z'
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

const emptyData = { data: [] };

test.describe('API Integration - NEODB Backend Endpoints', () => {

  test.describe('Test Case 1: Fetch books for year 2024', () => {
    test('calls /api/complete/book/2024 endpoint when loading gallery for 2024', async ({ page }) => {
      // Track API calls
      const apiCalls = [];

      await page.route('**/api/complete/**', route => {
        apiCalls.push(route.request().url());

        const url = route.request().url();
        if (url.includes('/book/')) {
          route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify(mockBookData)
          });
        } else if (url.includes('/screen/')) {
          route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify(mockScreenData)
          });
        } else if (url.includes('/music/')) {
          route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify(mockMusicData)
          });
        } else if (url.includes('/game/')) {
          route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify(mockGameData)
          });
        } else {
          route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify(emptyData)
          });
        }
      });

      // Navigate to gallery for year 2024
      await page.goto('/?year=2024');
      await page.waitForLoadState('networkidle');

      // Verify the book API endpoint was called with year 2024
      const bookApiCall = apiCalls.find(url => url.includes('/api/complete/book/2024'));
      expect(bookApiCall).toBeTruthy();
      expect(bookApiCall).toContain('/api/complete/book/2024');
    });
  });

  test.describe('Test Case 2: Fetch screen content for year 2024', () => {
    test('calls /api/complete/screen/2024 endpoint when loading gallery for 2024', async ({ page }) => {
      // Track API calls
      const apiCalls = [];

      await page.route('**/api/complete/**', route => {
        apiCalls.push(route.request().url());

        const url = route.request().url();
        if (url.includes('/book/')) {
          route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify(mockBookData)
          });
        } else if (url.includes('/screen/')) {
          route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify(mockScreenData)
          });
        } else if (url.includes('/music/')) {
          route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify(mockMusicData)
          });
        } else if (url.includes('/game/')) {
          route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify(mockGameData)
          });
        } else {
          route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify(emptyData)
          });
        }
      });

      // Navigate to gallery for year 2024
      await page.goto('/?year=2024');
      await page.waitForLoadState('networkidle');

      // Verify the screen API endpoint was called with year 2024
      const screenApiCall = apiCalls.find(url => url.includes('/api/complete/screen/2024'));
      expect(screenApiCall).toBeTruthy();
      expect(screenApiCall).toContain('/api/complete/screen/2024');
    });
  });

  test.describe('Test Case 3: Fetch music for year 2024', () => {
    test('calls /api/complete/music/2024 endpoint when loading gallery for 2024', async ({ page }) => {
      // Track API calls
      const apiCalls = [];

      await page.route('**/api/complete/**', route => {
        apiCalls.push(route.request().url());

        const url = route.request().url();
        if (url.includes('/book/')) {
          route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify(mockBookData)
          });
        } else if (url.includes('/screen/')) {
          route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify(mockScreenData)
          });
        } else if (url.includes('/music/')) {
          route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify(mockMusicData)
          });
        } else if (url.includes('/game/')) {
          route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify(mockGameData)
          });
        } else {
          route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify(emptyData)
          });
        }
      });

      // Navigate to gallery for year 2024
      await page.goto('/?year=2024');
      await page.waitForLoadState('networkidle');

      // Verify the music API endpoint was called with year 2024
      const musicApiCall = apiCalls.find(url => url.includes('/api/complete/music/2024'));
      expect(musicApiCall).toBeTruthy();
      expect(musicApiCall).toContain('/api/complete/music/2024');
    });
  });

  test.describe('Test Case 4: Fetch games for year 2024', () => {
    test('calls /api/complete/game/2024 endpoint when loading gallery for 2024', async ({ page }) => {
      // Track API calls
      const apiCalls = [];

      await page.route('**/api/complete/**', route => {
        apiCalls.push(route.request().url());

        const url = route.request().url();
        if (url.includes('/book/')) {
          route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify(mockBookData)
          });
        } else if (url.includes('/screen/')) {
          route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify(mockScreenData)
          });
        } else if (url.includes('/music/')) {
          route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify(mockMusicData)
          });
        } else if (url.includes('/game/')) {
          route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify(mockGameData)
          });
        } else {
          route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify(emptyData)
          });
        }
      });

      // Navigate to gallery for year 2024
      await page.goto('/?year=2024');
      await page.waitForLoadState('networkidle');

      // Verify the game API endpoint was called with year 2024
      const gameApiCall = apiCalls.find(url => url.includes('/api/complete/game/2024'));
      expect(gameApiCall).toBeTruthy();
      expect(gameApiCall).toContain('/api/complete/game/2024');
    });
  });

  test.describe('Test Case 5: API returns item with cover_image_url', () => {
    test('cover image is rendered with correct URL from API response', async ({ page }) => {
      const specificCoverUrl = 'https://neodb.social/m/item/specific-cover.jpg.200x200_q85_autocrop_crop-scale.jpg';
      const mockDataWithSpecificCover = {
        data: [
          {
            item: {
              cover_image_url: specificCoverUrl,
              display_title: 'Cover Test Book',
              id: 'cover-test-1'
            },
            created_time: '2024-06-15T10:30:00Z'
          }
        ]
      };

      await page.route('**/api/complete/book/**', route => {
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(mockDataWithSpecificCover)
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

      await page.goto('/?year=2024');
      await page.waitForLoadState('networkidle');

      // Wait for books section to be visible
      const booksSection = page.locator('[data-category="book"]');
      await expect(booksSection).toBeVisible({ timeout: 10000 });

      // Check that cover image is rendered with the correct URL
      const coverImage = booksSection.locator('.cover-image').first();
      await expect(coverImage).toBeVisible();

      const srcAttribute = await coverImage.getAttribute('src');
      expect(srcAttribute).toBe(specificCoverUrl);
    });
  });

  test.describe('Test Case 6: API returns item with display_title', () => {
    test('title is shown on hover/alt text from API response', async ({ page }) => {
      const specificTitle = 'Unique Display Title For Testing';
      const mockDataWithSpecificTitle = {
        data: [
          {
            item: {
              cover_image_url: 'https://neodb.social/m/item/title-test.jpg.200x200_q85_autocrop_crop-scale.jpg',
              display_title: specificTitle,
              id: 'title-test-1'
            },
            created_time: '2024-06-15T10:30:00Z'
          }
        ]
      };

      await page.route('**/api/complete/book/**', route => {
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(mockDataWithSpecificTitle)
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

      await page.goto('/?year=2024');
      await page.waitForLoadState('networkidle');

      // Wait for books section to be visible
      const booksSection = page.locator('[data-category="book"]');
      await expect(booksSection).toBeVisible({ timeout: 10000 });

      // Check that title is shown in the title overlay
      const titleOverlay = booksSection.locator('.item-title').first();
      await expect(titleOverlay).toHaveText(specificTitle);

      // Check that alt text is set correctly on the image
      const coverImage = booksSection.locator('.cover-image').first();
      const altText = await coverImage.getAttribute('alt');
      expect(altText).toBe(specificTitle);
    });

    test('title overlay becomes visible on hover', async ({ page }) => {
      const specificTitle = 'Hover Test Title';
      const mockDataWithTitle = {
        data: [
          {
            item: {
              cover_image_url: 'https://neodb.social/m/item/hover-test.jpg.200x200_q85_autocrop_crop-scale.jpg',
              display_title: specificTitle,
              id: 'hover-test-1'
            },
            created_time: '2024-06-15T10:30:00Z'
          }
        ]
      };

      await page.route('**/api/complete/book/**', route => {
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(mockDataWithTitle)
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

      await page.goto('/?year=2024');
      await page.waitForLoadState('networkidle');

      // Wait for books section to be visible
      const booksSection = page.locator('[data-category="book"]');
      await expect(booksSection).toBeVisible({ timeout: 10000 });

      // Get the cover item and title overlay
      const coverItem = booksSection.locator('[data-testid="cover-item"]').first();
      const titleOverlay = coverItem.locator('.item-title-overlay');

      // Before hover, title overlay should have opacity 0 (hidden)
      const initialOpacity = await titleOverlay.evaluate(el => {
        return window.getComputedStyle(el).opacity;
      });
      expect(initialOpacity).toBe('0');

      // Hover over the cover item
      await coverItem.hover();

      // After hover, title overlay should be visible (opacity 1)
      const hoverOpacity = await titleOverlay.evaluate(el => {
        return window.getComputedStyle(el).opacity;
      });
      expect(hoverOpacity).toBe('1');
    });
  });

  test.describe('Test Case 7: API request fails', () => {
    test('error state displayed gracefully, not blank page, when API returns 500', async ({ page }) => {
      // Mock API to return server error
      await page.route('**/api/complete/**', route => {
        route.fulfill({
          status: 500,
          contentType: 'application/json',
          body: JSON.stringify({ error: 'Internal Server Error' })
        });
      });

      // Navigate to gallery
      await page.goto('/?year=2024');
      await page.waitForLoadState('networkidle');

      // Page should not be blank - should show empty states for all categories
      // This is the graceful degradation behavior
      const galleryContainer = page.locator('.gallery-container');
      await expect(galleryContainer).toBeVisible({ timeout: 10000 });

      // All category sections should still be visible (with empty states)
      const categories = ['book', 'screen', 'music', 'game'];
      for (const category of categories) {
        const section = page.locator(`[data-category="${category}"]`);
        await expect(section).toBeVisible();

        // Category title should still show
        const title = section.locator('.category-title');
        await expect(title).toBeVisible();
      }
    });

    test('error state displayed gracefully when API returns network error', async ({ page }) => {
      // Mock API to abort (network error)
      await page.route('**/api/complete/**', route => {
        route.abort('failed');
      });

      // Navigate to gallery
      await page.goto('/?year=2024');

      // Wait for a reasonable time for the page to attempt to load
      await page.waitForTimeout(2000);

      // Page should not be blank - gallery structure should still exist
      const galleryContainer = page.locator('.gallery-container');
      await expect(galleryContainer).toBeVisible({ timeout: 10000 });

      // The page title should still be visible
      const pageTitle = page.locator('.pageTitle');
      await expect(pageTitle).toBeVisible();
    });

    test('shows empty state for categories when specific category API fails', async ({ page }) => {
      // Mock book API to fail, others to succeed
      await page.route('**/api/complete/book/**', route => {
        route.fulfill({
          status: 500,
          contentType: 'application/json',
          body: JSON.stringify({ error: 'Server Error' })
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

      await page.goto('/?year=2024');
      await page.waitForLoadState('networkidle');

      // Books section should show empty state (graceful degradation)
      const booksSection = page.locator('[data-category="book"]');
      await expect(booksSection).toBeVisible({ timeout: 10000 });

      // Should show empty state or loading state, not crash
      const booksTitle = booksSection.locator('.category-title');
      await expect(booksTitle).toBeVisible();

      // Screen section should have items (API succeeded)
      const screenSection = page.locator('[data-category="screen"]');
      await expect(screenSection).toBeVisible();
      const screenGrid = screenSection.locator('[data-testid="items-grid-screen"]');
      await expect(screenGrid).toBeVisible();
    });
  });

  test.describe('All API endpoints called correctly on year change', () => {
    test('changing year triggers new API calls with updated year parameter', async ({ page }) => {
      const apiCalls = [];

      await page.route('**/api/complete/**', route => {
        apiCalls.push(route.request().url());
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(emptyData)
        });
      });

      // Start with 2024
      await page.goto('/?year=2024');
      await page.waitForLoadState('networkidle');

      // Verify 2024 calls were made
      expect(apiCalls.some(url => url.includes('/2024'))).toBe(true);

      // Clear tracked calls
      apiCalls.length = 0;

      // Change year using the year selector
      const yearSelector = page.locator('[data-testid="year-selector"]');
      await yearSelector.click();

      // Select 2023
      const year2023Option = page.locator('[data-testid="year-option-2023"]');
      await year2023Option.click();

      await page.waitForLoadState('networkidle');

      // Verify 2023 calls were made
      expect(apiCalls.some(url => url.includes('/2023'))).toBe(true);
      expect(apiCalls.some(url => url.includes('/api/complete/book/2023'))).toBe(true);
      expect(apiCalls.some(url => url.includes('/api/complete/screen/2023'))).toBe(true);
      expect(apiCalls.some(url => url.includes('/api/complete/music/2023'))).toBe(true);
      expect(apiCalls.some(url => url.includes('/api/complete/game/2023'))).toBe(true);
    });
  });
});
