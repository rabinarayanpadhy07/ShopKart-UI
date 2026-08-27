import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Trash2, Minus, Plus, ShoppingBag, MapPin } from "lucide-react";
import { StoreLayout } from "@/components/layout/StoreLayout";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

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

  const fetchCartItems = async () => {
    try {
      const response = await fetch("/api/cart/items", {
        credentials: "include",
      });
      if (!response.ok) throw new Error("Failed to fetch cart items");
      const data = await response.json();

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
      const response = await fetch("/api/addresses", {
        credentials: "include"
      });
      if (response.ok) {
        const data = await response.json();
        setAddresses(data || []);
        if (data.length > 0) {
          // Select default or first address
          const defaultAddr = data.find(a => a.default) || data[0];
          setSelectedAddressId(defaultAddr.id);
        }
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
      const response = await fetch(`/api/cart/delete?productId=${productId}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (response.status === 204) {
        setCartItems((prevItems) => prevItems.filter((item) => item.product_id !== productId));
      } else throw new Error("Failed to remove item");
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
      const response = await fetch("/api/cart/update", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ productId, quantity: newQuantity }),
      });
      if (response.ok) {
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
      } else throw new Error("Failed to update quantity");
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
      alert("Please select a delivery address first!");
      return;
    }

    try {
      await loadRazorpay();

      // Create Razorpay order via backend, passing addressId
      const response = await fetch("/api/payment/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ addressId: selectedAddressId })
      });

      if (!response.ok) throw new Error(await response.text());
      const razorpayOrderId = await response.text();

      // Open Razorpay checkout interface
      const options = {
        key: "rzp_test_LqWBBDbgwot5lh", // Razorpay Key ID
        amount: Math.round((parseFloat(subtotal) + parseFloat(shipping)) * 100), // Grand total in paise
        currency: "INR",
        name: "ShopKart",
        description: "Test Transaction",
        order_id: razorpayOrderId,
        handler: async function (response) {
          try {
            // Payment success, verify on backend
            const verifyResponse = await fetch("/api/payment/verify", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              credentials: "include",
              body: JSON.stringify({
                razorpayOrderId: response.razorpay_order_id,
                razorpayPaymentId: response.razorpay_payment_id,
                razorpaySignature: response.razorpay_signature,
              }),
            });
            const result = await verifyResponse.text();
            if (verifyResponse.ok) {
              alert("Payment verified successfully!");
              navigate("/"); // Redirect to Customer Home Page
            } else {
              alert("Payment verification failed: " + result);
            }
          } catch (error) {
            console.error("Error verifying payment:", error);
            alert("Payment verification failed. Please try again.");
          }
        },
        prefill: {
          name: username,
          email: "test@example.com",
          contact: "9999999999",
        },
        theme: { color: "#F97316" },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (error) {
      alert("Payment failed. Please try again: " + error.message);
      console.error("Error during checkout:", error);
    }
  };

  const totalProducts = () => cartItems.reduce((acc, item) => acc + item.quantity, 0);

  const shipping = (totalProducts() > 0 && parseFloat(subtotal) < 499) ? (5.0 * 74).toFixed(2) : "0.00"; // Free delivery above 499

  return (
    <StoreLayout cartCount={totalProducts()} username={username} mainClassName="flex-grow max-w-7xl mx-auto w-full py-8 px-4 md:px-8">
        <div className="flex flex-col lg:flex-row gap-8">
          <div className="flex-grow lg:w-2/3 space-y-6">
            <Card className="bg-white border border-gray-100 shadow-sm rounded-xl overflow-hidden">
              <CardHeader className="border-b border-gray-100 bg-slate-50/50">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-brand-light">
                    <ShoppingBag className="h-5 w-5 text-brand" strokeWidth={2} />
                  </div>
                  <div>
                    <CardTitle className="text-xl font-bold text-slate-800">Shopping Cart</CardTitle>
                    <CardDescription>
                      {cartItems.length} item{cartItems.length === 1 ? "" : "s"} in your cart
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="divide-y divide-gray-150 p-6">
                {loading ? (
                  <div className="text-center py-10 text-slate-500">Loading your cart...</div>
                ) : cartItems.length === 0 ? (
                  <div className="text-center py-20 text-slate-500">
                    <div className="p-5 rounded-full bg-slate-100 inline-flex mb-4">
                      <ShoppingBag className="w-10 h-10 text-slate-300" strokeWidth={1.5} />
                    </div>
                    <p className="text-lg font-semibold mb-2 text-slate-700">Your Cart is Empty</p>
                    <p className="text-sm text-slate-400 mb-4">Add some products to get started</p>
            <Button onClick={() => navigate("/")} size="sm">
                      Start Shopping
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {cartItems.map((item) => (
                      <div key={item.product_id} className="p-4 flex flex-col sm:flex-row items-center gap-4 sm:gap-6 bg-white border border-gray-200 rounded-2xl hover:shadow-md transition-shadow">
                        <img
                          src={item.image_url || "https://via.placeholder.com/80?text=No+Image"}
                          alt={item.name}
                          className="h-24 w-24 rounded-xl object-cover bg-slate-50 border border-gray-100 flex-shrink-0"
                          onError={(e) => { e.target.src = "https://via.placeholder.com/80?text=No+Image"; }}
                        />
                        <div className="flex-grow text-center sm:text-left space-y-1">
                          <h3 className="text-base font-bold text-slate-800">{item.name}</h3>
                          <p className="text-xs text-slate-500 line-clamp-2 max-w-md">{item.description}</p>
                          <p className="text-sm font-semibold text-orange-500">₹{parseFloat(item.price_per_unit).toFixed(2)} each</p>
                        </div>
                        <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto">
                          {/* Quantity Selector */}
                          <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden bg-slate-50 p-1">
                            <button
                              onClick={() => handleQuantityChange(item.product_id, item.quantity - 1)}
                              className="px-2.5 py-1.5 hover:bg-white rounded-lg text-slate-600 transition-colors cursor-pointer"
                            >
                              <Minus className="h-3.5 w-3.5" strokeWidth={2.5} />
                            </button>
                            <span className="px-3 py-1.5 text-sm font-black text-slate-800 min-w-[2.25rem] text-center">{item.quantity}</span>
                            <button
                              onClick={() => handleQuantityChange(item.product_id, item.quantity + 1)}
                              className="px-2.5 py-1.5 hover:bg-white rounded-lg text-slate-600 transition-colors cursor-pointer"
                            >
                              <Plus className="h-3.5 w-3.5" strokeWidth={2.5} />
                            </button>
                          </div>
                          <div className="text-right min-w-[80px]">
                            <span className="text-base font-black text-slate-900">₹{parseFloat(item.total_price).toFixed(2)}</span>
                          </div>
                          <button
                            className="text-red-500 hover:text-red-700 hover:bg-red-50 p-2 rounded-xl transition-all border border-transparent hover:border-red-100 cursor-pointer"
                            onClick={() => handleRemoveItem(item.product_id)}
                            title="Remove item"
                          >
                            <Trash2 className="h-4 w-4" strokeWidth={2} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Delivery Address Selector */}
            {cartItems.length > 0 && (
              <Card className="bg-white border border-gray-100 shadow-sm rounded-xl overflow-hidden">
                <CardHeader className="border-b border-gray-100 flex flex-row items-center justify-between bg-slate-50/50">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-brand-light">
                      <MapPin className="h-5 w-5 text-brand" strokeWidth={2} />
                    </div>
                    <div>
                      <CardTitle className="text-lg font-bold text-slate-800">Delivery Address</CardTitle>
                      <CardDescription>Where should we ship your order?</CardDescription>
                    </div>
                  </div>
                  <Button onClick={() => navigate("/addresses")} variant="outline" size="sm" className="text-xs font-bold">
                    Manage Addresses
                  </Button>
                </CardHeader>
                <CardContent className="p-6">
                  {addresses.length === 0 ? (
                    <div className="text-center py-6 border border-dashed border-gray-300 rounded-lg bg-slate-50 text-sm">
                      <p className="text-slate-600 mb-2 font-medium">No saved addresses found</p>
                      <Button onClick={() => navigate("/addresses")} size="sm" className="font-bold text-xs">
                        Add Shipping Address
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
                      {addresses.map((addr) => (
                        <label 
                          key={addr.id} 
                          className={`flex items-start gap-3 p-4 border rounded-xl cursor-pointer select-none transition-all ${
                            selectedAddressId === addr.id
                              ? 'border-brand bg-brand-light/50 shadow-sm'
                              : 'border-gray-200 hover:bg-gray-50 hover:border-gray-300'
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
                              <span className="font-bold text-slate-800">{addr.fullName}</span>
                              {addr.default && (
                                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-semibold bg-brand-light text-brand">
                                  Default
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-slate-600">{addr.streetAddress}, {addr.city}, {addr.state} - {addr.zipCode}</p>
                            <p className="text-[10px] text-slate-400">Phone: {addr.phoneNumber}</p>
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
              <Card className="bg-white border border-gray-100 shadow-sm rounded-xl sticky top-28 overflow-hidden">
                <CardHeader className="border-b border-gray-100 bg-slate-50/50">
                  <CardTitle className="text-lg font-bold text-slate-800">Order Summary</CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                  <div className="flex justify-between items-center text-sm text-slate-600">
                    <span>Subtotal</span>
                    <span className="font-semibold text-slate-800">₹{subtotal}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm text-slate-600">
                    <span>Shipping</span>
                    <span className="font-semibold text-slate-800">₹{shipping}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm text-slate-600">
                    <span>Total Products</span>
                    <span className="font-semibold text-slate-800">{totalProducts()}</span>
                  </div>
                  <div className="border-t border-gray-200 pt-4 flex justify-between items-center">
                    <span className="text-base font-bold text-slate-800">Grand Total</span>
                    <span className="text-2xl font-extrabold text-slate-900">
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
        </div>
    </StoreLayout>
  );
};

export default CartPage;