/**
 * Validates trading signal accuracy by scanning future market movements against historical predictions.
 * 
 * @param {Array} historicalData - Array of OHLC continuous market data
 * @param {Array} signals - Array of logged signals containing { signal: "BUY"|"SELL", startIndex, sl?, tp? }
 * @returns {Object} Accuracy metrics detailing total signals, correct signals, and accuracy percentage
 */
export function validateSignalAccuracy(historicalData, signals) {
  let correctSignals = 0;
  let totalValidSignals = 0;

  signals.forEach((sig) => {
    // If the signal arrived at the very end of the data, we can't test it yet
    const startIdx = sig.startIndex !== undefined ? sig.startIndex : historicalData.indexOf(sig.candle);
    if (startIdx === -1 || startIdx + 1 >= historicalData.length) return;

    // Track the signal structurally as valid to be tested
    totalValidSignals++;
    let hitTP = false;

    const entryPrice = sig.entry || historicalData[startIdx].close;

    // Scan forward natively into the future from exactly when the signal was called
    for (let i = startIdx + 1; i < historicalData.length; i++) {
      const futureCandle = historicalData[i];
      const high = futureCandle.high || futureCandle.close;
      const low = futureCandle.low || futureCandle.close;
      const close = futureCandle.close;

      if (sig.signal === "BUY") {
        if (sig.sl && low <= sig.sl) { break; }
        if (sig.tp && high >= sig.tp) { hitTP = true; break; }

        // Fallback if no exact Risk metric exists: Check if it swung structurally into profit natively (e.g., > 0.5% move)
        if (!sig.sl && !sig.tp) {
            if (close >= entryPrice * 1.005) { hitTP = true; break; }
            if (close <= entryPrice * 0.995) { break; }
        }

      } else if (sig.signal === "SELL") {
        if (sig.sl && high >= sig.sl) { break; }
        if (sig.tp && low <= sig.tp) { hitTP = true; break; }

        if (!sig.sl && !sig.tp) {
            if (close <= entryPrice * 0.995) { hitTP = true; break; }
            if (close >= entryPrice * 1.005) { break; }
        }
      }
    }

    // A signal is flagged 'correct' if it mathematically reached its profit target or moved into positive structural territory before invalidating
    if (hitTP) {
      correctSignals++;
    }
  });

  // Mathematically derive the successful win percentage rounded natively to two decimal places
  const accuracy = totalValidSignals > 0 
    ? ((correctSignals / totalValidSignals) * 100).toFixed(2) 
    : 0;

  return {
    totalSignals: totalValidSignals,
    correctSignals,
    accuracy: Number(accuracy)
  };
}
