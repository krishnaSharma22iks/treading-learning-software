/**
 * Beginner-Friendly Language Translation Engine
 * Converts institutional jargon into simple, educational phrases.
 */

export const translateToBeginner = (term, type = "GENERAL") => {
  const dictionary = {
    DIRECTION: {
      BUY: "Market looks strong, consider buying 📈",
      SELL: "Market looks weak, consider selling 📉",
      "NO TRADE": "Wait, market is not clear ⏳",
    },
    TREND: {
      UP: "Market is moving upward 📈",
      DOWN: "Market is moving downward 📉",
      SIDEWAYS: "Market is moving randomly ↔️",
    },
    LEVELS: {
      SUPPORT: "Safe Buying Area",
      RESISTANCE: "Profit Booking Area",
    },
    METRICS: {
      CONFIDENCE: "Signal Strength",
      RISK: "Risk Warning",
    },
    TIPS: [
      "Tip: Never trade without a Stop Loss to protect your money.",
      "Tip: Wait for a clear signal before jumping into a trade.",
      "Tip: Trade with small amounts while you are learning.",
      "Tip: Trend is your friend—try to follow the market's direction.",
      "Tip: Patience is the most important tool for a trader."
    ]
  };

  if (type === "TIP") {
    return dictionary.TIPS[Math.floor(Math.random() * dictionary.TIPS.length)];
  }

  return dictionary[type]?.[term] || term;
};

export const getIndicatorTooltip = (key) => {
  const tooltips = {
    RSI: "Shows if the market is over-buying or over-selling.",
    EMA: "Shows the overall long-term direction of the market.",
    VOLUME: "Shows how much money and activity is in the market.",
  };
  return tooltips[key.toUpperCase()] || "N/A";
};
