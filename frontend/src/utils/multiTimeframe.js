/**
 * Analyzes moving average alignment across multiple timeframes.
 * Returns the majority overall trend and the breakdown per timeframe.
 * 
 * @param {Array} data5m - Array of OHLC objects for the 5-minute timeframe
 * @param {Array} data15m - Array of OHLC objects for the 15-minute timeframe
 * @param {Array} data1h - Array of OHLC objects for the 1-hour timeframe
 * @returns {Object} Trend analysis summary
 */
export function analyzeMultiTimeframeTrend(data5m, data15m, data1h) {
  // Helper to determine the immediate trend of a dataset
  const getTrend = (data) => {
    if (!data || data.length < 50) return "SIDEWAYS";
    
    const closes = data.map(d => d.close || d); // Handles both raw numbers and objects safely
    const price = closes[closes.length - 1];
    
    // Calculate a 50-period simple moving average
    const ma50 = closes.slice(-50).reduce((a, b) => a + b, 0) / 50;
    
    // Add a tiny buffer (0.1%) to filter out flat sideways noise
    if (price > ma50 * 1.001) return "BULLISH";
    if (price < ma50 * 0.999) return "BEARISH";
    
    return "SIDEWAYS";
  };

  const trend5m = getTrend(data5m);
  const trend15m = getTrend(data15m);
  const trend1h = getTrend(data1h);

  // Group trends to quantify the majority
  let uptrendCount = 0;
  let downtrendCount = 0;

  const trends = [trend5m, trend15m, trend1h];
  trends.forEach(t => {
    if (t === "BULLISH") uptrendCount++;
    if (t === "BEARISH") downtrendCount++;
  });

  // Final trend determination based on alignment. 
  // Requires at least 2 of the 3 timeframes to agree for a directional call.
  let overallTrend = "SIDEWAYS";
  if (uptrendCount >= 2) overallTrend = "UPTREND";
  if (downtrendCount >= 2) overallTrend = "DOWNTREND";

  return {
    trend: overallTrend,
    timeframes: {
      "5m": trend5m,
      "15m": trend15m,
      "1h": trend1h
    }
  };
}
