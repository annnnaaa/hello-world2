import { Outlet } from 'react-router-dom';
import { ThemeProvider } from './ThemeProvider';
import { BottomTabBar } from './BottomTabBar';
import { FloatingActionButton } from './FloatingActionButton';
import { useQuickAddStore } from '../../store/quickAddStore';

function QuickAddRouter() {
  const quickAddType = useQuickAddStore((s) => s.quickAddType);
  const close = useQuickAddStore((s) => s.close);

  if (!quickAddType) return null;

  // Placeholder modals — will be replaced with real components later
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
      <div
        className="absolute inset-0 bg-black/60"
        onClick={close}
        role="presentation"
      />
      <div className="relative w-full max-w-lg rounded-t-2xl sm:rounded-2xl bg-slate-900 border border-slate-800 p-6 mx-4 mb-0 sm:mb-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-slate-100 capitalize">
            {quickAddType === 'braindump' ? 'Brain Dump' : quickAddType}
          </h2>
          <button
            type="button"
            onClick={close}
            className="text-slate-400 hover:text-slate-200 transition-colors text-sm"
          >
            Close
          </button>
        </div>
        <p className="text-slate-400 text-sm">
          {quickAddType === 'braindump' && 'Brain dump input will be wired up here.'}
          {quickAddType === 'task' && 'Add task form will be wired up here.'}
          {quickAddType === 'event' && 'Add event form will be wired up here.'}
          {quickAddType === 'note' && 'Add note form will be wired up here.'}
          {quickAddType === 'idea' && 'Add idea form will be wired up here.'}
        </p>
      </div>
    </div>
  );
}

export function AppShell() {
  // TODO: Replace with actual unsorted thoughts count from a query
  const unsortedCount = 0;

  return (
    <ThemeProvider>
      <div className="min-h-screen bg-slate-950">
        <main className="pb-20 px-4">
          <Outlet />
        </main>
        <BottomTabBar unsortedCount={unsortedCount} />
        <FloatingActionButton />
        <QuickAddRouter />
      </div>
    </ThemeProvider>
  );
}
