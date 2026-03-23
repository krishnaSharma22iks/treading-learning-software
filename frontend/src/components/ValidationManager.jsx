import React from 'react';
import { motion } from 'framer-motion';
import { 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  Clock,
  Layers
} from 'lucide-react';

const TimeframeBadge = ({ label, trend }) => {
  const getTrendColor = () => {
    if (trend === 'UP') return 'text-emerald-400';
    if (trend === 'DOWN') return 'text-rose-400';
    return 'text-slate-500';
  };

  const getBgColor = () => {
    if (trend === 'UP') return 'bg-emerald-500/10 border-emerald-500/20';
    if (trend === 'DOWN') return 'bg-rose-500/10 border-rose-500/20';
    return 'bg-white/5 border-white/10';
  };

  return (
    <div className={`flex-1 p-3 rounded-xl border flex flex-col gap-1 items-center justify-center ${getBgColor()}`}>
      <span className="text-[8px] font-black uppercase text-slate-500 tracking-tighter">{label}</span>
      <span className={`text-xs font-black italic tracking-widest ${getTrendColor()}`}>{trend}</span>
    </div>
  );
};

const ValidationManager = ({ mtf }) => {
  if (!mtf) return null;

  const { status, breakdown } = mtf;

  const getStatusConfig = () => {
    switch (status) {
      case 'ALIGNED':
        return { 
          label: '✔ ALL TIMEFRAMES ALIGNED (STRONG)', 
          color: 'text-emerald-400', 
          bg: 'bg-emerald-500/10 border-emerald-500/20', 
          icon: CheckCircle2 
        };
      case 'PARTIAL':
        return { 
          label: '⚠ PARTIAL ALIGNMENT (MEDIUM)', 
          color: 'text-amber-400', 
          bg: 'bg-amber-500/10 border-amber-500/20', 
          icon: AlertTriangle 
        };
      case 'CONFLICT':
        return { 
          label: '❌ CRITICAL CONFLICT (NO TRADE)', 
          color: 'text-rose-400', 
          bg: 'bg-rose-500/10 border-rose-500/20', 
          icon: XCircle 
        };
      default:
        return { 
          label: 'NEUTRAL ALIGNMENT', 
          color: 'text-slate-400', 
          bg: 'bg-white/5 border-white/10', 
          icon: Clock 
        };
    }
  };

  const config = getStatusConfig();

  return (
    <div className="space-y-4">
      {/* 🛣️ Horizontal Timeframe Row */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        <TimeframeBadge label="5m Entry" trend={breakdown?.['5m'] || 'SIDEWAYS'} />
        <TimeframeBadge label="15m Trend" trend={breakdown?.['15m'] || 'SIDEWAYS'} />
        <TimeframeBadge label="1H Structure" trend={breakdown?.['1H'] || 'SIDEWAYS'} />
      </div>

      {/* 🛡️ Final Alignment Status */}
      <div className={`p-4 rounded-2xl border flex items-center justify-center gap-3 transition-all duration-500 ${config.bg}`}>
        <span className={`text-[11px] font-black uppercase tracking-widest ${config.color} text-center`}>
          {config.label}
        </span>
      </div>
    </div>
  );
};

export default ValidationManager;
