import React from 'react';
import { Routes, Route } from 'react-router-dom';
import HomePage from '@/pages/HomePage';
import LoginPage from '@/pages/auth/LoginPage';
import RegisterPage from '@/pages/auth/RegisterPage';
import AdminLoginPage from '@/pages/auth/AdminLoginPage';
import CartPage from '@/pages/CartPage';
import OrdersPage from '@/pages/OrdersPage';
import WishlistPage from '@/pages/WishlistPage';
import AddressesPage from '@/pages/AddressesPage';
import AdminDashboard from '@/pages/admin/AdminDashboard';

export default function AppRoutes() {
  return (
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
  );
}
