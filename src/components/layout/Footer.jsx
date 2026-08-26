import React, { useState } from 'react';
import { 
  Mail, 
  Phone, 
  MapPin, 
  Truck, 
  RotateCcw, 
  ShieldCheck, 
  Headphones, 
  Send 
} from 'lucide-react';
import Logo from '@/components/layout/Logo';

export function Footer() {
  const [email, setEmail] = useState('');

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (!email.trim()) return;
    alert(`Thank you for subscribing with: ${email}`);
    setEmail('');
  };

  return (
    <footer className="bg-[#0B1517] border-t border-teal-950 text-slate-400 mt-auto font-sans">
      {/* Top Section: Trust Badges */}
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-10 border-b border-white/5">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 text-left">
          <div className="flex items-center gap-4 p-4 rounded-2xl bg-white/[0.02] border border-white/[0.03] hover:bg-white/[0.04] transition-colors">
            <div className="p-3 bg-brand/10 rounded-xl text-brand">
              <Truck className="h-6 w-6" strokeWidth={2} />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">Free & Fast Delivery</h4>
              <p className="text-xs text-slate-500 mt-0.5">On all orders above ₹499</p>
            </div>
          </div>

          <div className="flex items-center gap-4 p-4 rounded-2xl bg-white/[0.02] border border-white/[0.03] hover:bg-white/[0.04] transition-colors">
            <div className="p-3 bg-brand/10 rounded-xl text-brand">
              <RotateCcw className="h-6 w-6" strokeWidth={2} />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">7-Day Easy Returns</h4>
              <p className="text-xs text-slate-500 mt-0.5">No questions asked refund</p>
            </div>
          </div>

          <div className="flex items-center gap-4 p-4 rounded-2xl bg-white/[0.02] border border-white/[0.03] hover:bg-white/[0.04] transition-colors">
            <div className="p-3 bg-brand/10 rounded-xl text-brand">
              <ShieldCheck className="h-6 w-6" strokeWidth={2} />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">100% Secure Checkout</h4>
              <p className="text-xs text-slate-500 mt-0.5">Powered by Razorpay Gateway</p>
            </div>
          </div>

          <div className="flex items-center gap-4 p-4 rounded-2xl bg-white/[0.02] border border-white/[0.03] hover:bg-white/[0.04] transition-colors">
            <div className="p-3 bg-brand/10 rounded-xl text-brand">
              <Headphones className="h-6 w-6" strokeWidth={2} />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">Dedicated Support</h4>
              <p className="text-xs text-slate-500 mt-0.5">24/7 online live assistance</p>
            </div>
          </div>
        </div>
      </div>

      {/* Middle Section: Main Directory */}
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12 text-left">
          {/* Brand Info & Social Links */}
          <div className="space-y-6">
            <Logo size="large" variant="light" />
            <p className="text-sm leading-relaxed text-slate-500">
              ShopKart brings you the finest selection of gadgets, fashion essentials, and lifestyle accessories. Enjoy seamless online shopping with premium support.
            </p>
            
            {/* Social Links using Inline SVGs for version safety */}
            <div className="flex items-center gap-3">
              {/* Facebook */}
              <a 
                href="https://facebook.com" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="h-9 w-9 rounded-xl bg-white/[0.03] border border-white/[0.05] flex items-center justify-center text-slate-400 hover:text-white hover:bg-brand hover:border-brand transition-all duration-300"
              >
                <svg className="h-4.5 w-4.5 fill-current" viewBox="0 0 24 24">
                  <path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z"/>
                </svg>
              </a>

              {/* Twitter / X */}
              <a 
                href="https://twitter.com" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="h-9 w-9 rounded-xl bg-white/[0.03] border border-white/[0.05] flex items-center justify-center text-slate-400 hover:text-white hover:bg-brand hover:border-brand transition-all duration-300"
              >
                <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
              </a>

              {/* Instagram */}
              <a 
                href="https://instagram.com" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="h-9 w-9 rounded-xl bg-white/[0.03] border border-white/[0.05] flex items-center justify-center text-slate-400 hover:text-white hover:bg-brand hover:border-brand transition-all duration-300"
              >
                <svg className="h-4.5 w-4.5 fill-current" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204 0-3.584.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.051.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
                </svg>
              </a>

              {/* Youtube */}
              <a 
                href="https://youtube.com" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="h-9 w-9 rounded-xl bg-white/[0.03] border border-white/[0.05] flex items-center justify-center text-slate-400 hover:text-white hover:bg-brand hover:border-brand transition-all duration-300"
              >
                <svg className="h-4.5 w-4.5 fill-current" viewBox="0 0 24 24">
                  <path d="M23.498 6.163a3.003 3.003 0 00-2.11-2.11C19.518 3.545 12 3.545 12 3.545s-7.518 0-9.388.507a3.003 3.003 0 00-2.11 2.11C0 8.033 0 12 0 12s0 3.967.502 5.837a3.003 3.003 0 002.11 2.11c1.87.507 9.388.507 9.388.507s7.518 0 9.388-.507a3.003 3.003 0 002.11-2.11C24 15.967 24 12 24 12s0-3.967-.502-5.837zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                </svg>
              </a>
            </div>
          </div>

          {/* Catalog Categories */}
          <div>
            <h4 className="text-xs font-black text-white uppercase tracking-widest mb-6 relative after:content-[''] after:absolute after:left-0 after:bottom-[-8px] after:h-0.5 after:w-8 after:bg-brand">
              Shop Categories
            </h4>
            <ul className="space-y-3.5 text-sm">
              {[
                { label: 'Shirts & Tops', path: '/?search=shirt' },
                { label: 'Pants & Jeans', path: '/?search=pants' },
                { label: 'Smartphones', path: '/?search=mobile' },
                { label: 'Mobile Accessories', path: '/?search=charger' },
                { label: 'Lifestyle Accessories', path: '/?search=wallet' },
                { label: 'Beauty & Skincare', path: '/?search=cream' },
                { label: 'Books & Literature', path: '/?search=habits' }
              ].map(item => (
                <li key={item.label}>
                  <a href={item.path} className="hover:text-white hover:translate-x-1.5 transition-all duration-300 inline-block">
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Customer Care */}
          <div>
            <h4 className="text-xs font-black text-white uppercase tracking-widest mb-6 relative after:content-[''] after:absolute after:left-0 after:bottom-[-8px] after:h-0.5 after:w-8 after:bg-brand">
              Customer Care
            </h4>
            <ul className="space-y-3.5 text-sm">
              {[
                { label: 'Track Order', path: '/orders' },
                { label: 'Shipping Policy', path: '#' },
                { label: 'Returns & Refund', path: '/orders' },
                { label: 'Secure Payments', path: '#' },
                { label: 'Help & FAQ', path: '#' },
                { label: 'Privacy Policy', path: '#' },
                { label: 'Terms of Service', path: '#' }
              ].map(item => (
                <li key={item.label}>
                  <a href={item.path} className="hover:text-white hover:translate-x-1.5 transition-all duration-300 inline-block">
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact & Newsletter Subscription */}
          <div className="space-y-6">
            <div>
              <h4 className="text-xs font-black text-white uppercase tracking-widest mb-6 relative after:content-[''] after:absolute after:left-0 after:bottom-[-8px] after:h-0.5 after:w-8 after:bg-brand">
                Newsletter
              </h4>
              <p className="text-xs text-slate-500 leading-relaxed mb-4">
                Subscribe to get notified about sales updates, special vouchers, and discount alerts.
              </p>
              
              <form onSubmit={handleSubscribe} className="flex rounded-xl overflow-hidden border border-white/5 bg-white/[0.02] focus-within:border-brand/40 focus-within:ring-2 focus-within:ring-brand/10 transition-all p-1">
                <input 
                  type="email" 
                  placeholder="Enter email..." 
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="flex-1 bg-transparent px-3 py-2 text-xs text-white placeholder:text-slate-600 focus:outline-none"
                  required
                />
                <button type="submit" className="bg-brand hover:bg-brand-hover text-white px-4.5 rounded-lg flex items-center justify-center transition-colors cursor-pointer">
                  <Send className="h-3.5 w-3.5" />
                </button>
              </form>
            </div>

            <div className="space-y-3.5 text-sm pt-2">
              <div className="flex items-center gap-3">
                <Mail className="h-4.5 w-4.5 text-brand shrink-0" />
                <span className="text-slate-400 hover:text-white transition-colors cursor-pointer">support@shopkart.com</span>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="h-4.5 w-4.5 text-brand shrink-0" />
                <span className="text-slate-400 hover:text-white transition-colors cursor-pointer">1800-123-4567</span>
              </div>
              <div className="flex items-start gap-3">
                <MapPin className="h-4.5 w-4.5 text-brand shrink-0 mt-0.5" />
                <span className="leading-relaxed">123 Commerce Street, Mumbai, 400001</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Section: Footer Meta */}
      <div className="bg-[#080E10] py-6 border-t border-white/5 text-xs">
        <div className="max-w-7xl mx-auto px-4 md:px-6 flex flex-col md:flex-row justify-between items-center gap-4 text-center md:text-left">
          <p>© {new Date().getFullYear()} ShopKart. All rights reserved.</p>
          
          {/* Payment Badges */}
          <div className="flex flex-wrap items-center gap-2">
            {['UPI', 'Razorpay', 'VISA', 'Mastercard', 'RuPay', 'NetBanking'].map(badge => (
              <span key={badge} className="px-2.5 py-1 text-[10px] font-black text-slate-500 bg-white/[0.02] border border-white/[0.05] rounded-md tracking-wider">
                {badge}
              </span>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
