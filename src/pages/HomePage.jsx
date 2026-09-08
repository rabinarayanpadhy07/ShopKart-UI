import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Truck, ShieldCheck, RotateCcw, Zap, AlertCircle } from 'lucide-react';
import { CategoryNavigation } from '@/components/layout/CategoryNavigation';
import { ProductList } from '@/components/products/ProductList';
import { StoreLayout } from '@/components/layout/StoreLayout';
import { Button } from '@/components/ui/Button';
import { getProducts } from '@/api/products';
import { addToCart } from '@/api/cart';
import { addToWishlist } from '@/api/wishlist';
import { useCartCount } from '@/hooks/useCartCount';

const TRUST_BADGES = [
  { Icon: Truck, label: 'Free Delivery', sub: 'On orders ₹499+' },
  { Icon: ShieldCheck, label: 'Secure Payment', sub: '100% protected' },
  { Icon: RotateCcw, label: 'Easy Returns', sub: '7-day policy' },
  { Icon: Zap, label: 'Fast Shipping', sub: '2–3 business days' },
];

const HERO_SLIDES = [
  {
    tag: 'New Arrivals',
    title: 'Upgrade your tech',
    subtitle: 'Latest smartphones & gadgets at unbeatable prices',
    cta: 'Shop Electronics',
    category: 'Mobiles',
    image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?q=80&w=400&auto=format&fit=crop',
    accent: 'from-orange-500/10 to-amber-50',
  },
  {
    tag: 'Trending Now',
    title: 'Style that speaks',
    subtitle: 'Fresh fashion picks curated just for you',
    cta: 'Shop Fashion',
    category: 'Shirts',
    image: 'https://images.unsplash.com/photo-1445205170230-053b83016050?q=80&w=400&auto=format&fit=crop',
    accent: 'from-rose-500/10 to-pink-50',
  },
  {
    tag: 'Limited Offer',
    title: 'Smart wearables',
    subtitle: 'Up to 60% off on watches & accessories',
    cta: 'Shop Now',
    category: 'Accessories',
    image: 'https://images.unsplash.com/photo-1542496658-e33a6d0d50f6?q=80&w=400&auto=format&fit=crop',
    accent: 'from-blue-500/10 to-sky-50',
  },
];

function ProductSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6 animate-pulse">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="bg-white rounded-2xl border border-gray-150 p-4 space-y-3">
          <div className="aspect-square bg-slate-100 rounded-xl" />
          <div className="h-4 bg-slate-100 rounded w-3/4" />
          <div className="h-3 bg-slate-100 rounded w-1/2" />
          <div className="h-8 bg-slate-100 rounded mt-4" />
        </div>
      ))}
    </div>
  );
}

