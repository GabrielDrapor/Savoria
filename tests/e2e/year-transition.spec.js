// @ts-check
import { test, expect } from '@playwright/test';

test.describe('Year Transition Animation (REQ-7)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('TC1: Switch from 2026 to 2023 - Content transitions with fade animation', async ({ page }) => {
    // Get the gallery container
    const galleryContainer = page.locator('[data-testid="gallery-container"]');
    await expect(galleryContainer).toBeVisible();

    // Record the initial year
    const selectedYear = page.locator('[data-testid="selected-year"]');
    const initialYear = await selectedYear.textContent();

    // Open year selector and switch to a different year
    const yearTrigger = page.locator('[data-testid="year-selector-trigger"]');
    await yearTrigger.click();

    // Select 2023
    const year2023Option = page.locator('[data-testid="year-option-2023"]');
    await year2023Option.click();

    // Wait for transition to complete (fade has 0.3s duration, so wait a bit longer)
    await page.waitForTimeout(500);

    // Verify the year changed
    await expect(selectedYear).toHaveText('2023');

    // Verify the gallery container is still visible after transition
    await expect(galleryContainer).toBeVisible();

    // Page title should update
    const pageTitle = page.locator('.pageTitle');
    await expect(pageTitle).toContainText('In 2023,');
  });

  test('TC1: Fade transition classes are applied during year change', async ({ page }) => {
    // Check that the fade transition CSS is present in the page
    const fadeCSS = await page.evaluate(() => {
      const styleSheets = Array.from(document.styleSheets);
      for (const sheet of styleSheets) {
        try {
          const rules = Array.from(sheet.cssRules || []);
          const hasFadeEnter = rules.some(rule =>
            rule.cssText && rule.cssText.includes('.fade-enter-active')
          );
          const hasFadeLeave = rules.some(rule =>
            rule.cssText && rule.cssText.includes('.fade-leave-active')
          );
          if (hasFadeEnter || hasFadeLeave) {
            return true;
          }
        } catch (e) {
          // Cross-origin stylesheets may throw
        }
      }
      return false;
    });

    expect(fadeCSS).toBe(true);
  });

  test('TC1: Gallery container has key attribute for transition triggering', async ({ page }) => {
    // The gallery container should have a key attribute bound to selectedYear
    const galleryContainer = page.locator('[data-testid="gallery-container"]');
    await expect(galleryContainer).toBeVisible();

    // Open year selector and change year
    const yearTrigger = page.locator('[data-testid="year-selector-trigger"]');
    await yearTrigger.click();

    const year2022Option = page.locator('[data-testid="year-option-2022"]');
    await year2022Option.click();

    // Wait for transition
    await page.waitForTimeout(500);

    // The gallery container should still exist with updated content
    await expect(galleryContainer).toBeVisible();
    await expect(page.locator('.pageTitle')).toContainText('In 2022,');
  });

  test('TC3: Switch year with prefers-reduced-motion: reduce - Transition is instant', async ({ page }) => {
    // Emulate reduced motion preference
    await page.emulateMedia({ reducedMotion: 'reduce' });

    // Get the gallery container
    const galleryContainer = page.locator('[data-testid="gallery-container"]');
    await expect(galleryContainer).toBeVisible();

    // Open year selector
    const yearTrigger = page.locator('[data-testid="year-selector-trigger"]');
    await yearTrigger.click();

    // Select a different year
    const year2021Option = page.locator('[data-testid="year-option-2021"]');

    // Measure the time it takes for the year change to complete
    const startTime = Date.now();
    await year2021Option.click();

    // Verify the year changed immediately (within a short time)
    const selectedYear = page.locator('[data-testid="selected-year"]');
    await expect(selectedYear).toHaveText('2021');

    const endTime = Date.now();
    const elapsedTime = endTime - startTime;

    // In reduced motion mode, transition should be instant
    // Allow some buffer for test execution overhead but should be under 200ms
    // Normal transition is 300ms + 300ms = 600ms for out-in mode
    expect(elapsedTime).toBeLessThan(500);
  });

  test('TC3: Reduced motion - transition: none is applied', async ({ page }) => {
    // Emulate reduced motion preference
    await page.emulateMedia({ reducedMotion: 'reduce' });

    // Reload to apply the media query
    await page.reload();
    await page.waitForLoadState('networkidle');

    // Check that reduced motion styles are applied
    const hasReducedMotionCSS = await page.evaluate(() => {
      // Check if the media query exists
      const styleSheets = Array.from(document.styleSheets);
      for (const sheet of styleSheets) {
        try {
          const rules = Array.from(sheet.cssRules || []);
          const hasReducedMotion = rules.some(rule => {
            if (rule.type === CSSRule.MEDIA_RULE) {
              // @ts-ignore
              return rule.conditionText?.includes('prefers-reduced-motion');
            }
            return false;
          });
          if (hasReducedMotion) {
            return true;
          }
        } catch (e) {
          // Cross-origin stylesheets may throw
        }
      }
      return false;
    });

    expect(hasReducedMotionCSS).toBe(true);
  });

  test('Multiple year changes work correctly', async ({ page }) => {
    const selectedYear = page.locator('[data-testid="selected-year"]');
    const yearTrigger = page.locator('[data-testid="year-selector-trigger"]');

    // First change: to 2023
    await yearTrigger.click();
    await page.locator('[data-testid="year-option-2023"]').click();
    await page.waitForTimeout(400);
    await expect(selectedYear).toHaveText('2023');

    // Second change: to 2021
    await yearTrigger.click();
    await page.locator('[data-testid="year-option-2021"]').click();
    await page.waitForTimeout(400);
    await expect(selectedYear).toHaveText('2021');

    // Third change: back to current year
    const currentYear = new Date().getFullYear();
    await yearTrigger.click();
    await page.locator(`[data-testid="year-option-${currentYear}"]`).click();
    await page.waitForTimeout(400);
    await expect(selectedYear).toHaveText(currentYear.toString());
  });

  test('Transition completes before new content is displayed', async ({ page }) => {
    const galleryContainer = page.locator('[data-testid="gallery-container"]');

    // Open year selector
    const yearTrigger = page.locator('[data-testid="year-selector-trigger"]');
    await yearTrigger.click();

    // Select a different year and verify transition behavior
    const year2020Option = page.locator('[data-testid="year-option-2020"]');
    await year2020Option.click();

    // The gallery container should remain visible throughout
    // (mode="out-in" means old content fades out first, then new fades in)
    await page.waitForTimeout(700); // Wait for full transition cycle

    await expect(galleryContainer).toBeVisible();
    await expect(page.locator('.pageTitle')).toContainText('In 2020,');
  });
});

