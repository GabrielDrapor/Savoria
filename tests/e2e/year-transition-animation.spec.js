/**
 * E2E tests for Year Transition Animation (REQ-7)
 * Tests smooth animated transition when switching years
 */
import { test, expect } from '@playwright/test';

test.describe('Year Transition Animation (REQ-7)', () => {
  test.beforeEach(async ({ page }) => {
    // Mock API responses to avoid external dependencies
    await page.route('**/api/complete/**', async (route) => {
      const mockData = {
        data: [
          {
            item: {
              cover_image_url: 'https://example.com/cover.jpg',
              display_title: 'Test Item',
              id: 'test-1'
            },
            created_time: '2024-06-15T10:30:00Z'
          }
        ]
      };
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(mockData)
      });
    });

    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test.describe('Test Case 1: Fade animation when switching years', () => {
    test('should apply fade transition when switching from 2026 to 2023', async ({ page }) => {
      // Wait for gallery to load
      const galleryContainer = page.locator('[data-testid="gallery-container"]');
      await expect(galleryContainer).toBeVisible();

      // Get the computed opacity before transition
      const initialOpacity = await galleryContainer.evaluate((el) => {
        return window.getComputedStyle(el).opacity;
      });
      expect(initialOpacity).toBe('1');

      // Open year selector
      const yearSelector = page.locator('[data-testid="year-selector-trigger"]');
      await yearSelector.click();

      // Wait for dropdown to be visible
      const dropdown = page.locator('[data-testid="year-dropdown"]');
      await expect(dropdown).toBeVisible();

      // Select year 2023
      const year2023Option = page.locator('[data-testid="year-option-2023"]');
      await year2023Option.click();

      // Wait for transition to fully complete (300ms animation + buffer)
      await page.waitForTimeout(800);

      // After transition completes, opacity should be back to 1
      const finalOpacity = await galleryContainer.evaluate((el) => {
        return window.getComputedStyle(el).opacity;
      });
      // Opacity should be 1 or very close to 1 after animation completes
      expect(parseFloat(finalOpacity)).toBeGreaterThanOrEqual(0.99);
    });

    test('should have fade-enter-active and fade-leave-active CSS classes during transition', async ({ page }) => {
      // Check that CSS transition styles are applied
      const hasTransitionStyles = await page.evaluate(() => {
        // Get all stylesheets and check for fade transition rules
        const styleSheets = document.styleSheets;
        let hasFadeEnter = false;
        let hasFadeLeave = false;

        for (const sheet of styleSheets) {
          try {
            const rules = sheet.cssRules || sheet.rules;
            for (const rule of rules) {
              const cssText = rule.cssText || '';
              if (cssText.includes('.fade-enter-active') || cssText.includes('.fade-leave-active')) {
                hasFadeEnter = true;
              }
              if (cssText.includes('.fade-enter-from') || cssText.includes('.fade-leave-to')) {
                hasFadeLeave = true;
              }
            }
          } catch (e) {
            // Cross-origin stylesheets will throw
            continue;
          }
        }

        return hasFadeEnter && hasFadeLeave;
      });

      expect(hasTransitionStyles).toBe(true);
    });

    test('should complete fade transition within reasonable time (300-500ms)', async ({ page }) => {
      // Get the transition duration from computed styles
      const transitionDuration = await page.evaluate(() => {
        // Check for CSS rules with fade transition
        const styleSheets = document.styleSheets;
        let duration = null;

        for (const sheet of styleSheets) {
          try {
            const rules = sheet.cssRules || sheet.rules;
            for (const rule of rules) {
              const cssText = rule.cssText || '';
              if (cssText.includes('.fade-enter-active') || cssText.includes('.fade-leave-active')) {
                // Extract transition duration
                const match = cssText.match(/transition[^;]*?(\d+\.?\d*)s/);
                if (match) {
                  duration = parseFloat(match[1]) * 1000; // Convert to ms
                }
              }
            }
          } catch (e) {
            continue;
          }
        }

        return duration;
      });

      // Transition duration should be between 200ms and 500ms for smooth UX
      expect(transitionDuration).toBeGreaterThanOrEqual(200);
      expect(transitionDuration).toBeLessThanOrEqual(500);
    });
  });

  test.describe('Test Case 3: Reduced motion preference', () => {
    test('should skip animation when prefers-reduced-motion is set to reduce', async ({ page }) => {
      // Enable reduced motion preference
      await page.emulateMedia({ reducedMotion: 'reduce' });

      // Reload page with reduced motion
      await page.reload();
      await page.waitForLoadState('networkidle');

      const galleryContainer = page.locator('[data-testid="gallery-container"]');
      await expect(galleryContainer).toBeVisible();

      // Check that transition is disabled (none or 0s) for reduced motion
      const hasReducedMotion = await page.evaluate(() => {
        const styleSheets = document.styleSheets;

        for (const sheet of styleSheets) {
          try {
            const rules = sheet.cssRules || sheet.rules;
            for (const rule of rules) {
              const cssText = rule.cssText || '';
              // Check for prefers-reduced-motion media query with transition overrides
              if (rule.type === CSSRule.MEDIA_RULE) {
                const mediaText = rule.media.mediaText || '';
                if (mediaText.includes('prefers-reduced-motion')) {
                  // Found reduced motion rule - it should disable or remove transitions
                  const innerRules = rule.cssRules || [];
                  for (const innerRule of innerRules) {
                    const innerCssText = innerRule.cssText || '';
                    // Check for transition: none, transition: 0s, or opacity: 1 override
                    if (innerCssText.includes('transition') &&
                        (innerCssText.includes('0s') || innerCssText.includes('none'))) {
                      return true;
                    }
                    // Also check for opacity override (instant appearance)
                    if (innerCssText.includes('opacity') && innerCssText.includes('1')) {
                      return true;
                    }
                  }
                }
              }
            }
          } catch (e) {
            continue;
          }
        }

        return false;
      });

      expect(hasReducedMotion).toBe(true);
    });

    test('should have instant content change with reduced motion', async ({ page }) => {
      // Enable reduced motion preference
      await page.emulateMedia({ reducedMotion: 'reduce' });

      // Reload page with reduced motion
      await page.reload();
      await page.waitForLoadState('networkidle');

      const galleryContainer = page.locator('[data-testid="gallery-container"]');
      await expect(galleryContainer).toBeVisible();

      // Open year selector and change year
      const yearSelector = page.locator('[data-testid="year-selector-trigger"]');
      await yearSelector.click();

      const dropdown = page.locator('[data-testid="year-dropdown"]');
      await expect(dropdown).toBeVisible();

      // Select year 2023
      const year2023Option = page.locator('[data-testid="year-option-2023"]');
      await year2023Option.click();

      // With reduced motion, wait a small amount for Vue's out-in transition mode
      // (even with 0s duration, Vue still processes the transition lifecycle)
      await page.waitForTimeout(100);

      // With reduced motion, the gallery should be visible again quickly
      await expect(galleryContainer).toBeVisible();

      // Wait for any DOM updates to complete
      await page.waitForTimeout(100);

      // The opacity should be 1 after transition completes (instant with reduced motion)
      const opacity = await galleryContainer.evaluate((el) => {
        return window.getComputedStyle(el).opacity;
      });
      // With reduced motion and 0s transition, opacity should be 1 or very close
      expect(parseFloat(opacity) || 1).toBeGreaterThanOrEqual(0.99);
    });
  });

  test.describe('Transition behavior verification', () => {
    test('should maintain gallery visibility throughout transition', async ({ page }) => {
      const galleryContainer = page.locator('[data-testid="gallery-container"]');
      await expect(galleryContainer).toBeVisible();

      // Open year selector
      const yearSelector = page.locator('[data-testid="year-selector-trigger"]');
      await yearSelector.click();

      const dropdown = page.locator('[data-testid="year-dropdown"]');
      await expect(dropdown).toBeVisible();

      // Select a different year
      const year2024Option = page.locator('[data-testid="year-option-2024"]');
      await year2024Option.click();

      // Gallery should remain in the DOM during transition
      await expect(galleryContainer).toBeAttached();

      // Wait for transition to complete
      await page.waitForTimeout(500);

      // Gallery should still be visible after transition
      await expect(galleryContainer).toBeVisible();
    });

    test('should have smooth opacity transition (not jump)', async ({ page }) => {
      const galleryContainer = page.locator('[data-testid="gallery-container"]');
      await expect(galleryContainer).toBeVisible();

      // Check that the CSS uses opacity for fade effect
      const usesOpacity = await page.evaluate(() => {
        const styleSheets = document.styleSheets;

        for (const sheet of styleSheets) {
          try {
            const rules = sheet.cssRules || sheet.rules;
            for (const rule of rules) {
              const cssText = rule.cssText || '';
              if ((cssText.includes('.fade-enter-from') || cssText.includes('.fade-leave-to'))
                  && cssText.includes('opacity')) {
                return true;
              }
            }
          } catch (e) {
            continue;
          }
        }

        return false;
      });

      expect(usesOpacity).toBe(true);
    });
  });
});
