import type { HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

export function GlassCard({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'glass rounded-3xl p-6 transition-all duration-300',
        'hover:border-primary/30 hover:shadow-[0_8px_40px_rgba(16,185,129,0.1)]',
        className,
      )}
      {...props}
    />
  );
}
