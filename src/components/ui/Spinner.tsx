import { cn } from '../../lib/utils';

const sizeClasses = {
  sm: 'w-4 h-4',
  md: 'w-6 h-6',
  lg: 'w-8 h-8',
} as const;

interface SpinnerProps {
  size?: keyof typeof sizeClasses;
  className?: string;
}

export function Spinner({ size = 'md', className }: SpinnerProps) {
  return (
    <div
      className={cn(
        'animate-spin rounded-full border-2 border-slate-600 border-t-indigo-500',
        sizeClasses[size],
        className,
      )}
      role="status"
      aria-label="Loading"
    />
  );
}
