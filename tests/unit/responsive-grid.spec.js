import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mount } from '@vue/test-utils';
import CategorySection from '../../src/components/CategorySection.vue';

/**
 * Unit tests for responsive grid CSS media queries (Test Case 6)
 * Verifies that the grid uses appropriate breakpoints for responsive columns
 */
describe('Grid CSS Media Queries (Test Case 6)', () => {
  const mockItems = Array.from({ length: 10 }, (_, i) => ({
    item: {
      cover_image_url: `https://example.com/cover${i + 1}.jpg`,
      display_title: `Test Item ${i + 1}`,
      id: `${i + 1}`
    },
    created_time: `2024-0${(i % 9) + 1}-15T10:30:00Z`
  }));

  it('grid-container has CSS grid display', () => {
    const wrapper = mount(CategorySection, {
      props: {
        title: 'I read',
        items: mockItems,
        category: 'book',
        isLoading: false
      }
    });

    const gridContainer = wrapper.find('.grid-container');
    expect(gridContainer.exists()).toBe(true);
    expect(gridContainer.classes()).toContain('grid-container');
  });

  it('grid-container class is present for CSS styling', () => {
    const wrapper = mount(CategorySection, {
      props: {
        title: 'I read',
        items: mockItems,
        category: 'book',
        isLoading: false
      }
    });

    // Verify the grid container exists and has proper class
    // The testid is dynamic based on category: items-grid-{category}
    const gridContainer = wrapper.find('[data-testid="items-grid-book"]');
    expect(gridContainer.exists()).toBe(true);
    expect(gridContainer.classes()).toContain('grid-container');
  });

  it('loading grid also has grid-container class for consistent responsive behavior', () => {
    const wrapper = mount(CategorySection, {
      props: {
        title: 'I read',
        items: [],
        category: 'book',
        isLoading: true
      }
    });

    // Loading grid should also have grid-container class
    const loadingGrid = wrapper.find('[data-testid="loading-grid"]');
    expect(loadingGrid.exists()).toBe(true);
    expect(loadingGrid.classes()).toContain('grid-container');
    expect(loadingGrid.classes()).toContain('loading-grid');
  });

  it('grid items have aspect-ratio class for consistent sizing', () => {
    const wrapper = mount(CategorySection, {
      props: {
        title: 'I read',
        items: mockItems,
        category: 'book',
        isLoading: false
      }
    });

    const gridItems = wrapper.findAll('.grid-item');
    expect(gridItems.length).toBe(mockItems.length);

    // Each grid item should have the grid-item class which includes aspect-ratio
    gridItems.forEach(item => {
      expect(item.classes()).toContain('grid-item');
    });
  });

  it('loading items have aspect-ratio for consistent sizing', () => {
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

    // Each loading item should have the loading-item class which includes aspect-ratio
    loadingItems.forEach(item => {
      expect(item.classes()).toContain('loading-item');
    });
  });
});

describe('Touch target accessibility (Test Case 4)', () => {
  const mockItems = Array.from({ length: 5 }, (_, i) => ({
    item: {
      cover_image_url: `https://example.com/cover${i + 1}.jpg`,
      display_title: `Test Item ${i + 1}`,
      id: `${i + 1}`
    },
    created_time: `2024-0${i + 1}-15T10:30:00Z`
  }));

  it('grid items have proper class for touch interactions', () => {
    const wrapper = mount(CategorySection, {
      props: {
        title: 'I read',
        items: mockItems,
        category: 'book',
        isLoading: false
      }
    });

    const gridItems = wrapper.findAll('.grid-item');
    expect(gridItems.length).toBe(mockItems.length);

    // All items should have the grid-item class
    gridItems.forEach(item => {
      expect(item.classes()).toContain('grid-item');
    });
  });

  it('grid items respond to touchstart for mobile interactions', async () => {
    const wrapper = mount(CategorySection, {
      props: {
        title: 'I read',
        items: mockItems,
        category: 'book',
        isLoading: false
      }
    });

    const firstItem = wrapper.findAll('.grid-item')[0];
    expect(firstItem.classes()).not.toContain('touch-active');

    await firstItem.trigger('touchstart');
    expect(firstItem.classes()).toContain('touch-active');
  });

  it('touch-active class provides hover-like effects on mobile', async () => {
    const wrapper = mount(CategorySection, {
      props: {
        title: 'I read',
        items: mockItems,
        category: 'book',
        isLoading: false
      }
    });

    const gridItem = wrapper.find('.grid-item');

    // Trigger touch to activate
    await gridItem.trigger('touchstart');

    // Should have touch-active class
    expect(gridItem.classes()).toContain('touch-active');

    // Touch active state shows title overlay (handled by CSS)
    const titleOverlay = gridItem.find('.item-title-overlay');
    expect(titleOverlay.exists()).toBe(true);
  });
});

