import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import CategorySection from '../../src/components/CategorySection.vue';

describe('Image Lazy Loading (NFR-7)', () => {
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

  // Generate many items to test lazy loading behavior
  const generateManyItems = (count) => {
    return Array.from({ length: count }, (_, i) => ({
      item: {
        cover_image_url: `https://example.com/cover${i + 1}.jpg`,
        display_title: `Test Item ${i + 1}`,
        id: `${i + 1}`
      },
      created_time: `2024-01-${String(i + 1).padStart(2, '0')}T10:30:00Z`
    }));
  };

  describe('Test Case 1: Image has loading="lazy" attribute', () => {
    it('renders cover images with loading="lazy" attribute', () => {
      const wrapper = mount(CategorySection, {
        props: {
          title: 'I read',
          items: mockItems,
          category: 'book'
        }
      });

      const images = wrapper.findAll('.cover-img');
      expect(images.length).toBe(2);

      // All images should have loading="lazy"
      images.forEach(img => {
        expect(img.attributes('loading')).toBe('lazy');
      });
    });

    it('all cover images have lazy loading attribute regardless of count', () => {
      const manyItems = generateManyItems(30);
      const wrapper = mount(CategorySection, {
        props: {
          title: 'I read',
          items: manyItems,
          category: 'book'
        }
      });

      const images = wrapper.findAll('.cover-img');
      expect(images.length).toBe(30);

      // Every single image should have loading="lazy"
      images.forEach((img, index) => {
        expect(img.attributes('loading')).toBe('lazy');
      });
    });

    it('lazy loading attribute is present on images for all category types', () => {
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

        const images = wrapper.findAll('.cover-img');
        images.forEach(img => {
          expect(img.attributes('loading')).toBe('lazy');
        });
      });
    });
  });

  describe('Test Case 4: Shimmer placeholder while image loads', () => {
    it('shows shimmer placeholder in loading state', () => {
      const wrapper = mount(CategorySection, {
        props: {
          title: 'I read',
          items: [],
          category: 'book',
          isLoading: true
        }
      });

      // Loading grid should be visible
      const loadingGrid = wrapper.find('[data-testid="loading-grid"]');
      expect(loadingGrid.exists()).toBe(true);

      // Loading items with shimmer should exist
      const loadingItems = wrapper.findAll('.loading-item');
      expect(loadingItems.length).toBe(8);

      // Each loading item should have shimmer placeholder
      const shimmerElements = wrapper.findAll('.loading-shimmer');
      expect(shimmerElements.length).toBe(8);
    });

    it('shimmer has correct animation class structure', () => {
      const wrapper = mount(CategorySection, {
        props: {
          title: 'I read',
          items: [],
          category: 'book',
          isLoading: true
        }
      });

      const shimmer = wrapper.find('.loading-shimmer');
      expect(shimmer.exists()).toBe(true);
      expect(shimmer.classes()).toContain('loading-shimmer');
    });

    it('loading state displays 8 shimmer placeholders', () => {
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
    });

    it('shimmer placeholder has proper container structure', () => {
      const wrapper = mount(CategorySection, {
        props: {
          title: 'I read',
          items: [],
          category: 'book',
          isLoading: true
        }
      });

      const loadingItem = wrapper.find('.loading-item');
      expect(loadingItem.exists()).toBe(true);

      // Loading item should have the shimmer inside
      const shimmer = loadingItem.find('.loading-shimmer');
      expect(shimmer.exists()).toBe(true);
    });

    it('loading grid has same styling class as content grid', () => {
      const wrapper = mount(CategorySection, {
        props: {
          title: 'I read',
          items: [],
          category: 'book',
          isLoading: true
        }
      });

      const loadingGrid = wrapper.find('[data-testid="loading-grid"]');
      expect(loadingGrid.classes()).toContain('grid-container');
      expect(loadingGrid.classes()).toContain('loading-grid');
    });
  });

  describe('Cover image element attributes', () => {
    it('cover images have correct src attribute', () => {
      const wrapper = mount(CategorySection, {
        props: {
          title: 'I read',
          items: mockItems,
          category: 'book'
        }
      });

      const images = wrapper.findAll('.cover-img');
      expect(images[0].attributes('src')).toBe('https://example.com/cover1.jpg');
      expect(images[1].attributes('src')).toBe('https://example.com/cover2.jpg');
    });

    it('cover images have correct alt attribute for accessibility', () => {
      const wrapper = mount(CategorySection, {
        props: {
          title: 'I read',
          items: mockItems,
          category: 'book'
        }
      });

      const images = wrapper.findAll('.cover-img');
      expect(images[0].attributes('alt')).toBe('Test Book 1');
      expect(images[1].attributes('alt')).toBe('Test Book 2');
    });

    it('cover images have required class for styling', () => {
      const wrapper = mount(CategorySection, {
        props: {
          title: 'I read',
          items: mockItems,
          category: 'book'
        }
      });

      const images = wrapper.findAll('.cover-img');
      images.forEach(img => {
        expect(img.classes()).toContain('cover-img');
      });
    });
  });

  describe('Loading state transitions', () => {
    it('transitions from loading to content state', async () => {
      const wrapper = mount(CategorySection, {
        props: {
          title: 'I read',
          items: [],
          category: 'book',
          isLoading: true
        }
      });

      // Initially should show loading
      expect(wrapper.find('[data-testid="loading-grid"]').exists()).toBe(true);
      expect(wrapper.find('[data-testid="grid-container"]').exists()).toBe(false);

      // Update props to simulate data loaded
      await wrapper.setProps({ items: mockItems, isLoading: false });

      // Should now show content
      expect(wrapper.find('[data-testid="loading-grid"]').exists()).toBe(false);
      expect(wrapper.find('[data-testid="grid-container"]').exists()).toBe(true);
    });

    it('shows empty state when loading finishes with no data', async () => {
      const wrapper = mount(CategorySection, {
        props: {
          title: 'I read',
          items: [],
          category: 'book',
          isLoading: true
        }
      });

      // Initially should show loading
      expect(wrapper.find('[data-testid="loading-grid"]').exists()).toBe(true);

      // Update props to simulate loading finished with no data
      await wrapper.setProps({ isLoading: false });

      // Should show empty state
      expect(wrapper.find('[data-testid="loading-grid"]').exists()).toBe(false);
      expect(wrapper.find('[data-testid="empty-state"]').exists()).toBe(true);
    });
  });

  describe('Large dataset handling with lazy loading', () => {
    it('renders 30 images with lazy loading for large datasets', () => {
      const manyItems = generateManyItems(30);
      const wrapper = mount(CategorySection, {
        props: {
          title: 'I read',
          items: manyItems,
          category: 'book'
        }
      });

      const images = wrapper.findAll('.cover-img');
      expect(images.length).toBe(30);

      // All images should have lazy loading enabled
      images.forEach(img => {
        expect(img.attributes('loading')).toBe('lazy');
      });
    });

    it('handles 50+ items efficiently with lazy loading attribute', () => {
      const manyItems = generateManyItems(50);
      const wrapper = mount(CategorySection, {
        props: {
          title: 'I read',
          items: manyItems,
          category: 'book'
        }
      });

      const images = wrapper.findAll('.cover-img');
      expect(images.length).toBe(50);

      // Verify lazy loading on all images
      const lazyLoadedImages = images.filter(img => img.attributes('loading') === 'lazy');
      expect(lazyLoadedImages.length).toBe(50);
    });
  });
});
