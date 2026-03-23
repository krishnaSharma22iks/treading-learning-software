/**
 * Analyzes moving average alignment across multiple timeframes.
 * Returns the majority overall trend and the breakdown per timeframe.
 * 
 * @param {Array} data5m - Array of OHLC objects for the 5-minute timeframe
 * @param {Array} data15m - Array of OHLC objects for the 15-minute timeframe
 * @param {Array} data1h - Array of OHLC objects for the 1-hour timeframe
 * @returns {Object} Trend analysis summary
 */
export function analyzeAdaptiveMTFTrend(dataEntry, dataTrend, dataStructure, config) {
  const getTrend = (data) => {
    if (!data || data.length < 50) return "SIDEWAYS";
    const closes = data.map(d => d.close || d);
    const price = closes[closes.length - 1];
    const ma50 = closes.slice(-50).reduce((a, b) => a + b, 0) / 50;
    
    if (price > ma50 * 1.001) return "UP";
    if (price < ma50 * 0.999) return "DOWN";
    return "SIDEWAYS";
  };

  const trendE = getTrend(dataEntry);
  const trendT = getTrend(dataTrend);
  const trendS = getTrend(dataStructure);

  const isAligned = (trendE === trendT && trendT === trendS && trendE !== "SIDEWAYS");
  const isConflict = (trendE !== trendS && trendE !== "SIDEWAYS" && trendS !== "SIDEWAYS");

  let status = "NEUTRAL";
  if (isAligned) status = "ALIGNED_STRONG";
  else if (isConflict) status = "CONFLICT_CRITICAL";
  else if (trendE !== "SIDEWAYS") status = "MISMATCH_WEAK";

  return {
    status,
    overallTrend: trendT, // Core trend usually middle TF
    breakdown: {
      entry: { tf: config?.entryTimeframe || 'Entry', trend: trendE },
      trend: { tf: config?.trendTimeframe || 'Trend', trend: trendT },
      structure: { tf: config?.structureTimeframe || 'Structure', trend: trendS }
    }
  };
}
