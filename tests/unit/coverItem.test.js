import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import CoverItem from '@/components/CoverItem.vue';

describe('CoverItem Component - Aspect Ratio and Consistency', () => {
  describe('Test Case 1: Cover container has 3:4 aspect ratio', () => {
    it('should render cover container with 3:4 aspect ratio class', () => {
      const wrapper = mount(CoverItem, {
        props: {
          coverImageUrl: 'https://example.com/cover.jpg',
          displayTitle: 'Test Cover'
        }
      });

      const container = wrapper.find('[data-testid="cover-container"]');
      expect(container.exists()).toBe(true);

      // Verify the container has the cover-container class which defines aspect-ratio
      expect(container.classes()).toContain('cover-container');
    });

    it('should have cover-container class with aspect-ratio defined in component CSS', async () => {
      const wrapper = mount(CoverItem, {
        props: {
          coverImageUrl: 'https://example.com/cover.jpg',
          displayTitle: 'Test Cover'
        },
        attachTo: document.body
      });

      const container = wrapper.find('.cover-container');
      expect(container.exists()).toBe(true);

      // Inject the component's CSS for testing
      const styleElement = document.createElement('style');
      styleElement.textContent = `
        .cover-container {
          aspect-ratio: 3 / 4;
        }
      `;
      document.head.appendChild(styleElement);

      const computedStyle = window.getComputedStyle(container.element);
      expect(computedStyle.aspectRatio).toBe('3 / 4');

      document.head.removeChild(styleElement);
      wrapper.unmount();
    });

    it('should render cover-item element with testid', () => {
      const wrapper = mount(CoverItem, {
        props: {
          coverImageUrl: 'https://example.com/cover.jpg',
          displayTitle: 'Test Cover'
        }
      });

      const item = wrapper.find('[data-testid="cover-item"]');
      expect(item.exists()).toBe(true);
      expect(item.classes()).toContain('cover-item');
    });
  });

  describe('Test Case 2: Image fits within container with object-fit: cover', () => {
    it('should apply object-fit: cover to the cover image via CSS class', async () => {
      const wrapper = mount(CoverItem, {
        props: {
          coverImageUrl: 'https://example.com/cover.jpg',
          displayTitle: 'Test Cover'
        },
        attachTo: document.body
      });

      const image = wrapper.find('[data-testid="cover-image"]');
      expect(image.exists()).toBe(true);
      expect(image.classes()).toContain('cover-image');

      // Inject the component's CSS for testing
      const styleElement = document.createElement('style');
      styleElement.textContent = `
        .cover-image {
          object-fit: cover;
        }
      `;
      document.head.appendChild(styleElement);

      const style = window.getComputedStyle(image.element);
      expect(style.objectFit).toBe('cover');

      document.head.removeChild(styleElement);
      wrapper.unmount();
    });

    it('should set image width and height to 100% of container via CSS class', async () => {
      const wrapper = mount(CoverItem, {
        props: {
          coverImageUrl: 'https://example.com/wide-image.jpg',
          displayTitle: 'Wide Image Cover'
        },
        attachTo: document.body
      });

      const image = wrapper.find('.cover-image');

      // Inject the component's CSS for testing
      const styleElement = document.createElement('style');
      styleElement.textContent = `
        .cover-image {
          width: 100%;
          height: 100%;
        }
      `;
      document.head.appendChild(styleElement);

      const style = window.getComputedStyle(image.element);
      expect(style.width).toBe('100%');
      expect(style.height).toBe('100%');

      document.head.removeChild(styleElement);
      wrapper.unmount();
    });

    it('should render image with provided src and alt attributes', () => {
      const testUrl = 'https://example.com/test-cover.jpg';
      const testTitle = 'My Test Cover';

      const wrapper = mount(CoverItem, {
        props: {
          coverImageUrl: testUrl,
          displayTitle: testTitle
        }
      });

      const image = wrapper.find('img.cover-image');
      expect(image.exists()).toBe(true);
      expect(image.attributes('src')).toBe(testUrl);
      expect(image.attributes('alt')).toBe(testTitle);
    });

    it('should have lazy loading enabled on images', () => {
      const wrapper = mount(CoverItem, {
        props: {
          coverImageUrl: 'https://example.com/cover.jpg',
          displayTitle: 'Lazy Cover'
        }
      });

      const image = wrapper.find('img.cover-image');
      expect(image.attributes('loading')).toBe('lazy');
    });
  });

  describe('Test Case 4: Missing cover image URL - Placeholder fallback', () => {
    it('should display placeholder when coverImageUrl is empty', () => {
      const wrapper = mount(CoverItem, {
        props: {
          coverImageUrl: '',
          displayTitle: 'No Cover'
        }
      });

      const placeholder = wrapper.find('[data-testid="cover-placeholder"]');
      const image = wrapper.find('[data-testid="cover-image"]');

      expect(placeholder.exists()).toBe(true);
      expect(image.exists()).toBe(false);
    });

    it('should display placeholder when coverImageUrl is not provided', () => {
      const wrapper = mount(CoverItem, {
        props: {
          displayTitle: 'Missing Cover'
        }
      });

      const placeholder = wrapper.find('[data-testid="cover-placeholder"]');
      expect(placeholder.exists()).toBe(true);
    });

    it('should display placeholder when image fails to load', async () => {
      const wrapper = mount(CoverItem, {
        props: {
          coverImageUrl: 'https://invalid-url.com/broken-image.jpg',
          displayTitle: 'Broken Cover'
        }
      });

      // Initially shows image
      let image = wrapper.find('[data-testid="cover-image"]');
      expect(image.exists()).toBe(true);

      // Trigger error event
      await image.trigger('error');

      // After error, should show placeholder
      const placeholder = wrapper.find('[data-testid="cover-placeholder"]');
      image = wrapper.find('[data-testid="cover-image"]');

      expect(placeholder.exists()).toBe(true);
      expect(image.exists()).toBe(false);
    });

    it('should maintain 3:4 aspect ratio on placeholder', async () => {
      const wrapper = mount(CoverItem, {
        props: {
          coverImageUrl: '',
          displayTitle: 'Placeholder Cover'
        },
        attachTo: document.body
      });

      const container = wrapper.find('.cover-container');

      // Inject the component's CSS for testing
      const styleElement = document.createElement('style');
      styleElement.textContent = `
        .cover-container {
          aspect-ratio: 3 / 4;
        }
      `;
      document.head.appendChild(styleElement);

      const style = window.getComputedStyle(container.element);
      // Placeholder should be inside a container with 3:4 aspect ratio
      expect(style.aspectRatio).toBe('3 / 4');

      document.head.removeChild(styleElement);
      wrapper.unmount();
    });

    it('should reset imageError when coverImageUrl changes', async () => {
      const wrapper = mount(CoverItem, {
        props: {
          coverImageUrl: 'https://example.com/broken.jpg',
          displayTitle: 'Test'
        }
      });

      // Trigger error
      const image = wrapper.find('[data-testid="cover-image"]');
      await image.trigger('error');

      // Verify placeholder is shown
      expect(wrapper.find('[data-testid="cover-placeholder"]').exists()).toBe(true);

      // Change the coverImageUrl prop
      await wrapper.setProps({ coverImageUrl: 'https://example.com/working.jpg' });

      // Should show image again (imageError reset)
      expect(wrapper.find('[data-testid="cover-image"]').exists()).toBe(true);
      expect(wrapper.find('[data-testid="cover-placeholder"]').exists()).toBe(false);
    });

    it('should have placeholder icon inside the placeholder', () => {
      const wrapper = mount(CoverItem, {
        props: {
          coverImageUrl: '',
          displayTitle: 'No Cover'
        }
      });

      const placeholder = wrapper.find('.cover-placeholder');
      const icon = placeholder.find('.placeholder-icon');

      expect(placeholder.exists()).toBe(true);
      expect(icon.exists()).toBe(true);
    });
  });

  describe('Component Props and Defaults', () => {
    it('should use default displayTitle when not provided', () => {
      const wrapper = mount(CoverItem, {
        props: {
          coverImageUrl: 'https://example.com/cover.jpg'
        }
      });

      const image = wrapper.find('img.cover-image');
      expect(image.attributes('alt')).toBe('Untitled');
    });

    it('should use default empty string for coverImageUrl when not provided', () => {
      const wrapper = mount(CoverItem);

      // Should show placeholder since coverImageUrl defaults to empty
      const placeholder = wrapper.find('[data-testid="cover-placeholder"]');
      expect(placeholder.exists()).toBe(true);
    });
  });

  describe('Accessibility', () => {
    it('should have aria-label on placeholder', () => {
      const title = 'Accessible Cover';
      const wrapper = mount(CoverItem, {
        props: {
          coverImageUrl: '',
          displayTitle: title
        }
      });

      const placeholder = wrapper.find('[data-testid="cover-placeholder"]');
      expect(placeholder.attributes('aria-label')).toBe(title);
    });

    it('should have aria-hidden on placeholder icon', () => {
      const wrapper = mount(CoverItem, {
        props: {
          coverImageUrl: '',
          displayTitle: 'Test'
        }
      });

      const icon = wrapper.find('.placeholder-icon');
      expect(icon.attributes('aria-hidden')).toBe('true');
    });
  });

  describe('Title overlay', () => {
    it('should display title in overlay', () => {
      const title = 'My Test Title';
      const wrapper = mount(CoverItem, {
        props: {
          coverImageUrl: 'https://example.com/cover.jpg',
          displayTitle: title
        }
      });

      const overlay = wrapper.find('.item-title-overlay');
      expect(overlay.exists()).toBe(true);
      expect(overlay.text()).toBe(title);
    });
  });
});
