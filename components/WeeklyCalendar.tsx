
import React from 'react';
import { Habit, SpecialDay } from '../types';
import { Icons } from '../constants';
import { getTodayStr, getWeekDates } from '../utils/dateUtils';

interface WeeklyCalendarProps {
  habits: Habit[];
  specialDays: SpecialDay[];
  focusedDate: string;
  onDateSelect: (date: string) => void;
}

const WeeklyCalendar: React.FC<WeeklyCalendarProps> = ({ habits, specialDays, focusedDate, onDateSelect }) => {
  const weekDates = getWeekDates();
  const today = getTodayStr();
  const dayNames = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  return (
    <div className="bg-white rounded-3xl border border-slate-100 p-4 shadow-sm mb-6 overflow-hidden">
      <div className="grid grid-cols-7 gap-2">
        {weekDates.map((dateStr, idx) => {
          const isToday = dateStr === today;
          const isSelected = dateStr === focusedDate;
          const dayDate = new Date(dateStr);
          const dayNum = dayDate.getDate();
          
          const completions = habits.filter(h => h.completions[dateStr]).length;
          const totalActive = habits.filter(h => h.isActive).length;
          const milestone = specialDays.find(sd => sd.date === dateStr);
          
          const progress = totalActive > 0 ? (completions / totalActive) * 100 : 0;

          return (
            <button
              key={dateStr}
              onClick={() => onDateSelect(dateStr)}
              className={`flex flex-col items-center justify-between py-3 rounded-2xl transition-all border relative ${
                isSelected 
                  ? 'bg-indigo-600 text-white border-indigo-600 shadow-lg shadow-indigo-100' 
                  : milestone
                    ? 'bg-rose-50 border-rose-100 text-rose-700'
                    : isToday 
                      ? 'bg-indigo-50 border-indigo-100 text-indigo-700' 
                      : 'bg-slate-50 border-transparent text-slate-500 hover:bg-slate-100'
              }`}
            >
              <span className="text-[10px] font-black uppercase tracking-tighter opacity-60 mb-1">
                {dayNames[idx]}
              </span>
              <span className="text-sm font-black mb-2">
                {dayNum}
              </span>
              
              <div className="w-full px-2 mt-auto flex justify-center h-1.5">
                {milestone ? (
                   <div className={`${isSelected ? 'text-white' : 'text-rose-500'} scale-75`}>
                     <Icons.Special />
                   </div>
                ) : (
                  <div className={`h-1 w-full rounded-full overflow-hidden ${isSelected ? 'bg-indigo-400' : 'bg-slate-200'}`}>
                    <div 
                      className={`h-full transition-all duration-500 ${isSelected ? 'bg-white' : 'bg-indigo-500'}`} 
                      style={{ width: `${progress}%` }} 
                    />
                  </div>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default WeeklyCalendar;
