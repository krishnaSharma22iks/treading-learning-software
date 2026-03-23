import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShieldAlert, 
  ShieldCheck, 
  TrendingUp, 
  AlertTriangle,
  Info
} from 'lucide-react';

const RiskManager = ({ assessment }) => {
  if (!assessment) return null;

  const { riskLevel, warning, rr, pctRisk, isValid } = assessment;

  const getStatusColor = () => {
    switch (riskLevel) {
      case 'CRITICAL': return 'bg-rose-500/20 text-rose-400 border-rose-500/30';
      case 'HIGH': return 'bg-rose-500/20 text-rose-400 border-rose-500/30';
      case 'MEDIUM': return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
      case 'LOW': return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
      default: return 'bg-slate-500/10 text-slate-400 border-white/5';
    }
  };

  const getIcon = () => {
    if (riskLevel === 'CRITICAL' || riskLevel === 'HIGH') return ShieldAlert;
    if (riskLevel === 'MEDIUM') return AlertTriangle;
    return ShieldCheck;
  };

  const Icon = getIcon();

  return (
    <div className="space-y-4">
      <div className={`p-4 rounded-2xl border backdrop-blur-3xl transition-all duration-500 ${getStatusColor()}`}>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-white/5 rounded-lg">
              <Icon className="w-4 h-4" />
            </div>
            <span className="text-[10px] font-black uppercase tracking-widest">Risk Assessment</span>
          </div>
          <div className="px-2.5 py-1 bg-white/10 rounded-full text-[9px] font-black uppercase tracking-widest flex items-center gap-1.5">
            <div className={`w-1.5 h-1.5 rounded-full animate-pulse 
              ${riskLevel === 'LOW' ? 'bg-emerald-400' : riskLevel === 'MEDIUM' ? 'bg-amber-400' : 'bg-rose-400'}`} />
            {riskLevel}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-3">
          <div className="bg-black/20 p-3 rounded-xl border border-white/5">
            <div className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-1">Risk per Trade</div>
            <div className="text-sm font-bold text-white">{pctRisk || 'N/A'}%</div>
          </div>
          <div className="bg-black/20 p-3 rounded-xl border border-white/5">
            <div className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-1">RR Ratio</div>
            <div className="text-sm font-bold text-white">1:{rr || 'N/A'}</div>
          </div>
        </div>

        <AnimatePresence>
          {warning && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              className="bg-white/5 p-3 rounded-xl border border-white/5 flex gap-3 items-start overflow-hidden mt-3"
            >
              <Info className="w-3.5 h-3.5 mt-0.5 shrink-0" />
              <p className="text-[10px] leading-relaxed font-bold italic">{warning}</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {!isValid && (
        <div className="bg-rose-500 shadow-lg shadow-rose-500/20 text-white p-4 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 animate-pulse">
          <ShieldAlert className="w-4 h-4" />
          Protocol Violation: Execution Blocked
        </div>
      )}
    </div>
  );
};

export default RiskManager;
