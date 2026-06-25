import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, CheckSquare, Zap, ChevronDown, ChevronRight, Check } from 'lucide-react';
import { useTasks, useCreateTask, useToggleTaskDone } from '../../hooks/useTasks';
import { useTaskBatches } from '../../hooks/useTaskBatches';
import { useAuthStore } from '../../store/authStore';
import { deriveTaskStatus, STATUS_LABELS, STATUS_COLORS } from '../../lib/taskLogic';
import type { DerivedTaskStatus } from '../../lib/taskLogic';
import { format } from 'date-fns';

const STATUS_DISPLAY_ORDER: DerivedTaskStatus[] = ['overdue', 'now', 'soon', 'later', 'hold'];

export default function TaskHubPage() {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const { data: tasks, isLoading } = useTasks();
  const { data: batches } = useTaskBatches();
  const createTask = useCreateTask();
  const toggleDone = useToggleTaskDone();

  const [showAddForm, setShowAddForm] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDueDate, setNewDueDate] = useState('');
  const [newEnergy, setNewEnergy] = useState<'low' | 'medium' | 'high'>('medium');
  const [statusFilter, setStatusFilter] = useState<DerivedTaskStatus | 'all'>('all');
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['overdue', 'now']));

  const grouped = useMemo(() => {
    if (!tasks) return {};
    const g: Record<string, any[]> = {};
    tasks.forEach((t: any) => {
      const s = deriveTaskStatus(t);
      if (statusFilter !== 'all' && s !== statusFilter) return;
      if (!g[s]) g[s] = [];
      g[s].push({ ...t, derivedStatus: s });
    });
    return g;
  }, [tasks, statusFilter]);

  const toggleSection = (s: string) => {
    setExpandedSections((prev) => {
      const next = new Set(prev);
      next.has(s) ? next.delete(s) : next.add(s);
      return next;
    });
  };

  const handleAddTask = async () => {
    if (!newTitle.trim() || !user) return;
    await createTask.mutateAsync({
      title: newTitle.trim(),
      due_date: newDueDate || null,
      energy: newEnergy,
    });
    setNewTitle('');
    setNewDueDate('');
    setShowAddForm(false);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Tasks</h1>
        <button
          onClick={() => setShowAddForm(true)}
          className="p-2 bg-indigo-500 hover:bg-indigo-600 rounded-xl text-white transition-colors"
        >
          <Plus className="w-5 h-5" />
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1 scrollbar-hide">
        {(['all', ...STATUS_DISPLAY_ORDER] as const).map((s) => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
              statusFilter === s
                ? 'bg-indigo-500 text-white'
                : 'bg-slate-800 text-slate-400 hover:text-slate-300'
            }`}
          >
            {s === 'all' ? 'All' : STATUS_LABELS[s]}
          </button>
        ))}
      </div>

      {/* Task Sections */}
      {STATUS_DISPLAY_ORDER.map((status) => {
        const sectionTasks = grouped[status];
        if (!sectionTasks || sectionTasks.length === 0) return null;
        const isExpanded = expandedSections.has(status);
        const colors = STATUS_COLORS[status];

        return (
          <section key={status}>
            <button
              onClick={() => toggleSection(status)}
              className="flex items-center gap-2 w-full py-2"
            >
              {isExpanded ? <ChevronDown className="w-4 h-4 text-slate-400" /> : <ChevronRight className="w-4 h-4 text-slate-400" />}
              <span className={`text-sm font-semibold uppercase tracking-wider ${colors.split(' ')[1]}`}>
                {STATUS_LABELS[status]}
              </span>
              <span className={`px-2 py-0.5 rounded-full text-xs ${colors}`}>
                {sectionTasks.length}
              </span>
            </button>

            {isExpanded && (
              <div className="space-y-2 ml-6">
                {sectionTasks.map((task: any) => (
                  <div
                    key={task.id}
                    className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-3 flex items-start gap-3"
                  >
                    <button
                      onClick={(e) => { e.stopPropagation(); toggleDone.mutate({ id: task.id, isDone: true }); }}
                      className="mt-0.5 w-5 h-5 rounded-full border-2 border-slate-600 hover:border-indigo-400 shrink-0 flex items-center justify-center transition-colors"
                    >
                      {task.is_done && <Check className="w-3 h-3 text-indigo-400" />}
                    </button>
                    <button
                      onClick={() => navigate(`/tasks/${task.id}`)}
                      className="flex-1 text-left min-w-0"
                    >
                      <p className="text-white text-sm font-medium truncate">{task.title}</p>
                      <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                        {task.due_date && (
                          <span className={`text-xs ${status === 'overdue' ? 'text-red-400' : 'text-slate-400'}`}>
                            {format(new Date(task.due_date), 'MMM d')}
                          </span>
                        )}
                        <span className="flex items-center gap-0.5 text-xs text-slate-500">
                          <Zap className="w-3 h-3" /> {task.energy}
                        </span>
                        {task.batch && (
                          <span
                            className="text-xs px-1.5 py-0.5 rounded"
                            style={{ backgroundColor: task.batch.color + '20', color: task.batch.color }}
                          >
                            {task.batch.name}
                          </span>
                        )}
                      </div>
                    </button>
                    <ChevronRight className="w-4 h-4 text-slate-600 shrink-0 mt-1" />
                  </div>
                ))}
              </div>
            )}
          </section>
        );
      })}

      {Object.keys(grouped).length === 0 && (
        <div className="text-center py-16">
          <CheckSquare className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <p className="text-white font-medium">No tasks yet</p>
          <p className="text-slate-400 text-sm mt-1">Tap + to create your first task</p>
        </div>
      )}

      {/* Add Task Sheet */}
      {showAddForm && (
        <div className="fixed inset-0 z-50 flex items-end">
          <div className="absolute inset-0 bg-black/60" onClick={() => setShowAddForm(false)} />
          <div className="relative w-full bg-slate-900 border-t border-slate-700 rounded-t-2xl p-6 space-y-4">
            <h3 className="text-lg font-semibold text-white">New Task</h3>
            <input
              type="text"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="What needs to be done?"
              autoFocus
              className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
            />
            <div className="flex gap-3">
              <input
                type="date"
                value={newDueDate}
                onChange={(e) => setNewDueDate(e.target.value)}
                className="flex-1 px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
              />
              <select
                value={newEnergy}
                onChange={(e) => setNewEnergy(e.target.value as any)}
                className="px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
              >
                <option value="low">Low energy</option>
                <option value="medium">Med energy</option>
                <option value="high">High energy</option>
              </select>
            </div>
            <button
              onClick={handleAddTask}
              disabled={createTask.isPending || !newTitle.trim()}
              className="w-full py-3 bg-indigo-500 hover:bg-indigo-600 disabled:opacity-50 text-white font-medium rounded-xl transition-colors"
            >
              {createTask.isPending ? 'Creating...' : 'Create Task'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
