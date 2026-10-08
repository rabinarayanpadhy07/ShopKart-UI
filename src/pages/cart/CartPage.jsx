import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Trash2, Minus, Plus, ShoppingBag, MapPin, Truck, ArrowLeft, ShieldCheck } from "lucide-react";
import { StoreLayout } from "@/components/layout/StoreLayout";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import { IMAGE_FALLBACK } from "@/lib/placeholder";
import { getProductImage } from "@/lib/productImages";
import { formatPrice, FREE_DELIVERY_THRESHOLD } from "@/lib/format";
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

// Flat delivery fee below the free-delivery threshold (mirrors PaymentController).
const DELIVERY_FEE = 370;

const CartPage = () => {
  const [cartItems, setCartItems] = useState([]);
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Address states
  const [addresses, setAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [paying, setPaying] = useState(false);
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
    const removed = cartItems.find((item) => item.product_id === productId);
    try {
      await removeCartItem(productId);
      setCartItems((prevItems) => prevItems.filter((item) => item.product_id !== productId));
      toast.info(removed ? `Removed ${removed.name}` : "Item removed");
    } catch (error) {
      console.error("Error removing item:", error);
      toast.error(error.message || "Couldn't remove this item. Please try again.");
    }
  };

  // Update quantity of an item
  const handleQuantityChange = async (productId, newQuantity) => {
    if (newQuantity <= 0) {
      handleRemoveItem(productId);
      return;
    }
    try {
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
      toast.error(error.message || "Couldn't update the quantity. Please try again.");
    }
  };

  const subtotal = cartItems.reduce((total, item) => total + parseFloat(item.total_price), 0);
  const itemCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);
  // Must match PaymentController: a flat delivery fee applies below the free-delivery threshold.
  const shipping = itemCount > 0 && subtotal < FREE_DELIVERY_THRESHOLD ? DELIVERY_FEE : 0;
  const grandTotal = subtotal + shipping;
  const freeDeliveryProgress = Math.min(100, (subtotal / FREE_DELIVERY_THRESHOLD) * 100);

  // Razorpay integration for payment
  const handleCheckout = async () => {
    if (!selectedAddressId) {
      toast.error("Choose a delivery address to continue.");
      return;
    }

    const razorpayKeyId = import.meta.env.VITE_RAZORPAY_KEY_ID;
    if (!razorpayKeyId || razorpayKeyId.startsWith("your-razorpay")) {
      toast.error("Online payments aren't set up yet. Set VITE_RAZORPAY_KEY_ID to enable checkout.");
      return;
    }

    setPaying(true);
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
        description: `Order of ${itemCount} item${itemCount === 1 ? "" : "s"}`,
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
            toast.success("Payment received. Your order is confirmed!");
            navigate("/orders");
          } catch (error) {
            console.error("Error verifying payment:", error);
            toast.error("We couldn't verify your payment. If money was deducted, it will be refunded automatically.");
          }
        },
        modal: { ondismiss: () => setPaying(false) },
        prefill: {
          name: username,
        },
        theme: { color: "#F97316" },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (error) {
      toast.error(`Checkout couldn't start: ${error.message}`);
      console.error("Error during checkout:", error);
      setPaying(false);
    }
  };

  return (
    <StoreLayout cartCount={itemCount} username={username} mainClassName="flex-1 w-full max-w-7xl mx-auto px-4 md:px-6 py-6 md:py-10">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-ink md:text-3xl">Your cart</h1>
          <p className="mt-1 text-sm text-ink-muted">
            {loading ? "Loading your items…" : itemCount === 0 ? "No items yet" : `${itemCount} item${itemCount === 1 ? "" : "s"} · ${formatPrice(subtotal)}`}
          </p>
        </div>
        {cartItems.length > 0 && (
          <Link to="/" className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand hover:underline">
            <ArrowLeft className="h-4 w-4" /> Continue shopping
          </Link>
        )}
      </div>

      {loading ? (
        <div className="space-y-3 animate-pulse" aria-hidden="true">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex gap-4 rounded-2xl border border-border bg-surface p-4">
              <div className="h-24 w-24 shrink-0 rounded-xl bg-muted-bg sm:h-28 sm:w-28" />
              <div className="flex-grow space-y-2 pt-1">
                <div className="h-4 w-2/5 rounded bg-muted-bg" />
                <div className="h-3 w-3/5 rounded bg-muted-bg" />
                <div className="h-8 w-28 rounded-xl bg-muted-bg" />
              </div>
            </div>
          ))}
        </div>
      ) : cartItems.length === 0 ? (
        <div className="flex flex-col items-center rounded-3xl border border-dashed border-border bg-surface px-6 py-20 text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-muted-bg">
            <ShoppingBag className="h-8 w-8 text-ink-muted" strokeWidth={1.5} />
          </div>
          <h2 className="text-lg font-semibold text-ink">Your cart is empty</h2>
          <p className="mt-1 max-w-sm text-sm text-ink-muted">
            Browse phones, laptops, fashion and more. Items you add will show up here.
          </p>
          <Button onClick={() => navigate("/")} className="mt-5">
            Start shopping
          </Button>
        </div>
      ) : (
        <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_380px]">
          <div className="min-w-0 space-y-6">
            {/* Items */}
            <section aria-label="Cart items" className="overflow-hidden rounded-2xl border border-border bg-surface">
              <ul className="divide-y divide-border">
                <AnimatePresence initial={false}>
                  {cartItems.map((item) => (
                    <motion.li
                      key={item.product_id}
                      layout
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: -24, transition: { duration: 0.2 } }}
                      transition={{ duration: 0.22, ease: "easeOut" }}
                      className="flex gap-4 p-4 sm:gap-5 sm:p-5"
                    >
                      <Link
                        to={`/product/${item.product_id}`}
                        className="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-muted-bg/70 sm:h-28 sm:w-28"
                        tabIndex={-1}
                        aria-hidden="true"
                      >
                        <img
                          src={getProductImage(item)}
                          alt=""
                          loading="lazy"
                          className="h-full w-full object-contain p-2 mix-blend-multiply transition-transform duration-300 hover:scale-105"
                          onError={(e) => { e.currentTarget.src = IMAGE_FALLBACK; }}
                        />
                      </Link>

                      <div className="flex min-w-0 flex-1 flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <div className="min-w-0 space-y-1">
                          <Link
                            to={`/product/${item.product_id}`}
                            className="line-clamp-2 text-sm font-semibold leading-snug text-ink hover:text-brand sm:text-base"
                          >
                            {item.name}
                          </Link>
                          {item.description && (
                            <p className="line-clamp-1 text-xs text-ink-muted sm:max-w-md">{item.description}</p>
                          )}
                          <p className="text-xs text-ink-muted">
                            {formatPrice(item.price_per_unit)} each
                          </p>
                        </div>

                        <div className="flex items-center justify-between gap-4 sm:flex-col sm:items-end sm:justify-start">
                          <p className="order-2 text-base font-bold text-ink sm:order-1 sm:text-lg">{formatPrice(item.total_price)}</p>
                          <div className="order-1 flex items-center gap-2 sm:order-2">
                            <div className="flex items-center rounded-xl border border-border">
                              <button
                                type="button"
                                onClick={() => handleQuantityChange(item.product_id, item.quantity - 1)}
                                className="flex h-8 w-8 items-center justify-center text-ink-muted hover:text-ink cursor-pointer"
                                aria-label={`Decrease quantity of ${item.name}`}
                              >
                                <Minus className="h-3.5 w-3.5" strokeWidth={2.5} />
                              </button>
                              <span className="w-8 text-center text-sm font-semibold text-ink" aria-live="polite">{item.quantity}</span>
                              <button
                                type="button"
                                onClick={() => handleQuantityChange(item.product_id, item.quantity + 1)}
                                className="flex h-8 w-8 items-center justify-center text-ink-muted hover:text-ink cursor-pointer"
                                aria-label={`Increase quantity of ${item.name}`}
                              >
                                <Plus className="h-3.5 w-3.5" strokeWidth={2.5} />
                              </button>
                            </div>
                            <button
                              type="button"
                              className="flex h-8 w-8 items-center justify-center rounded-xl text-ink-muted transition-colors hover:bg-red-50 hover:text-danger cursor-pointer"
                              onClick={() => handleRemoveItem(item.product_id)}
                              aria-label={`Remove ${item.name} from cart`}
                              title="Remove"
                            >
                              <Trash2 className="h-4 w-4" strokeWidth={2} />
                            </button>
                          </div>
                        </div>
                      </div>
                    </motion.li>
                  ))}
                </AnimatePresence>
              </ul>
            </section>

            {/* Delivery address */}
            <section aria-labelledby="address-heading" className="rounded-2xl border border-border bg-surface p-4 sm:p-5">
              <div className="mb-4 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <MapPin className="h-5 w-5 text-brand" strokeWidth={2} />
                  <h2 id="address-heading" className="text-base font-bold text-ink">Delivery address</h2>
                </div>
                <Button onClick={() => navigate("/addresses")} variant="outline" size="sm">
                  {addresses.length === 0 ? "Add address" : "Manage"}
                </Button>
              </div>
              {addresses.length === 0 ? (
                <p className="rounded-xl border border-dashed border-border bg-muted-bg/50 p-4 text-sm text-ink-muted">
                  You haven't saved an address yet. Add one to see delivery options and check out.
                </p>
              ) : (
                <div className="grid gap-3 sm:grid-cols-2">
                  {addresses.map((addr) => {
                    const selected = selectedAddressId === addr.id;
                    return (
                      <label
                        key={addr.id}
                        className={`flex cursor-pointer select-none items-start gap-3 rounded-xl border p-3.5 transition-colors ${
                          selected ? "border-brand bg-brand-light/60" : "border-border hover:bg-muted-bg/60"
                        }`}
                      >
                        <input
                          type="radio"
                          name="deliveryAddress"
                          checked={selected}
                          onChange={() => setSelectedAddressId(addr.id)}
                          className="mt-1 h-4 w-4 accent-brand"
                        />
                        <div className="min-w-0 space-y-0.5 text-sm">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-ink">{addr.fullName}</span>
                            {addr.default && (
                              <span className="rounded-full bg-brand-light px-2 py-0.5 text-[10px] font-semibold text-brand">Default</span>
                            )}
                          </div>
                          <p className="text-xs leading-relaxed text-ink-muted">
                            {addr.streetAddress}, {addr.city}, {addr.state} {addr.zipCode}
                          </p>
                          <p className="text-xs text-ink-muted">{addr.phoneNumber}</p>
                        </div>
                      </label>
                    );
                  })}
                </div>
              )}
            </section>
          </div>

          {/* Summary */}
          <aside aria-labelledby="summary-heading" className="rounded-2xl border border-border bg-surface p-5 lg:sticky lg:top-28">
            <h2 id="summary-heading" className="text-base font-bold text-ink">Order summary</h2>

            {shipping > 0 && (
              <div className="mt-4 rounded-xl bg-brand-light/70 p-3">
                <p className="text-xs font-medium text-ink">
                  Add <span className="font-bold text-brand">{formatPrice(FREE_DELIVERY_THRESHOLD - subtotal)}</span> more for free delivery
                </p>
                <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white">
                  <div className="h-full rounded-full bg-brand transition-all" style={{ width: `${freeDeliveryProgress}%` }} />
                </div>
              </div>
            )}

            <dl className="mt-4 space-y-2.5 text-sm">
              <div className="flex justify-between">
                <dt className="text-ink-muted">Items ({itemCount})</dt>
                <dd className="font-medium text-ink">{formatPrice(subtotal)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="flex items-center gap-1.5 text-ink-muted">
                  <Truck className="h-3.5 w-3.5" strokeWidth={2} /> Delivery
                </dt>
                <dd className="font-medium">{shipping === 0 ? <span className="text-success">Free</span> : formatPrice(shipping)}</dd>
              </div>
              <div className="flex items-baseline justify-between border-t border-border pt-3">
                <dt className="font-semibold text-ink">Total</dt>
                <dd className="text-2xl font-extrabold text-ink">{formatPrice(grandTotal)}</dd>
              </div>
              <p className="text-right text-[11px] text-ink-muted">Inclusive of all taxes</p>
            </dl>

            <Button onClick={handleCheckout} disabled={paying} size="lg" className="mt-4 w-full">
              {paying ? "Opening payment…" : `Pay ${formatPrice(grandTotal)}`}
            </Button>
            <p className="mt-3 flex items-center justify-center gap-1.5 text-xs text-ink-muted">
              <ShieldCheck className="h-3.5 w-3.5 text-success" /> Secure payment via Razorpay
            </p>
          </aside>
        </div>
      )}
    </StoreLayout>
  );
};

export default CartPage;
