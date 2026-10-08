import React, { useEffect, useState } from 'react';
import { useCategories } from '@/hooks/useCategories';
import { cn } from '@/lib/utils';

export function CategoryNavigation({ onCategoryClick, activeCategory = 'All' }) {
  const categories = useCategories();
  const [headerHeight, setHeaderHeight] = useState(64);

  // Stick directly below the (variable height) sticky header.
  useEffect(() => {
    const headerEl = document.querySelector('header');
    if (!headerEl) return undefined;
    const update = () => setHeaderHeight(headerEl.offsetHeight);
    update();
    if (!window.ResizeObserver) return undefined;
    const observer = new ResizeObserver(update);
    observer.observe(headerEl);
    return () => observer.disconnect();
  }, []);

  return (
    <nav
      className="sticky z-40 border-b border-border bg-surface/90 backdrop-blur-md"
      style={{ top: `${headerHeight}px` }}
      aria-label="Product categories"
    >
      <div className="mx-auto max-w-7xl px-4 md:px-6">
        <ul className="no-scrollbar flex items-center gap-1.5 overflow-x-auto py-2.5">
          {categories.map(({ name, Icon }) => {
            const active = activeCategory === name || (name === 'All' && !activeCategory);
            return (
              <li key={name} className="shrink-0">
                <button
                  type="button"
                  onClick={() => onCategoryClick(name)}
                  aria-pressed={active}
                  className={cn(
                    'flex items-center gap-1.5 whitespace-nowrap rounded-full px-3.5 py-1.5 text-[13px] font-medium transition-colors cursor-pointer',
                    active
                      ? 'bg-ink text-white'
                      : 'text-ink-muted hover:bg-muted-bg hover:text-ink'
                  )}
                >
                  <Icon className="h-3.5 w-3.5" strokeWidth={2} />
                  {name}
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </nav>
  );
}
