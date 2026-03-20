/**
 * Backtest Engine for evaluating trading strategies against historical data.
 * Compatible with scalping, intraday, and swing strategies that return:
 * { signal, entry, sl, tp, reason }
 */

export function runBacktest(strategyFn, historicalData) {
  const trades = [];
  let openTrade = null;

  // Most strategies need at least 100 periods of history to calculate MAs safely.
  const lookbackPeriod = 100;
  
  if (!historicalData || historicalData.length <= lookbackPeriod) {
    return { error: "Not enough historical data to backtest (need > 100 bars)." };
  }

  for (let i = lookbackPeriod; i < historicalData.length; i++) {
    const currentCandle = historicalData[i];
    
    // Check if sl/tp hit on the current candle for an active trade
    if (openTrade) {
      const high = currentCandle.high || currentCandle.close;
      const low = currentCandle.low || currentCandle.close;

      if (openTrade.signal === 'BUY') {
        if (low <= openTrade.sl) {
          trades.push({ ...openTrade, exit: openTrade.sl, result: 'loss', pnl: openTrade.sl - openTrade.entry, exitDate: currentCandle.timestamp || i });
          openTrade = null;
          continue;
        } else if (high >= openTrade.tp) {
          trades.push({ ...openTrade, exit: openTrade.tp, result: 'win', pnl: openTrade.tp - openTrade.entry, exitDate: currentCandle.timestamp || i });
          openTrade = null;
          continue;
        }
      } else if (openTrade.signal === 'SELL') {
        if (high >= openTrade.sl) {
          trades.push({ ...openTrade, exit: openTrade.sl, result: 'loss', pnl: openTrade.entry - openTrade.sl, exitDate: currentCandle.timestamp || i });
          openTrade = null;
          continue;
        } else if (low <= openTrade.tp) {
          trades.push({ ...openTrade, exit: openTrade.tp, result: 'win', pnl: openTrade.entry - openTrade.tp, exitDate: currentCandle.timestamp || i });
          openTrade = null;
          continue;
        }
      }
    }

    // Only search for new signals when there is no active open trade
    if (!openTrade) {
      // Simulate historical state by slicing up to the current perspective
      const dataSlice = historicalData.slice(0, i + 1);
      const result = strategyFn(dataSlice);

      if (result && (result.signal === 'BUY' || result.signal === 'SELL') && result.entry && result.sl && result.tp) {
        openTrade = {
          signal: result.signal,
          entry: result.entry,
          sl: result.sl,
          tp: result.tp,
          reason: result.reason,
          entryDate: currentCandle.timestamp || i
        };
      }
    }
  }

  // Finalize any trade still open at the end of the simulation
  if (openTrade) {
     const lastCandle = historicalData[historicalData.length - 1];
     const exitPrice = lastCandle.close;
     const pnl = openTrade.signal === 'BUY' ? (exitPrice - openTrade.entry) : (openTrade.entry - exitPrice);
     const result = pnl > 0 ? 'win' : 'loss';
     
     trades.push({ ...openTrade, exit: exitPrice, result, pnl, exitDate: "Force Close (End of Data)" });
  }

  // Calculate Metrics
  const totalTrades = trades.length;
  const wins = trades.filter(t => t.result === 'win').length;
  const losses = totalTrades - wins;
  
  const winRate = totalTrades > 0 ? ((wins / totalTrades) * 100).toFixed(2) : 0;
  const totalPnL = trades.reduce((sum, t) => sum + t.pnl, 0);

  return {
    totalTrades,
    wins,
    losses,
    winRate: Number(winRate),
    totalPnL: Number(totalPnL.toFixed(2)),
    trades
  };
}
