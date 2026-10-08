import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingCart } from 'lucide-react';

export default function Logo({ size = 'default', variant = 'dark' }) {
  const navigate = useNavigate();
  const isLarge = size === 'large';
  const isLight = variant === 'light';

  return (
    <div
      className="flex items-center gap-2 cursor-pointer select-none group"
      onClick={() => navigate('/')}
    >
      <div className={`flex items-center justify-center rounded-xl bg-brand text-white shadow-sm group-hover:bg-brand-hover transition-colors ${isLarge ? 'h-10 w-10' : 'h-8 w-8'}`}>
        <ShoppingCart className={isLarge ? 'h-5 w-5' : 'h-4 w-4'} strokeWidth={2.5} />
      </div>
      <div className="flex flex-col text-left">
        <span className={`font-black tracking-tight leading-none ${isLarge ? 'text-2xl' : 'text-xl'}`}>
          <span className={isLight ? 'text-white' : 'text-ink'}>Shop</span>
          <span className="text-brand">Kart</span>
        </span>
        <span className={`text-[9px] font-semibold tracking-wider uppercase ${isLight ? 'text-slate-400' : 'text-ink-muted'}`}>
          Shop Smart • Live Better
        </span>
      </div>
    </div>
  );
}
