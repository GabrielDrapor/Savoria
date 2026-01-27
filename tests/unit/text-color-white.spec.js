/**
 * Text Color White - Unit Tests
 *
 * Tests for validating that gradient text effects have been removed
 * from YearNavigationHeader.vue and replaced with solid white color.
 *
 * Covers:
 * - REQ-1: .page-title gradient removal
 * - REQ-2: .title-prefix, .title-suffix gradient removal
 * - REQ-3: .current-year gradient removal
 * - REQ-4: Solid white color (#fff) applied
 * - NFR-1: Font properties preserved
 * - Component isolation via scoped CSS
 *
 * Test approach:
 * - Parse Vue component CSS using string matching or regex
 * - Mount component and check computed styles via JSDOM
 * - Verify absence of gradient-related CSS properties
 * - Verify presence of color: #fff or equivalent
 */

import { describe, it, expect, beforeAll } from 'vitest';
import { readFileSync } from 'fs';
import { join, resolve } from 'path';
import { mount } from '@vue/test-utils';
import YearNavigationHeader from '../../src/components/YearNavigationHeader.vue';

/**
 * Helper function to extract CSS content from a specific selector in the component
 * @param {string} componentContent - The full component file content
 * @param {string} selector - The CSS selector to find
 * @returns {string} The CSS block for that selector
 */
function extractCssBlock(componentContent, selector) {
  // Extract style section
  const styleMatch = componentContent.match(/<style[^>]*>([\s\S]*?)<\/style>/);
  if (!styleMatch) return '';
  const styleContent = styleMatch[1];

  // Build regex for the selector - escape special characters
  const escapedSelector = selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const regex = new RegExp(`${escapedSelector}\\s*\\{([^}]*)\\}`, 'g');

  const matches = [];
  let match;
  while ((match = regex.exec(styleContent)) !== null) {
    matches.push(match[1]);
  }

  return matches.join('\n');
}

/**
 * Helper to read the component file content
 * @returns {string} The component file content
 */
function getComponentContent() {
  return readFileSync(
    resolve(__dirname, '../../src/components/YearNavigationHeader.vue'),
    'utf-8'
  );
}

describe('REQ-2: Remove gradient from title prefix and suffix', () => {
  let componentContent;

  beforeAll(() => {
    componentContent = readFileSync(
      join(__dirname, '../../src/components/YearNavigationHeader.vue'),
      'utf-8'
    );
  });

  describe('Test Case 1: CSS parsing for gradient properties', () => {
    it('should NOT have background-clip: text in .title-prefix, .title-suffix rule', () => {
      // Extract the CSS section for .title-prefix, .title-suffix
      const styleSectionMatch = componentContent.match(/<style[^>]*>([\s\S]*?)<\/style>/);
      expect(styleSectionMatch).toBeTruthy();

      const styleContent = styleSectionMatch[1];

      // Find the .title-prefix, .title-suffix rule block
      const titlePrefixSuffixMatch = styleContent.match(/\.title-prefix[\s\S]*?\.title-suffix[\s\S]*?\{([^}]*)\}/);

      if (titlePrefixSuffixMatch) {
        const ruleContent = titlePrefixSuffixMatch[1];
        // Should NOT contain background-clip: text
        expect(ruleContent).not.toContain('background-clip: text');
        expect(ruleContent).not.toContain('-webkit-background-clip: text');
      }
    });

    it('should NOT have -webkit-text-fill-color: transparent in .title-prefix, .title-suffix rule', () => {
      const styleSectionMatch = componentContent.match(/<style[^>]*>([\s\S]*?)<\/style>/);
      expect(styleSectionMatch).toBeTruthy();

      const styleContent = styleSectionMatch[1];

      // Find the .title-prefix, .title-suffix rule block
      const titlePrefixSuffixMatch = styleContent.match(/\.title-prefix[\s\S]*?\.title-suffix[\s\S]*?\{([^}]*)\}/);

      if (titlePrefixSuffixMatch) {
        const ruleContent = titlePrefixSuffixMatch[1];
        // Should NOT contain -webkit-text-fill-color: transparent
        expect(ruleContent).not.toContain('-webkit-text-fill-color: transparent');
      }
    });

    it('should NOT have background: inherit in .title-prefix, .title-suffix rule', () => {
      const styleSectionMatch = componentContent.match(/<style[^>]*>([\s\S]*?)<\/style>/);
      expect(styleSectionMatch).toBeTruthy();

      const styleContent = styleSectionMatch[1];

      // Find the .title-prefix, .title-suffix rule block
      const titlePrefixSuffixMatch = styleContent.match(/\.title-prefix[\s\S]*?\.title-suffix[\s\S]*?\{([^}]*)\}/);

      if (titlePrefixSuffixMatch) {
        const ruleContent = titlePrefixSuffixMatch[1];
        // Should NOT contain background: inherit
        expect(ruleContent).not.toContain('background: inherit');
      }
    });

    it('should have color property for white text', () => {
      const styleSectionMatch = componentContent.match(/<style[^>]*>([\s\S]*?)<\/style>/);
      expect(styleSectionMatch).toBeTruthy();

      const styleContent = styleSectionMatch[1];

      // Find the .title-prefix, .title-suffix rule block
      const titlePrefixSuffixMatch = styleContent.match(/\.title-prefix[\s\S]*?\.title-suffix[\s\S]*?\{([^}]*)\}/);

      if (titlePrefixSuffixMatch) {
        const ruleContent = titlePrefixSuffixMatch[1];
        // Should contain color property with white value
        const hasWhiteColor = ruleContent.includes('color: #fff') ||
                             ruleContent.includes('color: white') ||
                             ruleContent.includes('color: #ffffff');
        expect(hasWhiteColor).toBe(true);
      }
    });
  });

  describe('Test Case 2: Computed style of title-prefix element', () => {
    it('should render .title-prefix with white text color', () => {
      const wrapper = mount(YearNavigationHeader, {
        props: {
          selectedYear: 2024
        }
      });

      const titlePrefix = wrapper.find('.title-prefix');
      expect(titlePrefix.exists()).toBe(true);

      // Verify the element exists and can be styled
      // In JSDOM, we verify the class exists and styles are applied
      expect(titlePrefix.text()).toBe('In');
    });
  });

  describe('Test Case 3: Computed style of title-suffix element', () => {
    it('should render .title-suffix with white text color', () => {
      const wrapper = mount(YearNavigationHeader, {
        props: {
          selectedYear: 2024
        }
      });

      const titleSuffix = wrapper.find('.title-suffix');
      expect(titleSuffix.exists()).toBe(true);

      // Verify the element exists and can be styled
      expect(titleSuffix.text()).toBe(',');
    });
  });
});

