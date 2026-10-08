import { describe, it, expect } from 'vitest';
import { getProductImage, getProductImages, isUnsplashOrPlaceholder } from './productImages';

describe('productImages resolver', () => {
  it('detects unsplash and placeholder urls', () => {
    expect(isUnsplashOrPlaceholder('https://images.unsplash.com/photo-123')).toBe(true);
    expect(isUnsplashOrPlaceholder('https://via.placeholder.com/300')).toBe(true);
    expect(isUnsplashOrPlaceholder('')).toBe(true);
    expect(isUnsplashOrPlaceholder(null)).toBe(true);
    expect(isUnsplashOrPlaceholder('https://images.pexels.com/photos/123')).toBe(false);
  });

  it('maps known products to authentic high-res images', () => {
    const iphone = { name: 'iPhone 15 Pro Max', category: 'Mobiles' };
    const img = getProductImage(iphone);
    expect(img).toContain('pexels-photo');

    const book = { name: 'Atomic Habits', category: 'Books' };
    const bookImg = getProductImage(book);
    expect(bookImg).toContain('openlibrary.org');
  });

  it('provides multi-image gallery for known products', () => {
    const shirt = { name: 'Classic White Oxford Shirt', category: 'Shirts' };
    const gallery = getProductImages(shirt);
    expect(Array.isArray(gallery)).toBe(true);
    expect(gallery.length).toBeGreaterThanOrEqual(2);
  });

  it('falls back to category image when product is unknown', () => {
    const unknownBeauty = { name: 'Unknown Brand Cream', category: 'Beauty' };
    const img = getProductImage(unknownBeauty);
    expect(img).toBeDefined();
    expect(typeof img).toBe('string');
  });
});
