import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle, CheckSquare, Inbox, Brain, Calendar, ChevronRight } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { useTasks } from '../hooks/useTasks';
import { useUnsortedThoughts } from '../hooks/useUnsortedThoughts';
import { useCalendarEvents } from '../hooks/useCalendarEvents';
import { useCaptureMutation } from '../hooks/useBrainDump';
import { deriveTaskStatus } from '../lib/taskLogic';
import { format, addDays, startOfDay, endOfDay } from 'date-fns';

export default function DashboardPage() {
  const user = useAuthStore((s) => s.user);
  const navigate = useNavigate();
  const { data: tasks } = useTasks();
  const { data: thoughts } = useUnsortedThoughts();
  const now = new Date();
  const { data: events } = useCalendarEvents(startOfDay(now).toISOString(), endOfDay(addDays(now, 7)).toISOString());
  const capture = useCaptureMutation();
  const [dumpText, setDumpText] = useState('');

  const greeting = useMemo(() => {
    const h = now.getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  }, []);

  const displayName = (user as any)?.user_metadata?.display_name || 'there';

  const tasksByStatus = useMemo(() => {
    if (!tasks) return { overdue: [], now: [], soon: [] };
    const grouped: Record<string, any[]> = { overdue: [], now: [], soon: [] };
    tasks.forEach((t: any) => {
      const s = deriveTaskStatus(t);
      if (grouped[s]) grouped[s].push({ ...t, derivedStatus: s });
    });
    return grouped;
  }, [tasks]);

  const overdueCount = tasksByStatus.overdue.length;
  const todayCount = tasksByStatus.now.length;
  const unsortedCount = thoughts?.length || 0;

  const handleCapture = () => {
    if (!dumpText.trim()) return;
    capture.mutate(dumpText.trim(), { onSuccess: () => setDumpText('') });
  };

  return (
    <div className="space-y-6 pb-4">
      <div>
        <h1 className="text-2xl font-bold text-white">{greeting}, {displayName}</h1>
        <p className="text-slate-400 text-sm mt-1">{format(now, 'EEEE, MMMM d')}</p>
      </div>

      {/* Quick Brain Dump */}
      <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-4">
        <div className="flex items-center gap-3">
          <input
            type="text"
            value={dumpText}
            onChange={(e) => setDumpText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleCapture()}
            placeholder="What's on your mind?"
            className="flex-1 bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
          />
          <button
            onClick={handleCapture}
            disabled={capture.isPending || !dumpText.trim()}
            className="p-2.5 bg-indigo-500 hover:bg-indigo-600 disabled:opacity-50 rounded-xl text-white transition-colors shrink-0"
          >
            <Brain className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-3 gap-3">
        <button
          onClick={() => navigate('/tasks')}
          className="bg-red-500/10 border border-red-500/20 rounded-2xl p-3 text-center"
        >
          <AlertTriangle className="w-5 h-5 text-red-400 mx-auto mb-1" />
          <p className="text-2xl font-bold text-red-400">{overdueCount}</p>
          <p className="text-xs text-red-400/70">Overdue</p>
        </button>
        <button
          onClick={() => navigate('/tasks')}
          className="bg-indigo-500/10 border border-indigo-500/20 rounded-2xl p-3 text-center"
        >
          <CheckSquare className="w-5 h-5 text-indigo-400 mx-auto mb-1" />
          <p className="text-2xl font-bold text-indigo-400">{todayCount}</p>
          <p className="text-xs text-indigo-400/70">Today</p>
        </button>
        <button
          onClick={() => navigate('/unsorted')}
          className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-3 text-center"
        >
          <Inbox className="w-5 h-5 text-amber-400 mx-auto mb-1" />
          <p className="text-2xl font-bold text-amber-400">{unsortedCount}</p>
          <p className="text-xs text-amber-400/70">Unsorted</p>
        </button>
      </div>

      {/* Overdue Tasks */}
      {tasksByStatus.overdue.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-red-400 uppercase tracking-wider">Overdue</h2>
            <button onClick={() => navigate('/tasks')} className="text-xs text-slate-400 flex items-center gap-1">
              View all <ChevronRight className="w-3 h-3" />
            </button>
          </div>
          <div className="space-y-2">
            {tasksByStatus.overdue.slice(0, 3).map((task: any) => (
              <button
                key={task.id}
                onClick={() => navigate(`/tasks/${task.id}`)}
                className="w-full bg-slate-800/50 border border-red-500/20 rounded-xl p-3 text-left"
              >
                <p className="text-white text-sm font-medium truncate">{task.title}</p>
                {task.due_date && (
                  <p className="text-red-400 text-xs mt-1">Due {format(new Date(task.due_date), 'MMM d')}</p>
                )}
              </button>
            ))}
          </div>
        </section>
      )}

      {/* Today Tasks */}
      {tasksByStatus.now.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-indigo-400 uppercase tracking-wider">Today</h2>
            <button onClick={() => navigate('/tasks')} className="text-xs text-slate-400 flex items-center gap-1">
              View all <ChevronRight className="w-3 h-3" />
            </button>
          </div>
          <div className="space-y-2">
            {tasksByStatus.now.slice(0, 3).map((task: any) => (
              <button
                key={task.id}
                onClick={() => navigate(`/tasks/${task.id}`)}
                className="w-full bg-slate-800/50 border border-slate-700/50 rounded-xl p-3 text-left"
              >
                <p className="text-white text-sm font-medium truncate">{task.title}</p>
              </button>
            ))}
          </div>
        </section>
      )}

      {/* Upcoming Events */}
      {events && events.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">Upcoming</h2>
            <button onClick={() => navigate('/planner')} className="text-xs text-slate-400 flex items-center gap-1">
              View all <ChevronRight className="w-3 h-3" />
            </button>
          </div>
          <div className="space-y-2">
            {events.slice(0, 3).map((event: any) => (
              <div key={event.id} className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-3 flex items-center gap-3">
                <Calendar className="w-4 h-4 text-indigo-400 shrink-0" />
                <div className="min-w-0">
                  <p className="text-white text-sm font-medium truncate">{event.title}</p>
                  <p className="text-slate-400 text-xs">
                    {format(new Date(event.start_at), 'MMM d, h:mm a')}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Empty state when nothing happening */}
      {overdueCount === 0 && todayCount === 0 && unsortedCount === 0 && (!events || events.length === 0) && (
        <div className="text-center py-12">
          <Brain className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <p className="text-slate-400">All clear! Tap the + button to get started.</p>
        </div>
      )}
    </div>
  );
}
