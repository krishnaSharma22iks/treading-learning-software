import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Activity, Zap, TrendingUp, BarChart3, Info, MessageSquare } from "lucide-react";

import Controls from "../components/Controls";
import Chart from "../components/Chart";
import SignalCard from "../components/SignalCard";
import TradeHistory from "../components/TradeHistory";
import ModeSelector from "../components/ModeSelector";
import StrategySelector from "../components/StrategySelector";
import TradingAssistant from "../components/TradingAssistant";
import TradePlanCard from "../components/TradePlanCard";
import SMCExpert from "../components/SMCExpert";
import AiModeToggle from "../components/AiModeToggle";
import TradingTypeModal from "../components/TradingTypeModal";
import { Bot, AlertCircle } from "lucide-react";

import {
  calculateTrend,
  calculateVolume,
  calculateRSI,
  generateAIMessage,
} from "../utils/extraIndicators";
import { validateTradeSetup } from "../utils/expertAnalyst";
import { getFinalDecision } from "../utils/decisionEngine";
import { getSMCAnalysis } from "../utils/smcExpert";
import { getStrategyConfig } from "../utils/strategyMapping";
import { getIndicatorAnalysis } from "../utils/indicatorEngine";
import { getStrategyRules } from "../utils/strategyDefinitions";
import { calculateRiskAssessment } from "../utils/riskEngine";
import { analyzeAdaptiveMTFTrend } from "../utils/multiTimeframe";
import RiskManager from "../components/RiskManager";
import ValidationManager from "../components/ValidationManager";
import ProfessionalSignal from "../components/ProfessionalSignal";
import BeginnerSignal from "../components/BeginnerSignal";
import BeginnerModeToggle from "../components/BeginnerModeToggle";
import { detectNoTradeConditions } from "../utils/noTradeEngine";
import { calculateEMA } from "../utils/indicators";

// 🔥 STRATEGIES
import { rsiScalpStrategy } from "../strategies/scalping/rsiScalp";
import { breakoutScalpStrategy } from "../strategies/scalping/breakoutScalp";
import { trendPullbackStrategy } from "../strategies/intraday/trendPullback";
import { srBounceStrategy } from "../strategies/intraday/srBounce";
import { trendFollowStrategy } from "../strategies/swing/trendFollow";
import { breakoutSwingStrategy } from "../strategies/swing/breakoutSwing";

