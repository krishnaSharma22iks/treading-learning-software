import { 
  calculateEMA, 
  calculateVWAP, 
  calculateRSI, 
  calculateMA
} from "./indicators";
import { calculateAdvancedSR } from "./srEngine";
import { calculateVolume } from "./extraIndicators";

/**
 * Technical Indicator Orchestration Engine
 * Load and calculate indicators based on trading strategy type.
 */
export const getIndicatorAnalysis = (type, data) => {
  if (!data || data.length === 0) return {};

  const closes = data.map((d) => d.close || d);
  const volumes = data.map((d) => d.volume);
  const currentPrice = closes[closes.length - 1];

  const ema20 = calculateEMA(closes, 20);
  const ema50 = calculateEMA(closes, 50);
  
  let trend = "SIDEWAYS";
  if (ema20 > ema50) trend = "UP";
  else if (ema20 < ema50) trend = "DOWN";

  const results = {
    price: currentPrice,
    rsi: calculateRSI(closes),
    volume: calculateVolume(volumes),
    ema20,
    ema50,
    trend
  };

  switch (type.toLowerCase()) {
    case "scalp":
      return {
        ...results,
        ema9: calculateEMA(closes, 9),
        ema21: calculateEMA(closes, 21),
        vwap: calculateVWAP(data),
        ...calculateAdvancedSR("scalp", data, currentPrice),
        type: "SCALPING_LAYER",
      };

    case "intraday":
      return {
        ...results,
        ...calculateAdvancedSR("intraday", data, currentPrice),
        type: "INTRADAY_LAYER",
      };

    case "swing":
      return {
        ...results,
        ema200: calculateEMA(closes, 200),
        marketStructure: currentPrice > calculateMA(closes, 100) ? "BULLISH" : "BEARISH",
        ...calculateAdvancedSR("swing", data, currentPrice),
        type: "SWING_LAYER",
      };

    default:
      return results;
  }
};
