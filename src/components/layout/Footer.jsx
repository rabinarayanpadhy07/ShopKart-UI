import React from 'react';
import { Link } from 'react-router-dom';
import Logo from '@/components/layout/Logo';

const SHOP_LINKS = [
  { label: 'Mobiles', to: '/?category=Mobiles' },
  { label: 'Laptops', to: '/?category=Laptops' },
  { label: 'Fashion', to: '/?category=Shirts' },
  { label: 'Beauty', to: '/?category=Beauty' },
  { label: 'Books', to: '/?category=Books' },
];

const HELP_LINKS = [
  { label: 'Track order', to: '/orders' },
  { label: 'Returns', to: '/orders' },
  { label: 'Wishlist', to: '/wishlist' },
  { label: 'Addresses', to: '/addresses' },
];

const SOCIALS = [
  {
    label: 'Instagram',
    href: 'https://instagram.com',
    path: 'M12 2.16c3.2 0 3.58.01 4.85.07 3.25.15 4.77 1.69 4.92 4.92.06 1.27.07 1.65.07 4.85s-.01 3.58-.07 4.85c-.15 3.23-1.66 4.77-4.92 4.92-1.27.06-1.64.07-4.85.07s-3.58-.01-4.85-.07c-3.26-.15-4.77-1.7-4.92-4.92C2.17 15.58 2.16 15.2 2.16 12s.01-3.58.07-4.85C2.38 3.92 3.9 2.38 7.15 2.23 8.42 2.17 8.8 2.16 12 2.16zM12 0C8.74 0 8.33.01 7.05.07 2.7.27.27 2.69.07 7.05.01 8.33 0 8.74 0 12s.01 3.67.07 4.95c.2 4.36 2.62 6.78 6.98 6.98C8.33 23.99 8.74 24 12 24s3.67-.01 4.95-.07c4.35-.2 6.78-2.62 6.98-6.98.06-1.28.07-1.69.07-4.95s-.01-3.67-.07-4.95C23.73 2.7 21.31.27 16.95.07 15.67.01 15.26 0 12 0zm0 5.84a6.16 6.16 0 100 12.32 6.16 6.16 0 000-12.32zM12 16a4 4 0 110-8 4 4 0 010 8zm6.4-11.85a1.44 1.44 0 100 2.88 1.44 1.44 0 000-2.88z',
  },
  {
    label: 'X',
    href: 'https://x.com',
    path: 'M18.24 2.25h3.31l-7.23 8.26 8.5 11.24h-6.65l-5.21-6.82-5.97 6.82H1.68l7.73-8.84L1.25 2.25h6.83l4.71 6.23zm-1.16 17.52h1.83L7.08 4.13H5.12z',
  },
  {
    label: 'YouTube',
    href: 'https://youtube.com',
    path: 'M23.5 6.16a3 3 0 00-2.11-2.11C19.52 3.55 12 3.55 12 3.55s-7.52 0-9.39.5A3 3 0 00.5 6.16C0 8.03 0 12 0 12s0 3.97.5 5.84a3 3 0 002.11 2.11c1.87.5 9.39.5 9.39.5s7.52 0 9.39-.5a3 3 0 002.11-2.11C24 15.97 24 12 24 12s0-3.97-.5-5.84zM9.55 15.57V8.43L15.82 12l-6.27 3.57z',
  },
];

function LinkGroup({ title, links }) {
  return (
    <div>
      <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-white/40">{title}</p>
      <ul className="flex flex-wrap gap-x-4 gap-y-1.5 text-[13px]">
        {links.map((l) => (
          <li key={l.label}>
            <Link to={l.to} className="text-white/70 transition-colors hover:text-white">
              {l.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function Footer() {
  return (
    <footer className="mt-auto bg-ink text-white/60">
      <div className="mx-auto max-w-7xl px-4 py-8 md:px-6">
        <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
          <div className="max-w-xs space-y-2">
            <Logo variant="light" />
            <p className="text-[13px] leading-relaxed text-white/50">
              Genuine brands, secure payments and easy 7-day returns.
            </p>
          </div>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 md:gap-12">
            <LinkGroup title="Shop" links={SHOP_LINKS} />
            <LinkGroup title="Help" links={HELP_LINKS} />
          </div>
        </div>

        <div className="mt-6 flex flex-col-reverse items-start gap-3 border-t border-white/10 pt-5 text-xs sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} ShopKart · support@shopkart.com</p>
          <div className="flex items-center gap-1.5">
            {SOCIALS.map((s) => (
              <a
                key={s.label}
                href={s.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={s.label}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-white/50 transition-colors hover:bg-white/10 hover:text-white"
              >
                <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24" aria-hidden="true">
                  <path d={s.path} />
                </svg>
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
