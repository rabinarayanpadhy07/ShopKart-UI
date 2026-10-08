import React, { useState } from 'react';
import { PackageOpen } from 'lucide-react';
import { ProductCard } from '@/components/products/ProductCard';

export function ProductGridSkeleton({ count = 8 }) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4 lg:gap-5" aria-hidden="true">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="overflow-hidden rounded-2xl border border-border bg-surface animate-pulse">
          <div className="aspect-square bg-muted-bg" />
          <div className="space-y-2 p-4">
            <div className="h-2.5 w-1/3 rounded bg-muted-bg" />
            <div className="h-3.5 w-5/6 rounded bg-muted-bg" />
            <div className="h-3.5 w-2/3 rounded bg-muted-bg" />
            <div className="flex items-center justify-between pt-3">
              <div className="h-5 w-16 rounded bg-muted-bg" />
              <div className="h-10 w-16 rounded-xl bg-muted-bg" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export const ProductList = React.memo(function ProductList({ products, onAddToCart, onAddToWishlist, emptyHint }) {
  const [justAdded, setJustAdded] = useState(null);

  const handleAddToCart = async (productId) => {
    const success = await onAddToCart(productId);
    if (success === false) return;
    setJustAdded(productId);
    window.dispatchEvent(new CustomEvent('cart:bump'));
    window.setTimeout(() => setJustAdded((current) => (current === productId ? null : current)), 1400);
  };

  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-surface py-20 text-center">
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-muted-bg">
          <PackageOpen className="h-7 w-7 text-ink-muted" strokeWidth={1.5} />
        </div>
        <p className="text-base font-semibold text-ink">No products found</p>
        <p className="mt-1 max-w-xs text-sm text-ink-muted">{emptyHint || 'Try a different search or category.'}</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4 lg:gap-5">
      {products.map((product, index) => (
        <ProductCard
          key={product.product_id}
          product={product}
          index={index}
          justAdded={justAdded === product.product_id}
          onAddToCart={onAddToCart ? handleAddToCart : undefined}
          onAddToWishlist={onAddToWishlist}
        />
      ))}
    </div>
  );
});
