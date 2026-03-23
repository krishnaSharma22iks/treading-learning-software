import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Zap, 
  ShieldCheck, 
  ShieldAlert,
} from 'lucide-react';
import { translateToBeginner } from '../utils/beginnerTranslator';

const BeginnerSignal = ({ data, support, resistance }) => {
  const [tip, setTip] = useState("");

  useEffect(() => {
    setTip(translateToBeginner(null, "TIP"));
  }, [data]);

  if (!data) return null;

  const isBuy = data.direction === "BUY";
  const signalText = isBuy ? "Market looks strong, consider buying 📈" : "Market looks weak, consider selling 📉";

  // 🚦 Traffic Light Logic (Formalized)
  const getTrafficLight = () => {
    if (data.direction === "NO TRADE") {
      return { 
        label: "DO NOT TRADE", 
        color: "rose", 
        icon: "🔴", 
        reason: "Unclear market direction. High risk of losing money." 
      };
    }

    if (data.confidence_score <= 75) {
      return { 
        label: "TRADE WITH CAUTION", 
        color: "yellow", 
        icon: "🟡", 
        reason: data.confidence_score < 70 ? "Trend strength is medium." : "Market volume is baseline/weak." 
      };
    }

    return { 
      label: "SAFE TO TRADE", 
      color: "emerald", 
      icon: "🟢", 
      reason: "Strong trend and high confirmation detected." 
    };
  };
  
  const traffic = getTrafficLight();

  // 💰 Risk Calculator (₹1000)
  const calculateResult = (isProfit) => {
    const entry = parseFloat(data.entry) || 0;
    const exit = isProfit ? (parseFloat(data.tp) || 0) : (parseFloat(data.sl) || 0);
    
    if (!entry || !exit) return "0.00";

    const percentage = Math.abs(exit - entry) / entry;
    const amount = 1000 * percentage;
    return amount.toFixed(2);
  };

  // 🛣️ Action Roadmap Helper
  const renderActionRoadmap = () => {
    if (data.direction === "NO TRADE") {
      return (
        <div className="bg-rose-500/10 p-8 rounded-[2.5rem] border-2 border-rose-500/20 space-y-4 text-center">
          <h3 className="text-xl font-black text-rose-400 uppercase tracking-tighter">What Should You Do?</h3>
          <div className="space-y-2">
            <span className="text-4xl block">Wait.</span>
            <p className="text-sm font-bold text-slate-300">Do not take any trade now. Market direction is not clear.</p>
          </div>
        </div>
      );
    }

    const steps = [
      { step: 1, text: "Wait for price to reach Entry level.", value: `₹${data.entry || "CMP"}` },
      { step: 2, text: `Place ${data.direction} order.`, value: data.direction },
      { step: 3, text: isBuy ? "Set Stop Loss at given SL price." : "Set Stop Loss above entry.", value: data.sl || "N/A" },
      { step: 4, text: isBuy ? "Set Take Profit at TP price." : "Set Take Profit at target.", value: data.tp || "N/A" }
    ];

    return (
      <div className="bg-emerald-500/5 p-8 rounded-[2.5rem] border-2 border-white/5 space-y-6">
        <h3 className="text-xl font-black text-white uppercase tracking-tighter italic border-b border-white/10 pb-4">What Should You Do?</h3>
        <div className="space-y-6">
          {steps.map((s) => (
            <div key={s.step} className="flex gap-4 items-start">
              <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center shrink-0 text-sm font-black text-white border border-white/20">
                {s.step}
              </div>
              <div className="space-y-1">
                <p className="text-sm font-bold text-slate-300 leading-tight">{s.text}</p>
                <p className={`text-xl font-black ${s.step === 1 ? 'text-white' : s.step === 3 ? 'text-rose-400' : 'text-emerald-400'} tracking-tight italic`}>
                  {s.value}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // 💡 Explanation Block Helper
  const renderExplanationBlock = () => {
    const isNoTrade = data.direction === "NO TRADE";
    const title = isNoTrade ? "Why you should wait:" : "Why this trade?";
    
    let reasons = [];
    if (isNoTrade) {
      reasons = [
        "Buyers are not active.",
        "Market direction is unclear.",
        "Price is moving randomly."
      ];
    } else if (isBuy) {
      reasons = [
        "Market is moving upward.",
        "Buyers are active.",
        "Price is near safe buying area."
      ];
    } else {
      reasons = [
        "Market is moving downward.",
        "Sellers are active.",
        "Price is near selling zone."
      ];
    }

    return (
      <div className="bg-blue-500/5 p-8 rounded-[2rem] border-2 border-blue-500/10 space-y-4">
        <h4 className="text-xl font-black text-white uppercase tracking-tighter italic flex items-center gap-2">
           {title}
        </h4>
        <ul className="space-y-4">
          {reasons.map((reason, idx) => (
            <li key={idx} className="flex items-center gap-4 text-sm font-bold text-slate-200">
               <div className="w-2 h-2 rounded-full bg-blue-400 shrink-0 shadow-[0_0_10px_rgba(96,165,250,0.5)]" />
               {reason}
            </li>
          ))}
        </ul>
      </div>
    );
  };

  // 🔴 NO TRADE STATE
  if (data.direction === "NO TRADE") {
    return (
      <div className="p-10 bg-slate-900/60 backdrop-blur-3xl rounded-[3rem] border-2 border-white/5 space-y-8">
         <div className="flex flex-col items-center gap-6 text-center text-white">
            <div className="w-24 h-24 bg-rose-500/10 rounded-full flex items-center justify-center border-4 border-rose-500/20">
               <span className="text-5xl">⏳</span>
            </div>
            <div className="space-y-4">
               <h2 className="text-5xl font-black uppercase tracking-tighter italic leading-none">Wait</h2>
               <div className="px-6 py-2 bg-rose-500/10 text-rose-400 rounded-full text-xs font-black uppercase tracking-widest border border-rose-500/20 inline-block">
                  🔴 STANDBY
               </div>
            </div>
         </div>
         {renderActionRoadmap()}
         {renderExplanationBlock()}
      </div>
    );
  }

  // 🟢🟢 BUY/SELL STATE
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="p-10 bg-slate-900/60 backdrop-blur-3xl rounded-[3rem] border-2 border-white/5 space-y-10"
    >
      {/* 🚦 Traffic Light Status */}
      <div className="flex flex-col items-center gap-6 border-b border-white/5 pb-10">
         <div className="relative group">
            <div className={`absolute -inset-4 bg-${traffic.color}-500/20 blur-2xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity`} />
            <span className="text-8xl block relative">{traffic.icon}</span>
         </div>
         <div className="space-y-2 text-center">
            <h3 className={`text-2xl font-black text-${traffic.color}-400 tracking-widest uppercase italic`}>
               {traffic.label}
            </h3>
            <div className="bg-white/5 px-4 py-1 rounded-full border border-white/5 inline-block">
               <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Reason: {traffic.reason}</span>
            </div>
         </div>
         <h2 className={`text-4xl font-black text-white text-center leading-tight tracking-tighter italic mt-4 uppercase`}>
            {signalText}
         </h2>
      </div>

      {/* 🛣️ Action Roadmap */}
      {renderActionRoadmap()}

      {/* 💰 Risk & Profit Calculator (₹1000) */}
      <div className="bg-white/5 p-8 rounded-[2.5rem] border border-white/5 space-y-6">
         <div className="flex items-center gap-3">
            <Zap className="w-5 h-5 text-yellow-400" />
            <h3 className="text-xs font-black text-white uppercase tracking-widest text-center flex-1">If you trade ₹1000</h3>
         </div>
         <div className="grid grid-cols-2 gap-8">
            <div className="bg-rose-500/5 p-6 rounded-3xl border border-rose-500/10 text-center">
               <span className="text-[10px] font-black text-slate-500 uppercase block mb-1">Possible Loss</span>
               <span className="text-2xl font-black text-rose-400">₹{calculateResult(false)}</span>
            </div>
            <div className="bg-emerald-500/5 p-6 rounded-3xl border border-emerald-500/10 text-center">
               <span className="text-[10px] font-black text-slate-500 uppercase block mb-1">Possible Profit</span>
               <span className="text-2xl font-black text-emerald-400">₹{calculateResult(true)}</span>
            </div>
         </div>
      </div>

      {/* 💡 Explanation Block */}
      {renderExplanationBlock()}

      {/* 🔍 Level Names */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-white/5 pt-8">
         <div className="text-center bg-white/5 p-4 rounded-2xl md:bg-transparent md:p-0">
            <span className="text-[10px] font-black text-slate-500 uppercase block tracking-widest">Safe Buying Area</span>
            <p className="text-sm font-black text-slate-300 mt-1">{support}</p>
         </div>
         <div className="text-center bg-white/5 p-4 rounded-2xl md:bg-transparent md:p-0">
            <span className="text-[10px] font-black text-slate-500 uppercase block tracking-widest">Profit Booking Area</span>
            <p className="text-sm font-black text-slate-300 mt-1">{resistance}</p>
         </div>
      </div>
    </motion.div>
  );
};

export default BeginnerSignal;
