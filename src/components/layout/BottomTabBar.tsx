import { NavLink } from 'react-router-dom';
import {
  House,
  CheckSquare,
  Calendar,
  FolderOpen,
  Inbox,
} from 'lucide-react';
import { cn } from '../../lib/utils';

interface BottomTabBarProps {
  unsortedCount?: number;
}

const tabs = [
  { to: '/', label: 'Home', icon: House },
  { to: '/tasks', label: 'Tasks', icon: CheckSquare },
  { to: '/planner', label: 'Planner', icon: Calendar },
  { to: '/filing', label: 'Files', icon: FolderOpen },
  { to: '/unsorted', label: 'Inbox', icon: Inbox },
] as const;

export function BottomTabBar({ unsortedCount = 0 }: BottomTabBarProps) {
  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40 h-16 bg-slate-950 border-t border-slate-800"
      style={{ paddingBottom: 'env(safe-area-inset-bottom, 0.5rem)' }}
    >
      <div className="flex items-center justify-around h-full max-w-lg mx-auto px-2">
        {tabs.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              cn(
                'flex flex-col items-center justify-center gap-0.5 w-full h-full relative transition-colors',
                isActive ? 'text-indigo-400' : 'text-slate-500',
              )
            }
          >
            <div className="relative">
              <Icon className="w-5 h-5" />
              {label === 'Inbox' && unsortedCount > 0 && (
                <span className="absolute -top-1.5 -right-2.5 min-w-[18px] h-[18px] flex items-center justify-center rounded-full bg-indigo-500 text-white text-[10px] font-bold leading-none px-1">
                  {unsortedCount > 99 ? '99+' : unsortedCount}
                </span>
              )}
            </div>
            <span className="text-xs leading-tight">{label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
