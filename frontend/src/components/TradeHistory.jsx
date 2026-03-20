import { motion } from "framer-motion";
import { History, TrendingUp, TrendingDown, Clock } from "lucide-react";

const TradeHistory = () => {
  const history = [
    { pair: "BTCUSDT", signal: "BUY", pnl: "+2.4%", time: "2h ago" },
    { pair: "ETHUSDT", signal: "SELL", pnl: "-0.8%", time: "5h ago" },
    { pair: "SOLUSDT", signal: "BUY", pnl: "+4.1%", time: "12h ago" },
  ];

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="bg-slate-900/40 backdrop-blur-3xl border border-white/5 rounded-[2rem] p-6 shadow-2xl overflow-hidden relative group h-full"
    >
      <div className="relative z-10 flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <History className="w-5 h-5 text-indigo-500" />
            <h3 className="text-sm font-black text-white uppercase tracking-tighter">Trade History</h3>
          </div>
          <button className="text-[10px] font-black text-slate-500 hover:text-white transition-colors uppercase tracking-widest">Archive</button>
        </div>

        <div className="space-y-3">
           {history.map((t, i) => (
             <div key={i} className="flex items-center justify-between p-3 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors group/item">
                <div className="flex items-center gap-3">
                   <div className={`p-2 rounded-xl ${t.signal === "BUY" ? 'bg-emerald-500/10' : 'bg-rose-500/10'}`}>
                      {t.signal === "BUY" ? <TrendingUp className="w-3.5 h-3.5 text-emerald-500" /> : <TrendingDown className="w-3.5 h-3.5 text-rose-500" />}
                   </div>
                   <div className="flex flex-col">
                      <span className="text-xs font-black text-white">{t.pair}</span>
                      <span className="text-[9px] font-bold text-slate-500 uppercase">{t.signal} SESSION</span>
                   </div>
                </div>
                <div className="flex flex-col items-end">
                   <span className={`text-xs font-black ${t.pnl.startsWith('+') ? 'text-emerald-400' : 'text-rose-400'}`}>{t.pnl}</span>
                   <div className="flex items-center gap-1 opacity-40">
                      <Clock className="w-2.5 h-2.5" />
                      <span className="text-[9px] font-bold uppercase">{t.time}</span>
                   </div>
                </div>
             </div>
           ))}
        </div>
      </div>
    </motion.div>
  );
};

export default TradeHistory;