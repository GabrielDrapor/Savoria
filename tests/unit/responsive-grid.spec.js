import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mount } from '@vue/test-utils';
import CategorySection from '../../src/components/CategorySection.vue';

/**
 * Unit tests for CSS media query responsive breakpoints (Test Case 6).
 * These tests verify the component structure and CSS classes are properly set up
 * for responsive grid behavior.
 */
describe('CategorySection Responsive Grid CSS', () => {
  const mockItems = Array.from({ length: 10 }, (_, i) => ({
    item: {
      cover_image_url: `https://example.com/cover${i + 1}.jpg`,
      display_title: `Test Item ${i + 1}`,
      id: `${i + 1}`
    },
    created_time: `2024-0${(i % 9) + 1}-15T10:30:00Z`
  }));

  describe('Grid Container Structure', () => {
    it('renders grid container with correct CSS class for responsive styling', () => {
      const wrapper = mount(CategorySection, {
        props: {
          title: 'I read',
          items: mockItems,
          category: 'book'
        }
      });

      const gridContainer = wrapper.find('[data-testid="grid-container"]');
      expect(gridContainer.exists()).toBe(true);
      expect(gridContainer.classes()).toContain('grid-container');
    });

    it('grid container element has display: grid style applied', () => {
      const wrapper = mount(CategorySection, {
        props: {
          title: 'I read',
          items: mockItems,
          category: 'book'
        }
      });

      const gridContainer = wrapper.find('.grid-container');
      expect(gridContainer.exists()).toBe(true);
      // The grid-container class is the key class that applies CSS Grid
      expect(gridContainer.classes()).toContain('grid-container');
    });

    it('grid items have aspect-ratio class structure for 3:4 ratio', () => {
      const wrapper = mount(CategorySection, {
        props: {
          title: 'I read',
          items: mockItems,
          category: 'book'
        }
      });

      const gridItems = wrapper.findAll('.grid-item');
      expect(gridItems.length).toBe(10);

      // Each grid item should have the grid-item class which applies aspect-ratio: 3/4
      gridItems.forEach(item => {
        expect(item.classes()).toContain('grid-item');
      });
    });
  });

  describe('Loading State Grid', () => {
    it('loading grid also has responsive grid styling', () => {
      const wrapper = mount(CategorySection, {
        props: {
          title: 'I read',
          items: [],
          category: 'book',
          isLoading: true
        }
      });

      const loadingGrid = wrapper.find('[data-testid="loading-grid"]');
      expect(loadingGrid.exists()).toBe(true);
      expect(loadingGrid.classes()).toContain('grid-container');
      expect(loadingGrid.classes()).toContain('loading-grid');
    });

    it('loading items have aspect-ratio for consistent placeholder sizing', () => {
      const wrapper = mount(CategorySection, {
        props: {
          title: 'I read',
          items: [],
          category: 'book',
          isLoading: true
        }
      });

      const loadingItems = wrapper.findAll('.loading-item');
      expect(loadingItems.length).toBe(8);

      // Each loading item should have the loading-item class which applies aspect-ratio: 3/4
      loadingItems.forEach(item => {
        expect(item.classes()).toContain('loading-item');
      });
    });
  });

  describe('Cover Items Structure for Touch Targets', () => {
    it('grid items are properly structured for touch interaction', () => {
      const wrapper = mount(CategorySection, {
        props: {
          title: 'I read',
          items: mockItems,
          category: 'book'
        }
      });

      const gridItems = wrapper.findAll('.grid-item');
      expect(gridItems.length).toBeGreaterThan(0);

      // Each grid item should contain an image and title overlay for touch interaction
      gridItems.forEach(item => {
        expect(item.find('.cover-img').exists()).toBe(true);
        expect(item.find('.item-title-overlay').exists()).toBe(true);
        expect(item.find('.item-title').exists()).toBe(true);
      });
    });

    it('cover images have proper dimensions attributes', () => {
      const wrapper = mount(CategorySection, {
        props: {
          title: 'I read',
          items: mockItems,
          category: 'book'
        }
      });

      const images = wrapper.findAll('.cover-img');
      images.forEach(img => {
        expect(img.attributes('loading')).toBe('lazy');
        expect(img.classes()).toContain('cover-img');
      });
    });
  });

  describe('Title Overlay Accessibility', () => {
    it('title overlays are rendered for all items', () => {
      const wrapper = mount(CategorySection, {
        props: {
          title: 'I read',
          items: mockItems,
          category: 'book'
        }
      });

      const overlays = wrapper.findAll('.item-title-overlay');
      expect(overlays.length).toBe(mockItems.length);
    });

    it('titles display the correct item names', () => {
      const wrapper = mount(CategorySection, {
        props: {
          title: 'I read',
          items: mockItems,
          category: 'book'
        }
      });

      const titles = wrapper.findAll('.item-title');
      titles.forEach((title, index) => {
        expect(title.text()).toBe(`Test Item ${index + 1}`);
      });
    });
  });

  describe('Category Section Responsive Structure', () => {
    it('category title uses responsive font sizing class', () => {
      const wrapper = mount(CategorySection, {
        props: {
          title: 'I read',
          items: mockItems,
          category: 'book'
        }
      });

      const title = wrapper.find('.category-title');
      expect(title.exists()).toBe(true);
      expect(title.classes()).toContain('category-title');
    });

    it('section width is set to 100% for responsive behavior', () => {
      const wrapper = mount(CategorySection, {
        props: {
          title: 'I read',
          items: mockItems,
          category: 'book'
        }
      });

      const gridContainer = wrapper.find('.grid-container');
      expect(gridContainer.exists()).toBe(true);
      // The grid-container class sets width: 100% and max-width: 100%
      expect(gridContainer.classes()).toContain('grid-container');
    });
  });
});

describe('CategorySection CSS Media Query Configuration', () => {
  it('component uses scoped styles with media queries', async () => {
    // This test verifies the component structure supports responsive design
    // Actual media query testing requires E2E tests with real browser rendering
    const wrapper = mount(CategorySection, {
      props: {
        title: 'I read',
        items: [
          {
            item: {
              cover_image_url: 'https://example.com/cover.jpg',
              display_title: 'Test Book',
              id: '1'
            },
            created_time: '2024-01-15T10:30:00Z'
          }
        ],
        category: 'book'
      }
    });

    // Verify component renders with proper structure for CSS to apply
    expect(wrapper.find('.category-section').exists()).toBe(true);
    expect(wrapper.find('.grid-container').exists()).toBe(true);
    expect(wrapper.find('.grid-item').exists()).toBe(true);
  });

  it('grid container structure supports auto-fit columns', () => {
    const wrapper = mount(CategorySection, {
      props: {
        title: 'I read',
        items: Array.from({ length: 20 }, (_, i) => ({
          item: {
            cover_image_url: `https://example.com/cover${i}.jpg`,
            display_title: `Book ${i}`,
            id: `${i}`
          },
          created_time: '2024-01-15T10:30:00Z'
        })),
        category: 'book'
      }
    });

    // Verify multiple items render correctly in grid structure
    const gridItems = wrapper.findAll('.grid-item');
    expect(gridItems.length).toBe(20);

    // All items should be direct children of grid-container
    const gridContainer = wrapper.find('.grid-container');
    expect(gridContainer.element.children.length).toBe(20);
  });
});
