import React from 'react';
import { cn } from '../../lib/utils';

export const Card = ({ className, ...props }) => (
  <div className={cn('rounded-2xl border border-border bg-surface text-ink', className)} {...props} />
);

export const CardHeader = ({ className, ...props }) => (
  <div className={cn('flex flex-col space-y-1 p-5', className)} {...props} />
);

export const CardTitle = ({ className, ...props }) => (
  <h3 className={cn('text-lg font-semibold leading-tight tracking-tight text-ink', className)} {...props} />
);

export const CardDescription = ({ className, ...props }) => (
  <p className={cn('text-sm text-ink-muted', className)} {...props} />
);

export const CardContent = ({ className, ...props }) => (
  <div className={cn('p-5 pt-0', className)} {...props} />
);

export const CardFooter = ({ className, ...props }) => (
  <div className={cn('flex items-center p-5 pt-0', className)} {...props} />
);