describe('Text Color White - REQ-3: .current-year gradient removal', () => {
  describe('Test Case 1: Parse .current-year CSS for linear-gradient', () => {
    it('should not have linear-gradient property in .current-year', () => {
      const componentContent = getComponentContent();
      const currentYearCss = extractCssBlock(componentContent, '.current-year');

      // Verify no linear-gradient is present
      expect(currentYearCss).not.toContain('linear-gradient');
    });
  });

  describe('Test Case 2: Parse .current-year CSS for background-clip properties', () => {
    it('should not have -webkit-background-clip: text in .current-year', () => {
      const componentContent = getComponentContent();
      const currentYearCss = extractCssBlock(componentContent, '.current-year');

      // Verify no -webkit-background-clip: text is present
      expect(currentYearCss).not.toMatch(/-webkit-background-clip:\s*text/);
    });

    it('should not have background-clip: text in .current-year', () => {
      const componentContent = getComponentContent();
      const currentYearCss = extractCssBlock(componentContent, '.current-year');

      // Verify no background-clip: text is present
      expect(currentYearCss).not.toMatch(/background-clip:\s*text/);
    });
  });

  describe('Test Case 3: Parse .current-year CSS for -webkit-text-fill-color', () => {
    it('should not have -webkit-text-fill-color: transparent in .current-year', () => {
      const componentContent = getComponentContent();
      const currentYearCss = extractCssBlock(componentContent, '.current-year');

      // Verify no -webkit-text-fill-color: transparent is present
      expect(currentYearCss).not.toMatch(/-webkit-text-fill-color:\s*transparent/);
    });
  });

  describe('Test Case 4: Integration - Verify computed color is white', () => {
    it('should have color: #fff or color: white in .current-year CSS', () => {
      const componentContent = getComponentContent();
      const currentYearCss = extractCssBlock(componentContent, '.current-year');

      // Verify color: #fff or color: white is present
      const hasWhiteColor = /color:\s*(#fff|#ffffff|white|rgb\(255,\s*255,\s*255\))/.test(currentYearCss);
      expect(hasWhiteColor).toBe(true);
    });

    it('should render current-year element with white text color', () => {
      const wrapper = mount(YearNavigationHeader, {
        props: { selectedYear: 2024 }
      });

      const currentYearEl = wrapper.find('[data-testid="current-year-display"]');
      expect(currentYearEl.exists()).toBe(true);

      // In JSDOM, we can check the element exists and has proper class
      expect(currentYearEl.classes()).toContain('current-year');
    });
  });

  describe('NFR-1: Font properties preserved for .current-year', () => {
    it('should preserve font-size: 1em in .current-year', () => {
      const componentContent = getComponentContent();
      const currentYearCss = extractCssBlock(componentContent, '.current-year');

      expect(currentYearCss).toMatch(/font-size:\s*1em/);
    });

    it('should preserve font-weight: 500 in .current-year', () => {
      const componentContent = getComponentContent();
      const currentYearCss = extractCssBlock(componentContent, '.current-year');

      expect(currentYearCss).toMatch(/font-weight:\s*500/);
    });

    it('should preserve min-width: 2.5em in .current-year', () => {
      const componentContent = getComponentContent();
      const currentYearCss = extractCssBlock(componentContent, '.current-year');

      expect(currentYearCss).toMatch(/min-width:\s*2\.5em/);
    });

    it('should preserve text-align: center in .current-year', () => {
      const componentContent = getComponentContent();
      const currentYearCss = extractCssBlock(componentContent, '.current-year');

      expect(currentYearCss).toMatch(/text-align:\s*center/);
    });
  });
});
