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
            </div>https://github.com/rabinarayanpadhy07/ShopKart-UI/pull/7/conflict?name=src%252Fcomponents%252Fproducts%252FProductList.jsx&ancestor_oid=e36381798f194a917ad182abc68d7e115bc46fda&base_oid=2931bc01eb58cd1abeef3281a60981400291c594&head_oid=5195bdc0743d9d60c578e17a5459198e16355194
          </div>
        </div>
      ))}
    </div>
  );
}

export const ProductList = React.memo(function ProductList({ products, onAddToCart, onAddToWishlist, emptyHint }) {
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Star, ShoppingBag, PackageOpen, Check, Eye, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { IMAGE_FALLBACK } from '@/lib/placeholder';
import { getProductImage } from '@/lib/productImages';

export const ProductList = React.memo(function ProductList({ products, onAddToCart, onAddToWishlist }) {
  const navigate = useNavigate();
  const [justAdded, setJustAdded] = useState(null);

  const handleAddToCart = async (e, productId) => {
    e.stopPropagation();
    const success = await onAddToCart(productId);
    if (success === false) return;
    setJustAdded(productId);
    window.dispatchEvent(new CustomEvent('cart:bump'));
    window.setTimeout(() => setJustAdded((current) => (current === productId ? null : current)), 1400);
  };

  const handleWishlistClick = (e, productId) => {
    e.stopPropagation();
    onAddToWishlist(productId);
  };

  const handleCardClick = (productId) => {
    navigate(`/products/${productId}`);
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

    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
      {products.map((product, index) => {
        // Resolve verified, authentic product photography
        const imageUrl = getProductImage(product);
        const discountPct = product.product_id % 3 === 0 ? 56 : product.product_id % 2 === 0 ? 40 : 25;
        const priceVal = parseFloat(product.price);
        const originalPrice = (priceVal / (1 - discountPct / 100)).toFixed(0);
        const savedAmt = (originalPrice - priceVal).toFixed(0);
        const isAboveFold = index < 4;

        return (
          <motion.article
            key={product.product_id}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: Math.min(index, 8) * 0.04, ease: 'easeOut' }}
            onClick={() => handleCardClick(product.product_id)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                handleCardClick(product.product_id);
              }
            }}
            className="group flex flex-col bg-white rounded-2xl border border-gray-150 overflow-hidden hover:shadow-2xl hover:-translate-y-1.5 transition-all duration-300 relative text-left cursor-pointer focus:outline-none focus:ring-2 focus:ring-brand/30"
          >
            {/* Wishlist Button Overlay */}
            <button
              onClick={(e) => handleWishlistClick(e, product.product_id)}
              className="absolute top-3.5 right-3.5 h-9 w-9 rounded-full bg-white/95 backdrop-blur-xs flex items-center justify-center text-slate-400 hover:text-red-500 hover:scale-110 shadow-md z-10 transition-all cursor-pointer border border-gray-100"
              title="Add to wishlist"
              aria-label="Add to wishlist"
            >
              <Heart className="h-4.5 w-4.5 text-red-500 fill-transparent hover:fill-red-500 transition-all" strokeWidth={2} />
            </button>

            {/* Bestseller Badge Overlay */}
            {(product.averageRating >= 4.0 || product.product_id % 2 === 0) ? (
              <span className="absolute top-3.5 left-3.5 bg-slate-900/90 backdrop-blur-xs text-white text-[9px] font-bold px-2.5 py-1 rounded-lg z-10 uppercase tracking-widest shadow-sm flex items-center gap-1">
                <Sparkles className="h-2.5 w-2.5 text-amber-400" /> Bestseller
              </span>
            ) : (
              <span className="absolute top-3.5 left-3.5 bg-brand text-white text-[9px] font-extrabold px-2 py-0.5 rounded-lg z-10 uppercase tracking-wider shadow-sm">
                {discountPct}% OFF
              </span>
            )}

            {/* Image Container with Hover Zoom & Quick View */}
            <div className="relative aspect-square bg-slate-50/70 flex items-center justify-center overflow-hidden border-b border-gray-100 p-4">
              <img
                src={imageUrl}
                alt={product.name}
                className="w-full h-full object-contain group-hover:scale-108 transition-transform duration-500 ease-out"
                loading={isAboveFold ? "eager" : "lazy"}
                decoding="async"
                onError={(e) => { e.target.src = IMAGE_FALLBACK; }}
              />

              {/* View Product Details Hint Overlay */}
              <div className="absolute inset-x-0 bottom-3 flex justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                <span className="bg-slate-900/85 backdrop-blur-sm text-white text-xs font-semibold px-3 py-1.5 rounded-full shadow-lg flex items-center gap-1.5 transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                  <Eye className="h-3.5 w-3.5" /> View Details
                </span>
              </div>
            </div>

            {/* Info Section */}
            <div className="flex flex-col flex-1 p-4 gap-1.5">
              {/* Brand Category Name */}
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-brand uppercase tracking-widest">
                  {product.brand && product.brand.toLowerCase() !== 'generic'
                    ? product.brand
                    : product.category || 'ShopKart'}
                </span>
                {product.stock <= 5 && product.stock > 0 && (
                  <span className="text-[9px] font-bold text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded-sm">
                    Only {product.stock} left
                  </span>
                )}
              </div>

              {/* Title */}
              <h3 className="text-sm sm:text-base font-bold text-slate-800 leading-snug line-clamp-2 group-hover:text-brand transition-colors">
                {product.name}
              </h3>

              {/* Description */}
              <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                {product.description || 'Quality you can trust, backed by our 7-day easy returns.'}
              </p>

              {/* Rating and Reviews */}
              <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-0.5">
                <div className="flex items-center gap-0.5 font-bold text-slate-700">
                  <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                  <span>{product.averageRating ? product.averageRating.toFixed(1) : '4.6'}</span>
                </div>
                <span className="text-slate-200">|</span>
                <span>{product.totalReviews || (product.product_id * 11 % 150) || 128} reviews</span>
              </div>

              {/* Divider */}
              <div className="border-t border-slate-100 my-1" />

              {/* Price & Action */}
              <div className="mt-auto space-y-2.5">
                <div className="flex items-center gap-2 py-0.5">
                  <span className="text-lg font-bold text-slate-900">₹{priceVal.toFixed(0)}</span>
                  <span className="text-xs text-slate-400 line-through">₹{originalPrice}</span>
                  <span className="bg-emerald-50 text-emerald-700 text-[10px] font-semibold px-2 py-0.5 rounded-full border border-emerald-100/50">
                    Save ₹{savedAmt}
                  </span>
                </div>

                <Button
                  onClick={(e) => handleAddToCart(e, product.product_id)}
                  disabled={product.stock <= 0}
                  className={`w-full gap-2 rounded-xl text-sm font-semibold py-2.5 px-4 transition-all hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center h-11 overflow-hidden cursor-pointer ${
                    justAdded === product.product_id
                      ? 'bg-success text-white'
                      : 'bg-brand text-white hover:bg-brand-hover'
                  }`}
                >
                  <AnimatePresence mode="wait" initial={false}>
                    {justAdded === product.product_id ? (
                      <motion.span
                        key="added"
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -6 }}
                        transition={{ duration: 0.18 }}
                        className="flex items-center justify-center gap-2"
                      >
                        <motion.span
                          initial={{ scale: 0.5, rotate: -20 }}
                          animate={{ scale: 1, rotate: 0 }}
                          transition={{ type: 'spring', stiffness: 500, damping: 20 }}
                        >
                          <Check className="h-4 w-4" strokeWidth={2.5} />
                        </motion.span>
                        Added to Cart
                      </motion.span>
                    ) : (
                      <motion.span
                        key="default"
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -6 }}
                        transition={{ duration: 0.18 }}
                        className="flex items-center justify-center gap-2"
                      >
                        <ShoppingBag className="h-4 w-4" strokeWidth={2.2} />
                        {product.stock <= 0 ? 'Out of Stock' : 'Add to Cart'}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </Button>
              </div>
            </div>
          </motion.article>
        );
      })}

    </div>
  );
});
