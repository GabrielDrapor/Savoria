import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';
import CategorySection from '@/components/CategorySection.vue';

/**
 * Error Handling Unit Tests
 * Scenario: Test graceful error handling when API requests fail
 *
 * These unit tests focus on CategorySection component's error state rendering:
 * - Test Case 1: All API endpoints return 500 error - Error message displayed to user
 * - Test Case 2: Books API fails, others succeed - Books section shows error
 * - Test Case 4: Retry button on error state - User can retry failed request
 */

describe('Error Handling - CategorySection Component', () => {

  describe('Test Case 1: Error state display when API fails', () => {
    it('should display error state when isError prop is true', () => {
      const wrapper = mount(CategorySection, {
        props: {
          title: 'I read',
          items: [],
          category: 'book',
          isLoading: false,
          isError: true
        }
      });

      const errorState = wrapper.find('[data-testid="error-state"]');
      expect(errorState.exists()).toBe(true);
    });

    it('should display meaningful error message in error state', () => {
      const wrapper = mount(CategorySection, {
        props: {
          title: 'I read',
          items: [],
          category: 'book',
          isLoading: false,
          isError: true
        }
      });

      const errorMessage = wrapper.find('.error-message');
      expect(errorMessage.exists()).toBe(true);
      expect(errorMessage.text().length).toBeGreaterThan(0);
    });

    it('should not show technical error details to user', () => {
      const wrapper = mount(CategorySection, {
        props: {
          title: 'I read',
          items: [],
          category: 'book',
          isLoading: false,
          isError: true,
          errorMessage: 'Internal Server Error'
        }
      });

      const errorMessage = wrapper.find('.error-message');
      // Should use user-friendly message, not raw error
      expect(errorMessage.text()).not.toContain('Internal Server Error');
      expect(errorMessage.text()).not.toContain('500');
    });

    it('should show category title even when in error state', () => {
      const wrapper = mount(CategorySection, {
        props: {
          title: 'I read',
          items: [],
          category: 'book',
          isLoading: false,
          isError: true
        }
      });

      const title = wrapper.find('.category-title');
      expect(title.exists()).toBe(true);
      expect(title.text()).toBe('I read');
    });

    it('should show section with correct data-category attribute in error state', () => {
      const wrapper = mount(CategorySection, {
        props: {
          title: 'I read',
          items: [],
          category: 'book',
          isLoading: false,
          isError: true
        }
      });

      const section = wrapper.find('.category-section');
      expect(section.attributes('data-category')).toBe('book');
    });
  });

  describe('Test Case 2: Error state vs other states', () => {
    it('should show error state instead of empty state when isError is true', () => {
      const wrapper = mount(CategorySection, {
        props: {
          title: 'I read',
          items: [],
          category: 'book',
          isLoading: false,
          isError: true
        }
      });

      const errorState = wrapper.find('[data-testid="error-state"]');
      const emptyState = wrapper.find('[data-testid="empty-state"]');

      expect(errorState.exists()).toBe(true);
      expect(emptyState.exists()).toBe(false);
    });

    it('should show error state instead of loading state when isError is true', () => {
      const wrapper = mount(CategorySection, {
        props: {
          title: 'I read',
          items: [],
          category: 'book',
          isLoading: false,
          isError: true
        }
      });

      const errorState = wrapper.find('[data-testid="error-state"]');
      const loadingGrid = wrapper.find('[data-testid="loading-grid"]');

      expect(errorState.exists()).toBe(true);
      expect(loadingGrid.exists()).toBe(false);
    });

    it('should show empty state when not loading, no error, and no items', () => {
      const wrapper = mount(CategorySection, {
        props: {
          title: 'I read',
          items: [],
          category: 'book',
          isLoading: false,
          isError: false
        }
      });

      const emptyState = wrapper.find('[data-testid="empty-state"]');
      const errorState = wrapper.find('[data-testid="error-state"]');

      expect(emptyState.exists()).toBe(true);
      expect(errorState.exists()).toBe(false);
    });

    it('should show loading state when loading', () => {
      const wrapper = mount(CategorySection, {
        props: {
          title: 'I read',
          items: [],
          category: 'book',
          isLoading: true,
          isError: false
        }
      });

      const loadingGrid = wrapper.find('[data-testid="loading-grid"]');
      const errorState = wrapper.find('[data-testid="error-state"]');

      expect(loadingGrid.exists()).toBe(true);
      expect(errorState.exists()).toBe(false);
    });

    it('should show items grid when has items and not loading or error', () => {
      const items = [
        {
          item: {
            cover_image_url: 'https://example.com/book1.jpg',
            display_title: 'Test Book',
            id: 'book-1'
          },
          created_time: '2024-06-15T10:30:00Z'
        }
      ];

      const wrapper = mount(CategorySection, {
        props: {
          title: 'I read',
          items: items,
          category: 'book',
          isLoading: false,
          isError: false
        }
      });

      const itemsGrid = wrapper.find('[data-testid="items-grid-book"]');
      const errorState = wrapper.find('[data-testid="error-state"]');
      const emptyState = wrapper.find('[data-testid="empty-state"]');

      expect(itemsGrid.exists()).toBe(true);
      expect(errorState.exists()).toBe(false);
      expect(emptyState.exists()).toBe(false);
    });
  });

  describe('Test Case 4: Retry button functionality', () => {
    it('should display retry button in error state', () => {
      const wrapper = mount(CategorySection, {
        props: {
          title: 'I read',
          items: [],
          category: 'book',
          isLoading: false,
          isError: true
        }
      });

      const retryButton = wrapper.find('[data-testid="retry-button"]');
      expect(retryButton.exists()).toBe(true);
    });

    it('should emit retry event when retry button is clicked', async () => {
      const wrapper = mount(CategorySection, {
        props: {
          title: 'I read',
          items: [],
          category: 'book',
          isLoading: false,
          isError: true
        }
      });

      const retryButton = wrapper.find('[data-testid="retry-button"]');
      await retryButton.trigger('click');

      expect(wrapper.emitted('retry')).toBeTruthy();
      expect(wrapper.emitted('retry').length).toBe(1);
    });

    it('should emit retry event with category name', async () => {
      const wrapper = mount(CategorySection, {
        props: {
          title: 'I read',
          items: [],
          category: 'book',
          isLoading: false,
          isError: true
        }
      });

      const retryButton = wrapper.find('[data-testid="retry-button"]');
      await retryButton.trigger('click');

      expect(wrapper.emitted('retry')[0]).toEqual(['book']);
    });

    it('should not show retry button in empty state', () => {
      const wrapper = mount(CategorySection, {
        props: {
          title: 'I read',
          items: [],
          category: 'book',
          isLoading: false,
          isError: false
        }
      });

      const retryButton = wrapper.find('[data-testid="retry-button"]');
      expect(retryButton.exists()).toBe(false);
    });

    it('should not show retry button when items are displayed', () => {
      const items = [
        {
          item: {
            cover_image_url: 'https://example.com/book1.jpg',
            display_title: 'Test Book',
            id: 'book-1'
          },
          created_time: '2024-06-15T10:30:00Z'
        }
      ];

      const wrapper = mount(CategorySection, {
        props: {
          title: 'I read',
          items: items,
          category: 'book',
          isLoading: false,
          isError: false
        }
      });

      const retryButton = wrapper.find('[data-testid="retry-button"]');
      expect(retryButton.exists()).toBe(false);
    });

    it('retry button should be keyboard accessible', () => {
      const wrapper = mount(CategorySection, {
        props: {
          title: 'I read',
          items: [],
          category: 'book',
          isLoading: false,
          isError: true
        }
      });

      const retryButton = wrapper.find('[data-testid="retry-button"]');

      // Should be a button element for proper accessibility
      expect(retryButton.element.tagName.toLowerCase()).toBe('button');

      // Should have appropriate aria attributes or be focusable
      const tabIndex = retryButton.attributes('tabindex');
      expect(tabIndex === undefined || parseInt(tabIndex) >= 0).toBe(true);
    });

    it('retry button should have accessible label', () => {
      const wrapper = mount(CategorySection, {
        props: {
          title: 'I read',
          items: [],
          category: 'book',
          isLoading: false,
          isError: true
        }
      });

      const retryButton = wrapper.find('[data-testid="retry-button"]');

      // Button should have text content or aria-label
      const hasText = retryButton.text().length > 0;
      const hasAriaLabel = retryButton.attributes('aria-label')?.length > 0;

      expect(hasText || hasAriaLabel).toBe(true);
    });
  });

  describe('Error state styling', () => {
    it('should have error-state class for styling', () => {
      const wrapper = mount(CategorySection, {
        props: {
          title: 'I read',
          items: [],
          category: 'book',
          isLoading: false,
          isError: true
        }
      });

      const errorState = wrapper.find('[data-testid="error-state"]');
      expect(errorState.classes()).toContain('error-state');
    });

    it('should have visible error message element', () => {
      const wrapper = mount(CategorySection, {
        props: {
          title: 'I read',
          items: [],
          category: 'book',
          isLoading: false,
          isError: true
        }
      });

      const errorMessage = wrapper.find('.error-message');
      expect(errorMessage.exists()).toBe(true);
      expect(errorMessage.isVisible()).toBe(true);
    });
  });

  describe('All categories support error state', () => {
    const categories = ['book', 'screen', 'music', 'game'];
    const titles = ['I read', 'I watched', 'I listened', 'I played'];

    categories.forEach((category, index) => {
      it(`should display error state for ${category} category`, () => {
        const wrapper = mount(CategorySection, {
          props: {
            title: titles[index],
            items: [],
            category: category,
            isLoading: false,
            isError: true
          }
        });

        const errorState = wrapper.find('[data-testid="error-state"]');
        expect(errorState.exists()).toBe(true);
      });

      it(`should emit retry event with correct category: ${category}`, async () => {
        const wrapper = mount(CategorySection, {
          props: {
            title: titles[index],
            items: [],
            category: category,
            isLoading: false,
            isError: true
          }
        });

        const retryButton = wrapper.find('[data-testid="retry-button"]');
        await retryButton.trigger('click');

        expect(wrapper.emitted('retry')[0]).toEqual([category]);
      });
    });
  });
});
