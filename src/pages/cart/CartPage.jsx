import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Trash2, Minus, Plus, ShoppingBag, MapPin, Sparkles, Truck } from "lucide-react";
import { StoreLayout } from "@/components/layout/StoreLayout";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import { IMAGE_FALLBACK } from "@/lib/placeholder";
import { getCartItems, removeCartItem, updateCartItem } from "@/api/cart";
import { getAddresses } from "@/api/addresses";
import { request } from "@/api/client";
import { apiCache } from "@/api/cache";

const loadRazorpay = () => {
  if (window.Razorpay) return Promise.resolve();
  return new Promise((resolve, reject) => {
    const existing = document.getElementById("razorpay-checkout-script");
    if (existing) {
      existing.addEventListener("load", () => resolve(), { once: true });
      existing.addEventListener("error", () => reject(new Error("Failed to load Razorpay")), { once: true });
      return;
    }
    const script = document.createElement("script");
    script.id = "razorpay-checkout-script";
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Failed to load Razorpay"));
    document.body.appendChild(script);
  });
};

const CartPage = () => {
  const [cartItems, setCartItems] = useState([]);
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Address states
  const [addresses, setAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const toast = useToast();

  const fetchCartItems = async () => {
    try {
      const data = await getCartItems();
      setCartItems(
        data?.cart?.products.map((item) => ({
          ...item,
          total_price: parseFloat(item.total_price).toFixed(2),
          price_per_unit: parseFloat(item.price_per_unit).toFixed(2),
        })) || []
      );
      setUsername(data?.username || "");
    } catch (error) {
      console.error("Error fetching cart items:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAddresses = async () => {
    try {
      const data = await getAddresses();
      setAddresses(data || []);
      if (data && data.length > 0) {
        const defaultAddr = data.find((a) => a.isDefault || a.default) || data[0];
        setSelectedAddressId(defaultAddr.id || defaultAddr.addressId);
      }
    } catch (err) {
      console.error("Error loading addresses", err);
    }
  };

  useEffect(() => {
    fetchCartItems();
    fetchAddresses();
  }, []);

  // Remove item from the cart
  const handleRemoveItem = async (productId) => {
    try {
      await removeCartItem(productId);
      setCartItems((prevItems) => prevItems.filter((item) => item.product_id !== productId));
    } catch (error) {
      console.error("Error removing item:", error);
    }
  };

  // Update quantity of an item
  const handleQuantityChange = async (productId, newQuantity) => {
    try {
      if (newQuantity <= 0) {
        handleRemoveItem(productId);
        return;
      }
      await updateCartItem(productId, newQuantity);
      setCartItems((prevItems) =>
        prevItems.map((item) =>
          item.product_id === productId
            ? {
                ...item,
                quantity: newQuantity,
                total_price: (item.price_per_unit * newQuantity).toFixed(2),
              }
            : item
        )
      );
    } catch (error) {
      console.error("Error updating quantity:", error);
    }
  };

  const subtotal = cartItems
    .reduce((total, item) => total + parseFloat(item.total_price), 0)
    .toFixed(2);

  // Razorpay integration for payment
  const handleCheckout = async () => {
    if (!selectedAddressId) {
      toast.error("Please select a delivery address first!");
      return;
    }

    const razorpayKeyId = import.meta.env.VITE_RAZORPAY_KEY_ID;
    if (!razorpayKeyId || razorpayKeyId.startsWith("your-razorpay")) {
      toast.error("Payments aren't configured yet. Set VITE_RAZORPAY_KEY_ID to enable checkout.");
      return;
    }

    try {
      await loadRazorpay();

      // Create Razorpay order via backend, passing addressId
      const razorpayOrderId = await request("/api/payment/create", {
        method: "POST",
        body: { addressId: selectedAddressId },
        parse: "text",
      });

      // Open Razorpay checkout interface. `order_id` is the single source of truth
      // for the charged amount (it was computed server-side from the DB cart) - we
      // deliberately omit `amount` here since a client-computed value that drifts
      // from the order's actual amount causes Razorpay to reject the checkout.
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        currency: "INR",
        name: "ShopKart",
        description: "Order Payment",
        order_id: razorpayOrderId,
        handler: async function (response) {
          try {
            await request("/api/payment/verify", {
              method: "POST",
              body: {
                razorpayOrderId: response.razorpay_order_id,
                razorpayPaymentId: response.razorpay_payment_id,
                razorpaySignature: response.razorpay_signature,
              },
              parse: "text",
            });
            apiCache.invalidate("cart");
            toast.success("Payment verified successfully!");
            navigate("/orders");
          } catch (error) {
            console.error("Error verifying payment:", error);
            toast.error("Payment verification failed. Please try again.");
          }
        },
        prefill: {
          name: username,
        },
        theme: { color: "#F97316" },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (error) {
      toast.error("Payment failed. Please try again: " + error.message);
      console.error("Error during checkout:", error);
    }
  };

  const totalProducts = () => cartItems.reduce((acc, item) => acc + item.quantity, 0);

  const shipping = (totalProducts() > 0 && parseFloat(subtotal) < 499) ? (5.0 * 74).toFixed(2) : "0.00"; // Free delivery above 499

  return (
    <StoreLayout cartCount={totalProducts()} username={username} mainClassName="flex-grow max-w-7xl mx-auto w-full py-8 px-4 md:px-8">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: 'easeOut' }}
          className="flex flex-col lg:flex-row gap-8"
        >
          <div className="flex-grow lg:w-2/3 space-y-6">
            <Card className="bg-surface border border-border shadow-sm rounded-2xl overflow-hidden">
              <CardHeader className="border-b border-border bg-muted-bg/50">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-brand-light">
                    <ShoppingBag className="h-5 w-5 text-brand" strokeWidth={2} />
                  </div>
                  <div>
                    <CardTitle className="text-xl font-bold text-ink">Shopping Cart</CardTitle>
                    <CardDescription>
                      {cartItems.length} item{cartItems.length === 1 ? "" : "s"} in your cart
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                {loading ? (
                  <div className="space-y-4 animate-pulse">
                    {Array.from({ length: 3 }).map((_, i) => (
                      <div key={i} className="flex items-center gap-5 bg-muted-bg/60 rounded-2xl p-4">
                        <div className="h-24 w-24 rounded-xl bg-border/60 shrink-0" />
                        <div className="flex-grow space-y-2">
                          <div className="h-4 w-2/5 rounded bg-border/60" />
                          <div className="h-3 w-3/5 rounded bg-border/40" />
                          <div className="h-3 w-1/5 rounded bg-border/40" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : cartItems.length === 0 ? (
                  <div className="text-center py-20">
                    <div className="p-5 rounded-full bg-muted-bg inline-flex mb-4">
                      <ShoppingBag className="w-10 h-10 text-ink-muted/60" strokeWidth={1.5} />
                    </div>
                    <p className="text-lg font-semibold mb-2 text-ink">Your cart is empty</p>
                    <p className="text-sm text-ink-muted mb-4">Add some products to get started</p>
                    <Button onClick={() => navigate("/")} size="sm">
                      Start Shopping
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <AnimatePresence initial={false}>
                    {cartItems.map((item) => (
                      <motion.div
                        key={item.product_id}
                        layout
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, x: -24, transition: { duration: 0.2 } }}
                        transition={{ duration: 0.25, ease: 'easeOut' }}
                        className="relative flex flex-col sm:flex-row items-center gap-5 bg-surface border border-border rounded-2xl p-4 sm:p-5 hover:shadow-md hover:border-brand-muted/50 transition-all"
                      >
                        <img
                          src={item.image_url || IMAGE_FALLBACK}
                          alt={item.name}
                          className="h-24 w-24 sm:h-28 sm:w-28 rounded-xl object-cover bg-muted-bg border border-border flex-shrink-0"
                          onError={(e) => { e.target.src = IMAGE_FALLBACK; }}
                        />
                        <div className="flex-grow min-w-0 text-center sm:text-left space-y-1.5">
                          <h3 className="text-base font-bold text-ink line-clamp-1">{item.name}</h3>
                          <p className="text-xs text-ink-muted line-clamp-2 max-w-md">{item.description}</p>
                          <div className="flex items-center justify-center sm:justify-start gap-1.5 pt-0.5">
                            <span className="text-sm font-bold text-brand">₹{parseFloat(item.price_per_unit).toFixed(2)}</span>
                            <span className="text-xs text-ink-muted">per unit</span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between gap-5 w-full sm:w-auto pt-3 sm:pt-0 mt-1 sm:mt-0 border-t sm:border-t-0 border-border sm:flex-col sm:items-end">
                          <div className="flex items-center border border-border rounded-xl overflow-hidden bg-muted-bg p-1">
                            <button
                              onClick={() => handleQuantityChange(item.product_id, item.quantity - 1)}
                              className="px-2.5 py-1.5 hover:bg-surface rounded-lg text-ink transition-colors cursor-pointer"
                              aria-label="Decrease quantity"
                            >
                              <Minus className="h-3.5 w-3.5" strokeWidth={2.5} />
                            </button>
                            <span className="px-3 py-1.5 text-sm font-black text-ink min-w-[2.25rem] text-center">{item.quantity}</span>
                            <button
                              onClick={() => handleQuantityChange(item.product_id, item.quantity + 1)}
                              className="px-2.5 py-1.5 hover:bg-surface rounded-lg text-ink transition-colors cursor-pointer"
                              aria-label="Increase quantity"
                            >
                              <Plus className="h-3.5 w-3.5" strokeWidth={2.5} />
                            </button>
                          </div>

                          <div className="flex items-center gap-2">
                            <span className="text-lg font-extrabold text-ink">₹{parseFloat(item.total_price).toFixed(2)}</span>
                            <button
                              className="text-ink-muted hover:text-danger hover:bg-red-50 p-2 rounded-xl transition-all cursor-pointer"
                              onClick={() => handleRemoveItem(item.product_id)}
                              title="Remove item"
                              aria-label="Remove item"
                            >
                              <Trash2 className="h-4 w-4" strokeWidth={2} />
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                    </AnimatePresence>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Delivery Address Selector */}
            {cartItems.length > 0 && (
              <Card className="bg-surface border border-border shadow-sm rounded-2xl overflow-hidden">
                <CardHeader className="border-b border-border flex flex-row items-center justify-between bg-muted-bg/50">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-brand-light">
                      <MapPin className="h-5 w-5 text-brand" strokeWidth={2} />
                    </div>
                    <div>
                      <CardTitle className="text-lg font-bold text-ink">Delivery Address</CardTitle>
                      <CardDescription>Where should we ship your order?</CardDescription>
                    </div>
                  </div>
                  <Button onClick={() => navigate("/addresses")} variant="outline" size="sm" className="text-xs font-bold">
                    Manage Addresses
                  </Button>
                </CardHeader>
                <CardContent className="p-6">
                  {addresses.length === 0 ? (
                    <div className="text-center py-6 border border-dashed border-border rounded-lg bg-muted-bg text-sm">
                      <p className="text-ink-muted mb-2 font-medium">No saved addresses found</p>
                      <Button onClick={() => navigate("/addresses")} size="sm" className="font-bold text-xs">
                        Add Shipping Address
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-3 max-h-60 overflow-y-auto overscroll-contain pr-1">
                      {addresses.map((addr) => (
                        <label
                          key={addr.id}
                          className={`flex items-start gap-3 p-4 border rounded-xl cursor-pointer select-none transition-all ${
                            selectedAddressId === addr.id
                              ? 'border-brand bg-brand-light/50 shadow-sm'
                              : 'border-border hover:bg-muted-bg hover:border-ink-muted/30'
                          }`}
                        >
                          <input
                            type="radio"
                            name="deliveryAddress"
                            checked={selectedAddressId === addr.id}
                            onChange={() => setSelectedAddressId(addr.id)}
                            className="mt-1 h-4 w-4 border-border text-brand focus:ring-brand/30"
                          />
                          <div className="text-left space-y-0.5 text-sm">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-ink">{addr.fullName}</span>
                              {addr.default && (
                                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-semibold bg-brand-light text-brand">
                                  Default
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-ink-muted">{addr.streetAddress}, {addr.city}, {addr.state} - {addr.zipCode}</p>
                            <p className="text-[10px] text-ink-muted/70">Phone: {addr.phoneNumber}</p>
                          </div>
                        </label>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>

          {/* Checkout Card */}
          {cartItems.length > 0 && (
            <div className="w-full lg:w-1/3">
              <Card className="bg-surface border border-border shadow-sm rounded-2xl sticky top-28 overflow-hidden">
                <CardHeader className="border-b border-border bg-muted-bg/50">
                  <CardTitle className="text-lg font-bold text-ink">Order Summary</CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                  <div className="flex justify-between items-center text-sm text-ink-muted">
                    <span>Subtotal</span>
                    <span className="font-semibold text-ink">₹{subtotal}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm text-ink-muted">
                    <span className="flex items-center gap-1.5">
                      <Truck className="h-3.5 w-3.5" strokeWidth={2} />
                      Shipping
                    </span>
                    <span className="font-semibold text-ink">
                      {shipping === "0.00" ? <span className="text-success">FREE</span> : `₹${shipping}`}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-sm text-ink-muted">
                    <span>Total Products</span>
                    <span className="font-semibold text-ink">{totalProducts()}</span>
                  </div>
                  {shipping !== "0.00" && (
                    <div className="flex items-start gap-2 bg-brand-light/60 text-brand text-xs font-medium rounded-lg p-2.5">
                      <Sparkles className="h-3.5 w-3.5 shrink-0 mt-0.5" strokeWidth={2} />
                      <span>Add ₹{(499 - parseFloat(subtotal)).toFixed(2)} more to unlock free delivery</span>
                    </div>
                  )}
                  <div className="border-t border-border pt-4 flex justify-between items-center">
                    <span className="text-base font-bold text-ink">Grand Total</span>
                    <span className="text-2xl font-extrabold text-ink">
                      ₹{(parseFloat(subtotal) + parseFloat(shipping)).toFixed(2)}
                    </span>
                  </div>
                </CardContent>
                <CardFooter className="p-6 pt-0">
                  <Button 
                    onClick={handleCheckout} 
                    className="w-full font-bold text-sm h-11"
                    variant="default"
                  >
                    Proceed to Checkout
                  </Button>
                </CardFooter>
              </Card>
            </div>
          )}
        </motion.div>
    </StoreLayout>
  );
};

export default CartPage;