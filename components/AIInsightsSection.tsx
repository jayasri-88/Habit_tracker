
import React from 'react';
import { AIInsight } from '../types';
import { Icons } from '../constants';

interface AIInsightsSectionProps {
  insight: AIInsight | null;
  loading: boolean;
  onRefresh: () => void;
}

const AIInsightsSection: React.FC<AIInsightsSectionProps> = ({ insight, loading, onRefresh }) => {
  return (
    <div className="bg-gradient-to-br from-indigo-50 to-blue-50 p-6 rounded-3xl border border-indigo-100 relative overflow-hidden shadow-sm">
      <div className="absolute top-0 right-0 p-4 opacity-10">
        <Icons.Sparkles />
      </div>

      <div className="flex items-center gap-2 mb-4">
        <span className="p-2 bg-indigo-600 text-white rounded-xl shadow-md">
          <Icons.Sparkles />
        </span>
        <h3 className="font-black text-indigo-900 uppercase tracking-widest text-xs">AI Habit Coach</h3>
      </div>

      {loading ? (
        <div className="animate-pulse space-y-3">
          <div className="h-4 bg-indigo-200 rounded w-3/4"></div>
          <div className="h-4 bg-indigo-200 rounded w-1/2"></div>
        </div>
      ) : insight ? (
        <div className="space-y-4">
          <div>
            <p className="text-base text-slate-800 leading-relaxed font-bold">
              "{insight.reflection}"
            </p>
          </div>
          <div className="bg-white/80 rounded-2xl p-4 border border-indigo-100">
            <span className="text-[10px] font-black text-indigo-500 uppercase tracking-widest block mb-1">Weekly Improvement Tip</span>
            <p className="text-sm text-slate-700 font-bold leading-snug">{insight.improvementTip}</p>
          </div>
          <div className="flex justify-between items-center pt-2">
            <p className="text-xs font-black text-white bg-indigo-600 px-4 py-2 rounded-full shadow-lg shadow-indigo-100">
              {insight.motivation}
            </p>
            <button 
              onClick={onRefresh}
              className="text-xs text-indigo-600 hover:text-indigo-800 font-black uppercase tracking-widest transition-colors flex items-center gap-1"
            >
              Refresh Coach
            </button>
          </div>
        </div>
      ) : (
        <div className="py-4">
          <p className="text-sm text-indigo-900 mb-4 font-bold italic">"Analyze your patterns for a smarter routine."</p>
          <button 
            onClick={onRefresh}
            className="px-6 py-3 bg-indigo-600 text-white rounded-2xl text-xs font-black shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all active:scale-95 uppercase tracking-widest"
          >
            Generate Insight
          </button>
        </div>
      )}
    </div>
  );
};

export default AIInsightsSection;
