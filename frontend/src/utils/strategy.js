export function analyzeMarket(data) {
  const closes = data.map((c) => c.close);
  const volumes = data.map((c) => c.volume);

  const price = closes[closes.length - 1];
  const prevPrice = closes[closes.length - 2];

  // 🔹 Support & Resistance
  const recent = closes.slice(-30);
  const support = Math.min(...recent);
  const resistance = Math.max(...recent);

  // 🔹 Trend (simple MA)
  const ma =
    closes.slice(-50).reduce((a, b) => a + b, 0) / 50;

  const trend = price > ma ? "UP" : "DOWN";

  // 🔹 RSI (simple)
  let gains = 0,
    losses = 0;
  for (let i = closes.length - 14; i < closes.length; i++) {
    const diff = closes[i] - closes[i - 1];
    if (diff > 0) gains += diff;
    else losses -= diff;
  }

  const rs = gains / losses;
  const rsi = 100 - 100 / (1 + rs);

  // 🔹 Volume spike
  const avgVolume =
    volumes.slice(-20).reduce((a, b) => a + b, 0) / 20;

  const currentVolume = volumes[volumes.length - 1];
  const volumeSpike = currentVolume > avgVolume * 1.5;

  // 🔹 Price Action (simple)
  const bullish = price > prevPrice;
  const bearish = price < prevPrice;

  // 🎯 FINAL DECISION

  let signal = "NO TRADE";
  let reason = "No clear setup";

  // ✅ BUY SETUP
  if (
    price <= support * 1.01 &&
    bullish &&
    trend === "UP" &&
    volumeSpike &&
    rsi < 40
  ) {
    signal = "BUY";
    reason = "Support bounce + bullish candle + volume spike";
  }

  // ✅ SELL SETUP
  else if (
    price >= resistance * 0.99 &&
    bearish &&
    trend === "DOWN" &&
    volumeSpike &&
    rsi > 60
  ) {
    signal = "SELL";
    reason = "Resistance rejection + bearish candle + volume spike";
  }

  // 🔥 BREAKOUT BUY
  else if (
    price > resistance &&
    volumeSpike &&
    trend === "UP"
  ) {
    signal = "BUY";
    reason = "Resistance breakout with volume";
  }

  // 🔥 BREAKDOWN SELL
  else if (
    price < support &&
    volumeSpike &&
    trend === "DOWN"
  ) {
    signal = "SELL";
    reason = "Support breakdown with volume";
  }

  return {
    signal,
    price,
    support,
    resistance,
    rsi,
    trend,
    volumeSpike,
    reason,
  };
}