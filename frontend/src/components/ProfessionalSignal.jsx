import React from 'react';
import { motion } from 'framer-motion';
import { 
  TrendingUp, 
  TrendingDown, 
  Target, 
  ShieldAlert, 
  ShieldCheck, 
  Zap, 
  Layers,
  Map,
  ArrowRight,
  ChevronDown
} from 'lucide-react';
import ExecutionSteps from './ExecutionSteps';
import ValidationManager from './ValidationManager';
import ConfidenceBreakdown from './ConfidenceBreakdown';

const ProfessionalSignal = ({ 
  data, 
  tradingType, 
  support, 
  resistance,
  activeStrategy,
  indicatorData,
  mtfData
}) => {
  if (!data || data.direction === "NO TRADE") {
    // ... (rest of no trade UI remains same)
    return (
      <div className="p-8 bg-slate-900/40 backdrop-blur-3xl rounded-[2.5rem] border border-white/5 flex flex-col gap-6 group hover:border-yellow-500/10 transition-all duration-700">
         <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
               <div className="p-3 bg-yellow-500/10 rounded-2xl border border-yellow-500/20">
                  <Zap className="w-5 h-5 text-yellow-500 animate-pulse" />
               </div>
               <div>
                  <h3 className="text-sm font-black text-white uppercase tracking-widest">Market Status: STANDBY</h3>
                  <p className="text-[9px] font-bold text-slate-500 uppercase tracking-[0.2em] mt-0.5">Awaiting Institutional Setup</p>
               </div>
            </div>
            <div className="px-3 py-1 bg-white/5 rounded-full text-[8px] font-black uppercase text-slate-500">
               Filtered v2.0
            </div>
         </div>

         <div className="space-y-3 bg-black/20 p-5 rounded-3xl border border-white/5">
            <h4 className="text-[9px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
               <ShieldAlert className="w-3 h-3" /> Rejection Factors
            </h4>
            <div className="space-y-2">
               <p className="text-xs text-slate-400 leading-relaxed font-medium italic">
                 "{data?.explanation || "Market conditions currently do not meet the risk-to-reward or structural requirements for a professional entry."}"
               </p>
            </div>
         </div>

         <div className="grid grid-cols-2 gap-3 opacity-50 grayscale pointer-events-none">
            <div className="h-10 bg-white/5 rounded-xl border border-white/5" />
            <div className="h-10 bg-white/5 rounded-xl border border-white/5" />
         </div>
      </div>
    );
  }

  const isBuy = data.direction === "BUY";
  const mainColor = isBuy ? "emerald" : "rose";

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="relative overflow-hidden bg-black/40 backdrop-blur-3xl rounded-[2.5rem] border border-white/5 shadow-2xl group"
    >
      {/* 🔮 Background Glow */}
      <div className={`absolute -top-24 -right-24 w-64 h-64 bg-${mainColor}-500/10 rounded-full blur-[100px] pointer-events-none group-hover:bg-${mainColor}-500/20 transition-all duration-700`} />

      {/* 🏷️ Header: Trading Type & Direction */}
      <div className="p-6 border-b border-white/5 flex items-center justify-between">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full bg-${mainColor}-500 animate-pulse`} />
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">
              {tradingType || "ADVANCED"} PROTOCOL
            </span>
          </div>
          <h2 className={`text-4xl font-black italic tracking-tighter text-${mainColor}-400`}>
            {data.direction}
          </h2>
        </div>
        <div className="text-right">
          <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Confidence</div>
          <div className="text-2xl font-black text-white">{data.confidence_score}%</div>
        </div>
      </div>

      {/* 🎯 Quality Meter & Indicators Bar */}
      <div className="px-4 sm:px-8 pt-6 space-y-4">
         <div className="flex flex-col sm:flex-row items-center justify-between bg-white/5 p-4 rounded-3xl border border-white/5 gap-4">
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest text-center sm:text-left">Trade Quality Meter</span>
            <div className="flex items-center gap-3 w-full sm:w-auto justify-center">
               <div className="h-2 flex-1 sm:w-32 bg-white/5 rounded-full overflow-hidden">
                  <motion.div 
                     initial={{ width: 0 }}
                     animate={{ width: `${data.confidence_score}%` }}
                     className={`h-full bg-${mainColor}-500`}
                  />
               </div>
               <span className={`text-xs font-black text-${mainColor}-400 shrink-0`}>{data.confidence_score > 80 ? 'EXPERT' : 'METER'}</span>
            </div>
         </div>
         
         <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="text-center p-3 bg-white/5 rounded-2xl border border-white/5">
               <span className="text-[8px] font-black text-slate-500 uppercase block mb-0.5">RSI</span>
               <span className="text-xs font-black text-white">{indicatorData?.rsi || 'N/A'}</span>
            </div>
            <div className="text-center p-3 bg-white/5 rounded-2xl border border-white/5">
               <span className="text-[8px] font-black text-slate-500 uppercase block mb-0.5">EMA Trend</span>
               <span className={`text-[9px] font-black ${indicatorData?.trend === 'UP' ? 'text-emerald-400' : 'text-rose-400'}`}>{indicatorData?.trend || 'N/A'}</span>
            </div>
            <div className="text-center p-3 bg-white/5 rounded-2xl border border-white/5">
               <span className="text-[8px] font-black text-slate-500 uppercase block mb-0.5">Vol-Node</span>
               <span className="text-[9px] font-black text-white">{indicatorData?.volume?.currentVolume?.toLocaleString() || '--'}</span>
            </div>
         </div>
      </div>

      {/* 🎯 Main Levels Grid */}
      <div className="p-4 sm:p-8 grid grid-cols-1 sm:grid-cols-3 gap-6">
         <div className="space-y-2 bg-white/5 sm:bg-transparent p-4 sm:p-0 rounded-2xl border border-white/5 sm:border-none">
          <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
            <Target className="w-3 h-3" /> Entry
          </span>
          <div className="text-2xl font-black text-white">
            {data.entry || "CMP"}
          </div>
        </div>
        <div className="space-y-2 bg-white/5 sm:bg-transparent p-4 sm:p-0 rounded-2xl border border-rose-500/10 sm:border-none">
          <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2 text-rose-500">
            <ShieldAlert className="w-3 h-3" /> Stop
          </span>
          <div className="text-2xl font-black text-rose-400">
            {data.sl || "N/A"}
          </div>
        </div>
        <div className="space-y-2 bg-white/5 sm:bg-transparent p-4 sm:p-0 rounded-2xl border border-emerald-500/10 sm:border-none">
          <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2 text-emerald-500">
            <ShieldCheck className="w-3 h-3" /> Target
          </span>
          <div className="text-2xl font-black text-emerald-400">
            {data.tp || "N/A"}
          </div>
        </div>
      </div>

      {/* 📊 Confidence Breakdown [ NEW ] */}
      <div className="px-8 pb-4">
        <ConfidenceBreakdown 
          breakdown={data.confidence_breakdown} 
          finalScore={data.confidence_score} 
        />
      </div>

      <div className="px-4 sm:px-8 pb-8 space-y-6">
        {/* 🌐 MTF Alignment Matrix */}
        {mtfData && (
           <div className="pt-4 border-t border-white/5">
              <ValidationManager mtf={mtfData} />
           </div>
        )}
        {/* 📊 Metrics Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-white/5 p-4 rounded-3xl border border-white/5 flex items-center justify-between">
            <span className="text-[10px] font-black text-slate-500 uppercase">Risk Level</span>
            <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-widest 
              ${data.risk_level === 'LOW' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>
              {data.risk_level}
            </span>
          </div>
          <div className="bg-white/5 p-4 rounded-3xl border border-white/5 flex items-center justify-between">
            <span className="text-[10px] font-black text-slate-500 uppercase">RR Ratio</span>
            <span className="text-[10px] font-black text-white">1:{data.rr || '1.5'}</span>
          </div>
        </div>

        {/* 🧠 Institutional Strategy Logic */}
        <div className="bg-white/5 p-6 rounded-3xl border border-white/5 space-y-3">
          <div className="flex items-center gap-2">
             <Layers className="w-4 h-4 text-blue-400" />
             <span className="text-[10px] font-black uppercase text-white tracking-widest">Logic: {activeStrategy || "SMC PRO"}</span>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed font-medium italic">
            "{data.explanation}"
          </p>
          <div className="flex gap-4 pt-2 border-t border-white/5 mt-2">
             <div className="flex flex-col">
                <span className="text-[8px] font-black text-slate-500 uppercase">Support</span>
                <span className="text-[10px] font-bold text-slate-300">{support}</span>
             </div>
             <div className="flex flex-col">
                <span className="text-[8px] font-black text-slate-500 uppercase">Resistance</span>
                <span className="text-[10px] font-bold text-slate-300">{resistance}</span>
             </div>
          </div>
        </div>

        {/* 🛣️ Execution Script */}
        <div className="pt-4 border-t border-white/5">
           <div className="flex items-center gap-2 mb-4">
              <Map className="w-4 h-4 text-orange-400" />
              <span className="text-[10px] font-black uppercase text-white tracking-widest">Execution Roadmap</span>
           </div>
           {data.execution_steps && (
              <ExecutionSteps steps={data.execution_steps} direction={data.direction} />
           )}
        </div>
      </div>
    </motion.div>
  );
};

export default ProfessionalSignal;
