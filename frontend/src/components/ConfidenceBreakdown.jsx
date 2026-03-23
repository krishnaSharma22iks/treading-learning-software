import React from 'react';
import { motion } from 'framer-motion';

const ConfidenceBreakdown = ({ breakdown, finalScore }) => {
  if (!breakdown) return null;

  const factors = [
    { label: "Trend Strength", value: breakdown.trend_strength },
    { label: "Volume Strength", value: breakdown.volume_strength },
    { label: "Structure Strength", value: breakdown.structure_strength },
    { label: "Momentum Strength", value: breakdown.momentum_strength },
  ];

  const getColor = (val) => {
    if (val >= 75) return "emerald";
    if (val >= 50) return "yellow";
    return "rose";
  };

  return (
    <div className="bg-white/5 p-6 rounded-[2rem] border border-white/5 space-y-6">
      <div className="flex items-center justify-between border-b border-white/5 pb-4">
         <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Institutional Confidence Breakdown</h3>
         <span className="text-xl font-black text-white italic">{finalScore}%</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {factors.map((f, i) => {
          const color = getColor(f.value);
          return (
            <div key={i} className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">{f.label}</span>
                <span className={`text-[10px] font-black text-${color}-400`}>{f.value}%</span>
              </div>
              <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${f.value}%` }}
                  className={`h-full bg-${color}-500 shadow-[0_0_10px_rgba(0,0,0,0.5)]`}
                  transition={{ duration: 1, delay: i * 0.1 }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ConfidenceBreakdown;
