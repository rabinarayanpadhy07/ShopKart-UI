import React from 'react';
import { cn } from '../../lib/utils';

export const Button = React.forwardRef(({ className, variant = 'default', size = 'default', ...props }, ref) => {
  const base = 'inline-flex items-center justify-center rounded-xl text-sm font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/30 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none cursor-pointer';

  const variants = {
    default: 'bg-brand text-white hover:bg-brand-hover shadow-sm hover:shadow',
    destructive: 'bg-danger text-white hover:bg-red-700',
    outline: 'border border-border bg-surface hover:bg-muted-bg text-ink',
    secondary: 'bg-ink text-white hover:bg-slate-800',
    ghost: 'hover:bg-muted-bg text-ink-muted hover:text-ink',
    link: 'underline-offset-4 hover:underline text-brand',
  };

  const sizes = {
    default: 'h-10 px-5 py-2',
    sm: 'h-9 px-4 text-xs',
    lg: 'h-12 px-8 text-base',
  };

  return (
    <button className={cn(base, variants[variant], sizes[size], className)} ref={ref} {...props} />
  );
});
Button.displayName = 'Button';
