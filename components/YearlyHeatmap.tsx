
import React from 'react';
import { Habit } from '../types';
import { getDatesForYear, getMonths } from '../utils/dateUtils';

interface YearlyHeatmapProps {
  habits: Habit[];
}

const YearlyHeatmap: React.FC<YearlyHeatmapProps> = ({ habits }) => {
  const currentYear = new Date().getFullYear();
  const allDates = getDatesForYear(currentYear);
  const months = getMonths();

  // Aggregate completion density
  const getIntensity = (date: string) => {
    if (habits.length === 0) return 0;
    const completedCount = habits.filter(h => h.completions[date]).length;
    return completedCount / habits.length;
  };

  const getColor = (intensity: number) => {
    if (intensity === 0) return '#f1f5f9';
    if (intensity < 0.25) return '#dcfce7';
    if (intensity < 0.5) return '#86efac';
    if (intensity < 0.75) return '#22c55e';
    return '#15803d';
  };

  // Group dates into weeks for the grid
  const weeks: string[][] = [];
  let currentWeek: string[] = [];
  
  // Align grid to start on the correct day of week for Jan 1
  const firstDay = new Date(currentYear, 0, 1).getDay();
  for (let i = 0; i < firstDay; i++) {
    currentWeek.push('');
  }

  allDates.forEach(date => {
    currentWeek.push(date);
    if (currentWeek.length === 7) {
      weeks.push(currentWeek);
      currentWeek = [];
    }
  });
  if (currentWeek.length > 0) weeks.push(currentWeek);

  return (
    <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 overflow-x-auto">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-sm font-black text-slate-500 uppercase tracking-widest px-1">Yearly Overview {currentYear}</h3>
        <div className="flex items-center gap-2 text-[10px] font-black text-slate-500 uppercase tracking-widest">
          <span>Less</span>
          <div className="flex gap-1">
            {[0, 0.25, 0.5, 0.75, 1].map(lvl => (
              <div key={lvl} className="w-3.5 h-3.5 rounded-sm shadow-sm" style={{ backgroundColor: getColor(lvl) }} />
            ))}
          </div>
          <span>More</span>
        </div>
      </div>
      
      <div className="min-w-[750px] pb-2">
        <div className="flex gap-1 text-[10px] font-black text-slate-400 mb-3 uppercase tracking-tighter">
          {months.map(m => (
            <div key={m} className="flex-1 text-center">{m}</div>
          ))}
        </div>
        
        <div className="grid grid-flow-col gap-1.5 auto-cols-max">
          {weeks.map((week, wIdx) => (
            <div key={wIdx} className="grid grid-rows-7 gap-1.5">
              {week.map((date, dIdx) => (
                <div
                  key={dIdx}
                  className={`w-3.5 h-3.5 rounded-sm transition-all duration-300 ${!date ? 'opacity-0' : 'hover:scale-125 hover:shadow-md cursor-help'}`}
                  style={{ backgroundColor: date ? getColor(getIntensity(date)) : 'transparent' }}
                  title={date ? `${date}: ${Math.round(getIntensity(date) * 100)}% active` : ''}
                />
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default YearlyHeatmap;