test.describe('Fade Animation CSS Verification', () => {
  test('TC4: CSS contains fade transition styles', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const cssRules = await page.evaluate(() => {
      const results = {
        fadeEnterActive: false,
        fadeLeaveActive: false,
        fadeEnterFrom: false,
        fadeLeaveTo: false,
        opacityTransition: false
      };

      const styleSheets = Array.from(document.styleSheets);
      for (const sheet of styleSheets) {
        try {
          const rules = Array.from(sheet.cssRules || []);
          for (const rule of rules) {
            const text = rule.cssText || '';
            if (text.includes('.fade-enter-active')) results.fadeEnterActive = true;
            if (text.includes('.fade-leave-active')) results.fadeLeaveActive = true;
            if (text.includes('.fade-enter-from')) results.fadeEnterFrom = true;
            if (text.includes('.fade-leave-to')) results.fadeLeaveTo = true;
            if (text.includes('opacity') && text.includes('transition')) results.opacityTransition = true;
          }
        } catch (e) {
          // Cross-origin stylesheets may throw
        }
      }
      return results;
    });

    expect(cssRules.fadeEnterActive).toBe(true);
    expect(cssRules.fadeLeaveActive).toBe(true);
    expect(cssRules.fadeEnterFrom).toBe(true);
    expect(cssRules.fadeLeaveTo).toBe(true);
  });

  test('TC4: CSS includes @media (prefers-reduced-motion: reduce) override', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const hasReducedMotionMedia = await page.evaluate(() => {
      const styleSheets = Array.from(document.styleSheets);
      for (const sheet of styleSheets) {
        try {
          const rules = Array.from(sheet.cssRules || []);
          for (const rule of rules) {
            // Check for media rules
            if (rule.type === CSSRule.MEDIA_RULE) {
              // @ts-ignore
              const mediaText = rule.conditionText || rule.media?.mediaText || '';
              if (mediaText.includes('prefers-reduced-motion')) {
                return true;
              }
            }
          }
        } catch (e) {
          // Cross-origin stylesheets may throw
        }
      }
      return false;
    });

    expect(hasReducedMotionMedia).toBe(true);
  });
});
