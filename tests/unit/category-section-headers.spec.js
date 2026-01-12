import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import CategorySection from '../../src/components/CategorySection.vue';

/**
 * Scenario 15: Category Section Headers
 * Tests that each category section displays the correct header text
 *
 * Headers expected:
 * - Books: "I read"
 * - Screen: "I watched"
 * - Music: "I listened"
 * - Games: "I played"
 */

describe('Category Section Headers', () => {
  const mockItems = [
    {
      item: {
        cover_image_url: 'https://example.com/cover1.jpg',
        display_title: 'Test Item 1',
        id: '1'
      },
      created_time: '2024-01-15T10:30:00Z'
    }
  ];

  describe('Test Case 1: Books category section header', () => {
    it('displays "I read" as the header text for books category', () => {
      const wrapper = mount(CategorySection, {
        props: {
          title: 'I read',
          items: mockItems,
          category: 'book',
          isLoading: false
        }
      });

      const header = wrapper.find('.category-title');
      expect(header.exists()).toBe(true);
      expect(header.text()).toBe('I read');
    });

    it('has correct data-category attribute for book section', () => {
      const wrapper = mount(CategorySection, {
        props: {
          title: 'I read',
          items: mockItems,
          category: 'book',
          isLoading: false
        }
      });

      const section = wrapper.find('.category-section');
      expect(section.attributes('data-category')).toBe('book');
    });

    it('header has correct id attribute for book section', () => {
      const wrapper = mount(CategorySection, {
        props: {
          title: 'I read',
          items: mockItems,
          category: 'book',
          isLoading: false
        }
      });

      const header = wrapper.find('.category-title');
      expect(header.attributes('id')).toBe('book-title');
    });
  });

  describe('Test Case 2: Screen category section header', () => {
    it('displays "I watched" as the header text for screen category', () => {
      const wrapper = mount(CategorySection, {
        props: {
          title: 'I watched',
          items: mockItems,
          category: 'screen',
          isLoading: false
        }
      });

      const header = wrapper.find('.category-title');
      expect(header.exists()).toBe(true);
      expect(header.text()).toBe('I watched');
    });

    it('has correct data-category attribute for screen section', () => {
      const wrapper = mount(CategorySection, {
        props: {
          title: 'I watched',
          items: mockItems,
          category: 'screen',
          isLoading: false
        }
      });

      const section = wrapper.find('.category-section');
      expect(section.attributes('data-category')).toBe('screen');
    });

    it('header has correct id attribute for screen section', () => {
      const wrapper = mount(CategorySection, {
        props: {
          title: 'I watched',
          items: mockItems,
          category: 'screen',
          isLoading: false
        }
      });

      const header = wrapper.find('.category-title');
      expect(header.attributes('id')).toBe('screen-title');
    });
  });

  describe('Test Case 3: Music category section header', () => {
    it('displays "I listened" as the header text for music category', () => {
      const wrapper = mount(CategorySection, {
        props: {
          title: 'I listened',
          items: mockItems,
          category: 'music',
          isLoading: false
        }
      });

      const header = wrapper.find('.category-title');
      expect(header.exists()).toBe(true);
      expect(header.text()).toBe('I listened');
    });

    it('has correct data-category attribute for music section', () => {
      const wrapper = mount(CategorySection, {
        props: {
          title: 'I listened',
          items: mockItems,
          category: 'music',
          isLoading: false
        }
      });

      const section = wrapper.find('.category-section');
      expect(section.attributes('data-category')).toBe('music');
    });

    it('header has correct id attribute for music section', () => {
      const wrapper = mount(CategorySection, {
        props: {
          title: 'I listened',
          items: mockItems,
          category: 'music',
          isLoading: false
        }
      });

      const header = wrapper.find('.category-title');
      expect(header.attributes('id')).toBe('music-title');
    });
  });

  describe('Test Case 4: Games category section header', () => {
    it('displays "I played" as the header text for games category', () => {
      const wrapper = mount(CategorySection, {
        props: {
          title: 'I played',
          items: mockItems,
          category: 'game',
          isLoading: false
        }
      });

      const header = wrapper.find('.category-title');
      expect(header.exists()).toBe(true);
      expect(header.text()).toBe('I played');
    });

    it('has correct data-category attribute for game section', () => {
      const wrapper = mount(CategorySection, {
        props: {
          title: 'I played',
          items: mockItems,
          category: 'game',
          isLoading: false
        }
      });

      const section = wrapper.find('.category-section');
      expect(section.attributes('data-category')).toBe('game');
    });

    it('header has correct id attribute for game section', () => {
      const wrapper = mount(CategorySection, {
        props: {
          title: 'I played',
          items: mockItems,
          category: 'game',
          isLoading: false
        }
      });

      const header = wrapper.find('.category-title');
      expect(header.attributes('id')).toBe('game-title');
    });
  });

  describe('Header styling and structure', () => {
    it('renders header as h2 element', () => {
      const wrapper = mount(CategorySection, {
        props: {
          title: 'I read',
          items: mockItems,
          category: 'book',
          isLoading: false
        }
      });

      const header = wrapper.find('h2');
      expect(header.exists()).toBe(true);
      expect(header.classes()).toContain('category-title');
    });

    it('section has aria-labelledby pointing to header', () => {
      const wrapper = mount(CategorySection, {
        props: {
          title: 'I read',
          items: mockItems,
          category: 'book',
          isLoading: false
        }
      });

      const section = wrapper.find('.category-section');
      expect(section.attributes('aria-labelledby')).toBe('book-title');
    });

    it('all headers render correctly when empty', () => {
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

        const header = wrapper.find('.category-title');
        expect(header.exists()).toBe(true);
        expect(header.text()).toBe(title);
      });
    });
  });
});
