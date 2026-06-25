import { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight, CalendarPlus, Plus, X } from 'lucide-react';
import { useCalendarEvents, useCreateEvent } from '../../hooks/useCalendarEvents';
import { useBirthdays } from '../../hooks/useBirthdays';
import { useTasks } from '../../hooks/useTasks';
import { useAuthStore } from '../../store/authStore';
import {
  format, startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth,
  addDays, addWeeks, addMonths, subDays, subWeeks, subMonths,
  eachDayOfInterval, isSameDay, isSameMonth, isToday, getMonth, getDate,
} from 'date-fns';

type ViewType = 'daily' | 'weekly' | 'monthly';

export default function PlannerPage() {
  const user = useAuthStore((s) => s.user);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<ViewType>('daily');
  const [showAddEvent, setShowAddEvent] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newStartDate, setNewStartDate] = useState('');
  const [newStartTime, setNewStartTime] = useState('09:00');
  const [newEndTime, setNewEndTime] = useState('10:00');
  const createEvent = useCreateEvent();

  const range = useMemo(() => {
    if (view === 'daily') return { start: startOfDay(currentDate), end: endOfDay(currentDate) };
    if (view === 'weekly') return { start: startOfWeek(currentDate), end: endOfWeek(currentDate) };
    return { start: startOfMonth(currentDate), end: endOfMonth(currentDate) };
  }, [currentDate, view]);

  const { data: events } = useCalendarEvents(range.start.toISOString(), range.end.toISOString());
  const { data: birthdays } = useBirthdays();
  const { data: tasks } = useTasks();

  const navigate = (dir: 'prev' | 'next') => {
    const fn = dir === 'prev'
      ? view === 'daily' ? subDays : view === 'weekly' ? subWeeks : subMonths
      : view === 'daily' ? addDays : view === 'weekly' ? addWeeks : addMonths;
    setCurrentDate(fn(currentDate, 1));
  };

  const dateLabel = useMemo(() => {
    if (view === 'daily') return format(currentDate, 'EEEE, MMM d');
    if (view === 'weekly') {
      const start = startOfWeek(currentDate);
      const end = endOfWeek(currentDate);
      return `${format(start, 'MMM d')} - ${format(end, 'MMM d, yyyy')}`;
    }
    return format(currentDate, 'MMMM yyyy');
  }, [currentDate, view]);

  const todayBirthdays = useMemo(() => {
    if (!birthdays) return [];
    return birthdays.filter((b: any) => {
      const bd = new Date(b.birth_date);
      if (view === 'daily') return getMonth(bd) === getMonth(currentDate) && getDate(bd) === getDate(currentDate);
      return false;
    });
  }, [birthdays, currentDate, view]);

  const dayTasks = useMemo(() => {
    if (!tasks || view !== 'daily') return [];
    return tasks.filter((t: any) => t.due_date && !t.is_done && isSameDay(new Date(t.due_date), currentDate));
  }, [tasks, currentDate, view]);

  const hours = Array.from({ length: 16 }, (_, i) => i + 6);

  const monthDays = useMemo(() => {
    if (view !== 'monthly') return [];
    const start = startOfWeek(startOfMonth(currentDate));
    const end = endOfWeek(endOfMonth(currentDate));
    return eachDayOfInterval({ start, end });
  }, [currentDate, view]);

  const weekDays = useMemo(() => {
    if (view !== 'weekly') return [];
    const start = startOfWeek(currentDate);
    return eachDayOfInterval({ start, end: addDays(start, 6) });
  }, [currentDate, view]);

  const handleAddEvent = async () => {
    if (!newTitle.trim() || !user) return;
    const dateStr = newStartDate || format(currentDate, 'yyyy-MM-dd');
    const startAt = new Date(`${dateStr}T${newStartTime}`);
    const endAt = new Date(`${dateStr}T${newEndTime}`);
    await createEvent.mutateAsync({
      title: newTitle.trim(),
      start_at: startAt.toISOString(),
      end_at: endAt.toISOString(),
    });
    setNewTitle('');
    setShowAddEvent(false);
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button onClick={() => navigate('prev')} className="p-2 text-slate-400 hover:text-white">
          <ChevronLeft className="w-5 h-5" />
        </button>
        <div className="text-center">
          <h2 className="text-lg font-semibold text-white">{dateLabel}</h2>
          <button onClick={() => setCurrentDate(new Date())} className="text-xs text-indigo-400 mt-0.5">
            Today
          </button>
        </div>
        <button onClick={() => navigate('next')} className="p-2 text-slate-400 hover:text-white">
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* View Switcher */}
      <div className="flex gap-1 bg-slate-800 rounded-xl p-1">
        {(['daily', 'weekly', 'monthly'] as const).map((v) => (
          <button
            key={v}
            onClick={() => setView(v)}
            className={`flex-1 py-2 text-xs font-medium rounded-lg transition-colors ${
              view === v ? 'bg-indigo-500 text-white' : 'text-slate-400 hover:text-slate-300'
            }`}
          >
            {v === 'daily' ? 'Day' : v === 'weekly' ? 'Week' : 'Month'}
          </button>
        ))}
      </div>

      {/* Daily View */}
      {view === 'daily' && (
        <div className="space-y-3">
          {todayBirthdays.length > 0 && (
            <div className="bg-pink-500/10 border border-pink-500/20 rounded-xl p-3 text-sm text-pink-400">
              🎂 {todayBirthdays.map((b: any) => b.person_name).join(', ')}
            </div>
          )}
          {dayTasks.length > 0 && (
            <div className="space-y-1">
              <p className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">Tasks due</p>
              {dayTasks.map((t: any) => (
                <div key={t.id} className="bg-emerald-500/10 border-l-2 border-emerald-500 rounded-r-lg p-2.5 text-sm text-emerald-300">
                  {t.title}
                </div>
              ))}
            </div>
          )}
          <div className="space-y-0">
            {hours.map((h) => {
              const hourEvents = events?.filter((e: any) => {
                const start = new Date(e.start_at);
                return start.getHours() === h && isSameDay(start, currentDate);
              }) || [];
              return (
                <div key={h} className="flex border-t border-slate-800 min-h-[48px]">
                  <div className="w-14 py-2 text-xs text-slate-500 text-right pr-3 shrink-0">
                    {format(new Date().setHours(h, 0), 'h a')}
                  </div>
                  <div className="flex-1 py-1 px-2 space-y-1">
                    {hourEvents.map((e: any) => (
                      <div key={e.id} className="bg-indigo-500/20 border-l-2 border-indigo-500 rounded-r-lg p-2 text-sm text-indigo-300">
                        <p className="font-medium">{e.title}</p>
                        <p className="text-xs text-indigo-400/70">
                          {format(new Date(e.start_at), 'h:mm a')} - {format(new Date(e.end_at), 'h:mm a')}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Weekly View */}
      {view === 'weekly' && (
        <div className="flex gap-1 overflow-x-auto pb-2">
          {weekDays.map((day) => {
            const dayEvents = events?.filter((e: any) => isSameDay(new Date(e.start_at), day)) || [];
            const dayBirthdays = birthdays?.filter((b: any) => {
              const bd = new Date(b.birth_date);
              return getMonth(bd) === getMonth(day) && getDate(bd) === getDate(day);
            }) || [];
            return (
              <div
                key={day.toISOString()}
                onClick={() => { setCurrentDate(day); setView('daily'); }}
                className={`flex-1 min-w-[80px] rounded-xl p-2 cursor-pointer ${
                  isToday(day) ? 'bg-indigo-500/10 border border-indigo-500/30' : 'bg-slate-800/50 border border-slate-700/30'
                }`}
              >
                <p className="text-xs text-slate-400 text-center">{format(day, 'EEE')}</p>
                <p className={`text-sm font-bold text-center mb-2 ${isToday(day) ? 'text-indigo-400' : 'text-white'}`}>
                  {format(day, 'd')}
                </p>
                <div className="space-y-1">
                  {dayBirthdays.map((b: any) => (
                    <div key={b.id} className="text-xs bg-pink-500/20 text-pink-400 rounded px-1 py-0.5 truncate">🎂 {b.person_name}</div>
                  ))}
                  {dayEvents.slice(0, 3).map((e: any) => (
                    <div key={e.id} className="text-xs bg-indigo-500/20 text-indigo-400 rounded px-1 py-0.5 truncate">{e.title}</div>
                  ))}
                  {dayEvents.length > 3 && <p className="text-xs text-slate-500 text-center">+{dayEvents.length - 3}</p>}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Monthly View */}
      {view === 'monthly' && (
        <div>
          <div className="grid grid-cols-7 gap-0.5 mb-1">
            {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((d) => (
              <div key={d} className="text-xs text-slate-500 text-center py-1 font-medium">{d}</div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-0.5">
            {monthDays.map((day) => {
              const dayEvents = events?.filter((e: any) => isSameDay(new Date(e.start_at), day)) || [];
              const dayBirthdays = birthdays?.filter((b: any) => {
                const bd = new Date(b.birth_date);
                return getMonth(bd) === getMonth(day) && getDate(bd) === getDate(day);
              }) || [];
              const inMonth = isSameMonth(day, currentDate);
              return (
                <button
                  key={day.toISOString()}
                  onClick={() => { setCurrentDate(day); setView('daily'); }}
                  className={`aspect-square rounded-lg p-1 flex flex-col items-center ${
                    !inMonth ? 'opacity-30' : ''
                  } ${isToday(day) ? 'bg-indigo-500 text-white' : 'hover:bg-slate-800'}`}
                >
                  <span className={`text-xs font-medium ${isToday(day) ? 'text-white' : inMonth ? 'text-slate-300' : 'text-slate-600'}`}>
                    {format(day, 'd')}
                  </span>
                  <div className="flex gap-0.5 mt-0.5">
                    {dayEvents.length > 0 && <div className="w-1.5 h-1.5 rounded-full bg-indigo-400" />}
                    {dayBirthdays.length > 0 && <div className="w-1.5 h-1.5 rounded-full bg-pink-400" />}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Add Event FAB */}
      <button
        onClick={() => { setNewStartDate(format(currentDate, 'yyyy-MM-dd')); setShowAddEvent(true); }}
        className="fixed bottom-24 right-6 w-12 h-12 bg-indigo-500 hover:bg-indigo-600 rounded-full flex items-center justify-center text-white shadow-lg z-30"
      >
        <CalendarPlus className="w-5 h-5" />
      </button>

      {/* Add Event Sheet */}
      {showAddEvent && (
        <div className="fixed inset-0 z-50 flex items-end">
          <div className="absolute inset-0 bg-black/60" onClick={() => setShowAddEvent(false)} />
          <div className="relative w-full bg-slate-900 border-t border-slate-700 rounded-t-2xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-white">New Event</h3>
              <button onClick={() => setShowAddEvent(false)} className="text-slate-400"><X className="w-5 h-5" /></button>
            </div>
            <input
              type="text"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="Event title"
              autoFocus
              className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
            />
            <div className="flex gap-3">
              <input type="date" value={newStartDate} onChange={(e) => setNewStartDate(e.target.value)}
                className="flex-1 px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm" />
              <input type="time" value={newStartTime} onChange={(e) => setNewStartTime(e.target.value)}
                className="px-3 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm" />
              <input type="time" value={newEndTime} onChange={(e) => setNewEndTime(e.target.value)}
                className="px-3 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm" />
            </div>
            <button
              onClick={handleAddEvent}
              disabled={createEvent.isPending || !newTitle.trim()}
              className="w-full py-3 bg-indigo-500 hover:bg-indigo-600 disabled:opacity-50 text-white font-medium rounded-xl transition-colors"
            >
              {createEvent.isPending ? 'Creating...' : 'Create Event'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
