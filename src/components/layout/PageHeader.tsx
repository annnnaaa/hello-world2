import type { ReactNode } from 'react';
import { ChevronLeft } from 'lucide-react';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  action?: ReactNode;
  showBack?: boolean;
  onBack?: () => void;
}

export function PageHeader({
  title,
  subtitle,
  action,
  showBack = false,
  onBack,
}: PageHeaderProps) {
  return (
    <header className="sticky top-0 z-10 bg-slate-950/80 backdrop-blur-lg px-4 py-3">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 min-w-0">
          {showBack && (
            <button
              type="button"
              onClick={onBack}
              className="flex-shrink-0 -ml-2 flex items-center justify-center w-8 h-8 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
              aria-label="Go back"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
          )}
          <div className="min-w-0">
            <h1 className="text-xl font-bold text-slate-100 truncate">
              {title}
            </h1>
            {subtitle && (
              <p className="text-sm text-slate-400 truncate">{subtitle}</p>
            )}
          </div>
        </div>
        {action && <div className="flex-shrink-0">{action}</div>}
      </div>
    </header>
  );
}
