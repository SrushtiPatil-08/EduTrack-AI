import type { HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

type Variant = 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info';

const variants: Record<Variant, string> = {
  primary: 'bg-primary/15 text-primary-light border-primary/20',
  secondary: 'bg-surface-2 text-text-secondary border-border-2',
  success: 'bg-success/15 text-success border-success/20',
  warning: 'bg-warning/15 text-warning border-warning/20',
  error: 'bg-error/15 text-error border-error/20',
  info: 'bg-info/15 text-info border-info/20',
};

export function Badge({
  className,
  variant = 'primary',
  ...props
}: HTMLAttributes<HTMLSpanElement> & { variant?: Variant }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border',
        variants[variant],
        className,
      )}
      {...props}
    />
  );
}
