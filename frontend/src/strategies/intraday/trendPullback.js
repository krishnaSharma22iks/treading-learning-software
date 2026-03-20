export function trendPullbackStrategy(data) {
  const closes = data.map((d) => d.close);
  const price = closes[closes.length - 1];
  const highs = data.map((d) => d.high || d.close);
  const lows = data.map((d) => d.low || d.close);

  const ma = closes.slice(-50).reduce((a, b) => a + b, 0) / 50;

  const support = Math.min(...lows.slice(-31, -1));
  const resistance = Math.max(...highs.slice(-31, -1));

  let signal = "HOLD", entry = null, sl = null, tp = null, reason = "";

  // Buffer slightly below support/resistance for SL (0.2%)
  const buffer = price * 0.002;

  // 50 MA indicates trend; we look for a minor pullback and a bullish move today
  if (closes.length > 1 && ma < price && closes[closes.length - 2] <= support * 1.01 && price > closes[closes.length - 2]) {
    signal = "BUY";
    entry = price;
    sl = support - buffer;
    tp = price + (price - sl) * 2;
    reason = "Bullish pullback in uptrend";
  }

  if (closes.length > 1 && ma > price && closes[closes.length - 2] >= resistance * 0.99 && price < closes[closes.length - 2]) {
    signal = "SELL";
    entry = price;
    sl = resistance + buffer;
    tp = price - (sl - price) * 2;
    reason = "Bearish pullback in downtrend";
  }

  return { signal, entry, sl, tp, reason, support, resistance };
}