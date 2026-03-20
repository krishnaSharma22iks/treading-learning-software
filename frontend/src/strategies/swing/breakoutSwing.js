export function breakoutSwingStrategy(data) {
  const closes = data.map((d) => d.close);
  const volumes = data.map((d) => d.volume);

  const price = closes[closes.length - 1];
  const prevPrice = closes.length > 1 ? closes[closes.length - 2] : price;

  const resistance = Math.max(...closes.slice(-51, -1));
  const support = Math.min(...closes.slice(-51, -1));

  const avgVol = volumes.slice(-31, -1).reduce((a, b) => a + b, 0) / 30;
  const currentVol = volumes[volumes.length - 1];

  let signal = "HOLD", entry = null, sl = null, tp = null, reason = "";

  // Approximation of Average True Range given limited data structure
  const atrProxy = closes.slice(-14).map((c, i, arr) => i > 0 ? Math.abs(c - arr[i-1]) : 0).reduce((a, b) => a + b, 0) / 14 || (price * 0.01);

  if (prevPrice <= resistance && price > resistance && currentVol > avgVol * 1.5) {
    signal = "BUY";
    entry = price;
    sl = price - (atrProxy * 2); // 2 ATR for swing SL
    tp = price + (price - sl) * 3;
    reason = "Swing breakout with volume";
  }

  if (prevPrice >= support && price < support && currentVol > avgVol * 1.5) {
    signal = "SELL";
    entry = price;
    sl = price + (atrProxy * 2);
    tp = price - (sl - price) * 3;
    reason = "Swing breakdown with volume";
  }

  return { signal, entry, sl, tp, reason, support, resistance };
}