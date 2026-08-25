import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Truck, ShieldCheck, RotateCcw, Zap } from 'lucide-react';
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
    image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?q=80&w=600&auto=format&fit=crop',
    accent: 'from-orange-500/10 to-amber-50',
  },
  {
    tag: 'Trending Now',
    title: 'Style that speaks',
    subtitle: 'Fresh fashion picks curated just for you',
    cta: 'Shop Fashion',
    category: 'Shirts',
    image: 'https://images.unsplash.com/photo-1445205170230-053b83016050?q=80&w=600&auto=format&fit=crop',
    accent: 'from-rose-500/10 to-pink-50',
  },
  {
    tag: 'Limited Offer',
    title: 'Smart wearables',
    subtitle: 'Up to 60% off on watches & accessories',
    cta: 'Shop Now',
    category: 'Accessories',
    image: 'https://images.unsplash.com/photo-1542496658-e33a6d0d50f6?q=80&w=600&auto=format&fit=crop',
    accent: 'from-blue-500/10 to-sky-50',
  },
];

export default function CustomerHomePage() {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [username, setUsername] = useState('Guest');
  const { cartCount, loading: isCartLoading, refresh: fetchCartCount } = useCartCount();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [activeSlide, setActiveSlide] = useState(0);

  const fetchProducts = async (overrides = {}) => {
    const search = overrides.search ?? searchQuery;
    const category = overrides.category ?? selectedCategory;
    const page = overrides.page ?? currentPage;
    try {
      const params = { page: String(page), size: '24' };
      if (search) params.search = search;
      if (category) params.category = category;
      const data = await getProducts(params);
      setUsername(data.user?.name || 'Guest');
      setProducts(data.products || []);
      setTotalPages(data.totalPages || 1);
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  useEffect(() => { fetchProducts(); }, [selectedCategory, currentPage]);
  useEffect(() => {
    const t = setInterval(() => setActiveSlide(p => (p + 1) % HERO_SLIDES.length), 6000);
    return () => clearInterval(t);
  }, []);

  const handleSearch = (q) => {
    setSearchQuery(q);
    setSelectedCategory('');
    setCurrentPage(0);
    fetchProducts({ search: q, category: '', page: 0 });
  };

  const handleCategoryClick = (category) => {
    const next = category === 'All' ? '' : category;
    setSelectedCategory(next);
    setSearchQuery('');
    setCurrentPage(0);
  };

  const handleAddToCart = async (productId) => {
    if (username === 'Guest') { alert('Please sign in to add items to cart'); navigate('/login'); return; }
    try {
      await addToCart(productId);
      fetchCartCount();
    } catch (e) { console.error(e); }
  };

  const handleAddToWishlist = async (productId) => {
    if (username === 'Guest') { alert('Please sign in to use wishlist'); navigate('/login'); return; }
    try {
      await addToWishlist(productId);
      alert('Added to wishlist!');
    } catch (e) {
      alert(e.message || 'Failed');
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
                    className={`h-1.5 rounded-full transition-all ${i === activeSlide ? 'w-8 bg-brand' : 'w-1.5 bg-border hover:bg-brand-muted'}`}
                  />
                ))}
              </div>
            </div>
            <div className="relative hidden md:flex items-center justify-center p-8">
              <img src={slide.image} alt="" className="max-h-56 object-contain drop-shadow-xl rounded-2xl" />
            </div>
          </div>
          <button onClick={() => setActiveSlide(p => (p - 1 + HERO_SLIDES.length) % HERO_SLIDES.length)} className="absolute left-3 top-1/2 -translate-y-1/2 h-9 w-9 rounded-full bg-surface/80 border border-border flex items-center justify-center hover:bg-surface cursor-pointer shadow-sm">
            <ChevronLeft className="h-4 w-4" strokeWidth={2.5} />
          </button>
          <button onClick={() => setActiveSlide(p => (p + 1) % HERO_SLIDES.length)} className="absolute right-3 top-1/2 -translate-y-1/2 h-9 w-9 rounded-full bg-surface/80 border border-border flex items-center justify-center hover:bg-surface cursor-pointer shadow-sm">
            <ChevronRight className="h-4 w-4" strokeWidth={2.5} />
          </button>
        </section>

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

        <section>
          <div className="flex items-baseline justify-between mb-5">
            <div>
              <h2 className="text-lg font-bold text-ink">
                {searchQuery ? `Results for “${searchQuery}”` : (selectedCategory || 'All Products')}
              </h2>
              <p className="text-sm text-ink-muted mt-0.5">{products.length} products shown</p>
            </div>
          </div>

          <ProductList products={products} onAddToCart={handleAddToCart} onAddToWishlist={handleAddToWishlist} />

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-3 mt-8 pt-6 border-t border-border">
              <Button variant="outline" size="sm" disabled={currentPage === 0} onClick={() => setCurrentPage(p => p - 1)}>
                <ChevronLeft className="h-4 w-4" /> Prev
              </Button>
              <span className="text-sm text-ink-muted font-medium">{currentPage + 1} / {totalPages}</span>
              <Button variant="outline" size="sm" disabled={currentPage >= totalPages - 1} onClick={() => setCurrentPage(p => p + 1)}>
                Next <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </section>
    </StoreLayout>
  );
}
