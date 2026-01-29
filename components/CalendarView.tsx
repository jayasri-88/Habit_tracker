
import React, { useState } from 'react';
import { Habit, SpecialDay } from '../types';
import { Icons } from '../constants';
import { getTodayStr } from '../utils/dateUtils';

interface CalendarViewProps {
  habits: Habit[];
  specialDays: SpecialDay[];
  onToggle: (habitId: string, date: string) => void;
}

const CalendarView: React.FC<CalendarViewProps> = ({ habits, specialDays, onToggle }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(getTodayStr());

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const prevMonthDays = new Date(year, month, 0).getDate();

  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

  const changeMonth = (offset: number) => {
    setCurrentDate(new Date(year, month + offset, 1));
  };

  const days = [];
  // Previous month padding
  for (let i = firstDayOfMonth - 1; i >= 0; i--) {
    days.push({ day: prevMonthDays - i, currentMonth: false, dateStr: null });
  }
  // Current month
  for (let i = 1; i <= daysInMonth; i++) {
    const dStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
    days.push({ day: i, currentMonth: true, dateStr: dStr });
  }

  const selectedDayHabits = habits.filter(h => h.isActive);
  const selectedSpecialDays = specialDays.filter(sd => sd.date === selectedDate);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-black text-slate-800 tracking-tight">{monthNames[month]} {year}</h2>
          <div className="flex gap-2">
            <button onClick={() => changeMonth(-1)} className="p-2 hover:bg-slate-50 rounded-xl transition-colors text-slate-600"><Icons.ChevronLeft /></button>
            <button onClick={() => setCurrentDate(new Date())} className="px-3 text-[10px] font-black uppercase tracking-widest text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all">Today</button>
            <button onClick={() => changeMonth(1)} className="p-2 hover:bg-slate-50 rounded-xl transition-colors text-slate-600"><Icons.ChevronRight /></button>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-1 mb-2">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(d => (
            <div key={d} className="text-center text-[10px] font-black text-slate-400 uppercase tracking-widest py-2">{d}</div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1">
          {days.map((d, idx) => {
            const isToday = d.dateStr === getTodayStr();
            const isSelected = d.dateStr === selectedDate;
            const completedOnDay = d.dateStr ? habits.filter(h => h.completions[d.dateStr!]).length : 0;
            const hasEvent = d.dateStr && specialDays.some(sd => sd.date === d.dateStr);

            return (
              <button
                key={idx}
                disabled={!d.currentMonth}
                onClick={() => d.dateStr && setSelectedDate(d.dateStr)}
                className={`aspect-square relative flex flex-col items-center justify-center rounded-2xl transition-all border ${
                  !d.currentMonth ? 'opacity-20 cursor-default border-transparent' : 
                  isSelected ? 'bg-indigo-600 text-white border-indigo-600 shadow-lg shadow-indigo-100' :
                  isToday ? 'bg-white border-indigo-200 text-indigo-600' : 'bg-white border-slate-100 text-slate-700 hover:border-indigo-200'
                }`}
              >
                <span className="text-sm font-black">{d.day}</span>
                <div className="mt-1 flex gap-0.5 flex-wrap justify-center px-1">
                  {d.dateStr && habits.filter(h => h.completions[d.dateStr!]).slice(0, 3).map(h => (
                    <div key={h.id} className={`w-1 h-1 rounded-full ${isSelected ? 'bg-white' : ''}`} style={{ backgroundColor: isSelected ? 'white' : h.color }} />
                  ))}
                  {completedOnDay > 3 && <div className={`w-1 h-1 rounded-full ${isSelected ? 'bg-white' : 'bg-slate-300'}`} />}
                </div>
                {hasEvent && (
                  <div className={`absolute top-1 right-1 w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-white' : 'bg-rose-500'}`} />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {selectedDate && (
        <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm animate-in slide-in-from-bottom-4">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-black text-slate-800 text-lg uppercase tracking-tight">Status for {selectedDate}</h3>
            {selectedSpecialDays.length > 0 && (
              <span className="bg-rose-50 text-rose-600 text-[10px] font-black px-3 py-1.5 rounded-full uppercase tracking-widest border border-rose-100">
                Milestone Day
              </span>
            )}
          </div>

          <div className="space-y-4">
            {selectedSpecialDays.map(sd => (
              <div key={sd.id} className="bg-rose-50 border border-rose-100 p-4 rounded-2xl">
                <p className="font-black text-rose-700 text-sm">{sd.title}</p>
                <p className="text-xs text-rose-600 font-bold mt-1 opacity-80">{sd.notes}</p>
              </div>
            ))}

            {selectedDayHabits.length > 0 ? (
              selectedDayHabits.map(h => (
                <div key={h.id} className="flex items-center justify-between p-3 rounded-2xl border border-slate-50 hover:bg-slate-50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-1.5 h-6 rounded-full" style={{ backgroundColor: h.color }}></div>
                    <span className="font-bold text-slate-800">{h.name}</span>
                  </div>
                  <button
                    onClick={() => onToggle(h.id, selectedDate)}
                    className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                      h.completions[selectedDate] 
                        ? 'bg-emerald-500 text-white shadow-md' 
                        : 'bg-slate-100 text-slate-400 hover:bg-emerald-50 hover:text-emerald-500'
                    }`}
                  >
                    {h.completions[selectedDate] ? 'Completed' : 'Mark Done'}
                  </button>
                </div>
              ))
            ) : (
              <p className="text-center text-slate-400 font-bold text-sm italic py-4">No active habits for this date range.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default CalendarView;
