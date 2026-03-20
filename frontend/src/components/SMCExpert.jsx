import { motion } from "framer-motion";
import { Shield, Target, Zap, Activity, AlertCircle } from "lucide-react";

const SMCExpert = ({ smc }) => {
  if (!smc) return null;

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-slate-900/40 backdrop-blur-3xl border border-white/5 rounded-[2rem] p-6 shadow-2xl overflow-hidden relative group"
    >
      {/* Glow effect */}
      <div className={`absolute top-0 right-0 w-32 h-32 blur-[80px] -mr-16 -mt-16 opacity-20 pointer-events-none rounded-full ${smc.decision === "ENTER" ? "bg-emerald-500" : "bg-blue-500"}`}></div>

      <div className="relative z-10 flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-blue-500" />
            <h3 className="text-sm font-black text-white uppercase tracking-tighter">Institutional SMC</h3>
          </div>
          <div className={`px-3 py-1 rounded-lg text-[10px] font-black border tracking-widest ${smc.decision === "ENTER" ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-blue-500/10 text-blue-400 border-blue-500/20'}`}>
            {smc.decision}
          </div>
        </div>

        <div className="space-y-4">
           {/* Primary Analysis */}
           <div className="bg-black/20 p-4 rounded-2xl border border-white/5 flex flex-col gap-3">
              <div className="flex justify-between items-center text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                 <span>Order Block</span>
                 <span className="text-white">{smc.entry_zone || "N/A"}</span>
              </div>
              <div className="flex justify-between items-center text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                 <span>Confidence</span>
                 <span className="text-white">{smc.confidence}%</span>
              </div>
           </div>

           {/* Metrics Grid */}
           <div className="grid grid-cols-2 gap-3">
              <div className="bg-white/5 p-3 rounded-xl border border-white/5 flex flex-col gap-1">
                 <span className="text-[8px] font-black text-slate-500 uppercase">Liquidity</span>
                 <span className={`text-[10px] font-bold ${smc.liquidity_sweep ? 'text-emerald-400' : 'text-slate-400'}`}>{smc.liquidity_sweep ? 'SWEPT' : 'NONE'}</span>
              </div>
              <div className="bg-white/5 p-3 rounded-xl border border-white/5 flex flex-col gap-1">
                 <span className="text-[8px] font-black text-slate-500 uppercase">Structure</span>
                 <span className={`text-[10px] font-bold ${smc.bos_detected ? 'text-blue-400' : 'text-slate-400'}`}>{smc.bos_detected ? 'BOS DETECTED' : 'STABLE'}</span>
              </div>
           </div>

           {/* Rationale */}
           <div className="space-y-2">
              <div className="flex items-center gap-2 mb-1">
                 <Activity className="w-3.5 h-3.5 text-slate-500" />
                 <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Structural Insights</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed italic border-l-2 border-slate-700 pl-3">
                 {smc.rationale}
              </p>
           </div>
        </div>
      </div>
    </motion.div>
  );
};

export default SMCExpert;
