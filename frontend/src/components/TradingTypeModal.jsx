import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Zap, Clock, TrendingUp, X } from "lucide-react";

const TradingTypeModal = ({ isOpen, onClose, onSelect }) => {
  const options = [
    {
      id: "scalp",
      label: "Scalping",
      icon: <Zap className="w-6 h-6 text-yellow-400" />,
      desc: "Ultra fast, high-frequency trades (1-5m TF)",
    },
    {
      id: "intraday",
      label: "Intraday",
      icon: <Clock className="w-6 h-6 text-blue-400" />,
      desc: "Daily market cycles and sessions (15m-1h TF)",
    },
    {
      id: "swing",
      label: "Swing",
      icon: <TrendingUp className="w-6 h-6 text-purple-400" />,
      desc: "Multi-day trends and structural shifts (4h-1D TF)",
    },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/80 backdrop-blur-md z-[1000]"
          />

          {/* Modal Container */}
          <div className="fixed inset-0 flex items-center justify-center z-[1001] p-4 pointer-events-none">
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-[#09090b] border border-white/10 w-full max-w-md rounded-[2.5rem] shadow-2xl pointer-events-auto overflow-hidden relative"
            >
              {/* Header */}
              <div className="p-8 pb-4 flex justify-between items-start">
                <div>
                  <h2 className="text-2xl font-black text-white tracking-tight italic uppercase">
                    Select <span className="text-blue-500">AI Strategy</span>
                  </h2>
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-1">
                    Initialize institutional logic layer
                  </p>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-white/5 rounded-full transition-colors text-slate-500 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Options Grid */}
              <div className="p-6 pt-2 space-y-3">
                {options.map((opt) => (
                  <button
                    key={opt.id}
                    onClick={() => {
                      onSelect(opt.id);
                      onClose();
                    }}
                    className="w-full group flex items-center gap-4 p-5 bg-white/[0.02] hover:bg-white/[0.05] border border-white/5 hover:border-blue-500/30 rounded-3xl transition-all active:scale-[0.98] text-left"
                  >
                    <div className="p-3 bg-black/40 rounded-2xl border border-white/5 group-hover:border-blue-500/20 transition-colors">
                      {opt.icon}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-black text-white uppercase text-sm group-hover:text-blue-400 transition-colors">
                        {opt.label}
                      </h3>
                      <p className="text-[10px] font-medium text-slate-500 leading-tight">
                        {opt.desc}
                      </p>
                    </div>
                  </button>
                ))}
              </div>

              {/* Footer */}
              <div className="p-8 pt-2">
                <p className="text-[8px] font-bold text-slate-600 uppercase tracking-widest text-center">
                  Ensuring 99.8% precision across multi-timeframe analytics
                </p>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
};

export default TradingTypeModal;
