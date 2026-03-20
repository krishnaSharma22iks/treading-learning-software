import { motion } from "framer-motion";
import { Layers, Zap, Target, TrendingUp, BarChart, Maximize2 } from "lucide-react";

const StrategySelector = ({ mode, strategy, setStrategy }) => {
  const getStrategies = () => {
    if (mode === "scalp") return [
      { id: "rsi", label: "RSI Scalp", icon: <Zap className="w-3.5 h-3.5" /> },
      { id: "breakout", label: "Breakout", icon: <Maximize2 className="w-3.5 h-3.5" /> }
    ];
    if (mode === "intraday") return [
      { id: "pullback", label: "Pullback", icon: <TrendingUp className="w-3.5 h-3.5" /> },
      { id: "sr", label: "S/R Bounce", icon: <Layers className="w-3.5 h-3.5" /> }
    ];
    if (mode === "swing") return [
      { id: "trend", label: "Trend Follow", icon: <BarChart className="w-3.5 h-3.5" /> },
      { id: "breakoutSwing", label: "SWING Breakout", icon: <Target className="w-3.5 h-3.5" /> }
    ];
    return [];
  };

  return (
    <div className="bg-slate-900/40 backdrop-blur-2xl border border-white/5 p-2 rounded-2xl flex gap-2 w-full">
      {getStrategies().map((s) => (
        <button
          key={s.id}
          onClick={() => setStrategy(s.id)}
          className={`relative flex-1 flex flex-col items-center justify-center py-3 px-4 rounded-xl transition-all duration-300 group ${
            strategy === s.id ? "text-white" : "text-slate-500 hover:text-slate-300"
          }`}
        >
          {strategy === s.id && (
            <motion.div
              layoutId="activeStrategy"
              className="absolute inset-0 bg-indigo-600 rounded-xl shadow-[0_0_20px_rgba(79,70,229,0.3)]"
              transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
            />
          )}
          <div className="relative z-10 flex flex-col items-center gap-1">
             <div className={`${strategy === s.id ? "text-white" : "text-slate-500"}`}>
               {s.icon}
             </div>
             <span className="text-xs font-black uppercase tracking-widest">{s.label}</span>
          </div>
        </button>
      ))}
    </div>
  );
};

export default StrategySelector;