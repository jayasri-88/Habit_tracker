
import React from 'react';
import { Habit, SpecialDay } from '../types';
import { Icons } from '../constants';
import { getStreak, getTodayStr } from '../utils/dateUtils';

interface HabitCardProps {
  habit: Habit;
  specialDays: SpecialDay[];
  onToggle: (id: string, date: string) => void;
  onDelete: (id: string) => void;
}

const HabitCard: React.FC<HabitCardProps> = ({ habit, specialDays, onToggle, onDelete }) => {
  const today = getTodayStr();
  const isDoneToday = habit.completions[today] || false;
  // Fixed: Added specialDays as the second argument to getStreak to satisfy the function signature in dateUtils.ts
  const streak = getStreak(habit.completions, specialDays);
  
  return (
    <div className={`bg-white rounded-2xl p-5 shadow-sm border border-slate-100 transition-all ${!habit.isActive ? 'opacity-50 grayscale' : ''}`}>
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="w-1.5 h-10 rounded-full" style={{ backgroundColor: habit.color }}></div>
          <div>
            <h3 className={`font-black text-lg ${isDoneToday ? 'text-emerald-700' : 'text-slate-800'}`}>
              {habit.name}
            </h3>
            <div className="flex items-center gap-1 text-[10px] text-slate-500 uppercase tracking-widest font-black">
              <Icons.Fire />
              <span className="text-indigo-600">{streak}</span>
              <span>Day Streak</span>
            </div>
          </div>
        </div>
        <button
          onClick={() => onToggle(habit.id, today)}
          className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all ${
            isDoneToday 
              ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-100 scale-105' 
              : 'bg-slate-50 text-slate-300 border-2 border-dashed border-slate-200 hover:border-emerald-300'
          }`}
        >
          <Icons.Check />
        </button>
      </div>
    </div>
  );
};

export default HabitCard;
