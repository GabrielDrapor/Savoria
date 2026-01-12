import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { join } from 'path';

describe('Visual Design Consistency (Scenario 17)', () => {
  // Read the CSS and component files
  const mainCssContent = readFileSync(join(__dirname, '../../src/assets/main.css'), 'utf-8');
  const categorySectionContent = readFileSync(join(__dirname, '../../src/components/CategorySection.vue'), 'utf-8');
  const yearSelectorContent = readFileSync(join(__dirname, '../../src/components/YearSelector.vue'), 'utf-8');
  const coverItemContent = readFileSync(join(__dirname, '../../src/components/CoverItem.vue'), 'utf-8');

  describe('Test Case 1: Page background CSS - Background gradient includes colors #0f1033, #0d0d1f, #090912', () => {
    it('body has a linear-gradient background', () => {
      expect(mainCssContent).toContain('linear-gradient');
    });

    it('background gradient includes #0f1033 color', () => {
      expect(mainCssContent).toContain('#0f1033');
    });

    it('background gradient includes #0d0d1f color', () => {
      expect(mainCssContent).toContain('#0d0d1f');
    });

    it('background gradient includes #090912 color', () => {
      expect(mainCssContent).toContain('#090912');
    });

    it('gradient is at 135deg angle as specified', () => {
      expect(mainCssContent).toContain('135deg');
    });

    it('gradient has proper color stops (0%, 50%, 100%)', () => {
      // Check the full gradient definition
      const gradientPattern = /linear-gradient\(\s*135deg,\s*#0f1033\s+0%,\s*#0d0d1f\s+50%,\s*#090912\s+100%\s*\)/;
      expect(mainCssContent).toMatch(gradientPattern);
    });
  });

  describe('Test Case 2: Text font family - Font family includes Space Grotesk', () => {
    it('main.css imports Space Grotesk from Google Fonts', () => {
      expect(mainCssContent).toContain("family=Space+Grotesk");
    });

    it('main.css imports Space Grotesk with weight 300', () => {
      expect(mainCssContent).toContain('wght@300');
    });

    it('main.css imports Space Grotesk with weight 400', () => {
      expect(mainCssContent).toContain('400');
    });

    it('main.css imports Space Grotesk with weight 500', () => {
      expect(mainCssContent).toContain('500');
    });

    it('body uses Space Grotesk as primary font', () => {
      expect(mainCssContent).toContain("font-family: 'Space Grotesk'");
    });

    it('CategorySection uses Space Grotesk font family', () => {
      expect(categorySectionContent).toContain("font-family: 'Space Grotesk'");
    });

    it('YearSelector uses Space Grotesk font family', () => {
      expect(yearSelectorContent).toContain("font-family: 'Space Grotesk'");
    });

    it('font family has appropriate fallbacks', () => {
      // Check that the font-family includes fallbacks
      expect(mainCssContent).toContain("'Helvetica Neue'");
      expect(mainCssContent).toContain("'SimHei'");
      expect(mainCssContent).toContain("'STHeiti'");
    });
  });

  describe('Test Case 3: Year selector styling - Semi-transparent overlays', () => {
    it('year-selector-trigger has semi-transparent background', () => {
      expect(yearSelectorContent).toContain('rgba(255, 255, 255, 0.1)');
    });

    it('year-selector-trigger has semi-transparent border', () => {
      expect(yearSelectorContent).toContain('rgba(255, 255, 255, 0.2)');
    });

    it('year-dropdown has semi-transparent background', () => {
      expect(yearSelectorContent).toContain('rgba(15, 16, 51, 0.95)');
    });

    it('year-option hover has semi-transparent background', () => {
      expect(yearSelectorContent).toContain('rgba(255, 255, 255, 0.1)');
    });

    it('year-option selected has semi-transparent background', () => {
      expect(yearSelectorContent).toContain('rgba(255, 255, 255, 0.15)');
    });

    it('year-selector has border-radius for rounded corners', () => {
      expect(yearSelectorContent).toContain('border-radius: 8px');
    });

    it('year-selector has transition for smooth effects', () => {
      expect(yearSelectorContent).toContain('transition:');
    });

    it('year-selector has proper color matching design language (#f3f3f3)', () => {
      expect(yearSelectorContent).toContain('color: #f3f3f3');
    });
  });

  describe('Test Case 4: Grid gap and spacing - Consistent spacing between cover items', () => {
    it('grid-container uses CSS Grid display', () => {
      expect(categorySectionContent).toContain('display: grid');
    });

    it('desktop grid has 20px gap', () => {
      expect(categorySectionContent).toContain('gap: 20px');
    });

    it('tablet grid has 16px gap (responsive)', () => {
      expect(categorySectionContent).toContain('gap: 16px');
    });

    it('mobile grid has 12px gap (responsive)', () => {
      expect(categorySectionContent).toContain('gap: 12px');
    });

    it('grid uses auto-fit for responsive columns', () => {
      expect(categorySectionContent).toContain('auto-fit');
    });

    it('desktop grid has minmax(140px, 1fr) columns', () => {
      expect(categorySectionContent).toContain('minmax(140px, 1fr)');
    });

    it('tablet grid has minmax(150px, 1fr) columns', () => {
      expect(categorySectionContent).toContain('minmax(150px, 1fr)');
    });

    it('mobile grid has minmax(100px, 1fr) columns', () => {
      expect(categorySectionContent).toContain('minmax(100px, 1fr)');
    });

    it('grid-container has full width', () => {
      expect(categorySectionContent).toContain('width: 100%');
    });

    it('loading-grid uses same grid layout for consistency', () => {
      // Verify loading state also has proper grid styling
      const loadingGridMatch = categorySectionContent.match(/\.loading-grid\s*\{[^}]+\}/s);
      expect(loadingGridMatch).toBeTruthy();
      expect(loadingGridMatch[0]).toContain('display: grid');
    });
  });

  describe('Additional Design Consistency Checks', () => {
    it('text color is light (#f3f3f3) for dark background', () => {
      expect(mainCssContent).toContain('color: #f3f3f3');
    });

    it('category-title has consistent styling with opacity', () => {
      expect(categorySectionContent).toContain('opacity: 0.8');
    });

    it('category-title uses font-weight 300 (light)', () => {
      expect(categorySectionContent).toContain('font-weight: 300');
    });

    it('empty-state uses semi-transparent text', () => {
      expect(categorySectionContent).toContain('rgba(255, 255, 255, 0.5)');
    });

    it('loading-item has semi-transparent background', () => {
      expect(categorySectionContent).toContain('rgba(255, 255, 255, 0.05)');
    });

    it('body has proper min-height for full viewport', () => {
      expect(mainCssContent).toContain('min-height: 100vh');
    });

    it('body has webkit font smoothing for better rendering', () => {
      expect(mainCssContent).toContain('-webkit-font-smoothing: antialiased');
    });
  });
});
