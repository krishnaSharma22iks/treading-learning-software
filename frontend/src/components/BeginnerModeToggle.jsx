import React from 'react';
import { Sparkles, Activity } from 'lucide-react';
import { motion } from 'framer-motion';

const BeginnerModeToggle = ({ isBeginner, onToggle }) => {
  return (
    <div className="flex items-center bg-slate-800/50 p-1.5 rounded-2xl border border-white/5 backdrop-blur-xl">
      <button
        onClick={() => onToggle(false)}
        className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all duration-300 font-bold text-[10px] uppercase tracking-widest ${
          !isBeginner 
            ? 'bg-slate-700 text-white shadow-lg shadow-white/5' 
            : 'text-slate-500 hover:text-slate-300'
        }`}
      >
        <Activity className="w-3.5 h-3.5" />
        Professional
      </button>
      <button
        onClick={() => onToggle(true)}
        className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all duration-300 font-bold text-[10px] uppercase tracking-widest ${
          isBeginner 
            ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/20' 
            : 'text-slate-500 hover:text-slate-400'
        }`}
      >
        <Sparkles className="w-3.5 h-3.5" />
        Beginner
      </button>
    </div>
  );
};

export default BeginnerModeToggle;
