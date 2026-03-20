import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Activity, Zap, TrendingUp, BarChart3, Info, MessageSquare } from "lucide-react";

import Controls from "../components/Controls";
import Chart from "../components/Chart";
import SignalCard from "../components/SignalCard";
import TradeHistory from "../components/TradeHistory";
import AnalyticsDashboard from "../components/AnalyticsDashboard";
import ModeSelector from "../components/ModeSelector";
import StrategySelector from "../components/StrategySelector";
import TradingAssistant from "../components/TradingAssistant";
import TradePlanCard from "../components/TradePlanCard";
import SMCExpert from "../components/SMCExpert";

import {
  calculateTrend,
  calculateVolume,
  calculateRSI,
  generateAIMessage,
} from "../utils/extraIndicators";
import { validateTradeSetup } from "../utils/expertAnalyst";
import { getFinalDecision } from "../utils/decisionEngine";
import { getSMCAnalysis } from "../utils/smcExpert";

// 🔥 STRATEGIES
import { rsiScalpStrategy } from "../strategies/scalping/rsiScalp";
import { breakoutScalpStrategy } from "../strategies/scalping/breakoutScalp";
import { trendPullbackStrategy } from "../strategies/intraday/trendPullback";
import { srBounceStrategy } from "../strategies/intraday/srBounce";
import { trendFollowStrategy } from "../strategies/swing/trendFollow";
import { breakoutSwingStrategy } from "../strategies/swing/breakoutSwing";

