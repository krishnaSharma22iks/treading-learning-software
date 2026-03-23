/**
 * Institutional Strategy Mappings
 * Defines timeframes and Risk-Reward (RR) targets for each trading type.
 */
export const STRATEGY_MAPPINGS = {
  scalp: {
    label: "Scalping",
    entryTimeframe: "1m",
    trendTimeframe: "5m",
    structureTimeframe: "15m",
    riskReward: 1.5,
  },
  intraday: {
    label: "Intraday",
    entryTimeframe: "5m",
    trendTimeframe: "15m",
    structureTimeframe: "1h",
    riskReward: 2.0,
  },
  swing: {
    label: "Swing",
    entryTimeframe: "15m",
    trendTimeframe: "1h",
    structureTimeframe: "4h",
    riskReward: 2.5,
  },
};

/**
 * Returns the strategy configuration for a given trading type.
 * @param {string} type - 'scalp', 'intraday', or 'swing'
 * @returns {Object} Configuration object
 */
export const getStrategyConfig = (type) => {
  return STRATEGY_MAPPINGS[type.toLowerCase()] || STRATEGY_MAPPINGS.intraday;
};
