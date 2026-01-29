
export type FrequencyType = 'daily' | 'weekly' | 'custom';

export interface Habit {
  id: string;
  name: string;
  frequency: FrequencyType;
  targetCount: number;
  color: string;
  createdAt: string;
  isActive: boolean;
  completions: Record<string, boolean>; // key: 'YYYY-MM-DD'
}

export interface SpecialDay {
  id: string;
  date: string; // 'YYYY-MM-DD'
  title: string;
  notes: string;
  type: 'exam' | 'deadline' | 'event';
}

export interface AIInsight {
  reflection: string;
  improvementTip: string;
  motivation: string;
  date: string;
}

export type TabType = 'home' | 'calendar' | 'stats' | 'manage' | 'special';
