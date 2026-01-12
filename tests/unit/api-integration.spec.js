import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';
import CoverItem from '@/components/CoverItem.vue';
import CategorySection from '@/components/CategorySection.vue';

/**
 * API Integration Unit Tests
 * Scenario: Test integration with NEODB API via Flask backend endpoints
 *
 * These unit tests focus on:
 * - Test Case 5: API returns item with cover_image_url - Cover image is rendered with correct URL
 * - Test Case 6: API returns item with display_title - Title is shown on hover/alt text
 */

describe('API Integration - Cover Image and Title Rendering', () => {
  describe('Test Case 5: Cover image rendered with correct URL from API', () => {
    it('should render cover image with the exact URL from API response', () => {
      const apiCoverUrl = 'https://neodb.social/m/item/book123.jpg.200x200_q85_autocrop_crop-scale.jpg';

      const wrapper = mount(CoverItem, {
        props: {
          coverImageUrl: apiCoverUrl,
          displayTitle: 'Test Book'
        }
      });

      const image = wrapper.find('[data-testid="cover-image"]');
      expect(image.exists()).toBe(true);
      expect(image.attributes('src')).toBe(apiCoverUrl);
    });

    it('should render cover image with PNG thumbnail URL from API', () => {
      const apiCoverUrl = 'https://neodb.social/m/item/album456.png.200x200_q85_autocrop_crop-scale.png';

      const wrapper = mount(CoverItem, {
        props: {
          coverImageUrl: apiCoverUrl,
          displayTitle: 'Test Album'
        }
      });

      const image = wrapper.find('[data-testid="cover-image"]');
      expect(image.exists()).toBe(true);
      expect(image.attributes('src')).toBe(apiCoverUrl);
    });

    it('should preserve the NEODB thumbnail suffix in the URL', () => {
      const baseUrl = 'https://neodb.social/m/item/movie789.jpg';
      const thumbnailSuffix = '.200x200_q85_autocrop_crop-scale.jpg';
      const fullUrl = baseUrl + thumbnailSuffix;

      const wrapper = mount(CoverItem, {
        props: {
          coverImageUrl: fullUrl,
          displayTitle: 'Test Movie'
        }
      });

      const image = wrapper.find('[data-testid="cover-image"]');
      expect(image.attributes('src')).toContain('.200x200_q85_autocrop_crop-scale');
    });

    it('should render cover image with correct URL in CategorySection grid', () => {
      const apiResponseItem = {
        item: {
          cover_image_url: 'https://neodb.social/m/item/unique-book.jpg.200x200_q85_autocrop_crop-scale.jpg',
          display_title: 'Unique Book Title',
          id: 'unique-1'
        },
        created_time: '2024-06-15T10:30:00Z'
      };

      const wrapper = mount(CategorySection, {
        props: {
          title: 'I read',
          items: [apiResponseItem],
          category: 'book',
          isLoading: false
        }
      });

      const image = wrapper.find('.cover-image');
      expect(image.exists()).toBe(true);
      expect(image.attributes('src')).toBe(apiResponseItem.item.cover_image_url);
    });

    it('should render multiple cover images with their respective URLs', () => {
      const apiItems = [
        {
          item: {
            cover_image_url: 'https://neodb.social/m/item/book1.jpg.200x200_q85_autocrop_crop-scale.jpg',
            display_title: 'Book One',
            id: '1'
          },
          created_time: '2024-01-15T10:30:00Z'
        },
        {
          item: {
            cover_image_url: 'https://neodb.social/m/item/book2.jpg.200x200_q85_autocrop_crop-scale.jpg',
            display_title: 'Book Two',
            id: '2'
          },
          created_time: '2024-02-20T14:00:00Z'
        },
        {
          item: {
            cover_image_url: 'https://neodb.social/m/item/book3.jpg.200x200_q85_autocrop_crop-scale.jpg',
            display_title: 'Book Three',
            id: '3'
          },
          created_time: '2024-03-25T16:00:00Z'
        }
      ];

      const wrapper = mount(CategorySection, {
        props: {
          title: 'I read',
          items: apiItems,
          category: 'book',
          isLoading: false
        }
      });

      const images = wrapper.findAll('.cover-image');
      expect(images.length).toBe(3);
      expect(images[0].attributes('src')).toBe(apiItems[0].item.cover_image_url);
      expect(images[1].attributes('src')).toBe(apiItems[1].item.cover_image_url);
      expect(images[2].attributes('src')).toBe(apiItems[2].item.cover_image_url);
    });
  });

  describe('Test Case 6: Title shown on hover/alt text', () => {
    it('should display title in item-title element', () => {
      const displayTitle = 'My Unique Book Title';

      const wrapper = mount(CoverItem, {
        props: {
          coverImageUrl: 'https://neodb.social/m/item/test.jpg',
          displayTitle: displayTitle
        }
      });

      const titleElement = wrapper.find('.item-title');
      expect(titleElement.exists()).toBe(true);
      expect(titleElement.text()).toBe(displayTitle);
    });

    it('should set alt text on image to display_title for accessibility', () => {
      const displayTitle = 'Accessible Book Title';

      const wrapper = mount(CoverItem, {
        props: {
          coverImageUrl: 'https://neodb.social/m/item/test.jpg',
          displayTitle: displayTitle
        }
      });

      const image = wrapper.find('[data-testid="cover-image"]');
      expect(image.attributes('alt')).toBe(displayTitle);
    });

    it('should have title overlay that can be shown on hover', () => {
      const displayTitle = 'Hover Test Title';

      const wrapper = mount(CoverItem, {
        props: {
          coverImageUrl: 'https://neodb.social/m/item/test.jpg',
          displayTitle: displayTitle
        }
      });

      const titleOverlay = wrapper.find('.item-title-overlay');
      expect(titleOverlay.exists()).toBe(true);

      // Verify title is inside the overlay
      const titleText = titleOverlay.find('.item-title');
      expect(titleText.text()).toBe(displayTitle);
    });

    it('should have title overlay with testid for testing', () => {
      const wrapper = mount(CoverItem, {
        props: {
          coverImageUrl: 'https://neodb.social/m/item/test.jpg',
          displayTitle: 'Test Title'
        }
      });

      const titleOverlay = wrapper.find('[data-testid="title-overlay"]');
      expect(titleOverlay.exists()).toBe(true);
    });

    it('should render titles correctly in CategorySection for multiple items', () => {
      const apiItems = [
        {
          item: {
            cover_image_url: 'https://neodb.social/m/item/book1.jpg',
            display_title: 'First Book Title',
            id: '1'
          },
          created_time: '2024-01-15T10:30:00Z'
        },
        {
          item: {
            cover_image_url: 'https://neodb.social/m/item/book2.jpg',
            display_title: 'Second Book Title',
            id: '2'
          },
          created_time: '2024-02-20T14:00:00Z'
        }
      ];

      const wrapper = mount(CategorySection, {
        props: {
          title: 'I read',
          items: apiItems,
          category: 'book',
          isLoading: false
        }
      });

      const titles = wrapper.findAll('.item-title');
      expect(titles.length).toBe(2);
      expect(titles[0].text()).toBe('First Book Title');
      expect(titles[1].text()).toBe('Second Book Title');
    });

    it('should set alt text correctly for images in CategorySection', () => {
      const apiItems = [
        {
          item: {
            cover_image_url: 'https://neodb.social/m/item/book1.jpg',
            display_title: 'Alt Text Book One',
            id: '1'
          },
          created_time: '2024-01-15T10:30:00Z'
        },
        {
          item: {
            cover_image_url: 'https://neodb.social/m/item/book2.jpg',
            display_title: 'Alt Text Book Two',
            id: '2'
          },
          created_time: '2024-02-20T14:00:00Z'
        }
      ];

      const wrapper = mount(CategorySection, {
        props: {
          title: 'I read',
          items: apiItems,
          category: 'book',
          isLoading: false
        }
      });

      const images = wrapper.findAll('.cover-image');
      expect(images.length).toBe(2);
      expect(images[0].attributes('alt')).toBe('Alt Text Book One');
      expect(images[1].attributes('alt')).toBe('Alt Text Book Two');
    });

    it('should use default title "Untitled" when display_title is not provided', () => {
      const wrapper = mount(CoverItem, {
        props: {
          coverImageUrl: 'https://neodb.social/m/item/test.jpg'
          // displayTitle not provided
        }
      });

      const titleElement = wrapper.find('.item-title');
      expect(titleElement.text()).toBe('Untitled');

      const image = wrapper.find('[data-testid="cover-image"]');
      expect(image.attributes('alt')).toBe('Untitled');
    });

    it('should handle special characters in display_title', () => {
      const specialTitle = 'Book: "Special" Characters & More <test>';

      const wrapper = mount(CoverItem, {
        props: {
          coverImageUrl: 'https://neodb.social/m/item/test.jpg',
          displayTitle: specialTitle
        }
      });

      const titleElement = wrapper.find('.item-title');
      expect(titleElement.text()).toBe(specialTitle);
    });

    it('should handle unicode characters in display_title (Chinese)', () => {
      const chineseTitle = '三体：黑暗森林';

      const wrapper = mount(CoverItem, {
        props: {
          coverImageUrl: 'https://neodb.social/m/item/test.jpg',
          displayTitle: chineseTitle
        }
      });

      const titleElement = wrapper.find('.item-title');
      expect(titleElement.text()).toBe(chineseTitle);

      const image = wrapper.find('[data-testid="cover-image"]');
      expect(image.attributes('alt')).toBe(chineseTitle);
    });
  });

  describe('Test Case 7: Error handling - Graceful degradation', () => {
    it('should show placeholder when cover_image_url is empty', () => {
      const wrapper = mount(CoverItem, {
        props: {
          coverImageUrl: '',
          displayTitle: 'Book with Missing Cover'
        }
      });

      const placeholder = wrapper.find('[data-testid="cover-placeholder"]');
      const image = wrapper.find('[data-testid="cover-image"]');

      expect(placeholder.exists()).toBe(true);
      expect(image.exists()).toBe(false);
    });

    it('should show placeholder when image fails to load', async () => {
      const wrapper = mount(CoverItem, {
        props: {
          coverImageUrl: 'https://neodb.social/m/item/invalid-image.jpg',
          displayTitle: 'Book with Broken Image'
        }
      });

      // Initially shows image attempt
      let image = wrapper.find('[data-testid="cover-image"]');
      expect(image.exists()).toBe(true);

      // Trigger error event (simulating image load failure)
      await image.trigger('error');

      // After error, should show placeholder
      const placeholder = wrapper.find('[data-testid="cover-placeholder"]');
      image = wrapper.find('[data-testid="cover-image"]');

      expect(placeholder.exists()).toBe(true);
      expect(image.exists()).toBe(false);
    });

    it('should display empty state when API returns empty data array', () => {
      const wrapper = mount(CategorySection, {
        props: {
          title: 'I read',
          items: [],
          category: 'book',
          isLoading: false
        }
      });

      const emptyState = wrapper.find('[data-testid="empty-state"]');
      expect(emptyState.exists()).toBe(true);

      const emptyMessage = wrapper.find('.empty-message');
      expect(emptyMessage.text()).toBe('Nothing recorded this year');
    });

    it('should display loading state while API is fetching', () => {
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

      // Should have 8 loading placeholder items
      const loadingItems = wrapper.findAll('.loading-item');
      expect(loadingItems.length).toBe(8);
    });

    it('should keep section visible with title even when no items', () => {
      const wrapper = mount(CategorySection, {
        props: {
          title: 'I read',
          items: [],
          category: 'book',
          isLoading: false
        }
      });

      // Section should still be visible
      const section = wrapper.find('.category-section');
      expect(section.exists()).toBe(true);

      // Title should still show
      const title = wrapper.find('.category-title');
      expect(title.exists()).toBe(true);
      expect(title.text()).toBe('I read');
    });
  });

  describe('API Data Structure Handling', () => {
    it('should correctly access nested item.cover_image_url from API response', () => {
      // This is the exact structure returned by the NEODB API
      const apiResponseItem = {
        item: {
          cover_image_url: 'https://neodb.social/m/item/nested-test.jpg.200x200_q85_autocrop_crop-scale.jpg',
          display_title: 'Nested Structure Test',
          id: 'nested-1'
        },
        created_time: '2024-06-15T10:30:00Z'
      };

      const wrapper = mount(CategorySection, {
        props: {
          title: 'I read',
          items: [apiResponseItem],
          category: 'book',
          isLoading: false
        }
      });

      // CategorySection passes item.item.cover_image_url to CoverItem
      const image = wrapper.find('.cover-image');
      expect(image.attributes('src')).toBe(apiResponseItem.item.cover_image_url);
    });

    it('should correctly access nested item.display_title from API response', () => {
      const apiResponseItem = {
        item: {
          cover_image_url: 'https://neodb.social/m/item/test.jpg',
          display_title: 'Nested Title Test',
          id: 'nested-2'
        },
        created_time: '2024-06-15T10:30:00Z'
      };

      const wrapper = mount(CategorySection, {
        props: {
          title: 'I read',
          items: [apiResponseItem],
          category: 'book',
          isLoading: false
        }
      });

      // CategorySection passes item.item.display_title to CoverItem
      const titleElement = wrapper.find('.item-title');
      expect(titleElement.text()).toBe(apiResponseItem.item.display_title);
    });

    it('should handle all categories: book, screen, music, game', () => {
      const categories = ['book', 'screen', 'music', 'game'];
      const titles = ['I read', 'I watched', 'I listened', 'I played'];

      categories.forEach((category, index) => {
        const apiItem = {
          item: {
            cover_image_url: `https://neodb.social/m/item/${category}-test.jpg`,
            display_title: `${category.charAt(0).toUpperCase() + category.slice(1)} Item`,
            id: `${category}-1`
          },
          created_time: '2024-06-15T10:30:00Z'
        };

        const wrapper = mount(CategorySection, {
          props: {
            title: titles[index],
            items: [apiItem],
            category: category,
            isLoading: false
          }
        });

        // Verify correct data-category attribute
        expect(wrapper.find('.category-section').attributes('data-category')).toBe(category);

        // Verify image URL
        const image = wrapper.find('.cover-image');
        expect(image.attributes('src')).toBe(apiItem.item.cover_image_url);
      });
    });
  });
});
