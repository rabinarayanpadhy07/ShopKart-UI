import React, { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import HomePage from '@/pages/HomePage';

// Route-level code splitting for non-storefront and administrative pages
const LoginPage = lazy(() => import('@/pages/auth/LoginPage'));
const RegisterPage = lazy(() => import('@/pages/auth/RegisterPage'));
const AdminLoginPage = lazy(() => import('@/pages/auth/AdminLoginPage'));
const CartPage = lazy(() => import('@/pages/cart/CartPage'));
const OrdersPage = lazy(() => import('@/pages/orders/OrdersPage'));
const WishlistPage = lazy(() => import('@/pages/wishlist/WishlistPage'));
const AddressesPage = lazy(() => import('@/pages/account/AddressesPage'));
const AdminDashboard = lazy(() => import('@/pages/admin/AdminDashboard'));

function RouteLoadingFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-3">
        <div className="w-10 h-10 border-3 border-brand border-t-transparent rounded-full animate-spin" />
        <span className="text-xs font-semibold text-ink-muted">Loading...</span>
      </div>
    </div>
  );
}

export default function AppRoutes() {
  return (
    <Suspense fallback={<RouteLoadingFallback />}>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/cart" element={<CartPage />} />
        <Route path="/orders" element={<OrdersPage />} />
        <Route path="/wishlist" element={<WishlistPage />} />
        <Route path="/addresses" element={<AddressesPage />} />
        <Route path="/admin" element={<AdminLoginPage />} />
        <Route path="/admindashboard" element={<AdminDashboard />} />
      </Routes>
    </Suspense>
  );
}
