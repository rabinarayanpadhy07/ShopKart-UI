import React, { useEffect, useState, useCallback } from "react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/Button";
import { useCartCount } from "@/hooks/useCartCount";
import { getWishlist, removeFromWishlist, moveWishlistToCart } from "@/api/wishlist";
import { request } from "@/api/client";

export default function WishlistPage() {
  const [wishlistItems, setWishlistItems] = useState([]);
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const { cartCount } = useCartCount({ username });

  const fetchWishlist = useCallback(async () => {
    try {
      const data = await getWishlist();
      setWishlistItems(data || []);
      if (data && data.length > 0 && data[0].user) {
        setUsername(data[0].user.username);
      }
    } catch (err) {
      setError(err.message || "Failed to fetch wishlist");
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchUserInfo = useCallback(async () => {
    try {
      const data = await request("/api/users/me");
      if (data && data.username) {
        setUsername(data.username);
      }
    } catch {
      // Guest
    }
  }, []);

  useEffect(() => {
    fetchWishlist();
    fetchUserInfo();
  }, [fetchWishlist, fetchUserInfo]);

  const handleRemove = async (productId) => {
    try {
      await removeFromWishlist(productId);
      setWishlistItems(prev => prev.filter(item => item.product.productId !== productId));
    } catch (err) {
      alert(err.message || "Failed to remove item");
    }
  };

  const handleMoveToCart = async (productId) => {
    try {
      await moveWishlistToCart(productId);
      setWishlistItems(prev => prev.filter(item => item.product.productId !== productId));
    } catch (err) {
      alert(err.message || "Failed to move item to cart");
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 font-sans w-full">
      <Header cartCount={cartCount} username={username} />
      <main className="flex-grow max-w-7xl mx-auto w-full py-10 px-4 md:px-8">
        <h1 className="text-3xl font-extrabold text-slate-800 mb-6">Your Wishlist</h1>
        {loading && (
          <div className="text-center py-10 text-slate-500">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#00ABE4] mb-2"></div>
            <p>Loading wishlist...</p>
          </div>
        )}
        {error && (
          <div className="bg-red-50 text-red-600 border border-red-200 rounded-lg p-4 text-center mb-6">
            {error}
          </div>
        )}
        {!loading && !error && wishlistItems.length === 0 && (
          <div className="text-center py-20 text-slate-500 bg-white rounded-xl border border-gray-150 p-8 shadow-xs">
            <svg className="w-16 h-16 mx-auto text-slate-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
            <p className="text-lg font-semibold mb-2">Your wishlist is empty</p>
            <Button onClick={() => navigate("/")} variant="outline" size="sm">
              Discover Products
            </Button>
          </div>
        )}
        {!loading && !error && wishlistItems.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {wishlistItems.map((item) => {
              const product = item.product;
              const discountPct = product.productId % 3 === 0 ? 56 : product.productId % 2 === 0 ? 40 : 25;
              const priceVal = parseFloat(product.price);
              const originalPrice = (priceVal / (1 - discountPct / 100)).toFixed(0);
              const savedAmt = (originalPrice - priceVal).toFixed(0);
              return (
                <article
                  key={item.id}
                  className="group flex flex-col bg-white rounded-2xl border border-gray-200 overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 relative text-left"
                >
                  {/* Remove Button Overlay */}
                  <button
                    onClick={() => handleRemove(product.productId)}
                    className="absolute top-3 right-3 h-9 w-9 rounded-full bg-white/90 backdrop-blur-xs border border-gray-100 flex items-center justify-center text-slate-400 hover:text-red-500 hover:scale-110 shadow-sm z-10 transition-all cursor-pointer"
                    title="Remove from wishlist"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>

                  {/* Discount Badge Overlay */}
                  {discountPct >= 40 && (
                    <span className="absolute top-3 left-3 bg-orange-500 text-white text-[10px] font-black px-2.5 py-1 rounded-lg z-10 uppercase tracking-wider shadow-sm">
                      {discountPct}% OFF
                    </span>
                  )}

                  {/* Image Container */}
                  <div className="relative aspect-square bg-slate-50 flex items-center justify-center overflow-hidden border-b border-gray-100 p-4">
                    <img
                      src={product.imageUrl || "https://via.placeholder.com/300?text=No+Image"}
                      alt={product.name}
                      className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-500"
                      loading="lazy"
                      onError={(e) => { e.target.src = 'https://via.placeholder.com/300?text=No+Image'; }}
                    />
                  </div>

                  {/* Info Section */}
                  <div className="flex flex-col flex-1 p-4 gap-2">
                    <div className="flex justify-between items-center gap-2">
                      <span className="text-[10px] font-extrabold text-orange-500 uppercase tracking-widest">
                        {product.brand || 'Generic'}
                      </span>
                      {product.stock <= 0 && (
                        <span className="text-[10px] font-bold text-red-500 bg-red-50 border border-red-100 px-2 py-0.5 rounded-full">
                          Out of Stock
                        </span>
                      )}
                    </div>

                    <h3 className="text-sm font-bold text-slate-800 line-clamp-2 leading-relaxed min-h-[40px]">{product.name}</h3>
                    <p className="text-xs text-slate-500 line-clamp-2 min-h-[32px]">{product.description || 'No description available.'}</p>

                    <div className="mt-auto pt-2 space-y-2">
                      <div className="flex items-baseline gap-2">
                        <span className="text-xl font-black text-slate-900">₹{priceVal.toFixed(0)}</span>
                        <span className="text-xs text-slate-400 line-through">₹{originalPrice}</span>
                        <span className="text-xs font-semibold text-green-600">Save ₹{savedAmt}</span>
                      </div>

                      <Button
                        onClick={() => handleMoveToCart(product.productId)}
                        disabled={product.stock <= 0}
                        size="sm"
                        className="w-full gap-1.5 rounded-xl text-xs font-bold py-2 px-3 transition-transform active:scale-95 flex items-center justify-center"
                      >
                        Move to Cart
                      </Button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
