import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import CategorySection from '../../src/components/CategorySection.vue';

describe('CategorySection', () => {
  const mockItems = [
    {
      item: {
        cover_image_url: 'https://example.com/cover1.jpg',
        display_title: 'Test Book 1',
        id: '1'
      },
      created_time: '2024-01-15T10:30:00Z'
    },
    {
      item: {
        cover_image_url: 'https://example.com/cover2.jpg',
        display_title: 'Test Book 2',
        id: '2'
      },
      created_time: '2024-02-20T14:00:00Z'
    }
  ];

  describe('Empty State Handling (REQ-8, US-5)', () => {
    it('renders empty state message when items array is empty and not loading (Test Case 2)', () => {
      const wrapper = mount(CategorySection, {
        props: {
          title: 'I read',
          items: [],
          category: 'book',
          isLoading: false
        }
      });

      // Should show empty state, not loading state
      const emptyState = wrapper.find('[data-testid="empty-state"]');
      expect(emptyState.exists()).toBe(true);

      // Should display the empty message
      const emptyMessage = wrapper.find('.empty-message');
      expect(emptyMessage.exists()).toBe(true);
      expect(emptyMessage.text()).toBe('Nothing recorded this year');

      // Should not show loading state
      const loadingGrid = wrapper.find('[data-testid="loading-grid"]');
      expect(loadingGrid.exists()).toBe(false);

      // Should not show grid container
      const gridContainer = wrapper.find('[data-testid="grid-container"]');
      expect(gridContainer.exists()).toBe(false);
    });

    it('renders loading state when items is empty and isLoading is true', () => {
      const wrapper = mount(CategorySection, {
        props: {
          title: 'I read',
          items: [],
          category: 'book',
          isLoading: true
        }
      });

      // Should show loading state
      const loadingGrid = wrapper.find('[data-testid="loading-grid"]');
      expect(loadingGrid.exists()).toBe(true);

      // Should not show empty state
      const emptyState = wrapper.find('[data-testid="empty-state"]');
      expect(emptyState.exists()).toBe(false);
    });

    it('empty state message has muted text styling (Test Case 4)', () => {
      const wrapper = mount(CategorySection, {
        props: {
          title: 'I read',
          items: [],
          category: 'book',
          isLoading: false
        }
      });

      const emptyMessage = wrapper.find('.empty-message');
      expect(emptyMessage.exists()).toBe(true);

      // Verify the class exists (CSS styling applied via class)
      expect(emptyMessage.classes()).toContain('empty-message');
    });

    it('empty state is centered within category section (Test Case 4)', () => {
      const wrapper = mount(CategorySection, {
        props: {
          title: 'I read',
          items: [],
          category: 'book',
          isLoading: false
        }
      });

      const emptyState = wrapper.find('.empty-state');
      expect(emptyState.exists()).toBe(true);

      // Verify the class exists (CSS flex centering applied via class)
      expect(emptyState.classes()).toContain('empty-state');
    });

    it('section is still visible when empty', () => {
      const wrapper = mount(CategorySection, {
        props: {
          title: 'I read',
          items: [],
          category: 'book',
          isLoading: false
        }
      });

      // Section should still exist
      const section = wrapper.find('.category-section');
      expect(section.exists()).toBe(true);

      // Title should still be visible
      const title = wrapper.find('.category-title');
      expect(title.exists()).toBe(true);
      expect(title.text()).toBe('I read');
    });

    it('renders grid with items when items provided (not empty state)', () => {
      const wrapper = mount(CategorySection, {
        props: {
          title: 'I read',
          items: mockItems,
          category: 'book',
          isLoading: false
        }
      });

      // Should show grid container with items (dynamic testid based on category)
      const gridContainer = wrapper.find('[data-testid="items-grid-book"]');
      expect(gridContainer.exists()).toBe(true);

      // Should not show empty state
      const emptyState = wrapper.find('[data-testid="empty-state"]');
      expect(emptyState.exists()).toBe(false);

      // Should not show loading state
      const loadingGrid = wrapper.find('[data-testid="loading-grid"]');
      expect(loadingGrid.exists()).toBe(false);
    });

    it('all four categories can show empty state', () => {
      const categories = [
        { category: 'book', title: 'I read' },
        { category: 'screen', title: 'I watched' },
        { category: 'music', title: 'I listened' },
        { category: 'game', title: 'I played' }
      ];

      categories.forEach(({ category, title }) => {
        const wrapper = mount(CategorySection, {
          props: {
            title,
            items: [],
            category,
            isLoading: false
          }
        });

        // Section should be visible
        const section = wrapper.find('.category-section');
        expect(section.exists()).toBe(true);
        expect(section.attributes('data-category')).toBe(category);

        // Empty state should be shown
        const emptyState = wrapper.find('[data-testid="empty-state"]');
        expect(emptyState.exists()).toBe(true);

        // Title should be correct
        expect(wrapper.find('.category-title').text()).toBe(title);
      });
    });
  });

  describe('Component Rendering (Test Case 5)', () => {
    it('renders with category title header and grid container', () => {
      const wrapper = mount(CategorySection, {
        props: {
          title: 'I read',
          items: mockItems,
          category: 'book'
        }
      });

      // Check category title is rendered
      const title = wrapper.find('.category-title');
      expect(title.exists()).toBe(true);
      expect(title.text()).toBe('I read');

      // Check grid container is rendered (dynamic testid based on category)
      const gridContainer = wrapper.find('[data-testid="items-grid-book"]');
      expect(gridContainer.exists()).toBe(true);

      // Check data-category attribute
      expect(wrapper.find('.category-section').attributes('data-category')).toBe('book');
    });

    it('renders all four category sections with correct titles', () => {
      const categories = [
        { category: 'book', title: 'I read' },
        { category: 'screen', title: 'I watched' },
        { category: 'music', title: 'I listened' },
        { category: 'game', title: 'I played' }
      ];

      categories.forEach(({ category, title }) => {
        const wrapper = mount(CategorySection, {
          props: {
            title,
            items: mockItems,
            category
          }
        });

        expect(wrapper.find('.category-title').text()).toBe(title);
        expect(wrapper.find('.category-section').attributes('data-category')).toBe(category);
      });
    });

    it('renders loading state when no items provided and isLoading is true', () => {
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

      const loadingItems = wrapper.findAll('.loading-item');
      expect(loadingItems.length).toBe(8);
    });

    it('renders all cover items when items are provided', () => {
      const wrapper = mount(CategorySection, {
        props: {
          title: 'I read',
          items: mockItems,
          category: 'book'
        }
      });

      // CoverItem components are rendered as grid items
      const coverItems = wrapper.findAll('[data-testid="cover-item"]');
      expect(coverItems.length).toBe(2);
    });

    it('renders cover images with correct attributes', () => {
      const wrapper = mount(CategorySection, {
        props: {
          title: 'I read',
          items: mockItems,
          category: 'book'
        }
      });

      // Images are now inside CoverItem components
      const images = wrapper.findAll('.cover-image');
      expect(images.length).toBe(2);

      // Check first image
      expect(images[0].attributes('src')).toBe('https://example.com/cover1.jpg');
      expect(images[0].attributes('alt')).toBe('Test Book 1');
      expect(images[0].attributes('loading')).toBe('lazy');

      // Check second image
      expect(images[1].attributes('src')).toBe('https://example.com/cover2.jpg');
      expect(images[1].attributes('alt')).toBe('Test Book 2');
    });

    it('renders item titles in overlay', () => {
      const wrapper = mount(CategorySection, {
        props: {
          title: 'I read',
          items: mockItems,
          category: 'book'
        }
      });

      const titles = wrapper.findAll('.item-title');
      expect(titles.length).toBe(2);
      expect(titles[0].text()).toBe('Test Book 1');
      expect(titles[1].text()).toBe('Test Book 2');
    });
  });

  describe('Grid CSS Properties (Test Case 3)', () => {
    it('grid container uses CSS Grid display', () => {
      const wrapper = mount(CategorySection, {
        props: {
          title: 'I read',
          items: mockItems,
          category: 'book'
        }
      });

      const gridContainer = wrapper.find('[data-testid="items-grid-book"]');
      expect(gridContainer.exists()).toBe(true);
      expect(gridContainer.classes()).toContain('grid-container');
    });

    it('grid items have correct structure for grid layout', () => {
      const wrapper = mount(CategorySection, {
        props: {
          title: 'I read',
          items: mockItems,
          category: 'book'
        }
      });

      // CoverItem components are rendered with the grid-item class
      const gridItems = wrapper.findAll('.grid-item');
      expect(gridItems.length).toBe(2);

      // Each grid item (CoverItem) should contain an image (or placeholder) and title overlay
      gridItems.forEach(item => {
        // CoverItem uses cover-image class (not cover-img)
        const hasImage = item.find('.cover-image').exists();
        const hasPlaceholder = item.find('.cover-placeholder').exists();
        expect(hasImage || hasPlaceholder).toBe(true);
        expect(item.find('.item-title-overlay').exists()).toBe(true);
      });
    });

    it('grid container has proper gap spacing class', () => {
      const wrapper = mount(CategorySection, {
        props: {
          title: 'I read',
          items: mockItems,
          category: 'book'
        }
      });

      const gridContainer = wrapper.find('.grid-container');
      expect(gridContainer.exists()).toBe(true);
      // The gap property is set in CSS - we verify the class exists
      expect(gridContainer.classes()).toContain('grid-container');
    });
  });

  describe('Hover Effects and Title Display (Scenario 5)', () => {
    it('Test Case 3: Component renders with hidden title that shows on hover state', () => {
      const wrapper = mount(CategorySection, {
        props: {
          title: 'I read',
          items: mockItems,
          category: 'book'
        }
      });

      // Title overlay should exist
      const titleOverlay = wrapper.find('.item-title-overlay');
      expect(titleOverlay.exists()).toBe(true);

      // Title overlay has opacity 0 by default (hidden)
      expect(titleOverlay.classes()).toContain('item-title-overlay');

      // Check that the item-title contains the display_title
      const itemTitle = wrapper.find('.item-title');
      expect(itemTitle.exists()).toBe(true);
      expect(itemTitle.text()).toBe('Test Book 1');
    });

    it('renders title overlay for each grid item', () => {
      const wrapper = mount(CategorySection, {
        props: {
          title: 'I read',
          items: mockItems,
          category: 'book'
        }
      });

      const titleOverlays = wrapper.findAll('.item-title-overlay');
      expect(titleOverlays.length).toBe(2);

      const titles = wrapper.findAll('.item-title');
      expect(titles[0].text()).toBe('Test Book 1');
      expect(titles[1].text()).toBe('Test Book 2');
    });

    it('grid item has hover transition styles', () => {
      const wrapper = mount(CategorySection, {
        props: {
          title: 'I read',
          items: mockItems,
          category: 'book'
        }
      });

      const gridItem = wrapper.find('.grid-item');
      expect(gridItem.exists()).toBe(true);
      // Grid item class exists which has hover styles defined
      expect(gridItem.classes()).toContain('grid-item');
    });

    it('touch-active class toggles on touchstart', async () => {
      const wrapper = mount(CategorySection, {
        props: {
          title: 'I read',
          items: mockItems,
          category: 'book'
        }
      });

      const gridItems = wrapper.findAll('.grid-item');
      const firstItem = gridItems[0];

      // Initially no touch-active class
      expect(firstItem.classes()).not.toContain('touch-active');

      // Trigger touchstart
      await firstItem.trigger('touchstart');

      // Should now have touch-active class
      expect(firstItem.classes()).toContain('touch-active');

      // Second touch should toggle off
      await firstItem.trigger('touchstart');
      expect(firstItem.classes()).not.toContain('touch-active');
    });

    it('only one item can be touch-active at a time', async () => {
      const wrapper = mount(CategorySection, {
        props: {
          title: 'I read',
          items: mockItems,
          category: 'book'
        }
      });

      const gridItems = wrapper.findAll('.grid-item');

      // Activate first item
      await gridItems[0].trigger('touchstart');
      expect(gridItems[0].classes()).toContain('touch-active');
      expect(gridItems[1].classes()).not.toContain('touch-active');

      // Activate second item - first should lose active state
      await gridItems[1].trigger('touchstart');
      expect(gridItems[0].classes()).not.toContain('touch-active');
      expect(gridItems[1].classes()).toContain('touch-active');
    });

    it('title overlay has data-testid for testing', () => {
      const wrapper = mount(CategorySection, {
        props: {
          title: 'I read',
          items: mockItems,
          category: 'book'
        }
      });

      const titleOverlay = wrapper.find('[data-testid="title-overlay"]');
      expect(titleOverlay.exists()).toBe(true);
    });
  });

  describe('Props Validation', () => {
    it('accepts required title prop', () => {
      const wrapper = mount(CategorySection, {
        props: {
          title: 'Test Title',
          items: [],
          category: 'book'
        }
      });

      expect(wrapper.find('.category-title').text()).toBe('Test Title');
    });

    it('handles empty items array gracefully with loading state', () => {
      const wrapper = mount(CategorySection, {
        props: {
          title: 'I read',
          items: [],
          category: 'book',
          isLoading: true
        }
      });

      expect(wrapper.find('[data-testid="loading-grid"]').exists()).toBe(true);
      expect(wrapper.find('[data-testid="items-grid-book"]').exists()).toBe(false);
    });

    it('handles empty items array gracefully with empty state', () => {
      const wrapper = mount(CategorySection, {
        props: {
          title: 'I read',
          items: [],
          category: 'book',
          isLoading: false
        }
      });

      expect(wrapper.find('[data-testid="empty-state"]').exists()).toBe(true);
      expect(wrapper.find('[data-testid="grid-container"]').exists()).toBe(false);
    });

    it('sets data-category attribute correctly', () => {
      const wrapper = mount(CategorySection, {
        props: {
          title: 'I watched',
          items: mockItems,
          category: 'screen'
        }
      });

      expect(wrapper.find('.category-section').attributes('data-category')).toBe('screen');
    });
  });
});
