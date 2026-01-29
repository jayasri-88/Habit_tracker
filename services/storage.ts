
import { Habit, AIInsight, SpecialDay } from '../types';

const HABITS_KEY = 'zenhabit_data_v2';
const INSIGHTS_KEY = 'zenhabit_insights_v2';
const SPECIAL_DAYS_KEY = 'zenhabit_special_days_v2';

export const storage = {
  saveHabits: (habits: Habit[]) => {
    localStorage.setItem(HABITS_KEY, JSON.stringify(habits));
  },
  getHabits: (): Habit[] => {
    const data = localStorage.getItem(HABITS_KEY);
    return data ? JSON.parse(data) : [];
  },
  saveInsights: (insights: AIInsight[]) => {
    localStorage.setItem(INSIGHTS_KEY, JSON.stringify(insights));
  },
  getInsights: (): AIInsight[] => {
    const data = localStorage.getItem(INSIGHTS_KEY);
    return data ? JSON.parse(data) : [];
  },
  saveSpecialDays: (days: SpecialDay[]) => {
    localStorage.setItem(SPECIAL_DAYS_KEY, JSON.stringify(days));
  },
  getSpecialDays: (): SpecialDay[] => {
    const data = localStorage.getItem(SPECIAL_DAYS_KEY);
    return data ? JSON.parse(data) : [];
  }
};
