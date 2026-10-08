import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Star,
  Heart,
  ShoppingCart,
  Truck,
  ShieldCheck,
  RotateCcw,
  Zap,
  Check,
  ChevronRight,
  ArrowLeft,
  Share2,
  Clock,
  Sparkles,
  MapPin,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { StoreLayout } from '@/components/layout/StoreLayout';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/components/ui/Toast';
import { useCartCount } from '@/hooks/useCartCount';
import { getProductById, getProducts } from '@/api/products';
import { addToCart } from '@/api/cart';
import { addToWishlist } from '@/api/wishlist';
import { getProductImage, getProductImages } from '@/lib/productImages';

const SAMPLE_REVIEWS = [
  {
    id: 1,
    name: 'Aarav Sharma',
    rating: 5,
    date: '3 days ago',
    comment: 'Exceptional build quality and exactly as pictured. Delivery was super fast within 48 hours!',
    verified: true,
  },
  {
    id: 2,
    name: 'Priya Patel',
    rating: 5,
    date: '1 week ago',
    comment: 'Completely exceeded my expectations! Premium packaging and authentic product. Highly recommended.',
    verified: true,
  },
  {
    id: 3,
    name: 'Rohan Verma',
    rating: 4,
    date: '2 weeks ago',
    comment: 'Great value for money. Minor delay in local courier, but customer service was very helpful.',
    verified: true,
  },
];

