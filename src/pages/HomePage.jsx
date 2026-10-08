import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Truck, ShieldCheck, RotateCcw, BadgeCheck, AlertCircle, X } from 'lucide-react';
import { CategoryNavigation } from '@/components/layout/CategoryNavigation';
import { ProductList, ProductGridSkeleton } from '@/components/products/ProductList';
import { HeroSection } from '@/components/home/HeroSection';
import { StoreLayout } from '@/components/layout/StoreLayout';
import { Button } from '@/components/ui/Button';
import { getProducts } from '@/api/products';
import { addToCart } from '@/api/cart';
import { addToWishlist } from '@/api/wishlist';
import { useCartCount } from '@/hooks/useCartCount';
import { useToast } from '@/components/ui/Toast';
import { cn } from '@/lib/utils';

const PAGE_SIZE = 12;

const PERKS = [
  { Icon: Truck, label: 'Free delivery', sub: 'On orders above ₹499' },
  { Icon: BadgeCheck, label: 'Genuine brands', sub: 'Sourced from authorised sellers' },
  { Icon: RotateCcw, label: '7-day returns', sub: 'No-questions-asked' },
  { Icon: ShieldCheck, label: 'Secure payments', sub: 'UPI, cards & netbanking' },
];

const SORTS = {
  featured: { label: 'Featured', sortBy: 'productId', sortDir: 'asc' },
  newest: { label: 'Newest', sortBy: 'createdAt', sortDir: 'desc' },
  'price-asc': { label: 'Price: low to high', sortBy: 'price', sortDir: 'asc' },
  'price-desc': { label: 'Price: high to low', sortBy: 'price', sortDir: 'desc' },
  rating: { label: 'Top rated', sortBy: 'averageRating', sortDir: 'desc' },
};

function Pagination({ page, totalPages, onChange }) {
  if (totalPages <= 1) return null;
  const pages = [];
  for (let i = 0; i < totalPages; i++) {
    if (i === 0 || i === totalPages - 1 || Math.abs(i - page) <= 1) pages.push(i);
    else if (pages[pages.length - 1] !== '…') pages.push('…');
  }
  return (
    <nav className="mt-10 flex items-center justify-center gap-1.5" aria-label="Pagination">
      <Button variant="outline" size="sm" disabled={page === 0} onClick={() => onChange(page - 1)} aria-label="Previous page" className="px-3">
        <ChevronLeft className="h-4 w-4" />
      </Button>
      {pages.map((p, i) =>
        p === '…' ? (
          <span key={`gap-${i}`} className="px-1.5 text-sm text-ink-muted">…</span>
        ) : (
          <button
            key={p}
            type="button"
            onClick={() => onChange(p)}
            aria-current={p === page ? 'page' : undefined}
            className={cn(
              'h-9 min-w-9 rounded-xl px-3 text-sm font-semibold transition-colors cursor-pointer',
              p === page ? 'bg-ink text-white' : 'text-ink-muted hover:bg-muted-bg hover:text-ink'
            )}
          >
            {p + 1}
          </button>
        )
      )}
      <Button variant="outline" size="sm" disabled={page >= totalPages - 1} onClick={() => onChange(page + 1)} aria-label="Next page" className="px-3">
        <ChevronRight className="h-4 w-4" />
      </Button>
    </nav>
  );
}

