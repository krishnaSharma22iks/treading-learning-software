import { motion } from "framer-motion";
import { ClipboardList, CheckCircle2, AlertCircle, Zap, Shield } from "lucide-react";

const TradePlanCard = ({ plan }) => {
  if (!plan) return null;

  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="bg-slate-900/40 backdrop-blur-3xl border border-white/5 rounded-[2rem] p-6 shadow-2xl relative overflow-hidden group"
    >
      {/* Accent line */}
      <div className="absolute top-0 left-0 w-1 h-full bg-blue-500/40"></div>

      <div className="relative z-10 flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ClipboardList className="w-5 h-5 text-blue-400" />
            <h3 className="text-sm font-black text-white uppercase tracking-tighter">Execution Plan</h3>
          </div>
          <div className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest bg-blue-500/10 text-blue-400 border border-blue-500/20`}>
             {plan.risk_level} RISK
          </div>
        </div>

        <div className="space-y-4">
           <div className="bg-white/5 p-4 rounded-xl border border-white/5 flex flex-col gap-2">
              <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Market Bias</span>
              <div className="flex items-center gap-2">
                 <div className={`w-2 h-2 rounded-full ${plan.market_bias === 'BUY' ? 'bg-emerald-500' : 'bg-rose-500'} animate-pulse`}></div>
                 <span className="text-xs font-bold text-white">{plan.market_bias} ({plan.current_condition})</span>
              </div>
           </div>

           <div className="space-y-3">
              <div className="flex items-start gap-3">
                 <Zap className="w-3.5 h-3.5 text-blue-500 mt-0.5" />
                 <div className="flex flex-col gap-0.5">
                    <span className="text-[9px] font-black text-slate-500 uppercase">Primary Trigger</span>
                    <span className="text-[11px] text-slate-300 font-medium">{plan.confirmation_trigger}</span>
                 </div>
              </div>
              
              <div className="flex items-start gap-3">
                 <Shield className="w-3.5 h-3.5 text-rose-500 mt-0.5" />
                 <div className="flex flex-col gap-0.5">
                    <span className="text-[9px] font-black text-slate-500 uppercase">Invalidation Point</span>
                    <span className="text-[11px] text-slate-300 font-medium">{plan.invalidation}</span>
                 </div>
              </div>
           </div>

           <div className="pt-4 border-t border-white/5">
              <div className="flex items-center gap-2 mb-2">
                 <AlertCircle className="w-3.5 h-3.5 text-slate-500" />
                 <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Executive Summary</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed italic border-l-2 border-blue-500/30 pl-3">
                 {plan.summary}
              </p>
           </div>
        </div>
      </div>
    </motion.div>
  );
};

export default TradePlanCard;
