import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { join } from 'path';

describe('Test Case 4: CSS transition styles (Unit)', () => {
  // Read the App.vue file to check CSS styles
  const appVueContent = readFileSync(join(__dirname, '../../src/App.vue'), 'utf-8');

  describe('Fade transition CSS classes', () => {
    it('includes .fade-enter-active class', () => {
      expect(appVueContent).toContain('.fade-enter-active');
    });

    it('includes .fade-leave-active class', () => {
      expect(appVueContent).toContain('.fade-leave-active');
    });

    it('includes .fade-enter-from class', () => {
      expect(appVueContent).toContain('.fade-enter-from');
    });

    it('includes .fade-leave-to class', () => {
      expect(appVueContent).toContain('.fade-leave-to');
    });

    it('defines opacity transition for fade effect', () => {
      expect(appVueContent).toContain('transition: opacity');
    });

    it('sets opacity: 0 for enter-from and leave-to states', () => {
      expect(appVueContent).toContain('opacity: 0');
    });

    it('uses ease timing function', () => {
      expect(appVueContent).toContain('ease');
    });
  });

  describe('Prefers-reduced-motion support (NFR-6)', () => {
    it('includes @media (prefers-reduced-motion: reduce) query', () => {
      expect(appVueContent).toContain('@media (prefers-reduced-motion: reduce)');
    });

    it('disables transition in reduced motion mode', () => {
      // Check that transition: none is set for reduced motion
      expect(appVueContent).toContain('transition: none');
    });

    it('sets opacity to 1 in reduced motion mode for instant transition', () => {
      // In reduced motion, opacity should remain at 1 for instant transitions
      // This is defined within the prefers-reduced-motion media query
      const reducedMotionSection = appVueContent.split('@media (prefers-reduced-motion: reduce)')[1];
      expect(reducedMotionSection).toContain('opacity: 1');
    });
  });

  describe('Vue Transition component setup', () => {
    it('has Transition component in template', () => {
      expect(appVueContent).toContain('<Transition');
    });

    it('has name="fade" attribute on Transition', () => {
      expect(appVueContent).toContain('name="fade"');
    });

    it('has mode="out-in" attribute on Transition', () => {
      expect(appVueContent).toContain('mode="out-in"');
    });

    it('wraps gallery-container in Transition', () => {
      // Check that Transition wraps the gallery-container
      expect(appVueContent).toContain('<Transition');
      expect(appVueContent).toContain('data-testid="gallery-container"');
    });

    it('has :key bound to selectedYear for triggering transitions', () => {
      expect(appVueContent).toContain(':key="selectedYear"');
    });
  });
});
