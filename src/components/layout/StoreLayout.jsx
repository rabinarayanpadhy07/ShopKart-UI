import React from 'react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';

export function StoreLayout({
  children,
  cartCount = 0,
  username = 'Guest',
  onSearch,
  initialSearch,
  categoryNav,
  mainClassName = 'flex-1 max-w-7xl mx-auto w-full px-4 md:px-6 py-6 md:py-8',
}) {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header
        cartCount={cartCount}
        username={username}
        onSearch={onSearch}
        initialSearch={initialSearch}
      />
      {categoryNav}
      <main className={mainClassName}>{children}</main>
      <Footer />
    </div>
  );
}
