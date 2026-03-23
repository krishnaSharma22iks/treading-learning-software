import React from "react";
import { motion } from "framer-motion";
import { Zap, Bot } from "lucide-react";

const AiModeToggle = ({ isAiMode, onToggle }) => {
  return (
    <div className="flex items-center gap-4 bg-black/40 p-2 pl-4 rounded-2xl border border-white/5 backdrop-blur-3xl shadow-2xl">
      <div className="flex flex-col">
        <div className="flex items-center gap-2">
           <Bot className={`w-3.5 h-3.5 ${isAiMode ? 'text-slate-200' : 'text-slate-500'}`} />
           <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">AI AGENT</span>
        </div>
        <span className={`text-[9px] font-bold ${isAiMode ? 'text-slate-400' : 'text-slate-600'}`}>
          {isAiMode ? "INSTITUTIONAL ACTIVE" : "MANUAL OVERRIDE"}
        </span>
      </div>

      <button
        onClick={() => onToggle(!isAiMode)}
        className={`relative w-14 h-8 rounded-full p-1 transition-all duration-500 overflow-hidden ${
          isAiMode 
            ? "bg-slate-700 shadow-[0_0_20px_rgba(255,255,255,0.05)]" 
            : "bg-slate-800"
        }`}
      >
        {/* Animated background stripes for AI mode */}
        {isAiMode && (
          <motion.div 
            initial={{ x: "-100%" }}
            animate={{ x: "100%" }}
            transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
            className="absolute inset-y-0 w-full bg-gradient-to-r from-transparent via-white/10 to-transparent skew-x-12"
          />
        )}

        <motion.div
          animate={{ x: isAiMode ? 24 : 0 }}
          transition={{ type: "spring", stiffness: 500, damping: 30 }}
          className={`relative z-10 w-6 h-6 rounded-full shadow-lg flex items-center justify-center transition-colors ${
            isAiMode ? "bg-white text-slate-800" : "bg-slate-400 text-slate-800"
          }`}
        >
          <Zap className="w-3.5 h-3.5 fill-current" />
        </motion.div>
      </button>
    </div>
  );
};

export default AiModeToggle;
