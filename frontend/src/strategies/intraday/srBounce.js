export function srBounceStrategy(data) {
  const closes = data.map((d) => d.close);
  const price = closes[closes.length - 1];
  const highs = data.map((d) => d.high || d.close); // fallback to close if high doesn't exist
  const lows = data.map((d) => d.low || d.close);

  // Using -31 to -1 to find support/resistance excluding current candle
  const support = Math.min(...lows.slice(-31, -1));
  const resistance = Math.max(...highs.slice(-31, -1));

  let signal = "HOLD", entry = null, sl = null, tp = null, reason = "";

  // Require a bullish close action off the support level
  if (closes.length > 1 && closes[closes.length - 2] <= support * 1.01 && price > closes[closes.length - 2]) {
    signal = "BUY";
    entry = price;
    sl = support - (price * 0.002); // buffer below support
    tp = price + (price - sl) * 2;
    reason = "Support bounce confirmed";
  }

  return { signal, entry, sl, tp, reason, support, resistance };
}