export default function CustomerHomePage() {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [username, setUsername] = useState('Guest');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [activeSlide, setActiveSlide] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Authentication-aware: do not request cart count for guests
  const isAuth = Boolean(username && username !== 'Guest');
  const { cartCount, loading: isCartLoading } = useCartCount({ enabled: isAuth, username });

  // Unified single-request pipeline with AbortController for stale cancellation
  useEffect(() => {
    const controller = new AbortController();
    let isMounted = true;

    const fetchProducts = async () => {
      setLoading(true);
      setError(null);
      try {
        const params = { page: String(currentPage), size: '12' };
        if (searchQuery) params.search = searchQuery;
        if (selectedCategory && selectedCategory !== 'All') params.category = selectedCategory;

        const data = await getProducts(params, { signal: controller.signal });
        if (!isMounted) return;

        setUsername(data.user?.name || 'Guest');
        setProducts(data.products || []);
        setTotalPages(data.totalPages || 1);
      } catch (err) {
        if (err.name === 'AbortError' || controller.signal.aborted) {
          return;
        }
        console.error('Error fetching products:', err);
        if (isMounted) {
          setError(err.message || 'Failed to load products');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchProducts();

    return () => {
      isMounted = false;
      controller.abort();
    };
  }, [searchQuery, selectedCategory, currentPage]);

  // Hero carousel auto-rotate timer
  useEffect(() => {
    const t = setInterval(() => setActiveSlide(p => (p + 1) % HERO_SLIDES.length), 6000);
    return () => clearInterval(t);
  }, []);

  // Single-action handlers: batch state updates so only ONE network request fires
  const handleSearch = useCallback((q) => {
    setSelectedCategory('');
    setCurrentPage(0);
    setSearchQuery(q);
  }, []);

  const handleCategoryClick = useCallback((category) => {
    const next = category === 'All' ? '' : category;
    setSearchQuery('');
    setCurrentPage(0);
    setSelectedCategory(next);
  }, []);

  const handleAddToCart = async (productId) => {
    if (!isAuth) {
      alert('Please sign in to add items to cart');
      navigate('/login');
      return;
    }
    try {
      await addToCart(productId);
    } catch (e) {
      console.error('Error adding to cart:', e);
    }
  };

  const handleAddToWishlist = async (productId) => {
    if (!isAuth) {
      alert('Please sign in to use wishlist');
      navigate('/login');
      return;
    }
    try {
      await addToWishlist(productId);
      alert('Added to wishlist!');
    } catch (e) {
      alert(e.message || 'Failed to add to wishlist');
    }
  };

  const slide = HERO_SLIDES[activeSlide];

  return (
    <StoreLayout
      cartCount={isCartLoading ? 0 : cartCount}
      username={username}
      onSearch={handleSearch}
      initialSearch={searchQuery}
      categoryNav={
        <CategoryNavigation onCategoryClick={handleCategoryClick} activeCategory={selectedCategory || 'All'} />
      }
      mainClassName="flex-1 max-w-7xl mx-auto w-full px-4 md:px-6 pt-10 pb-6 md:pt-14 md:pb-8 space-y-10"
    >
      {/* Hero Banner with optimized image priority */}
      <section className={`relative rounded-2xl overflow-hidden bg-gradient-to-br ${slide.accent} border border-border`}>
        <div className="grid md:grid-cols-2 items-center min-h-[220px] md:min-h-[300px]">
          <div className="p-6 md:p-10 space-y-4 z-10">
            <span className="inline-block text-xs font-semibold text-brand bg-brand-light px-3 py-1 rounded-full">
              {slide.tag}
            </span>
            <h1 className="text-3xl md:text-4xl font-extrabold text-ink leading-tight tracking-tight">
              {slide.title}
            </h1>
            <p className="text-sm md:text-base text-ink-muted max-w-sm leading-relaxed">{slide.subtitle}</p>
            <Button
              onClick={() => { setSelectedCategory(slide.category); setCurrentPage(0); }}
              className="rounded-xl px-6"
            >
              {slide.cta}
            </Button>
            <div className="flex gap-2 pt-2">
              {HERO_SLIDES.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setActiveSlide(i)}
                  className={`h-1.5 rounded-full transition-all cursor-pointer ${i === activeSlide ? 'w-8 bg-brand' : 'w-1.5 bg-border hover:bg-brand-muted'}`}
                  aria-label={`Slide ${i + 1}`}
                />
              ))}
            </div>
          </div>
          <div className="relative hidden md:flex items-center justify-center p-8">
            <img
              src={slide.image}
              alt=""
              className="max-h-56 object-contain drop-shadow-xl rounded-2xl"
              loading={activeSlide === 0 ? "eager" : "lazy"}
              fetchPriority={activeSlide === 0 ? "high" : "auto"}
              decoding="async"
              width="400"
              height="224"
            />
          </div>
        </div>
        <button
          onClick={() => setActiveSlide(p => (p - 1 + HERO_SLIDES.length) % HERO_SLIDES.length)}
          className="absolute left-3 top-1/2 -translate-y-1/2 h-9 w-9 rounded-full bg-surface/80 border border-border flex items-center justify-center hover:bg-surface cursor-pointer shadow-sm"
          aria-label="Previous Slide"
        >
          <ChevronLeft className="h-4 w-4" strokeWidth={2.5} />
        </button>
        <button
          onClick={() => setActiveSlide(p => (p + 1) % HERO_SLIDES.length)}
          className="absolute right-3 top-1/2 -translate-y-1/2 h-9 w-9 rounded-full bg-surface/80 border border-border flex items-center justify-center hover:bg-surface cursor-pointer shadow-sm"
          aria-label="Next Slide"
        >
          <ChevronRight className="h-4 w-4" strokeWidth={2.5} />
        </button>
      </section>

      {/* Trust Badges */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {TRUST_BADGES.map(({ Icon, label, sub }) => (
          <div key={label} className="flex items-center gap-3 bg-surface rounded-xl border border-border p-4">
            <div className="h-10 w-10 rounded-xl bg-brand-light flex items-center justify-center shrink-0">
              <Icon className="h-5 w-5 text-brand" strokeWidth={2} />
            </div>
            <div>
              <p className="text-sm font-semibold text-ink">{label}</p>
              <p className="text-[11px] text-ink-muted">{sub}</p>
            </div>
          </div>
        ))}
      </section>

      {/* Products Grid Section */}
      <section>
        <div className="flex items-baseline justify-between mb-5">
          <div>
            <h2 className="text-lg font-bold text-ink">
              {searchQuery ? `Results for “${searchQuery}”` : (selectedCategory || 'All Products')}
            </h2>
            <p className="text-sm text-ink-muted mt-0.5">
              {loading ? 'Loading products...' : `${products.length} products shown`}
            </p>
          </div>
        </div>

        {error ? (
          <div className="flex flex-col items-center justify-center py-16 text-center border border-red-100 rounded-2xl bg-red-50/50 p-6">
            <AlertCircle className="h-10 w-10 text-red-500 mb-2" />
            <p className="text-base font-semibold text-red-800">{error}</p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setLoading(true);
                setError(null);
                getProducts({ page: String(currentPage), size: '12', search: searchQuery, category: selectedCategory })
                  .then(data => {
                    setProducts(data.products || []);
                    setTotalPages(data.totalPages || 1);
                  })
                  .catch(e => setError(e.message || 'Retry failed'))
                  .finally(() => setLoading(false));
              }}
              className="mt-4"
            >
              Retry
            </Button>
          </div>
        ) : loading ? (
          <ProductSkeleton />
        ) : (
          <ProductList products={products} onAddToCart={handleAddToCart} onAddToWishlist={handleAddToWishlist} />
        )}

        {totalPages > 1 && !loading && (
          <div className="flex items-center justify-center gap-3 mt-8 pt-6 border-t border-border">
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage === 0}
              onClick={() => setCurrentPage(p => p - 1)}
            >
              <ChevronLeft className="h-4 w-4" /> Prev
            </Button>
            <span className="text-sm text-ink-muted font-medium">{currentPage + 1} / {totalPages}</span>
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage >= totalPages - 1}
              onClick={() => setCurrentPage(p => p + 1)}
            >
              Next <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        )}
      </section>
    </StoreLayout>
  );
}
