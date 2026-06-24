import { useEffect, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { create } from 'zustand';
import { cn } from '../../lib/utils';

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

type ToastType = 'success' | 'error' | 'info';

interface ToastItem {
  id: number;
  message: string;
  type: ToastType;
}

/* ------------------------------------------------------------------ */
/*  Zustand store                                                      */
/* ------------------------------------------------------------------ */

interface ToastState {
  toasts: ToastItem[];
  addToast: (message: string, type?: ToastType) => void;
  removeToast: (id: number) => void;
}

let nextId = 0;

const useToastStore = create<ToastState>((set) => ({
  toasts: [],
  addToast: (message, type = 'info') => {
    const id = nextId++;
    set((state) => ({
      toasts: [...state.toasts, { id, message, type }],
    }));
    // Auto-dismiss after 3 seconds
    setTimeout(() => {
      set((state) => ({
        toasts: state.toasts.filter((t) => t.id !== id),
      }));
    }, 3000);
  },
  removeToast: (id) =>
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id),
    })),
}));

/* ------------------------------------------------------------------ */
/*  Hook                                                               */
/* ------------------------------------------------------------------ */

export function useToast() {
  const addToast = useToastStore((s) => s.addToast);

  const toast = useCallback(
    (message: string, type?: ToastType) => {
      addToast(message, type);
    },
    [addToast],
  );

  return { toast };
}

/* ------------------------------------------------------------------ */
/*  Styles per type                                                    */
/* ------------------------------------------------------------------ */

const typeClasses: Record<ToastType, string> = {
  success: 'bg-emerald-600 text-white',
  error: 'bg-red-600 text-white',
  info: 'bg-indigo-600 text-white',
};

/* ------------------------------------------------------------------ */
/*  Container                                                          */
/* ------------------------------------------------------------------ */

export function ToastContainer() {
  const toasts = useToastStore((s) => s.toasts);

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-20 z-[100] flex flex-col items-center gap-2">
      <AnimatePresence>
        {toasts.map((t) => (
          <motion.div
            key={t.id}
            className={cn(
              'pointer-events-auto rounded-xl px-4 py-3 text-sm font-medium shadow-xl',
              typeClasses[t.type],
            )}
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
          >
            {t.message}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
