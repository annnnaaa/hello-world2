import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus,
  Brain,
  CheckSquare,
  CalendarPlus,
  FileText,
  Lightbulb,
} from 'lucide-react';
import { useQuickAddStore, type QuickAddType } from '../../store/quickAddStore';

const actions: { type: NonNullable<QuickAddType>; label: string; icon: typeof Plus; color: string }[] = [
  { type: 'braindump', label: 'Brain Dump', icon: Brain, color: 'bg-pink-500' },
  { type: 'task', label: 'Task', icon: CheckSquare, color: 'bg-emerald-500' },
  { type: 'event', label: 'Event', icon: CalendarPlus, color: 'bg-sky-500' },
  { type: 'note', label: 'Note', icon: FileText, color: 'bg-amber-500' },
  { type: 'idea', label: 'Idea', icon: Lightbulb, color: 'bg-violet-500' },
];

export function FloatingActionButton() {
  const [open, setOpen] = useState(false);
  const setQuickAddType = useQuickAddStore((s) => s.setQuickAddType);

  function handleSelect(type: NonNullable<QuickAddType>) {
    setOpen(false);
    setQuickAddType(type);
  }

  return (
    <>
      {/* Backdrop overlay */}
      <AnimatePresence>
        {open && (
          <motion.div
            key="fab-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40 bg-black/50"
            onClick={() => setOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* FAB container */}
      <div className="fixed bottom-20 right-4 z-50 flex flex-col items-end gap-3">
        {/* Action items */}
        <AnimatePresence>
          {open &&
            actions.map((action, index) => (
              <motion.button
                key={action.type}
                type="button"
                initial={{ opacity: 0, y: 20, scale: 0.8 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.8 }}
                transition={{
                  duration: 0.2,
                  delay: (actions.length - 1 - index) * 0.05,
                }}
                onClick={() => handleSelect(action.type)}
                className="flex items-center gap-3"
              >
                <span className="rounded-lg bg-slate-800 px-3 py-1.5 text-sm font-medium text-slate-200 shadow-lg">
                  {action.label}
                </span>
                <span
                  className={`flex h-10 w-10 items-center justify-center rounded-full text-white shadow-lg ${action.color}`}
                >
                  <action.icon className="h-5 w-5" />
                </span>
              </motion.button>
            ))}
        </AnimatePresence>

        {/* Main FAB button */}
        <motion.button
          type="button"
          onClick={() => setOpen((prev) => !prev)}
          className="flex h-14 w-14 items-center justify-center rounded-full bg-indigo-500 text-white shadow-lg shadow-indigo-500/25"
          animate={{ rotate: open ? 45 : 0 }}
          transition={{ duration: 0.2 }}
          aria-label={open ? 'Close quick actions' : 'Open quick actions'}
        >
          <Plus className="h-6 w-6" />
        </motion.button>
      </div>
    </>
  );
}