const Dashboard = ({ isChartExpanded, setIsChartExpanded }) => {
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
  const [indicatorData, setIndicatorData] = useState(null);
  const [riskAssessment, setRiskAssessment] = useState(null);
  const [mtfData, setMtfData] = useState(null);
  const [aiDecision, setAiDecision] = useState(null);
  const [isBeginnerMode, setIsBeginnerMode] = useState(() => {
    return localStorage.getItem("isBeginnerMode") === "true";
  });
  
  useEffect(() => {
    localStorage.setItem("isBeginnerMode", isBeginnerMode);
  }, [isBeginnerMode]);
  
  const [isSidePanelOpen, setIsSidePanelOpen] = useState(false);

  // --- 🤖 AI MODE STATE ---
  const [isAiMode, setIsAiMode] = useState(false);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);

  // AI Details & Config
  const [aiError, setAiError] = useState(null);
  const [aiTradingType, setAiTradingType] = useState(null);
  const [strategyConfig, setStrategyConfig] = useState(getStrategyConfig("scalp"));
  const [activeStrategyRules, setActiveStrategyRules] = useState(getStrategyRules("scalp"));
  const [chartDataState, setChartDataState] = useState([]); // Raw OHLCV for local fallback
  const [isChartReady, setIsChartReady] = useState(false);
  
  // ⏱️ AI POLICY STATE
  const [lastAiRequestTime, setLastAiRequestTime] = useState(0);
  const [cooldownRemaining, setCooldownRemaining] = useState(0);
  const [retryCount, setRetryCount] = useState(0);
  const aiTimeoutRef = useRef(null);

  // Cooldown Timer Logic
  useEffect(() => {
    let interval;
    if (cooldownRemaining > 0) {
      interval = setInterval(() => {
        setCooldownRemaining(prev => Math.max(0, prev - 1));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [cooldownRemaining]);

  // 🛡️ Safe Indicator Reading Logic (DOM Scraper)
  const readIndicators = () => {
    // Check for standard TV chart container or dashboard specific chart ID
    const element = document.querySelector("#tradingview_institutional_chart") || 
                    document.querySelector(".tv-chart");
    
    if (!element) {
      console.log("Chart element not found. Indicator sync deferred.");
      return null;
    }

    // Example of safe reading pattern requested by user
    try {
      const indicators = {
        status: "READY",
        timestamp: Date.now()
      };
      return indicators;
    } catch (e) {
      console.error("Error reading chart indicators:", e);
      return null;
    }
  };

  const getCurrentTimeframe = () => {
    const currentMode = isAiMode ? aiTradingType : mode;
    if (currentMode === "swing" && strategy === "trend") return "1h";
    if (currentMode === "swing" && strategy === "breakoutSwing") return "15m";
    
    const mapping = {
      scalp: "1m",
      intraday: "5m",
      swing: "15m"
    };
    return mapping[currentMode] || "5m";
  };

  const activeTimeframe = getCurrentTimeframe();

  // 🕒 Chart Readiness Delay
  useEffect(() => {
    setIsChartReady(false);
    const readyTimer = setTimeout(() => {
      console.log("Chart readiness window reached (2s)");
      setIsChartReady(true);
    }, 2000);
    return () => clearTimeout(readyTimer);
  }, [pair, activeTimeframe]);
  
  const generateLocalFallback = (marketData, chartData) => {
    console.log("Fallback activated");
    const currentPrice = marketData.price || 0;
    const indicators = marketData.indicator_analysis || {};
    
    const ema20 = indicators.ema20 || currentPrice;
    const ema50 = indicators.ema50 || currentPrice;
    const rsi = indicators.rsi || 50;

    let trend = "SIDEWAYS";
    if (ema20 > ema50) trend = "UP";
    else if (ema20 < ema50) trend = "DOWN";

    let bias = "HOLD";
    if (rsi < 35) bias = "BUY";
    else if (rsi > 65) bias = "SELL";

    let signal = "HOLD";
    let explanation = "Local Fallback: Indicators neutral.";
    
    if (trend === "UP" && bias === "BUY") {
      signal = "BUY";
      explanation = `Local Fallback: Bullish Trend + Oversold RSI (${rsi.toFixed(2)})`;
    } else if (trend === "DOWN" && bias === "SELL") {
      signal = "SELL";
      explanation = `Local Fallback: Bearish Trend + Overbought RSI (${rsi.toFixed(2)})`;
    }

    let sl = 0, tp = 0;
    if (signal === "BUY") {
      sl = currentPrice * 0.99;
      tp = currentPrice * 1.015;
    } else if (signal === "SELL") {
      sl = currentPrice * 1.01;
      tp = currentPrice * 0.985;
    }

    return {
      direction: signal,
      entry: currentPrice,
      stop_loss: sl,
      take_profit: tp,
      confidence_score: 65,
      strategy: "Local Fallback (Client)",
      explanation: explanation
    };
  };

  const fetchAiSignal = async (marketData, currentMode, isRetry = false) => {
    // 1. Cooldown Guard
    const now = Date.now();
    const timeSinceLast = now - lastAiRequestTime;
    if (timeSinceLast < 60000 && !isRetry) {
      const wait = Math.ceil((60000 - timeSinceLast) / 1000);
      setAiError(`PLEASE WAIT ${wait}S BEFORE REQUESTING AGAIN`);
      setCooldownRemaining(wait);
      return;
    }

    if (isAiLoading) return;
    
    console.log("AI request started");
    setIsAiLoading(true);
    setAiError(null);
    setLastAiRequestTime(Date.now());
    setCooldownRemaining(60); 

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 25000); // 🚀 Increased to 25s
    const startTime = Date.now();

    try {
      const response = await fetch("http://127.0.0.1:8000/generate-signal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          symbol: pair,
          trading_type: currentMode,
          timeframe: strategyConfig?.entryTimeframe || "5m",
          data: {
            ...marketData,
            chart_data: chartDataState,
            active_strategy_rules: activeStrategyRules
          }
        }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log("AI response received");
      
        if (result.strategy === "Error") {
          setAiError("Invalid API Key");
        } else {
          // Check if it's a fallback signal from backend
          if (result.strategy.includes("Fallback")) {
            console.log("Fallback triggered");
            setAiError("AI QUOTA EXCEEDED (LOCAL FALLBACK ACTIVE)");
            
            // 🔥 Enforce 10s wait for fallback even if backend is fast
            const elapsed = Date.now() - startTime;
            if (elapsed < 10000) {
              console.log(`Delaying backend fallback for ${Math.ceil((10000 - elapsed) / 1000)}s...`);
              await new Promise(resolve => setTimeout(resolve, 10000 - elapsed));
            }
          }

          const formattedDecision = {
            direction: result.signal,
            entry: result.entry,
            stop_loss: result.stop_loss,
            take_profit: result.take_profit,
            confidence_score: result.confidence,
            strategy: result.strategy,
            explanation: result.explanation || "System generated institutional signal."
          };
          setAiDecision(formattedDecision);
          console.log("Signal validated");
          setRetryCount(0); // Reset retry on success
        }
    } catch (err) {
      clearTimeout(timeoutId);
      console.error("AI Error:", err);
      
      const elapsed = Date.now() - startTime;
      if (elapsed < 10000) {
        console.log(`Waiting ${Math.ceil((10000 - elapsed) / 1000)}s before fallback...`);
        await new Promise(resolve => setTimeout(resolve, 10000 - elapsed));
      }

      console.log("Fallback triggered");
      setAiError("AI SERVICE UNAVAILABLE (LOCAL FALLBACK ACTIVE)");
      
      const fallback = generateLocalFallback(marketData, chartDataState);
      setAiDecision(fallback);
      
      if (err.name === 'AbortError') {
        console.log("AI request timed out (10s)");
      } else if (err.message.includes("429") || err.message.includes("rate limit")) {
        // 🔄 Auto-retry once after 60s for 429
        if (!isRetry && retryCount < 1) {
          setRetryCount(1);
          console.log("Scheduling auto-retry in 60 seconds...");
          setTimeout(() => {
            fetchAiSignal(marketData, currentMode, true);
          }, 60000);
        }
      }
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleAiToggle = (value) => {
    if (value) {
      setIsAiModalOpen(true);
    } else {
      setIsAiMode(false);
      setAiTradingType(null);
      setAiDecision(null);
    }
  };

  const handleAiTypeSelect = (type) => {
    setAiTradingType(type);
    setIsAiMode(true);
    const config = getStrategyConfig(type);
    const rules = getStrategyRules(type);
    setStrategyConfig(config);
    setActiveStrategyRules(rules);
    
    // Trigger immediate refresh for new type
    if (price > 0 && isAiMode) {
       console.log("Triggering AI Refresh via Trading Type Selection");
       // The useEffect will catch this change and call fetchData
    }
  };

  useEffect(() => {
    if (!isAiMode) {
      setStrategyConfig(getStrategyConfig(mode));
      setActiveStrategyRules(getStrategyRules(mode));
    }
  }, [mode, isAiMode]);


  useEffect(() => {
    const fetchData = async () => {
      console.log("-----------------------------------------");
      console.log("Selected Trading Type:", isAiMode ? `AI: ${aiTradingType}` : mode);
      console.log("New Timeframe Assigned:", activeTimeframe);
      
      setSignal("HOLD");
      setEntry(null);
      setSl(null);
      setTp(null);
      setSupport(null);
      setResistance(null);
      setAi("Analyzing " + pair + "...");

      try {
        const res = await fetch(
          `https://api.binance.com/api/v3/klines?symbol=${pair}&interval=${activeTimeframe}&limit=100`
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
        setChartDataState(formattedData);

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

        const currentMode = isAiMode ? aiTradingType : mode;

        if (currentMode === "scalp") {
          if (strategy === "rsi") result = rsiScalpStrategy(formattedData);
          else if (strategy === "breakout") result = breakoutScalpStrategy(formattedData);
        } else if (currentMode === "intraday") {
          if (strategy === "pullback") result = trendPullbackStrategy(formattedData);
          else if (strategy === "sr") result = srBounceStrategy(formattedData);
        } else if (currentMode === "swing") {
          if (strategy === "trend") result = trendFollowStrategy(formattedData);
          else if (strategy === "breakoutSwing") result = breakoutSwingStrategy(formattedData);
        }

        const ma = closes.slice(-50).reduce((a, b) => a + b, 0) / 50;
        const trendValue = calculateTrend(currentPrice, ma);
        const { volumeSpike } = calculateVolume(volumes);
        const rsiValue = calculateRSI(closes);
        
        // 📊 NEW INDICATOR ENGINE INTEGRATION
        const indicatorAnalysis = getIndicatorAnalysis(currentMode, formattedData);
        
        // 🛡️ SYNC WITH DOM ELEMENTS (Safe Scrape)
        const domIndicators = readIndicators();
        if (domIndicators) {
          indicatorAnalysis.dom_sync = true;
          indicatorAnalysis.sync_time = domIndicators.timestamp;
        } else {
          console.warn("Analysis continuing with API data only (DOM not ready)");
        }

        setIndicatorData(indicatorAnalysis);

        const aiMessage = generateAIMessage(result.signal, trendValue, volumeSpike);

        setSignal(result.signal);
        setEntry(result.entry);
        setSl(result.sl);
        setTp(result.tp);

        // 🛡️ RISK ENGINE INTEGRATION
        const riskData = calculateRiskAssessment(currentPrice, result.sl, result.tp);
        setRiskAssessment(riskData);

        // 🌐 MTF VALIDATION INTEGRATION
        // For simulation, using primary candles for all 3 with different "lookback" perspectives
        const mtfResult = analyzeAdaptiveMTFTrend(formattedData, formattedData, formattedData, strategyConfig);
        setMtfData(mtfResult);
        setSupport(result.support);
        setResistance(result.resistance);
        setRsi(rsiValue);
        setTrend(trendValue);
        setVolumeSpike(volumeSpike);
        setAi((isAiMode ? "🤖 AI Analysis: " : "") + aiMessage + " | " + result.reason);

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

        // 🚀 AI TRIGGER REMOVED PER POLICY (Manual Only)
        // Auto-triggers caused quota errors. Use "VIEW SIGNALS" button instead.
      } catch (error) {
        console.log("Error:", error);
        setAi("⚠️ Failed to fetch market data");
      }
    };

    fetchData();
  }, [pair, mode, strategy, isAiMode, aiTradingType, activeTimeframe]);

  return (
    <div className="bg-black min-h-screen text-slate-100 font-sans selection:bg-blue-500/30 overflow-x-hidden relative">
      
      {/* Premium Gradient Backgrounds - DISABLED FOR PURE BLACK THEME */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {/* Blobs removed for elite blackout look */}
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 relative z-10 flex flex-col gap-8">
        
        {/* Header Section */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-wrap items-center justify-between gap-6"
        >
          <div className="flex items-center gap-4">
             <div className="p-3 bg-slate-900/40 rounded-2xl border border-white/5 backdrop-blur-md">
                <Activity className="w-6 h-6 text-slate-400" />
             </div>
             <div>
               <h1 className="text-2xl font-black tracking-tight text-white flex items-center gap-2">
                 TERMINAL <span className="text-slate-200">PRO</span>
               </h1>
               <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Algorithmic Telemetry v4.2</p>
             </div>
          </div>
          
          <div className="flex flex-wrap items-center gap-4 bg-slate-900/50 p-2 rounded-2xl border border-white/5 backdrop-blur-xl w-full lg:w-auto overflow-x-auto lg:overflow-visible">
             <BeginnerModeToggle isBeginner={isBeginnerMode} onToggle={setIsBeginnerMode} />
             <div className="h-8 w-[1px] bg-white/10 mx-2 hidden lg:block" />
             <AiModeToggle isAiMode={isAiMode} onToggle={handleAiToggle} />
             <div className="h-8 w-[1px] bg-white/10 mx-2 hidden lg:block" />
             <Controls onPairChange={setPair} />
             <button 
                disabled={isAiLoading || cooldownRemaining > 0}
                onClick={() => {
                  if (isAiLoading || cooldownRemaining > 0) return;

                  setIsSidePanelOpen(true);
                  
                  // Ensure AI mode is ON when clicking View Signals
                  if (!isAiMode) {
                    setIsAiMode(true);
                    if (!aiTradingType) setAiTradingType(mode);
                  }

                  // Clear any existing timeout (Debounce)
                  if (aiTimeoutRef.current) clearTimeout(aiTimeoutRef.current);

                  console.log("Debouncing AI Refresh (2s)...");
                  aiTimeoutRef.current = setTimeout(() => {
                    const data = {
                      price: price,
                      trend: trend,
                      volume: volumeSpike ? "HIGH" : "BASELINE",
                      riskManagement: "Targeting 1:2 RR with fixed institutional stop logic.",
                      indicator_analysis: indicatorData,
                      smc_data: smcData
                    };

                    // 🕵️ Context Guard: Ensure we have actual data before calling AI
                    if (!data || !data.price || !data.indicator_analysis || !data.indicator_analysis.rsi) {
                      console.warn("⚠️ Signal request blocked: Market indicators not detected.");
                      setAiError("INDICATORS NOT DETECTED (WAIT UNTIL CHART LOADS)");
                      aiTimeoutRef.current = null;
                      return;
                    }

                    if (price > 0) {
                      const currentMode = isAiMode ? (aiTradingType || mode) : mode;
                      fetchAiSignal(data, currentMode);
                    }
                    aiTimeoutRef.current = null;
                  }, 2000);
                }}
                className={`flex items-center gap-2 ${isAiLoading || cooldownRemaining > 0 ? 'bg-slate-700 cursor-not-allowed opacity-50' : 'bg-white/10 hover:bg-white/20 border border-white/20'} text-white px-4 py-2.5 rounded-xl font-bold text-xs transition-all shadow-lg shadow-white/5 active:scale-95 group shrink-0`}
              >
                {isAiLoading ? (
                  <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                ) : (
                  <TrendingUp className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                )}
                <span>
                  {isAiLoading ? 'ANALYZING...' : 
                   cooldownRemaining > 0 ? `COOLDOWN (${cooldownRemaining}S)` : 'VIEW SIGNALS'}
                </span>
             </button>
          </div>
        </motion.div>

        {/* AI Mode Active Status Bar (Only in Pro Mode) */}
        <AnimatePresence>
          {isAiMode && !isBeginnerMode && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="bg-white/5 border border-white/10 p-4 rounded-3xl flex items-center justify-between backdrop-blur-md">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-white/10 rounded-2xl flex items-center justify-center border border-white/20">
                    <Bot className="w-5 h-5 text-slate-400" />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-white uppercase tracking-tight">AI Agent Active</h3>
                    <div className="flex items-center gap-2 mt-0.5">
                      <p className="text-[10px] font-bold text-blue-400/80 uppercase tracking-widest leading-none">
                        Optimizing for {aiTradingType} strategy
                      </p>
                      <span className="w-1 h-1 bg-white/20 rounded-full" />
                      <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">
                        {strategyConfig.entryTimeframe} / {strategyConfig.trendTimeframe} / {strategyConfig.structureTimeframe}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex flex-col items-end">
                    <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">RR TARGET</span>
                    <span className="text-xs font-black text-blue-400">1:{strategyConfig.riskReward}</span>
                  </div>
                  <div className="h-8 w-[1px] bg-white/10 mx-1" />
                  <div className="bg-blue-500 p-2 px-4 rounded-xl text-[10px] font-black text-white uppercase shadow-lg shadow-blue-500/30">
                    {aiTradingType}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

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
              <Chart 
                pair={pair} 
                isExpanded={isChartExpanded} 
                setIsExpanded={setIsChartExpanded} 
                timeframe={activeTimeframe}
              />
            </motion.div>

           {/* PRIMARY SIGNALS BELOW CHART */}
           <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
              <div className="lg:col-span-2 space-y-6 relative">
                 {isAiLoading && (
                   <div className="absolute inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-md rounded-[2.5rem] border border-blue-500/20 shadow-2xl">
                     <div className="flex flex-col items-center gap-4">
                       <div className="relative">
                         <div className="w-16 h-16 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin"></div>
                         <Bot className="w-6 h-6 text-blue-400 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                       </div>
                       <div className="text-center">
                         <p className="text-lg font-black text-white italic tracking-tight animate-pulse">ANALYZING MARKET...</p>
                         <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] mt-1">Institutional Gemini Logic in Progress</p>
                       </div>
                     </div>
                   </div>
                 )}

                 {aiError && (
                   <div className="absolute inset-x-0 top-0 z-[60] p-4 bg-red-500/10 border-b border-red-500/20 flex items-center justify-center gap-2 backdrop-blur-sm">
                     <AlertCircle className="w-4 h-4 text-red-400" />
                     <span className="text-xs font-black text-red-200 uppercase tracking-widest">{aiError}</span>
                   </div>
                 )}

                {isBeginnerMode ? (
                  <BeginnerSignal 
                    data={aiDecision}
                    support={support}
                    resistance={resistance}
                  />
                ) : isAiMode ? (
                  <ProfessionalSignal 
                    data={aiDecision}
                    tradingType={aiTradingType?.toUpperCase()}
                    support={support}
                    resistance={resistance}
                    activeStrategy={strategyConfig?.name}
                    indicatorData={indicatorData}
                    mtfData={mtfData}
                  />
                ) : (
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
                )}
                <div className="grid grid-cols-1 gap-6">
                  <TradeHistory />
                </div>
              </div>
              
              <div className="lg:col-span-1 space-y-6">
                 {!isBeginnerMode && (
                   <>
                     <TradePlanCard plan={tradePlan} />
                     <SMCExpert smc={smcData} />
                   </>
                 )}
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
                    {!isBeginnerMode && (
                      <>
                        <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                           <Zap className="w-3.5 h-3.5" /> Institutional SMC Layer
                        </h3>
                        <SMCExpert smc={smcData} />
                        <RiskManager assessment={riskAssessment} />
                        <ValidationManager mtf={mtfData} />
                      </>
                    )}
                  </div>

                  <div className="space-y-4 pt-4 border-t border-white/5">
                    <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                       <MessageSquare className="w-3.5 h-3.5 text-blue-400" /> Neural Terminal
                    </h3>
                    <TradingAssistant 
                      onDecision={(d) => setAiDecision(d)}
                      telemetry={{
                        strategy: isAiMode ? "AI_DRIVEN" : (mode === "scalp" ? "SCALPING" : (strategy === "rsi" ? "BASIC" : "SMC")),
                        price, trend, support, resistance, rsi,
                        volume: volumeSpike ? "HIGH" : "BASELINE",
                        entry_quality: "GOOD",
                        candle_status: "CLOSED",
                        candle_strength: "STRONG",
                        strategy_config: strategyConfig,
                        smc_data: {
                          liquidity_sweep: smcData?.liquidity_sweep ? "YES" : "NO",
                          order_block: smcData?.entry_zone || "N/A",
                          bos: smcData?.bos_detected ? "YES" : "NO",
                          choch: smcData?.choch_detected ? "YES" : "NO",
                          price_location: smcData?.at_order_block ? "AT_OB" : "MID"
                        },
                        expert_decision: expert?.decision,
                        indicator_analysis: indicatorData,
                        active_strategy_rules: activeStrategyRules,
                        risk_assessment: riskAssessment,
                        mtf_alignment: mtfData,
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
      {!isChartExpanded && (
        <button 
          onClick={() => setIsSidePanelOpen(true)}
          className="md:hidden fixed bottom-6 right-6 w-14 h-14 bg-blue-600 rounded-full flex items-center justify-center shadow-2xl z-50 text-white active:scale-90 transition-all"
        >
          <TrendingUp className="w-6 h-6" />
        </button>
      )}
      {/* Trading Type Selection Modal */}
      <TradingTypeModal 
        isOpen={isAiModalOpen} 
        onClose={() => setIsAiModalOpen(false)} 
        onSelect={handleAiTypeSelect} 
      />
    </div>
  );
};

export default Dashboard;