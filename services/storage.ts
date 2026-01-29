import { Habit, AIInsight, SpecialDay } from '../types';

/**
 * Storage key builder
 * Each user + each year gets isolated storage
 */
const getKey = (email: string, year: number, type: string) =>
  `zenhabit_${type}_${email}_${year}`;

export const storage = {
  /* ---------------- HABITS ---------------- */

  saveHabits: (email: string, year: number, habits: Habit[]) => {
    localStorage.setItem(
      getKey(email, year, 'habits'),
      JSON.stringify(habits)
    );
  },

  getHabits: (email: string, year: number): Habit[] => {
    const data = localStorage.getItem(
      getKey(email, year, 'habits')
    );
    return data ? JSON.parse(data) : [];
  },

  /* ---------------- AI INSIGHTS ---------------- */

  saveInsights: (email: string, year: number, insights: AIInsight[]) => {
    localStorage.setItem(
      getKey(email, year, 'insights'),
      JSON.stringify(insights)
    );
  },

  getInsights: (email: string, year: number): AIInsight[] => {
    const data = localStorage.getItem(
      getKey(email, year, 'insights')
    );
    return data ? JSON.parse(data) : [];
  },

  /* ---------------- SPECIAL DAYS ---------------- */

  saveSpecialDays: (email: string, year: number, days: SpecialDay[]) => {
    localStorage.setItem(
      getKey(email, year, 'special_days'),
      JSON.stringify(days)
    );
  },

  getSpecialDays: (email: string, year: number): SpecialDay[] => {
    const data = localStorage.getItem(
      getKey(email, year, 'special_days')
    );
    return data ? JSON.parse(data) : [];
  },

  /* ---------------- BACKUP / EXPORT ---------------- */

  exportYearData: (email: string, year: number) => {
    const payload = {
      habits: storage.getHabits(email, year),
      insights: storage.getInsights(email, year),
      specialDays: storage.getSpecialDays(email, year),
      email,
      year,
      exportedAt: new Date().toISOString()
    };

    const blob = new Blob(
      [JSON.stringify(payload, null, 2)],
      { type: 'application/json' }
    );

    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `zenhabit_backup_${year}.json`;
    link.click();
  }
};
