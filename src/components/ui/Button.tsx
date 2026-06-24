import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import type { LucideIcon } from 'lucide-react';
import { cn } from '../../lib/utils';
import { Spinner } from './Spinner';

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 rounded-xl font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900 disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        primary: 'bg-indigo-500 text-white hover:bg-indigo-600',
        secondary: 'bg-slate-700 text-slate-100 hover:bg-slate-600',
        ghost: 'text-slate-300 hover:bg-slate-800',
        destructive: 'bg-red-500 text-white hover:bg-red-600',
      },
      size: {
        sm: 'h-8 px-3 text-sm',
        md: 'h-10 px-4',
        lg: 'h-12 px-6 text-lg',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  },
);

type ButtonVariantProps = VariantProps<typeof buttonVariants>;

interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    ButtonVariantProps {
  loading?: boolean;
  icon?: LucideIcon;
  children?: ReactNode;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant,
      size,
      loading = false,
      icon: Icon,
      disabled,
      className,
      children,
      ...props
    },
    ref,
  ) => {
    return (
      <button
        ref={ref}
        className={cn(buttonVariants({ variant, size }), className)}
        disabled={disabled || loading}
        {...props}
      >
        {loading ? (
          <Spinner size="sm" />
        ) : Icon ? (
          <Icon className="h-4 w-4 shrink-0" />
        ) : null}
        {children}
      </button>
    );
  },
);

Button.displayName = 'Button';
