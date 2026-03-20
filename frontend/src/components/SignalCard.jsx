import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, Clock, ShieldCheck, Target, Zap, AlertTriangle, ArrowRight, Activity } from "lucide-react";

const SignalCard = ({ signal, entry, sl, tp, support, resistance, rsi, ai, trend, volumeSpike, expert, verdict }) => {
  const getStatusColor = (s) => {
    switch (s?.toUpperCase()) {
      case "BUY": return "from-emerald-500/20 to-emerald-500/5 text-emerald-400 border-emerald-500/30";
      case "SELL": return "from-rose-500/20 to-rose-500/5 text-rose-400 border-rose-500/30";
      case "WAIT": return "from-amber-500/20 to-amber-500/5 text-amber-400 border-amber-500/30";
      default: return "from-slate-500/20 to-slate-500/5 text-slate-400 border-slate-500/30";
    }
  };

  const getGlowColor = (s) => {
    switch (s?.toUpperCase()) {
      case "BUY": return "shadow-emerald-500/20";
      case "SELL": return "shadow-rose-500/20";
      case "WAIT": return "shadow-amber-500/20";
      default: return "shadow-slate-500/20";
    }
  };

  const safeRsi = typeof rsi === 'number' ? rsi : 50;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`relative w-full bg-gradient-to-br ${getStatusColor(signal)} backdrop-blur-3xl border rounded-[2rem] p-8 shadow-2xl ${getGlowColor(signal)} overflow-hidden group`}
    >
      {/* Decorative pulse element */}
      <div className="absolute -top-12 -right-12 w-48 h-48 bg-current opacity-[0.03] rounded-full blur-3xl group-hover:scale-150 transition-transform duration-1000"></div>

      <div className="relative z-10 flex flex-col gap-10">
        
        {/* PRIMARY FOCUS: DECISION */}
        <div className="text-center space-y-2">
           <div className="flex items-center justify-center gap-3 mb-2">
              <Zap className="w-4 h-4 opacity-50" />
              <span className="text-[10px] font-black uppercase tracking-[0.3em] opacity-60">Elite Decision Engine</span>
              <Zap className="w-4 h-4 opacity-50" />
           </div>
           <h2 className="text-7xl font-black italic tracking-tighter uppercase leading-none">
             {signal || "WAIT"}
           </h2>
           <p className="text-sm font-bold opacity-80 max-w-md mx-auto line-clamp-2">
             {verdict?.summary || ai || "Analyzing market structure for institutional entry confirmation."}
           </p>
        </div>

        {/* SECONDARY: EXECUTION GRID */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
           <div className="bg-black/20 backdrop-blur-md p-5 rounded-2xl border border-white/5 flex flex-col items-center justify-center gap-1 group/item hover:bg-black/30 transition-colors">
              <div className="flex items-center gap-2 mb-1">
                 <ArrowRight className="w-3.5 h-3.5 text-blue-400" />
                 <span className="text-[10px] font-black uppercase text-slate-500">Entry Zone</span>
              </div>
              <span className="text-xl font-black text-white">{entry ? entry.toFixed(2) : "---"}</span>
           </div>

           <div className="bg-black/20 backdrop-blur-md p-5 rounded-2xl border border-white/5 flex flex-col items-center justify-center gap-1 group/item hover:bg-black/30 transition-colors">
              <div className="flex items-center gap-2 mb-1">
                 <ShieldCheck className="w-3.5 h-3.5 text-rose-400" />
                 <span className="text-[10px] font-black uppercase text-slate-500">Stop Loss</span>
              </div>
              <span className="text-xl font-black text-white">{sl ? sl.toFixed(2) : "---"}</span>
           </div>

           <div className="bg-black/20 backdrop-blur-md p-5 rounded-2xl border border-white/5 flex flex-col items-center justify-center gap-1 group/item hover:bg-black/30 transition-colors">
              <div className="flex items-center gap-2 mb-1">
                 <Target className="w-3.5 h-3.5 text-emerald-400" />
                 <span className="text-[10px] font-black uppercase text-slate-500">Take Profit</span>
              </div>
              <span className="text-xl font-black text-white">{tp ? tp.toFixed(2) : "---"}</span>
           </div>
        </div>

        {/* TERTIARY: TELEMETRY BAR */}
        <div className="flex flex-wrap items-center justify-between gap-6 pt-6 border-t border-white/5">
           <div className="flex items-center gap-6">
              <div className="flex flex-col gap-1">
                 <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Market Bias</span>
                 <div className="flex items-center gap-2">
                    {trend === "UP" ? <TrendingUp className="w-4 h-4 text-emerald-500" /> : <TrendingDown className="w-4 h-4 text-rose-500" />}
                    <span className="text-xs font-black text-slate-200">{trend || "NEUTRAL"}</span>
                 </div>
              </div>
              
              <div className="w-[1px] h-8 bg-white/5"></div>

              <div className="flex flex-col gap-1">
                 <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">RSI (Relative Strength)</span>
                 <div className="flex items-center gap-2">
                    <div className="w-12 h-1.5 bg-white/5 rounded-full overflow-hidden">
                       <div className="h-full bg-blue-500" style={{ width: `${safeRsi}%` }}></div>
                    </div>
                    <span className="text-xs font-black text-slate-200">{safeRsi.toFixed(1)}</span>
                 </div>
              </div>
           </div>

           <div className="flex items-center gap-3 bg-white/5 px-4 py-2 rounded-xl border border-white/5">
              <Activity className={`w-4 h-4 ${volumeSpike ? 'text-emerald-400' : 'text-slate-500'}`} />
              <span className={`text-[10px] font-black uppercase ${volumeSpike ? 'text-emerald-400' : 'text-slate-500'}`}>
                {volumeSpike ? "Institutional Volume Detected" : "Low Volatility"}
              </span>
           </div>
        </div>

      </div>
    </motion.div>
  );
};


export default SignalCard;