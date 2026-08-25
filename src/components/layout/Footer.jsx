import React from 'react';
import { Mail, Phone, MapPin } from 'lucide-react';
import Logo from '@/components/layout/Logo';

export function Footer() {
  return (
    <footer className="bg-ink text-white/70 mt-auto">
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
          <div className="space-y-4">
            <Logo size="large" />
            <p className="text-sm leading-relaxed text-white/50 max-w-xs">
              ShopKart brings you the best deals on electronics, fashion, and everyday essentials — delivered fast to your door.
            </p>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-white mb-4">Shop</h4>
            <ul className="space-y-2.5 text-sm">
              {['Electronics', 'Fashion', 'Mobiles', 'Accessories', 'Home & Kitchen'].map(item => (
                <li key={item}><a href="#" className="hover:text-brand-muted transition-colors">{item}</a></li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-white mb-4">Help</h4>
            <ul className="space-y-2.5 text-sm">
              {['Track Order', 'Returns', 'Shipping Info', 'FAQs', 'Contact Us'].map(item => (
                <li key={item}><a href="#" className="hover:text-brand-muted transition-colors">{item}</a></li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-white mb-4">Contact</h4>
            <ul className="space-y-3 text-sm">
              <li className="flex items-center gap-2.5">
                <Mail className="h-4 w-4 text-brand shrink-0" strokeWidth={2} />
                support@shopkart.com
              </li>
              <li className="flex items-center gap-2.5">
                <Phone className="h-4 w-4 text-brand shrink-0" strokeWidth={2} />
                1800-123-4567
              </li>
              <li className="flex items-start gap-2.5">
                <MapPin className="h-4 w-4 text-brand shrink-0 mt-0.5" strokeWidth={2} />
                <span>123 Commerce Street, Mumbai 400001</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-white/10 flex flex-col sm:flex-row justify-between items-center gap-3 text-xs text-white/40">
          <p>© {new Date().getFullYear()} ShopKart. All rights reserved.</p>
          <div className="flex gap-5">
            <a href="#" className="hover:text-white/70 transition-colors">Privacy</a>
            <a href="#" className="hover:text-white/70 transition-colors">Terms</a>
            <a href="#" className="hover:text-white/70 transition-colors">Cookies</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
