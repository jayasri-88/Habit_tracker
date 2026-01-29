
import { SpecialDay } from '../types';

/**
 * Returns YYYY-MM-DD in local time.
 * Using toISOString() often causes date shifts due to UTC conversion.
 */
export const getTodayStr = () => {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const getDatesForYear = (year: number) => {
  const dates: string[] = [];
  const start = new Date(year, 0, 1);
  const end = new Date(year, 11, 31);
  
  let current = new Date(start);
  while (current <= end) {
    const y = current.getFullYear();
    const m = String(current.getMonth() + 1).padStart(2, '0');
    const d = String(current.getDate()).padStart(2, '0');
    dates.push(`${y}-${m}-${d}`);
    current.setDate(current.getDate() + 1);
  }
  return dates;
};

export const getWeekDates = () => {
  const now = new Date();
  const dayOfWeek = now.getDay(); // 0 is Sunday, 1 is Monday...
  
  // Calculate how many days to subtract to get to Monday
  // If Sunday (0), subtract 6. If Mon(1) subtract 0, Tue(2) subtract 1...
  const diff = now.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1);
  
  const monday = new Date(now.getFullYear(), now.getMonth(), diff);
  
  const week = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const dayStr = String(d.getDate()).padStart(2, '0');
    week.push(`${year}-${month}-${dayStr}`);
  }
  return week;
};

/**
 * Enhanced Streak Logic:
 * Now pauses (skips) milestones instead of breaking the chain.
 */
export const getStreak = (completions: Record<string, boolean>, specialDays: SpecialDay[]) => {
  const milestoneDates = new Set(specialDays.map(d => d.date));
  let streak = 0;
  
  // Start checking from local "today"
  let currentCheck = new Date();
  const todayStr = getTodayStr();
  
  // If today isn't done and isn't a milestone, check from yesterday for the current streak
  const currentCheckStr = () => {
    const y = currentCheck.getFullYear();
    const m = String(currentCheck.getMonth() + 1).padStart(2, '0');
    const d = String(currentCheck.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  };

  if (!completions[todayStr] && !milestoneDates.has(todayStr)) {
    currentCheck.setDate(currentCheck.getDate() - 1);
  }

  // Iterate backwards up to a year
  for (let i = 0; i < 366; i++) {
    const dateStr = currentCheckStr();
    
    if (completions[dateStr]) {
      streak++;
    } else if (milestoneDates.has(dateStr)) {
      // It's a milestone: skip (pause streak)
    } else {
      // Break streak on a missed normal day
      break;
    }
    currentCheck.setDate(currentCheck.getDate() - 1);
  }
  
  return streak;
};

export const getMonths = () => [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
];
