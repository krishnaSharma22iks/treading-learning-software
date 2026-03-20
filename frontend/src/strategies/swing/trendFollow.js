export function trendFollowStrategy(data) {
  const closes = data.map((d) => d.close);
  const price = closes[closes.length - 1];

  const maFastLength = 20;
  const maSlowLength = 100;
  
  const maFast = closes.slice(-maFastLength).reduce((a, b) => a + b, 0) / Math.min(closes.length, maFastLength);
  const maSlow = closes.slice(-maSlowLength).reduce((a, b) => a + b, 0) / Math.min(closes.length, maSlowLength);

  let signal = "HOLD", entry = null, sl = null, tp = null, reason = "";

  const atrProxy = closes.slice(-14).map((c, i, arr) => i > 0 ? Math.abs(c - arr[i-1]) : 0).reduce((a, b) => a + b, 0) / 14 || (price * 0.01);

  // Wait for crossover plus price agreement
  if (maFast > maSlow && price > maFast) {
    signal = "BUY";
    entry = price;
    sl = price - (atrProxy * 2.5);
    tp = price + (atrProxy * 5); // 1:2 risk reward based on ATR proxy
    reason = "Swing uptrend confirmed by MAs";
  }

  if (maFast < maSlow && price < maFast) {
    signal = "SELL";
    entry = price;
    sl = price + (atrProxy * 2.5);
    tp = price - (atrProxy * 5);
    reason = "Swing downtrend confirmed by MAs";
  }

  // Removing support & resistance from returned object because they are not used/defined in this strategy
  return { signal, entry, sl, tp, reason };
}