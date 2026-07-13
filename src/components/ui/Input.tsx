import { forwardRef, type InputHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, id, ...props }, ref) => (
    <div className="w-full">
      {label && (
        <label htmlFor={id} className="block text-sm font-medium text-text-secondary mb-2">
          {label}
        </label>
      )}
      <input
        ref={ref}
        id={id}
        className={cn(
          'w-full h-12 px-4 rounded-xl bg-surface-2 border text-text placeholder:text-text-muted',
          'transition-all duration-200 outline-none',
          error
            ? 'border-error/50 focus:border-error focus:ring-2 focus:ring-error/20'
            : 'border-border-2 focus:border-primary focus:ring-2 focus:ring-primary/20',
          className,
        )}
        {...props}
      />
      {error && <p className="mt-1.5 text-xs text-error">{error}</p>}
    </div>
  ),
);
Input.displayName = 'Input';
