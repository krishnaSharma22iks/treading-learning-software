export function breakoutScalpStrategy(data) {
  const closes = data.map((d) => d.close);
  const volumes = data.map((d) => d.volume);

  const price = closes[closes.length - 1];
  const prevPrice = closes.length > 1 ? closes[closes.length - 2] : price;

  // Resistance before the current candle
  const resistance = Math.max(...closes.slice(-21, -1));
  const support = Math.min(...closes.slice(-21, -1));

  const avgVol = volumes.slice(-21, -1).reduce((a, b) => a + b, 0) / 20;
  const currentVol = volumes[volumes.length - 1];

  let signal = "HOLD", entry = null, sl = null, tp = null, reason = "";

  // Dynamic risk percentage (0.2% for rapid scalp)
  const riskAmount = price * 0.002;

  // Ensure current candle crosses the resistance (it wasn't above it before)
  if (prevPrice <= resistance && price > resistance && currentVol > avgVol * 1.5) {
    signal = "BUY";
    entry = price;
    sl = price - riskAmount;
    tp = price + (riskAmount * 2); // 1:2 risk reward
    reason = "Breakout with volume (scalp)";
  }

  if (prevPrice >= support && price < support && currentVol > avgVol * 1.5) {
    signal = "SELL";
    entry = price;
    sl = price + riskAmount;
    tp = price - (riskAmount * 2);
    reason = "Breakdown with volume (scalp)";
  }

  return { signal, entry, sl, tp, reason, support, resistance };
}