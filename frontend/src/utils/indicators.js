// 🔹 RSI (FIXED + STABLE)
export function calculateRSI(data, period = 14) {
  if (data.length < period + 1) return 50;

  let gains = 0;
  let losses = 0;

  for (let i = data.length - period; i < data.length; i++) {
    let diff = data[i] - data[i - 1];
    if (diff > 0) gains += diff;
    else losses -= diff;
  }

  if (losses === 0) return 100;
  if (gains === 0) return 0;

  let rs = gains / losses;
  return 100 - 100 / (1 + rs);
}

// 🔹 Moving Average (SAFE)
export function calculateMA(data, period = 50) {
  if (data.length < period) return data[data.length - 1];

  const slice = data.slice(-period);
  const sum = slice.reduce((a, b) => a + b, 0);

  return sum / period;
}

// 🔹 Support & Resistance (IMPROVED)
export function calculateSupportResistance(data) {
  const recent = data.slice(-30);

  const support = Math.min(...recent);
  const resistance = Math.max(...recent);

  return { support, resistance };
}

// 🔹 SIGNAL LOGIC (SMART)
export function generateSignal(price, rsi, ma, support, resistance) {
  // BUY conditions
  if (
    price > ma &&        // uptrend
    rsi < 40 &&          // oversold
    price > support * 1.001 // support bounce
  ) {
    return "BUY";
  }

  // SELL conditions
  if (
    price < ma &&        // downtrend
    rsi > 60 &&          // overbought
    price < resistance * 0.999 // resistance rejection
  ) {
    return "SELL";
  }

  return "HOLD";
}

// 🔹 TRADE LEVELS (PRO RISK MANAGEMENT 🔥)
export function calculateSLTP(price, signal, support, resistance) {
  let entry = null;
  let sl = null;
  let tp = null;

  if (signal === "BUY") {
    entry = support * 1.002; // support ke thoda upar
    sl = support * 0.998;

    const risk = entry - sl;
    tp = entry + risk * 2; // 1:2 RR
  }

  if (signal === "SELL") {
    entry = resistance * 0.998; // resistance ke thoda niche
    sl = resistance * 1.002;

    const risk = sl - entry;
    tp = entry - risk * 2;
  }

  return { entry, sl, tp };
}

// 🔹 CONFIRMATION (NEW 🔥)
export function getConfirmation(price, rsi, ma, signal) {
  if (signal === "BUY") {
    if (price > ma && rsi < 40) {
      return "Strong BUY ✅";
    }
    return "Weak BUY ⚠️";
  }

  if (signal === "SELL") {
    if (price < ma && rsi > 60) {
      return "Strong SELL ✅";
    }
    return "Weak SELL ⚠️";
  }

  return "No Trade ❌";
}