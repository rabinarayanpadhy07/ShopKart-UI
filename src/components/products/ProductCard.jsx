import React from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Star, ShoppingBag, Check } from 'lucide-react';
import { IMAGE_FALLBACK } from '@/lib/placeholder';
import { formatPrice, productImage, FREE_DELIVERY_THRESHOLD } from '@/lib/format';
import { cn } from '@/lib/utils';

export function RatingBadge({ rating, count, className }) {
  if (!count) return null;
  return (
    <span className={cn('inline-flex items-center gap-1 text-xs text-ink-muted', className)}>
      <span className="inline-flex items-center gap-0.5 rounded-md bg-success px-1.5 py-0.5 text-[11px] font-bold text-white">
        {Number(rating || 0).toFixed(1)}
        <Star className="h-2.5 w-2.5 fill-current" strokeWidth={0} />
      </span>
      <span>({count.toLocaleString('en-IN')})</span>
    </span>
  );
}

export function StockBadge({ stock, className }) {
  if (stock <= 0) {
    return (
      <span className={cn('rounded-md bg-ink/85 px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-white', className)}>
        Out of stock
      </span>
    );
  }
  if (stock <= 5) {
    return (
      <span className={cn('rounded-md bg-amber-100 px-2 py-1 text-[10px] font-semibold text-amber-800', className)}>
        Only {stock} left
      </span>
    );
  }
  return null;
}

export const ProductCard = React.memo(function ProductCard({
  product,
  index = 0,
  justAdded = false,
  onAddToCart,
  onAddToWishlist,
}) {
  const id = product.product_id;
  const image = productImage(product) || IMAGE_FALLBACK;
  const price = Number(product.price);
  const outOfStock = product.stock <= 0;
  const label = product.brand || product.category;

  return (
    <motion.article
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28, delay: Math.min(index, 8) * 0.035, ease: 'easeOut' }}
      className="group relative flex flex-col overflow-hidden rounded-2xl border border-border bg-surface transition-shadow duration-300 hover:shadow-[0_12px_32px_-12px_rgba(15,23,42,0.18)]"
    >
      <Link
        to={`/product/${id}`}
        className="relative block aspect-square overflow-hidden bg-muted-bg/70 focus-visible:outline-none"
        tabIndex={-1}
        aria-hidden="true"
      >
        <img
          src={image}
          alt=""
          className={cn(
            'h-full w-full object-contain p-5 mix-blend-multiply transition-transform duration-500 group-hover:scale-105',
            outOfStock && 'opacity-60'
          )}
          loading={index < 4 ? 'eager' : 'lazy'}
          decoding="async"
          onError={(e) => { e.currentTarget.src = IMAGE_FALLBACK; }}
        />
        <StockBadge stock={product.stock} className="absolute left-3 top-3" />
      </Link>

      {onAddToWishlist && (
        <button
          type="button"
          onClick={() => onAddToWishlist(id)}
          className="absolute right-3 top-3 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-surface/90 text-ink-muted shadow-sm ring-1 ring-border backdrop-blur transition hover:text-danger hover:scale-105 cursor-pointer"
          aria-label={`Add ${product.name} to wishlist`}
        >
          <Heart className="h-4 w-4" strokeWidth={2} />
        </button>
      )}

      <div className="flex flex-1 flex-col gap-1.5 p-3.5 sm:p-4">
        {label && (
          <span className="truncate text-[11px] font-semibold uppercase tracking-wider text-ink-muted">
            {label}
          </span>
        )}
        <Link
          to={`/product/${id}`}
          className="line-clamp-2 min-h-[2.5rem] text-sm font-semibold leading-snug text-ink hover:text-brand"
        >
          {product.name}
        </Link>
        <RatingBadge rating={product.averageRating} count={product.totalReviews} />

        <div className="mt-auto flex items-end justify-between gap-2 pt-2">
          <div className="min-w-0">
            <p className="text-base font-bold text-ink sm:text-lg">{formatPrice(price)}</p>
            {price >= FREE_DELIVERY_THRESHOLD && (
              <p className="text-[11px] font-medium text-success">Free delivery</p>
            )}
          </div>

          {onAddToCart && (
            <button
              type="button"
              onClick={() => onAddToCart(id)}
              disabled={outOfStock}
              className={cn(
                'relative flex h-10 shrink-0 items-center justify-center gap-1.5 overflow-hidden rounded-xl px-3 text-xs font-semibold transition-colors cursor-pointer disabled:cursor-not-allowed disabled:opacity-50',
                justAdded ? 'bg-success text-white' : 'bg-ink text-white hover:bg-brand'
              )}
              aria-label={outOfStock ? 'Out of stock' : `Add ${product.name} to cart`}
            >
              <AnimatePresence mode="wait" initial={false}>
                {justAdded ? (
                  <motion.span
                    key="added"
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.16 }}
                    className="flex items-center gap-1.5"
                  >
                    <Check className="h-4 w-4" strokeWidth={2.5} />
                    <span className="hidden sm:inline">Added</span>
                  </motion.span>
                ) : (
                  <motion.span
                    key="add"
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.16 }}
                    className="flex items-center gap-1.5"
                  >
                    <ShoppingBag className="h-4 w-4" strokeWidth={2.2} />
                    <span className="hidden sm:inline">Add</span>
                  </motion.span>
                )}
              </AnimatePresence>
            </button>
          )}
        </div>
      </div>
    </motion.article>
  );
});
