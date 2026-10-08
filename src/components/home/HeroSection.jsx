import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

const SLIDES = [
  {
    eyebrow: 'Laptops',
    title: 'Pro power,\nall-day battery.',
    body: 'MacBook Pro, Dell XPS, Zenbook and more, delivered in 2–3 days.',
    cta: 'Shop laptops',
    category: 'Laptops',
    image: 'https://cdn.dummyjson.com/product-images/laptops/apple-macbook-pro-14-inch-space-grey/1.webp',
    glow: 'bg-orange-500/30',
  },
  {
    eyebrow: 'Audio',
    title: 'Sound,\nuninterrupted.',
    body: 'AirPods Max, AirPods and Beats, with genuine brand warranty.',
    cta: 'Shop audio',
    category: 'Mobile Accessories',
    image: 'https://cdn.dummyjson.com/product-images/mobile-accessories/apple-airpods-max-silver/1.webp',
    glow: 'bg-sky-400/30',
  },
  {
    eyebrow: 'Footwear',
    title: 'Iconic since 1985.',
    body: 'Air Jordan 1, Puma and more sneakers for the new season.',
    cta: 'Shop sneakers',
    category: 'Footwear',
    image: 'https://cdn.dummyjson.com/product-images/mens-shoes/nike-air-jordan-1-red-and-black/1.webp',
    glow: 'bg-rose-500/30',
  },
];

const TILES = [
  {
    eyebrow: 'Fragrances',
    title: 'Dior, Chanel & Gucci',
    category: 'Fragrances',
    image: 'https://cdn.dummyjson.com/product-images/fragrances/dior-j%27adore/1.webp',
    className: 'bg-rose-50',
  },
  {
    eyebrow: 'Books',
    title: 'Bestsellers from ₹399',
    category: 'Books',
    image: 'https://covers.openlibrary.org/b/isbn/9780735211292-M.jpg',
    className: 'bg-amber-50',
  },
];

export function HeroSection({ onSelectCategory }) {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const reduceMotion = useReducedMotion();
  const slide = SLIDES[active];

  useEffect(() => {
    if (paused || reduceMotion) return undefined;
    const t = setInterval(() => setActive((p) => (p + 1) % SLIDES.length), 6000);
    return () => clearInterval(t);
  }, [paused, reduceMotion]);

  return (
    <section className="grid gap-3 md:gap-4 lg:grid-cols-3" aria-label="Featured collections">
      <div
        className="relative isolate overflow-hidden rounded-3xl bg-ink text-white lg:col-span-2"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
      >
        <div
          className={cn('absolute -right-16 -top-16 -z-10 h-80 w-80 rounded-full blur-3xl transition-colors duration-700', slide.glow)}
          aria-hidden="true"
        />
        <div className="grid min-h-[300px] items-center gap-2 p-6 sm:grid-cols-[1.1fr_1fr] sm:p-8 md:min-h-[360px] md:p-10">
          <AnimatePresence mode="wait">
            <motion.div
              key={active}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.35, ease: 'easeOut' }}
              className="relative z-10 space-y-4"
            >
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-muted">{slide.eyebrow}</p>
              <h1 className="whitespace-pre-line text-3xl font-extrabold leading-[1.08] tracking-tight sm:text-4xl md:text-5xl">
                {slide.title}
              </h1>
              <p className="max-w-sm text-sm leading-relaxed text-white/70 md:text-base">{slide.body}</p>
              <button
                type="button"
                onClick={() => onSelectCategory(slide.category)}
                className="group inline-flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-ink transition-colors hover:bg-brand hover:text-white cursor-pointer"
              >
                {slide.cta}
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" strokeWidth={2.5} />
              </button>
            </motion.div>
          </AnimatePresence>

          <div className="relative hidden h-full items-center justify-center sm:flex">
            <AnimatePresence mode="wait">
              <motion.img
                key={slide.image}
                src={slide.image}
                alt=""
                initial={{ opacity: 0, scale: 0.94 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.97 }}
                transition={{ duration: 0.4, ease: 'easeOut' }}
                className="max-h-64 w-full object-contain drop-shadow-[0_24px_40px_rgba(0,0,0,0.45)] md:max-h-72"
                fetchPriority={active === 0 ? 'high' : 'auto'}
                decoding="async"
                width="480"
                height="480"
              />
            </AnimatePresence>
          </div>
        </div>

        <div className="absolute bottom-5 left-6 flex gap-1.5 sm:left-8 md:left-10" role="tablist" aria-label="Choose slide">
          {SLIDES.map((s, i) => (
            <button
              key={s.eyebrow}
              type="button"
              role="tab"
              aria-selected={i === active}
              aria-label={s.eyebrow}
              onClick={() => setActive(i)}
              className={cn(
                'h-1.5 rounded-full transition-all cursor-pointer',
                i === active ? 'w-7 bg-white' : 'w-1.5 bg-white/30 hover:bg-white/60'
              )}
            />
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 md:gap-4 lg:grid-cols-1">
        {TILES.map((tile) => (
          <button
            key={tile.category}
            type="button"
            onClick={() => onSelectCategory(tile.category)}
            className={cn(
              'group relative flex min-h-[150px] overflow-hidden rounded-3xl p-5 text-left transition-shadow hover:shadow-lg cursor-pointer md:p-6',
              tile.className
            )}
          >
            <div className="relative z-10 flex max-w-[60%] flex-col">
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-ink-muted">{tile.eyebrow}</p>
              <p className="mt-1 text-base font-bold leading-snug text-ink md:text-lg">{tile.title}</p>
              <span className="mt-auto inline-flex items-center gap-1 pt-4 text-xs font-semibold text-ink group-hover:text-brand">
                Explore <ArrowRight className="h-3.5 w-3.5" strokeWidth={2.5} />
              </span>
            </div>
            <img
              src={tile.image}
              alt=""
              loading="lazy"
              decoding="async"
              className="absolute -bottom-2 right-2 h-[85%] max-w-[50%] object-contain mix-blend-multiply transition-transform duration-500 group-hover:scale-105 group-hover:-rotate-2"
            />
          </button>
        ))}
      </div>
    </section>
  );
}
