import { isToday, isBefore, startOfDay, addDays, isWithinInterval } from 'date-fns';
import type { Task } from '../types/task.types';

export type DerivedTaskStatus = 'overdue' | 'now' | 'soon' | 'later' | 'hold';

/**
 * Derive the effective status of a task based on its due date, energy level,
 * completion state, and manual status override.
 */
export function deriveTaskStatus(task: Task): DerivedTaskStatus {
  if (task.is_done) {
    return 'later';
  }

  if (task.status === 'hold') {
    return 'hold';
  }

  const today = startOfDay(new Date());

  if (!task.due_date) {
    return task.energy === 'high' ? 'now' : 'later';
  }

  const dueDate = startOfDay(new Date(task.due_date));

  if (isBefore(dueDate, today)) {
    return 'overdue';
  }

  if (isToday(dueDate)) {
    return 'now';
  }

  const sevenDaysFromNow = addDays(today, 7);
  if (isWithinInterval(dueDate, { start: today, end: sevenDaysFromNow })) {
    return 'soon';
  }

  return 'later';
}

/**
 * Sort priority for each derived status. Lower numbers appear first.
 */
export const STATUS_ORDER: Record<DerivedTaskStatus, number> = {
  overdue: 0,
  now: 1,
  soon: 2,
  later: 3,
  hold: 4,
};

/**
 * Human-readable labels for each derived status.
 */
export const STATUS_LABELS: Record<DerivedTaskStatus, string> = {
  overdue: 'Overdue',
  now: 'Now',
  soon: 'Soon',
  later: 'Later',
  hold: 'On Hold',
};

/**
 * Tailwind class strings for status badges.
 */
export const STATUS_COLORS: Record<DerivedTaskStatus, string> = {
  overdue: 'bg-red-500/20 text-red-400 border border-red-500/30',
  now: 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30',
  soon: 'bg-amber-500/20 text-amber-400 border border-amber-500/30',
  later: 'bg-slate-500/20 text-slate-400 border border-slate-500/30',
  hold: 'bg-gray-500/20 text-gray-400 border border-gray-500/30',
};
