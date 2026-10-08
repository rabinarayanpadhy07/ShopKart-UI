import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronRight, Heart, ShoppingBag, Zap, Truck, RotateCcw, BadgeCheck, ShieldCheck, Star, Minus, Plus, PackageX,
} from 'lucide-react';
import { StoreLayout } from '@/components/layout/StoreLayout';
import { ProductList } from '@/components/products/ProductList';
import { RatingBadge, StockBadge } from '@/components/products/ProductCard';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/components/ui/Toast';
import { useCartCount } from '@/hooks/useCartCount';
import { getProduct } from '@/api/products';
import { getProductReviews, addReview } from '@/api/reviews';
import { addToCart } from '@/api/cart';
import { addToWishlist } from '@/api/wishlist';
import { IMAGE_FALLBACK } from '@/lib/placeholder';
import { formatPrice, FREE_DELIVERY_THRESHOLD } from '@/lib/format';
import { getProductImages } from '@/lib/productImages';
import { cn } from '@/lib/utils';

function Stars({ value, size = 'h-4 w-4' }) {
  return (
    <span className="inline-flex" aria-label={`${value} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <Star key={i} className={cn(size, i <= value ? 'fill-amber-400 text-amber-400' : 'text-border')} strokeWidth={1.5} />
      ))}
    </span>
  );
}

function PageSkeleton() {
  return (
    <div className="grid animate-pulse gap-8 md:grid-cols-2" aria-hidden="true">
      <div className="aspect-square rounded-3xl bg-muted-bg" />
      <div className="space-y-4 pt-4">
        <div className="h-3 w-24 rounded bg-muted-bg" />
        <div className="h-7 w-4/5 rounded bg-muted-bg" />
        <div className="h-5 w-32 rounded bg-muted-bg" />
        <div className="h-9 w-40 rounded bg-muted-bg" />
        <div className="h-24 rounded bg-muted-bg" />
        <div className="h-12 rounded-xl bg-muted-bg" />
      </div>
    </div>
  );
}

function ReviewSection({ productId, isAuth, onReviewAdded }) {
  const toast = useToast();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    getProductReviews(productId, { signal: controller.signal })
      .then((data) => setReviews(Array.isArray(data) ? data : []))
      .catch(() => {})
      .finally(() => !controller.signal.aborted && setLoading(false));
    return () => controller.abort();
  }, [productId]);

  const submit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const saved = await addReview(Number(productId), rating, comment.trim());
      setReviews((r) => [saved, ...r]);
      setComment('');
      toast.success('Thanks for your review!');
      onReviewAdded?.();
    } catch (err) {
      toast.error(err.message || 'Could not submit review');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section aria-labelledby="reviews-heading" className="rounded-3xl border border-border bg-surface p-5 md:p-7">
      <h2 id="reviews-heading" className="text-lg font-bold text-ink">Ratings & reviews</h2>

      {isAuth && (
        <form onSubmit={submit} className="mt-4 space-y-3 rounded-2xl bg-muted-bg/60 p-4">
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-ink">Your rating</span>
            <div className="flex">
              {[1, 2, 3, 4, 5].map((i) => (
                <button key={i} type="button" onClick={() => setRating(i)} aria-label={`${i} star${i > 1 ? 's' : ''}`} className="p-0.5 cursor-pointer">
                  <Star className={cn('h-5 w-5', i <= rating ? 'fill-amber-400 text-amber-400' : 'text-ink-muted/40')} strokeWidth={1.5} />
                </button>
              ))}
            </div>
          </div>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={3}
            maxLength={1000}
            placeholder="What did you like or dislike? (Only verified buyers can review)"
            className="w-full rounded-xl border border-border bg-surface p-3 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-brand/20"
          />
          <Button type="submit" size="sm" disabled={submitting}>
            {submitting ? 'Submitting…' : 'Submit review'}
          </Button>
        </form>
      )}

      {loading ? (
        <p className="mt-4 text-sm text-ink-muted">Loading reviews…</p>
      ) : reviews.length === 0 ? (
        <p className="mt-4 text-sm text-ink-muted">No reviews yet. Bought this product? Be the first to review it.</p>
      ) : (
        <ul className="mt-4 divide-y divide-border">
          {reviews.map((r) => (
            <li key={r.id} className="py-4">
              <div className="flex items-center gap-2">
                <Stars value={r.rating} size="h-3.5 w-3.5" />
                <span className="text-sm font-semibold text-ink">{r.username}</span>
                {r.createdAt && (
                  <span className="text-xs text-ink-muted">
                    · {new Date(r.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </span>
                )}
              </div>
              {r.comment && <p className="mt-1.5 text-sm leading-relaxed text-ink/80">{r.comment}</p>}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

export default function ProductPage() {
  const { productId } = useParams();
  const navigate = useNavigate();
  const toast = useToast();

  const [product, setProduct] = useState(null);
  const [username, setUsername] = useState('Guest');
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [activeImage, setActiveImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [adding, setAdding] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);

  const isAuth = Boolean(username && username !== 'Guest');
  const { cartCount } = useCartCount({ enabled: isAuth, username });

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setNotFound(false);
    getProduct(productId, { signal: controller.signal })
      .then((data) => {
        setProduct(data);
        setUsername(data.user?.name || 'Guest');
        setActiveImage(0);
        setQuantity(1);
        setLoading(false);
      })
      .catch((err) => {
        if (controller.signal.aborted) return;
        if (err.status === 404) setNotFound(true);
        else toast.error(err.message || 'Failed to load product');
        setLoading(false);
      });
    window.scrollTo({ top: 0 });
    return () => controller.abort();
  }, [productId, reloadKey, toast]);

  const requireAuth = (message) => {
    if (isAuth) return true;
    toast.info(message);
    navigate('/login');
    return false;
  };

  const handleAddToCart = async (buyNow = false) => {
    if (!requireAuth('Please sign in to add items to cart')) return;
    setAdding(true);
    try {
      await addToCart(product.product_id, quantity);
      window.dispatchEvent(new CustomEvent('cart:bump'));
      if (buyNow) navigate('/cart');
      else toast.success(`Added ${quantity > 1 ? `${quantity} × ` : ''}to cart.`);
    } catch (e) {
      toast.error(e.message || 'Failed to add to cart');
    } finally {
      setAdding(false);
    }
  };

  const handleWishlist = async (id = product.product_id) => {
    if (!requireAuth('Please sign in to use wishlist')) return;
    try {
      await addToWishlist(id);
      toast.success('Added to wishlist!');
    } catch (e) {
      toast.error(e.message || 'Failed to add to wishlist');
    }
  };

  const handleRelatedAddToCart = async (id) => {
    if (!requireAuth('Please sign in to add items to cart')) return false;
    try {
      await addToCart(id);
      toast.success('Added to cart.');
      return true;
    } catch (e) {
      toast.error(e.message || 'Failed to add to cart');
      return false;
    }
  };

  const images = product ? getProductImages(product) : [IMAGE_FALLBACK];
  const price = Number(product?.price || 0);
  const outOfStock = product && product.stock <= 0;
  const maxQty = product ? Math.max(1, Math.min(10, product.stock)) : 1;

  return (
    <StoreLayout cartCount={cartCount} username={username}>
      {loading ? (
        <PageSkeleton />
      ) : notFound || !product ? (
        <div className="flex flex-col items-center py-24 text-center">
          <PackageX className="mb-3 h-12 w-12 text-ink-muted" strokeWidth={1.5} />
          <h1 className="text-xl font-bold text-ink">Product not found</h1>
          <p className="mt-1 text-sm text-ink-muted">It may have been removed or the link is incorrect.</p>
          <Button className="mt-5" onClick={() => navigate('/')}>Continue shopping</Button>
        </div>
      ) : (
        <div className="space-y-10">
          <nav className="flex items-center gap-1 text-xs text-ink-muted" aria-label="Breadcrumb">
            <Link to="/" className="hover:text-ink">Home</Link>
            {product.category && (
              <>
                <ChevronRight className="h-3.5 w-3.5" />
                <Link to={`/?category=${encodeURIComponent(product.category)}`} className="hover:text-ink">{product.category}</Link>
              </>
            )}
            <ChevronRight className="h-3.5 w-3.5" />
            <span className="truncate text-ink">{product.name}</span>
          </nav>

          <div className="grid gap-6 md:grid-cols-2 md:gap-10 lg:gap-14">
            {/* Gallery */}
            <div className="md:sticky md:top-36 md:self-start">
              <div className="relative aspect-square overflow-hidden rounded-3xl border border-border bg-muted-bg/60">
                <AnimatePresence mode="wait">
                  <motion.img
                    key={images[activeImage]}
                    src={images[activeImage]}
                    alt={product.name}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="h-full w-full object-contain p-8 mix-blend-multiply"
                    fetchPriority="high"
                    onError={(e) => { e.currentTarget.src = IMAGE_FALLBACK; }}
                  />
                </AnimatePresence>
                <StockBadge stock={product.stock} className="absolute left-4 top-4" />
              </div>
              {images.length > 1 && (
                <div className="mt-3 flex gap-2">
                  {images.map((src, i) => (
                    <button
                      key={src}
                      type="button"
                      onClick={() => setActiveImage(i)}
                      aria-label={`Show image ${i + 1}`}
                      className={cn(
                        'h-16 w-16 overflow-hidden rounded-xl border-2 bg-muted-bg/60 p-1.5 transition-colors cursor-pointer',
                        i === activeImage ? 'border-ink' : 'border-transparent hover:border-border'
                      )}
                    >
                      <img src={src} alt="" loading="lazy" className="h-full w-full object-contain mix-blend-multiply" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Details */}
            <div className="space-y-5">
              <div className="space-y-2">
                {product.brand && (
                  <p className="text-xs font-semibold uppercase tracking-wider text-brand">{product.brand}</p>
                )}
                <h1 className="text-2xl font-bold leading-tight text-ink md:text-3xl">{product.name}</h1>
                <RatingBadge rating={product.averageRating} count={product.totalReviews} />
              </div>

              <div>
                <p className="text-3xl font-extrabold text-ink">{formatPrice(price)}</p>
                <p className="mt-0.5 text-xs text-ink-muted">Inclusive of all taxes</p>
              </div>

              {product.description && (
                <p className="text-sm leading-relaxed text-ink/80 md:text-[15px]">{product.description}</p>
              )}

              <div className="space-y-3 rounded-2xl border border-border bg-surface p-4">
                <div className="flex items-center justify-between">
                  <span className={cn('text-sm font-semibold', outOfStock ? 'text-danger' : 'text-success')}>
                    {outOfStock ? 'Currently out of stock' : product.stock <= 5 ? `Hurry, only ${product.stock} left` : 'In stock'}
                  </span>
                  {!outOfStock && (
                    <div className="flex items-center rounded-xl border border-border">
                      <button
                        type="button"
                        onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                        disabled={quantity <= 1}
                        className="flex h-9 w-9 items-center justify-center text-ink-muted hover:text-ink disabled:opacity-40 cursor-pointer"
                        aria-label="Decrease quantity"
                      >
                        <Minus className="h-4 w-4" />
                      </button>
                      <span className="w-8 text-center text-sm font-semibold" aria-live="polite">{quantity}</span>
                      <button
                        type="button"
                        onClick={() => setQuantity((q) => Math.min(maxQty, q + 1))}
                        disabled={quantity >= maxQty}
                        className="flex h-9 w-9 items-center justify-center text-ink-muted hover:text-ink disabled:opacity-40 cursor-pointer"
                        aria-label="Increase quantity"
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                    </div>
                  )}
                </div>
                <div className="grid grid-cols-[1fr_1fr_auto] gap-2">
                  <Button variant="secondary" size="lg" className="px-4 gap-2" disabled={outOfStock || adding} onClick={() => handleAddToCart(false)}>
                    <ShoppingBag className="h-4 w-4" /> Add to cart
                  </Button>
                  <Button size="lg" className="px-4 gap-2" disabled={outOfStock || adding} onClick={() => handleAddToCart(true)}>
                    <Zap className="h-4 w-4" /> Buy now
                  </Button>
                  <Button variant="outline" size="lg" className="px-4" onClick={() => handleWishlist()} aria-label="Add to wishlist">
                    <Heart className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <ul className="grid grid-cols-2 gap-3 text-xs">
                {[
                  { Icon: Truck, text: price >= FREE_DELIVERY_THRESHOLD ? 'Free delivery in 2–3 days' : 'Delivery in 2–3 days' },
                  { Icon: RotateCcw, text: '7-day easy returns' },
                  { Icon: BadgeCheck, text: '100% genuine product' },
                  { Icon: ShieldCheck, text: 'Secure payments' },
                ].map(({ Icon, text }) => (
                  <li key={text} className="flex items-center gap-2 rounded-xl bg-muted-bg/60 px-3 py-2.5 text-ink">
                    <Icon className="h-4 w-4 shrink-0 text-brand" /> {text}
                  </li>
                ))}
              </ul>

              <dl className="divide-y divide-border rounded-2xl border border-border text-sm">
                {[
                  ['Brand', product.brand],
                  ['Category', product.category],
                  ['Product ID', `#${product.product_id}`],
                ].filter(([, v]) => v).map(([k, v]) => (
                  <div key={k} className="flex justify-between gap-4 px-4 py-2.5">
                    <dt className="text-ink-muted">{k}</dt>
                    <dd className="text-right font-medium text-ink">{v}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>

          <ReviewSection productId={productId} isAuth={isAuth} onReviewAdded={() => setReloadKey((k) => k + 1)} />

          {product.related?.length > 0 && (
            <section aria-labelledby="related-heading">
              <div className="mb-4 flex items-end justify-between">
                <h2 id="related-heading" className="text-lg font-bold text-ink">You may also like</h2>
                {product.category && (
                  <Link to={`/?category=${encodeURIComponent(product.category)}`} className="text-sm font-semibold text-brand hover:underline">
                    View all
                  </Link>
                )}
              </div>
              <ProductList products={product.related.slice(0, 4)} onAddToCart={handleRelatedAddToCart} onAddToWishlist={handleWishlist} />
            </section>
          )}
        </div>
      )}
    </StoreLayout>
  );
}
