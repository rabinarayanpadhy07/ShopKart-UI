import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Package, Heart, MapPin, LogOut, ChevronDown } from 'lucide-react';
import { logout } from '@/api/auth';

export function ProfileDropdown({ username }) {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  const items = [
    { label: 'Profile', Icon: User, action: () => setIsOpen(false) },
    { label: 'Orders', Icon: Package, action: () => { setIsOpen(false); navigate('/orders'); } },
    { label: 'Wishlist', Icon: Heart, action: () => { setIsOpen(false); navigate('/wishlist'); } },
    { label: 'Addresses', Icon: MapPin, action: () => { setIsOpen(false); navigate('/addresses'); } },
  ];

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (e) { console.error(e); }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex flex-col items-center gap-0.5 px-2.5 py-1.5 rounded-xl hover:bg-muted-bg transition-colors cursor-pointer min-w-[52px]"
      >
        <div className="flex items-center gap-1">
          <div className="h-6 w-6 rounded-full bg-muted-bg border border-border flex items-center justify-center">
            <User className="h-3.5 w-3.5 text-ink-muted" strokeWidth={2} />
          </div>
          <ChevronDown className={`h-3 w-3 text-ink-muted hidden sm:block transition-transform ${isOpen ? 'rotate-180' : ''}`} strokeWidth={2.5} />
        </div>
        <span className="text-[10px] font-semibold text-ink max-w-[60px] truncate">{username}</span>
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 mt-2 w-48 bg-surface rounded-xl border border-border shadow-lg py-1.5 z-50 animate-fade-up">
            <div className="px-4 py-2 border-b border-border">
              <p className="text-[10px] text-ink-muted font-medium uppercase tracking-wide">Account</p>
              <p className="text-sm font-semibold text-ink truncate">{username}</p>
            </div>
            {items.map(({ label, Icon, action }) => (
              <button key={label} onClick={action} className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-ink hover:bg-muted-bg transition-colors cursor-pointer text-left">
                <Icon className="h-4 w-4 text-ink-muted" strokeWidth={2} />
                {label}
              </button>
            ))}
            <div className="border-t border-border my-1" />
            <button onClick={handleLogout} className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-danger hover:bg-red-50 transition-colors cursor-pointer text-left">
              <LogOut className="h-4 w-4" strokeWidth={2} />
              Logout
            </button>
          </div>
        </>
      )}
    </div>
  );
}