const Dashboard = () => {
  const [mode, setMode] = useState("scalp");
  const [strategy, setStrategy] = useState("rsi");
  const [pair, setPair] = useState("BTCUSDT");

  const [signal, setSignal] = useState("HOLD");
  const [entry, setEntry] = useState(null);
  const [sl, setSl] = useState(null);
  const [tp, setTp] = useState(null);
  const [price, setPrice] = useState(0);

  const [support, setSupport] = useState(null); 
  const [resistance, setResistance] = useState(null); 
  const [rsi, setRsi] = useState(50);
  const [trend, setTrend] = useState("");
  const [volumeSpike, setVolumeSpike] = useState(false);
  const [ai, setAi] = useState("Loading...");
  const [expert, setExpert] = useState(null);
  const [verdict, setVerdict] = useState(null);
  const [tradePlan, setTradePlan] = useState(null);
  const [smcData, setSMCData] = useState(null);
  
  const [isSidePanelOpen, setIsSidePanelOpen] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setSignal("HOLD");
      setEntry(null);
      setSl(null);
      setTp(null);
      setSupport(null);
      setResistance(null);
      setAi("Analyzing " + pair + "...");

      try {
        const res = await fetch(
          `https://api.binance.com/api/v3/klines?symbol=${pair}&interval=5m&limit=100`
        );

        const data = await res.json();

        const formattedData = data.map((item) => ({
          open: parseFloat(item[1]),
          high: parseFloat(item[2]),
          low: parseFloat(item[3]),
          close: parseFloat(item[4]),
          volume: parseFloat(item[5]),
        }));

        const closes = formattedData.map((d) => d.close);
        const volumes = formattedData.map((d) => d.volume);

        const currentPrice = closes[closes.length - 1];
        setPrice(currentPrice);

        // 🔥 STRATEGY ENGINE
        let result = {
          signal: "HOLD",
          entry: null,
          sl: null,
          tp: null,
          support: null,
          resistance: null,
          reason: "No strategy match",
        };

        if (mode === "scalp") {
          if (strategy === "rsi") result = rsiScalpStrategy(formattedData);
          else if (strategy === "breakout") result = breakoutScalpStrategy(formattedData);
        } else if (mode === "intraday") {
          if (strategy === "pullback") result = trendPullbackStrategy(formattedData);
          else if (strategy === "sr") result = srBounceStrategy(formattedData);
        } else if (mode === "swing") {
          if (strategy === "trend") result = trendFollowStrategy(formattedData);
          else if (strategy === "breakoutSwing") result = breakoutSwingStrategy(formattedData);
        }

        const ma = closes.slice(-50).reduce((a, b) => a + b, 0) / 50;
        const trendValue = calculateTrend(currentPrice, ma);
        const { volumeSpike } = calculateVolume(volumes);
        const rsiValue = calculateRSI(closes);
        const aiMessage = generateAIMessage(result.signal, trendValue, volumeSpike);

        setSignal(result.signal);
        setEntry(result.entry);
        setSl(result.sl);
        setTp(result.tp);
        setSupport(result.support);
        setResistance(result.resistance);
        setRsi(rsiValue);
        setTrend(trendValue);
        setVolumeSpike(volumeSpike);
        setAi(aiMessage + " | " + result.reason);

        const expertResult = validateTradeSetup({
          signal: result.signal,
          entry: result.entry,
          sl: result.sl,
          tp: result.tp,
          trend: trendValue,
          support: result.support,
          resistance: result.resistance,
          rsi: rsiValue,
          volumeSpike: volumeSpike,
          lastCandles: formattedData.slice(-5)
        });
        setExpert(expertResult);

        const lastCandle = formattedData[formattedData.length - 1];
        const body = Math.abs(lastCandle.close - lastCandle.open);
        const candleStrength = body > (lastCandle.high - lastCandle.low) * 0.4 ? "STRONG" : "WEAK";
        
        let entryQuality = "GOOD";
        if (result.signal === "BUY" && result.support) {
          if ((currentPrice - result.support) / currentPrice > 0.01) entryQuality = "MID";
        } else if (result.signal === "SELL" && result.resistance) {
          if ((result.resistance - currentPrice) / currentPrice > 0.01) entryQuality = "MID";
        }

        const hour = new Date().getUTCHours();
        let session = "ASIAN";
        if (hour >= 8 && hour <= 16) session = "LONDON";
        else if (hour >= 13 && hour <= 21) session = "NEW YORK";

        const finalResult = getFinalDecision({
          signal: result.signal,
          entry: result.entry,
          sl: result.sl,
          tp: result.tp,
          trend: trendValue,
          support: result.support,
          resistance: result.resistance,
          rsi: rsiValue,
          volumeSpike: volumeSpike,
          marketStructure: "HH/HL",
          candleStatus: "CLOSED",
          candleStrength,
          entryQuality,
          analystDecision: expertResult.decision,
          session
        });
        setVerdict(finalResult);

        const riskLevel = finalResult.trade_quality_score > 85 ? "LOW" : finalResult.trade_quality_score < 60 ? "HIGH" : "MEDIUM";
        const entryZone = result.signal === "BUY" ? (result.support ? `support (${result.support.toFixed(2)})` : "support") : (result.resistance ? `resistance (${result.resistance.toFixed(2)})` : "resistance");
        
        const plan = {
          market_bias: result.signal,
          current_condition: trendValue !== "SIDEWAYS" ? "TRENDING" : "CHOPPY",
          best_action: finalResult.final_decision,
          entry_plan: `Look for entries near ${entryZone} zone.`,
          confirmation_trigger: finalResult.trigger || "Awaiting strong candle close",
          invalidation: finalResult.invalidation || "Invalidated on structural break",
          risk_level: riskLevel,
          summary: `Institutional setup detected with ${finalResult.trade_quality_score}% quality. ${finalResult.execution_plan}`
        };
        setTradePlan(plan);

        const smcResult = getSMCAnalysis({
            price: currentPrice,
            trend: trendValue,
            marketStructure: "HH/HL",
            liquiditySweep: result.volumeSpike,
            orderBlockZone: entryZone,
            currentLocation: "AT OB",
            bos: result.signal === "BUY" ? (currentPrice > result.resistance) : (currentPrice < result.support),
            choch: false,
            volume: result.volumeSpike ? "HIGH" : "BASELINE",
            candleStatus: "CLOSED",
            candleStrength: "STRONG",
            session: "LONDON"
        });
        setSMCData(smcResult);

      } catch (error) {
        console.log("Error:", error);
        setAi("⚠️ Failed to fetch market data");
      }
    };

    fetchData();
  }, [pair, mode, strategy]);

  return (
    <div className="bg-[#020617] min-h-screen text-slate-100 font-sans selection:bg-blue-500/30 overflow-x-hidden relative">
      
      {/* Premium Gradient Backgrounds */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/10 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-600/10 rounded-full blur-[120px]"></div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 relative z-10 flex flex-col gap-8">
        
        {/* Header Section */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row md:items-center justify-between gap-6"
        >
          <div className="flex items-center gap-4">
             <div className="p-3 bg-blue-600/10 rounded-2xl border border-blue-500/20 backdrop-blur-md">
                <Activity className="w-6 h-6 text-blue-400" />
             </div>
             <div>
               <h1 className="text-2xl font-black tracking-tight text-white flex items-center gap-2">
                 TERMINAL <span className="text-blue-500">PRO</span>
               </h1>
               <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Algorithmic Telemetry v4.2</p>
             </div>
          </div>
          
          <div className="flex items-center gap-4 bg-slate-900/50 p-2 rounded-2xl border border-white/5 backdrop-blur-xl">
             <Controls onPairChange={setPair} />
             <button 
                onClick={() => setIsSidePanelOpen(true)}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-4 py-2.5 rounded-xl font-bold text-xs transition-all shadow-lg shadow-blue-600/20 active:scale-95 group"
             >
                <TrendingUp className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                <span>VIEW SIGNALS</span>
             </button>
          </div>
        </motion.div>

        {/* Strategy Bar */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-2 gap-4"
        >
           <ModeSelector mode={mode} setMode={setMode} />
           <StrategySelector mode={mode} strategy={strategy} setStrategy={setStrategy} />
        </motion.div>

        {/* Main Interface [ CENTERED CHART ] */}
        <div className="flex flex-col gap-6">
           <motion.div 
             initial={{ opacity: 0, scale: 0.98 }}
             animate={{ opacity: 1, scale: 1 }}
             transition={{ duration: 0.5 }}
             className="w-full h-[65vh] min-h-[500px] relative"
           >
             <Chart pair={pair} />
           </motion.div>

           {/* PRIMARY SIGNALS BELOW CHART */}
           <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
              <div className="lg:col-span-2 space-y-6">
                <SignalCard 
                  signal={signal} 
                  entry={entry} 
                  sl={sl} 
                  tp={tp} 
                  support={support} 
                  resistance={resistance} 
                  rsi={rsi}
                  ai={ai} 
                  trend={trend} 
                  volumeSpike={volumeSpike} 
                  expert={expert}
                  verdict={verdict}
                />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <AnalyticsDashboard />
                  <TradeHistory />
                </div>
              </div>
              
              <div className="lg:col-span-1 space-y-6">
                 <TradePlanCard plan={tradePlan} />
                 <SMCExpert smc={smcData} />
              </div>
           </div>
        </div>

        {/* Side Panel [ SLIDE FROM RIGHT ] */}
        <AnimatePresence>
          {isSidePanelOpen && (
            <>
              {/* Backdrop */}
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsSidePanelOpen(false)}
                className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[150]"
              />
              
              {/* Panel */}
              <motion.div 
                initial={{ x: "100%" }}
                animate={{ x: 0 }}
                exit={{ x: "100%" }}
                transition={{ type: "spring", damping: 25, stiffness: 200 }}
                className="fixed top-0 right-0 h-full w-full sm:w-[450px] bg-[#09090b] border-l border-white/10 z-[200] shadow-2xl overflow-y-auto p-8 flex flex-col gap-8"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <BarChart3 className="w-5 h-5 text-blue-500" />
                    <h2 className="text-xl font-black text-white uppercase tracking-tighter">Deep Analysis</h2>
                  </div>
                  <button onClick={() => setIsSidePanelOpen(false)} className="p-2 hover:bg-white/5 rounded-lg transition-colors">
                    <X className="w-6 h-6 text-slate-400" />
                  </button>
                </div>

                <div className="space-y-6">
                  {/* Quick Telemetry */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
                      <p className="text-[9px] font-bold text-slate-500 uppercase mb-1">Live RSI</p>
                      <p className="text-xl font-black text-white">{rsi.toFixed(1)}</p>
                    </div>
                    <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
                      <p className="text-[9px] font-bold text-slate-500 uppercase mb-1">Volume Spike</p>
                      <p className={`text-xl font-black ${volumeSpike ? 'text-green-400' : 'text-slate-500'}`}>{volumeSpike ? 'DETECTED' : 'NONE'}</p>
                    </div>
                  </div>

                  <div className="bg-white/5 p-5 rounded-2xl border border-white/5 flex flex-col gap-4">
                     <div className="flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 text-emerald-400" />
                        <span className="text-[10px] font-black uppercase text-slate-300">Trend Telemetry</span>
                     </div>
                     <p className="text-sm font-medium text-slate-400 leading-relaxed italic border-l-2 border-emerald-500/30 pl-4">
                        Current market momentum is analyzed as <span className="text-emerald-400 font-bold">{trend}</span>. 
                        Institutional order flow suggests strong structural support near current levels.
                     </p>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                       <Zap className="w-3.5 h-3.5" /> Institutional SMC Layer
                    </h3>
                    <SMCExpert smc={smcData} />
                  </div>

                  <div className="space-y-4 pt-4 border-t border-white/5">
                    <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                       <MessageSquare className="w-3.5 h-3.5 text-blue-400" /> Neural Terminal
                    </h3>
                    <TradingAssistant 
                      telemetry={{
                        strategy: mode === "scalp" ? "SCALPING" : (strategy === "rsi" ? "BASIC" : "SMC"),
                        price, trend, support, resistance, rsi,
                        volume: volumeSpike ? "HIGH" : "BASELINE",
                        entry_quality: "GOOD",
                        candle_status: "CLOSED",
                        candle_strength: "STRONG",
                        smc_data: {
                          liquidity_sweep: smcData?.liquidity_sweep ? "YES" : "NO",
                          order_block: smcData?.entry_zone || "N/A",
                          bos: smcData?.bos_detected ? "YES" : "NO",
                          choch: smcData?.choch_detected ? "YES" : "NO",
                          price_location: smcData?.at_order_block ? "AT_OB" : "MID"
                        },
                        expert_decision: expert?.decision,
                        verdict
                      }} 
                    />
                  </div>
                </div>
                
                <div className="mt-auto pt-6">
                   <button 
                     onClick={() => setIsSidePanelOpen(false)}
                     className="w-full bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold py-4 rounded-2xl transition-all"
                   >
                     CLOSE ANALYSIS
                   </button>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </main>

      {/* Floating Action Button for Mobile ONLY */}
      <button 
        onClick={() => setIsSidePanelOpen(true)}
        className="md:hidden fixed bottom-6 right-6 w-14 h-14 bg-blue-600 rounded-full flex items-center justify-center shadow-2xl z-50 text-white active:scale-90 transition-all"
      >
        <TrendingUp className="w-6 h-6" />
      </button>
    </div>
  );
};

export default Dashboard;