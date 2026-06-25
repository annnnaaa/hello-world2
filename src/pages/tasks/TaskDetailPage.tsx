import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, Pencil, Trash2, Check, Zap, Calendar } from 'lucide-react';
import { useTask, useUpdateTask, useToggleTaskDone, useDeleteTask } from '../../hooks/useTasks';
import { deriveTaskStatus, STATUS_LABELS, STATUS_COLORS } from '../../lib/taskLogic';
import { format, formatDistanceToNow } from 'date-fns';
import { useState } from 'react';

export default function TaskDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: task, isLoading } = useTask(id!);
  const toggleDone = useToggleTaskDone();
  const deleteTask = useDeleteTask();
  const updateTask = useUpdateTask();
  const [editing, setEditing] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const [showDelete, setShowDelete] = useState(false);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!task) {
    return (
      <div className="text-center py-20">
        <p className="text-slate-400">Task not found</p>
        <button onClick={() => navigate('/tasks')} className="text-indigo-400 text-sm mt-2">Go back</button>
      </div>
    );
  }

  const status = deriveTaskStatus(task);
  const colors = STATUS_COLORS[status];

  const handleSave = async () => {
    await updateTask.mutateAsync({ id: task.id, title: editTitle, description: editDesc });
    setEditing(false);
  };

  const handleDelete = async () => {
    await deleteTask.mutateAsync(task.id);
    navigate('/tasks');
  };

  const startEdit = () => {
    setEditTitle(task.title);
    setEditDesc(task.description || '');
    setEditing(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate('/tasks')} className="p-2 text-slate-400 hover:text-white">
          <ChevronLeft className="w-5 h-5" />
        </button>
        <div className="flex-1" />
        <button onClick={startEdit} className="p-2 text-slate-400 hover:text-white">
          <Pencil className="w-4 h-4" />
        </button>
        <button onClick={() => setShowDelete(true)} className="p-2 text-slate-400 hover:text-red-400">
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      {editing ? (
        <div className="space-y-4">
          <input
            type="text"
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <textarea
            value={editDesc}
            onChange={(e) => setEditDesc(e.target.value)}
            placeholder="Add description..."
            className="w-full min-h-[100px] px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none text-sm"
          />
          <div className="flex gap-3">
            <button onClick={() => setEditing(false)} className="flex-1 py-2.5 bg-slate-800 text-slate-300 rounded-xl">Cancel</button>
            <button onClick={handleSave} disabled={updateTask.isPending} className="flex-1 py-2.5 bg-indigo-500 text-white rounded-xl">Save</button>
          </div>
        </div>
      ) : (
        <>
          <div>
            <h1 className={`text-xl font-bold ${task.is_done ? 'text-slate-500 line-through' : 'text-white'}`}>
              {task.title}
            </h1>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${colors}`}>
              {STATUS_LABELS[status]}
            </span>
            <span className="flex items-center gap-1 px-2.5 py-1 bg-slate-800 rounded-full text-xs text-slate-400">
              <Zap className="w-3 h-3" /> {task.energy}
            </span>
            {task.batch && (
              <span
                className="px-2.5 py-1 rounded-full text-xs"
                style={{ backgroundColor: task.batch.color + '20', color: task.batch.color }}
              >
                {task.batch.name}
              </span>
            )}
          </div>

          {task.due_date && (
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="w-4 h-4 text-slate-400" />
              <span className={status === 'overdue' ? 'text-red-400' : 'text-slate-300'}>
                {format(new Date(task.due_date), 'EEEE, MMMM d, yyyy')}
              </span>
              <span className="text-slate-500 text-xs">
                ({formatDistanceToNow(new Date(task.due_date), { addSuffix: true })})
              </span>
            </div>
          )}

          <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4">
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Description</h3>
            <p className="text-slate-300 text-sm whitespace-pre-wrap">
              {task.description || 'No description'}
            </p>
          </div>

          <div className="text-xs text-slate-500 space-y-1">
            <p>Created {formatDistanceToNow(new Date(task.created_at), { addSuffix: true })}</p>
            <p>Updated {formatDistanceToNow(new Date(task.updated_at), { addSuffix: true })}</p>
          </div>
        </>
      )}

      {!editing && (
        <button
          onClick={() => toggleDone.mutate({ id: task.id, isDone: !task.is_done })}
          className={`w-full py-3 font-medium rounded-xl transition-colors flex items-center justify-center gap-2 ${
            task.is_done
              ? 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              : 'bg-emerald-500 text-white hover:bg-emerald-600'
          }`}
        >
          <Check className="w-5 h-5" />
          {task.is_done ? 'Reopen Task' : 'Mark Complete'}
        </button>
      )}

      {showDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
          <div className="absolute inset-0 bg-black/60" onClick={() => setShowDelete(false)} />
          <div className="relative bg-slate-900 border border-slate-700 rounded-2xl p-6 max-w-sm w-full space-y-4">
            <h3 className="text-lg font-semibold text-white">Delete task?</h3>
            <p className="text-slate-400 text-sm">This cannot be undone.</p>
            <div className="flex gap-3">
              <button onClick={() => setShowDelete(false)} className="flex-1 py-2.5 bg-slate-800 text-slate-300 rounded-xl">Cancel</button>
              <button onClick={handleDelete} className="flex-1 py-2.5 bg-red-500 text-white rounded-xl">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
