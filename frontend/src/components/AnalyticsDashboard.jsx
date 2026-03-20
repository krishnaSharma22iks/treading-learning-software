import { motion } from "framer-motion";
import { BarChart3, TrendingUp, ArrowUpRight, ArrowDownRight, Target } from "lucide-react";

const AnalyticsDashboard = () => {
  const stats = [
    { label: "Win Rate", value: "68.4%", icon: <Target className="w-4 h-4 text-blue-500" />, trend: "UP" },
    { label: "Net PnL", value: "+$4,290.50", icon: <TrendingUp className="w-4 h-4 text-emerald-500" />, trend: "UP" },
    { label: "Avg. RR", value: "1:2.4", icon: <BarChart3 className="w-4 h-4 text-indigo-500" />, trend: "STABLE" },
  ];

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="bg-slate-900/40 backdrop-blur-3xl border border-white/5 rounded-[2rem] p-6 shadow-2xl overflow-hidden relative group"
    >
      <div className="relative z-10 flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-blue-500" />
            <h3 className="text-sm font-black text-white uppercase tracking-tighter">Performance Metrics</h3>
          </div>
          <button className="text-[10px] font-black text-slate-500 hover:text-white transition-colors uppercase tracking-widest">Details</button>
        </div>

        <div className="grid grid-cols-1 gap-4">
           {stats.map((s, i) => (
             <div key={i} className="bg-white/5 p-4 rounded-2xl border border-white/5 flex items-center justify-between group/item hover:bg-white/10 transition-colors">
                <div className="flex items-center gap-4">
                   <div className="p-2.5 bg-black/20 rounded-xl border border-white/5">
                      {s.icon}
                   </div>
                   <div className="flex flex-col gap-0.5">
                      <span className="text-[10px] font-black text-slate-500 uppercase">{s.label}</span>
                      <span className="text-sm font-black text-white">{s.value}</span>
                   </div>
                </div>
                {s.trend === "UP" && <ArrowUpRight className="w-4 h-4 text-emerald-500" />}
                {s.trend === "DOWN" && <ArrowDownRight className="w-4 h-4 text-rose-500" />}
             </div>
           ))}
        </div>
      </div>
    </motion.div>
  );
};

export default AnalyticsDashboard;
