import { getData, saveData } from './storage';

export function saveTrade(tradeData) {
  // Expected tradeData: { entry, exit, result: 'win'|'loss', strategy, pnl, date }
  let trades = getData('analytics_trades') || [];
  
  // Prepend so latest trades are at index 0
  trades.unshift({
    ...tradeData,
    date: tradeData.date || new Date().toISOString()
  });

  saveData('analytics_trades', trades);
}

export function getAnalytics() {
  const trades = getData('analytics_trades') || [];
  
  if (trades.length === 0) {
    return {
      total: 0,
      winRate: 0,
      avgPnL: 0,
      last10: []
    };
  }

  const wins = trades.filter(t => t.result === 'win').length;
  const winRate = ((wins / trades.length) * 100).toFixed(2);
  
  const totalPnL = trades.reduce((acc, t) => acc + (t.pnl || 0), 0);
  const avgPnL = (totalPnL / trades.length).toFixed(2);

  return {
    total: trades.length,
    winRate: Number(winRate),
    avgPnL: Number(avgPnL),
    last10: trades.slice(0, 10)
  };
}
