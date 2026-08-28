import React from 'react';
import { Heart, Star, ShoppingBag, PackageOpen } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export function ProductList({ products, onAddToCart, onAddToWishlist }) {
  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <div className="h-16 w-16 rounded-2xl bg-slate-100 flex items-center justify-center mb-4">
          <PackageOpen className="h-8 w-8 text-slate-400" strokeWidth={1.5} />
        </div>
        <p className="text-base font-semibold text-slate-700">No products found</p>
        <p className="text-sm text-slate-400 mt-1 max-w-xs">Try a different search or category</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
      {products.map((product, index) => {
        const hasImage = product.images?.length > 0;
        const imageUrl = hasImage ? product.images[0] : 'https://via.placeholder.com/300?text=No+Image';
        const discountPct = product.product_id % 3 === 0 ? 56 : product.product_id % 2 === 0 ? 40 : 25;
        const priceVal = parseFloat(product.price);
        const originalPrice = (priceVal / (1 - discountPct / 100)).toFixed(0);
        const savedAmt = (originalPrice - priceVal).toFixed(0);
        const isAboveFold = index < 4;

        return (
          <article
            key={product.product_id}
            className="group flex flex-col bg-white rounded-2xl border border-gray-150 overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 relative text-left"
          >
            {/* Wishlist Button Overlay */}
            <button
              onClick={(e) => { e.stopPropagation(); onAddToWishlist(product.product_id); }}
              className="absolute top-4 right-4 h-10 w-10 rounded-full bg-white flex items-center justify-center text-slate-400 hover:text-red-500 hover:scale-110 shadow-md z-10 transition-all cursor-pointer border border-gray-50"
              title="Add to wishlist"
            >
              <Heart className="h-5 w-5 text-red-500 fill-transparent hover:fill-red-500 transition-all" strokeWidth={1.8} />
            </button>

            {/* Bestseller Badge Overlay */}
            {(product.averageRating >= 4.0 || product.product_id % 2 === 0) && (
              <span className="absolute top-4 left-4 bg-slate-900/90 backdrop-blur-xs text-white text-[9px] font-bold px-3 py-1.5 rounded-lg z-10 uppercase tracking-widest shadow-sm">
                Bestseller
              </span>
            )}

            {/* Image Container */}
            <div className="relative aspect-square bg-slate-50 flex items-center justify-center overflow-hidden border-b border-gray-100">
              <img
                src={imageUrl}
                alt={product.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                loading={isAboveFold ? "eager" : "lazy"}
                decoding="async"
                onError={(e) => { e.target.src = 'https://via.placeholder.com/300?text=No+Image'; }}
              />
            </div>

            {/* Info Section */}
            <div className="flex flex-col flex-1 p-4 gap-1">
              {/* Brand Category Name */}
              <div>
                <span className="text-[10px] font-bold text-rose-500 uppercase tracking-widest">
                  {product.brand && product.brand.toLowerCase() !== 'generic'
                    ? product.brand
                    : product.category || 'ShopKart'}
                </span>
              </div>

              {/* Title */}
              <h3 className="text-sm sm:text-base font-bold text-slate-800 leading-snug line-clamp-2">
                {product.name}
              </h3>

              {/* Description */}
              <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                {product.description || 'Lightweight, breathable and built for performance.'}
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
              <div className="border-t border-slate-100 my-1.5" />

              {/* Price & Action */}
              <div className="mt-auto space-y-2">
                <div className="flex items-center gap-2 py-0.5">
                  <span className="text-lg font-bold text-slate-900">₹{priceVal.toFixed(0)}</span>
                  <span className="text-xs text-slate-400 line-through">₹{originalPrice}</span>
                  <span className="bg-emerald-50 text-emerald-700 text-[10px] font-semibold px-2 py-0.5 rounded-full border border-emerald-100/50">
                    Save ₹{savedAmt}
                  </span>
                </div>

                <Button
                  onClick={() => onAddToCart(product.product_id)}
                  disabled={product.stock <= 0}
                  className="w-full gap-2 rounded-xl text-sm font-semibold py-2.5 px-4 transition-all hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center h-11 bg-brand text-white hover:bg-brand-hover"
                >
                  <ShoppingBag className="h-4 w-4" strokeWidth={2.2} />
                  {product.stock <= 0 ? 'Out of Stock' : 'Add to Cart'}
                </Button>
              </div>
            </div>
          </article>
        );
      })}
    </div>
  );
}
