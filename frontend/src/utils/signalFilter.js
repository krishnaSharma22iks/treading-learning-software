/**
 * Evaluates generated algorithm signals against market contexts to filter out fake-outs.
 * 
 * @param {Array} data - Array of OHLCV market data mapped up to the current perspective
 * @param {Object} rawSignal - The generated signal object { signal, entry, etc }
 * @returns {Object} { isValid, reason }
 */
export function filterFakeSignal(data, rawSignal) {
  // Pass automatically if no signal exists to filter
  if (!rawSignal || rawSignal.signal === "HOLD" || !rawSignal.signal) {
    return { isValid: false, reason: "No active signal" };
  }

  // Need sufficient lookback history to establish market context (MAs and Vol Avg)
  if (!data || data.length < 50) {
    return { isValid: true, reason: "Valid (Insufficient history to filter)" }; 
  }

  const closes = data.map(d => d.close || d);
  const volumes = data.map(d => d.volume || 0);
  const price = closes[closes.length - 1];
  const currentVol = volumes[volumes.length - 1];

  // 1. FILTER: Low Volume
  // If the current traded volume is beneath the 20-period average, the move lacks institutional strength
  const avgVol = volumes.slice(-21, -1).reduce((a, b) => a + b, 0) / 20;
  if (currentVol < avgVol) {
    return { isValid: false, reason: "Low volume" };
  }

  // 2. FILTER: Sideways Market
  // Calculate 50-period Simple Moving Average to determine trend
  const ma50 = closes.slice(-50).reduce((a, b) => a + b, 0) / 50;
  
  // If price is within a 0.1% deadzone threshold natively tracking the MA, it's considered flat/choppy
  const isSideways = Math.abs(price - ma50) / ma50 < 0.001; 
  if (isSideways) {
    return { isValid: false, reason: "Sideways" };
  }

  // 3. FILTER: No breakout confirmation
  // Even if a strategy generates a generic signal, verify it has mathematically escaped the recent 10-bar noise box
  const recentHigh = Math.max(...closes.slice(-11, -1));
  const recentLow = Math.min(...closes.slice(-11, -1));

  if (rawSignal.signal === "BUY") {
    if (price <= recentHigh) {
      return { isValid: false, reason: "No breakout" };
    }
  } else if (rawSignal.signal === "SELL") {
    if (price >= recentLow) {
      return { isValid: false, reason: "No breakout" };
    }
  }

  return { isValid: true, reason: "Valid confirmation" };
}
