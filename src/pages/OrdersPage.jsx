import React, { useState, useEffect } from 'react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Card, CardHeader, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cartCount, setCartCount] = useState(0);
  const [username, setUsername] = useState('');
  const [cartError, setCartError] = useState(false);
  const [isCartLoading, setIsCartLoading] = useState(true);

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

  const fetchOrders = async () => {
    try {
      const response = await fetch('/api/orders', {
        credentials: 'include',
      });
      if (!response.ok) throw new Error('Failed to fetch orders');
      const data = await response.json();
      setOrders(data.products || []);
      setUsername(data.username || 'Guest');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchCartCount = async () => {
    setIsCartLoading(true);
    try {
      const response = await fetch('/api/cart/items/count', {
        credentials: 'include',
      });
      if (response.ok) {
        const count = await response.json();
        setCartCount(count);
        setCartError(false);
      } else {
        setCartError(true);
      }
    } catch (error) {
      console.error('Error fetching cart count:', error);
      setCartError(true);
    } finally {
      setIsCartLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
    fetchCartCount();
  }, []);

  const handleCancelSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`/api/orders/${activeOrderId}/cancel`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ reason: cancelReason })
      });
      if (response.ok) {
        setShowCancelModal(false);
        fetchOrders();
        alert("Order cancelled successfully!");
      } else {
        const err = await response.json();
        alert(err.error || "Failed to cancel order");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleReturnSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`/api/orders/${activeOrderId}/return`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ reason: returnReason })
      });
      if (response.ok) {
        setShowReturnModal(false);
        fetchOrders();
        alert("Return requested successfully!");
      } else {
        const err = await response.json();
        alert(err.error || "Failed to submit return request");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          productId: activeProductId,
          rating: reviewRating,
          comment: reviewComment
        })
      });
      if (response.ok) {
        setShowReviewModal(false);
        fetchOrders();
        alert("Review submitted successfully!");
      } else {
        const err = await response.json();
        alert(err.error || "Failed to submit review");
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 font-sans w-full">
      <Header
        cartCount={isCartLoading ? '...' : cartError ? 'Error' : cartCount}
        username={username}
      />
      <main className="flex-grow max-w-4xl mx-auto w-full py-10 px-4">
        <h1 className="text-3xl font-extrabold text-slate-800 mb-6">Your Orders</h1>
        {loading && (
          <div className="text-center py-10 text-slate-500">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#00ABE4] mb-2"></div>
            <p>Loading orders...</p>
          </div>
        )}
        {error && (
          <div className="bg-red-50 text-red-600 border border-red-200 rounded-lg p-4 text-center mb-6">
            {error}
          </div>
        )}
        {!loading && !error && orders.length === 0 && (
          <div className="text-center py-20 text-slate-500 bg-white rounded-xl border border-gray-150 p-8 shadow-xs">
            <svg className="w-16 h-16 mx-auto text-slate-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
            <p className="text-lg font-semibold">No orders found. Start shopping now!</p>
          </div>
        )}
        {!loading && !error && orders.length > 0 && (
          <div className="space-y-6">
            {orders.map((order, index) => {
              const isCancellable = order.status === 'PENDING' || order.status === 'SUCCESS' || order.status === 'CONFIRMED' || order.status === 'PROCESSING';
              const isDelivered = order.status === 'DELIVERED';

              return (
                <Card key={index} className="overflow-hidden bg-white hover:shadow-md transition-shadow">
                  <CardHeader className="bg-slate-50/70 border-b border-gray-150 p-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <span className="text-sm font-semibold text-slate-600">
                        Order ID: <span className="font-mono text-slate-900">{order.order_id}</span>
                      </span>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
                        order.status === 'CANCELLED' ? 'bg-red-50 text-red-700 border-red-200' :
                        order.status === 'DELIVERED' ? 'bg-green-50 text-green-700 border-green-200' :
                        order.status === 'RETURN_REQUESTED' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                        order.status === 'RETURN_APPROVED' ? 'bg-teal-50 text-teal-700 border-teal-200' :
                        order.status === 'RETURNED' || order.status === 'REFUNDED' ? 'bg-gray-50 text-gray-700 border-gray-200' :
                        'bg-blue-50 text-blue-700 border-blue-200'
                      }`}>
                        {order.status}
                      </span>
                    </div>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
                      <img
                        src={order.image_url || 'https://via.placeholder.com/100?text=No+Image'}
                        alt={order.name}
                        className="h-24 w-24 rounded-lg object-cover bg-slate-100 border border-gray-150"
                        onError={(e) => {
                          e.target.src = 'https://via.placeholder.com/100?text=No+Image';
                        }}
                      />
                      <div className="flex-grow text-center sm:text-left space-y-1">
                        <h3 className="text-xl font-bold text-slate-800">{order.name}</h3>
                        <p className="text-sm text-slate-500 line-clamp-2">{order.description || 'No description available.'}</p>
                        
                        {order.status === 'CANCELLED' && order.cancellation_reason && (
                          <p className="text-xs font-semibold text-red-500">Cancellation Reason: {order.cancellation_reason}</p>
                        )}
                        {order.status === 'RETURN_REQUESTED' && order.return_reason && (
                          <p className="text-xs font-semibold text-amber-500">Return Reason: {order.return_reason}</p>
                        )}

                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-3 text-xs sm:text-sm text-slate-600">
                          <div>
                            <p className="text-xs text-gray-400">Price per Unit</p>
                            <p className="font-semibold text-slate-800">₹{parseFloat(order.price_per_unit).toFixed(2)}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-400">Quantity</p>
                            <p className="font-semibold text-slate-800">{order.quantity}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-400">Total Price</p>
                            <p className="font-semibold text-slate-800">₹{parseFloat(order.total_price).toFixed(2)}</p>
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
              );
            })}
          </div>
        )}
      </main>
      <Footer />

      {/* Cancellation Reason Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-xl max-w-md w-full p-6 space-y-4 border border-gray-100 shadow-2xl">
            <h3 className="text-lg font-bold text-slate-800 text-left border-b border-gray-100 pb-2">Cancel Order</h3>
            <form onSubmit={handleCancelSubmit} className="space-y-4 text-left">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-600">Select Cancellation Reason</label>
                <select
                  value={cancelReason}
                  onChange={e => setCancelReason(e.target.value)}
                  className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#00ABE4]"
                >
                  <option value="Changed my mind">Changed my mind</option>
                  <option value="Found better price elsewhere">Found better price elsewhere</option>
                  <option value="Shipping time was too long">Shipping time was too long</option>
                  <option value="Wrong item ordered">Wrong item ordered</option>
                </select>
              </div>
              <div className="flex justify-end gap-3 pt-3 border-t border-gray-100">
                <Button type="button" variant="outline" onClick={() => setShowCancelModal(false)}>Back</Button>
                <Button type="submit" variant="destructive">Confirm Cancel</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Return Reason Modal */}
      {showReturnModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-xl max-w-md w-full p-6 space-y-4 border border-gray-100 shadow-2xl">
            <h3 className="text-lg font-bold text-slate-800 text-left border-b border-gray-100 pb-2">Request Order Return</h3>
            <form onSubmit={handleReturnSubmit} className="space-y-4 text-left">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-600">Select Return Reason</label>
                <select
                  value={returnReason}
                  onChange={e => setReturnReason(e.target.value)}
                  className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#00ABE4]"
                >
                  <option value="Defective product">Defective product / Doesn&apos;t work</option>
                  <option value="Wrong size/item delivered">Wrong size/item delivered</option>
                  <option value="Product not as described">Product not as described</option>
                  <option value="Damaged packaging or item">Damaged packaging or item</option>
                </select>
              </div>
              <div className="flex justify-end gap-3 pt-3 border-t border-gray-100">
                <Button type="button" variant="outline" onClick={() => setShowReturnModal(false)}>Back</Button>
                <Button type="submit" className="bg-amber-500 hover:bg-amber-600 text-white">Confirm Return</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Write Product Review Modal */}
      {showReviewModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-xl max-w-md w-full p-6 space-y-4 border border-gray-100 shadow-2xl">
            <h3 className="text-lg font-bold text-slate-800 text-left border-b border-gray-100 pb-2">Write Product Review</h3>
            <form onSubmit={handleReviewSubmit} className="space-y-4 text-left">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-600">Rating (1 to 5 Stars)</label>
                <div className="flex gap-2 text-2xl pt-1">
                  {[1, 2, 3, 4, 5].map(star => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setReviewRating(star)}
                      className={`hover:scale-115 transition-transform cursor-pointer ${star <= reviewRating ? 'text-amber-500' : 'text-gray-300'}`}
                    >
                      ★
                    </button>
                  ))}
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-600">Review Comments</label>
                <textarea
                  value={reviewComment}
                  onChange={e => setReviewComment(e.target.value)}
                  rows="3"
                  className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#00ABE4] focus:border-[#00ABE4]"
                  placeholder="Share your experience with this product..."
                  required
                />
              </div>
              <div className="flex justify-end gap-3 pt-3 border-t border-gray-100">
                <Button type="button" variant="outline" onClick={() => setShowReviewModal(false)}>Cancel</Button>
                <Button type="submit">Submit Review</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
