
import React, { useState, useEffect, useMemo } from 'react';
import { Habit, AIInsight, FrequencyType, TabType, SpecialDay } from './types';
import { storage } from './services/storage';
import { getHabitReflections } from './services/gemini';
import { COLORS, Icons, MOTIVATIONAL_PROMPTS } from './constants';
import HabitCard from './components/HabitCard';
import YearlyHeatmap from './components/YearlyHeatmap';
import AIInsightsSection from './components/AIInsightsSection';
import CalendarView from './components/CalendarView';
import WeeklyCalendar from './components/WeeklyCalendar';
import { getTodayStr, getStreak } from './utils/dateUtils';

const App: React.FC = () => {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [specialDays, setSpecialDays] = useState<SpecialDay[]>([]);
  const [insight, setInsight] = useState<AIInsight | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>('home');
  const [isAddingHabit, setIsAddingHabit] = useState(false);
  const [isAddingSpecial, setIsAddingSpecial] = useState(false);
  const [loadingInsight, setLoadingInsight] = useState(false);
  
  const [focusedDate, setFocusedDate] = useState<string>(getTodayStr());
  
  const [newHabitName, setNewHabitName] = useState('');
  const [newHabitFreq, setNewHabitFreq] = useState<FrequencyType>('daily');
  const [newSpecial, setNewSpecial] = useState({ title: '', date: getTodayStr(), notes: '', type: 'exam' as const });

  useEffect(() => {
    const h = storage.getHabits();
    const s = storage.getSpecialDays();
    const i = storage.getInsights();
    setHabits(h);
    setSpecialDays(s);
    if (i.length > 0) setInsight(i[0]);
  }, []);

  const syncHabits = (newHabits: Habit[]) => {
    setHabits(newHabits);
    storage.saveHabits(newHabits);
  };

  const syncSpecialDays = (newDays: SpecialDay[]) => {
    setSpecialDays(newDays);
    storage.saveSpecialDays(newDays);
  };

  const toggleHabitCompletion = (id: string, date: string) => {
    // Check for Milestone Conflict: Cannot mark habits on Milestone days
    const isMilestone = specialDays.some(sd => sd.date === date);
    if (isMilestone) {
      alert("This is a Milestone day! No habit tracking required. Enjoy your focused day.");
      return;
    }

    const today = getTodayStr();
    if (date !== today) return;

    const updated = habits.map(h => h.id === id ? {
      ...h, completions: { ...h.completions, [date]: !h.completions[date] }
    } : h);
    syncHabits(updated);
  };

  const deleteHabit = (id: string) => {
    const habitToDelete = habits.find(h => h.id === id);
    if (!habitToDelete) return;

    if (confirm(`PERMANENT DELETE: Are you sure you want to erase "${habitToDelete.name}"? This cannot be undone.`)) {
      const updated = habits.filter(h => h.id !== id);
      syncHabits(updated);
      setInsight(null);
      storage.saveInsights([]);
    }
  };

  const toggleHabitActive = (id: string) => {
    const updated = habits.map(h => h.id === id ? { ...h, isActive: !h.isActive } : h);
    syncHabits(updated);
  };

  const addHabit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newHabitName.trim()) return;
    const habit: Habit = {
      id: crypto.randomUUID(),
      name: newHabitName,
      frequency: newHabitFreq,
      targetCount: 1,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      createdAt: new Date().toISOString(),
      isActive: true,
      completions: {}
    };
    syncHabits([...habits, habit]);
    setNewHabitName('');
    setIsAddingHabit(false);
  };

  const addSpecialDay = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSpecial.title.trim()) return;
    
    // Conflict Prevention: Check if habits were already logged for this date
    const dateHasHabits = habits.some(h => h.completions[newSpecial.date]);
    if (dateHasHabits) {
      if (!confirm("You have already logged habits for this date. Converting it to a Milestone will disable habit tracking for this day. Proceed?")) {
        return;
      }
    }

    const day: SpecialDay = { ...newSpecial, id: crypto.randomUUID() };
    syncSpecialDays([...specialDays, day]);
    setNewSpecial({ title: '', date: getTodayStr(), notes: '', type: 'exam' });
    setIsAddingSpecial(false);
  };

  const deleteSpecialDay = (id: string) => {
    if (confirm("Remove milestone? This will restore the day as a normal habit day.")) {
      const updated = specialDays.filter(d => d.id !== id);
      syncSpecialDays(updated);
    }
  };

  const handleGenerateInsight = async () => {
    if (habits.length === 0) return;
    setLoadingInsight(true);
    const data = await getHabitReflections(habits);
    const full = { ...data, date: new Date().toISOString() };
    setInsight(full);
    storage.saveInsights([full]);
    setLoadingInsight(false);
  };

  const todayStr = getTodayStr();
  const activeHabits = habits.filter(h => h.isActive);
  const milestoneOnFocused = specialDays.find(sd => sd.date === focusedDate);
  const completionsOnFocused = activeHabits.filter(h => h.completions[focusedDate]).length;
  const isViewingToday = focusedDate === todayStr;

  const NavItem = ({ id, icon: Icon, label }: { id: TabType, icon: any, label: string }) => (
    <button
      onClick={() => setActiveTab(id)}
      className={`flex flex-col items-center gap-1.5 p-2 flex-1 transition-all rounded-2xl ${
        activeTab === id ? 'text-indigo-600 bg-indigo-50/50 shadow-sm' : 'text-slate-500 hover:text-slate-800'
      }`}
    >
      <Icon />
      <span className="text-[9px] uppercase tracking-widest font-black">{label}</span>
    </button>
  );

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-28">
      {/* Header */}
      <header className="bg-white border-b border-slate-100 px-6 py-5 sticky top-0 z-40">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-black text-slate-800 tracking-tight">ZenHabit</h1>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest">365 Day Tracker</p>
            </div>
          </div>
          <div className="bg-indigo-600 text-white px-5 py-3 rounded-2xl shadow-lg shadow-indigo-100 flex items-center gap-4">
            <div className="text-center">
              <p className="text-[10px] font-black uppercase tracking-widest opacity-80">
                {milestoneOnFocused ? 'Milestone Day' : 'Daily Progress'}
              </p>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-black">
                  {milestoneOnFocused ? '0' : completionsOnFocused}
                </span>
                {!milestoneOnFocused && <span className="text-xs opacity-60">/ {activeHabits.length}</span>}
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 mt-8">
        {/* TAB 1: HOME */}
        {activeTab === 'home' && (
          <div className="space-y-6 animate-in fade-in duration-500">
            <WeeklyCalendar 
              habits={habits} 
              specialDays={specialDays} 
              focusedDate={focusedDate}
              onDateSelect={setFocusedDate}
            />

            <AIInsightsSection insight={insight} loading={loadingInsight} onRefresh={handleGenerateInsight} />
            
            <div className="grid gap-4">
              <div className="flex justify-between items-center px-1">
                <h2 className="text-sm font-black text-slate-500 uppercase tracking-widest">
                  {milestoneOnFocused ? "Milestone Focus" : isViewingToday ? "Today's Focus" : `Journal: ${focusedDate}`}
                </h2>
                {!isViewingToday && !milestoneOnFocused && (
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-100 px-2 py-1 rounded-md">View Only</span>
                )}
                {milestoneOnFocused && (
                  <span className="text-[10px] font-black text-rose-600 uppercase tracking-widest bg-rose-50 px-2 py-1 rounded-md border border-rose-100">Milestone Active</span>
                )}
              </div>

              {/* Special Event Hero Card */}
              {milestoneOnFocused && (
                <div className="bg-gradient-to-br from-rose-500 to-rose-600 p-8 rounded-[2.5rem] text-white shadow-xl shadow-rose-100 animate-in zoom-in-95 duration-300">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="bg-white/20 p-3 rounded-2xl backdrop-blur-md">
                      <Icons.Special />
                    </div>
                    <div>
                      <h4 className="text-2xl font-black tracking-tight">{milestoneOnFocused.title}</h4>
                      <p className="text-rose-100 text-xs font-bold uppercase tracking-widest">Non-Habit Day</p>
                    </div>
                  </div>
                  <p className="text-rose-50 font-medium bg-black/10 p-4 rounded-2xl italic leading-relaxed">
                    {milestoneOnFocused.notes || "Stay focused on your objective. Habit tracking is paused for today."}
                  </p>
                  <div className="mt-6 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-rose-100 bg-white/10 w-fit px-4 py-2 rounded-full">
                    <Icons.Fire /> Streaks are protected
                  </div>
                </div>
              )}

              {/* Habit List (Hidden if Milestone) */}
              {!milestoneOnFocused && (
                activeHabits.length > 0 ? (
                  activeHabits.map(h => (
                    <div key={h.id} className={`bg-white rounded-2xl p-5 shadow-sm border border-slate-100 transition-all ${!h.isActive ? 'opacity-50 grayscale' : ''}`}>
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-3">
                          <div className="w-1.5 h-10 rounded-full" style={{ backgroundColor: h.color }}></div>
                          <div>
                            <h3 className={`font-black text-lg ${h.completions[focusedDate] ? 'text-emerald-700' : 'text-slate-800'}`}>
                              {h.name}
                            </h3>
                            <div className="flex items-center gap-1 text-[10px] text-slate-500 uppercase tracking-widest font-black">
                              <Icons.Fire />
                              <span className="text-indigo-600">{getStreak(h.completions, specialDays)}</span>
                              <span>Day Streak</span>
                            </div>
                          </div>
                        </div>
                        <button
                          onClick={() => toggleHabitCompletion(h.id, focusedDate)}
                          disabled={!isViewingToday}
                          className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all ${
                            h.completions[focusedDate] 
                              ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-100 scale-105' 
                              : isViewingToday 
                                ? 'bg-slate-50 text-slate-300 border-2 border-dashed border-slate-200 hover:border-emerald-300'
                                : 'bg-slate-100 text-slate-200 border-none cursor-not-allowed'
                          }`}
                        >
                          <Icons.Check />
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="bg-white border-2 border-dashed border-slate-200 rounded-3xl p-16 text-center shadow-sm">
                    <p className="text-slate-400 font-black uppercase tracking-widest text-sm mb-4">No active habits</p>
                    <button onClick={() => setActiveTab('manage')} className="bg-slate-900 text-white px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg hover:bg-indigo-600 transition-all">
                      Create first habit
                    </button>
                  </div>
                )
              )}
            </div>
          </div>
        )}

        {/* TAB 2: CALENDAR */}
        {activeTab === 'calendar' && (
          <CalendarView 
            habits={habits} 
            specialDays={specialDays} 
            onToggle={toggleHabitCompletion} 
          />
        )}

        {/* TAB 3: STATS */}
        {activeTab === 'stats' && (
          <div className="space-y-8 animate-in fade-in duration-500">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-1">Consistency</span>
                <span className="text-3xl font-black text-indigo-600">
                  {habits.length > 0 ? Math.round(habits.reduce((acc, h) => {
                    const done = Object.values(h.completions).filter(Boolean).length;
                    const total = Math.max(1, Math.floor((new Date().getTime() - new Date(h.createdAt).getTime()) / 86400000));
                    return acc + (done / total);
                  }, 0) / habits.length * 100) : 0}%
                </span>
              </div>
              <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-1">Best Streak</span>
                <span className="text-3xl font-black text-rose-600">
                  {Math.max(0, ...habits.map(h => getStreak(h.completions, specialDays)))}
                </span>
              </div>
              <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 col-span-2 md:col-span-1">
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-1">Active Habits</span>
                <span className="text-3xl font-black text-emerald-600">{activeHabits.length}</span>
              </div>
            </div>
            
            <YearlyHeatmap habits={habits} />
            
            <div className="space-y-4 pb-4">
              <h2 className="text-sm font-black text-slate-500 uppercase tracking-widest px-1">Habit Performance</h2>
              {habits.map(h => {
                 const done = Object.values(h.completions).filter(Boolean).length;
                 const total = Math.max(1, Math.floor((new Date().getTime() - new Date(h.createdAt).getTime()) / 86400000));
                 const perc = Math.round((done/total) * 100);
                 return (
                  <div key={h.id} className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm transition-all hover:border-indigo-100 group">
                    <div className="flex justify-between items-center mb-3">
                      <span className="font-black text-slate-800 text-lg group-hover:text-indigo-600 transition-colors">{h.name}</span>
                      <span className="text-xs font-black text-indigo-700 bg-indigo-50 px-3 py-1 rounded-full">{perc}%</span>
                    </div>
                    <div className="h-4 w-full bg-slate-100 rounded-full overflow-hidden border border-slate-100 shadow-inner">
                      <div className="h-full transition-all duration-1000 relative" style={{ width: `${perc}%`, backgroundColor: h.color }}>
                         <div className="absolute top-0 right-0 h-full w-2 bg-white/20 blur-[1px]"></div>
                      </div>
                    </div>
                  </div>
                 )
              })}
            </div>
          </div>
        )}

        {/* TAB 4: MANAGE */}
        {activeTab === 'manage' && (
          <div className="space-y-8 animate-in fade-in duration-500">
            <button 
              onClick={() => setIsAddingHabit(!isAddingHabit)}
              className="w-full bg-indigo-600 text-white p-5 rounded-3xl font-black shadow-lg shadow-indigo-100 flex items-center justify-center gap-3 hover:bg-indigo-700 transition-all active:scale-95 uppercase tracking-widest text-xs"
            >
              <Icons.Plus /> {isAddingHabit ? 'Cancel' : 'Register New Habit'}
            </button>

            {isAddingHabit && (
              <form onSubmit={addHabit} className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-xl space-y-6 border-t-8 border-t-indigo-500 animate-in slide-in-from-top-4">
                <input value={newHabitName} onChange={e => setNewHabitName(e.target.value)} type="text" placeholder="Habit Name" className="w-full bg-slate-50 rounded-2xl p-4 text-slate-800 font-bold outline-none border border-slate-100 text-lg" />
                <select value={newHabitFreq} onChange={e => setNewHabitFreq(e.target.value as FrequencyType)} className="w-full bg-slate-50 rounded-2xl p-4 text-slate-800 font-bold outline-none border border-slate-100">
                  <option value="daily">Daily Discipline</option>
                  <option value="weekly">Weekly Target</option>
                  <option value="custom">Periodic Routine</option>
                </select>
                <button type="submit" className="w-full bg-slate-900 text-white p-5 rounded-2xl font-black shadow-md uppercase tracking-widest text-xs">Begin tracking</button>
              </form>
            )}

            <div className="space-y-4">
              <h2 className="text-sm font-black text-slate-500 uppercase tracking-widest px-1">Habit Registry</h2>
              {habits.map(h => (
                <div key={h.id} className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm flex items-center justify-between group transition-all hover:border-slate-300">
                  <div className="flex items-center gap-4">
                    <div className="w-2 h-10 rounded-full" style={{ backgroundColor: h.color }}></div>
                    <div>
                      <h3 className={`font-black text-lg ${h.isActive ? 'text-slate-800' : 'text-slate-400 italic line-through'}`}>{h.name}</h3>
                      <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest">{h.frequency}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <button onClick={() => toggleHabitActive(h.id)} className={`text-[9px] font-black px-4 py-2 rounded-xl border transition-all uppercase tracking-widest ${h.isActive ? 'bg-indigo-50 text-indigo-700 border-indigo-200' : 'bg-slate-50 text-slate-500 border-slate-200'}`}>
                      {h.isActive ? 'Active' : 'Paused'}
                    </button>
                    <button onClick={() => deleteHabit(h.id)} className="text-slate-300 hover:text-rose-600 p-2 transition-colors transform hover:scale-110 active:scale-90">
                      <Icons.Trash />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: SPECIAL DAYS */}
        {activeTab === 'special' && (
          <div className="space-y-8 animate-in fade-in duration-500">
             <button 
              onClick={() => setIsAddingSpecial(!isAddingSpecial)}
              className="w-full bg-rose-600 text-white p-5 rounded-3xl font-black shadow-lg shadow-rose-100 flex items-center justify-center gap-3 hover:bg-rose-700 transition-all active:scale-95 uppercase tracking-widest text-xs"
            >
              <Icons.Plus /> {isAddingSpecial ? 'Dismiss' : 'Set New Milestone'}
            </button>

            {isAddingSpecial && (
              <form onSubmit={addSpecialDay} className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-xl space-y-6 border-t-8 border-t-rose-500">
                <input value={newSpecial.title} onChange={e => setNewSpecial({...newSpecial, title: e.target.value})} placeholder="Event Title" className="w-full bg-slate-50 rounded-2xl p-4 text-slate-800 font-bold border border-slate-100 text-lg" />
                <input type="date" value={newSpecial.date} onChange={e => setNewSpecial({...newSpecial, date: e.target.value})} className="w-full bg-slate-50 rounded-2xl p-4 text-slate-800 font-bold border border-slate-100" />
                <textarea value={newSpecial.notes} onChange={e => setNewSpecial({...newSpecial, notes: e.target.value})} placeholder="Strategy or Prep Notes..." className="w-full bg-slate-50 rounded-2xl p-4 text-slate-800 font-bold h-28 border border-slate-100 resize-none" />
                <button type="submit" className="w-full bg-slate-900 text-white p-5 rounded-2xl font-black shadow-md uppercase tracking-widest text-xs">Lock in Milestone</button>
              </form>
            )}

            <div className="grid gap-6">
              <h2 className="text-sm font-black text-slate-500 uppercase tracking-widest px-1">Upcoming Milestones</h2>
              {specialDays.sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime()).map(d => {
                const diff = Math.ceil((new Date(d.date).getTime() - new Date().getTime()) / 86400000);
                const isSoon = diff >= 0 && diff < 7;
                return (
                  <div key={d.id} className={`bg-white p-6 rounded-[2rem] border-l-[12px] shadow-sm group transition-all hover:shadow-lg ${isSoon ? 'border-rose-500' : 'border-indigo-500'}`}>
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h3 className="font-black text-slate-900 text-xl mb-1">{d.title}</h3>
                        <div className="flex items-center gap-2 text-slate-500 font-bold text-xs uppercase tracking-widest">
                          <Icons.Calendar />
                          <span>{new Date(d.date).toLocaleDateString()}</span>
                        </div>
                      </div>
                      <div className={`${isSoon ? 'bg-rose-50' : 'bg-indigo-50'} px-5 py-4 rounded-2xl text-center min-w-[100px]`}>
                        <span className={`text-3xl font-black block ${isSoon ? 'text-rose-600' : 'text-indigo-600'}`}>
                          {diff > 0 ? diff : 0}
                        </span>
                        <span className="text-[9px] block font-black uppercase tracking-tighter">Days Remain</span>
                      </div>
                    </div>
                    {d.notes && <p className="text-sm font-bold text-slate-600 mt-6 p-5 bg-slate-50 rounded-2xl italic border-l-4 border-slate-300">{d.notes}</p>}
                    <div className="flex justify-end mt-4 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => deleteSpecialDay(d.id)} className="text-[10px] text-rose-600 font-black uppercase tracking-widest flex items-center gap-1.5">
                        <Icons.Trash /> Remove Milestone
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </main>

      <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[95%] max-w-lg bg-white/95 backdrop-blur-xl shadow-[0_20px_50px_rgba(0,0,0,0.15)] rounded-[2.5rem] p-3 border border-slate-100 flex justify-around items-center z-50">
        <NavItem id="home" icon={Icons.Home} label="Today" />
        <NavItem id="calendar" icon={Icons.Calendar} label="Log" />
        <NavItem id="stats" icon={Icons.Stats} label="Growth" />
        <NavItem id="manage" icon={Icons.Manage} label="Habits" />
        <NavItem id="special" icon={Icons.Special} label="Goals" />
      </nav>
    </div>
  );
};

export default App;