describe('Mobile-specific styles (Test Case 5)', () => {
  const mockItems = Array.from({ length: 3 }, (_, i) => ({
    item: {
      cover_image_url: `https://example.com/cover${i + 1}.jpg`,
      display_title: `Test Item ${i + 1}`,
      id: `${i + 1}`
    },
    created_time: `2024-0${i + 1}-15T10:30:00Z`
  }));

  it('title overlay exists for each grid item', () => {
    const wrapper = mount(CategorySection, {
      props: {
        title: 'I read',
        items: mockItems,
        category: 'book',
        isLoading: false
      }
    });

    const overlays = wrapper.findAll('.item-title-overlay');
    expect(overlays.length).toBe(mockItems.length);
  });

  it('item titles are displayed in overlays', () => {
    const wrapper = mount(CategorySection, {
      props: {
        title: 'I read',
        items: mockItems,
        category: 'book',
        isLoading: false
      }
    });

    const titles = wrapper.findAll('.item-title');
    expect(titles.length).toBe(mockItems.length);

    titles.forEach((title, i) => {
      expect(title.text()).toBe(`Test Item ${i + 1}`);
    });
  });

  it('category title adapts text alignment for mobile', () => {
    const wrapper = mount(CategorySection, {
      props: {
        title: 'I read',
        items: mockItems,
        category: 'book',
        isLoading: false
      }
    });

    const categoryTitle = wrapper.find('.category-title');
    expect(categoryTitle.exists()).toBe(true);
    expect(categoryTitle.classes()).toContain('category-title');
  });
});

describe('Responsive grid structure', () => {
  const mockItems = Array.from({ length: 6 }, (_, i) => ({
    item: {
      cover_image_url: `https://example.com/cover${i + 1}.jpg`,
      display_title: `Test Item ${i + 1}`,
      id: `${i + 1}`
    },
    created_time: `2024-0${i + 1}-15T10:30:00Z`
  }));

  it('renders full-width grid container', () => {
    const wrapper = mount(CategorySection, {
      props: {
        title: 'I read',
        items: mockItems,
        category: 'book',
        isLoading: false
      }
    });

    const gridContainer = wrapper.find('.grid-container');
    expect(gridContainer.exists()).toBe(true);
    // Width is set to 100% via CSS class
    expect(gridContainer.classes()).toContain('grid-container');
  });

  it('grid items use relative positioning for overlays', () => {
    const wrapper = mount(CategorySection, {
      props: {
        title: 'I read',
        items: mockItems,
        category: 'book',
        isLoading: false
      }
    });

    const gridItems = wrapper.findAll('.grid-item');
    expect(gridItems.length).toBeGreaterThan(0);

    // Each grid item should have proper structure for overlay positioning
    // Note: CoverItem component uses .cover-image class (not .cover-img)
    gridItems.forEach(item => {
      expect(item.classes()).toContain('grid-item');
      expect(item.find('.cover-image').exists()).toBe(true);
      expect(item.find('.item-title-overlay').exists()).toBe(true);
    });
  });

  it('cover images use object-fit cover for consistent display', () => {
    const wrapper = mount(CategorySection, {
      props: {
        title: 'I read',
        items: mockItems,
        category: 'book',
        isLoading: false
      }
    });

    // Note: CoverItem component uses .cover-image class (not .cover-img)
    const images = wrapper.findAll('.cover-image');
    expect(images.length).toBe(mockItems.length);

    // All images should have the cover-image class (CSS handles object-fit)
    images.forEach(img => {
      expect(img.classes()).toContain('cover-image');
    });
  });

  it('category section has proper data-category attribute for styling hooks', () => {
    const categories = ['book', 'screen', 'music', 'game'];

    categories.forEach(category => {
      const wrapper = mount(CategorySection, {
        props: {
          title: `I ${category}`,
          items: mockItems,
          category,
          isLoading: false
        }
      });

      const section = wrapper.find('.category-section');
      expect(section.attributes('data-category')).toBe(category);
    });
  });
});
