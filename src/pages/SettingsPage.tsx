import { useState } from 'react';
import { LogOut, Sun, Moon, Monitor, Plus } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useUIStore } from '../store/uiStore';
import { useTaskBatches, useCreateBatch } from '../hooks/useTaskBatches';
import { useNavigate } from 'react-router-dom';

export default function SettingsPage() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const { theme, setTheme } = useUIStore();
  const { data: batches } = useTaskBatches();
  const createBatch = useCreateBatch();
  const [newBatchName, setNewBatchName] = useState('');
  const [showAddBatch, setShowAddBatch] = useState(false);

  const displayName = (user as any)?.user_metadata?.display_name || 'User';
  const email = user?.email || '';

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  const handleAddBatch = async () => {
    if (!newBatchName.trim()) return;
    await createBatch.mutateAsync({ name: newBatchName.trim() });
    setNewBatchName('');
    setShowAddBatch(false);
  };

  const themes = [
    { value: 'dark' as const, label: 'Dark', icon: Moon },
    { value: 'light' as const, label: 'Light', icon: Sun },
    { value: 'system' as const, label: 'System', icon: Monitor },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white">Settings</h1>

      {/* Profile */}
      <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-400 text-xl font-bold">
            {displayName.charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="text-white font-semibold">{displayName}</p>
            <p className="text-slate-400 text-sm">{email}</p>
          </div>
        </div>
      </div>

      {/* Theme */}
      <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-4 space-y-3">
        <h2 className="text-sm font-semibold text-slate-300">Theme</h2>
        <div className="flex gap-2">
          {themes.map(({ value, label, icon: Icon }) => (
            <button
              key={value}
              onClick={() => setTheme(value)}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                theme === value
                  ? 'bg-indigo-500 text-white'
                  : 'bg-slate-900 text-slate-400 hover:text-slate-300'
              }`}
            >
              <Icon className="w-4 h-4" /> {label}
            </button>
          ))}
        </div>
      </div>

      {/* Task Batches */}
      <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-4 space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-slate-300">Task Batches</h2>
          <button onClick={() => setShowAddBatch(true)} className="text-indigo-400">
            <Plus className="w-4 h-4" />
          </button>
        </div>
        <div className="space-y-1.5">
          {batches?.map((batch: any) => (
            <div key={batch.id} className="flex items-center gap-3 py-1.5">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: batch.color }} />
              <span className="text-white text-sm">{batch.name}</span>
              {batch.is_default && <span className="text-xs text-slate-500">default</span>}
            </div>
          ))}
        </div>
        {showAddBatch && (
          <div className="flex gap-2 mt-2">
            <input
              type="text"
              value={newBatchName}
              onChange={(e) => setNewBatchName(e.target.value)}
              placeholder="Batch name"
              autoFocus
              className="flex-1 px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
            />
            <button
              onClick={handleAddBatch}
              disabled={createBatch.isPending}
              className="px-4 py-2 bg-indigo-500 text-white rounded-lg text-sm"
            >
              Add
            </button>
          </div>
        )}
      </div>

      {/* About */}
      <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-4 text-center">
        <p className="text-white font-semibold">ClearMind</p>
        <p className="text-slate-400 text-xs mt-0.5">Space to think. Room to do.</p>
        <p className="text-slate-500 text-xs mt-1">v1.0.0</p>
      </div>

      {/* Logout */}
      <button
        onClick={handleSignOut}
        className="w-full flex items-center justify-center gap-2 py-3 bg-red-500/10 hover:bg-red-500/20 text-red-400 font-medium rounded-xl transition-colors"
      >
        <LogOut className="w-5 h-5" /> Sign Out
      </button>
    </div>
  );
}
