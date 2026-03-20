/**
 * Verifies if a generated trade signal is backed by a mechanical structural confirmation.
 * Identifies strong setups like Engulfing candles, Volume spikes, and Break/Retest patterns.
 * 
 * @param {Array} data - Array of FULL OHLCV market data structurally synced
 * @param {Object} rawSignal - Generated signal { signal: "BUY"|"SELL", entry }
 * @returns {Object} { confirmed: boolean, type: string }
 */
export function confirmEntry(data, rawSignal) {
  if (!rawSignal || rawSignal.signal === "HOLD" || !rawSignal.signal) {
    return { confirmed: false, type: "none" };
  }

  // Need at least 20 periods to establish a reasonable 'recent' structural logic
  if (!data || data.length < 20) {
    return { confirmed: false, type: "none" };
  }

  const closes = data.map(d => d.close || d);
  const opens = data.map(d => d.open || d.close); // Fallback to close to prevent NaN crashes
  const highs = data.map(d => d.high || d.close);
  const lows = data.map(d => d.low || d.close);
  const volumes = data.map(d => d.volume || 0);

  const currentIdx = closes.length - 1;
  const currentClose = closes[currentIdx];
  const currentOpen = opens[currentIdx];
  const currentVol = volumes[currentIdx];
  
  const prevClose = closes[currentIdx - 1];
  const prevOpen = opens[currentIdx - 1];

  // 1. CONFIRMATION: Volume Spike
  // Extremely heavy momentum pushes trades decisively indicating smart money interaction
  const avgVol = volumes.slice(-21, -1).reduce((a, b) => a + b, 0) / 20;
  if (currentVol >= avgVol * 2) {
    return { confirmed: true, type: "volume" };
  }

  // 2. CONFIRMATION: Candle Pattern (Engulfing)
  // Reversal patterns show immediate dominance turning tides opposite to the previous bar
  if (rawSignal.signal === "BUY") {
    if (prevClose < prevOpen && currentClose > currentOpen && currentClose >= prevOpen && currentOpen <= prevClose) {
      return { confirmed: true, type: "pattern" };
    }
  } else if (rawSignal.signal === "SELL") {
    if (prevClose > prevOpen && currentClose < currentOpen && currentClose <= prevOpen && currentOpen >= prevClose) {
      return { confirmed: true, type: "pattern" };
    }
  }

  // 3. CONFIRMATION: Break + Retest
  // Look back at lines drawn slightly historically, proving a boundary was shattered then used as a floor/ceiling
  const resistance = Math.max(...closes.slice(-16, -3));
  const support = Math.min(...closes.slice(-16, -3));

  if (rawSignal.signal === "BUY") {
    const recentHigh = Math.max(...closes.slice(-3, -1));
    const currentLow = lows[currentIdx];
    
    // Previous close broke over the line, currently dipped to test it within 0.2%, staying above
    if (recentHigh > resistance && currentLow <= resistance * 1.002 && currentClose > resistance) {
      return { confirmed: true, type: "retest" };
    }
  } else if (rawSignal.signal === "SELL") {
    const recentLow = Math.min(...closes.slice(-3, -1));
    const currentHigh = highs[currentIdx];

    if (recentLow < support && currentHigh >= support * 0.998 && currentClose < support) {
      return { confirmed: true, type: "retest" };
    }
  }

  return { confirmed: false, type: "none" };
}
