import { type ReactNode, type HTMLAttributes } from 'react';
import { cn } from '../../lib/utils';

const variantClasses = {
  default: 'bg-slate-800/50 rounded-2xl',
  elevated: 'bg-slate-800 rounded-2xl shadow-lg',
  outlined: 'bg-transparent border border-slate-700 rounded-2xl',
} as const;

const paddingClasses = {
  none: '',
  sm: 'p-3',
  md: 'p-4',
  lg: 'p-6',
} as const;

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: keyof typeof variantClasses;
  padding?: keyof typeof paddingClasses;
  interactive?: boolean;
  children: ReactNode;
}

export function Card({
  variant = 'default',
  padding = 'md',
  interactive = false,
  className,
  children,
  onClick,
  ...props
}: CardProps) {
  return (
    <div
      className={cn(
        variantClasses[variant],
        paddingClasses[padding],
        interactive &&
          'cursor-pointer transition hover:bg-slate-700/50 active:scale-[0.98]',
        className,
      )}
      onClick={onClick}
      role={interactive ? 'button' : undefined}
      tabIndex={interactive ? 0 : undefined}
      {...props}
    >
      {children}
    </div>
  );
}
