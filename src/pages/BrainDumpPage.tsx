import { useState } from 'react';
import { Brain, Check } from 'lucide-react';
import { useCaptureMutation, useBrainDumpHistory } from '../hooks/useBrainDump';
import { formatDistanceToNow } from 'date-fns';

export default function BrainDumpPage() {
  const [text, setText] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const capture = useCaptureMutation();
  const { data: history } = useBrainDumpHistory();

  const handleCapture = () => {
    if (!text.trim()) return;
    capture.mutate(text.trim(), {
      onSuccess: () => {
        setText('');
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 1500);
      },
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Brain Dump</h1>
        <p className="text-slate-400 text-sm mt-1">Capture what's on your mind</p>
      </div>

      <div className="space-y-3">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Dump your thoughts here... Don't worry about organizing them yet."
          className="w-full min-h-[150px] bg-slate-800 border border-slate-700 rounded-2xl p-4 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none text-sm leading-relaxed"
        />
        <div className="flex items-center justify-between">
          <span className="text-xs text-slate-500">{text.length} characters</span>
          <button
            onClick={handleCapture}
            disabled={capture.isPending || !text.trim()}
            className="flex items-center gap-2 px-5 py-2.5 bg-indigo-500 hover:bg-indigo-600 disabled:opacity-50 text-white font-medium rounded-xl transition-colors"
          >
            {showSuccess ? (
              <>
                <Check className="w-4 h-4" /> Captured!
              </>
            ) : (
              <>
                <Brain className="w-4 h-4" /> {capture.isPending ? 'Saving...' : 'Capture'}
              </>
            )}
          </button>
        </div>
      </div>

      {history && history.length > 0 && (
        <section>
          <h2 className="text-sm font-semibold text-slate-300 uppercase tracking-wider mb-3">Recent captures</h2>
          <div className="space-y-2">
            {history.map((entry: any) => (
              <div key={entry.id} className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-3">
                <p className="text-slate-300 text-sm line-clamp-2">{entry.content}</p>
                <p className="text-slate-500 text-xs mt-1.5">
                  {formatDistanceToNow(new Date(entry.created_at), { addSuffix: true })}
                </p>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
