import React from 'react';
import { motion } from 'framer-motion';
import { 
  Target, 
  ShieldAlert, 
  TrendingUp, 
  ArrowRightCircle, 
  AlertCircle 
} from 'lucide-react';

const ExecutionStep = ({ index, text, icon: Icon, isLast }) => (
  <motion.div 
    initial={{ opacity: 0, x: -10 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ delay: index * 0.1 }}
    className="flex gap-4 group relative"
  >
    {!isLast && (
      <div className="absolute left-[11px] top-7 bottom-0 w-[2px] bg-white/5 group-hover:bg-blue-500/30 transition-colors" />
    )}
    <div className={`z-10 w-6 h-6 rounded-full flex items-center justify-center shrink-0 
      ${index === 0 ? 'bg-blue-500/20 text-blue-400' : 'bg-white/5 text-slate-500'}`}>
      <Icon className="w-3.5 h-3.5" />
    </div>
    <div className="pb-6">
      <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">
        Step {index + 1}
      </div>
      <div className="text-xs font-medium text-slate-300 leading-relaxed">
        {text}
      </div>
    </div>
  </motion.div>
);

const ExecutionSteps = ({ steps, direction }) => {
  if (!steps || steps.length === 0) return null;

  const icons = [TrendingUp, ArrowRightCircle, ShieldAlert, Target, AlertCircle];

  return (
    <div className="p-5 bg-white/5 rounded-3xl border border-white/5 backdrop-blur-xl mt-4">
      <div className="flex items-center justify-between mb-6">
        <h4 className="text-[10px] font-black text-white uppercase tracking-[0.2em] flex items-center gap-2">
          <Target className="w-3.5 h-3.5 text-blue-400" />
          Execution Roadmap
        </h4>
        <div className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest
          ${direction === 'BUY' ? 'bg-emerald-500/10 text-emerald-400' : 
            direction === 'SELL' ? 'bg-rose-500/10 text-rose-400' : 'bg-slate-500/10 text-slate-400'}`}>
          {direction || 'NEUTRAL'}
        </div>
      </div>

      <div className="flex flex-col">
        {steps.map((step, idx) => (
          <ExecutionStep 
            key={idx} 
            index={idx} 
            text={step} 
            icon={icons[idx % icons.length]} 
            isLast={idx === steps.length - 1}
          />
        ))}
      </div>
    </div>
  );
};

export default ExecutionSteps;
