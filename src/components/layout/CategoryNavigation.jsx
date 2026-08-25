import React, { useEffect, useState } from 'react';
import { CATEGORIES } from '@/lib/categories';

export function CategoryNavigation({ onCategoryClick, activeCategory = 'All' }) {
  const [scrolled, setScrolled] = useState(false);
  const [headerHeight, setHeaderHeight] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth < 640 ? 56 : 92;
    }
    return 92;
  });

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });

    const updateHeaderHeight = () => {
      const headerEl = document.querySelector('header');
      if (headerEl) {
        setHeaderHeight(headerEl.offsetHeight);
      }
    };

    updateHeaderHeight();
    window.addEventListener('resize', updateHeaderHeight);

    let observer;
    const headerEl = document.querySelector('header');
    if (headerEl && window.ResizeObserver) {
      observer = new ResizeObserver(updateHeaderHeight);
      observer.observe(headerEl);
    }

    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', updateHeaderHeight);
      if (observer && headerEl) {
        observer.unobserve(headerEl);
      }
    };
  }, []);

  const showText = scrolled;

  return (
    <nav
      className="sticky z-40 bg-surface/95 backdrop-blur-md border-b border-border transition-all duration-200"
      style={{ top: `${headerHeight}px` }}
    >
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        <ul className={`flex items-center overflow-x-auto no-scrollbar transition-all duration-200 ${showText ? 'gap-2 py-3.5' : 'gap-3 sm:gap-5 py-4 md:py-5'}`}>
          {CATEGORIES.map(({ name, searchName, Icon }) => {
            const active = (activeCategory === 'All' && name === 'All') || activeCategory === searchName || activeCategory === name;
            return (
              <li key={name} className="shrink-0">
                <button
                  onClick={() => onCategoryClick(name)}
                  className={`flex items-center justify-center gap-2 rounded-xl font-semibold transition-all cursor-pointer whitespace-nowrap ${
                    showText
                      ? 'px-4 py-2 text-xs sm:text-sm'
                      : 'px-4.5 py-3 min-w-[56px] md:min-w-[64px] text-sm'
                  } ${
                    active
                      ? 'bg-brand text-white shadow-sm scale-105'
                      : 'text-ink-muted hover:text-ink hover:bg-muted-bg'
                  }`}
                >
                  {/* Large screens at top of page: icons. Small screens and scrolled: text. */}
                  <Icon
                    className={`${showText ? 'hidden' : 'hidden md:block'} h-5 w-5`}
                    strokeWidth={2}
                  />
                  <span className="whitespace-nowrap">
                    {name}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </nav>
  );
}
