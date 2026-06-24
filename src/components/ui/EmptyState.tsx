import { type ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: ReactNode;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12">
      <Icon className="h-12 w-12 text-slate-600" strokeWidth={1.5} />
      <h3 className="mt-4 text-lg font-medium text-slate-400">{title}</h3>
      {description && (
        <p className="mt-1 text-center text-sm text-slate-500">{description}</p>
      )}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