export default function CustomerHomePage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // URL is the source of truth so search/category links from any page, refreshes and
  // the back button all work.
  const searchQuery = searchParams.get('search') || '';
  const selectedCategory = searchParams.get('category') || '';
  const sortKey = SORTS[searchParams.get('sort')] ? searchParams.get('sort') : 'featured';
  const inStockOnly = searchParams.get('inStock') === '1';
  const currentPage = Math.max(0, parseInt(searchParams.get('page') || '0', 10) || 0);

  const [products, setProducts] = useState([]);
  const [username, setUsername] = useState('Guest');
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reloadKey, setReloadKey] = useState(0);

  const isAuth = Boolean(username && username !== 'Guest');
  const { cartCount, loading: isCartLoading } = useCartCount({ enabled: isAuth, username });
  const toast = useToast();

  const updateParams = useCallback((changes, { resetPage = true } = {}) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      for (const [k, v] of Object.entries(changes)) {
        if (v === '' || v === null || v === undefined || v === false) next.delete(k);
        else next.set(k, String(v));
      }
      if (resetPage) next.delete('page');
      return next;
    });
  }, [setSearchParams]);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError(null);

    const { sortBy, sortDir } = SORTS[sortKey];
    const params = { page: String(currentPage), size: String(PAGE_SIZE), sortBy, sortDir };
    if (searchQuery) params.search = searchQuery;
    if (selectedCategory) params.category = selectedCategory;
    if (inStockOnly) params.inStock = 'true';

    getProducts(params, { signal: controller.signal })
      .then((data) => {
        setUsername(data.user?.name || 'Guest');
        setProducts(data.products || []);
        setTotalPages(data.totalPages || 1);
        setTotalItems(data.totalItems || 0);
        setLoading(false);
      })
      .catch((err) => {
        if (err.name === 'AbortError' || controller.signal.aborted) return;
        console.error('Error fetching products:', err);
        setError(err.message || 'Failed to load products');
        setLoading(false);
      });

    return () => controller.abort();
  }, [searchQuery, selectedCategory, sortKey, inStockOnly, currentPage, reloadKey]);

  const handleSearch = useCallback((q) => updateParams({ search: q, category: '' }), [updateParams]);
  const handleCategoryClick = useCallback(
    (category) => updateParams({ category: category === 'All' ? '' : category, search: '' }),
    [updateParams]
  );

  const goToPage = (p) => {
    updateParams({ page: p || '' }, { resetPage: false });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleAddToCart = async (productId) => {
    if (!isAuth) {
      toast.info('Please sign in to add items to cart');
      navigate('/login');
      return false;
    }
    try {
      await addToCart(productId);
      toast.success('Added to cart.');
      return true;
    } catch (e) {
      toast.error(e.message || 'Failed to add to cart');
      return false;
    }
  };

  const handleAddToWishlist = async (productId) => {
    if (!isAuth) {
      toast.info('Please sign in to use wishlist');
      navigate('/login');
      return;
    }
    try {
      await addToWishlist(productId);
      toast.success('Added to wishlist!');
    } catch (e) {
      toast.error(e.message || 'Failed to add to wishlist');
    }
  };

  const isBrowsing = !searchQuery && !selectedCategory;
  const title = searchQuery ? `Results for “${searchQuery}”` : selectedCategory || 'All products';
  const firstItem = totalItems === 0 ? 0 : currentPage * PAGE_SIZE + 1;
  const lastItem = Math.min(totalItems, (currentPage + 1) * PAGE_SIZE);

  return (
    <StoreLayout
      cartCount={isCartLoading ? 0 : cartCount}
      username={username}
      onSearch={handleSearch}
      initialSearch={searchQuery}
      categoryNav={<CategoryNavigation onCategoryClick={handleCategoryClick} activeCategory={selectedCategory || 'All'} />}
      mainClassName="flex-1 max-w-7xl mx-auto w-full px-4 md:px-6 py-6 md:py-8 space-y-8 md:space-y-10"
    >
      {isBrowsing && currentPage === 0 && (
        <>
          <HeroSection onSelectCategory={handleCategoryClick} />
          <section className="grid grid-cols-2 divide-border rounded-2xl border border-border bg-surface md:grid-cols-4 md:divide-x">
            {PERKS.map(({ Icon, label, sub }) => (
              <div key={label} className="flex items-center gap-3 p-4">
                <Icon className="h-5 w-5 shrink-0 text-brand" strokeWidth={2} />
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-ink">{label}</p>
                  <p className="truncate text-xs text-ink-muted">{sub}</p>
                </div>
              </div>
            ))}
          </section>
        </>
      )}

      <section aria-labelledby="products-heading">
        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div className="min-w-0">
            <h2 id="products-heading" className="truncate text-xl font-bold text-ink md:text-2xl">{title}</h2>
            <p className="mt-0.5 text-sm text-ink-muted">
              {loading ? 'Loading…' : totalItems === 0 ? 'No items' : `Showing ${firstItem}–${lastItem} of ${totalItems}`}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {(searchQuery || selectedCategory) && (
              <button
                type="button"
                onClick={() => updateParams({ search: '', category: '' })}
                className="inline-flex items-center gap-1 rounded-full border border-border bg-surface px-3 py-1.5 text-xs font-medium text-ink-muted hover:text-ink cursor-pointer"
              >
                Clear <X className="h-3.5 w-3.5" />
              </button>
            )}
            <label className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-3 py-1.5 text-xs font-medium text-ink cursor-pointer select-none">
              <input
                type="checkbox"
                checked={inStockOnly}
                onChange={(e) => updateParams({ inStock: e.target.checked ? '1' : '' })}
                className="h-3.5 w-3.5 accent-brand"
              />
              In stock only
            </label>
            <select
              value={sortKey}
              onChange={(e) => updateParams({ sort: e.target.value === 'featured' ? '' : e.target.value })}
              className="h-8 rounded-full border border-border bg-surface px-3 text-xs font-medium text-ink focus:outline-none focus:ring-2 focus:ring-brand/20 cursor-pointer"
              aria-label="Sort products"
            >
              {Object.entries(SORTS).map(([key, s]) => (
                <option key={key} value={key}>{s.label}</option>
              ))}
            </select>
          </div>
        </div>

        {error ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-red-100 bg-red-50/50 p-6 py-16 text-center">
            <AlertCircle className="mb-2 h-10 w-10 text-danger" />
            <p className="text-base font-semibold text-red-800">{error}</p>
            <Button variant="outline" size="sm" onClick={() => setReloadKey((k) => k + 1)} className="mt-4">
              Retry
            </Button>
          </div>
        ) : loading ? (
          <ProductGridSkeleton />
        ) : (
          <ProductList products={products} onAddToCart={handleAddToCart} onAddToWishlist={handleAddToWishlist} />
        )}

        {!loading && !error && <Pagination page={currentPage} totalPages={totalPages} onChange={goToPage} />}
      </section>
    </StoreLayout>
  );
}
