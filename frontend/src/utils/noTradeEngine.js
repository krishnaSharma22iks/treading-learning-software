/**
 * Institutional No-Trade Detection Engine
 * Local pre-filtering to prevent low-probability entries.
 */

export const detectNoTradeConditions = (indicators, risk) => {
  const rejections = [];
  
  if (indicators.marketStructure === "SIDEWAYS" || indicators.trend === "SIDEWAYS") {
    rejections.push({ factor: "Market Structure", reason: "Consolidation detected. High risk of stop-hunt." });
  }
  
  if (indicators.rsi > 45 && indicators.rsi < 55) {
    rejections.push({ factor: "Momentum", reason: "RSI in neutral zone (45-55). No clear directional strength." });
  }
  
  if (risk && parseFloat(risk.rr) < 1.5) {
    rejections.push({ factor: "Risk/Reward", reason: `Poor RR (1:${risk.rr}). Does not meet institutional minimum of 1:1.5.` });
  }

  // Volume check (assuming indicatorData has a volume category)
  if (indicators.volume === "BASELINE") {
    rejections.push({ factor: "Volume", reason: "Institutional participation is absent. baseline volume detected." });
  }

  return {
    isNoTrade: rejections.length > 0,
    rejections
  };
};
