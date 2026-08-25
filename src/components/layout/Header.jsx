import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, MapPin, User, ShoppingCart } from 'lucide-react';
import { getProductSuggestions } from '@/api/products';
import Logo from '@/components/layout/Logo';
import { ProfileDropdown } from '@/components/layout/ProfileDropdown';

export function Header({ cartCount, username, onSearch, initialSearch = "" }) {
  const navigate = useNavigate();
  const [query, setQuery] = useState(initialSearch);
  const [showMobileSearch, setShowMobileSearch] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const boxRef = useRef(null);
  const debounceRef = useRef(null);

  useEffect(() => {
    const onClickOutside = (e) => {
      if (boxRef.current && !boxRef.current.contains(e.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, []);

  const fetchSuggestions = (value) => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!value.trim()) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }
    debounceRef.current = setTimeout(async () => {
      try {
        const data = await getProductSuggestions(value.trim());
        setSuggestions(data.suggestions || []);
        setShowSuggestions(true);
      } catch (err) {
        console.error('Suggestion fetch failed', err);
      }
    }, 220);
  };

  const applySearch = (value) => {
    const term = (value ?? query).trim();
    setQuery(term);
    setShowSuggestions(false);
    if (onSearch) onSearch(term);
    else navigate(`/?search=${encodeURIComponent(term)}`);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    applySearch(query);
  };

  const handleCartClick = () => {
    if (!username || username === 'Guest') {
      alert("Please sign up or sign in to view your cart!");
      navigate('/login');
    } else {
      navigate('/cart');
    }
  };

  const suggestionList = showSuggestions && suggestions.length > 0 && (
    <ul className="absolute left-0 right-0 top-full mt-1.5 z-50 bg-surface border border-border rounded-xl shadow-lg overflow-hidden max-h-80 overflow-y-auto">
      {suggestions.map((item) => (
        <li key={item.product_id}>
          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => applySearch(item.name)}
            className="w-full text-left px-3 py-2.5 hover:bg-muted-bg flex items-start gap-3 cursor-pointer"
          >
            {item.image && (
              <img src={item.image} alt="" className="h-10 w-10 rounded-lg object-cover bg-muted-bg shrink-0" />
            )}
            <div className="min-w-0">
              <p className="text-sm font-semibold text-ink truncate">{item.name}</p>
              <p className="text-xs text-ink-muted line-clamp-1">
                {item.description || item.brand || item.category}
              </p>
            </div>
            {item.price != null && (
              <span className="ml-auto text-sm font-bold text-ink shrink-0">₹{Number(item.price).toFixed(0)}</span>
            )}
          </button>
        </li>
      ))}
    </ul>
  );

  return (
    <header className="sticky top-0 z-50 bg-surface border-b border-border">
      <div className="hidden sm:block bg-ink text-white/80 text-xs">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-1.5 flex items-center justify-between">
          <span>Free delivery on orders above ₹499</span>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5">
              <MapPin className="h-3 w-3 text-brand-muted" strokeWidth={2} />
              Deliver to <span className="text-white font-medium">423651</span>
            </span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-6 py-3">
        <div className="flex items-center gap-4 md:gap-6">
          <Logo />

          <form onSubmit={handleSearchSubmit} className="hidden sm:flex flex-1 max-w-2xl" ref={boxRef}>
            <div className="relative flex w-full rounded-xl border border-border focus-within:border-brand focus-within:ring-2 focus-within:ring-brand/15 transition-all">
              <input
                type="text"
                placeholder="Search for products, brands and more..."
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  fetchSuggestions(e.target.value);
                }}
                onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
                className="flex-1 bg-muted-bg px-4 py-2.5 text-sm text-ink placeholder:text-ink-muted focus:outline-none rounded-l-xl"
                autoComplete="off"
              />
              <button
                type="submit"
                className="bg-brand hover:bg-brand-hover text-white px-5 flex items-center gap-2 text-sm font-semibold transition-colors cursor-pointer rounded-r-xl"
              >
                <Search className="h-4 w-4" strokeWidth={2.5} />
                <span className="hidden md:inline">Search</span>
              </button>
              {suggestionList}
            </div>
          </form>

          <div className="flex items-center gap-1 sm:gap-2 ml-auto">
            <button
              onClick={() => setShowMobileSearch(!showMobileSearch)}
              className="sm:hidden p-2.5 rounded-xl text-ink-muted hover:text-brand hover:bg-brand-light transition-colors cursor-pointer"
              aria-label="Search"
            >
              <Search className="h-5 w-5" strokeWidth={2} />
            </button>

            {!username || username === 'Guest' ? (
              <button
                onClick={() => navigate('/login')}
                className="flex flex-col items-center gap-0.5 px-2.5 py-1.5 rounded-xl hover:bg-muted-bg transition-colors cursor-pointer min-w-[52px]"
              >
                <User className="h-5 w-5 text-ink-muted" strokeWidth={2} />
                <span className="text-[10px] font-semibold text-ink">Sign In</span>
              </button>
            ) : (
              <ProfileDropdown username={username} />
            )}

            <button
              onClick={handleCartClick}
              className="flex flex-col items-center gap-0.5 px-2.5 py-1.5 rounded-xl hover:bg-brand-light transition-colors cursor-pointer relative min-w-[52px]"
            >
              <div className="relative">
                <ShoppingCart className="h-5 w-5 text-ink-muted" strokeWidth={2} />
                {cartCount > 0 && (
                  <span className="absolute -top-2 -right-2.5 h-4 min-w-4 px-0.5 rounded-full bg-brand text-white text-[9px] font-bold flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
              </div>
              <span className="text-[10px] font-semibold text-ink">Cart</span>
            </button>
          </div>
        </div>

        {showMobileSearch && (
          <form onSubmit={handleSearchSubmit} className="mt-3 sm:hidden animate-fade-up relative" ref={boxRef}>
            <div className="flex rounded-xl overflow-hidden border border-border">
              <input
                type="text"
                placeholder="Search products..."
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  fetchSuggestions(e.target.value);
                }}
                className="flex-1 bg-muted-bg px-4 py-2.5 text-sm focus:outline-none"
                autoComplete="off"
              />
              <button type="submit" className="bg-brand text-white px-4 cursor-pointer">
                <Search className="h-4 w-4" strokeWidth={2.5} />
              </button>
            </div>
            {suggestionList}
          </form>
        )}
      </div>
    </header>
  );
}
