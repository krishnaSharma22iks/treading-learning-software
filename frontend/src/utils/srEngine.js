/**
 * Advanced Adaptive Support and Resistance Engine
 * Calculates price levels based on lookback and structural context.
 */

/**
 * Finds pivot highs and lows (Swing Highs and Lows)
 * @param {Array} closes 
 * @param {number} leftBars 
 * @param {number} rightBars 
 */
const findPivots = (closes, leftBars = 2, rightBars = 2) => {
  const pivots = { highs: [], lows: [] };
  
  for (let i = leftBars; i < closes.length - rightBars; i++) {
    const current = closes[i];
    const leftSlice = closes.slice(i - leftBars, i);
    const rightSlice = closes.slice(i + 1, i + 1 + rightBars);
    
    // Pivot High
    if (current > Math.max(...leftSlice) && current > Math.max(...rightSlice)) {
      pivots.highs.push(current);
    }
    
    // Pivot Low
    if (current < Math.min(...leftSlice) && current < Math.min(...rightSlice)) {
      pivots.lows.push(current);
    }
  }
  
  return pivots;
};

/**
 * Detects SR Zones and Levels
 * @param {Object} params { type, data, currentPrice }
 */
export const calculateAdvancedSR = (type, data, currentPrice) => {
  if (!data || data.length === 0) return { support: null, resistance: null, zones: [] };

  const closes = data.map((d) => d.close || d);
  let lookback = 30; // Default: Scalping

  if (type.toLowerCase() === "intraday") lookback = 200;
  if (type.toLowerCase() === "swing") lookback = 500;

  const relevantData = closes.slice(-lookback);
  
  // Basic Levels
  const support = Math.min(...relevantData);
  const resistance = Math.max(...relevantData);

  // Pivot-based Near Levels
  const pivots = findPivots(relevantData, 3, 3);
  
  // Nearest Support (below price)
  const nearestS = pivots.lows
    .filter(val => val < currentPrice * 0.999)
    .sort((a, b) => b - a)[0] || support;
    
  // Nearest Resistance (above price)
  const nearestR = pivots.highs
    .filter(val => val > currentPrice * 1.001)
    .sort((a, b) => a - b)[0] || resistance;

  // Zones (Approximate structural zones)
  const zones = [
    { type: "SUPPORT", level: nearestS, strength: "MEDIUM" },
    { type: "RESISTANCE", level: nearestR, strength: "MEDIUM" }
  ];

  if (type.toLowerCase() === "swing") {
    zones[0].strength = "STRONG_STRUCTURAL";
    zones[1].strength = "STRONG_STRUCTURAL";
  }

  return {
    support: nearestS,
    resistance: nearestR,
    zones,
    lookback
  };
};
