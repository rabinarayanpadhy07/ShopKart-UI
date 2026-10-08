import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, expect } from 'vitest';
import { ProductCard } from './ProductCard';
import { formatPrice, formatStatus } from '@/lib/format';

const base = {
  product_id: 7,
  name: 'Apple AirPods Max - Silver',
  brand: 'Apple',
  category: 'Mobile Accessories',
  price: 59900,
  stock: 12,
  averageRating: 0,
  totalReviews: 0,
  images: ['https://example.com/a.webp'],
};

function renderCard(product) {
  return render(
    <MemoryRouter>
      <ProductCard product={product} onAddToCart={() => {}} onAddToWishlist={() => {}} />
    </MemoryRouter>
  );
}

describe('formatPrice', () => {
  it('uses Indian digit grouping', () => {
    expect(formatPrice(139999)).toBe('₹1,39,999');
    expect(formatPrice('499.00')).toBe('₹499');
  });
});

describe('formatStatus', () => {
  it('turns backend status codes into readable labels', () => {
    expect(formatStatus('OUT_FOR_DELIVERY')).toBe('Out for delivery');
    expect(formatStatus('DELIVERED')).toBe('Delivered');
    expect(formatStatus(null)).toBe('');
  });
});

describe('ProductCard', () => {
  it('links to the product page and shows the real price', () => {
    renderCard(base);
    expect(screen.getByRole('link', { name: base.name })).toHaveAttribute('href', '/product/7');
    expect(screen.getByText('₹59,900')).toBeInTheDocument();
    expect(screen.getByText('Free delivery')).toBeInTheDocument();
  });

  it('does not invent a rating when there are no reviews', () => {
    renderCard(base);
    expect(screen.queryByText(/\(\d+\)/)).not.toBeInTheDocument();
  });

  it('shows the rating and review count when reviews exist', () => {
    renderCard({ ...base, averageRating: 4.5, totalReviews: 12 });
    expect(screen.getByText('4.5')).toBeInTheDocument();
    expect(screen.getByText('(12)')).toBeInTheDocument();
  });

  it('disables add to cart when out of stock', () => {
    renderCard({ ...base, stock: 0 });
    expect(screen.getByText(/out of stock/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /out of stock/i })).toBeDisabled();
  });
});
