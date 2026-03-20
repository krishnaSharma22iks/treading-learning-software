export async function getAISignal(data) {
  const { price, rsi } = data;

  if (rsi < 40) {
    return {
      signal: "BUY",
      entry: "Pullback ka wait karo",
      sl: price - 100,
      tp: price + 200,
      reason: "Market oversold hai, bullish reversal possible hai",
    };
  }

  if (rsi > 60) {
    return {
      signal: "SELL",
      entry: "Retest ke baad entry lo",
      sl: price + 100,
      tp: price - 200,
      reason: "Market overbought hai, correction aa sakta hai",
    };
  }

  return {
    signal: "HOLD",
    entry: "Abhi wait karo, clear trend nahi hai",
    sl: null,
    tp: null,
    reason: "Market sideways hai (RSI mid zone)",
  };
}