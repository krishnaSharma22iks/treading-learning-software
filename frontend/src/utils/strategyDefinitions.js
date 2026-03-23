/**
 * Institutional Strategy Definitions
 * Formal logic for Entry, Stop Loss, and Take Profit.
 */

export const STRATEGY_RULES = {
  scalp: {
    name: "Precision Scalping Layer",
    timeframes: ["1m", "5m", "15m"],
    indicators: ["EMA9", "EMA21", "RSI", "VWAP", "Volume"],
    entry: {
      condition: "EMA9 crosses above EMA21 AND RSI > 50 AND Volume Spike AND Price > VWAP",
      logic: (data, indicators) => {
        return indicators.ema9 > indicators.ema21 && 
               indicators.rsi > 50 && 
               indicators.volume?.volumeSpike && 
               indicators.price > indicators.vwap;
      }
    },
    exit: {
      stopLoss: "Below recent candle low",
      takeProfit: "1.5 Risk Reward Target"
    },
    riskManagement: "Maximum deviation 0.5% per trade"
  },
  
  intraday: {
    name: "Intraday Momentum Strategy",
    timeframes: ["5m", "15m", "1h"],
    indicators: ["EMA20", "EMA50", "RSI", "Support/Resistance"],
    entry: {
      condition: "Price > EMA50 AND RSI > 55 AND Support Bounce Confirmation",
      logic: (data, indicators) => {
        return indicators.price > indicators.ema50 && 
               indicators.rsi > 55 && 
               indicators.price > indicators.support;
      }
    },
    exit: {
      stopLoss: "Below defined support zone",
      takeProfit: "At nearest resistance zone"
    },
    riskManagement: "Standard institutional risk allocation"
  },
  
  swing: {
    name: "Structural Swing Core",
    timeframes: ["15m", "1h", "4h"],
    indicators: ["EMA50", "EMA200", "RSI", "Market Structure", "Order Blocks"],
    entry: {
      condition: "Trend Bullish AND Higher High Structure AND Support Retest",
      logic: (data, indicators) => {
        return indicators.marketStructure === "BULLISH" && 
               indicators.price > indicators.support;
      }
    },
    exit: {
      stopLoss: "Below major swing low",
      takeProfit: "Next major institutional resistance"
    },
    riskManagement: "Low leverage, structural conviction"
  }
};

/**
 * Returns rules for a specific strategy type
 */
export const getStrategyRules = (type) => {
  return STRATEGY_RULES[type.toLowerCase()] || STRATEGY_RULES.intraday;
};