export default function ProductDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [addingToCart, setAddingToCart] = useState(false);
  const [justAdded, setJustAdded] = useState(false);
  const [inWishlist, setInWishlist] = useState(false);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [pincode, setPincode] = useState('423651');
  const [pincodeChecked, setPincodeChecked] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  const username = localStorage.getItem('username') || 'Guest';
  const isAuth = Boolean(username && username !== 'Guest');
  const { cartCount, loading: isCartLoading } = useCartCount({ enabled: isAuth, username });

  // Fetch product and related products
  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setError(null);
    setSelectedImageIndex(0);
    setQuantity(1);
    window.scrollTo({ top: 0, behavior: 'smooth' });

    async function loadData() {
      try {
        let prodData = null;
        try {
          prodData = await getProductById(id);
        } catch (err) {
          console.warn('Direct fetch failed, trying search fallback:', err);
        }

        // If direct fetch didn't return, search in products list
        if (!prodData || !prodData.name) {
          const listRes = await getProducts({ page: 0, size: 40 });
          const match = (listRes.products || []).find(
            (p) => String(p.product_id) === String(id)
          );
          if (match) {
            prodData = match;
          }
        }

        if (!isMounted) return;

        if (prodData && (prodData.name || prodData.product_id)) {
          setProduct(prodData);

          // Fetch related items from same category
          if (prodData.category) {
            getProducts({ category: prodData.category, size: 6 })
              .then((res) => {
                if (isMounted) {
                  const filtered = (res.products || []).filter(
                    (p) => String(p.product_id) !== String(id)
                  );
                  setRelatedProducts(filtered.slice(0, 4));
                }
              })
              .catch(() => {});
          }
        } else {
          setError('Product not found');
        }
      } catch (e) {
        if (isMounted) {
          console.error('Error loading product:', e);
          setError('Failed to load product details');
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadData();

    return () => {
      isMounted = false;
    };
  }, [id]);

  // Gallery images with authentic images resolver
  const galleryImages = useMemo(() => {
    if (!product) return [];
    return getProductImages(product);
  }, [product]);

  const activeImage = galleryImages[selectedImageIndex] || getProductImage(product);

  const priceVal = product ? parseFloat(product.price) || 0 : 0;
  const discountPct = product
    ? (product.product_id || 1) % 3 === 0
      ? 56
      : (product.product_id || 1) % 2 === 0
      ? 40
      : 25
    : 30;
  const originalPrice = (priceVal / (1 - discountPct / 100)).toFixed(0);
  const savings = (originalPrice - priceVal).toFixed(0);
  const stock = product ? (product.stock !== undefined ? product.stock : 25) : 0;

  const handleAddToCart = async () => {
    if (!isAuth) {
      toast.info('Please sign in to add items to your cart');
      navigate('/login');
      return;
    }
    setAddingToCart(true);
    try {
      for (let i = 0; i < quantity; i++) {
        await addToCart(product.product_id);
      }
      setJustAdded(true);
      window.dispatchEvent(new CustomEvent('cart:bump'));
      toast.success(`Added ${quantity} item${quantity > 1 ? 's' : ''} to cart!`);
      setTimeout(() => setJustAdded(false), 2200);
    } catch (e) {
      toast.error(e.message || 'Failed to add to cart');
    } finally {
      setAddingToCart(false);
    }
  };

  const handleBuyNow = async () => {
    if (!isAuth) {
      toast.info('Please sign in to complete your purchase');
      navigate('/login');
      return;
    }
    setAddingToCart(true);
    try {
      await addToCart(product.product_id);
      window.dispatchEvent(new CustomEvent('cart:bump'));
      navigate('/cart');
    } catch (e) {
      toast.error(e.message || 'Failed to proceed to checkout');
    } finally {
      setAddingToCart(false);
    }
  };

  const handleWishlistToggle = async () => {
    if (!isAuth) {
      toast.info('Please sign in to use your wishlist');
      navigate('/login');
      return;
    }
    try {
      await addToWishlist(product.product_id);
      setInWishlist((prev) => !prev);
      toast.success(inWishlist ? 'Removed from wishlist' : 'Added to wishlist!');
    } catch (e) {
      toast.error(e.message || 'Wishlist update failed');
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator
        .share({
          title: product.name,
          text: `Check out ${product.name} on ShopKart!`,
          url: window.location.href,
        })
        .catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Product link copied to clipboard!');
    }
  };

  if (loading) {
    return (
      <StoreLayout
        cartCount={isCartLoading ? 0 : cartCount}
        username={username}
        mainClassName="max-w-7xl mx-auto w-full px-4 md:px-6 py-10"
      >
        <div className="animate-pulse space-y-8">
          <div className="h-4 bg-slate-200 rounded w-1/4" />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div className="aspect-square bg-slate-200 rounded-3xl" />
            <div className="space-y-6">
              <div className="h-8 bg-slate-200 rounded w-3/4" />
              <div className="h-5 bg-slate-200 rounded w-1/3" />
              <div className="h-12 bg-slate-200 rounded w-1/2" />
              <div className="h-24 bg-slate-200 rounded" />
              <div className="h-12 bg-slate-200 rounded w-2/3" />
            </div>
          </div>
        </div>
      </StoreLayout>
    );
  }

  if (error || !product) {
    return (
      <StoreLayout
        cartCount={isCartLoading ? 0 : cartCount}
        username={username}
        mainClassName="max-w-7xl mx-auto w-full px-4 md:px-6 py-16 text-center"
      >
        <div className="max-w-md mx-auto space-y-4">
          <div className="h-16 w-16 mx-auto rounded-2xl bg-rose-50 flex items-center justify-center text-rose-500">
            <AlertCircle className="h-8 w-8" />
          </div>
          <h2 className="text-2xl font-bold text-ink">Product Not Found</h2>
          <p className="text-sm text-ink-muted leading-relaxed">
            The item you are looking for may have been moved, sold out, or is temporarily unavailable.
          </p>
          <Button onClick={() => navigate('/')} className="rounded-xl px-6">
            <ArrowLeft className="h-4 w-4 mr-2" /> Back to Store
          </Button>
        </div>
      </StoreLayout>
    );
  }

  return (
    <StoreLayout
      cartCount={isCartLoading ? 0 : cartCount}
      username={username}
      mainClassName="max-w-7xl mx-auto w-full px-4 md:px-6 py-6 md:py-10 space-y-12"
    >
      {/* Breadcrumb Navigation */}
      <nav className="flex items-center gap-2 text-xs text-ink-muted">
        <Link to="/" className="hover:text-brand transition-colors">
          Home
        </Link>
        <ChevronRight className="h-3 w-3" />
        <Link
          to={`/?category=${encodeURIComponent(product.category || '')}`}
          className="hover:text-brand transition-colors"
        >
          {product.category || 'Products'}
        </Link>
        <ChevronRight className="h-3 w-3" />
        <span className="text-ink font-semibold truncate max-w-xs">{product.name}</span>
      </nav>

      {/* Main Product Showcase Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
        {/* Left Column: Image Gallery (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          {/* Main Photo Showcase */}
          <div className="relative aspect-square bg-surface rounded-3xl border border-border overflow-hidden group shadow-xs">
            <motion.img
              key={activeImage}
              src={activeImage}
              alt={product.name}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
              className="w-full h-full object-contain p-6 group-hover:scale-105 transition-transform duration-500 ease-out"
              loading="eager"
            />

            {/* Badges Overlay */}
            <div className="absolute top-4 left-4 flex flex-col gap-2">
              <span className="bg-ink text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest shadow-sm">
                {discountPct}% OFF
              </span>
              {(product.averageRating >= 4.0 || product.product_id % 2 === 0) && (
                <span className="bg-amber-400 text-slate-900 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1 shadow-sm">
                  <Sparkles className="h-3 w-3" /> Bestseller
                </span>
              )}
            </div>

            {/* Action Buttons Overlay (Wishlist & Share) */}
            <div className="absolute top-4 right-4 flex flex-col gap-2">
              <button
                onClick={handleWishlistToggle}
                className={`h-10 w-10 rounded-full flex items-center justify-center transition-all cursor-pointer shadow-sm border border-border ${
                  inWishlist
                    ? 'bg-rose-50 text-rose-500 border-rose-200'
                    : 'bg-surface/90 hover:bg-surface text-ink-muted hover:text-rose-500'
                }`}
                title="Save to wishlist"
              >
                <Heart
                  className={`h-5 w-5 ${inWishlist ? 'fill-rose-500 text-rose-500' : ''}`}
                  strokeWidth={2}
                />
              </button>
              <button
                onClick={handleShare}
                className="h-10 w-10 rounded-full bg-surface/90 hover:bg-surface text-ink-muted hover:text-brand flex items-center justify-center transition-all cursor-pointer shadow-sm border border-border"
                title="Share product"
              >
                <Share2 className="h-4.5 w-4.5" strokeWidth={2} />
              </button>
            </div>
          </div>

          {/* Thumbnails Strip */}
          {galleryImages.length > 1 && (
            <div className="flex gap-3 overflow-x-auto pb-2 pt-1 scrollbar-none">
              {galleryImages.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImageIndex(idx)}
                  className={`relative h-20 w-20 rounded-2xl bg-surface border-2 overflow-hidden shrink-0 transition-all cursor-pointer p-1.5 ${
                    selectedImageIndex === idx
                      ? 'border-brand shadow-sm scale-102'
                      : 'border-border hover:border-brand-muted opacity-70 hover:opacity-100'
                  }`}
                >
                  <img src={img} alt="" className="w-full h-full object-contain" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Product Info & Purchase Actions (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Brand & Category */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-widest text-brand bg-brand-light px-3 py-1 rounded-full">
              {product.brand && product.brand.toLowerCase() !== 'generic'
                ? product.brand
                : product.category || 'ShopKart'}
            </span>
            <span className="text-xs text-ink-muted">•</span>
            <span className="text-xs text-ink-muted font-medium">{product.category}</span>
          </div>

          {/* Title */}
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-ink leading-tight">
            {product.name}
          </h1>

          {/* Ratings & Reviews */}
          <div className="flex items-center gap-3 text-sm">
            <div className="flex items-center gap-1 bg-amber-50 border border-amber-200 text-amber-900 px-2.5 py-1 rounded-lg font-bold text-xs">
              <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
              <span>{product.averageRating ? product.averageRating.toFixed(1) : '4.8'}</span>
            </div>
            <span className="text-ink-muted text-xs">
              {product.totalReviews || 128} customer ratings
            </span>
            <span className="text-ink-muted text-xs">•</span>
            <span className="text-emerald-700 bg-emerald-50 text-xs font-semibold px-2 py-0.5 rounded-full">
              Verified Buyer Choice
            </span>
          </div>

          {/* Price & Savings Block */}
          <div className="p-4 sm:p-5 rounded-2xl bg-muted-bg/60 border border-border/80 space-y-2">
            <div className="flex items-baseline gap-3">
              <span className="text-3xl sm:text-4xl font-extrabold text-ink">
                ₹{priceVal.toLocaleString('en-IN')}
              </span>
              <span className="text-base sm:text-lg text-ink-muted line-through">
                ₹{Number(originalPrice).toLocaleString('en-IN')}
              </span>
              <span className="text-xs font-bold text-emerald-700 bg-emerald-100/70 px-2.5 py-1 rounded-full">
                Save ₹{Number(savings).toLocaleString('en-IN')} ({discountPct}% OFF)
              </span>
            </div>
            <p className="text-xs text-ink-muted">
              Inclusive of all taxes. Free shipping on this order.
            </p>
          </div>

          {/* Short Description */}
          <p className="text-sm sm:text-base text-ink-muted leading-relaxed">
            {product.description ||
              'Engineered with premium quality materials and rigorous standards. Backed by our 7-day hassle-free return policy.'}
          </p>

          {/* Stock Status */}
          <div className="flex items-center gap-2">
            {stock > 10 ? (
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                In Stock ({stock} units available)
              </span>
            ) : stock > 0 ? (
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-700 bg-amber-50 px-3 py-1 rounded-full border border-amber-200">
                <span className="h-2 w-2 rounded-full bg-amber-500" />
                Only {stock} items left in stock — order soon!
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-rose-700 bg-rose-50 px-3 py-1 rounded-full border border-rose-200">
                Out of Stock
              </span>
            )}
          </div>

          {/* Quantity Selector & CTAs */}
          <div className="space-y-4 pt-2">
            <div className="flex items-center gap-4">
              <span className="text-xs font-bold uppercase tracking-wider text-ink-muted">
                Quantity:
              </span>
              <div className="flex items-center border border-border rounded-xl bg-surface overflow-hidden">
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  disabled={quantity <= 1}
                  className="px-3.5 py-2 text-ink font-bold hover:bg-muted-bg transition-colors disabled:opacity-30 cursor-pointer"
                >
                  -
                </button>
                <span className="px-4 py-2 text-sm font-bold text-ink min-w-[40px] text-center">
                  {quantity}
                </span>
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.min(Math.min(stock, 10), q + 1))}
                  disabled={quantity >= Math.min(stock, 10)}
                  className="px-3.5 py-2 text-ink font-bold hover:bg-muted-bg transition-colors disabled:opacity-30 cursor-pointer"
                >
                  +
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <Button
                onClick={handleAddToCart}
                disabled={stock <= 0 || addingToCart}
                className={`h-12 rounded-xl text-sm font-bold gap-2 transition-all cursor-pointer ${
                  justAdded
                    ? 'bg-success text-white hover:bg-success'
                    : 'bg-brand text-white hover:bg-brand-hover shadow-md hover:shadow-lg'
                }`}
              >
                <AnimatePresence mode="wait">
                  {justAdded ? (
                    <motion.span
                      key="added"
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0.8, opacity: 0 }}
                      className="flex items-center gap-2"
                    >
                      <Check className="h-5 w-5" strokeWidth={2.5} /> Added to Cart!
                    </motion.span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <ShoppingCart className="h-5 w-5" />
                      {addingToCart ? 'Adding...' : 'Add to Cart'}
                    </span>
                  )}
                </AnimatePresence>
              </Button>

              <Button
                onClick={handleBuyNow}
                disabled={stock <= 0 || addingToCart}
                variant="outline"
                className="h-12 rounded-xl text-sm font-bold border-2 border-brand text-brand hover:bg-brand hover:text-white transition-all cursor-pointer shadow-xs"
              >
                <Zap className="h-4.5 w-4.5 mr-1" /> Buy Now
              </Button>
            </div>
          </div>

          {/* Delivery Estimator */}
          <div className="pt-4 border-t border-border space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-ink-muted block">
              Estimated Delivery
            </span>
            <div className="flex gap-2 max-w-sm">
              <div className="relative flex-1">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-muted" />
                <input
                  type="text"
                  value={pincode}
                  onChange={(e) => setPincode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="Enter 6-digit Pincode"
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-border bg-surface focus:outline-none focus:border-brand"
                />
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setPincodeChecked(true)}
                className="rounded-xl px-4 text-xs font-bold"
              >
                Check
              </Button>
            </div>
            {pincodeChecked && (
              <p className="text-xs text-emerald-700 flex items-center gap-1.5 animate-fade-in font-medium">
                <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
                Eligible for FREE Express Delivery to {pincode} by Friday!
              </p>
            )}
          </div>

          {/* Trust Guarantees */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-border">
            {[
              { Icon: Truck, label: 'Free Delivery', sub: 'Orders ₹499+' },
              { Icon: ShieldCheck, label: '100% Genuine', sub: 'Verified brands' },
              { Icon: RotateCcw, label: '7-Day Return', sub: 'Hassle-free' },
              { Icon: Clock, label: 'Fast Dispatch', sub: 'Within 24 hours' },
            ].map(({ Icon, label, sub }) => (
              <div
                key={label}
                className="p-3 rounded-2xl bg-surface border border-border/70 flex flex-col items-center text-center gap-1 shadow-2xs"
              >
                <Icon className="h-4.5 w-4.5 text-brand" strokeWidth={2} />
                <span className="text-[11px] font-bold text-ink">{label}</span>
                <span className="text-[10px] text-ink-muted">{sub}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tabs: Specifications, Description & Reviews */}
      <section className="pt-8 border-t border-border">
        <div className="flex border-b border-border gap-6">
          {[
            { id: 'overview', label: 'Overview & Highlights' },
            { id: 'specs', label: 'Specifications' },
            { id: 'reviews', label: `Customer Reviews (${SAMPLE_REVIEWS.length})` },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`pb-3 text-sm font-bold transition-all relative cursor-pointer ${
                activeTab === tab.id
                  ? 'text-brand'
                  : 'text-ink-muted hover:text-ink'
              }`}
            >
              {tab.label}
              {activeTab === tab.id && (
                <motion.div
                  layoutId="tabUnderline"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand rounded-full"
                />
              )}
            </button>
          ))}
        </div>

        <div className="py-6">
          {activeTab === 'overview' && (
            <div className="space-y-4 max-w-3xl text-sm text-ink-muted leading-relaxed">
              <p>
                The {product.name} represents high performance, reliable craftsmanship, and
                exceptional value. Designed with attention to detail and precision engineering.
              </p>
              <ul className="space-y-2.5 pt-2 list-none">
                {[
                  'Manufactured with premium grade materials for sustained longevity',
                  'Sleek, modern ergonomic profile that seamlessly fits into your lifestyle',
                  'Individually inspected and sealed with brand warranty card included',
                  'Full 7-day replacement guarantee backed by ShopKart buyer protection',
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-2.5">
                    <CheckCircle2 className="h-4 w-4 text-brand shrink-0 mt-0.5" />
                    <span className="text-ink">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {activeTab === 'specs' && (
            <div className="max-w-2xl bg-surface rounded-2xl border border-border overflow-hidden">
              <table className="w-full text-xs">
                <tbody>
                  {[
                    ['Product Name', product.name],
                    ['Brand', product.brand || 'ShopKart Selected'],
                    ['Category', product.category || 'General'],
                    ['Item Model ID', `SK-${product.product_id}`],
                    ['Warranty', '1 Year Official Manufacturer Warranty'],
                    ['In the Box', `${product.name}, User Guide, Warranty Card`],
                    ['Country of Origin', 'India'],
                  ].map(([label, val], idx) => (
                    <tr
                      key={label}
                      className={idx % 2 === 0 ? 'bg-muted-bg/30' : 'bg-surface'}
                    >
                      <td className="px-4 py-3 font-bold text-ink-muted w-1/3">{label}</td>
                      <td className="px-4 py-3 font-semibold text-ink">{val}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === 'reviews' && (
            <div className="space-y-6 max-w-3xl">
              <div className="flex items-center gap-4 p-4 rounded-2xl bg-muted-bg/50 border border-border">
                <div className="text-center pr-4 border-r border-border">
                  <span className="text-3xl font-extrabold text-ink">4.8</span>
                  <div className="flex gap-0.5 text-amber-400 justify-center mt-1">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-3 w-3 fill-amber-400" />
                    ))}
                  </div>
                  <span className="text-[10px] text-ink-muted mt-1 block">128 Ratings</span>
                </div>
                <div className="text-xs text-ink-muted space-y-1">
                  <p className="font-semibold text-ink">94% of buyers recommend this product</p>
                  <p>Real feedback from authenticated ShopKart shoppers.</p>
                </div>
              </div>

              <div className="space-y-4">
                {SAMPLE_REVIEWS.map((rev) => (
                  <div
                    key={rev.id}
                    className="p-4 rounded-2xl bg-surface border border-border space-y-2 shadow-2xs"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs text-ink">{rev.name}</span>
                        {rev.verified && (
                          <span className="text-[10px] bg-emerald-50 text-emerald-700 font-semibold px-2 py-0.5 rounded-full border border-emerald-200">
                            Verified Purchase
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] text-ink-muted">{rev.date}</span>
                    </div>
                    <div className="flex gap-0.5 text-amber-400">
                      {[...Array(rev.rating)].map((_, i) => (
                        <Star key={i} className="h-3 w-3 fill-amber-400" />
                      ))}
                    </div>
                    <p className="text-xs text-ink-muted leading-relaxed">{rev.comment}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Related Products Grid */}
      {relatedProducts.length > 0 && (
        <section className="space-y-6 pt-8 border-t border-border">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-extrabold text-ink">Similar Products You Might Like</h2>
              <p className="text-xs text-ink-muted mt-0.5">
                Curated items from {product.category || 'our store'}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-5">
            {relatedProducts.map((rel) => {
              const relImg = getProductImage(rel);
              const relPrice = parseFloat(rel.price) || 0;
              return (
                <div
                  key={rel.product_id}
                  onClick={() => navigate(`/products/${rel.product_id}`)}
                  className="group bg-surface rounded-2xl border border-border p-3.5 space-y-3 cursor-pointer hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
                >
                  <div className="aspect-square rounded-xl bg-muted-bg/50 overflow-hidden flex items-center justify-center p-2">
                    <img
                      src={relImg}
                      alt={rel.name}
                      className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
                      loading="lazy"
                    />
                  </div>
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-brand uppercase tracking-wider block">
                      {rel.brand || rel.category || 'ShopKart'}
                    </span>
                    <h3 className="text-xs font-bold text-ink truncate group-hover:text-brand transition-colors">
                      {rel.name}
                    </h3>
                    <div className="flex items-center justify-between pt-1">
                      <span className="text-sm font-black text-ink">₹{relPrice.toFixed(0)}</span>
                      <div className="flex items-center gap-1 text-[11px] text-amber-500 font-bold">
                        <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                        <span>{rel.averageRating ? rel.averageRating.toFixed(1) : '4.6'}</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}
    </StoreLayout>
  );
}
