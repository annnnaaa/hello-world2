import { useState } from 'react';
import { Inbox, CheckSquare, Calendar, FileText, Lightbulb, X } from 'lucide-react';
import { useUnsortedThoughts, useConvertThought, useDismissThought } from '../hooks/useUnsortedThoughts';
import { useAuthStore } from '../store/authStore';
import { formatDistanceToNow } from 'date-fns';

type ConvertType = 'task' | 'event' | 'note' | 'idea';

export default function UnsortedPage() {
  const { data: thoughts, isLoading } = useUnsortedThoughts();
  const convertThought = useConvertThought();
  const dismissThought = useDismissThought();
  const createTask = useCreateTask();
  const createEvent = useCreateEvent();
  const createNote = useCreateNote();
  const createIdea = useCreateIdea();
  const user = useAuthStore((s) => s.user);

  const [converting, setConverting] = useState<{ id: string; type: ConvertType } | null>(null);
  const [editContent, setEditContent] = useState('');
  const [showConvertForm, setShowConvertForm] = useState(false);

  const handleStartConvert = (thoughtId: string, type: ConvertType, content: string) => {
    setConverting({ id: thoughtId, type });
    setEditContent(content);
    setShowConvertForm(true);
  };

  const handleConvert = async () => {
    if (!converting || !user) return;
    const { id, type } = converting;
    const title = editContent.slice(0, 100).trim();
    const description = editContent.length > 100 ? editContent : undefined;

    try {
      let convertedId: string | undefined;

      let data: Record<string, unknown> = {};
      if (type === 'task') {
        data = { title, description };
      } else if (type === 'event') {
        const start = new Date();
        const end = new Date(start.getTime() + 3600000);
        data = { title, description, start_at: start.toISOString(), end_at: end.toISOString() };
      } else if (type === 'note') {
        data = { title, content: editContent };
      } else if (type === 'idea') {
        data = { title, description: editContent };
      }

      await convertThought.mutateAsync({ thoughtId: id, type, data });
      setShowConvertForm(false);
      setConverting(null);
    } catch (err) {
      console.error('Conversion failed:', err);
    }
  };

  const handleDismiss = (id: string) => {
    dismissThought.mutate(id);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Unsorted Thoughts</h1>
          <p className="text-slate-400 text-sm mt-1">Sort your brain dump into the right place</p>
        </div>
        {thoughts && thoughts.length > 0 && (
          <span className="px-2.5 py-1 bg-amber-500/20 text-amber-400 text-xs font-medium rounded-full">
            {thoughts.length}
          </span>
        )}
      </div>

      {(!thoughts || thoughts.length === 0) ? (
        <div className="text-center py-16">
          <Inbox className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <p className="text-white font-medium">All caught up!</p>
          <p className="text-slate-400 text-sm mt-1">Your brain dump items will appear here for sorting.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {thoughts.map((thought: any) => (
            <div key={thought.id} className="bg-slate-800/50 border-l-4 border-indigo-500/40 border-y border-r border-slate-700/50 rounded-r-xl p-4">
              <p className="text-slate-200 text-sm mb-3">{thought.content}</p>
              <p className="text-slate-500 text-xs mb-3">
                {formatDistanceToNow(new Date(thought.created_at), { addSuffix: true })}
              </p>
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  onClick={() => handleStartConvert(thought.id, 'task', thought.content)}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 rounded-lg text-xs font-medium transition-colors"
                >
                  <CheckSquare className="w-3.5 h-3.5" /> Task
                </button>
                <button
                  onClick={() => handleStartConvert(thought.id, 'event', thought.content)}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 rounded-lg text-xs font-medium transition-colors"
                >
                  <Calendar className="w-3.5 h-3.5" /> Event
                </button>
                <button
                  onClick={() => handleStartConvert(thought.id, 'note', thought.content)}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 rounded-lg text-xs font-medium transition-colors"
                >
                  <FileText className="w-3.5 h-3.5" /> Note
                </button>
                <button
                  onClick={() => handleStartConvert(thought.id, 'idea', thought.content)}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 rounded-lg text-xs font-medium transition-colors"
                >
                  <Lightbulb className="w-3.5 h-3.5" /> Idea
                </button>
                <button
                  onClick={() => handleDismiss(thought.id)}
                  className="p-1.5 text-slate-500 hover:text-red-400 transition-colors ml-auto"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Convert Form Bottom Sheet */}
      {showConvertForm && converting && (
        <div className="fixed inset-0 z-50 flex items-end">
          <div className="absolute inset-0 bg-black/60" onClick={() => setShowConvertForm(false)} />
          <div className="relative w-full bg-slate-900 border-t border-slate-700 rounded-t-2xl p-6 space-y-4 max-h-[70vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-white">
                Convert to {converting.type.charAt(0).toUpperCase() + converting.type.slice(1)}
              </h3>
              <button onClick={() => setShowConvertForm(false)} className="text-slate-400"><X className="w-5 h-5" /></button>
            </div>
            <textarea
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              className="w-full min-h-[100px] bg-slate-800 border border-slate-700 rounded-xl p-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none text-sm"
            />
            <button
              onClick={handleConvert}
              disabled={convertThought.isPending}
              className="w-full py-3 bg-indigo-500 hover:bg-indigo-600 disabled:opacity-50 text-white font-medium rounded-xl transition-colors"
            >
              {convertThought.isPending ? 'Converting...' : `Save as ${converting.type}`}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
