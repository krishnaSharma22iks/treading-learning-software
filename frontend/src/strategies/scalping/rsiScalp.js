export function rsiScalpStrategy(data) {
  const closes = data.map((d) => d.close);
  const price = closes[closes.length - 1];

  const calculateRsi = (endIndex) => {
    if (endIndex < 14) return 50; // default for not enough data
    let gains = 0, losses = 0;
    for (let i = endIndex - 13; i <= endIndex; i++) {
      const diff = closes[i] - closes[i - 1];
      if (diff > 0) gains += diff;
      else losses -= diff;
    }
    const rs = gains / (losses === 0 ? 1 : losses);
    return 100 - 100 / (1 + rs);
  };

  const currentRsi = calculateRsi(closes.length - 1);
  const prevRsi = calculateRsi(closes.length - 2);

  let signal = "HOLD", entry = null, sl = null, tp = null, reason = "";
  
  const riskAmount = price * 0.002; // 0.2% risk

  // Wait for confirmation: RSI crossing back above 30
  if (prevRsi < 30 && currentRsi >= 30) {
    signal = "BUY";
    entry = price;
    sl = price - riskAmount;
    tp = price + (riskAmount * 2);
    reason = "RSI recovering from oversold";
  }

  // Wait for confirmation: RSI crossing back below 70
  if (prevRsi > 70 && currentRsi <= 70) {
    signal = "SELL";
    entry = price;
    sl = price + riskAmount;
    tp = price - (riskAmount * 2);
    reason = "RSI recovering from overbought";
  }

  // Support/Resistance deliberately removed as they aren't calculated in RSI scalp natively
  return { signal, entry, sl, tp, reason };
}