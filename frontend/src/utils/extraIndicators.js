export function calculateTrend(price, ma) {
  if (price > ma) return "UPTREND 📈";
  if (price < ma) return "DOWNTREND 📉";
  return "SIDEWAYS";
}

export function calculateVolume(volumes) {
  const avg =
    volumes.slice(-20).reduce((a, b) => a + b, 0) / 20;

  const current = volumes[volumes.length - 1];

  return {
    volumeSpike: current > avg * 1.5,
    currentVolume: current,
  };
}

export function calculateRSI(closes, period = 14) {
  if (closes.length <= period) return 50;
  
  let gains = 0;
  let losses = 0;

  for (let i = 1; i <= period; i++) {
    const diff = closes[closes.length - i] - closes[closes.length - i - 1];
    if (diff > 0) gains += diff;
    else losses -= diff;
  }

  const avgGain = gains / period;
  const avgLoss = losses / period;

  if (avgLoss === 0) return 100;
  const rs = avgGain / avgLoss;
  return 100 - 100 / (1 + rs);
}

export function generateAIMessage(signal, trend, volumeSpike) {
  if (signal === "BUY") {
    return `BUY signal in ${trend}. ${
      volumeSpike ? "Strong volume confirms move 🚀" : "Volume weak ⚠️"
    }`;
  }

  if (signal === "SELL") {
    return `SELL signal in ${trend}. ${
      volumeSpike ? "Strong selling pressure 🔻" : "Weak confirmation ⚠️"
    }`;
  }

  return `No trade. Market is ${trend}. Wait for confirmation.`;
}