import { motion } from "framer-motion";
import { Zap, Clock, TrendingUp } from "lucide-react";

const ModeSelector = ({ mode, setMode }) => {
  const modes = [
    { id: "scalp", label: "Scalping", icon: <Zap className="w-4 h-4" />, desc: "High Frequency" },
    { id: "intraday", label: "Intraday", icon: <Clock className="w-4 h-4" />, desc: "Day Trading" },
    { id: "swing", label: "Swing", icon: <TrendingUp className="w-4 h-4" />, desc: "Long Term" },
  ];

  return (
    <div className="bg-slate-900/40 backdrop-blur-2xl border border-white/5 p-2 rounded-2xl flex gap-2">
      {modes.map((m) => (
        <button
          key={m.id}
          onClick={() => setMode(m.id)}
          className={`relative flex-1 flex flex-col items-center justify-center py-3 px-4 rounded-xl transition-all duration-300 group ${
            mode === m.id ? "text-white" : "text-slate-500 hover:text-slate-300"
          }`}
        >
          {mode === m.id && (
            <motion.div
              layoutId="activeMode"
              className="absolute inset-0 bg-blue-600 rounded-xl shadow-[0_0_20px_rgba(37,99,235,0.3)]"
              transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
            />
          )}
          <div className="relative z-10 flex flex-col items-center gap-1">
             <div className={`${mode === m.id ? "text-white" : "text-slate-500"}`}>
               {m.icon}
             </div>
             <span className="text-xs font-black uppercase tracking-widest">{m.label}</span>
             <span className="text-[8px] font-bold opacity-50 uppercase">{m.desc}</span>
          </div>
        </button>
      ))}
    </div>
  );
};

export default ModeSelector;