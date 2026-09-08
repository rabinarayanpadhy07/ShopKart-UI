import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PackageCheck, CalendarDays, Hash } from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { useCartCount } from '@/hooks/useCartCount';
import { Card, CardHeader, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { useToast } from '@/components/ui/Toast';
import { IMAGE_FALLBACK } from '@/lib/placeholder';
import { getOrders, cancelOrder, returnOrder, submitReview } from '@/api/orders';

function formatOrderDate(value) {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

const STATUS_STYLES = {
  CANCELLED: 'bg-red-50 text-red-700 border-red-200',
  DELIVERED: 'bg-success-light text-success border-success/20',
  RETURN_REQUESTED: 'bg-amber-50 text-amber-700 border-amber-200',
  RETURN_APPROVED: 'bg-teal-50 text-teal-700 border-teal-200',
  RETURN_REJECTED: 'bg-rose-50 text-rose-700 border-rose-200',
  ITEM_PICKED_UP: 'bg-purple-50 text-purple-700 border-purple-200',
  RETURNED: 'bg-muted-bg text-ink-muted border-border',
  REFUNDED: 'bg-muted-bg text-ink-muted border-border',
};
const DEFAULT_STATUS_STYLE = 'bg-brand-light text-brand border-brand-muted/40';

const modalBackdrop = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
};
const modalPanel = {
  hidden: { opacity: 0, y: 24, scale: 0.97 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { type: 'spring', stiffness: 380, damping: 30 } },
  exit: { opacity: 0, y: 12, scale: 0.97, transition: { duration: 0.15 } },
};

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [username, setUsername] = useState('');
  const { cartCount, loading: isCartLoading } = useCartCount({ username });
  const toast = useToast();

  // Modal states
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showReturnModal, setShowReturnModal] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);

  const [activeOrderId, setActiveOrderId] = useState("");
  const [activeProductId, setActiveProductId] = useState(null);

  const [cancelReason, setCancelReason] = useState("Changed my mind");
  const [returnReason, setReturnReason] = useState("Defective product");
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const fetchOrders = useCallback(async () => {
    try {
      const data = await getOrders();
      setOrders(data.products || []);
      setUsername(data.username || 'Guest');
    } catch (err) {
      setError(err.message || 'Failed to fetch orders');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const handleCancelSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const updated = await cancelOrder(activeOrderId, cancelReason);
      setOrders((prev) =>
        prev.map((o) =>
          o.order_id === activeOrderId
            ? { ...o, status: updated.status, cancellation_reason: updated.cancellationReason }
            : o
        )
      );
      setShowCancelModal(false);
      toast.success("Order cancelled successfully.");
    } catch (err) {
      toast.error(err.message || "Failed to cancel order");
    } finally {
      setSubmitting(false);
    }
  };

  const handleReturnSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const updated = await returnOrder(activeOrderId, returnReason);
      setOrders((prev) =>
        prev.map((o) =>
          o.order_id === activeOrderId
            ? { ...o, status: updated.status, return_reason: updated.returnReason }
            : o
        )
      );
      setShowReturnModal(false);
      toast.success("Return requested successfully.");
    } catch (err) {
      toast.error(err.message || "Failed to submit return request");
    } finally {
      setSubmitting(false);
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await submitReview(activeProductId, reviewRating, reviewComment);
      setShowReviewModal(false);
      toast.success("Review submitted successfully.");
    } catch (err) {
      toast.error(err.message || "Failed to submit review");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background font-sans w-full">
      <Header
        cartCount={isCartLoading ? '...' : cartCount}
        username={username}
      />
      <motion.main
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: 'easeOut' }}
        className="flex-grow max-w-4xl mx-auto w-full py-10 px-4"
      >
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2.5 rounded-xl bg-brand-light hidden sm:flex">
            <PackageCheck className="h-6 w-6 text-brand" strokeWidth={2} />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-ink">Your Orders</h1>
            <p className="text-sm text-ink-muted mt-0.5">Track, cancel or return your recent purchases</p>
          </div>
        </div>
        {loading && (
          <div className="text-center py-10 text-ink-muted">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-brand mb-2"></div>
            <p>Loading orders...</p>
          </div>
        )}
        {error && (
          <div className="bg-red-50 text-red-600 border border-red-200 rounded-lg p-4 text-center mb-6">
            {error}
          </div>
        )}
        {!loading && !error && orders.length === 0 && (
          <div className="text-center py-20 text-ink-muted bg-surface rounded-xl border border-border p-8 shadow-xs">
            <svg className="w-16 h-16 mx-auto text-border mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
            <p className="text-lg font-semibold">No orders found. Start shopping now!</p>
          </div>
        )}
        {!loading && !error && orders.length > 0 && (
          <div className="space-y-6">
            <AnimatePresence initial={false}>
              {orders.map((order, index) => {
                const isCancellable = order.status === 'PENDING' || order.status === 'SUCCESS' || order.status === 'CONFIRMED' || order.status === 'PROCESSING';
                const isDelivered = order.status === 'DELIVERED';

                return (
                  <motion.div
                    key={order.order_id || index}
                    layout
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.3, delay: Math.min(index, 6) * 0.04, ease: 'easeOut' }}
                  >
                    <Card className="overflow-hidden bg-surface hover:shadow-md transition-shadow">
                      <CardHeader className="bg-muted-bg/70 border-b border-border p-4">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs sm:text-sm font-semibold text-ink-muted">
                            <span className="flex items-center gap-1.5">
                              <Hash className="h-3.5 w-3.5 shrink-0" strokeWidth={2} />
                              <span className="font-mono text-ink">{order.order_id}</span>
                            </span>
                            {formatOrderDate(order.created_at) && (
                              <span className="flex items-center gap-1.5">
                                <CalendarDays className="h-3.5 w-3.5 shrink-0" strokeWidth={2} />
                                Placed on {formatOrderDate(order.created_at)}
                              </span>
                            )}
                          </div>
                          <span className={`inline-flex items-center w-fit px-2.5 py-0.5 rounded-full text-xs font-semibold border ${STATUS_STYLES[order.status] || DEFAULT_STATUS_STYLE}`}>
                            {order.status}
                          </span>
                        </div>
                      </CardHeader>
                      <CardContent className="p-6">
                        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
                          <img
                            src={order.image_url || IMAGE_FALLBACK}
                            alt={order.name}
                            className="h-24 w-24 rounded-lg object-cover bg-muted-bg border border-border"
                            onError={(e) => { e.target.src = IMAGE_FALLBACK; }}
                          />
                          <div className="flex-grow text-center sm:text-left space-y-1">
                            <h3 className="text-xl font-bold text-ink">{order.name}</h3>
                            <p className="text-sm text-ink-muted line-clamp-2">{order.description || 'No description available.'}</p>

                            {order.status === 'CANCELLED' && order.cancellation_reason && (
                              <p className="text-xs font-semibold text-red-500">Cancellation Reason: {order.cancellation_reason}</p>
                            )}
                            {order.status === 'RETURN_REQUESTED' && order.return_reason && (
                              <p className="text-xs font-semibold text-amber-500">Return Reason: {order.return_reason}</p>
                            )}
                            {order.status === 'RETURN_APPROVED' && (
                              <p className="text-xs font-semibold text-teal-600">Return Accepted (Refund/Exchange in process)</p>
                            )}
                            {order.status === 'RETURN_REJECTED' && (
                              <p className="text-xs font-semibold text-rose-600">Return Request Declined by Admin</p>
                            )}

                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-3 text-xs sm:text-sm text-ink-muted">
                              <div>
                                <p className="text-xs text-ink-muted/70">Price per Unit</p>
                                <p className="font-semibold text-ink">₹{parseFloat(order.price_per_unit).toFixed(2)}</p>
                              </div>
                              <div>
                                <p className="text-xs text-ink-muted/70">Quantity</p>
                                <p className="font-semibold text-ink">{order.quantity}</p>
                              </div>
                              <div>
                                <p className="text-xs text-ink-muted/70">Total Price</p>
                                <p className="font-semibold text-ink">₹{parseFloat(order.total_price).toFixed(2)}</p>
                              </div>
                            </div>

                            {/* Customer Order Actions */}
                            <div className="flex flex-wrap gap-2 pt-4 justify-center sm:justify-start">
                              {isCancellable && (
                                <Button
                                  onClick={() => { setActiveOrderId(order.order_id); setShowCancelModal(true); }}
                                  variant="destructive"
                                  size="sm"
                                  className="text-xs font-bold"
                                >
                                  Cancel Order
                                </Button>
                              )}
                              {isDelivered && (
                                <>
                                  <Button
                                    onClick={() => { setActiveOrderId(order.order_id); setShowReturnModal(true); }}
                                    variant="outline"
                                    size="sm"
                                    className="text-xs font-bold border-amber-300 text-amber-600 hover:bg-amber-50"
                                  >
                                    Request Return
                                  </Button>
                                  <Button
                                    onClick={() => { setActiveProductId(order.product_id); setReviewComment(""); setReviewRating(5); setShowReviewModal(true); }}
                                    size="sm"
                                    className="text-xs font-bold"
                                  >
                                    Write Review
                                  </Button>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </motion.main>
      <Footer />

      {/* Cancellation Reason Modal */}
      <AnimatePresence>
        {showCancelModal && (
          <motion.div
            initial="hidden" animate="visible" exit="hidden" variants={modalBackdrop}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4"
          >
            <motion.div
              variants={modalPanel}
              className="bg-surface rounded-xl max-w-md w-full p-6 space-y-4 border border-border shadow-2xl"
            >
              <h3 className="text-lg font-bold text-ink text-left border-b border-border pb-2">Cancel Order</h3>
              <form onSubmit={handleCancelSubmit} className="space-y-4 text-left">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-ink-muted">Select Cancellation Reason</label>
                  <select
                    value={cancelReason}
                    onChange={e => setCancelReason(e.target.value)}
                    className="w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand"
                  >
                    <option value="Changed my mind">Changed my mind</option>
                    <option value="Found better price elsewhere">Found better price elsewhere</option>
                    <option value="Shipping time was too long">Shipping time was too long</option>
                    <option value="Wrong item ordered">Wrong item ordered</option>
                  </select>
                </div>
                <div className="flex justify-end gap-3 pt-3 border-t border-border">
                  <Button type="button" variant="outline" onClick={() => setShowCancelModal(false)}>Back</Button>
                  <Button type="submit" variant="destructive" disabled={submitting}>
                    {submitting ? 'Cancelling...' : 'Confirm Cancel'}
                  </Button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Return Reason Modal */}
      <AnimatePresence>
        {showReturnModal && (
          <motion.div
            initial="hidden" animate="visible" exit="hidden" variants={modalBackdrop}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4"
          >
            <motion.div
              variants={modalPanel}
              className="bg-surface rounded-xl max-w-md w-full p-6 space-y-4 border border-border shadow-2xl"
            >
              <h3 className="text-lg font-bold text-ink text-left border-b border-border pb-2">Request Order Return</h3>
              <form onSubmit={handleReturnSubmit} className="space-y-4 text-left">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-ink-muted">Select Return Reason</label>
                  <select
                    value={returnReason}
                    onChange={e => setReturnReason(e.target.value)}
                    className="w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand"
                  >
                    <option value="Defective product">Defective product / Doesn&apos;t work</option>
                    <option value="Wrong size/item delivered">Wrong size/item delivered</option>
                    <option value="Product not as described">Product not as described</option>
                    <option value="Damaged packaging or item">Damaged packaging or item</option>
                  </select>
                </div>
                <div className="flex justify-end gap-3 pt-3 border-t border-border">
                  <Button type="button" variant="outline" onClick={() => setShowReturnModal(false)}>Back</Button>
                  <Button type="submit" className="bg-amber-500 hover:bg-amber-600 text-white" disabled={submitting}>
                    {submitting ? 'Submitting...' : 'Confirm Return'}
                  </Button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Write Product Review Modal */}
      <AnimatePresence>
        {showReviewModal && (
          <motion.div
            initial="hidden" animate="visible" exit="hidden" variants={modalBackdrop}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4"
          >
            <motion.div
              variants={modalPanel}
              className="bg-surface rounded-xl max-w-md w-full p-6 space-y-4 border border-border shadow-2xl"
            >
              <h3 className="text-lg font-bold text-ink text-left border-b border-border pb-2">Write Product Review</h3>
              <form onSubmit={handleReviewSubmit} className="space-y-4 text-left">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-ink-muted">Rating (1 to 5 Stars)</label>
                  <div className="flex gap-2 text-2xl pt-1">
                    {[1, 2, 3, 4, 5].map(star => (
                      <motion.button
                        key={star}
                        type="button"
                        whileTap={{ scale: 0.85 }}
                        onClick={() => setReviewRating(star)}
                        className={`hover:scale-115 transition-transform cursor-pointer ${star <= reviewRating ? 'text-amber-500' : 'text-border'}`}
                      >
                        ★
                      </motion.button>
                    ))}
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-ink-muted">Review Comments</label>
                  <textarea
                    value={reviewComment}
                    onChange={e => setReviewComment(e.target.value)}
                    rows="3"
                    className="w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand"
                    placeholder="Share your experience with this product..."
                    required
                  />
                </div>
                <div className="flex justify-end gap-3 pt-3 border-t border-border">
                  <Button type="button" variant="outline" onClick={() => setShowReviewModal(false)}>Cancel</Button>
                  <Button type="submit" disabled={submitting}>
                    {submitting ? 'Submitting...' : 'Submit Review'}
                  </Button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
